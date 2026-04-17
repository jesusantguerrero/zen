import { z } from "zod"
import { initFirebase, requireUserUid, Timestamp } from "../firebase.js"

export const getMetricsSchema = {
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Inclusive start date, yyyy-MM-dd"),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Inclusive end date, yyyy-MM-dd"),
}

export async function getMetrics(args: { from: string; to: string }) {
  const db = initFirebase()
  const uid = requireUserUid()

  const startTs = Timestamp.fromDate(new Date(`${args.from}T00:00:00`))
  const endTs = Timestamp.fromDate(new Date(`${args.to}T23:59:59`))

  const [tracksSnap, completedSnap] = await Promise.all([
    db
      .collection("tracks")
      .where("user_uid", "==", uid)
      .where("started_at", ">=", startTs)
      .where("started_at", "<=", endTs)
      .get(),
    db
      .collection("tasks")
      .where("user_uid", "==", uid)
      .where("done", "==", true)
      .where("commit_date", ">=", args.from)
      .where("commit_date", "<=", args.to)
      .get(),
  ])

  const tracks = tracksSnap.docs.map((d) => d.data())
  const started = tracks.length
  const finished = tracks.filter((t) => t.completed).length
  const totalMs = tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0)

  return {
    from: args.from,
    to: args.to,
    tasks_completed: completedSnap.size,
    pomodoros_started: started,
    pomodoros_finished: finished,
    completion_rate:
      started > 0 ? Math.round((finished / started) * 100) : 0,
    total_focus_ms: totalMs,
    total_focus_hours: Number((totalMs / 1000 / 60 / 60).toFixed(2)),
  }
}
