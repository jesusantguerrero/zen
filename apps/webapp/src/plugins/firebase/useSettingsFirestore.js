import { db } from "../useFirebase";
const collectionName = "settings";

export function useSettingsFirestore() {
    const updateUserSettings = (setting) => {
        return db.collection(collectionName).doc(setting.uid).set(setting, { merge: true })
        .then(() => {
            return setting;
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getUserSettings = async (uid) => {
        const settings = await db.collection(collectionName)
        .where('user_uid', '==', uid)
        .limit(1)
        .get()
        .then((snap) => {
            let docData = null;
            snap.forEach((doc) => {
                docData = doc.data()
            })
            return docData;
        });
        return settings;
    }

    return {
        updateUserSettings,
        getUserSettings
    }

}
