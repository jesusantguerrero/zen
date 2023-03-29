const admin = require('firebase-admin/app');
const functions = require('firebase-functions');
admin.initializeApp();

const { default: BaseApi } = require("./src/services/api");
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

// Matrix related functions
exports.shareMatrix = matrixService.shareMatrix;

// integrations related functions
exports.oauthAccess = integrationService.oauthAccess
exports.requestAccess = integrationService.requestAccess
exports.getServiceResources = integrationService.integrations;

// API related functions
exports.api = BaseApi;
exports.subscription = subscriptionService.default;

exports.userApplication = functions.https.onCall(async (data, context) => {
    try {
        const userApp =  await admin.firestore().collection('applications')
        .where('appKey', '==', data.appKey)
        .where('user_uid', '==', context.auth.uid)
        .get()
        .then(snap => snap.data());

        const res = await axios.get(`${userApp.endpoint}/${data.path}`, { 
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
            }} : {})
        })
        return res.data;
    } catch(err)  {
        return {
            status: 400,
            error: err
        }
    }
})
