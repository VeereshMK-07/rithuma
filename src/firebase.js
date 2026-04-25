// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIQ_zv247BMOfRosyYAByjr6AT5QdD9wI",
  authDomain: "rithuma-app.firebaseapp.com",
  projectId: "rithuma-app",
  storageBucket: "rithuma-app.firebasestorage.app",
  messagingSenderId: "590671945485",
  appId: "1:590671945485:web:37dbb7b7a7318397ef9a44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);