const admin = require('firebase-admin');
const functions = require("firebase-functions");
const { format } = require('date-fns');
const { getUserSettings, setUserSettings } = require("../../utils");
const { notificationWorkers } = require('../../utils/notificationWorkers');
const { execReminders, runDailyNotifications } = require('../../utils/notifications');
exports.dailyNotifications = functions.https.onCall(async(_data, context) => {
    const user = await getUserSettings(context.auth.uid);
    const now = admin.firestore.Timestamp.now().toDate();
    if (!user.daily_notification_date || format(user.daily_notification_date.toDate(), 'yyyy-MM-dd') != format(now, 'yyyy-MM-dd')) {
        await runDailyNotifications(context.auth.uid);
        await setUserSettings(context.auth.uid, {
            daily_notification_date: admin.firestore.Timestamp.now()
        })
        return;
    }
    return 'done';
})

exports.taskReminderNotifications = functions.runWith({ memory: "2GB" }).pubsub.schedule("* * * * *").onRun(async () => {
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
   
exports.sendPushNotifications = functions.https.onRequest(async (req, res) => {
    if (req.method == 'post') {
        const user = await getUserSettings(req.auth.uid);
        if (user.pushSubscription) {
            notificationWorkers.sendMessage({ message: req.body.message , pushSubscription: user.pushSubscription })
            .then(() => {
                res.setHeader('Content-Type', 'application/json');
                  res.send(JSON.stringify({ data: { success: true } }));
              })
              .catch(function(err) {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                  error: {
                    id: 'unable-to-send-messages',
                    message: `We were unable to send messages to all subscriptions : '${err.message}`
                  }
                }));
              });
        } else {
            res.status(404).send('bad')
        }
    }
})