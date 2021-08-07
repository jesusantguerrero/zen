const functions = require("firebase-functions");
const admin = require('firebase-admin');
const tasks = require('./services/api/tasks');
const serviceMatrix = require('./services/matrix');
const serviceSubscription = require('./services/subscription');
const { firestore } = require("firebase-admin");
const { format } = require("date-fns");
admin.initializeApp();
const { default: axios } = require("axios");
const { getUserSettings, setUserSettings, workers, getTaskDuration } = require('./utils');
const {  createRemindersForTask, createRecurrenceForTask } = require('./utils/tasks');
const { runDailyNotifications, execReminders } = require("./utils/notifications");

// Task related functions
exports.setReminder = functions.runWith({ memory: "2GB" }).firestore.document('tasks/{taskId}').onWrite((async (change) => {
    if (change.after.isEqual(change.before)) return;
    if (change.before.data().user_uid == "zEc2lvJCgbdjxb5pt2Icruo4AN82") {
        await createRemindersForTask(change.before.data(), change.after.data(), change.after.id);
        return
    }
    return
}));

exports.setRecurrence = functions.https.onCall(async (data, context) => {
    if (data.user_uid == "zEc2lvJCgbdjxb5pt2Icruo4AN82") {
        const taskRef = firestore().collection('tasks').doc(data.uid)
        return await createRecurrenceForTask(taskRef) 
    }
})

exports.calcTaskTime = functions.firestore.document('tracks/{trackId}').onUpdate((async (change) => {
    try {
        const taskUid = change.after.data().task_uid;
        const tracksData = await firestore().collection('tracks')
        .where('task_uid', '==', taskUid)
        .where('uid', '!=', change.after.data().uid)
        .get()
        const tracks = [];

        tracksData.forEach(doc => {
            tracks.push({...doc.data(), uid: doc.id})
        })

        if (tracks.length) {
            const timeTracked = getTaskDuration(tracks, change.after.data().duration_ms || 0);
        
            firestore().collection('tasks').doc(taskUid).set({
                duration_ms: timeTracked,
                duration: savedTime
            }, { merge: true })
        }
    } catch (e) {
        console.log(e)
    }
}))

// notifications related functions
exports.dailyNotifications = functions.https.onCall(async(data, context) => {
    const user = await getUserSettings(context.auth.uid);
    const now = admin.firestore.Timestamp.now().toDate();
    if (!user.daily_notification_date || format(user.daily_notification_date.toDate(), 'yyyy-MM-dd') != format(now, 'yyyy-MM-dd')) {
        await runDailyNotifications(context.auth.uid);
        await setUserSettings(context.auth.uid, {
            daily_notification_date: admin.firestore.Timestamp.now()
        })
        return;
    }
    return 'done';
})

exports.taskReminder = functions.runWith({ memory: "2GB" }).pubsub.schedule("* * * * *").onRun(async () => {
    return execReminders().catch((err) => {
        console.log((JSON.stringify({
            error: {
            id: 'unable-to-send-messages',
            message: `We were unable to send messages to all subscriptions : '${err.message}`
            }
        })))
    });
})
   
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

// Matrix related functions
exports.shareMatrix = serviceMatrix.shareMatrix;

// integrations related functions
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

exports.requestAccess = functions.https.onCall(async (data, context) => {
    console.log(data)
    const service =  await admin.firestore().collection('services').doc(data.service).get()
    .then(snap => snap.data());
    let error = "";
    const formData = {
        "grant_type": "authorization_code",
        "client_id": functions.config().env.jira_client_id,
        "client_secret": functions.config().env.jira_client_secret,
        "code": data.code,
        "redirect_uri": functions.config().env.jira_redirect_uri,
        "refresh_token": data.refreshToken
    }
    const response = await axios({
        method: 'post',
        url: service.token_url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    }).catch((err) => {
        error = err;
        return null
    })
    if (!response) {
        return  error.response.data;
    }

    await admin.firestore().collection('connections').add({
        user_uid: context.auth.uid,
        service: 'jira',
        code: false,
        accessToken: response.data
    }, { merge: true });

    return "ok";
})

exports.getServiceResources = functions.https.onCall(async (data) => {
    const serviceConnection =  await admin.firestore().collection('connections')
    .doc(data.connectionUid).get().then(snap => snap.data());
    let error = null

    const service =  await admin.firestore().collection('services').doc(data.service).get()
    .then(snap => snap.data());

    const response = await axios({
        method: 'get',
        url: service.list_url,
        headers: {
            'Authorization': `Bearer ${serviceConnection.accessToken.access_token}`,
            'Accept': 'application/json'
        },
    }).catch((err) => {
        console.log(data, functions.config().env);
        console.log(serviceConnection.accessToken.access_token);
        error = err;
        return null;
    })

    if (!response) {
        return error.response.data   
    }
    return response.data;
})

// API related functions
exports.api = tasks.api;