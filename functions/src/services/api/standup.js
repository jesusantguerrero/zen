'use strict';
const admin = require('firebase-admin');
const express = require('express');

const router = express.Router();

const ymd = (d) => d.toISOString().slice(0, 10);
const yesterdayYMD = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return ymd(d);
};

// GET /standup?date=yyyy-MM-dd  (default: yesterday)
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const date = req.query.date || yesterdayYMD();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'date must be yyyy-MM-dd' });
      return;
    }

    const snap = await admin
      .firestore()
      .collection('tasks')
      .where('user_uid', '==', uid)
      .where('done', '==', true)
      .where('commit_date', '==', date)
      .get();

    const completed = [];
    snap.forEach((doc) => {
      const data = doc.data();
      completed.push({
        uid: doc.id,
        title: data.title,
        matrix: data.matrix,
        tags: data.tags || [],
        stage: data.stage || null,
      });
    });

    res.json({
      date,
      completed_count: completed.length,
      completed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.default = router;
