const admin = require('firebase-admin');
const functions = require('firebase-functions');
const axios = require('axios');
const jira = require('./jira');

const services = {
    jira: {
        list: jira.getList,
        projects: jira.getProjects,
        issues: jira.getIssues,
    }
}

exports.requestAccess = async (url, formData) => {
    let data = null;
    let error = false;
    await axios({
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
    .then(({ data: responseData }) => {
        console.log(data);
        data = typeof responseData == 'string' ? JSON.parse(responseData) : responseData;
        return data;
    })
    .catch((err) => {
        error = err;
        return null
    })
    return { data, error };
}

exports.integrations = functions.https.onCall(async (data) => {
    const serviceConnection =  await admin.firestore().collection('connections')
    .doc(data.connectionUid).get().then(snap => ({uid: snap.id, ... snap.data()}));
    let error = null

    const service =  await admin.firestore().collection('services').doc(data.service).get()
    .then(snap => snap.data());

    const response = await services[data.service][data.type](data, serviceConnection, service);
    if (!response) {
        return error.response.data   
    }
    return response.data;
})

exports.saveConnection = (userUid, serviceName, data) => {
    return admin.firestore().collection('connections').add({
        user_uid: userUid,
        service: serviceName,
        code: false,
        accessToken: data,
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now()
    }, { merge: true });
}

exports.updateConnection = (connectionUid, data) => {
    return admin.firestore().collection('connections').doc(connectionUid).update({
        ...data,
        updated_at: admin.firestore.Timestamp.now()
    }, { merge: true });
}
