'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

const MAX_LABEL_LENGTH = 60;
const MAX_TOKENS_PER_USER = 10;

/**
 * Callable: creates a new API token for the authenticated user.
 * Returns the token value ONCE — callers must save it immediately.
 */
exports.createApiToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    }
    const uid = context.auth.uid;
    const rawLabel = typeof data === 'object' && data !== null ? data.label : '';
    const label = (rawLabel || 'mcp').toString().slice(0, MAX_LABEL_LENGTH).trim() || 'mcp';

    const db = admin.firestore();

    // Cap tokens per user to avoid accidental proliferation.
    const existing = await db
        .collection('connections')
        .where('user_uid', '==', uid)
        .where('service', 'in', ['mcp', 'api'])
        .get();
    if (existing.size >= MAX_TOKENS_PER_USER) {
        throw new functions.https.HttpsError(
            'resource-exhausted',
            `Token limit reached (${MAX_TOKENS_PER_USER}). Revoke one before creating another.`
        );
    }

    const token = crypto.randomBytes(32).toString('hex');

    const docRef = await db.collection('connections').add({
        user_uid: uid,
        service: 'mcp',
        label,
        refreshToken: token,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        last_used_at: null,
    });

    return {
        uid: docRef.id,
        token,
        label,
    };
});

/**
 * Callable: returns the caller's API tokens — metadata only, never the token value.
 */
exports.listApiTokens = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    }
    const uid = context.auth.uid;

    const snap = await admin
        .firestore()
        .collection('connections')
        .where('user_uid', '==', uid)
        .where('service', 'in', ['mcp', 'api'])
        .get();

    const tokens = [];
    snap.forEach((doc) => {
        const d = doc.data();
        tokens.push({
            uid: doc.id,
            label: d.label || d.service || 'token',
            service: d.service,
            created_at: d.created_at ? d.created_at.toMillis() : null,
            last_used_at: d.last_used_at ? d.last_used_at.toMillis() : null,
        });
    });

    tokens.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    return { tokens };
});

/**
 * Callable: deletes an API token doc. Requires ownership.
 */
exports.revokeApiToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    }
    const tokenUid = data && data.uid;
    if (!tokenUid || typeof tokenUid !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'uid is required.');
    }

    const ref = admin.firestore().collection('connections').doc(tokenUid);
    const snap = await ref.get();
    if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'Token not found.');
    }
    if (snap.data().user_uid !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not your token.');
    }

    await ref.delete();
    return { uid: tokenUid, revoked: true };
});
