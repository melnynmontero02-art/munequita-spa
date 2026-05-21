"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getClient, type Client } from "@/lib/clients";
import { Crown, X, LogOut, CalendarClock } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_LABEL: Record<Client["status"], string> = {
  pendiente: "Pendiente",
  activo:    "Activo",
  pausado:   "Pausado",
  cancelado: "Cancelado",
};

const STATUS_COLOR: Record<Client["status"], string> = {
  pendiente: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  activo:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pausado:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  cancelado: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function SubscriberWidget() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(false);
  const [client,   setClient]   = useState<Client | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mq_sub_code");
    if (saved) loadClient(saved, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function loadClient(code: string, silent = false) {
    if (!silent) setLoading(true);
    const found = await getClient(code.toUpperCase().trim());
    if (!silent) setLoading(false);
    if (found && found.status === "activo") {
      setClient(found);
      localStorage.setItem("mq_sub_code", code.toUpperCase().trim());
      setError(false);
    } else {
      if (!silent) setError(true);
      if (!found || found.status !== "activo") localStorage.removeItem("mq_sub_code");
    }
  }

  function logout() {
    setClient(null);
    setInput("");
    localStorage.removeItem("mq_sub_code");
    setOpen(false);
  }

  const daysLeft = client?.renewalDate
    ? differenceInDays(parseISO(client.renewalDate), new Date())
    : null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      {client ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-deep/20 to-rose/20 border border-rose/30 cursor-pointer hover:border-rose/50 transition-all"
        >
          <Crown className="w-3.5 h-3.5 text-rose" />
          <span className="font-sans text-[12px] text-rose font-medium max-w-[80px] truncate">
            {client.name.split(" ")[0]}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] cursor-pointer hover:border-white/20 hover:bg-white/[0.07] transition-all"
        >
          <Crown className="w-3.5 h-3.5 text-charcoal/40" />
          <span className="font-sans text-[12px] text-charcoal/50 font-medium whitespace-nowrap">Mi Plan</span>
        </button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-72 bg-[#1a1512] border border-white/[0.1] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <p className="font-brand text-white text-xs tracking-widest uppercase">
                Muñequita<span className="text-rose"> Spa</span>
              </p>
              <button type="button" onClick={() => setOpen(false)} className="text-charcoal/30 hover:text-charcoal/60 cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {client ? (
              /* Subscriber view */
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-0.5">Bienvenida</p>
                    <p className="text-charcoal font-sans font-semibold text-sm">{client.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-sans font-medium shrink-0 ${STATUS_COLOR[client.status]}`}>
                    {STATUS_LABEL[client.status]}
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 flex flex-col gap-1">
                  <p className="text-charcoal/35 font-sans text-[10px] uppercase tracking-widest">Plan activo</p>
                  <p className="text-charcoal/80 font-sans text-sm font-medium">{client.plan}</p>
                </div>

                {client.renewalDate && (
                  <div className="flex items-center gap-2 bg-white/[0.02] rounded-xl px-3 py-2">
                    <CalendarClock className="w-3.5 h-3.5 text-rose/50 shrink-0" />
                    <div>
                      <p className="text-charcoal/50 font-sans text-[11px]">
                        Renueva el{" "}
                        <span className="text-charcoal/70 capitalize">
                          {format(parseISO(client.renewalDate), "d MMM yyyy", { locale: es })}
                        </span>
                      </p>
                      {daysLeft !== null && daysLeft >= 0 && (
                        <p className="text-charcoal/30 font-sans text-[10px]">
                          {daysLeft === 0 ? "Vence hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-white/[0.07] text-charcoal/40 hover:text-charcoal/60 font-sans text-[11px] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              /* Login view */
              <div className="p-4 flex flex-col gap-3">
                <p className="text-charcoal/50 font-sans text-xs leading-relaxed">
                  Ingresa tu código VIP para acceder a tu plan de suscripción.
                </p>
                <input
                  type="text"
                  value={input}
                  onChange={e => { setInput(e.target.value.toUpperCase()); setError(false); }}
                  onKeyDown={e => e.key === "Enter" && input && loadClient(input)}
                  placeholder="MQ-0000"
                  className={`bg-white/[0.04] border rounded-xl px-3 py-2.5 text-charcoal/90 font-mono text-sm focus:outline-none transition-all uppercase tracking-widest ${error ? "border-red-400/50" : "border-white/[0.08] focus:border-rose/40"}`}
                />
                {error && <p className="text-red-400/80 font-sans text-[11px] -mt-1">Código no válido o suscripción no activa</p>}
                <button
                  type="button"
                  onClick={() => input && loadClient(input)}
                  disabled={!input || loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Verificando..." : "Activar acceso VIP"}
                </button>
                <p className="text-charcoal/25 font-sans text-[10px] text-center leading-relaxed">
                  ¿No tienes código? Solicita tu membresía y la admin te lo enviará al aprobarla.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
