const functions = require("firebase-functions");
const admin = require('firebase-admin');
const tasks = require('./services/api/tasks');
const serviceMatrix = require('./services/matrix');
const serviceIntegrations = require('./services/integrations');

const { firestore } = require("firebase-admin");
const { format } = require("date-fns");
admin.initializeApp();
const { getUserSettings, setUserSettings, workers, getTaskDuration } = require('./utils');
const {  createRemindersForTask, createRecurrenceForTask } = require('./utils/tasks');
const { runDailyNotifications, execReminders } = require("./utils/notifications");
const { parseRequestData } = require("./services/integrations/jira");
const { default: axios } = require("axios");

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
        const user = await getUserSettings(req.auth.uid);
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
                refreshToken: token,
                created_at: admin.firestore.Timestamp.now()
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
    const service =  await admin.firestore().collection('services').doc(data.service).get()
    .then(snap => snap.data());
    const formData = parseRequestData(data);
    const {data: accessData, error } = await serviceIntegrations.requestAccess(service.token_url, formData);
    if (error) {
        return  error.response.data;
    }

    const connection = await serviceIntegrations.saveConnection(context.auth.uid, data.service, accessData);

    return {
        connectionId: connection.id,
        service: data.service,
    };
})


const tempoApi ="https://api.tempo.io/4"
const tempoToken = "yWBJVcaKCHhc17Pf1pT9zgCFF2VU73"
exports.tempoWorklogs = functions.https.onCall(async (data, context) => {
    try {
        const res = await axios.get(`${tempoApi}/worklogs`, {
            params: {
              from: data.from,
              to: data.to, 
            }, 
            headers: {
              Authorization: `Bearer ${tempoToken}`
            }
        })
        return res.data;
    } catch(err)  {
        return {
            status: 400,
            error: err
        }
    }
})


exports.userApplication = functions.https.onCall(async (data, context) => {
    try {
        const userApp =  await admin.firestore().collection('applications')
        .where('appKey', '==', data.appKey)
        .where('user_uid', '==', context.auth.uid)
        .where('type', '==', 'personal')
        .get()
        .then(snap => snap.data());

        console.log(userApp, "Hola mundo");


        const res = await axios.get(`${userApp.endpoint}/${data.path}`, { 
            auth: {
                username: userApp.user,
                password: userApp.uuid
            }
        })
        return res.data;
    } catch(err)  {
        return {
            status: 400,
            error: err
        }
    }
})

exports.getServiceResources = serviceIntegrations.integrations;

// API related functions
exports.api = tasks.api;