import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD9aE_iXq8JryRPMEIzd8xQffkxxEh1zN8",
  authDomain: "greenpark-e3d59.firebaseapp.com",
  projectId: "greenpark-e3d59",
  storageBucket: "greenpark-e3d59.firebasestorage.app",
  messagingSenderId: "1010054133807",
  appId: "1:1010054133807:web:bec18f06079775dab62eda"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
