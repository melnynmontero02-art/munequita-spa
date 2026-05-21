import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get, set, push, onValue, off, update } from "firebase/database";

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

export interface Client {
  code: string;
  name: string;
  phone?: string;
  plan: string;
  sessionsTotal: number;
  sessionsUsed: number;
  status: "activo" | "pausado" | "cancelado";
  startDate: string;
  createdAt: number;
}

export interface PlanRequest {
  id?: string;
  clientCode: string;
  clientName: string;
  type: "cancelar" | "cambiar";
  newPlan?: string;
  status: "pendiente" | "procesado";
  createdAt: number;
}

export async function getClient(code: string): Promise<Client | null> {
  if (!isConfigured()) return null;
  try {
    const snap = await get(ref(getDb(), `clients/${code}`));
    if (!snap.exists()) return null;
    return { code, ...snap.val() } as Client;
  } catch { return null; }
}

export async function createClient(client: Omit<Client, "createdAt">): Promise<void> {
  if (!isConfigured()) return;
  try {
    const { code, ...data } = client;
    await set(ref(getDb(), `clients/${code}`), { ...data, createdAt: Date.now() });
  } catch { }
}

export async function updateClient(code: string, updates: Partial<Omit<Client, "code" | "createdAt">>): Promise<void> {
  if (!isConfigured()) return;
  try {
    await update(ref(getDb(), `clients/${code}`), updates);
  } catch { }
}

export function listenClients(cb: (clients: Client[]) => void): () => void {
  if (!isConfigured()) { cb([]); return () => {}; }
  try {
    const dbRef = ref(getDb(), "clients");
    const handler = onValue(dbRef, (snap) => {
      if (!snap.exists()) { cb([]); return; }
      const list: Client[] = Object.entries(snap.val()).map(
        ([code, data]) => ({ code, ...(data as Omit<Client, "code">) })
      );
      list.sort((a, b) => b.createdAt - a.createdAt);
      cb(list);
    });
    return () => off(dbRef, "value", handler);
  } catch { cb([]); return () => {}; }
}

export async function submitPlanRequest(req: Omit<PlanRequest, "id" | "createdAt" | "status">): Promise<void> {
  if (!isConfigured()) return;
  try {
    await push(ref(getDb(), "planRequests"), { ...req, status: "pendiente", createdAt: Date.now() });
  } catch { }
}

export function listenPlanRequests(cb: (requests: PlanRequest[]) => void): () => void {
  if (!isConfigured()) { cb([]); return () => {}; }
  try {
    const dbRef = ref(getDb(), "planRequests");
    const handler = onValue(dbRef, (snap) => {
      if (!snap.exists()) { cb([]); return; }
      const list: PlanRequest[] = Object.entries(snap.val()).map(
        ([id, data]) => ({ id, ...(data as Omit<PlanRequest, "id">) })
      );
      list.sort((a, b) => b.createdAt - a.createdAt);
      cb(list);
    });
    return () => off(dbRef, "value", handler);
  } catch { cb([]); return () => {}; }
}

export async function processPlanRequest(
  id: string,
  meta: { clientCode: string; type: "cancelar" | "cambiar"; newPlan?: string }
): Promise<void> {
  if (!isConfigured()) return;
  try {
    await update(ref(getDb(), `planRequests/${id}`), { status: "procesado" });
    if (meta.type === "cancelar") {
      await update(ref(getDb(), `clients/${meta.clientCode}`), { status: "cancelado" });
    } else if (meta.type === "cambiar" && meta.newPlan) {
      await update(ref(getDb(), `clients/${meta.clientCode}`), { plan: meta.newPlan });
    }
  } catch { }
}
