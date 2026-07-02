import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Detect if we are in the Google AI Studio sandbox/preview environment
const isAiStudio = typeof window !== 'undefined' && (
  window.location.hostname.includes('run.app') || 
  window.location.hostname.includes('localhost') || 
  window.location.hostname.includes('127.0.0.1')
);

// Use the custom sandbox database ID only in AI Studio, otherwise default to the standard production (default) database
const databaseId = isAiStudio ? firebaseConfig.firestoreDatabaseId : undefined;

export const db = getFirestore(app, databaseId);
export const auth = getAuth();

// Validate connection to Firestore as requested by the Firebase skill guide
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    } else {
      console.warn("Initial Firestore ping completed (expected result if document doesn't exist).");
    }
  }
}
testConnection();
