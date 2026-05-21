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

export function addOneMonth(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  plan: string;
  status: "pendiente" | "activo" | "pausado" | "cancelado";
  cancellationReason?: "falta_de_pago" | "solicitud_cliente" | "otro";
  startDate: string;
  renewalDate: string;
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
  const dbRef = ref(getDb(), "clients");
  const unsub = onValue(dbRef, (snap) => {
    if (!snap.exists()) { cb([]); return; }
    const list: Client[] = Object.entries(snap.val()).map(
      ([code, data]) => ({ code, ...(data as Omit<Client, "code">) })
    );
    list.sort((a, b) => b.createdAt - a.createdAt);
    cb(list);
  });
  return unsub;
}

// ─── Plan requests ────────────────────────────────────────────────────────────
// type "nueva_suscripcion" = new membership request from public form
// type "cancelar" | "cambiar"  = change request from existing client

export interface PlanRequest {
  id?: string;
  clientCode: string;
  clientName: string;
  type: "cancelar" | "cambiar" | "nueva_suscripcion";
  newPlan?: string;
  phone?: string;
  email?: string;
  status: "pendiente" | "procesado";
  generatedCode?: string;
  createdAt: number;
}

export async function submitPlanRequest(req: Omit<PlanRequest, "id" | "createdAt" | "status">): Promise<void> {
  if (!isConfigured()) return;
  try {
    await push(ref(getDb(), "planRequests"), { ...req, status: "pendiente", createdAt: Date.now() });
  } catch { }
}

// Single listener — admin page derives memRequests and changeRequests from this
export function listenPlanRequests(cb: (requests: PlanRequest[]) => void): () => void {
  if (!isConfigured()) { cb([]); return () => {}; }
  const dbRef = ref(getDb(), "planRequests");
  const unsub = onValue(dbRef, (snap) => {
    if (!snap.exists()) { cb([]); return; }
    const list: PlanRequest[] = Object.entries(snap.val()).map(
      ([id, data]) => ({ id, ...(data as Omit<PlanRequest, "id">) })
    );
    list.sort((a, b) => b.createdAt - a.createdAt);
    cb(list);
  });
  return unsub;
}

export async function processPlanRequest(
  id: string,
  meta: { clientCode: string; type: PlanRequest["type"]; newPlan?: string }
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

// ─── New membership request (public form) ─────────────────────────────────────

export type MembershipRequestResult =
  | { ok: true }
  | { ok: false; reason: "duplicate_phone" | "duplicate_email" | "error" };

export async function submitMembershipRequest(data: {
  name: string; phone?: string; email?: string; plan: string;
}): Promise<MembershipRequestResult> {
  if (!isConfigured()) return { ok: false, reason: "error" };

  const phone = data.phone?.trim() || null;
  const email = data.email?.trim().toLowerCase() || null;

  // Duplicate check against existing clients (best-effort)
  try {
    const snap = await get(ref(getDb(), "clients"));
    if (snap.exists()) {
      const entries = Object.values(snap.val()) as Client[];
      if (phone && entries.find(c => c.phone?.trim() === phone))
        return { ok: false, reason: "duplicate_phone" };
      if (email && entries.find(c => c.email?.trim().toLowerCase() === email))
        return { ok: false, reason: "duplicate_email" };
    }
  } catch { /* skip if read fails */ }

  try {
    const code = "MQ-" + String(Math.floor(1000 + Math.random() * 9000));
    const today = new Date().toISOString().slice(0, 10);
    await set(ref(getDb(), `clients/${code}`), {
      name: data.name.trim(),
      phone,
      email,
      plan: data.plan,
      status: "pendiente",
      startDate: today,
      renewalDate: addOneMonth(today),
      createdAt: Date.now(),
    });
    return { ok: true };
  } catch (e) {
    console.error("[MQ] submitMembershipRequest failed:", e);
    return { ok: false, reason: "error" };
  }
}

// id = the client code (MQ-XXXX) already stored in clients/
export async function approveMembershipRequest(id: string): Promise<string> {
  if (!isConfigured()) return "";
  try {
    const today = new Date().toISOString().slice(0, 10);
    await update(ref(getDb(), `clients/${id}`), {
      status: "activo",
      startDate: today,
      renewalDate: addOneMonth(today),
    });
    return id;
  } catch { return ""; }
}
