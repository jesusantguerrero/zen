const functions = require("firebase-functions");
const admin = require('firebase-admin');
const paypal = require('./paypal')
admin.initializeApp();

// utils
const workers = {
    sendMessage: async (options) => {
        const user = await admin.firestore().collection('settings').doc(options.user_uid).get().then((snap) => snap.data());
        return admin.messaging().send({
            data: {
                message: options.message
            },
            token: user.pushSubscription.replace(/\"/g, "")
        })
    }
}

const getUserSettings = async(uid) => {
    return admin.firestore().collection('settings').doc(uid).get().then(ref => ref.data());
}

const getUser = async(uid) => {
    return admin.auth().getUser(uid).then(record => record).catch(() => null)
}
// Subscription
exports.saveSubscription = functions.https.onRequest(async (req, res) => {
    const user = await getUser(req.body.uid);
    if (user) {
        await admin.firestore().collection('settings').doc(user.uid).set({
            susbcription: req.body
        }, { merge: true});
        return res.send('saved')
    } else {
        return response.json({
            "response_type": "ephemeral",
            text: `This email it is not in our app`
        });
    }
})

exports.paypalCancel = functions.https.onRequest(async (req, res) => {
    const user = await getUserSettings(req.body.uid);
    return paypal.cancelSubscription(user.agreementId, req.body);
})

exports.paypalReactivate = functions.https.onRequest(async (req, res) => {
    const user = await getUserSettings(req.body.uid);
    paypal.reactivateSubscription(user.agreementId, req.body);
    return res.send('activated');
})

exports.paypalSuspend = functions.https.onRequest(async (req, res) => {
    const user = await getUserSettings(req.body.uid);
    paypal.suspendSubscription(user.agreementId, req.body);
    return res.send('suspended')
})

exports.paypalUpgrade = functions.https.onRequest(async (req, res) => {
    const user = await getUser(req.body.uid);
    paypal.upgrateSubscription(agreementId, req.body);
    res.send('upgraded')
})

// Matrix sharing
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

// Social integrations
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


// Schedulers
const execReminders = async() => {
    const now = admin.firestore.Timestamp.now();
    const result = await admin.firestore().collection('reminders')
    .where("due_time", '<=', now).get()
    
    const jobs = [];
    result.forEach((snap) => {
        const { worker, options, user_uid } = snap.data()
        options.user_uid = user_uid;
        const job = workers[worker](options)
            .then(() => snap.ref && snap.ref.update({ status: 'complete' }))
            .catch(() => {
                snap.ref.update({ status: 'error'});
            })
        jobs.push(job)
    })

    return await Promise.all(jobs)
}

exports.taskReminder = functions.runWith({ memory: "2GB" }).pubsub.schedule("* * * * *").onRun(async () => {
    return execReminders();
})

exports.testReminders = functions.runWith({ memory: "2GB" }).https.onRequest(async (req, res) => {
    execReminders().then(() => {
        return res.send("Done");
    })
    .catch((err) => {
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify({
            error: {
            id: 'unable-to-send-messages',
            message: `We were unable to send messages to all subscriptions : '${err.message}`
            }
        }));
    })
})
        

// Messages
exports.sendpush = functions.https.onRequest(async (req, res) => {
    if (req.method == 'post') {
        const user = await admin.firestore().collection('settings').doc(req.query.user).get().then((snap) => snap.data());
        if (user.pushSubscription) {
            workers.sendMessage({ message: req.body.message , pushSubscription: user.pushSubscription })
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

