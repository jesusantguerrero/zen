
export interface NotificationSetting {
    name: string,
    label: string,
    app: boolean,
    email: boolean
}
export interface AppSettings {
    notificationsSettings: NotificationSetting[]
    [key: string]: string | any;
}

export interface SettingsApi {
    getSettings(): Promise<AppSettings>,
    updateSettings(taskForm: Partial<AppSettings>): Promise<AppSettings>,
}