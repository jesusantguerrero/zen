import { DateTime } from "luxon";
import { format as formatDate} from "date-fns"
import { db, firebaseState } from "./useFirebase";
const collectionName = "tasks";

const getDate = (task) => {
    return task.due_date instanceof Date ? task.due_date : DateTime.fromISO(task.due_date).toJSDate();
}

export function useTaskFirestore() {
    const saveTask = (task) => {
        if (task.due_date) {
            task.due_date = getDate(task)
        }
        return db.collection(collectionName).add({
            ...task,
            user_uid: firebaseState.user.uid,
            created_at: new Date()
        })
        .then((docRef) => {
            return docRef.id;
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const updateTask = (task) => {
        const trackRef = db.collection(collectionName).doc(task.uid)
        if (task.due_date) {
            task.due_date = getDate(task)
        }
        return trackRef.update(task, { merge: true })
        .then(() => {
            return task.uid;
        })
    }

    const updateTaskBatch = (tasks) => {
        const batch = db.batch()
        tasks.forEach((task) => {
            const trackRef = db.collection(collectionName).doc(task.uid)
            trackRef.update({
                order: task.order
            }, { merge: true })

        })
        return batch.commit().then(() => {
            return
        })
        .then(() => {
            return tasks;
        })
    }

    const deleteTask = (task) => {
        return db.collection(collectionName).doc(task.uid).delete()
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getAllFromUser = async (where = {}) => {
        const tasks = [];
        await db.collection(collectionName).where("user_uid", "==", firebaseState.user.uid)
        .withConverter(taskConverter)
        .get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tasks.push({...doc.data(), uid: doc.id });
            });
        })

        return tasks;
    }

    const getCommitedTasks = async (date = new Date()) => {
        const tasks = [];
        const commitDate = DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')
        await db.collection(collectionName)
        .where("user_uid", "==", firebaseState.user.uid)
        .where("done", "==", true)
        .where("commit_date", "==", commitDate)
        .withConverter(taskConverter)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tasks.push({...doc.data(), uid: doc.id });
            });
        })

        return tasks;
    }

    const getUncommitedTasks = (userUuid) => {
        const uncommitedRef = db.collection(collectionName)
        .where("user_uid", "==", userUuid || firebaseState.user.uid)
        .where("done", "==", false)
        .orderBy("order")
        .withConverter(taskConverter)
    
        return uncommitedRef
    }

    const getTaskByMatrix = async (matrix) => {
        const matrixRef = db.collection(collectionName)
            .where("user_uid", "==", firebaseState.user.uid)
            .where("done", "==", false)
            .where("matrix", "==", matrix)
            .withConverter(taskConverter)
            .orderBy("order")
            
        return matrixRef
    }

    const taskConverter = {
        fromFirestore( snapshot, options) {
            const data = snapshot.data(options);
            return { ...data, due_date: !data.due_date ? null : data.due_date.toDate ? data.due_date.toDate() : data.due_date };
        }
    }
    return {
        saveTask,
        updateTask,
        updateTaskBatch,
        deleteTask,
        getTaskByMatrix,
        getUncommitedTasks,
        getCommitedTasks,
        getAllFromUser
    }
}