const firestore = require('firebase-admin/firestore');

const { getTaskDuration } = require("../utils");
const { createRecurrenceForTask, createRemindersForTask } = require('../utils/tasks');

exports.setTaskReminder = async (change) => {
    if (change.after.isEqual(change.before)) return;
    await createRemindersForTask(change.before.data(), change.after.data(), change.after.id);
};

exports.setTaskRecurrence = async (data) => {
    const taskRef = firestore().collection('tasks').doc(data.uid)
    return await createRecurrenceForTask(taskRef)
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
                duration_ms: timeTracked
            }, { merge: true })
        }
    } catch (e) {
        console.log(e)
    }
}