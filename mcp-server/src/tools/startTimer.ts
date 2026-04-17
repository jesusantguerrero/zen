import { z } from "zod"
import { initFirebase, requireUserUid, Timestamp } from "../firebase.js"

export const startTimerSchema = {
  task_uid: z.string().describe("Task to track time against"),
  description: z.string().optional().describe("Optional override for the track description"),
}

export async function startTimer(args: { task_uid: string; description?: string }) {
  const db = initFirebase()
  const uid = requireUserUid()

  const taskRef = db.collection("tasks").doc(args.task_uid)
  const taskSnap = await taskRef.get()
  if (!taskSnap.exists) throw new Error(`Task ${args.task_uid} not found`)
  const task = taskSnap.data()!
  if (task.user_uid !== uid) throw new Error("Task belongs to another user")

  // Stop any running track first (ended_at == null)
  const running = await db
    .collection("tracks")
    .where("user_uid", "==", uid)
    .where("ended_at", "==", null)
    .get()
  const now = Timestamp.now()
  for (const doc of running.docs) {
    const started = doc.data().started_at as FirebaseFirestore.Timestamp | undefined
    const duration_ms = started ? now.toMillis() - started.toMillis() : 0
    await doc.ref.update({ ended_at: now, duration_ms })
  }

  const trackRef = await db.collection("tracks").add({
    user_uid: uid,
    task_uid: args.task_uid,
    description: args.description ?? task.title,
    started_at: now,
    ended_at: null,
    duration_ms: 0,
    created_at: now,
  })

  return { uid: trackRef.id, task_uid: args.task_uid, started_at: now.toDate().toISOString() }
}
