"use client";

import { useEffect, useState } from "react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { listenAppointments, type Appointment } from "@/lib/appointments";
import {
  listenClients, createClient, updateClient,
  listenPlanRequests, processPlanRequest,
  type Client, type PlanRequest,
} from "@/lib/clients";
import {
  Calendar, Clock, Phone, Mail, Scissors,
  ChevronDown, Plus, Minus, Users, Bell, Copy, Check,
} from "lucide-react";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "admin123";

const SERVICES = [
  "Skin Glow","Collagen Booster","Armonización Facial","Volumen & Glow Labial",
  "Botox de Precisión","Bioestimulación de Colágeno","Ritual de Limpieza Profunda",
  "Hollywood Peel","Hidratación & Glow Intensivo","Acné, Manchas & Cicatrices",
  "Micropigmentación Artística","Blanqueamiento Corporal","Masajes Corporales",
  "Láser Diodo Ice","Eliminación de Tatuajes","Nutrición & Bienestar Integral",
];

const APPT_STATUS: Record<Appointment["status"], { label: string; color: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  confirmada: { label: "Confirmada", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  completada: { label: "Completada", color: "text-charcoal/40 bg-white/[0.04] border-white/[0.08]" },
  cancelada:  { label: "Cancelada",  color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const CLIENT_STATUS: Record<Client["status"], { label: string; color: string }> = {
  activo:    { label: "Activo",    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  pausado:   { label: "Pausado",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  cancelado: { label: "Cancelado", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

function generateCode() {
  return "MQ-" + String(Math.floor(1000 + Math.random() * 9000));
}

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d))    return "Hoy";
  if (isTomorrow(d)) return "Mañana";
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) { sessionStorage.setItem("mq_admin", "1"); onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); }
  }

  return (
    <div className="min-h-screen bg-[#0a0807] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-brand text-white text-2xl tracking-widest uppercase mb-1">Muñequita<span className="text-rose"> Spa</span></p>
          <p className="text-charcoal/40 font-sans text-sm">Panel de Administración</p>
        </div>
        <form onSubmit={submit} className="bg-[#120e0c] border border-white/[0.08] rounded-2xl p-8 flex flex-col gap-4">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Contraseña</label>
          <input
            type="password" value={pin} onChange={e => setPin(e.target.value)}
            placeholder="••••••••" autoFocus
            className={`bg-white/[0.04] border rounded-xl px-4 py-3 text-charcoal/90 font-sans text-sm focus:outline-none transition-all ${err ? "border-red-400/60 animate-pulse" : "border-white/08 focus:border-rose/40"}`}
          />
          {err && <p className="text-red-400 font-sans text-xs -mt-2">Contraseña incorrecta</p>}
          <button type="submit" className="rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm py-3 cursor-pointer hover:opacity-90 transition-opacity mt-1">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Appointment components ───────────────────────────────────────────────────

function ApptStatusBadge({ status, onChange }: { status: Appointment["status"]; onChange: (s: Appointment["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = APPT_STATUS[status];
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium cursor-pointer ${cfg.color}`}>
        {cfg.label} <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-10 bg-[#1a1512] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl w-36">
          {(Object.keys(APPT_STATUS) as Appointment["status"][]).map(s => (
            <button key={s} type="button" onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 font-sans text-[11px] hover:bg-white/[0.06] transition-colors ${APPT_STATUS[s].color.split(" ")[0]}`}>
              {APPT_STATUS[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appt, onStatusChange }: { appt: Appointment; onStatusChange: (id: string, s: Appointment["status"]) => void }) {
  return (
    <div className="bg-[#120e0c] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-charcoal font-sans font-semibold text-sm">{appt.name}</p>
          <p className="text-rose font-sans text-xs mt-0.5">{appt.service || "—"}</p>
        </div>
        <ApptStatusBadge status={appt.status} onChange={s => appt.id && onStatusChange(appt.id, s)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-charcoal/50">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="font-sans text-[11px]">{dayLabel(appt.date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-charcoal/50">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="font-sans text-[11px]">{appt.time}</span>
        </div>
        {appt.phone && (
          <div className="flex items-center gap-1.5 text-charcoal/50">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <a href={`tel:${appt.phone}`} className="font-sans text-[11px] hover:text-rose transition-colors">{appt.phone}</a>
          </div>
        )}
        {appt.email && (
          <div className="flex items-center gap-1.5 text-charcoal/50">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="font-sans text-[11px] truncate">{appt.email}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        <span className="text-charcoal/30 font-sans text-[10px]">{appt.channel === "wa" ? "WhatsApp" : "Correo"}</span>
        <span className="text-charcoal/25 font-sans text-[10px]">{format(new Date(appt.createdAt), "d MMM · HH:mm", { locale: es })}</span>
      </div>
    </div>
  );
}

// ─── Client components ────────────────────────────────────────────────────────

function ClientCard({ client }: { client: Client }) {
  const [copied, setCopied]   = useState(false);
  const [status, setStatus]   = useState(client.status);
  const [used,   setUsed]     = useState(client.sessionsUsed);
  const [open,   setOpen]     = useState(false);

  const pct = client.sessionsTotal > 0 ? Math.round((used / client.sessionsTotal) * 100) : 0;
  const cfg = CLIENT_STATUS[status];

  function copyCode() {
    navigator.clipboard.writeText(client.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function changeStatus(s: Client["status"]) {
    setStatus(s);
    setOpen(false);
    await updateClient(client.code, { status: s });
  }

  async function adjustSessions(delta: number) {
    const next = Math.max(0, Math.min(client.sessionsTotal, used + delta));
    setUsed(next);
    await updateClient(client.code, { sessionsUsed: next });
  }

  return (
    <div className="bg-[#120e0c] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/[0.12] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-charcoal font-sans font-semibold text-sm">{client.name}</p>
          {client.phone && <p className="text-charcoal/40 font-sans text-[11px] mt-0.5">{client.phone}</p>}
          <p className="text-rose font-sans text-xs mt-1">{client.plan}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setOpen(!open)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium cursor-pointer ${cfg.color}`}>
              {cfg.label} <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {open && (
              <div className="absolute top-8 right-0 z-10 bg-[#1a1512] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl w-32">
                {(Object.keys(CLIENT_STATUS) as Client["status"][]).map(s => (
                  <button key={s} type="button" onClick={() => changeStatus(s)}
                    className={`w-full text-left px-3 py-2 font-sans text-[11px] hover:bg-white/[0.06] transition-colors ${CLIENT_STATUS[s].color.split(" ")[0]}`}>
                    {CLIENT_STATUS[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Copy code */}
          <button type="button" onClick={copyCode}
            className="flex items-center gap-1 text-charcoal/30 hover:text-charcoal/60 font-mono text-[11px] cursor-pointer transition-colors">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {client.code}
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-charcoal/40 font-sans text-[11px]">Sesiones</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => adjustSessions(-1)} disabled={used <= 0}
              className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-charcoal/50 hover:text-charcoal disabled:opacity-30 cursor-pointer transition-colors">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-charcoal/80 font-sans text-xs font-medium w-12 text-center">
              {used} / {client.sessionsTotal}
            </span>
            <button type="button" onClick={() => adjustSessions(1)} disabled={used >= client.sessionsTotal}
              className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-charcoal/50 hover:text-charcoal disabled:opacity-30 cursor-pointer transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-deep to-rose rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-charcoal/25 font-sans text-[10px]">
          Inicio: {format(parseISO(client.startDate), "d MMM yyyy", { locale: es })}
        </span>
      </div>
    </div>
  );
}

function NewClientForm({ onClose }: { onClose: () => void }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [form, setForm] = useState({
    name: "", phone: "", plan: SERVICES[0],
    sessionsTotal: "4", startDate: today, code: generateCode(),
  });
  const [saving, setSaving] = useState(false);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.code) return;
    setSaving(true);
    await createClient({
      code: form.code.toUpperCase().trim(),
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      plan: form.plan,
      sessionsTotal: parseInt(form.sessionsTotal) || 4,
      sessionsUsed: 0,
      status: "activo",
      startDate: form.startDate,
    });
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#120e0c] border border-rose/20 rounded-2xl p-6 flex flex-col gap-4">
      <p className="text-charcoal font-sans font-semibold text-sm">Nuevo cliente</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Nombre *</label>
          <input required value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Nombre completo"
            className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-3 py-2 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Teléfono</label>
          <input value={form.phone} onChange={e => set("phone", e.target.value)}
            placeholder="809-000-0000"
            className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-3 py-2 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Código *</label>
          <input required value={form.code} onChange={e => set("code", e.target.value.toUpperCase())}
            placeholder="MQ-0000"
            className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-3 py-2 text-charcoal/90 font-mono text-sm focus:outline-none transition-all uppercase tracking-widest" />
        </div>

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Servicio / Plan *</label>
          <select value={form.plan} onChange={e => set("plan", e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-3 py-2 text-charcoal/90 font-sans text-sm focus:outline-none transition-all">
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Sesiones totales</label>
          <input type="number" min="1" value={form.sessionsTotal} onChange={e => set("sessionsTotal", e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-3 py-2 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Fecha inicio</label>
          <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-3 py-2 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
          {saving ? "Guardando..." : "Crear cliente"}
        </button>
      </div>
    </form>
  );
}

// ─── Plan request card ────────────────────────────────────────────────────────

function PlanRequestCard({ req, onProcess }: { req: PlanRequest; onProcess: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await processPlanRequest(req.id!, { clientCode: req.clientCode, type: req.type, newPlan: req.newPlan });
    setLoading(false);
    onProcess();
  }

  return (
    <div className={`bg-[#120e0c] border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${req.status === "pendiente" ? "border-yellow-400/20" : "border-white/[0.07]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-charcoal font-sans font-semibold text-sm">{req.clientName}</p>
          <p className="text-charcoal/40 font-mono text-[11px] mt-0.5">{req.clientCode}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium ${req.status === "pendiente" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-charcoal/40 bg-white/[0.04] border-white/[0.08]"}`}>
          {req.status === "pendiente" ? "Pendiente" : "Procesada"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-charcoal/60 font-sans text-xs">
          {req.type === "cancelar" ? "Solicita cancelar su plan" : "Solicita cambiar su plan"}
        </p>
        {req.type === "cambiar" && req.newPlan && (
          <p className="text-rose font-sans text-xs">Nuevo plan: {req.newPlan}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        <span className="text-charcoal/25 font-sans text-[10px]">
          {format(new Date(req.createdAt), "d MMM · HH:mm", { locale: es })}
        </span>
        {req.status === "pendiente" && (
          <button type="button" onClick={handle} disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-deep to-rose text-white font-sans text-[11px] font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "..." : "Procesar"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed,       setAuthed]       = useState(false);
  const [tab,          setTab]          = useState<"citas" | "clientes" | "solicitudes">("citas");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptStatuses, setApptStatuses] = useState<Record<string, Appointment["status"]>>({});
  const [filter,       setFilter]       = useState<"todas" | "hoy" | "pendiente" | "confirmada">("hoy");
  const [clients,      setClients]      = useState<Client[]>([]);
  const [requests,     setRequests]     = useState<PlanRequest[]>([]);
  const [showForm,     setShowForm]     = useState(false);
  const [reqTick,      setReqTick]      = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("mq_admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const u1 = listenAppointments(setAppointments);
    const u2 = listenClients(setClients);
    const u3 = listenPlanRequests(setRequests);
    return () => { u1(); u2(); u3(); };
  }, [authed]);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const today = format(new Date(), "yyyy-MM-dd");

  const filteredAppts = appointments.filter(a => {
    const st = apptStatuses[a.id ?? ""] ?? a.status;
    if (filter === "hoy")        return a.date === today;
    if (filter === "pendiente")  return st === "pendiente";
    if (filter === "confirmada") return st === "confirmada";
    return true;
  });

  const apptCounts = {
    hoy:       appointments.filter(a => a.date === today).length,
    pendiente: appointments.filter(a => (apptStatuses[a.id ?? ""] ?? a.status) === "pendiente").length,
    total:     appointments.length,
  };

  const clientCounts = {
    total:    clients.length,
    activos:  clients.filter(c => c.status === "activo").length,
    pausados: clients.filter(c => c.status !== "activo").length,
  };

  const pendingReqs = requests.filter(r => r.status === "pendiente").length;

  return (
    <div className="min-h-screen bg-[#0a0807]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-brand text-white text-lg tracking-widest uppercase">Muñequita<span className="text-rose"> Spa</span></p>
          <p className="text-charcoal/35 font-sans text-xs">Panel de administración</p>
        </div>
        <button type="button"
          onClick={() => { sessionStorage.removeItem("mq_admin"); setAuthed(false); }}
          className="text-charcoal/40 hover:text-charcoal font-sans text-xs cursor-pointer transition-colors">
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] px-6">
        <div className="flex gap-0 max-w-4xl mx-auto">
          {([
            { key: "citas",       label: "Citas",       badge: apptCounts.pendiente },
            { key: "clientes",    label: "Clientes",    badge: 0 },
            { key: "solicitudes", label: "Solicitudes", badge: pendingReqs },
          ] as const).map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`relative px-5 py-3.5 font-sans text-sm transition-all cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${tab === t.key ? "border-rose text-charcoal font-medium" : "border-transparent text-charcoal/40 hover:text-charcoal/70"}`}>
              {t.label}
              {t.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose text-white font-sans text-[10px] font-bold flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── CITAS tab ── */}
        {tab === "citas" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Citas hoy",   value: apptCounts.hoy },
                { label: "Pendientes",  value: apptCounts.pendiente },
                { label: "Total citas", value: apptCounts.total },
              ].map(s => (
                <div key={s.label} className="bg-[#120e0c] border border-white/[0.07] rounded-2xl p-4 text-center">
                  <p className="gradient-text font-display font-medium text-3xl">{s.value}</p>
                  <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {(["hoy", "pendiente", "confirmada", "todas"] as const).map(f => (
                <button key={f} type="button" onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full font-sans text-xs font-medium transition-all cursor-pointer capitalize ${filter === f ? "bg-gradient-to-r from-rose-deep to-rose text-white shadow-[0_2px_12px_rgba(212,97,140,0.3)]" : "bg-white/[0.04] border border-white/[0.08] text-charcoal/50 hover:text-charcoal/80"}`}>
                  {f === "hoy" ? `Hoy (${apptCounts.hoy})` : f === "pendiente" ? `Pendientes (${apptCounts.pendiente})` : f === "todas" ? `Todas (${apptCounts.total})` : "Confirmadas"}
                </button>
              ))}
            </div>

            {filteredAppts.length === 0 ? (
              <div className="text-center py-16">
                <Scissors className="w-8 h-8 text-charcoal/20 mx-auto mb-3" />
                <p className="text-charcoal/30 font-sans text-sm">No hay citas en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAppts.map(a => (
                  <AppointmentCard key={a.id} appt={{ ...a, status: apptStatuses[a.id ?? ""] ?? a.status }}
                    onStatusChange={(id, s) => setApptStatuses(p => ({ ...p, [id]: s }))} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CLIENTES tab ── */}
        {tab === "clientes" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total clientes", value: clientCounts.total },
                { label: "Activos",        value: clientCounts.activos },
                { label: "Inactivos",      value: clientCounts.pausados },
              ].map(s => (
                <div key={s.label} className="bg-[#120e0c] border border-white/[0.07] rounded-2xl p-4 text-center">
                  <p className="gradient-text font-display font-medium text-3xl">{s.value}</p>
                  <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {!showForm && (
              <button type="button" onClick={() => setShowForm(true)}
                className="flex items-center gap-2 self-start px-4 py-2 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Nuevo cliente
              </button>
            )}

            {showForm && <NewClientForm onClose={() => setShowForm(false)} />}

            {clients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-8 h-8 text-charcoal/20 mx-auto mb-3" />
                <p className="text-charcoal/30 font-sans text-sm">No hay clientes registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clients.map(c => <ClientCard key={c.code} client={c} />)}
              </div>
            )}
          </>
        )}

        {/* ── SOLICITUDES tab ── */}
        {tab === "solicitudes" && (
          <>
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-8 h-8 text-charcoal/20 mx-auto mb-3" />
                <p className="text-charcoal/30 font-sans text-sm">No hay solicitudes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requests.map(r => (
                  <PlanRequestCard key={r.id} req={r} onProcess={() => setReqTick(t => t + 1)} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
