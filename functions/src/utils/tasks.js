const admin = require('firebase-admin');
const { RRule, rrulestr } = require("rrule");
const { differenceInCalendarDays } = require("date-fns");

exports.createRemindersForTask = async (beforeData, afterData, taskUid) => {
    try {
        if (beforeData.due_date != afterData.due_date) {
            // if have a due date
            const taskReminder = await admin.firestore()
            .collection('reminders')
            .where("status", "==", "scheduled")
            .where('task_uid', '==', taskUid)
            .limit(1)
            .get()

            if (afterData.due_date) {
                if (!taskReminder.empty) {
                    taskReminder.forEach(async snap => {
                        if (afterData.done) {
                            await snap.ref.delete();
                        } else {
                            await snap.ref.update({
                                due_time: afterData.due_date,
                                options: {
                                    message: afterData.title,
                                    user_uid: afterData.user_uid,
                                    task_uid: taskUid
                                }
                            })
                        }
                    }); 
                } else if (!afterData.done ){
                    await admin.firestore().collection('reminders').add({
                        status: 'scheduled',
                        due_time: afterData.due_date,
                        user_uid: afterData.user_uid,
                        task_uid: taskUid,
                        worker: 'notify',
                        options: {
                            message: afterData.title,
                            user_uid: afterData.user_uid
                        }
                    })
                }
            } else if (!taskReminder.empty) {
                taskReminder.forEach(async snap => {
                    await snap.ref.delete()
                })
            }
        }
    } catch (e) {
        console.log(e)
    }
}

exports.createRecurrenceForTask = async(documentRef) => {
    const afterData = await documentRef.get().then(snap => snap.data())
    if (!afterData.done && afterData.schedule && afterData.schedule.frequency) {
        const rrule = new RRule({
            freq: RRule[afterData.schedule.frequency],
            dtstart: afterData.due_date.toDate(),
            interval: afterData.schedule.interval,
            byweekday: afterData.schedule.weekDays.map( day => RRule[day])
        });
    
        return await documentRef.update({
            string: rrule.toString(),
            text: rrule.toText()
        });
    } else if (afterData.done && afterData.schedule) {
        const rruleSet = rrulestr(afterData.string, { forceset: true });
        rruleSet.exdate(afterData.due_date.toDate());
        const nextDueDate = rruleSet.after(afterData.due_date.toDate());
        console.log(nextDueDate);
        const nextScheduledTask = { ...afterData }
        delete nextScheduledTask.uid;

        const batch = firestore().batch();

        await documentRef.update({
            done: true,
            schedule: null 
        });
    
        if (await (await firestore().collection('tasks').where('parent', '==', afterData.uid).get()).empty) {
            await firestore().collection('tasks').add({
                ...nextScheduledTask,
                parent: afterData.uid,
                tracks: [],
                done: false,
                commit_date: null,
                due_date: nextDueDate,
                last_commit: afterData.due_date,
                string: rruleSet.toString(),
                text: rruleSet.toText()
            });  
        }
        const result = await batch.commit()
        console.log("New Date generated", result);
    }
    return
}

exports.filterOverdueTasks = (tasks, date) => {
    return tasks.filter((item) => {
        return item.due_date && item.due_date < date;
    })
}
const STALE_DAYS = 14;
exports.filterStaleTasks = (tasks, date ,days = STALE_DAYS) => {
    return tasks.filter((item) => {
        return differenceInCalendarDays(date, item.created_at.toDate()) > days;
    })
}

// // Firestore helper functions
exports.getUncommittedTasks = async (userUid) => {
    return admin.firestore().collection('tasks')
    .where("user_uid", "==", userUid)
    .where("done", "==", false)
    .orderBy("order")
    .get().then( snap => {
        const tasks = [];
        snap.forEach( item => {
            tasks.push({
                ...item.data(),
                uid: item.id
            })
        })

        return tasks;
    })
}

