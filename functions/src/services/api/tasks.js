'use strict';
const admin = require('firebase-admin');
const express = require('express');

const router = express.Router();

const MATRIX_VALUES = ['todo', 'schedule', 'delegate', 'delete', 'backlog'];
const STAGE_VALUES = ['exploring', 'in-dev', 'in-review', 'in-prod', 'done'];

// GET /tasks — list user's tasks (optional ?done=true|false, ?matrix=todo)
router.get('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    let query = admin.firestore().collection('tasks').where('user_uid', '==', uid);

    if (req.query.done === 'true') query = query.where('done', '==', true);
    if (req.query.done === 'false') query = query.where('done', '==', false);
    if (req.query.matrix && MATRIX_VALUES.includes(req.query.matrix)) {
      query = query.where('matrix', '==', req.query.matrix);
    }

    const snap = await query.get();
    const tasks = [];
    snap.forEach((doc) => tasks.push({ uid: doc.id, ...doc.data() }));
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks — create
router.post('/', async (req, res) => {
  try {
    const uid = req.user.uid;
    const body = req.body || {};
    if (!body.title) {
      res.status(400).json({ error: 'title is required' });
      return;
    }

    const doc = {
      user_uid: uid,
      title: body.title,
      description: body.description || '',
      matrix: MATRIX_VALUES.includes(body.matrix) ? body.matrix : 'backlog',
      tags: Array.isArray(body.tags) ? body.tags : [],
      contacts: Array.isArray(body.contacts) ? body.contacts : [],
      checklist: Array.isArray(body.checklist) ? body.checklist : [],
      tracks: [],
      order: typeof body.order === 'number' ? body.order : 0,
      duration_ms: 0,
      done: false,
      commit_date: null,
      created_at: admin.firestore.Timestamp.now(),
    };
    if (body.due_date) {
      doc.due_date = admin.firestore.Timestamp.fromDate(new Date(body.due_date));
    }
    if (STAGE_VALUES.includes(body.stage)) doc.stage = body.stage;

    const ref = await admin.firestore().collection('tasks').add(doc);
    res.status(201).json({ uid: ref.id, ...doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id/move — change matrix quadrant
router.patch('/:id/move', async (req, res) => {
  try {
    const uid = req.user.uid;
    const matrix = req.body && req.body.matrix;
    if (!MATRIX_VALUES.includes(matrix)) {
      res.status(400).json({ error: `matrix must be one of ${MATRIX_VALUES.join(', ')}` });
      return;
    }

    const ref = admin.firestore().collection('tasks').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'task not found' });
    if (snap.data().user_uid !== uid) return res.status(403).json({ error: 'forbidden' });

    await ref.update({ matrix });
    res.json({ uid: req.params.id, matrix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id/complete — mark done with today's commit date
router.patch('/:id/complete', async (req, res) => {
  try {
    const uid = req.user.uid;
    const ref = admin.firestore().collection('tasks').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'task not found' });
    if (snap.data().user_uid !== uid) return res.status(403).json({ error: 'forbidden' });

    const today = new Date().toISOString().slice(0, 10);
    await ref.update({ done: true, commit_date: today });
    res.json({ uid: req.params.id, done: true, commit_date: today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id/stage — set workflow stage
router.patch('/:id/stage', async (req, res) => {
  try {
    const uid = req.user.uid;
    const stage = req.body && req.body.stage;
    if (stage !== null && !STAGE_VALUES.includes(stage)) {
      res.status(400).json({ error: `stage must be null or one of ${STAGE_VALUES.join(', ')}` });
      return;
    }

    const ref = admin.firestore().collection('tasks').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'task not found' });
    if (snap.data().user_uid !== uid) return res.status(403).json({ error: 'forbidden' });

    await ref.update({ stage });
    res.json({ uid: req.params.id, stage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.default = router;
