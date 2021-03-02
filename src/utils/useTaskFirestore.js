import { DateTime } from "luxon";
import { format as formatDate} from "date-fns"
import { db, firebaseState } from "./useFirebase";
const collectionName = "tasks";

const getDate = (task) => {
    return task.due_date instanceof Date ? formatDate(task.due_date, "yyyy-MM-dd") : task.due_date;
}

export function useTaskFirestore() {
    const saveTask = (task) => {
        task.due_date = getDate(task)
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
        task.due_date = getDate(task)
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
        await db.collection(collectionName).where("user_uid", "==", firebaseState.user.uid).get().then(querySnapshot => {
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
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tasks.push({...doc.data(), uid: doc.id });
            });
        })

        return tasks;
    }

    const getUncommitedTasks = async (date) => {
        const tasks = [];
        await db.collection(collectionName)
        .where("user_uid", "==", firebaseState.user.uid)
        .where("done", "==", false)
        .orderBy("order")
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tasks.push({...doc.data(), uid: doc.id });
            });
        })
        return tasks;
    }

    const getTaskByMatrix = async (matrix) => {
        const matrixRef = db.collection(collectionName)
            .where("user_uid", "==", firebaseState.user.uid)
            .where("done", "==", false)
            .where("matrix", "==", matrix)
            .orderBy("order")
            
        return matrixRef
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
