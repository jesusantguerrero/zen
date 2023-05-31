exports.trashOverRunningTracks = functions.runWith({ memory: "2GB" }).pubsub.schedule("* * * * *").onRun(async () => {
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