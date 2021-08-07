const admin = require('firebase-admin');
const { workers } = require('./index');
const { getUncommitedTasks, filterOverdueTasks, filterStaleTasks } = require('./tasks');

exports.execReminders = async() => {
    const now = admin.firestore.Timestamp.now();
    const result = await admin.firestore().collection('reminders')
    .where("due_time", '<=', now).where("status", "==", "scheduled").get()
    
    const jobs = [];
    result.forEach((snap) => {
        const { worker, options, user_uid } = snap.data()
        options.user_uid = user_uid;
        const job = workers[worker](options)
            .then(() => snap.ref && snap.ref.update({ status: 'complete' }))
            .catch((err) => {
                snap.ref.update({ status: 'error', errorMessage: err.toString()});
            })
        jobs.push(job)
    })

    return await Promise.all(jobs)
}

exports.runDailyNotifications = async(authId) => {
    const now = admin.firestore.Timestamp.now()
    
    const undoneTasks = await getUncommitedTasks(authId);

    const overdue = filterOverdueTasks(undoneTasks, now.toDate())

    const stale = filterStaleTasks(undoneTasks, now.toDate());

    const staleNotification = {
        type: 'system',
        data: {
            title: "Stale tasks",
            message: `You have ${stale.length} task(s) in stale`,
            action: 'stale'
        },
        read_at: null,
        user_uid: authId,
        created_at: now
    }

    const overdueNotification = {
        type: 'system',
        data: {
            title: "Overdue tasks",
            message: `You have ${overdue.length} task(s) in overdue`,
            action: 'overdue'
        },
        user_uid: authId,
        read_at: null,
        created_at: now
    }

    if (stale.length) {
        admin.firestore().collection('notifications').add(staleNotification)
    }

    if (overdue.length) {
        admin.firestore().collection('notifications').add(overdueNotification)
    }
}
