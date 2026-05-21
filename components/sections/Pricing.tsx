"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, Crown, Mail } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const WA_LINK   = "https://wa.me/18096270658";
const SPA_EMAIL = "munequita.spa01@gmail.com";

const plans = [
  {
    name: "Esencia",
    price: "$89",
    period: "USD / mes",
    desc: "Una sesión de lujo diseñada exclusivamente para ti. El primer paso hacia tu transformación.",
    highlight: false,
    items: [
      "Tratamiento a tu elección",
      "Consulta de bienvenida personalizada",
      "Productos orgánicos de alta gama",
      "Ritual de bienvenida con té premium",
    ],
    cta: "Vive la Experiencia",
  },
  {
    name: "Ritual",
    price: "$299",
    period: "USD / mes",
    desc: "La membresía favorita de nuestras clientas más exclusivas. Bienestar, glow y renovación cada mes.",
    highlight: true,
    items: [
      "4 tratamientos premium al mes",
      "Agendamiento prioritario garantizado",
      "Rituales exclusivos de temporada",
      "Aromaterapia de cortesía incluida",
      "20% de descuento en productos",
    ],
    cta: "Comenzar Mi Ritual",
  },
  {
    name: "Santuario",
    price: "$220",
    period: "USD / mes",
    desc: "Un día dedicado completamente a ti. Mente, cuerpo y belleza en una experiencia de transformación total.",
    highlight: false,
    items: [
      "3 tratamientos consecutivos a elección",
      "Sala privada santuario exclusiva",
      "Almuerzo gourmet de bienestar",
      "Kit de cuidado personalizado para llevar",
    ],
    cta: "Reservar Mi Día",
  },
];

interface Enrollment {
  plan: string;
  name: string;
  since: string;
}

const STORAGE_KEY = "munequita_plan";

// ─── Enrollment Modal ────────────────────────────────────────────────────────

function EnrollModal({
  plan,
  onClose,
  onDone,
}: {
  plan: (typeof plans)[0];
  onClose: () => void;
  onDone: (name: string) => void;
}) {
  const [step, setStep]     = useState<1 | 2 | 3>(1);
  const [name, setName]     = useState("");
  const [phone, setPhone]   = useState("");
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState<"wa" | "email" | null>(null);

  function buildMsg() {
    return [
      `Hola! Me gustaría inscribirme en el Plan ${plan.name} de Muñequita Spa.`,
      "",
      `Nombre: ${name}`,
      phone ? `Teléfono: ${phone}` : null,
      email ? `Correo: ${email}` : null,
      `Plan: ${plan.name} — ${plan.price} ${plan.period}`,
    ].filter(Boolean).join("\n");
  }

  function sendWA() {
    setSent("wa");
    window.open(`${WA_LINK}?text=${encodeURIComponent(buildMsg())}`, "_blank");
  }

  function sendEmail() {
    const subject = encodeURIComponent(`Inscripción Plan ${plan.name} — ${name}`);
    setSent("email");
    window.location.href = `mailto:${SPA_EMAIL}?subject=${subject}&body=${encodeURIComponent(buildMsg())}`;
  }

  const steps = [
    { n: 1, label: "Plan" },
    { n: 2, label: "Datos" },
    { n: 3, label: "Enviar" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-[#1a1512] rounded-3xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/40 to-transparent" />

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-sans font-semibold transition-all duration-300 ${
                  step > s.n ? "bg-rose text-white" : step === s.n ? "bg-gradient-to-br from-rose-deep to-rose text-white shadow-[0_4px_12px_rgba(212,97,140,0.4)]" : "bg-white/[0.06] text-white/30"
                }`}>
                  {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span className={`text-[11px] font-sans tracking-widest uppercase transition-colors ${step === s.n ? "text-white/70" : "text-white/20"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`h-px w-8 transition-colors ${step > s.n ? "bg-rose/40" : "bg-white/[0.08]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Confirm plan ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-rose text-[10px] font-sans tracking-[0.3em] uppercase mb-2">Plan seleccionado</p>
              <h3 className="font-display font-light text-3xl text-charcoal mb-1">{plan.name}</h3>
              <p className="gradient-text font-display font-medium text-2xl mb-4">{plan.price} <span className="text-muted font-sans text-xs font-normal">{plan.period}</span></p>
              <p className="text-muted font-sans text-sm leading-relaxed mb-6">{plan.desc}</p>
              <div className="flex flex-col gap-2.5 mb-8">
                {plan.items.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-rose/15 border border-rose/25 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-rose" />
                    </div>
                    <span className="text-charcoal/65 font-sans text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_25px_rgba(212,97,140,0.35)] hover:shadow-[0_12px_35px_rgba(212,97,140,0.45)] transition-all">
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Personal data ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-display font-light text-2xl text-charcoal mb-1">Tus datos</h3>
              <p className="text-muted font-sans text-sm mb-6">Para confirmar tu inscripción al Plan {plan.name}.</p>
              <div className="flex flex-col gap-4 mb-6">
                <Field label="Nombre completo *" value={name} onChange={setName} placeholder="Tu nombre" />
                <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="+1 (809) 000-0000" type="tel" />
                <Field label="Correo electrónico" value={email} onChange={setEmail} placeholder="tucorreo@email.com" type="email" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white/50 hover:text-white font-sans text-sm cursor-pointer transition-colors">
                  Atrás
                </button>
                <button onClick={() => { if (name.trim()) setStep(3); }}
                  disabled={!name.trim()}
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_25px_rgba(212,97,140,0.35)] transition-all">
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Send request ── */}
          {step === 3 && !sent && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-display font-light text-2xl text-charcoal mb-1">Enviar solicitud</h3>
              <p className="text-muted font-sans text-sm mb-6">Elige cómo quieres enviar tu solicitud de inscripción al Plan <span className="text-rose">{plan.name}</span>.</p>
              <div className="flex flex-col gap-3 mb-6">
                <button onClick={sendWA}
                  className="w-full rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-sans font-semibold text-sm px-6 py-4 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_20px_rgba(37,211,102,0.25)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.40)] transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Enviar por WhatsApp
                </button>
                <button onClick={sendEmail}
                  className="w-full rounded-full border border-rose/30 bg-rose/05 hover:bg-rose/10 text-charcoal/80 hover:text-charcoal font-sans font-semibold text-sm px-6 py-4 flex items-center justify-center gap-2.5 cursor-pointer transition-all">
                  <Mail className="w-4 h-4 text-rose shrink-0" />
                  Enviar por Correo
                </button>
              </div>
              <button onClick={() => setStep(2)}
                className="w-full text-white/30 hover:text-white/60 font-sans text-xs cursor-pointer transition-colors">
                Atrás
              </button>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === 3 && sent && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-5 py-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blush/30 to-rose/20 border border-rose/20 flex items-center justify-center">
                <Crown className="w-7 h-7 text-rose" />
              </div>
              <div>
                <h3 className="font-display font-light text-2xl text-charcoal mb-2">¡Solicitud enviada!</h3>
                <p className="text-muted font-sans text-sm leading-relaxed">
                  {sent === "wa"
                    ? "Tu WhatsApp se abrió con los detalles. Envía el mensaje y te confirmamos en breve."
                    : "Tu correo se abrió con la solicitud. Envíalo y te confirmamos en menos de 24 horas."}
                </p>
              </div>
              <button
                onClick={() => onDone(name)}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm cursor-pointer shadow-[0_8px_25px_rgba(212,97,140,0.35)] transition-all hover:shadow-[0_12px_35px_rgba(212,97,140,0.45)]">
                Ver mi membresía
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="bg-white/[0.04] border border-white/08 rounded-xl px-4 py-3 text-charcoal/90 font-sans text-sm placeholder:text-muted/40 focus:outline-none focus:border-rose/40 focus:bg-white/06 transition-all" />
    </div>
  );
}

// ─── Active membership card ───────────────────────────────────────────────────

function MemberCard({ enrollment, onCancel }: { enrollment: Enrollment; onCancel: () => void }) {
  const plan = plans.find((p) => p.name === enrollment.plan) ?? plans[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden border border-rose/20 shadow-[0_20px_60px_rgba(212,97,140,0.18)]"
      style={{ background: "linear-gradient(135deg, #2a1520 0%, #1a1512 50%, #200f18 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 80% at 30% 50%, rgba(212,97,140,0.10) 0%, transparent 65%)" }} />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/50 to-transparent" />

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-deep to-rose flex items-center justify-center shadow-[0_8px_24px_rgba(212,97,140,0.45)] shrink-0">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-rose text-[10px] font-sans tracking-[0.3em] uppercase mb-0.5">Tu membresía activa</p>
            <h3 className="font-display font-light text-3xl text-charcoal">Plan <span className="gradient-text">{plan.name}</span></h3>
            <p className="text-muted font-sans text-xs mt-0.5">
              Miembro desde {format(new Date(enrollment.since), "d 'de' MMMM yyyy", { locale: es })}
              {enrollment.name ? ` · ${enrollment.name}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 md:items-end w-full md:w-auto">
          <div className="flex flex-wrap gap-2">
            {plan.items.slice(0, 3).map((item) => (
              <span key={item} className="px-3 py-1 rounded-full bg-rose/10 border border-rose/15 text-rose text-[10px] font-sans font-medium tracking-wide">
                {item}
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <a href="#contact"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white text-xs font-sans font-semibold cursor-pointer shadow-[0_4px_14px_rgba(212,97,140,0.35)] hover:shadow-[0_6px_20px_rgba(212,97,140,0.50)] transition-all">
              Agendar sesión
            </a>
            <button onClick={onCancel}
              className="px-5 py-2 rounded-full border border-white/10 text-white/30 hover:text-white/60 text-xs font-sans cursor-pointer transition-colors">
              Cambiar plan
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function Pricing() {
  const ref                                     = useRef<HTMLElement>(null);
  const [activePlan, setActivePlan]             = useState<Enrollment | null>(null);
  const [enrollingIn, setEnrollingIn]           = useState<(typeof plans)[0] | null>(null);

  // Load persisted enrollment
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setActivePlan(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function handleEnrolled(planName: string, memberName: string) {
    const enrollment: Enrollment = {
      plan:  planName,
      name:  memberName,
      since: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollment));
    setActivePlan(enrollment);
    setEnrollingIn(null);
  }

  function handleCancel() {
    localStorage.removeItem(STORAGE_KEY);
    setActivePlan(null);
  }

  useEffect(() => {
    let kills: { kill: () => void }[] = [];
    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!ref.current) return;

      const heading = ref.current.querySelector<HTMLElement>(".section-heading");
      if (heading) {
        const words = splitWords(heading);
        gsap.from(words, {
          opacity: 0, yPercent: 100, rotation: 5,
          duration: 1, stagger: 0.08, ease: "power1.out",
          scrollTrigger: { trigger: heading, start: "top 80%" },
        });
      }

      const cards = ref.current.querySelectorAll<HTMLElement>(".price-card");
      cards.forEach((card, i) => {
        const tween = gsap.from(card, {
          opacity: 0, y: 50,
          rotation: i === 0 ? -2 : i === 2 ? 2 : 0,
          duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 82%", toggleActions: "play none none none", once: true },
          delay: i * 0.12,
        });
        if (tween.scrollTrigger) kills.push(tween.scrollTrigger);
      });
    };
    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  return (
    <section id="pricing" ref={ref} className="relative py-20 md:py-32 bg-skin">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(212,97,140,0.06) 0%, transparent 65%)" }} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 text-center">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Invierte en Ti</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl lg:text-7xl text-charcoal leading-tight">
            Elige tu <span className="gradient-text italic">experiencia</span>
          </h2>
        </div>

        {/* Active membership card */}
        {activePlan && (
          <div className="mb-12">
            <MemberCard enrollment={activePlan} onCancel={handleCancel} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`price-card relative rounded-3xl p-8 border transition-all duration-500 ${
                plan.highlight
                  ? "bg-gradient-to-b from-petal to-snow border-rose/25 shadow-[0_20px_60px_rgba(212,97,140,0.22)] md:-translate-y-4"
                  : "bg-snow border-white/[0.06] hover:border-rose/20 hover:shadow-[0_12px_40px_rgba(212,97,140,0.12)]"
              } ${activePlan?.plan === plan.name ? "ring-2 ring-rose/40" : ""}`}
              whileHover={{ y: plan.highlight ? -4 : -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white text-[10px] font-sans font-semibold tracking-[0.2em] uppercase shadow-[0_4px_20px_rgba(212,97,140,0.35)]">
                    La Favorita
                  </span>
                </div>
              )}

              {activePlan?.plan === plan.name && (
                <div className="absolute -top-3.5 right-5">
                  <span className="px-3 py-1.5 rounded-full bg-rose/20 border border-rose/30 text-rose text-[10px] font-sans font-semibold tracking-[0.15em] uppercase flex items-center gap-1.5">
                    <Crown className="w-3 h-3" /> Mi plan
                  </span>
                </div>
              )}

              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent rounded-t-3xl" />

              <div className="mb-7">
                <p className="text-rose text-[10px] font-sans tracking-[0.3em] uppercase mb-3">{plan.name}</p>
                <div className="flex items-end gap-1.5 mb-3">
                  <span className="font-display font-light text-5xl text-charcoal">{plan.price}</span>
                  <span className="text-muted font-sans text-xs mb-2">{plan.period}</span>
                </div>
                <p className="text-muted font-sans text-sm leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {plan.items.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-rose/15 border border-rose/25 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-rose" />
                    </div>
                    <span className="text-charcoal/65 font-sans text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setEnrollingIn(plan)}
                className={`w-full text-center rounded-full py-3.5 text-sm font-sans font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                  activePlan?.plan === plan.name
                    ? "bg-rose/15 border border-rose/30 text-rose"
                    : plan.highlight
                    ? "bg-gradient-to-r from-rose-deep to-rose text-white shadow-[0_8px_25px_rgba(212,97,140,0.35)] hover:shadow-[0_12px_35px_rgba(212,97,140,0.45)]"
                    : "bg-white/[0.05] border border-white/10 text-charcoal/70 hover:bg-white/[0.08] hover:text-charcoal hover:border-rose/25"
                }`}
              >
                {activePlan?.plan === plan.name ? "Plan activo" : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enrollment modal */}
      <AnimatePresence>
        {enrollingIn && (
          <EnrollModal
            plan={enrollingIn}
            onClose={() => setEnrollingIn(null)}
            onDone={(memberName) => handleEnrolled(enrollingIn.name, memberName)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
