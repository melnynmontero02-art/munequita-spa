import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue, off, update } from "firebase/database";

function isConfigured() {
  return !!(process.env.NEXT_PUBLIC_FB_API_KEY && process.env.NEXT_PUBLIC_FB_DB_URL);
}

function getDb() {
  const cfg = {
    apiKey:            process.env.NEXT_PUBLIC_FB_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
    databaseURL:       process.env.NEXT_PUBLIC_FB_DB_URL,
    projectId:         process.env.NEXT_PUBLIC_FB_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FB_APP_ID,
  };
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  return getDatabase(app);
}

export interface Review {
  id?: string;
  name: string;
  role?: string;
  rating: number;
  text: string;
  av: string;
  status: "pendiente" | "aprobada" | "rechazada";
  createdAt: number;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

export async function submitReview(data: Pick<Review, "name" | "role" | "rating" | "text">): Promise<void> {
  if (!isConfigured()) return;
  try {
    await push(ref(getDb(), "reviews"), {
      ...data,
      av: initials(data.name),
      status: "pendiente",
      createdAt: Date.now(),
    });
  } catch { }
}

export function listenApprovedReviews(cb: (reviews: Review[]) => void): () => void {
  if (!isConfigured()) { cb([]); return () => {}; }
  try {
    const dbRef = ref(getDb(), "reviews");
    const handler = onValue(dbRef, (snap) => {
      if (!snap.exists()) { cb([]); return; }
      const list: Review[] = Object.entries(snap.val())
        .map(([id, data]) => ({ id, ...(data as Omit<Review, "id">) }))
        .filter(r => r.status === "aprobada")
        .sort((a, b) => b.createdAt - a.createdAt);
      cb(list);
    });
    return () => off(dbRef, "value", handler);
  } catch { cb([]); return () => {}; }
}

export function listenAllReviews(cb: (reviews: Review[]) => void): () => void {
  if (!isConfigured()) { cb([]); return () => {}; }
  try {
    const dbRef = ref(getDb(), "reviews");
    const handler = onValue(dbRef, (snap) => {
      if (!snap.exists()) { cb([]); return; }
      const list: Review[] = Object.entries(snap.val())
        .map(([id, data]) => ({ id, ...(data as Omit<Review, "id">) }))
        .sort((a, b) => b.createdAt - a.createdAt);
      cb(list);
    });
    return () => off(dbRef, "value", handler);
  } catch { cb([]); return () => {}; }
}

export async function updateReviewStatus(id: string, status: Review["status"]): Promise<void> {
  if (!isConfigured()) return;
  try {
    await update(ref(getDb(), `reviews/${id}`), { status });
  } catch { }
}
