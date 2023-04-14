// @ts-ignore
import { DateTime } from "luxon";
import { db, firebaseState, functions } from "./useFirebase";
import { nextTick } from "vue";
import { startOfDay, subDays } from "date-fns";
const collectionName = "tasks";


export interface ITask {
    uid: string; 
    user_uid: string;
    title: string;
    created_at: Date;
    order: number;
    due_date: Date;
    matrix: string;
    tracks: any[];
    tags: any[];
    duration_ms?: number;
    checklist: any[];
}

const getDate = (task: ITask) => {
    // return task.due_date instanceof Date ? formatDate(task.due_date, "yyyy-MM-dd") : task.due_date;
    return task.due_date instanceof Date ? task.due_date : DateTime.fromISO(task.due_date).toJSDate();
}

export function useTaskFirestore() {
    const saveTask = (task: ITask) => {
        if (task.due_date) {
            task.due_date = getDate(task)
        }
        return db.collection(collectionName, taskConverter.toFirestore(task))
        .add({
            ...task,
            user_uid: firebaseState.user?.uid,
            created_at: new Date()
        })
        .then((docRef) => {
            const taskUid = docRef.id;
            task.uid = taskUid
            runRecurrence(task)
            return taskUid;
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const updateTask = (task) => {
        const trackRef = db.collection(collectionName).doc(task.uid)
        if (task.due_date) {
            task.due_date = getDate(task)
        }
        if (!task.order || task.order < 0) {
            task.order = 0
        }
        return trackRef
        .update(taskConverter.toFirestore(task), { merge: true })
        .then(() => {
            runRecurrence(task)
            return task.uid;
        })
    
    }

    const saveTaskBatch = (tasks, uniqueKey = 'source_id') => {
        const batch = db.batch()
        tasks.forEach((task) => {
            const key = firebaseState.user.uid + '-' + task[uniqueKey]
            if (task.due_date) {
                task.due_date = getDate(task)
            }
            const formData = {
                ...task,
                done: false,
                user_uid: firebaseState.user.uid,
                created_at: new Date()
            }
            db.collection(collectionName).doc(key).set(formData, { merge: true })
        })
        return batch.commit().then(() => {
            return
        })
    }
    const updateTaskBatch = (tasks) => {
        const batch = db.batch()
        tasks.forEach((task) => {
            const trackRef = db.collection(collectionName)
            .withConverter(taskConverter)
            .doc(task.uid)
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
        await db.collection(collectionName).where("user_uid", "==", firebaseState.user.uid)
        .withConverter(taskConverter)
        .get().then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                tasks.push({...doc.data(), uid: doc.id });
            });
        })

        return tasks;
    }

    const getCommittedTasks = async (toDate = new Date(), fromDate?: Date) => {
        const commitDateStart = DateTime.fromJSDate(fromDate|| subDays(startOfDay(new Date()), 1)).toFormat('yyyy-MM-dd')
        const commitDateEnd = DateTime.fromJSDate(toDate).toFormat('yyyy-MM-dd')

        const committedRef = await db.collection(collectionName)
        .where("user_uid", "==", firebaseState?.user?.uid)
        .where("done", "==", true)
        .where("commit_date", ">=", commitDateStart)
        .where("commit_date", "<=", commitDateEnd)
        .withConverter(taskConverter)

        return committedRef
    }

    const getUncommittedTasks = (userUuid) => {
        const uncommittedRef = db.collection(collectionName)
        .where("user_uid", "==", userUuid || firebaseState?.user?.uid)
        .where("done", "==", false)
        .orderBy("order")
        .withConverter(taskConverter)
    
        return uncommittedRef
    }

    const getTaskByMatrix = async (matrix) => {
        const matrixRef = db.collection(collectionName)
            .where("user_uid", "==", firebaseState.user.uid)
            .where("done", "==", false)
            .where("matrix", "==", matrix)
            .withConverter(taskConverter)
            .orderBy("order")
            
        return matrixRef
    }

    const getTaskByType = async (type) => {
        const tasks = db.collection(collectionName)
            .where("user_uid", "==", firebaseState.user.uid)
            .where("type", "==", type)
            .withConverter(taskConverter)
            
        return tasks
    }

    const taskConverter = {
        fromFirestore(snapshot: firebase.default.firestore.DocumentSnapshot, options) {
            const data = snapshot.data(options);
            return { 
                ...data, 
                due_date: !data?.due_date ? null : 
                data.due_date.toDate ? data.due_date.toDate() : data.due_date, 
                checklist: data?.checklist.map((item: Record<string, any>) => ({
                    ...item,
                    created_at: item.created_at?.toDate(), 
                    updated_at: item.update_at?.toDate() 
                }))
            };
        },
        toFirestore(data: ITask) {
            return {
                ...data,
                checklist: data.checklist?.map((item: Record<string, any>) => ({
                    ...item ?? [],
                    created_at: item.created_at ?? new Date(),
                    updated_at: item.updated_at ?? new Date()
                })) ?? [],
            }
        }
    }

    const runRecurrence = (task: ITask) => {
        nextTick(() => {
            try {
                // const setReminder = functions.httpsCallable('setRecurrence');
                // setReminder(task);
            } catch (err) {
                console.log(err, "HEre is the error")
            }
        })
    }

    const getMatrix = (matrixName: string, callback: Function) => {
        getTaskByMatrix(matrixName).then((collectionRef) => {
          const unsubscribe = collectionRef.onSnapshot((snap) => {
            const list: ITask[] = [];
            snap.forEach((doc) => {
              list.push({ ...doc.data(), uid: doc.id });
            });
            callback(list)
          });
      
          return unsubscribe;
        });
    };

    return {
        saveTask,
        updateTask,
        updateTaskBatch,
        deleteTask,
        getTaskByMatrix,
        getTaskByType,
        getUncommittedTasks,
        getCommittedTasks,
        getAllFromUser,
        saveTaskBatch,
        getMatrix,
    }
}