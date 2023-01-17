// Matrix sharing
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { default: Paypal } = require('../libraries/paypal/index');
const { getUserSettings } = require('../utils');

const paypal = new Paypal({
    client_id: functions.config().env.paypal.client_id,
    secret: functions.config().env.paypal.secret,
    live: functions.config().env.paypal.env == 'live' ? true : false
})

exports.default = functions.https.onCall(async(data, context) => {
    const user = await getUserSettings(context.auth.uid);
    const types = {
        transactions,
        cancel,
        suspend,
        resume,
        upgrade 
    }
    
    response = await types[data.type](data, user, context);
    return response;
})

async function cancel (_data, user, context)  {
    await paypal.cancel(user.subscription.subscriptionID).then(async () => {
        await admin.firestore().collection('settings').doc(context.auth.uid).set({
            subscription_canceled: admin.firestore.Timestamp.now(),
            subscription: {},
            selectedPrice: null
        }, { merge: true })
    }).catch(err => {
        console.log(err, "Error")
    })
    return "OK";
}

async function transactions (_data, user, _context)  {
    const data = await paypal.invoices(user.subscription.subscriptionID)
    .catch(err => {
        console.log(err, "Error")
    })
    return data;
}

async function resume (data, user, _context)  {
    paypal.reactivateSubscription(user.subscription.subscriptionID, data);
    return res.send('activated');
}

async function suspend (data, user, _context) {
    paypal.suspendSubscription(user.subscription.subscriptionID, data);
    return res.send('suspended')
}

async function upgrade (data, user, _context)  {
    paypal.upgradeSubscription(user.subscription.subscriptionID, data);
    res.send('upgraded')
}

exports.api 