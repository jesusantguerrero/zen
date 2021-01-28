import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
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
    return firebase.auth().createUserWithEmailAndPassword(email, password).catch(reason => {
        throw new Error(reason.message);
    })
}

export const login = async (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password).catch((reason) => {
        throw new Error(reason.message);
    })
}

export const logout = () => {
    return firebase.auth().signOut()
}

export const db = firebase.firestore();

firebase.auth().onAuthStateChanged((user) => {
    firebaseState.user = user;
    onLoaded.value && onLoaded.value()
})

