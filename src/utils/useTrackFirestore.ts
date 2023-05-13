// @ts-expect-error: no definitions for  luzon
import { DateTime } from "luxon";
import { db, firebaseState } from "./useFirebase";
import { addSeconds, parseISO } from "date-fns";

export interface ITrack {
    uid: string;
    duration_ms: number;
    started_at: Date;
    ended_at: Date;
    description: string;
    billable?: boolean;
    labels?: {
      title: string;
    }[];
    selected?: boolean;
}
export function useTrackFirestore() {
    const saveTrack = (track: Partial<ITrack>) => {
        return db.collection("tracks").add({
            ...track,
            user_uid: firebaseState.user.uid,
            created_at: new Date()
        }) .then(docRef => {
            return docRef.id
        })
    }

    const updateTrack = (track: Record<string, any>) => {
        const trackRef = db.collection("tracks").doc(track.uid)
        return trackRef.set(track, { merge: true })
        .then(() => {
            return track.uid;
        })
    }

    const deleteTrack = async (track: Record<string, any>) => {
        return await db.collection("tracks").doc(track.uid).delete()
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    }

    const deleteBatch = async (tracks: ITrack[]) => {
        const batch = db.batch()
        tracks.forEach((track) => {        
            db.collection("tracks").doc(track.uid).delete()
        })
        return batch.commit().catch((error) => {
            console.error("Error adding document: ", error);
        });
    }

    const getAllTracksOfTask = async (taskId: string) => {
        if (firebaseState.user) return;
        const tracks: ITrack[] = [];
        await db.collection('tracks').where(
            'task_uid', '==', taskId 
        ).where("user_uid", "==", firebaseState.user?.uid).get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tracks.push({...doc.data(), uid: doc.id } as ITrack);
            });
        })
        return tracks;
    }

    const getAllTracks = async (where = {}) => {
        const tracks: any[] = [];
        await db.collection('tracks').get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tracks.push({...doc.data(), uid: doc.id });
            });
        })

        return tracks;
    }

    const getTracksByDates = async (startDate = new Date(), endDate?: Date) => {
        const start = new Date(DateTime.fromJSDate(startDate).startOf('day'))
        const end = new Date(DateTime.fromJSDate(endDate || startDate).endOf('day'))
        
        const trackRef = db.collection('tracks')
        .withConverter(trackConverter)
        .where("user_uid", "==", firebaseState?.user?.uid)
        .where('started_at', ">=", start)
        .where('started_at', "<=", end)
        return trackRef
    }

    const getTempoTracksByDates = async (startDate = new Date(), endDate) => {
        const start = new Date(DateTime.fromJSDate(startDate).startOf('day'))
        const end = new Date(DateTime.fromJSDate(endDate || startDate).endOf('day'))
        
        const trackRef = db.collection('tempo')
        .withConverter(trackConverter)
        .where("user_uid", "==", firebaseState.user.uid)
        .where('started_at', ">=", start)
        .where('started_at', "<=", end)
        return trackRef
    }

    const syncTempoTracks = async (workLogs) => {
        const batch = db.batch()
        workLogs.forEach((workLog) => {
            const startedAt = parseISO(`${workLog.startDate}T${workLog.startTime}`);
            const key = firebaseState.user.uid + '-' + workLog.tempoWorklogId

            const formData = {
                ...workLog,
                started_at: startedAt,
                ended_at: addSeconds(startedAt, workLog.timeSpentSeconds),
                user_uid: firebaseState.user.uid,
                created_at: new Date()
            }
            db.collection('tempo').doc(key).set(formData, { merge: true })
        })
        return batch.commit().then(() => {
            return
        })
    }

    const getRunningTracks = async () => {
        const tracks: any[] = [];
        const myDate = new Date(2022, 6, 10)
        await db.collection('tracks')
        .withConverter(trackConverter)
        .where('ended_at', '==', null)
        .where("user_uid", "==", firebaseState.user.uid)
        .where('started_at', ">=", myDate)
        .orderBy('started_at', 'desc')
        .get()
        .then(q => {
            q.forEach((doc) => {
                tracks.push({...doc.data(), uid: doc.id });
            });
        })
        return tracks;
    }

    return {
        saveTrack,
        deleteTrack,
        updateTrack,
        getAllTracks,
        getAllTracksOfTask,
        getTracksByDates,
        syncTempoTracks,
        getTempoTracksByDates,
        getRunningTracks,
        deleteBatch
    }

}

const trackConverter = {
    fromFirestore(
        snapshot: firebase.default.firestore.DocumentSnapshot, 
        options: firebase.default.firestore.SnapshotOptions
    ) {
        const data = snapshot.data(options);
        return { 
            ...data, 
            started_at: data?.started_at?.toDate ? data.started_at.toDate?.() : data?.started_at,
            ended_at: data?.ended_at?.toDate ? data.ended_at.toDate?.() : data?.ended_at,
        };
    },
    toFirestore(data: ITrack) {
        return {
            ...data
        }
    }
}