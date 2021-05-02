const functions = require("firebase-functions");
const admin = require('firebase-admin');
const tasks = require('./api/tasks');
const { firestore } = require("firebase-admin");
const { Duration  } = require('luxon')
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

// const getUserSettings = async(uid) => {
//     return admin.firestore().collection('settings').doc(uid).get().then(ref => ref.data());
// }

// const getUser = async(uid) => {
//     return admin.auth().getUser(uid).then(record => record).catch(() => null)
// }
// tasks and tracks calc
const timeReducer = (tracks) => {
    if (!tracks) return 0
    return tracks.reduce((milliseconds, track)=> {
        const duration = track.duration_ms ? Number(track.duration_ms) : 0
        return milliseconds + duration;
    }, 0)
}


exports.calcTaskTime = functions.firestore.document('tracks/{trackId}').onUpdate((async (change) => {
    const taskUid = change.after.data().task_uid;
    const tracksData = await firestore().collection('tracks').where('task_uid', '==', taskUid).where('uid', '!=', change.after.data().uid).get()
    const tracks = [];
    tracksData.forEach(doc => {
        tracks.push({...doc.data(), uid: doc.id})
    })
    const savedTime = timeReducer(tracks) + change.after.data().duration_ms;
    const timeTracked = Duration.fromMillis(savedTime).toFormat("hh:mm:ss");

    firestore().collection('tasks').doc(taskUid).set({
        duration_ms: timeTracked,
        duration: savedTime
    }, { merge: true })
}))

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

exports.oauthaccess = functions.https.onRequest(async (request, response) => {
    try {
        const results = await admin.firestore().collection('connections').where('code', '==', request.body.code).limit(1).get()
        let codeData = {}

        results.forEach(snap => {
            codeData = { uid: snap.id, ...snap.data()}
        })

        if (request.body.client_secret && codeData.uid, codeData.code) {
            // Verify client secret or redirect_uri or both but electron wouldn't work
            const token = await admin.auth().createCustomToken(codeData.user_uid);
            await admin.firestore().collection('connections').doc(codeData.uid).set({
                code: false,
                refreshToken: token
            }, { merge: true });
            return response.json({access_token: token})
        }
        return response.json({
            "response_type": "ephemeral",
            text: `This email it is not in our app`
        });
    } catch (e) {
        return response.json({
            "response_type": "ephemeral",
            text: `This email it is not in our app ${e}`
        });
    }
})

exports.api = tasks.api;

// Schedulers
const execReminders = async() => {
    const now = admin.firestore.Timestamp.now();
    const result = await admin.firestore().collection('reminders')
    .where("due_time", '<=', now).where("status", "==", "scheduled").get()
    
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

