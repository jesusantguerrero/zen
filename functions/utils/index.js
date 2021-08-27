const admin = require('firebase-admin');
const { Duration  } = require('luxon');
const Mail = require('../libraries/Mail/mail');

// utils
exports.workers = {
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
        const mailService = new Mail();
        mailService.send(options.email, options.title, options.message, options);
    }
}

exports.getUserSettings = async(uid) => {
    return admin.firestore().collection('settings').doc(uid).get().then(ref => ref.data());
}

exports.setUserSettings = async(uid, data) => {
    return admin.firestore().collection('settings').doc(uid).set({
        ...data
    }, { merge: true });
}

// Duration calculator
const timeReducer = (tracks) => {
    if (!tracks) return 0
    return tracks.reduce((milliseconds, track)=> {
        const duration = track.duration_ms ? Number(track.duration_ms || 0) : 0
        return milliseconds + duration;
    }, 0)
}
exports.timeReducer = timeReducer

exports.formatMillisToDuration = (milliseconds) => {
    return Duration.fromMillis(milliseconds).toFormat("hh:mm:ss");
}

exports.getTaskDuration = (tracks, milliseconds) => {
    const savedTime = timeReducer(tracks) + milliseconds;
    return exports.formatMillisToDuration(savedTime);
}
