"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import { GlassCalendar } from "@/components/ui/glass-calendar";
import { format } from "date-fns";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const info = [
  { icon: MapPin,  label: "Dirección",       value: "Calle Oeste 10, Sector Vista Hermosa, Santo Domingo Este" },
  { icon: Phone,   label: "Reservas",   value: "+1 809-627-0658" },
  { icon: Mail,    label: "Email",          value: "hello@munequitaspa.com" },
  { icon: Clock,   label: "Horarios",          value: "Lun – Vie: 9AM–8PM · Sáb–Dom: 10AM–5PM" },
];

const services = [
  "Medicina Estética", "Armonización Facial", "Aumento de Labios",
  "Botox", "Bioestimulación", "Limpieza Profunda",
  "Hollywood Peel", "Hidratación Facial", "Acné & Cicatrices",
  "Micropigmentación", "Láser Diodo Ice", "Eliminación de Tatuajes",
  "Nutrición & Bienestar", "Otro",
];

export default function Contact() {
  const [sent, setSent]         = useState(false);
  const [busy, setBusy]         = useState(false);
  const [apptDate, setApptDate] = useState<Date>(new Date());
  const formRef                 = useRef<HTMLFormElement>(null);
  const sectionRef              = useRef<HTMLElement>(null);

  useEffect(() => {
    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!sectionRef.current) return;

      // Heading word-split reveal
      const heading = sectionRef.current.querySelector<HTMLElement>(".section-heading");
      if (heading) {
        const words = splitWords(heading);
        gsap.from(words, {
          opacity: 0,
          yPercent: 100,
          rotation: 5,
          duration: 1,
          stagger: 0.08,
          ease: "power1.out",
          scrollTrigger: { trigger: heading, start: "top 80%" },
        });
      }

      // Info column slides from left — Salvato contato_main effect
      const infoCol = sectionRef.current.querySelector<HTMLElement>(".contact-info");
      if (infoCol) {
        gsap.from(infoCol, {
          x: "-60vw",
          opacity: 0,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: infoCol, start: "top 80%" },
        });
      }

      // Form slides from right
      const formCol = sectionRef.current.querySelector<HTMLElement>(".contact-form");
      if (formCol) {
        gsap.from(formCol, {
          x: "60vw",
          opacity: 0,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: formCol, start: "top 80%" },
        });
      }

      // Background expand: starts as a centered band, expands to full — Salvato contato_back
      const bg = sectionRef.current.querySelector<HTMLElement>(".contact-bg");
      if (bg) {
        gsap.from(bg, {
          scaleY: 0.3,
          opacity: 0,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        });
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise(r => setTimeout(r, 1400));
    setBusy(false);
    setSent(true);
  };

  return (
    <section id="contact" ref={sectionRef} className="relative py-20 md:py-28 bg-skin overflow-hidden">
      {/* Animated bg band — Salvato contato_back */}
      <div className="contact-bg absolute inset-0 pointer-events-none origin-center"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,97,140,0.06) 0%, transparent 70%)" }} />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Agenda Tu Cita</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl lg:text-7xl text-charcoal leading-tight">
            Tu <span className="gradient-text italic">glow</span> comienza hoy
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Info column */}
          <div className="contact-info lg:col-span-2 flex flex-col gap-8">
            <p className="text-muted font-sans text-sm leading-relaxed max-w-xs">
              Da el primer paso hacia tu mejor versión. Nuestro equipo te confirmará la cita en menos de 24 horas con atención completamente personalizada.
            </p>

            <div className="flex flex-col gap-5">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-white/05 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-rose" />
                  </div>
                  <div>
                    <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-0.5">{label}</p>
                    <p className="text-charcoal/70 font-sans text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t border-white/06 hidden lg:block">
              <p className="font-display font-light italic text-charcoal/40 text-lg leading-relaxed">
                &ldquo;No vendemos tratamientos. Creamos experiencias que te hacen sentir extraordinaria.&rdquo;
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="contact-form lg:col-span-3">
            <div className="bg-snow rounded-3xl p-8 md:p-10 border border-white/06 shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(212,97,140,0.05) 0%, transparent 70%)", filter: "blur(40px)" }} />

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center py-12 text-center gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blush/30 to-rose/20 border border-rose/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-light text-2xl text-charcoal mb-2">¡Tu ritual está en camino!</h3>
                    <p className="text-muted font-sans text-sm">Nos comunicaremos contigo en menos de 24 horas para confirmar todos los detalles de tu experiencia.</p>
                  </div>
                </motion.div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Nombre Completo" type="text"  name="name"  placeholder="Tu nombre" required />
                    <Field label="Correo"           type="email" name="email" placeholder="tucorreo@email.com" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Teléfono" type="tel" name="phone" placeholder="+1 (809) 000-0000" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">Servicio</label>
                      <select name="service" defaultValue=""
                        className="bg-white/[0.04] border border-white/08 rounded-xl px-4 py-3 text-charcoal/90 font-sans text-sm focus:outline-none focus:border-rose/40 focus:bg-white/06 transition-all appearance-none cursor-pointer">
                        <option value="" disabled className="bg-[#1a1512]">Selecciona un servicio</option>
                        {services.map(s => (
                          <option key={s} value={s} className="bg-[#1a1512]">{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calendar date picker */}
                  <input type="hidden" name="date" value={format(apptDate, "yyyy-MM-dd")} />
                  <div className="flex flex-col gap-3">
                    <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">
                      Fecha Preferida — <span className="text-rose/70 normal-case tracking-normal">{format(apptDate, "d 'de' MMMM, yyyy")}</span>
                    </label>
                    <GlassCalendar
                      selectedDate={apptDate}
                      onDateSelect={setApptDate}
                      className="max-w-full bg-white/[0.04] border-white/08"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">Mensaje</label>
                    <textarea name="message" rows={3} placeholder="Solicitudes especiales o comentarios…"
                      className="bg-black/[0.03] border border-black/08 rounded-xl px-4 py-3 text-charcoal/70 font-sans text-sm placeholder:text-muted/50 focus:outline-none focus:border-rose/30 focus:bg-black/05 transition-all resize-none" />
                  </div>

                  <button type="submit" disabled={busy}
                    className="mt-2 group relative overflow-hidden rounded-full bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm px-8 py-4 flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_8px_30px_rgba(212,97,140,0.35)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className="relative z-10">
                      {busy ? "Enviando…" : "Agenda mi cita ahora"}
                    </span>
                    {!busy && (
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, type, name, placeholder, required }: {
  label: string; type: string; name: string; placeholder: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">{label}</label>
      <input
        type={type} name={name} placeholder={placeholder} required={required}
        className="bg-white/[0.04] border border-white/08 rounded-xl px-4 py-3 text-charcoal/90 font-sans text-sm placeholder:text-muted/50 focus:outline-none focus:border-rose/40 focus:bg-white/06 transition-all"
      />
    </div>
  );
}
