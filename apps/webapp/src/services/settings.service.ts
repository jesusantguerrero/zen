import { SettingsApi, AppSettings } from '@/domain/settings/types/settingsApi';
import { firebaseState, updateSettings } from "@/plugins/useFirebase";

export class settingsService implements SettingsApi {
    getSettings(): Promise<AppSettings> {
        return new Promise((resolve) => {
            resolve(firebaseState.settings)
        });    
    }

    async updateSettings(settingsForm: Partial<AppSettings>): Promise<AppSettings> {
        return await updateSettings(settingsForm)
        .then(() => {
            return settingsForm;
        });
    }
}

export const api = new settingsService(); 