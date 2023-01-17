import { ref} from "vue";
import { updateSettings, firebaseInstance } from "./useFirebase"
const serverPK = import.meta.VITE_PUSH_PK;

const messaging = firebaseInstance.messaging()

export function usePush() {
    const swRegistration = ref(null)
    const isSubscribed = ref(false);
    const subscriptionJson = ref(false);
    const updateSubscriptionOnServer = (subscription) => {
      if (subscription) {
        subscriptionJson.value = subscription;
      } else {
        subscriptionJson.value = null
      }
      isSubscribed.value = Boolean(subscriptionJson.value);

      updateSettings({
          pushSubscription: subscriptionJson.value
      })
    }
    
    const subscribeUserToPush = async () => {
        messaging.getToken({ vapidKey: serverPK}).then((currentToken) => {
          if (currentToken) {
            updateSubscriptionOnServer(currentToken);
          }
        })
    }

    return {
        isSubscribed,        
        subscribeUserToPush
    }
}
