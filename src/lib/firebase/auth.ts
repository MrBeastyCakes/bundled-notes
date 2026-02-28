import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./config";
import type { UserSettings } from "@/lib/types";

const googleProvider = new GoogleAuthProvider();

const defaultSettings: UserSettings = {
  theme: "dark",
  defaultBundleId: null,
};

async function ensureUserDocument(user: User) {
  const userRef = doc(getFirebaseDb(), "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || "",
      email: user.email,
      createdAt: new Date(),
      settings: defaultSettings,
    });
  }
}

export async function signUp(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await updateProfile(credential.user, { displayName });
  await ensureUserDocument(credential.user);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);
  await ensureUserDocument(credential.user);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}
