
 'use strict';
 const admin = require('firebase-admin');
 const exchangeToken = async (token) => {
  return await admin.firestore().collection('connections').where('refreshToken', '==', token).limit(1).get().then(async(result) => {
      let connection;
      let connectionDocId;
      result.forEach((snap) => {
          connection = snap.data()
          connectionDocId = snap.id
      })

      if (!connection) return null;
      const user = await admin.auth().getUser(connection.user_uid).catch(() => null)
      if (user && connectionDocId) {
          // Fire-and-forget: bump last_used_at for token telemetry.
          admin.firestore().collection('connections').doc(connectionDocId).update({
              last_used_at: admin.firestore.FieldValue.serverTimestamp(),
          }).catch(() => { /* telemetry best-effort */ })
      }
      return user;
  })
}

const authenticate = async (req, res, next) => {  
   try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(403).send('Unauthorized');
      return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedIdToken = await exchangeToken(idToken).catch(() => null);
    if (!decodedIdToken) {
      res.status(403).send('Unauthorized');
      return;
    }
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized');
    return;
  }
};
 
exports.default = authenticate;