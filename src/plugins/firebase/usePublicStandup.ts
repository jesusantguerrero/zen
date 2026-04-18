import { db, firebaseState } from "@/plugins/useFirebase"
import firebase from "firebase/app"

export interface PublicStandupTask {
  title: string
  matrix?: string
  tags?: Array<{ uid?: string; name?: string }>
  stage?: string | null
  // 'completed' = committed/marked-done; 'in_progress' = tracked but not yet done.
  // Optional for backward compatibility with older published docs.
  status?: 'completed' | 'in_progress'
  // Which standup bucket the task belongs to. Standup = what I did yesterday + what I'm doing today.
  // Optional so pre-existing published standups without this field still render (treated as 'today').
  when?: 'yesterday' | 'today'
}

export interface PublicStandup {
  user_uid: string
  display_name: string
  date: string // yyyy-MM-dd
  tasks: PublicStandupTask[]
  published_at: firebase.firestore.Timestamp
}

const docId = (uid: string, date: string) => `${uid}_${date}`

export function usePublicStandup() {
  /**
   * Publish a snapshot of a user's standup for a given date.
   * Writes to `public_standups/{uid}_{yyyy-MM-dd}` which is world-readable.
   */
  const publishStandup = async (args: {
    date: string
    tasks: PublicStandupTask[]
    displayName?: string
  }) => {
    const user = firebaseState.user
    if (!user) throw new Error("Not authenticated")

    const data: Omit<PublicStandup, "published_at"> & {
      published_at: firebase.firestore.FieldValue
    } = {
      user_uid: user.uid,
      display_name: args.displayName || (user as any).displayName || (user as any).email || "Developer",
      date: args.date,
      tasks: args.tasks.map((t) => ({
        title: t.title,
        matrix: t.matrix || null,
        tags: t.tags || [],
        stage: t.stage || null,
        status: t.status || 'completed',
        when: t.when || 'today',
      })) as any,
      published_at: firebase.firestore.FieldValue.serverTimestamp(),
    }

    await db.collection("public_standups").doc(docId(user.uid, args.date)).set(data)
    return `/u/${user.uid}/standup/${args.date}`
  }

  /**
   * Fetch a published standup by uid + date. Works without auth.
   */
  const fetchStandup = async (uid: string, date: string): Promise<PublicStandup | null> => {
    const snap = await db.collection("public_standups").doc(docId(uid, date)).get()
    if (!snap.exists) return null
    return snap.data() as PublicStandup
  }

  const unpublishStandup = async (date: string) => {
    const user = firebaseState.user
    if (!user) throw new Error("Not authenticated")
    await db.collection("public_standups").doc(docId(user.uid, date)).delete()
  }

  return { publishStandup, fetchStandup, unpublishStandup }
}
