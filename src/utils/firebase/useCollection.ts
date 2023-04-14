import { db, firebaseState } from "../useFirebase";

export function useCollection(tableName?: string, relationshipTable?: string, relationshipFields?: string[]) {

    const save = (item: any, collectionName = tableName) => {
        return db.collection(collectionName).add({
            ...item,
            user_uid: firebaseState?.user?.uid,
            created_at: new Date()
        }).then((docRef) => {
            return docRef.id
        })
    }

    const update = (item: any, collectionName = tableName) => {
        const collectionRef = db.collection(collectionName).doc(item.uid)
        return collectionRef.update(item, { merge: true })
    }

    const updateBatch = (items: any[], collectionName = tableName) => {
        const batch = db.batch()
        items.forEach((item) => {
            const collectionRef = db.collection(collectionName).doc(item.uid)
            collectionRef.update({
                ...item
            }, { merge: true })

        })
        return batch.commit()
    }

    const destroy = (task: any, collectionName = tableName) => {
        return db.collection(collectionName).doc(task.uid).delete()
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getOne = (uid: string, collectionName = tableName,) => {
        const matrixRef = db.collection(collectionName).doc(uid)
            .where("user_uid", "==", firebaseState.user.uid)
            
        return matrixRef
    }

    const getAll = (collectionName = tableName) => {
        const collectionRef = db.collection(collectionName)
            .where("user_uid", "==", firebaseState.user.uid)
            
        return collectionRef
    }

    const getAllShared = (collectionName = tableName) => {
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
