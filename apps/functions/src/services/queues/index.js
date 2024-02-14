const functions = require("firebase-functions");
const { execReminders } = require('../../utils/notifications');

exports.uploadTimeLogs = functions.runWith({ memory: "2GB" }).pubsub.schedule("* * * * *").onRun(async () => {
    return execReminders()
    .catch((err) => {
        console.log((JSON.stringify({
            error: {
            id: 'unable-to-send-messages',
            message: `We were unable to send messages to all subscriptions : '${err.message}`
            }
        })))
    });
})