
 'use strict';
 const admin = require('firebase-admin');
 const exchangeToken = async (token) => {
  return await admin.firestore().collection('connections').where('refreshToken', '==', token).limit(1).get().then(async(result) => {
      let connection;
      result.forEach((snap) => {
          connection = snap.data()
      })
      
      if (!connection) return null;
      const user = await admin.auth().getUser(connection.user_uid).catch(() => null)
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