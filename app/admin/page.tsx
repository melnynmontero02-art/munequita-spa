"use client";

import { useEffect, useState } from "react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { listenAppointments, type Appointment } from "@/lib/appointments";
import { Calendar, Clock, Phone, Mail, Scissors, CheckCircle, XCircle, Circle, ChevronDown } from "lucide-react";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "admin123";

const STATUS_CONFIG = {
  pendiente:   { label: "Pendiente",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  confirmada:  { label: "Confirmada",  color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  completada:  { label: "Completada",  color: "text-charcoal/40 bg-white/[0.04] border-white/[0.08]" },
  cancelada:   { label: "Cancelada",   color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d))    return "Hoy";
  if (isTomorrow(d)) return "Mañana";
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin]   = useState("");
  const [err, setErr]   = useState(false);

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
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/30 to-transparent rounded-t-2xl" />
          <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Contraseña</label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••••••"
            autoFocus
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

function StatusBadge({ status, onChange }: { status: Appointment["status"]; onChange: (s: Appointment["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium cursor-pointer ${cfg.color}`}
      >
        {cfg.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-10 bg-[#1a1512] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl w-36">
          {(Object.keys(STATUS_CONFIG) as Appointment["status"][]).map(s => (
            <button key={s} type="button"
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 font-sans text-[11px] hover:bg-white/[0.06] transition-colors ${STATUS_CONFIG[s].color.split(" ")[0]}`}>
              {STATUS_CONFIG[s].label}
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
        <StatusBadge status={appt.status} onChange={(s) => appt.id && onStatusChange(appt.id, s)} />
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
        <span className="text-charcoal/30 font-sans text-[10px]">
          {appt.channel === "wa" ? "📱 WhatsApp" : "✉️ Correo"}
        </span>
        <span className="text-charcoal/25 font-sans text-[10px]">
          {format(new Date(appt.createdAt), "d MMM · HH:mm", { locale: es })}
        </span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed,       setAuthed]       = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter,       setFilter]       = useState<"todas" | "hoy" | "pendiente" | "confirmada">("hoy");
  const [statuses,     setStatuses]     = useState<Record<string, Appointment["status"]>>({});

  useEffect(() => {
    if (sessionStorage.getItem("mq_admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const unsub = listenAppointments(setAppointments);
    return unsub;
  }, [authed]);

  function handleStatusChange(id: string, status: Appointment["status"]) {
    setStatuses(prev => ({ ...prev, [id]: status }));
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const today = format(new Date(), "yyyy-MM-dd");

  const filtered = appointments.filter(a => {
    const st = statuses[a.id ?? ""] ?? a.status;
    if (filter === "hoy")       return a.date === today;
    if (filter === "pendiente") return st === "pendiente";
    if (filter === "confirmada") return st === "confirmada";
    return true;
  });

  const counts = {
    hoy:       appointments.filter(a => a.date === today).length,
    pendiente: appointments.filter(a => (statuses[a.id ?? ""] ?? a.status) === "pendiente").length,
    total:     appointments.length,
  };

  return (
    <div className="min-h-screen bg-[#0a0807]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-brand text-white text-lg tracking-widest uppercase">Muñequita<span className="text-rose"> Spa</span></p>
          <p className="text-charcoal/35 font-sans text-xs">Panel de citas</p>
        </div>
        <button
          type="button"
          onClick={() => { sessionStorage.removeItem("mq_admin"); setAuthed(false); }}
          className="text-charcoal/40 hover:text-charcoal font-sans text-xs cursor-pointer transition-colors"
        >
          Salir
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Citas hoy",     value: counts.hoy },
            { label: "Pendientes",    value: counts.pendiente },
            { label: "Total citas",   value: counts.total },
          ].map(s => (
            <div key={s.label} className="bg-[#120e0c] border border-white/[0.07] rounded-2xl p-4 text-center">
              <p className="gradient-text font-display font-medium text-3xl">{s.value}</p>
              <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["hoy", "pendiente", "confirmada", "todas"] as const).map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full font-sans text-xs font-medium transition-all cursor-pointer capitalize ${filter === f ? "bg-gradient-to-r from-rose-deep to-rose text-white shadow-[0_2px_12px_rgba(212,97,140,0.3)]" : "bg-white/[0.04] border border-white/[0.08] text-charcoal/50 hover:text-charcoal/80"}`}>
              {f === "hoy" ? `Hoy (${counts.hoy})` : f === "pendiente" ? `Pendientes (${counts.pendiente})` : f === "todas" ? `Todas (${counts.total})` : "Confirmadas"}
            </button>
          ))}
        </div>

        {/* Appointment list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Scissors className="w-8 h-8 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/30 font-sans text-sm">No hay citas en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(a => (
              <AppointmentCard key={a.id} appt={{ ...a, status: statuses[a.id ?? ""] ?? a.status }} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
