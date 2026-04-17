import { cert, initializeApp, applicationDefault } from "firebase-admin/app"
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore"

let firestore: Firestore | null = null

export function initFirebase(): Firestore {
  if (firestore) return firestore

  const serviceAccountPath = process.env.ZEN_SERVICE_ACCOUNT_PATH
  const projectId = process.env.ZEN_FIREBASE_PROJECT_ID

  if (serviceAccountPath) {
    initializeApp({
      credential: cert(serviceAccountPath),
      projectId,
    })
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var
    initializeApp({
      credential: applicationDefault(),
      projectId,
    })
  }

  firestore = getFirestore()
  return firestore
}

export function requireUserUid(): string {
  const uid = process.env.ZEN_USER_UID
  if (!uid) {
    throw new Error(
      "ZEN_USER_UID env var is required. The MCP server operates on behalf of a single Zen user — set their Firebase Auth UID."
    )
  }
  return uid
}

export { Timestamp }
