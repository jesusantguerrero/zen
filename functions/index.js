const admin = require('firebase-admin');
const axios = require('axios').default;
const functions = require('firebase-functions');
admin.initializeApp();

const baseApi = require("./src/services/api");
const matrixService = require('./src/services/matrix');
const subscriptionService = require('./src/services/subscription');
const integrationService = require('./src/services/integrations');
const notificationService = require("./src/services/notifications");
const taskService = require("./src/services/tasks");

// Task related functions
exports.setReminder = functions.runWith({ memory: "2GB" }).firestore.document('tasks/{taskId}').onWrite(taskService.setTaskReminder)
exports.setRecurrence = functions.https.onCall(taskService.setTaskRecurrence)
exports.calcTaskTime = functions.firestore.document('tracks/{trackId}').onUpdate(taskService.calcTaskTime)

// notifications related functions
exports.dailyNotifications = notificationService.dailyNotifications
exports.taskReminder = notificationService.taskReminderNotifications
exports.sendPush = notificationService.sendPushNotifications

exports.uploadTimeLogs = 

// Matrix related functions
exports.shareMatrix = matrixService.shareMatrix;

// integrations related functions
exports.oauthAccess = integrationService.oauthAccess
exports.requestAccess = integrationService.requestAccess
exports.getServiceResources = integrationService.integrations;

// API related functions
exports.api = baseApi.core;
exports.subscription = subscriptionService.default;

exports.userApplication = functions.runWith({
    enforceAppCheck: true,
}).https.onCall(async (data, context) => {
    if (context.app == undefined) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called from an App Check verified app.'
        )
    }
    try {
        if (!context.auth) return
        const userApp =  await admin.firestore().collection('applications')
        .where('appKey', '==', data.appKey)
        .where('user_uid', '==', context.auth.uid)
        .limit(1)
        .get()
        .then( results =>  {
            let data;
            results.forEach(snap => {
               data = snap.data()
            });
            return data;
        })

        const method = data.method ?? 'get';
        const config = { 
            params: {
                ...(data.params ?? {})
            },
            headers: {
                ...( userApp.type == 'apiToken' ? {
                    Authorization: `Bearer ${userApp.uuid}`
                  } : {}
                )
            },
            ...(userApp.type == 'personal' ? { auth: {
                username: userApp.user,
                password: userApp.uuid
            }} : {}),
            ...(data.data ? { data: data.data } : {}) 
        }
        let res;
        if (method == 'post') {
            res = await axios[method](`${userApp.endpoint}/${data.path}`, data.data, config )
        } else {
            res = await axios[method](`${userApp.endpoint}/${data.path}`, config)
        }
        return res.data;
    } catch(err)  {
        console.log(err)
        return {
            status: 404,
            error: err,
        }
    }
})
