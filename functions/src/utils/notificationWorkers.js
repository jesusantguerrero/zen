const admin = require('firebase-admin');
// const Mail = require('../libraries/Mail/mail');

// utils
exports.notificationWorkers = {
    sendMessage: async (options) => {
        const user = await admin.firestore().collection('settings').doc(options.user_uid).get().then((snap) => snap.data());
        return admin.messaging().send({
            data: {
                message: options.message
            },
            token: user.pushSubscription.replace(/\"/g, "")
        })
    },
    notify: async (options) => {
        const now = admin.firestore.Timestamp.now();
        const reminderNotification = {
            type: options.type || 'system',
            data: {
                title: options.title || "Task Reminder",
                message: options.message,
                action: options.actions || 'task',
            },
            user_uid: options.user_uid,
            read_at: null,
            created_at: now
        }
    
        if (reminderNotification) {
            return await admin.firestore().collection('notifications').add(reminderNotification)
        }
    },
    mail: async (options) => {
        // const mailService = new Mail();
        // mailService.send(options.email, options.title, options.message, options);
    }
}
