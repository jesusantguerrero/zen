const admin = require('firebase-admin');
const { execReminders } = require('../../utils/notifications');
class Notification {
    constructor(data) {
        this.data = data;
    }

    getVia() {
        return ['notify', 'mail']
    }

    getTitle() {
        return 'Notification';
    }

    getMessage() {
        return 'message';
    }

    getIcon() {
        return '';
    }

    getLink() {
        return ''
    }

    static async send(user, notificationInstance) {
        const now = admin.firestore.Timestamp.now();
        for (const via of notificationInstance.getVia()) {
            await admin.firestore().collection('reminders').add({
                due_time: now,
                worker: via,
                user_uid: user.uid,
                options: {
                    title: notificationInstance.getTitle(),
                    email: user.email,
                    message: notificationInstance.getMessage(),
                    icon: notificationInstance.getIcon(),
                    link: notificationInstance.getLink(),
                },
                status: 'scheduled'
            })
        }
        await execReminders();
        console.log('Notification sent');
        return "done";
    }
}

exports.Notification = Notification;