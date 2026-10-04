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

const SUPPORTED_SERVICES = Object.keys(services);

const requireAuth = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    }
    return context.auth.uid;
}

const requireService = (name) => {
    if (typeof name !== 'string' || !SUPPORTED_SERVICES.includes(name)) {
        throw new functions.https.HttpsError('invalid-argument', 'Unsupported service.');
    }
    return name;
}

exports.requestAccess =  functions.https.onCall(async (data, context) => {
    requireAuth(context);
    requireService(data && data.service);
    const service =  await admin.firestore().collection('services').doc(data.service).get()
    .then(snap => snap.data());
    if (!service || !service.token_url) {
        throw new functions.https.HttpsError('failed-precondition', 'Service is not configured.');
    }
    const formData = jira.parseRequestData(data);
    const {data: accessData, error } = await getServiceAccess(service.token_url, formData);
    if (error) {
        functions.logger.error('requestAccess failed', { service: data.service, status: error.response && error.response.status });
        throw new functions.https.HttpsError('unavailable', 'Could not connect to the service.');
    }

    const connection = await saveConnection(context.auth.uid, data.service, accessData);

    return {
        connectionId: connection.id,
        service: data.service,
    };
})

// Disabled 2026-10: the client_secret was only checked for presence, so any
// valid `code` could be exchanged for a Firebase custom token (account takeover).
// The OAuth provider flow is not used by the app (Settings > Oauth is inactive).
// Re-enable only with a real client registry + secret comparison + code expiry.
exports.oauthAccess =  functions.https.onRequest(async (_request, response) => {
    return response.status(410).json({ error: 'gone' });
})

// eslint-disable-next-line no-unused-vars
const legacyOauthAccess = async (request, response) => {
    try {
        const results = await admin.firestore().collection('connections').where('code', '==', request.body.code).limit(1).get()
        let codeData = {}

        results.forEach(snap => {
            codeData = { uid: snap.id, ...snap.data()}
        })

        if (request.body.client_secret && codeData.uid && codeData.code) {
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
            text: `This email it is not in our app`
        });
    }
}

exports.integrations = functions.https.onCall(async (data, context) => {
    const uid = requireAuth(context);
    const serviceName = requireService(data && data.service);
    const handlers = services[serviceName];
    const type = data.type;
    if (typeof type !== 'string' || !Object.prototype.hasOwnProperty.call(handlers, type)) {
        throw new functions.https.HttpsError('invalid-argument', 'Unsupported operation.');
    }
    if (typeof data.connectionUid !== 'string' || !data.connectionUid) {
        throw new functions.https.HttpsError('invalid-argument', 'connectionUid is required.');
    }

    const snap = await admin.firestore().collection('connections').doc(data.connectionUid).get();
    // Same error for missing and foreign connections so ids can't be probed.
    if (!snap.exists || snap.data().user_uid !== uid || snap.data().service !== serviceName) {
        throw new functions.https.HttpsError('not-found', 'Connection not found.');
    }
    const serviceConnection = { uid: snap.id, ...snap.data() };

    const service =  await admin.firestore().collection('services').doc(serviceName).get()
    .then(snap => snap.data());

    const response = await handlers[type](data, serviceConnection, service).catch((err) => {
        functions.logger.error('integration call failed', { service: serviceName, type, status: err.response && err.response.status });
        return null;
    });
    if (!response) {
        throw new functions.https.HttpsError('unavailable', 'The service did not respond.');
    }
    return response.data;
})

