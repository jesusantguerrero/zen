import { ref} from "vue";
import { updateSettings } from "./useFirebase"
const serverPK = import.meta.VITE_PUSH_PK;

export function usePush() {
    const urlB64ToUint8Array = (base64String) => {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
    
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
    const swRegistration = ref(null)
    const isSubscribed = ref(false);
    const subscriptionJson = ref(false);
    const updateSubscriptionOnServer = (subscription) => {
      // TODO: Send subscription to application server
      if (subscription) {
        subscriptionJson.value = JSON.stringify(subscription);
      } else {
        subscriptionJson.value = null
      }

      updateSettings({
          pushSubscription: subscriptionJson.value
      })
    }
    
    const subscribeUser = () => {
      const applicationServerKey = urlB64ToUint8Array(serverPK);
      swRegistration.value.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })
      .then((subscription) => {
        updateSubscriptionOnServer(subscription);
        isSubscribed.value = true;
      })
    }
    
    const subscribeUserToPush = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        swRegistration.value = await navigator.serviceWorker.register('sw.js')
        swRegistration.value.pushManager.getSubscription().then((subscription)=> {
          if (!subscription) {
            subscribeUser();
          } else {
              updateSubscriptionOnServer(subscription)
          }
    
        })
      }
    }

    return {
        swRegistration,
        isSubscribed,
        subscriptionJson,
        subscribeUserToPush
    }
}
