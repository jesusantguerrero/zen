import { db, firebaseState } from "@/plugins/useFirebase"

export interface IProject {
  uid: string
  user_uid: string
  name: string
  color: string // hex like #00DC82
  schedule?: { days: number[] } | null // 0=Sunday..6=Saturday
  archived?: boolean
  created_at?: any
}

const collectionName = "projects"

export function useProjectsFirestore() {
  const createProject = async (data: Partial<IProject>) => {
    if (!firebaseState.user) throw new Error("Not authenticated")
    const doc: Partial<IProject> = {
      user_uid: firebaseState.user.uid,
      name: (data.name || "").trim() || "Untitled project",
      color: data.color || "#00DC82",
      schedule: data.schedule ?? null,
      archived: false,
      created_at: new Date(),
    }
    const ref = await db.collection(collectionName).add(doc)
    return { ...doc, uid: ref.id } as IProject
  }

  const updateProject = async (uid: string, patch: Partial<IProject>) => {
    return db.collection(collectionName).doc(uid).update(patch as any)
  }

  const deleteProject = async (uid: string) => {
    return db.collection(collectionName).doc(uid).delete()
  }

  const listProjects = () => {
    // Sort client-side — avoids requiring a composite Firestore index for
    // (user_uid + name). A user's project count is small.
    return db
      .collection(collectionName)
      .where("user_uid", "==", firebaseState.user?.uid)
  }

  return {
    createProject,
    updateProject,
    deleteProject,
    listProjects,
  }
}

export const PROJECT_COLORS = [
  "#00DC82", // accent
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#6B7280", // gray
]

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", short: "S" },
  { value: 1, label: "Mon", short: "M" },
  { value: 2, label: "Tue", short: "T" },
  { value: 3, label: "Wed", short: "W" },
  { value: 4, label: "Thu", short: "T" },
  { value: 5, label: "Fri", short: "F" },
  { value: 6, label: "Sat", short: "S" },
]

export const isScheduledForToday = (project: IProject, now = new Date()): boolean => {
  const days = project?.schedule?.days
  if (!days || !days.length) return false
  return days.includes(now.getDay())
}
