import { DateTime } from "luxon";
import { db, firebaseState } from "./useFirebase";

export function useTrackFirestore() {
    const saveTrack = (track) => {
        return db.collection("tracks").add({
            ...track,
            user_uid: firebaseState.user.uid,
            created_at: new Date()
        })
        .then(docRef => {
            return docRef.id
        })
    }

    const updateTrack = (track) => {
        const trackRef = db.collection("tracks").doc(track.uid)
        return trackRef.set(track, { merge: true })
        .then(() => {
            return track.uid;
        })
    }

    const deleteTrack = (track) => {
        return db.collection("tracks").doc(track.uid).delete()
        .then(docRef => {
            return docRef.id
        })
    }

    const getAllTracksOfTask = async (taskId) => {
        const tracks = [];
        await db.collection('tracks').where(
            'task_uid', '==', taskId 
        ).where("user_uid", "==", firebaseState.user.uid).get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tracks.push({...doc.data(), uid: doc.id });
            });
        })
        return tracks;
    }

    const getAllTracks = async (where = {}) => {
        const tracks = [];
        await db.collection('tracks').get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tracks.push({...doc.data(), uid: doc.id });
            });
        })

        return tasks;
    }

    const getTracksByDates = async (startDate = new Date(), endDate) => {
        const start = new Date(DateTime.fromJSDate(startDate).startOf('day'))
        const end = new Date(DateTime.fromJSDate(endDate || startDate).endOf('day'))
        
        const trackRef = db.collection('tracks')
        .where("user_uid", "==", firebaseState.user.uid)
        .where('started_at', ">=", start)
        .where('started_at', "<=", end)
        return trackRef
    }

    return {
        saveTrack,
        deleteTrack,
        updateTrack,
        getAllTracks,
        getAllTracksOfTask,
        getTracksByDates
    }

}