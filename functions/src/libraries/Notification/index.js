const { notificationWorkers: workers } = require("../../utils/notificationWorkers")

exports.send = function(authUser, notificationInstance) {
    notificationInstance.getVia().forEach(via => {
        if (workers[via]) {
            workers[via](authUser, {
                title: notificationInstance.getTitle(),
                message: notificationInstance.getMessage(),
                link: notificationInstance.getLink(),
                icon: notificationInstance.getIcon(),
            })
        }
    })
}