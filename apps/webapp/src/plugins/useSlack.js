import axios from "axios";
import { firebaseState } from "./useFirebase"

export function useSlack() {
   
  const setStatus = (text, emoji) => {
    if (!firebaseState.settings.slack) {
      return
    }
    
    const data = {
      "status_text": text,
      "status_emoji": emoji,
      "token": "xoxp-461198650023-461198650599-1770384943251-0734b76963f3b01e0443bb5356d76b65",
      user_id: firebaseState.settings.slack.user_id
    }
    const formData = new FormData();
    Object.entries(data).forEach(([field, value]) => {
      formData.append(field, value)
    })
    axios.post("https://slack.com/api/users.profile.set", formData)
  }

  return {
    setStatus
  }
}
