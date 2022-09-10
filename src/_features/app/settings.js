import { computed, ref } from "vue"
import { useSettingsFirestore } from "./useSettingsFirestore"
import { defineStore } from 'pinia'
import { firebaseState } from "./useFirebase"
const { getUserSettings, updateUserSettings } = useSettingsFirestore()

export const useApplicationStore = defineStore('application', () => {
    const settings = ref(firebaseState.settings)

    const fetchSettings = async () => {
        settings.value = await getUserSettings(firebaseState.user)
    }

    const getSettings = () => {
        if (Object.keys(settings.value).length === 0) {
            fetchSettings()
        }
        return settings
    }

    const isSettingsLoaded = computed(() => Object.keys(settings.value).length > 0)

    return {
        getSettings,
        isSettingsLoaded,
        updateSettings: async (setting) => {
            await updateUserSettings(setting)
            settings.value = setting
        },
        settings
    }
})