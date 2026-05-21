"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getClient, submitPlanRequest, type Client } from "@/lib/clients";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  "Skin Glow",
  "Collagen Booster",
  "Armonización Facial",
  "Volumen & Glow Labial",
  "Botox de Precisión",
  "Bioestimulación de Colágeno",
  "Ritual de Limpieza Profunda",
  "Hollywood Peel",
  "Hidratación & Glow Intensivo",
  "Acné, Manchas & Cicatrices",
  "Micropigmentación Artística",
  "Blanqueamiento Corporal",
  "Masajes Corporales",
  "Láser Diodo Ice",
  "Eliminación de Tatuajes",
  "Nutrición & Bienestar Integral",
];

const STATUS_CFG = {
  activo:    { label: "Activo",    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  pausado:   { label: "Pausado",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  cancelado: { label: "Cancelado", color: "text-red-400 bg-red-400/10 border-red-400/30" },
};

export default function MiPlanPage() {
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [client,    setClient]    = useState<Client | null>(null);
  const [notFound,  setNotFound]  = useState(false);
  const [modal,     setModal]     = useState<"cancel" | "change" | null>(null);
  const [newPlan,   setNewPlan]   = useState("");
  const [submitted, setSubmitted] = useState<"cancelar" | "cambiar" | null>(null);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
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
      localStorage.setItem("mq_plan_code", c.toUpperCase().trim());
    } else {
      setNotFound(true);
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
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!client) {
    return (
      <div className="min-h-screen bg-[#0a0807] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <p className="font-brand text-white text-2xl tracking-widest uppercase mb-1">
                Muñequita<span className="text-rose"> Spa</span>
              </p>
            </Link>
            <p className="text-charcoal/40 font-sans text-sm mt-1">Mi Plan</p>
          </div>

          <div className="bg-[#120e0c] border border-white/[0.08] rounded-2xl p-8 flex flex-col gap-4">
            <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">
              Código de cliente
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setNotFound(false); }}
              onKeyDown={e => e.key === "Enter" && code && loadClient(code)}
              placeholder="MQ-0000"
              className={`bg-white/[0.04] border rounded-xl px-4 py-3 text-charcoal/90 font-sans text-sm focus:outline-none transition-all uppercase tracking-widest ${notFound ? "border-red-400/60" : "border-white/08 focus:border-rose/40"}`}
            />
            {notFound && (
              <p className="text-red-400 font-sans text-xs -mt-2">Código no encontrado</p>
            )}
            <button
              type="button"
              onClick={() => code && loadClient(code)}
              disabled={!code || loading}
              className="rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm py-3 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Buscando..." : "Ver mi plan"}
            </button>
          </div>

          <p className="text-center text-charcoal/25 font-sans text-[11px] mt-4">
            Tu código lo proporciona la administradora
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const pct       = client.sessionsTotal > 0 ? Math.round((client.sessionsUsed / client.sessionsTotal) * 100) : 0;
  const remaining = client.sessionsTotal - client.sessionsUsed;
  const statusCfg = STATUS_CFG[client.status];

  return (
    <div className="min-h-screen bg-[#0a0807] px-4 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-charcoal/40 hover:text-charcoal font-sans text-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Inicio
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-charcoal/30 hover:text-charcoal/60 font-sans text-xs cursor-pointer transition-colors"
          >
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
              <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-1">Plan activo</p>
              <p className="font-display font-light text-xl text-charcoal">{client.plan}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-sans font-medium shrink-0 ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Sessions progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-charcoal/50 font-sans text-xs">Sesiones usadas</p>
              <p className="text-charcoal/80 font-sans text-xs font-medium">
                {client.sessionsUsed} / {client.sessionsTotal}
              </p>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-deep to-rose rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-charcoal/30 font-sans text-[11px] mt-2">
              {remaining > 0
                ? `${remaining} sesión${remaining !== 1 ? "es" : ""} restante${remaining !== 1 ? "s" : ""}`
                : "Todas las sesiones han sido completadas"}
            </p>
          </div>

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

        {/* Success message after request */}
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
            <button
              type="button"
              onClick={() => setModal("change")}
              className="bg-white/[0.04] border border-white/[0.08] hover:border-rose/30 rounded-xl py-3 text-charcoal/70 hover:text-charcoal/90 font-sans text-sm transition-all cursor-pointer"
            >
              Cambiar plan
            </button>
            <button
              type="button"
              onClick={() => setModal("cancel")}
              className="bg-white/[0.04] border border-red-400/20 hover:border-red-400/40 rounded-xl py-3 text-red-400/70 hover:text-red-400 font-sans text-sm transition-all cursor-pointer"
            >
              Cancelar plan
            </button>
          </div>
        )}

        <p className="text-center text-charcoal/20 font-sans text-[10px]">Código: {client.code}</p>
      </div>

      {/* Cancel confirmation modal */}
      {modal === "cancel" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1512] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <p className="font-display font-light text-lg text-charcoal">¿Cancelar tu plan?</p>
            <p className="text-charcoal/50 font-sans text-sm leading-relaxed">
              Se enviará una solicitud a la administradora. Ella te contactará para confirmar la cancelación.
            </p>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-sans text-sm hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50"
              >
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
            <p className="text-charcoal/50 font-sans text-sm">Selecciona el servicio al que deseas cambiar:</p>

            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
              {SERVICES.filter(s => s !== client.plan).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewPlan(s)}
                  className={`text-left px-3 py-2.5 rounded-xl font-sans text-sm transition-all cursor-pointer ${
                    newPlan === s
                      ? "bg-rose/15 border border-rose/30 text-rose"
                      : "bg-white/[0.03] border border-transparent hover:border-white/[0.1] text-charcoal/70 hover:text-charcoal/90"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setModal(null); setNewPlan(""); }}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleChange}
                disabled={!newPlan || saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Enviando..." : "Solicitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
