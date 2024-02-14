const firestore = require('firebase-admin/firestore');

const { getTaskDuration } = require("../utils");
const { createRecurrenceForTask, crea } = require('../utils/tasks');
const testId = "zEc2lvJCgbdjxb5pt2Icruo4AN82"

exports.setTaskReminder = async (change) => {
    if (change.after.isEqual(change.before)) return;
    if (change.before.data().user_uid == "zEc2lvJCgbdjxb5pt2Icruo4AN82") {
        await createRemindersForTask(change.before.data(), change.after.data(), change.after.id);
        return
    }
    return
};

exports.setTaskRecurrence = async (data) => {
    if (data.user_uid == testId) {
        const taskRef = firestore().collection('tasks').doc(data.uid)
        return await createRecurrenceForTask(taskRef) 
    }
}

exports.calcTaskTime = async (change) => {
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
}