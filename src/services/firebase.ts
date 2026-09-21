import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';
import rawFirebaseConfig from '../../firebase-applet-config.json';
import { AppProject } from '../types/prompt';

// Support Vercel / custom environment variables with fallback to firebase-applet-config.json
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const firebaseConfig = {
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string) || rawFirebaseConfig.projectId,
  appId: (env.VITE_FIREBASE_APP_ID as string) || rawFirebaseConfig.appId,
  apiKey: (env.VITE_FIREBASE_API_KEY as string) || rawFirebaseConfig.apiKey,
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawFirebaseConfig.authDomain,
  firestoreDatabaseId: (env.VITE_FIREBASE_DATABASE_ID as string) || (rawFirebaseConfig as any).firestoreDatabaseId,
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawFirebaseConfig.storageBucket,
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawFirebaseConfig.messagingSenderId,
  measurementId: (env.VITE_FIREBASE_MEASUREMENT_ID as string) || rawFirebaseConfig.measurementId,
  oAuthClientId: (env.VITE_FIREBASE_OAUTH_CLIENT_ID as string) || rawFirebaseConfig.oAuthClientId,
  recaptchaSiteKey: (env.VITE_FIREBASE_RECAPTCHA_SITE_KEY as string) || rawFirebaseConfig.recaptchaSiteKey,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target Firestore database (supports named databases or default)
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Authentication
export const auth: Auth = getAuth(app);

export interface FirebaseConnectionStatus {
  status: 'connecting' | 'connected' | 'offline' | 'error';
  projectId: string;
  databaseId?: string;
  user: User | null;
  errorMessage?: string;
}

// Global status listener
let connectionStatus: FirebaseConnectionStatus = {
  status: 'connecting',
  projectId: firebaseConfig.projectId || '',
  databaseId: (firebaseConfig as any).firestoreDatabaseId,
  user: null,
};

const statusListeners: Set<(status: FirebaseConnectionStatus) => void> = new Set();

export function subscribeFirebaseStatus(listener: (status: FirebaseConnectionStatus) => void): () => void {
  statusListeners.add(listener);
  listener(connectionStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

function updateStatus(newStatus: Partial<FirebaseConnectionStatus>) {
  connectionStatus = { ...connectionStatus, ...newStatus };
  statusListeners.forEach(listener => listener(connectionStatus));
}

// Initial Authentication and Connection Validation
export async function initFirebaseConnection(): Promise<void> {
  try {
    // 1. Authenticate anonymously for secure Firestore access
    onAuthStateChanged(auth, (user) => {
      if (user) {
        updateStatus({ user, status: 'connected' });
      } else {
        signInAnonymously(auth).catch((err) => {
          console.warn('[Firebase Auth] Anonymous sign-in warning:', err);
        });
      }
    });

    // 2. Validate Firestore connection with getDocFromServer test
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      updateStatus({ status: 'connected' });
    } catch (testErr: any) {
      if (testErr?.message?.includes('the client is offline')) {
        console.warn('[Firebase Firestore] Client is offline, using offline cache');
        updateStatus({ status: 'offline', errorMessage: 'Firestore offline' });
      } else {
        // Document might simply not exist yet, connection is still live
        updateStatus({ status: 'connected' });
      }
    }
  } catch (err: any) {
    console.error('[Firebase Init] Error initializing connection:', err);
    updateStatus({ status: 'error', errorMessage: err?.message || 'Gagal tersambung' });
  }
}

// Projects Firestore Collection Reference
const PROJECTS_COLLECTION = 'projects';

/**
 * Real-time listener for all projects in Firestore
 */
export function subscribeProjects(
  onProjects: (projects: AppProject[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const projectsCol = collection(db, PROJECTS_COLLECTION);
    const q = query(projectsCol, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AppProject[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppProject;
          list.push({
            ...data,
            id: docSnap.id,
          });
        });
        updateStatus({ status: 'connected' });
        onProjects(list);
      },
      (error) => {
        console.warn('[Firebase Firestore] onSnapshot error:', error);
        if (error.message?.includes('the client is offline')) {
          updateStatus({ status: 'offline' });
        } else {
          updateStatus({ status: 'error', errorMessage: error.message });
        }
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('[Firebase Firestore] Failed to subscribe to projects:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save or update project in Firestore
 */
export async function saveProjectToFirestore(project: AppProject): Promise<void> {
  if (!project || !project.id) return;

  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, project.id);
    const payload = {
      ...project,
      userId: auth.currentUser?.uid || 'anonymous-user',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(projectRef, payload, { merge: true });
    updateStatus({ status: 'connected' });
  } catch (err: any) {
    console.error('[Firebase Firestore] Error saving project to Firestore:', err);
    throw err;
  }
}

/**
 * Delete project from Firestore
 */
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  if (!projectId) return;

  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(projectRef);
    updateStatus({ status: 'connected' });
  } catch (err: any) {
    console.error('[Firebase Firestore] Error deleting project from Firestore:', err);
    throw err;
  }
}
