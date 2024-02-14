const admin = require('firebase-admin');
const { Duration  } = require('luxon');

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
