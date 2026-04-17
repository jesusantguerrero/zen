import { z } from "zod"
import { initFirebase, requireUserUid } from "../firebase.js"

export const completeTaskSchema = {
  task_uid: z.string().describe("Firestore doc ID of the task"),
}

export async function completeTask(args: { task_uid: string }) {
  const db = initFirebase()
  const uid = requireUserUid()

  const ref = db.collection("tasks").doc(args.task_uid)
  const snap = await ref.get()
  if (!snap.exists) throw new Error(`Task ${args.task_uid} not found`)
  const data = snap.data()!
  if (data.user_uid !== uid) throw new Error("Task belongs to another user")

  const today = new Date().toISOString().slice(0, 10) // yyyy-MM-dd
  await ref.update({
    done: true,
    commit_date: today,
  })
  return { uid: args.task_uid, done: true, commit_date: today }
}
