'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { format, subDays, startOfDay } = require('date-fns');

const sendgridProvider = require('../libraries/Mail/providers/sendgrid');

const APP_URL = 'https://zen.vercel.app';

const formatDuration = (ms) => {
  if (!ms) return '0h';
  const hours = ms / 1000 / 60 / 60;
  if (hours < 1) return `${Math.round(ms / 1000 / 60)}m`;
  return `${hours.toFixed(1)}h`;
};

const buildDigestForUser = async (userUid, userDoc) => {
  const db = admin.firestore();
  const yesterdayStart = startOfDay(subDays(new Date(), 1));
  const todayStart = startOfDay(new Date());

  const yesterdayYMD = format(yesterdayStart, 'yyyy-MM-dd');

  const [completedSnap, tracksSnap, overdueSnap] = await Promise.all([
    db.collection('tasks')
      .where('user_uid', '==', userUid)
      .where('done', '==', true)
      .where('commit_date', '==', yesterdayYMD)
      .get(),
    db.collection('tracks')
      .where('user_uid', '==', userUid)
      .where('started_at', '>=', admin.firestore.Timestamp.fromDate(yesterdayStart))
      .where('started_at', '<', admin.firestore.Timestamp.fromDate(todayStart))
      .get(),
    db.collection('tasks')
      .where('user_uid', '==', userUid)
      .where('done', '==', false)
      .get(),
  ]);

  const completedTasks = [];
  completedSnap.forEach((doc) => completedTasks.push(doc.data()));

  let totalMs = 0;
  tracksSnap.forEach((doc) => { totalMs += doc.data().duration_ms || 0; });

  const todayStr = format(todayStart, 'yyyy-MM-dd');
  const overdueTasks = [];
  overdueSnap.forEach((doc) => {
    const t = doc.data();
    if (t.due_date && t.due_date.toDate && format(t.due_date.toDate(), 'yyyy-MM-dd') < todayStr) {
      overdueTasks.push(t);
    }
  });

  // Skip users who have nothing worth reporting
  if (!completedTasks.length && !tracksSnap.size && !overdueTasks.length) {
    return null;
  }

  const lines = [];
  lines.push(`Morning${userDoc.name ? `, ${userDoc.name}` : ''}.`);
  lines.push('');
  lines.push(`Yesterday you shipped ${completedTasks.length} task${completedTasks.length === 1 ? '' : 's'} and tracked ${formatDuration(totalMs)} of focused work.`);
  lines.push('');

  if (completedTasks.length) {
    lines.push('✅ Completed yesterday:');
    completedTasks.slice(0, 10).forEach((t) => lines.push(`  • ${t.title}`));
    if (completedTasks.length > 10) lines.push(`  … and ${completedTasks.length - 10} more`);
    lines.push('');
  }

  if (overdueTasks.length) {
    lines.push(`⚠️  ${overdueTasks.length} task${overdueTasks.length === 1 ? '' : 's'} overdue:`);
    overdueTasks.slice(0, 5).forEach((t) => lines.push(`  • ${t.title}`));
    if (overdueTasks.length > 5) lines.push(`  … and ${overdueTasks.length - 5} more`);
    lines.push('');
  }

  lines.push(`Jump in: ${APP_URL}/zenboard`);
  lines.push('');
  lines.push('— Zen');
  lines.push(`(You can turn off this digest in ${APP_URL}/settings?section=notifications)`);

  return {
    subject: `Zen · Yesterday: ${completedTasks.length} done, ${formatDuration(totalMs)} tracked`,
    text: lines.join('\n'),
  };
};

/**
 * Scheduled daily digest. Runs at 08:00 UTC every day. Users opt in by
 * setting `settings.daily_digest_opt_in = true`.
 */
exports.dailyEmailDigest = functions
  .runWith({ memory: '512MB' })
  .pubsub.schedule('0 8 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore();
    const settingsSnap = await db
      .collection('settings')
      .where('daily_digest_opt_in', '==', true)
      .get();

    if (settingsSnap.empty) {
      console.log('Daily digest: no opted-in users');
      return null;
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const doc of settingsSnap.docs) {
      const userSettings = doc.data();
      const userUid = userSettings.user_uid || doc.id;
      try {
        const user = await admin.auth().getUser(userUid).catch(() => null);
        if (!user || !user.email) {
          skipped += 1;
          continue;
        }
        const digest = await buildDigestForUser(userUid, {
          name: user.displayName || '',
        });
        if (!digest) {
          skipped += 1;
          continue;
        }
        await sendgridProvider.send({
          to: user.email,
          from: 'zen@neatlancer.com',
          subject: digest.subject,
          text: digest.text,
        });
        sent += 1;
      } catch (err) {
        console.error(`Digest failed for ${userUid}:`, err && err.message);
        failed += 1;
      }
    }

    console.log(`Daily digest: sent=${sent} skipped=${skipped} failed=${failed}`);
    return { sent, skipped, failed };
  });
