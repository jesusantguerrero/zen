import { db, firebaseState } from "./useFirebase";

export function useTaskFirestore() {
    const saveTask = (task) => {
        return db.collection("tasks").add({
            ...task,
            user_uuid: firebaseState.uid 
        })
        .then(docRef => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getAllFromUser = async () => {
        const tasks = [];
         await db.collection('tasks').get()
            .then(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    tasks.push(doc.data());
                });
            })

        return tasks;
    }

    return {
        saveTask,
        getAllFromUser
    }

}