'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export type FirebaseInstance = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseInstance: FirebaseInstance | null = null;

export function initializeFirebase(): FirebaseInstance {
  if (firebaseInstance) return firebaseInstance;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseInstance = { app, auth, firestore };
  return firebaseInstance;
}
