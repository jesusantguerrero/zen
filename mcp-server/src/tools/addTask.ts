import { z } from "zod"
import { initFirebase, requireUserUid, Timestamp } from "../firebase.js"

export const addTaskSchema = {
  title: z.string().min(1).describe("Task title"),
  matrix: z
    .enum(["todo", "schedule", "delegate", "delete", "backlog"])
    .default("backlog")
    .describe("Eisenhower quadrant. 'backlog' if unprioritized."),
  due_date: z
    .string()
    .datetime()
    .optional()
    .describe("Due date as ISO 8601 timestamp"),
  description: z.string().optional(),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tag UIDs (not names) — names resolve to UIDs via the tags collection"),
  stage: z
    .enum(["exploring", "in-dev", "in-review", "in-prod", "done"])
    .optional()
    .describe("Workflow stage. Separate from 'done' flag — a task can be 'in-prod' but not closed."),
}

export async function addTask(args: {
  title: string
  matrix: "todo" | "schedule" | "delegate" | "delete" | "backlog"
  due_date?: string
  description?: string
  tags?: string[]
  stage?: "exploring" | "in-dev" | "in-review" | "in-prod" | "done"
}) {
  const db = initFirebase()
  const uid = requireUserUid()

  const doc: Record<string, unknown> = {
    user_uid: uid,
    title: args.title,
    matrix: args.matrix,
    done: false,
    order: 0,
    checklist: [],
    tags: args.tags ?? [],
    tracks: [],
    created_at: Timestamp.now(),
  }
  if (args.due_date) doc.due_date = Timestamp.fromDate(new Date(args.due_date))
  if (args.description) doc.description = args.description
  if (args.stage) doc.stage = args.stage

  const ref = await db.collection("tasks").add(doc)
  return {
    uid: ref.id,
    ...doc,
  }
}
