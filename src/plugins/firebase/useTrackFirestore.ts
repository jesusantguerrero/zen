import { DateTime, Duration } from "luxon";
import { db, firebaseState } from "../useFirebase";
import { addSeconds, isBefore, parseISO } from "date-fns";

export interface ITrack {
    uid: string;
    duration_ms: number;
    started_at: Date;
    ended_at: Date;
    description: string;
    billable?: boolean;
    target_time: string;
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
    const updateBatch = async (tracks: ITrack[]) => {
        const batch = db.batch()
        tracks.forEach((track) => {        
            db.collection("tracks").doc(track.uid).set(track, { merge: true })
        })
        return batch.commit().catch((error) => {
            console.error("Error adding document: ", error);
        });
    }

    const getAllTracksOfTask = async (taskId: string) => {
        if (!firebaseState.user) return;
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

    const getUnfinished = async () => {
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

    const getRunningTrack = async () => {
        const myDate = new Date(2022, 6, 10)
        const ref =  await db.collection('tracks')
        .where('ended_at', '==', null)
        .where("user_uid", "==", firebaseState.user?.uid)
        .where('started_at', ">=", myDate)
        .limitToLast(1)
        .orderBy('started_at')
        .get()
        .then(q => {
            const currentTrack: Partial<ITrack> = q.size && q.docs.at(0) ? {
                ...q.docs.at(0)?.data(), 
                started_at: q.docs.at(0)?.data().started_at.toDate(), 
                uid: q.docs.at(0)?.id 
            } as ITrack: {};

            if (currentTrack?.started_at && currentTrack.target_time) {
               const targetTime = DateTime.fromJSDate(currentTrack.started_at).plus(Duration.fromISO(currentTrack.target_time)).toJSDate();
               if (isBefore(new Date(), targetTime)) {
                   return currentTrack  
                } else {
                    updateTrack({
                        ...currentTrack,
                        ended_at: targetTime,
                        toConfirm: true,
                    })
                    return {}
                }  
            }
            return {}
        })
        return ref
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
        getUnfinished,
        deleteBatch,
        updateBatch,
        getRunningTrack
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