import { ref, reactive } from "vue";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/analytics";
import "firebase/messaging";
import "firebase/functions"
import "firebase/performance"
import "firebase/storage"
import "firebase/app-check"
import CONFIG from "../config/";
import { useSettingsFirestore } from "./useSettingsFirestore"
import { add } from "date-fns";

const { getUserSettings, updateUserSettings } = useSettingsFirestore()
const firebaseConfig = {
    apiKey: CONFIG.FIREBASE_API_KEY,
    authDomain: `${CONFIG.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${CONFIG.FIREBASE_PROJECT_ID}.firebaseio.com`,
    projectId: CONFIG.FIREBASE_PROJECT_ID,
    storageBucket: `${CONFIG.FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: CONFIG.FIREBASE_SENDER_ID,
    measurementId: CONFIG.MEASUREMENT_ID,
    appId: CONFIG.FIREBASE_APP_ID,
}

firebase.initializeApp(firebaseConfig)
firebase.performance()
firebase.analytics()
const appCheck = firebase.appCheck();
// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
appCheck.activate('6Lcwaz4lAAAAAPn4-MHWd-a86wvu6XLeT_qL62SM', true);

const onLoaded = ref(null)

export const setLoaded = (loadedCallback) => {
  onLoaded.value = loadedCallback   
}

export const firebaseState = reactive({
    user: null,
    uid: null,
    settings: {}
})

export const register = async (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password).catch(reason => {
        throw new Error(reason.message);
    })
}

export const login = async (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password).catch((reason) => {
        throw new Error(reason.message);
    })
}

export const loginWithProvider = async(providerName) => {
    // await firebase.auth().signInWithRedirect(getProvider(providerName))
    // location.reload();

    firebase.auth().signInWithPopup(getProvider(providerName)).then(() => {
        location.reload()
    })
}

const getProvider = (providerName) => {
    const providers = {
        google: {
            method: new firebase.auth.GoogleAuthProvider,
            scopes: ['profile', 'email']
        },
        github: {
            method: new firebase.auth.GithubAuthProvider,
            scopes: ['repo', 'read:user', 'user:email']
        }
    }
    const providerData = providers[providerName]
    if (providerData) {
        const provider = providerData.method;
        providerData.scopes.forEach(() => {
            provider.addScope('profile');
            provider.addScope('email');
        })
        return provider;
    }
}

export const logout = () => {
    return firebase.auth().signOut()
}

// Database
export const db = firebase.firestore();
export const updateSettings = (settings) => {
    return updateUserSettings({
        user_uid: firebaseState.user.uid,
        uid: firebaseState.user.uid,
        ...settings
    }).then(() => {
        firebaseState.settings =  Object.assign(firebaseState.settings || {}, settings)
    })

}

const initFirebase = new Promise(resolve => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const settings = await getUserSettings(user.uid)
            firebaseState.settings = settings;
            firebaseState.user = user;
            onLoaded.value && onLoaded.value()
        }
        resolve(user);
    })
})

export const firebaseInstance = firebase;

export const isAuthenticated = () => {
    return initFirebase;
}

export const registerEvent = (eventName, params) => {
    firebase.analytics().logEvent(eventName, {...params, screen, user_id: firebaseState.uid }); 
}

export const setScreen = (screenName) => {
    firebase.analytics().setCurrentScreen(screenName) 
    console.log("navegating") 
}

export const functions = firebaseInstance.functions()
if (import.meta.env.DEV) {
    // functions.useEmulator("localhost", 5001);
}
