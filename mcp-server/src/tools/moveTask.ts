import { z } from "zod"
import { initFirebase, requireUserUid } from "../firebase.js"

export const moveTaskSchema = {
  task_uid: z.string().describe("Firestore doc ID of the task"),
  matrix: z
    .enum(["todo", "schedule", "delegate", "delete", "backlog"])
    .describe("Target Eisenhower quadrant"),
}

export async function moveTask(args: {
  task_uid: string
  matrix: "todo" | "schedule" | "delegate" | "delete" | "backlog"
}) {
  const db = initFirebase()
  const uid = requireUserUid()

  const ref = db.collection("tasks").doc(args.task_uid)
  const snap = await ref.get()
  if (!snap.exists) throw new Error(`Task ${args.task_uid} not found`)
  const data = snap.data()!
  if (data.user_uid !== uid) throw new Error("Task belongs to another user")

  await ref.update({ matrix: args.matrix })
  return { uid: args.task_uid, matrix: args.matrix }
}
