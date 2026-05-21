"use client";

import { useState, useEffect } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { getClient, submitPlanRequest, submitMembershipRequest, type Client } from "@/lib/clients";
import { ArrowLeft, CheckCircle, CalendarClock, Clock } from "lucide-react";
import Link from "next/link";

const PLANES = [
  { name: "Esencia",   price: "$89 USD / mes" },
  { name: "Ritual",    price: "$299 USD / mes" },
  { name: "Santuario", price: "$220 USD / mes" },
];

const STATUS_CFG = {
  pendiente: { label: "Pendiente de confirmación", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  activo:    { label: "Activo",                    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  pausado:   { label: "Pausado",                   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  cancelado: { label: "Cancelado",                 color: "text-red-400 bg-red-400/10 border-red-400/30" },
};

export default function MiPlanPage() {
  const [screen,    setScreen]    = useState<"login" | "signup" | "dashboard">("login");
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [client,    setClient]    = useState<Client | null>(null);
  const [notFound,  setNotFound]  = useState(false);
  const [modal,     setModal]     = useState<"cancel" | "change" | null>(null);
  const [newPlan,   setNewPlan]   = useState("");
  const [submitted, setSubmitted] = useState<"cancelar" | "cambiar" | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [signupDone,  setSignupDone]  = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Signup form
  const [signup, setSignup] = useState({ name: "", phone: "", email: "", plan: PLANES[0].name });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam   = params.get("plan");
    const screenParam = params.get("screen");

    if (screenParam === "signup") {
      if (planParam && PLANES.find(p => p.name === planParam)) {
        setSignup(p => ({ ...p, plan: planParam }));
      }
      setScreen("signup");
      return;
    }

    const saved = localStorage.getItem("mq_plan_code");
    if (saved) loadClient(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadClient(c: string) {
    setLoading(true);
    setNotFound(false);
    const found = await getClient(c.toUpperCase().trim());
    setLoading(false);
    if (found) {
      setClient(found);
      setScreen("dashboard");
      localStorage.setItem("mq_plan_code", c.toUpperCase().trim());
    } else {
      setNotFound(true);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signup.name || !signup.plan) return;
    setSaving(true);
    setSignupError(null);
    const result = await submitMembershipRequest({
      name: signup.name,
      phone: signup.phone || undefined,
      email: signup.email || undefined,
      plan: signup.plan,
    });
    setSaving(false);
    if (result.ok) {
      setSignupDone(true);
    } else {
      if (result.reason === "duplicate_phone") setSignupError("Este número de teléfono ya tiene una membresía registrada.");
      else if (result.reason === "duplicate_email") setSignupError("Este correo electrónico ya tiene una membresía registrada.");
      else setSignupError("Error al enviar la solicitud. Verifica tu conexión e intenta nuevamente.");
    }
  }

  async function handleCancel() {
    if (!client) return;
    setSaving(true);
    await submitPlanRequest({ clientCode: client.code, clientName: client.name, type: "cancelar" });
    setSaving(false);
    setModal(null);
    setSubmitted("cancelar");
  }

  async function handleChange() {
    if (!client || !newPlan) return;
    setSaving(true);
    await submitPlanRequest({ clientCode: client.code, clientName: client.name, type: "cambiar", newPlan });
    setSaving(false);
    setModal(null);
    setSubmitted("cambiar");
    setNewPlan("");
  }

  function logout() {
    localStorage.removeItem("mq_plan_code");
    setClient(null);
    setCode("");
    setSubmitted(null);
    setScreen("login");
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div className="min-h-screen bg-[#0a0807] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <p className="font-brand text-white text-2xl tracking-widest uppercase mb-1">
                Muñequita<span className="text-rose"> Spa</span>
              </p>
            </Link>
            <p className="text-charcoal/40 font-sans text-sm mt-1">Mi Membresía</p>
          </div>

          <div className="bg-[#120e0c] border border-white/[0.08] rounded-2xl p-8 flex flex-col gap-4">
            <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Código de cliente</label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setNotFound(false); }}
              onKeyDown={e => e.key === "Enter" && code && loadClient(code)}
              placeholder="MQ-0000"
              className={`bg-white/[0.04] border rounded-xl px-4 py-3 text-charcoal/90 font-sans text-sm focus:outline-none transition-all uppercase tracking-widest ${notFound ? "border-red-400/60" : "border-white/08 focus:border-rose/40"}`}
            />
            {notFound && <p className="text-red-400 font-sans text-xs -mt-2">Código no encontrado</p>}
            <button type="button" onClick={() => code && loadClient(code)} disabled={!code || loading}
              className="rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm py-3 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1">
              {loading ? "Buscando..." : "Ver mi membresía"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-charcoal/25 font-sans text-[11px] mb-3">¿Primera vez? Activa tu membresía aquí</p>
            <button type="button" onClick={() => setScreen("signup")}
              className="text-rose/70 hover:text-rose font-sans text-sm cursor-pointer transition-colors underline underline-offset-2">
              Solicitar membresía
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  if (screen === "signup") {
    if (signupDone) {
      return (
        <div className="min-h-screen bg-[#0a0807] flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center flex flex-col items-center gap-6">
            <Link href="/" className="inline-block">
              <p className="font-brand text-white text-2xl tracking-widest uppercase">
                Muñequita<span className="text-rose"> Spa</span>
              </p>
            </Link>
            <div className="bg-[#120e0c] border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-orange-400/10 border border-orange-400/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-charcoal font-sans font-semibold text-base mb-1">Solicitud recibida</p>
                <p className="text-charcoal/50 font-sans text-sm leading-relaxed">
                  La administradora revisará tu solicitud y te enviará tu código de acceso por WhatsApp al aprobarlo.
                </p>
              </div>
              <button type="button" onClick={() => setScreen("login")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity mt-1">
                Ingresar con mi código
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0a0807] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <p className="font-brand text-white text-2xl tracking-widest uppercase mb-1">
                Muñequita<span className="text-rose"> Spa</span>
              </p>
            </Link>
            <p className="text-charcoal/40 font-sans text-sm mt-1">Solicitar membresía</p>
          </div>

          <form onSubmit={handleSignup} className="bg-[#120e0c] border border-white/[0.08] rounded-2xl p-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Nombre completo *</label>
              <input required value={signup.name} onChange={e => setSignup(p => ({ ...p, name: e.target.value }))}
                placeholder="Tu nombre"
                className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-4 py-2.5 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Teléfono *</label>
              <input
                required
                value={signup.phone}
                onChange={e => setSignup(p => ({ ...p, phone: e.target.value }))}
                placeholder="809-000-0000"
                className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-4 py-2.5 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Correo electrónico *</label>
              <input
                required
                type="email"
                value={signup.email}
                onChange={e => setSignup(p => ({ ...p, email: e.target.value }))}
                placeholder="tu@correo.com"
                className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-4 py-2.5 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Plan deseado *</label>
              <div className="flex flex-col gap-2">
                {PLANES.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSignup(prev => ({ ...prev, plan: p.name }))}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                      signup.plan === p.name
                        ? "border-rose/50 bg-rose/10 text-charcoal/90"
                        : "border-white/[0.08] bg-white/[0.03] text-charcoal/50 hover:border-white/20 hover:text-charcoal/80"
                    }`}
                  >
                    <span className="font-sans font-medium text-sm">{p.name}</span>
                    <span className={`font-sans text-xs ${signup.plan === p.name ? "text-rose" : "text-charcoal/30"}`}>{p.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setScreen("login")}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer">
                Volver
              </button>
              <button type="submit" disabled={saving || !signup.name || !signup.phone || !signup.email}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? "Verificando..." : "Solicitar"}
              </button>
            </div>

            {signupError && (
              <p className="text-red-400 font-sans text-xs text-center -mt-1">{signupError}</p>
            )}
            <p className="text-charcoal/25 font-sans text-[11px] -mt-1 text-center">
              Recibirás tu código de acceso por WhatsApp cuando la admin apruebe tu solicitud.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if (!client) return null;

  const statusCfg  = STATUS_CFG[client.status];
  const daysLeft   = client.renewalDate
    ? differenceInDays(parseISO(client.renewalDate), new Date())
    : null;

  return (
    <div className="min-h-screen bg-[#0a0807] px-4 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-charcoal/40 hover:text-charcoal font-sans text-xs transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Inicio
          </Link>
          <button type="button" onClick={logout}
            className="text-charcoal/30 hover:text-charcoal/60 font-sans text-xs cursor-pointer transition-colors">
            Cerrar sesión
          </button>
        </div>

        {/* Greeting */}
        <div>
          <p className="text-charcoal/40 font-sans text-xs tracking-widest uppercase mb-1">Bienvenida</p>
          <p className="font-display font-light text-2xl text-charcoal">{client.name}</p>
        </div>

        {/* Plan card */}
        <div className="bg-[#120e0c] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-1">Plan mensual</p>
              <p className="font-display font-light text-xl text-charcoal">{client.plan}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium shrink-0 ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Renewal info */}
          {client.renewalDate && client.status === "activo" && (
            <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2.5">
              <CalendarClock className="w-4 h-4 text-rose/60 shrink-0" />
              <div>
                <p className="text-charcoal/50 font-sans text-[11px]">
                  Próxima renovación:{" "}
                  <span className="text-charcoal/80 font-medium capitalize">
                    {format(parseISO(client.renewalDate), "d 'de' MMMM yyyy", { locale: es })}
                  </span>
                </p>
                {daysLeft !== null && daysLeft >= 0 && (
                  <p className="text-charcoal/30 font-sans text-[10px] mt-0.5">
                    {daysLeft === 0 ? "Vence hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="pt-1 border-t border-white/[0.06] grid grid-cols-2 gap-3">
            {client.phone && (
              <div>
                <p className="text-charcoal/30 font-sans text-[10px] uppercase tracking-widest">Teléfono</p>
                <p className="text-charcoal/60 font-sans text-xs mt-0.5">{client.phone}</p>
              </div>
            )}
            <div>
              <p className="text-charcoal/30 font-sans text-[10px] uppercase tracking-widest">Inicio del plan</p>
              <p className="text-charcoal/60 font-sans text-xs mt-0.5 capitalize">
                {format(parseISO(client.startDate), "d MMM yyyy", { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Pending notice */}
        {client.status === "pendiente" && (
          <div className="bg-orange-400/[0.07] border border-orange-400/20 rounded-2xl p-4">
            <p className="text-orange-400 font-sans text-sm font-medium">Membresía en revisión</p>
            <p className="text-charcoal/50 font-sans text-xs mt-0.5 leading-relaxed">
              La administradora está revisando tu solicitud. Te contactará pronto para confirmarla.
            </p>
          </div>
        )}

        {/* Success after request */}
        {submitted && (
          <div className="bg-emerald-400/[0.07] border border-emerald-400/20 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-400 font-sans text-sm font-medium">Solicitud enviada</p>
              <p className="text-charcoal/50 font-sans text-xs mt-0.5 leading-relaxed">
                {submitted === "cancelar"
                  ? "Tu solicitud de cancelación fue recibida. La administradora te contactará pronto."
                  : "Tu solicitud de cambio de plan fue recibida. La administradora te contactará para confirmar."}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {client.status === "activo" && !submitted && (
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setModal("change")}
              className="bg-white/[0.04] border border-white/[0.08] hover:border-rose/30 rounded-xl py-3 text-charcoal/70 hover:text-charcoal/90 font-sans text-sm transition-all cursor-pointer">
              Cambiar plan
            </button>
            <button type="button" onClick={() => setModal("cancel")}
              className="bg-white/[0.04] border border-red-400/20 hover:border-red-400/40 rounded-xl py-3 text-red-400/70 hover:text-red-400 font-sans text-sm transition-all cursor-pointer">
              Cancelar plan
            </button>
          </div>
        )}

        <p className="text-center text-charcoal/20 font-sans text-[10px]">Código: {client.code}</p>
      </div>

      {/* Cancel modal */}
      {modal === "cancel" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1512] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <p className="font-display font-light text-lg text-charcoal">¿Cancelar tu plan?</p>
            <p className="text-charcoal/50 font-sans text-sm leading-relaxed">
              Se enviará una solicitud a la administradora. Ella te contactará para confirmar la cancelación.
            </p>
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer">
                Volver
              </button>
              <button type="button" onClick={handleCancel} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-sans text-sm hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50">
                {saving ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change plan modal */}
      {modal === "change" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1512] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <p className="font-display font-light text-lg text-charcoal">Cambiar plan</p>
            <p className="text-charcoal/50 font-sans text-sm">Selecciona el plan al que deseas cambiar:</p>
            <div className="flex flex-col gap-2">
              {PLANES.filter(p => p.name !== client.plan).map(p => (
                <button key={p.name} type="button" onClick={() => setNewPlan(p.name)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-sm transition-all cursor-pointer ${
                    newPlan === p.name
                      ? "bg-rose/15 border border-rose/30 text-rose"
                      : "bg-white/[0.03] border border-transparent hover:border-white/[0.1] text-charcoal/70 hover:text-charcoal/90"
                  }`}>
                  <span>{p.name}</span>
                  <span className="text-xs opacity-60">{p.price}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setModal(null); setNewPlan(""); }}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="button" onClick={handleChange} disabled={!newPlan || saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? "Enviando..." : "Solicitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
