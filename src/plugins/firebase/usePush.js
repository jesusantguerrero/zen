import { ref } from "vue"
import { updateSettings, firebaseInstance, firebaseState } from "../useFirebase"

const VAPID_KEY = import.meta.env.VITE_PUSH_PK

export function usePush() {
    const isRequesting = ref(false)

    // "default" = not asked yet; "granted" / "denied" = user's decision
    const permission = ref(typeof Notification !== "undefined" ? Notification.permission : "unsupported")

    // Reflects Firestore user_settings.pushSubscription
    const isSubscribed = ref(Boolean(firebaseState?.settings?.pushSubscription))

    const isSupported = () => {
        if (typeof Notification === "undefined") return false
        if (!("serviceWorker" in navigator)) return false
        return true
    }

    const subscribe = async () => {
        if (!isSupported()) {
            throw new Error("Desktop notifications are not supported in this browser.")
        }
        if (!VAPID_KEY) {
            throw new Error(
                "VITE_PUSH_PK (VAPID public key) is not configured. Set it in .env.local before enabling desktop notifications."
            )
        }

        isRequesting.value = true
        try {
            const result = await Notification.requestPermission()
            permission.value = result
            if (result !== "granted") {
                return { granted: false }
            }

            const messaging = firebaseInstance.messaging()
            const token = await messaging.getToken({ vapidKey: VAPID_KEY })
            if (!token) {
                return { granted: true, token: null }
            }

            await updateSettings({ pushSubscription: token })
            isSubscribed.value = true
            return { granted: true, token }
        } finally {
            isRequesting.value = false
        }
    }

    const unsubscribe = async () => {
        await updateSettings({ pushSubscription: null })
        isSubscribed.value = false
    }

    return {
        permission,
        isSupported,
        isRequesting,
        isSubscribed,
        subscribe,
        unsubscribe,
    }
}
