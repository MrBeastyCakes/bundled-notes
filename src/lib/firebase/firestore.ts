import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type { Note, Bundle } from "@/lib/types";

// --- Bundles ---

function bundlesCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "bundles");
}

export function subscribeToBundles(
  userId: string,
  callback: (bundles: Bundle[]) => void
): Unsubscribe {
  const q = query(bundlesCollection(userId), orderBy("order", "asc"));
  return onSnapshot(q, (snapshot) => {
    const bundles = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        regionWidth: d.regionWidth ?? null,
        regionHeight: d.regionHeight ?? null,
        createdAt: d.createdAt?.toDate() || new Date(),
        updatedAt: d.updatedAt?.toDate() || new Date(),
      };
    }) as Bundle[];
    callback(bundles);
  });
}

export async function createBundle(
  userId: string,
  data: { name: string; color: string; icon: string; parentBundleId: string | null; order: number }
) {
  return addDoc(bundlesCollection(userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBundle(
  userId: string,
  bundleId: string,
  data: Partial<Pick<Bundle, "name" | "color" | "icon" | "parentBundleId" | "order">>
) {
  const ref = doc(getFirebaseDb(), "users", userId, "bundles", bundleId);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function updateBundleRegionSize(
  userId: string,
  bundleId: string,
  regionWidth: number | null,
  regionHeight: number | null
) {
  const ref = doc(getFirebaseDb(), "users", userId, "bundles", bundleId);
  return updateDoc(ref, { regionWidth, regionHeight, updatedAt: serverTimestamp() });
}

export async function deleteBundle(userId: string, bundleId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, "bundles", bundleId);
  return deleteDoc(ref);
}

// --- Notes ---

function notesCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "notes");
}

export function subscribeToNotes(
  userId: string,
  callback: (notes: Note[]) => void
): Unsubscribe {
  const q = query(notesCollection(userId), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      deletedAt: doc.data().deletedAt?.toDate() || null,
    })) as Note[];
    callback(notes);
  });
}

export async function createNote(
  userId: string,
  data: { title: string; content: string; bundleId: string | null; tags?: string[] }
) {
  return addDoc(notesCollection(userId), {
    ...data,
    tags: data.tags || [],
    pinned: false,
    favorited: false,
    archived: false,
    deleted: false,
    deletedAt: null,
    positionX: null,
    positionY: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<Pick<Note, "title" | "content" | "bundleId" | "pinned" | "tags" | "favorited" | "archived" | "deleted" | "deletedAt" | "positionX" | "positionY">>
) {
  const ref = doc(getFirebaseDb(), "users", userId, "notes", noteId);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function softDeleteNote(userId: string, noteId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, "notes", noteId);
  return updateDoc(ref, {
    deleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreNote(userId: string, noteId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, "notes", noteId);
  return updateDoc(ref, {
    deleted: false,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function permanentlyDeleteNote(userId: string, noteId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, "notes", noteId);
  return deleteDoc(ref);
}

// Keep old deleteNote for backward compatibility, now does soft delete
export async function deleteNote(userId: string, noteId: string) {
  return softDeleteNote(userId, noteId);
}

// --- Reordering ---

export async function reorderNotes(userId: string, noteIds: string[]) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  noteIds.forEach((noteId, index) => {
    const ref = doc(db, "users", userId, "notes", noteId);
    batch.update(ref, { order: index });
  });
  return batch.commit();
}

export async function reorderBundles(userId: string, bundleIds: string[]) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  bundleIds.forEach((bundleId, index) => {
    const ref = doc(db, "users", userId, "bundles", bundleId);
    batch.update(ref, { order: index });
  });
  return batch.commit();
}

export async function moveNoteToBundle(userId: string, noteId: string, bundleId: string | null) {
  const ref = doc(getFirebaseDb(), "users", userId, "notes", noteId);
  return updateDoc(ref, { bundleId, updatedAt: serverTimestamp() });
}

export async function updateNotePosition(userId: string, noteId: string, x: number, y: number) {
  const ref = doc(getFirebaseDb(), "users", userId, "notes", noteId);
  return updateDoc(ref, { positionX: x, positionY: y });
}

export async function batchUpdatePositions(
  userId: string,
  positions: Array<{ noteId: string; x: number; y: number }>
) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  positions.forEach(({ noteId, x, y }) => {
    const ref = doc(db, "users", userId, "notes", noteId);
    batch.update(ref, { positionX: x, positionY: y });
  });
  return batch.commit();
}
