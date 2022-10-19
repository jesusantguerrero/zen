import config from "../../config";

export const connectGoogle = async (callback) => {
    return gapi.load("auth2", () => {
        return gapi.auth2
            .init({
                apiKey: config.GOOGLE_APP_KEY,
                clientId: config.GOOGLE_APP_CLIENT,
                accessType: "offline",
                scope: `profile https://www.googleapis.com/auth/calendar.readonly`,
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    "https://sheets.googleapis.com/discovery/rest?version=v4"
                ]
            })
            .then(async () => {
                const authInstance = gapi.auth2.getAuthInstance();
                const user = authInstance.currentUser.get();
                if (!user.getAuthResponse().session_state) {
                    await authInstance.signIn();
                }
                const profile = user.getBasicProfile();
                return await authInstance
                    .grantOfflineAccess({
                        authuser: user.getAuthResponse().session_state.extraQueryParams.authuser
                    })
                    .then(({ code }) => {
                        const credentials = {
                            code,
                            user: profile.getEmail()
                        };
                        callback(credentials);
                    })
            })
    });
}