
 'use strict';
 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const express = require('express');
 const router = express.Router;

router.get('/tasks', async(req, res) => {

})

router.post('/tasks', async (req, res) => {
   const task = req.body;
 
   try {
     const uid = req.user.uid;
     await admin.firestore().collection('tasks').add({
         ...Object.assign({
            user_uid: uid,
            title: "",
            description: "",
            due_date: "",
            duration: "",
            tags: [],
            contacts: [],
            checklist: [],
            tracks: [],
            order: 0,
            duration_ms: 0,
            done: false,
            commit_date: null,
            matrix:"backlog",
            created_at: admin.firestore.Timestamp.now()
            },
            task
        )
    });
 
     res.status(201).json(task);
   } catch(error) {
     res.sendStatus(500);
   }
});
 
exports.default = router;