import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get, set, onValue, off } from "firebase/database";

// ─── Firebase init (only once) ───────────────────────────────────────────────

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

// ─── Slot definitions ────────────────────────────────────────────────────────

const WEEKDAY = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
const WEEKEND = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00"];

export function slotsForDate(date: Date): string[] {
  const d = date.getDay();
  return d === 0 || d === 6 ? WEEKEND : WEEKDAY;
}

// ─── Read booked slots once ──────────────────────────────────────────────────

export async function fetchBooked(dateStr: string): Promise<Set<string>> {
  try {
    const snap = await get(ref(getDb(), `bookings/${dateStr}`));
    if (!snap.exists()) return new Set();
    return new Set(Object.keys(snap.val()));
  } catch {
    return new Set();
  }
}

// ─── Real-time listener ──────────────────────────────────────────────────────

export function listenBooked(
  dateStr: string,
  cb: (booked: Set<string>) => void
): () => void {
  const dbRef = ref(getDb(), `bookings/${dateStr}`);
  const handler = onValue(dbRef, (snap) => {
    cb(snap.exists() ? new Set(Object.keys(snap.val())) : new Set());
  });
  return () => off(dbRef, "value", handler);
}

// ─── Write a booked slot ─────────────────────────────────────────────────────

export async function bookSlot(dateStr: string, time: string): Promise<void> {
  // key: "09:00" → "09-00"  (Firebase keys can't contain colons)
  const key = time.replace(":", "-");
  await set(ref(getDb(), `bookings/${dateStr}/${key}`), true);
}
