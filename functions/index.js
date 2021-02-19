const functions = require("firebase-functions");
const firebase = require('firebase')
const admin = require('firebase-admin');
const PromisePool = require('es6-promise-pool');
const MAX_CONCURRENT = 3;
admin.initializeApp();

exports.sendpush = functions.https.onRequest(async (req, res) => {
    if (req.method == 'post') {
        const user = await admin.firestore().collection('settings').doc(req.query.user).get().then((snap) => snap.data());
        if (user.pushSubscription) {
            admin.messaging().send({
                data: {
                    score: "850",
                    time: "2:45"
                },
                token: user.pushSubscription.replace(/\"/g, "")
            
            })
            .then(() => {
                res.setHeader('Content-Type', 'application/json');
                  res.send(JSON.stringify({ data: { success: true } }));
              })
              .catch(function(err) {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                  error: {
                    id: 'unable-to-send-messages',
                    message: `We were unable to send messages to all subscriptions : '${err.message}`
                  }
                }));
              });
        } else {
            res.status(404).send('bad')
        }
    }
})

exports.taskReminder = functions.https.onRequest(async (request, response) => {
    const reminders = await getReminders();
    response.json(reminders)
    // const promisePool = new PromisePool(() => sendReminders(reminders), MAX_CONCURRENT)
    // await promisePool.start();
    // console.log('reminders sent');
})

async function getReminders(reminders = []) {
    const result = await admin.firestore().collection('reminders').get()
    result.forEach((snap) => {
        if (snap) {
            reminders.push({ ...snap.data() }, {now: new firebase.default.database.ServerValue.TIMESTAMP(Date.now())});
        }
    })

    return reminders;
}


exports.slack = functions.https.onRequest(async (request, response) => {
    response.json({
        data: {
            status: 201,
            message: "Logged in",
            body: request.body
        }
    })
})

