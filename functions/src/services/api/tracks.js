'use strict';
const admin = require('firebase-admin');
const express = require('express');

const router = express.Router();

// POST /tracks/start-timer  { task_uid, description? }
router.post('/start-timer', async (req, res) => {
  try {
    const uid = req.user.uid;
    const { task_uid, description } = req.body || {};
    if (!task_uid) {
      res.status(400).json({ error: 'task_uid is required' });
      return;
    }

    const db = admin.firestore();
    const taskRef = db.collection('tasks').doc(task_uid);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) return res.status(404).json({ error: 'task not found' });
    const task = taskSnap.data();
    if (task.user_uid !== uid) return res.status(403).json({ error: 'forbidden' });

    // Stop any currently running track for this user.
    const now = admin.firestore.Timestamp.now();
    const running = await db
      .collection('tracks')
      .where('user_uid', '==', uid)
      .where('ended_at', '==', null)
      .get();

    const batch = db.batch();
    running.forEach((doc) => {
      const started = doc.data().started_at;
      const duration_ms =
        started && typeof started.toMillis === 'function'
          ? now.toMillis() - started.toMillis()
          : 0;
      batch.update(doc.ref, { ended_at: now, duration_ms });
    });
    if (!running.empty) await batch.commit();

    // Create the new track.
    const trackDoc = {
      user_uid: uid,
      task_uid,
      description: description || task.title,
      started_at: now,
      ended_at: null,
      duration_ms: 0,
      created_at: now,
    };
    const ref = await db.collection('tracks').add(trackDoc);

    res.status(201).json({
      uid: ref.id,
      task_uid,
      started_at: now.toDate().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tracks/stop  — stop the currently running track (if any)
router.post('/stop', async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    const running = await db
      .collection('tracks')
      .where('user_uid', '==', uid)
      .where('ended_at', '==', null)
      .get();

    if (running.empty) {
      res.json({ stopped: 0 });
      return;
    }

    const batch = db.batch();
    const stopped = [];
    running.forEach((doc) => {
      const started = doc.data().started_at;
      const duration_ms =
        started && typeof started.toMillis === 'function'
          ? now.toMillis() - started.toMillis()
          : 0;
      batch.update(doc.ref, { ended_at: now, duration_ms });
      stopped.push({ uid: doc.id, duration_ms });
    });
    await batch.commit();

    res.json({ stopped: stopped.length, tracks: stopped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.default = router;
