import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyALj1_8B8IrIfWh-B9oqIwn-7P_MC08dho",
  authDomain: "expense-tracker-a64d7.firebaseapp.com",
  projectId: "expense-tracker-a64d7",
  storageBucket: "expense-tracker-a64d7.firebasestorage.app",
  messagingSenderId: "629246384786",
  appId: "1:629246384786:web:0f6f1a45056c2abce2a44b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

// Inicializar messaging solo si está soportado
let messaging = null;
isSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch(err => console.log('Messaging not supported:', err));

export { messaging };