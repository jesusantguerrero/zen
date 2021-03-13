import { db, firebaseState } from "./useFirebase";

export function useCollection() {
    const save = (collectionName, item) => {
        return db.collection(collectionName).add({
            ...item,
            user_uid: firebaseState.user.uid,
            created_at: new Date()
        }).then((docRef) => {
            return docRef.id
        })
    }

    const update = (collectionName, item) => {
        const collectionRef = db.collection(collectionName).doc(item.uid)
        return collectionRef.update(item, { merge: true })
    }

    const updateBatch = (collectionName, items) => {
        const batch = db.batch()
        items.forEach((item) => {
            const collectionRef = db.collection(collectionName).doc(item.uid)
            collectionRef.update({
                ...item
            }, { merge: true })

        })
        return batch.commit()
    }

    const destroy = (collectionName, task) => {
        return db.collection(collectionName).doc(task.uid).delete()
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getOne = (collectionName, uid) => {
        const matrixRef = db.collection(collectionName).doc(uid)
            .where("user_uid", "==", firebaseState.user.uid)
            
        return matrixRef
    }

    const getAll = (collectionName) => {
        const collectionRef = db.collection(collectionName)
            .where("user_uid", "==", firebaseState.user.uid)
            
        return collectionRef
    }

    const getAllShared = (collectionName) => {
        const collectionRef = db.collection(collectionName).doc(firebaseState.user.uid).collection('accounts')   
        return collectionRef
    }

    return {
        save,
        update,
        updateBatch,
        destroy,
        getOne,
        getAll,
        getAllShared

    }

}
