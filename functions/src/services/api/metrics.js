'use strict';
const admin = require('firebase-admin');
const express = require('express');

const router = express.Router();

// GET /metrics?from=yyyy-MM-dd&to=yyyy-MM-dd
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { from, to } = req.query;

    if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      res.status(400).json({ error: 'from and to are required in yyyy-MM-dd format' });
      return;
    }

    const startTs = admin.firestore.Timestamp.fromDate(new Date(`${from}T00:00:00`));
    const endTs = admin.firestore.Timestamp.fromDate(new Date(`${to}T23:59:59`));
    const db = admin.firestore();

    const [tracksSnap, completedSnap] = await Promise.all([
      db
        .collection('tracks')
        .where('user_uid', '==', uid)
        .where('started_at', '>=', startTs)
        .where('started_at', '<=', endTs)
        .get(),
      db
        .collection('tasks')
        .where('user_uid', '==', uid)
        .where('done', '==', true)
        .where('commit_date', '>=', from)
        .where('commit_date', '<=', to)
        .get(),
    ]);

    let started = 0;
    let finished = 0;
    let totalMs = 0;
    tracksSnap.forEach((doc) => {
      const t = doc.data();
      started += 1;
      if (t.completed) finished += 1;
      totalMs += t.duration_ms || 0;
    });

    const completionRate = started > 0 ? Math.round((finished / started) * 100) : 0;

    res.json({
      from,
      to,
      tasks_completed: completedSnap.size,
      pomodoros_started: started,
      pomodoros_finished: finished,
      completion_rate: completionRate,
      total_focus_ms: totalMs,
      total_focus_hours: Number((totalMs / 1000 / 60 / 60).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.default = router;
