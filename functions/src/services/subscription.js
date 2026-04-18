// Matrix sharing
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { default: Paypal } = require('../libraries/paypal/index');
const { getUserSettings } = require('../utils');

// Lazy — avoids crashing module load when functions.config().env.paypal
// isn't set (e.g. local dev without Firebase config, or environments where
// PayPal is disabled). Throw only when actually called.
let _paypal = null
const getPaypal = () => {
    if (_paypal) return _paypal
    const cfg = functions.config().env && functions.config().env.paypal
    if (!cfg) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'PayPal is not configured. Set functions.config().env.getPaypal().* to enable subscriptions.'
        )
    }
    _paypal = new Paypal({
        client_id: cfg.client_id,
        secret: cfg.secret,
        live: cfg.env == 'live' ? true : false,
    })
    return _paypal
}

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
    await getPaypal().cancel(user.subscription.subscriptionID).then(async () => {
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
    const data = await getPaypal().invoices(user.subscription.subscriptionID)
    .catch(err => {
        console.log(err, "Error")
    })
    return data;
}

async function resume (data, user, _context)  {
    getPaypal().reactivateSubscription(user.subscription.subscriptionID, data);
    return res.send('activated');
}

async function suspend (data, user, _context) {
    getPaypal().suspendSubscription(user.subscription.subscriptionID, data);
    return res.send('suspended')
}

async function upgrade (data, user, _context)  {
    getPaypal().upgradeSubscription(user.subscription.subscriptionID, data);
    res.send('upgraded')
}
