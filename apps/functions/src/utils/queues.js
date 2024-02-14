const admin = require('firebase-admin');
const { getGroupedTracks } = require('./tracks');
const { getUncommittedTasks, filterOverdueTasks, filterStaleTasks } = require('./tasks');

exports.uploadTimeLogs = async() => {

    const now = admin.firestore.Timestamp.now();
    const tempoProfiles =  await admin.firestore().collection('applications')
        .where('appKey', '==', 'tempo')
        .where('autoUpload', '==', true)
        .get()
    
    const jobs = [];
    tempoProfiles.forEach(async (snap) => {
        const { worker, options, user_uid } = snap.data()

        const groupedTracks = await getGroupedTracks(user_uid, now)
        //  find jira ticket
        //  update to tempo
        .then(() => snap.ref && snap.ref.update({ uploadedAt: now(), last_status: "completed" }))
        .catch((err) => {
            snap.ref.update({ last_status: 'error', errorMessage: err.toString()});
        })
          
    })

    return await Promise.all(jobs)
}
