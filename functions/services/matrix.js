// Matrix sharing
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.shareMatrix = functions.https.onCall(async (data, context) => {
    const user = context.auth;
    const methods = {
        post: createShare,
        delete: removeShare,
    }
    if (user) {
        const method = data.method;
        delete data.method;
        const { data: responseData, error } = await methods[method].call(null, data, user);
        if (error) {
            throw new functions.https.HttpsError('not-found', error.message);
        }

        return responseData;
    }

    throw new functions.https.HttpsError('not-found', "User not found");
})

async function createShare (data, user) {
    const shareReceiver = await admin.auth().getUserByEmail(data.email).then(record => record).catch(() => null);
    const userData = await admin.auth().getUser(user.uid).then(record => record).catch(() => null);
    let responseData = ""
    let error = null;
    if (shareReceiver) {
        await admin.firestore().collection('shared').doc(shareReceiver.uid).collection('accounts').doc(user.uid).set({
            matrix: data.matrixes,
            name: userData.displayName,
            photoUrl: userData.photoURL,
            email: userData.email
        }, { merge: true});

        await admin.firestore().collection('sharing').doc(user.uid).collection('accounts').doc(shareReceiver.uid).set({
            matrix: data.matrixes,
            photoUrl: shareReceiver.photoURL,
            receiver_name: shareReceiver.displayName,
            receiver_email: data.email
        }, { merge: true});

        await admin.firestore().collection('contacts').add({
            photoUrl: shareReceiver.photoURL,
            name: shareReceiver.displayName,
            email: data.email,
            receiver_uid: shareReceiver.uid,
            user_uid: userData.uid
        }, { merge: true});

        responseData = "completed";

    } else {
       error = Error("This user doent have a Zen account'"); 
    }
    return { data: responseData, error };
}

async function removeShare (data, user) {
    let responseData = ""
    let error = null;
    
    if (data.receiverUid) {
        await admin.firestore().collection('shared').doc(data.receiverUid).collection('accounts').doc(user.uid).delete();
        await admin.firestore().collection('sharing').doc(user.uid).collection('accounts').doc(data.receiverUid).delete( {
            exists: true
        });
        responseData = "completed";
    } else {
        error = Error("This user doent have a Zen account'");
    }

    return { data: responseData, error };
}