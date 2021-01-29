import { db, firebaseState } from "./useFirebase";

export function useTaskFirestore() {
    const saveTask = (task) => {
        return db.collection("tasks").add({
            ...task,
            user_uid: firebaseState.user.uid,
            created_at: new Date()
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const deleteTask = (task) => {
        return db.collection("tasks").doc(task.uid).delete()
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getAllFromUser = async (where = {}) => {
        const tasks = [];
        await db.collection('tasks').where("user_uid", "==", firebaseState.user.uid).get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tasks.push({...doc.data(), uid: doc.id });
            });
        })

        return tasks;
    }

    return {
        saveTask,
        deleteTask,
        getAllFromUser
    }

}