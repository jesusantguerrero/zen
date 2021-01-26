import firebase from "firebase/app";
import "firebase/auth";
import CONFIG from "../config/";

import { ref, reactive } from "vue";

const firebaseConfig = {
  apiKey: CONFIG.FIREBASE_API_KEY,
  authDomain: `${CONFIG.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${CONFIG.FIREBASE_PROJECT_ID}.firebaseio.com`,
  projectId: CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: `${CONFIG.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: CONFIG.FIREBASE_SENDER_ID,
  appId: CONFIG.FIREBASE_APP_ID,
}

firebase.initializeApp(firebaseConfig)

const onLoaded = ref(null)

export const setLoaded = (loadedCallback) => {
  onLoaded.value = loadedCallback   
}

export const firebaseState = reactive({
    user: null,
    uid: null
})

export const register = async (email, password) => {
    await firebase.auth().createUserWithEmailAndPassword(email, password).catch((e) => {
        console.log(e)
    })
}

export const login = async (email, password) => {
    await firebase.auth().signInWithEmailAndPassword(email, password).catch((e) => {
        console.log(e)
    })
}

export const logout = () => {
    firebase.auth().signOut()
    .then(() => {
        debugger

    }).catch((e) => {
        debugger
        console.log(e)
    })
}

firebase.auth().onAuthStateChanged((user) => {
    firebaseState.user = user;
    onLoaded.value && onLoaded.value()
})

