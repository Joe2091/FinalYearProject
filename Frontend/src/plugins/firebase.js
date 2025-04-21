import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCkddj8hG9VKlNePToJEX_Nx0aLAdMEBjs',
  authDomain: 'notemax-517d2.firebaseapp.com',
  projectId: 'notemax-517d2',
  storageBucket: 'notemax-517d2.firebasestorage.app',
  messagingSenderId: '529787128241',
  appId: '1:529787128241:web:2f2fc3836865af0ef4d590',
  measurementId: 'G-KERFTP94DV',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
