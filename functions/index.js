const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// exports.sendpush = functions.https.onRequest(async (req, res) => {
//     if (req.method == 'post') {
//         const user = await admin.firestore().collection('settings').doc(req.query.user).get().then((snap) => snap.data());
//         if (user.pushSubscription) {
//             admin.messaging().send({
//                 data: {
//                     score: "850",
//                     time: "2:45"
//                 },
//                 token: user.pushSubscription.replace(/\"/g, "")
            
//             })
//             .then(() => {
//                 res.setHeader('Content-Type', 'application/json');
//                   res.send(JSON.stringify({ data: { success: true } }));
//               })
//               .catch(function(err) {
//                 res.status(500);
//                 res.setHeader('Content-Type', 'application/json');
//                 res.send(JSON.stringify({
//                   error: {
//                     id: 'unable-to-send-messages',
//                     message: `We were unable to send messages to all subscriptions : '${err.message}`
//                   }
//                 }));
//               });
//         } else {
//             res.status(404).send('bad')
//         }
//     }
// })

// async function getReminders(reminders = []) {
//     const result = await admin.firestore().collection('reminders').get()
//     result.forEach((snap) => {
//         if (snap) {
//             reminders.push({ ...snap.data() }, {now: new firebase.default.database.ServerValue.TIMESTAMP(Date.now())});
//         }
//     })

//     return reminders;
// }

// exports.taskReminder = functions.https.onRequest(async (request, response) => {
//     const reminders = await getReminders();
//     response.json(reminders)
//     // const promisePool = new PromisePool(() => sendReminders(reminders), MAX_CONCURRENT)
//     // await promisePool.start();
//     // console.log('reminders sent');
// })

exports.slack = functions.https.onRequest(async (request, response) => {
    const [scope, arg] = request.body.text.split(' ')
    if (!scope == 'login') {
        return response.json({
            response_type: "ephemeral",
            message: "This command doesnt exist",
        })
    }
    
    const user = await admin.auth().getUserByEmail(arg).then(record => record).catch(() => null);
    if (user) {
        await admin.firestore().collection('settings').doc(user.uid).set({
            slack: request.body
        }, { merge: true});
       
        return response.json({
            "response_type": "in_channel",
            message: "Logged in",
        })
    } else {
        return response.json({
            "response_type": "ephemeral",
            text: `This email it is not in our app`
        });
    }
})

exports.shareMatrix = functions.https.onCall(async (data, context) => {
    const user = context.auth;
    if (user) {
        const shareReceiver = await admin.auth().getUserByEmail(data.email).then(record => record).catch(() => null);
        const userData = await admin.auth().getUser(user.uid).then(record => record).catch(() => null);
        if (shareReceiver) {
            await admin.firestore().collection('shared').doc(shareReceiver.uid).collection('accounts').doc(user.uid).set({
                matrix: data.matrixes,
                name: userData.displayName,
                email: userData.email
            }, { merge: true});
    
            await admin.firestore().collection('sharing').doc(user.uid).collection('accounts').doc(shareReceiver.uid).set({
                matrix: data.matrixes,
                receiver_name: shareReceiver.displayName,
                receiver_email: data.email
            }, { merge: true});

            return "completed";

        }
        return data
    }

    return "";
})

