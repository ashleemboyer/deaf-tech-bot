const firebase = require("firebase/app");
require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let firebaseCache;
const getFirebase = () => {
  if (firebaseCache) {
    return firebaseCache;
  }

  firebase.initializeApp(firebaseConfig);
  firebaseCache = firebase;
  return firebaseCache;
};

const signIn = (email, password) => {
  getFirebase()
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      console.error(
        `Firebase error. Code: ${error.code}; Message: ${error.message}`
      );
    });
};

const getCurrentUser = () => {
  return getFirebase().auth().currentUser;
};

module.exports = {
  signIn,
  getCurrentUser,
};
