import { DateTime } from "luxon";
import { db, firebaseState } from "./useFirebase";
const collectionName = "settings";

export function useSettingsFirestore() {
    const updateUserSettings = (setting) => {
        return db.collection(collectionName).doc(setting.uid).set({
            ...setting
        }, { merge: true })
        .then(() => {
            return setting;
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const getUserSettings = (uid) => {
        return db.collection(collectionName).doc(uid)
            .get()
            .then((doc) => {
                return doc.data()
            });
    }

    return {
        updateUserSettings,
        getUserSettings
    }

}
