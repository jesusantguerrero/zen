const Notification = require('./Notification');
class SharedNotification extends Notification.Notification {
    getVia() {
        return ['notify', 'mail']
    }
    getTitle() {
        return 'Shared Notification'
    }

    getMessage() {
        return `${this.data.owner} shared a board with you`;
    }

    getIcon() {
        return 'fa-share-alt'
    }

    getLink() {
        return `/board/${this.data.boardLink}`
    }

    getAction() {
        return 'shared'
    }

}

exports.SharedNotification = SharedNotification;