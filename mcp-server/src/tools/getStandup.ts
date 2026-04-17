import { z } from "zod"
import { initFirebase, requireUserUid } from "../firebase.js"

export const getStandupSchema = {
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Date in yyyy-MM-dd format. Defaults to yesterday."),
}

export async function getStandup(args: { date?: string }) {
  const db = initFirebase()
  const uid = requireUserUid()

  const targetDate = args.date ?? yesterdayISO()

  const completedSnap = await db
    .collection("tasks")
    .where("user_uid", "==", uid)
    .where("done", "==", true)
    .where("commit_date", "==", targetDate)
    .get()

  const completed = completedSnap.docs.map((d) => {
    const data = d.data()
    return {
      uid: d.id,
      title: data.title,
      matrix: data.matrix,
      tags: data.tags || [],
      stage: data.stage || null,
    }
  })

  return {
    date: targetDate,
    completed_count: completed.length,
    completed,
  }
}

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
