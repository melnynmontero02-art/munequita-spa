import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue, off, query, orderByChild } from "firebase/database";

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

export interface Appointment {
  id?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  channel: "wa" | "email";
  createdAt: number;
  status: "pendiente" | "confirmada" | "completada" | "cancelada";
}

export async function saveAppointment(data: Omit<Appointment, "id" | "createdAt" | "status">): Promise<void> {
  if (!isConfigured()) return;
  try {
    await push(ref(getDb(), "appointments"), {
      ...data,
      createdAt: Date.now(),
      status: "pendiente",
    });
  } catch {
    // fail silently — booking still goes through WhatsApp/email
  }
}

export function listenAppointments(cb: (list: Appointment[]) => void): () => void {
  if (!isConfigured()) { cb([]); return () => {}; }
  try {
    const dbRef = query(ref(getDb(), "appointments"), orderByChild("createdAt"));
    const handler = onValue(dbRef, (snap) => {
      if (!snap.exists()) { cb([]); return; }
      const list: Appointment[] = [];
      snap.forEach((child) => {
        list.push({ id: child.key ?? undefined, ...child.val() });
      });
      cb(list.reverse());
    });
    return () => off(dbRef, "value", handler);
  } catch {
    cb([]);
    return () => {};
  }
}
