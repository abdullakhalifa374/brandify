import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGixuiWWnqk7fumb3Obq1IPq1qomxcG6M",
  authDomain: "brandify-zone.firebaseapp.com",
  projectId: "brandify-zone",
  storageBucket: "brandify-zone.firebasestorage.app",
  messagingSenderId: "839250062717",
  appId: "1:839250062717:web:68ecb5f479e9a5352f3014",
  measurementId: "G-5F4H1LJQDW",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
