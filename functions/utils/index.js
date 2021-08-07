const admin = require('firebase-admin');
const { Duration  } = require('luxon');

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
            type: 'system',
            data: {
                title: "Task Reminder",
                message: options.message,
                action: 'task',
                message: options.message
            },
            user_uid: options.user_uid,
            read_at: null,
            created_at: now
        }
    
        if (reminderNotification) {
            return await admin.firestore().collection('notifications').add(reminderNotification)
        }
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
exports.timeReducer = (tracks) => {
    if (!tracks) return 0
    return tracks.reduce((milliseconds, track)=> {
        const duration = track.duration_ms ? Number(track.duration_ms || 0) : 0
        return milliseconds + duration;
    }, 0)
}

exports.formatMillisToDuration = (milliseconds) => {
    return Duration.fromMillis(milliseconds).toFormat("hh:mm:ss");
}

exports.getTaskDuration = (tracks, milliseconds) => {
    const savedTime = timeReducer(tracks) + milliseconds;
    return exports.formatMillisToDuration(savedTime);
}
