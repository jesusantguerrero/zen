
 'use strict';
 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const express = require('express');
 const app = express();
 const authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  
  try {
    const decodedIdToken = await exchangeToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send(`Unauthorized ${idToken}`);
    return;
  }
};

const exchangeToken = async (token) => {
  return await admin.firestore().collection('connections').where('refreshToken', '==', token).limit(1).get().then(async(result) => {
      let connection;
      result.forEach((snap) => {
          connection = snap.data()
      })
      
      return await admin.auth().getUser(connection.user_uid)
  })
}
 
app.use(authenticate);
 
app.get('/auth/status', async (req, res) => {
    return res.json({ email: req.user.email });
})

app.get('/tasks', async(req, res) => {

})

app.put('/tasks', async(req, res) => {

})

app.delete('/tasks', async(req, res) => {

})

app.post('/tasks', async (req, res) => {
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
     console.log('Error detecting sentiment or saving the task', error.message);
     res.sendStatus(500);
   }
});
 
exports.api = functions.https.onRequest(app);