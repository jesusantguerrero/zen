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

const getServiceAccess = async (url, formData) => {
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

const saveConnection = (userUid, serviceName, data) => {
    return admin.firestore().collection('connections').add({
        user_uid: userUid,
        service: serviceName,
        code: false,
        accessToken: data,
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now()
    }, { merge: true });
}

const updateConnection = (connectionUid, data) => {
    return admin.firestore().collection('connections').doc(connectionUid).update({
        ...data,
        updated_at: admin.firestore.Timestamp.now()
    }, { merge: true });
}

exports.requestAccess =  functions.https.onCall(async (data, context) => {
    const service =  await admin.firestore().collection('services').doc(data.service).get()
    .then(snap => snap.data());
    const formData = jira.parseRequestData(data);
    const {data: accessData, error } = await getServiceAccess(service.token_url, formData);
    if (error) {
        return  error.response.data;
    }

    const connection = await saveConnection(context.auth.uid, data.service, accessData);

    return {
        connectionId: connection.id,
        service: data.service,
    };
})

exports.oauthAccess =  functions.https.onRequest(async (request, response) => {
    try {
        const results = await admin.firestore().collection('connections').where('code', '==', request.body.code).limit(1).get()
        let codeData = {}

        results.forEach(snap => {
            codeData = { uid: snap.id, ...snap.data()}
        })

        if (request.body.client_secret && codeData.uid, codeData.code) {
            // Verify client secret or redirect_uri or both but electron wouldn't work
            const token = await admin.auth().createCustomToken(codeData.user_uid);
            await admin.firestore().collection('connections').doc(codeData.uid).set({
                code: false,
                refreshToken: token,
                created_at: admin.firestore.Timestamp.now()
            }, { merge: true });
            return response.json({access_token: token})
        }
        return response.json({
            "response_type": "ephemeral",
            text: `This email it is not in our app`
        });
    } catch (e) {
        return response.json({
            "response_type": "ephemeral",
            text: `This email it is not in our app ${e}`
        });
    }
})

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

