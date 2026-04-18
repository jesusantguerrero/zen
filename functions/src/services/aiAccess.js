'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');

// Allowlist of models the admin UI exposes. Reject anything else to prevent
// accidental routing to unconfigured / overpriced models.
const MODEL_ALLOWLIST = [
  null,
  'claude-sonnet-4-5',
  'claude-opus-4',
  'claude-haiku-4-5',
  'gpt-4o',
  'gpt-4o-mini',
];

const DEFAULT_LIMIT = 3;
const DEFAULT_PERIOD = 'monthly';

const addPeriod = (date, period) => {
  const d = new Date(date);
  if (period === 'daily') d.setDate(d.getDate() + 1);
  else if (period === 'monthly') d.setMonth(d.getMonth() + 1);
  // 'total' → no reset
  return d;
};

const nextResetFor = (period, from = new Date()) =>
  period === 'total' ? null : Timestamp.fromDate(addPeriod(from, period));

/** Shared admin guard. Throws HttpsError if the caller isn't an admin. */
const requireAdmin = (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }
  if (context.auth.token && context.auth.token.admin === true) return;
  // Env fallback — comma-separated list of admin emails
  const envEmails = (functions.config().env && functions.config().env.admin_emails) || '';
  const allowed = envEmails.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const email = (context.auth.token && context.auth.token.email || '').toLowerCase();
  if (!email || !allowed.includes(email)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
  }
};

// ---------------------------------------------------------------------------
// Admin: list users with AI access joined
// ---------------------------------------------------------------------------
exports.adminListUsers = functions.https.onCall(async (_data, context) => {
  requireAdmin(context);

  const result = await admin.auth().listUsers(1000);
  const db = admin.firestore();
  const accessSnap = await db.collection('user_ai_access').get();
  const accessMap = {};
  accessSnap.forEach((doc) => (accessMap[doc.id] = doc.data()));

  const users = result.users.map((u) => {
    const access = accessMap[u.uid] || {};
    return {
      uid: u.uid,
      email: u.email || '',
      name: u.displayName || (u.email ? u.email.split('@')[0] : u.uid),
      enabled: Boolean(access.enabled),
      limit_count: access.limit_count != null ? access.limit_count : DEFAULT_LIMIT,
      period: access.period || DEFAULT_PERIOD,
      model: access.model || null,
      used: access.used || 0,
      reset_at: access.reset_at ? access.reset_at.toMillis() : null,
    };
  });

  return { users };
});

// ---------------------------------------------------------------------------
// Admin: update a user's access record
// ---------------------------------------------------------------------------
exports.adminUpdateUserAccess = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const { uid } = data || {};
  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'uid is required.');
  }

  const patch = {};
  if (typeof data.enabled === 'boolean') patch.enabled = data.enabled;
  if (typeof data.limit_count === 'number' && data.limit_count >= 0) {
    patch.limit_count = Math.floor(data.limit_count);
  }
  if (['daily', 'monthly', 'total'].includes(data.period)) patch.period = data.period;
  if (data.model === null || MODEL_ALLOWLIST.includes(data.model)) {
    patch.model = data.model || null;
  } else if ('model' in data) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `model must be one of: ${MODEL_ALLOWLIST.filter(Boolean).join(', ')} (or null)`
    );
  }

  patch.updated_at = FieldValue.serverTimestamp();

  // Compute reset_at if enabling or changing period and there's no existing reset_at
  const ref = admin.firestore().collection('user_ai_access').doc(uid);
  const snap = await ref.get();
  const existing = snap.exists ? snap.data() : null;

  if (!existing) {
    // First time — seed defaults
    patch.used = patch.used || 0;
    patch.reset_at = nextResetFor(patch.period || DEFAULT_PERIOD);
  } else if (patch.period && patch.period !== existing.period) {
    patch.reset_at = nextResetFor(patch.period);
  }

  await ref.set(patch, { merge: true });
  return { uid, ...patch, reset_at: patch.reset_at ? patch.reset_at.toMillis() : (existing?.reset_at?.toMillis?.() || null) };
});

// ---------------------------------------------------------------------------
// Admin: aggregate usage summary for the header chip
// ---------------------------------------------------------------------------
exports.adminUsageSummary = functions.https.onCall(async (_data, context) => {
  requireAdmin(context);

  const snap = await admin.firestore().collection('user_ai_access').get();
  let totalUsed = 0;
  let totalBudget = 0;
  let usersActive = 0;
  let nextResetMs = null;
  snap.forEach((doc) => {
    const d = doc.data();
    if (!d.enabled) return;
    usersActive += 1;
    totalUsed += d.used || 0;
    totalBudget += d.limit_count || 0;
    if (d.reset_at) {
      const t = d.reset_at.toMillis();
      if (nextResetMs === null || t < nextResetMs) nextResetMs = t;
    }
  });

  return {
    total_used: totalUsed,
    total_budget: totalBudget,
    users_active: usersActive,
    next_reset_at: nextResetMs,
  };
});

// ---------------------------------------------------------------------------
// Admin: force-reset one user's counter
// ---------------------------------------------------------------------------
exports.adminResetUser = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const { uid } = data || {};
  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'uid is required.');
  }
  const ref = admin.firestore().collection('user_ai_access').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'User has no AI access record.');
  }
  const period = snap.data().period || DEFAULT_PERIOD;
  await ref.update({
    used: 0,
    reset_at: nextResetFor(period),
    updated_at: FieldValue.serverTimestamp(),
  });
  return { uid, used: 0 };
});

// ---------------------------------------------------------------------------
// Shared guard used by every AI Cloud Function *before* it calls an LLM.
// Throws HttpsError on denied/exhausted; increments `used` and logs on success.
//
// Usage:
//   const { checkAiQuota, logAiRequest } = require('./aiAccess')
//   await checkAiQuota(context.auth.uid)
//   const res = await callClaude(...)
//   await logAiRequest({ user_uid, model, tokens_in, tokens_out, cost_usd, endpoint })
// ---------------------------------------------------------------------------
const checkAiQuota = async (userUid) => {
  if (!userUid) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }
  const ref = admin.firestore().collection('user_ai_access').doc(userUid);
  const snap = await ref.get();
  if (!snap.exists || !snap.data().enabled) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'ai_disabled',
      { reason: 'AI features are not enabled for this account.' }
    );
  }
  const access = snap.data();
  if ((access.used || 0) >= (access.limit_count || 0)) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'ai_quota_exceeded',
      { reset_at: access.reset_at ? access.reset_at.toMillis() : null }
    );
  }
  // Increment upfront — a failed LLM call still counts to prevent abuse retries
  await ref.update({ used: FieldValue.increment(1), updated_at: FieldValue.serverTimestamp() });
  return {
    model: access.model || null,
    used: (access.used || 0) + 1,
    limit: access.limit_count,
  };
};

const logAiRequest = async ({ user_uid, model, tokens_in, tokens_out, cost_usd, endpoint }) => {
  await admin.firestore().collection('ai_request_log').add({
    user_uid,
    model: model || null,
    tokens_in: tokens_in || 0,
    tokens_out: tokens_out || 0,
    cost_usd: cost_usd || 0,
    endpoint: endpoint || null,
    created_at: FieldValue.serverTimestamp(),
  });
};

// ---------------------------------------------------------------------------
// Scheduled reset — hourly sweep for due resets
// ---------------------------------------------------------------------------
exports.aiResetScheduled = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const db = admin.firestore();
    const now = Timestamp.now();

    const snap = await db
      .collection('user_ai_access')
      .where('reset_at', '<=', now)
      .get();

    if (snap.empty) return { reset: 0 };

    const writer = db.bulkWriter();
    let count = 0;
    snap.forEach((doc) => {
      const data = doc.data();
      const period = data.period || DEFAULT_PERIOD;
      writer.update(doc.ref, {
        used: 0,
        reset_at: nextResetFor(period),
        updated_at: FieldValue.serverTimestamp(),
      });
      count += 1;
    });
    await writer.close();
    console.log(`aiResetScheduled: reset ${count} users`);
    return { reset: count };
  });

// Shared exports for other functions to import
exports.requireAdmin = requireAdmin;
exports.checkAiQuota = checkAiQuota;
exports.logAiRequest = logAiRequest;
exports.MODEL_ALLOWLIST = MODEL_ALLOWLIST;
