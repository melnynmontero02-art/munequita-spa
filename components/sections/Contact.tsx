"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { GlassCalendar } from "@/components/ui/glass-calendar";
import { TimeSlots } from "@/components/ui/TimeSlots";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";
import { bookSlot } from "@/lib/slots";
import { saveAppointment } from "@/lib/appointments";

const info = [
  { icon: MapPin,  label: "Dirección",       value: "Calle Oeste 10, Sector Vista Hermosa, Santo Domingo Este" },
  { icon: Phone,   label: "Reservas",   value: "+1 809-627-0658" },
  { icon: Mail,    label: "Email",          value: "munequita.spa01@gmail.com" },
  { icon: Clock,   label: "Horarios",          value: "Lun – Vie: 9AM–8PM · Sáb–Dom: 10AM–5PM" },
];

const services = [
  "Medicina Estética", "Armonización Facial", "Aumento de Labios",
  "Botox", "Bioestimulación", "Limpieza Profunda",
  "Hollywood Peel", "Hidratación Facial", "Acné & Cicatrices",
  "Micropigmentación", "Láser Diodo Ice", "Eliminación de Tatuajes",
  "Nutrición & Bienestar", "Otro",
];

const WA_LINK   = "https://wa.me/18096270658";
const SPA_EMAIL = "munequita.spa01@gmail.com";

function buildMessage(fields: Record<string, string>): string {
  return [
    "Hola! Me gustaría agendar una cita en Muñequita Spa:",
    "",
    `Nombre: ${fields.name}`,
    fields.phone ? `Teléfono: ${fields.phone}` : null,
    fields.email ? `Correo: ${fields.email}` : null,
    fields.service ? `Servicio: ${fields.service}` : null,
    `Fecha preferida: ${fields.date}`,
    fields.time ? `Hora preferida: ${fields.time}` : null,
  ].filter(Boolean).join("\n");
}

export default function Contact() {
  const [sent, setSent]                 = useState<"wa" | "email" | null>(null);
  const [apptDate, setApptDate]         = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const formRef                         = useRef<HTMLFormElement>(null);
  const sectionRef                      = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      setSelectedService(title);
      setSent(null);
    };
    window.addEventListener("service:select", handler);
    return () => window.removeEventListener("service:select", handler);
  }, []);

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

  function getFields(): Record<string, string> | null {
    if (!formRef.current) return null;
    const fd = new FormData(formRef.current);
    const name = (fd.get("name") as string)?.trim();
    if (!name) { formRef.current.querySelector<HTMLInputElement>('[name="name"]')?.focus(); return null; }
    if (!selectedTime) return null;
    return {
      name,
      phone:   (fd.get("phone")   as string)?.trim() ?? "",
      email:   (fd.get("email")   as string)?.trim() ?? "",
      service: (fd.get("service") as string)?.trim() ?? "",
      date:    format(apptDate, "d 'de' MMMM yyyy", { locale: es }),
      time:    selectedTime,
    };
  }

  function handleWhatsApp() {
    const fields = getFields();
    if (!fields) return;
    const dateStr = format(apptDate, "yyyy-MM-dd");
    bookSlot(dateStr, fields.time).catch(() => {});
    saveAppointment({ name: fields.name, email: fields.email, phone: fields.phone, service: fields.service, date: dateStr, time: fields.time, channel: "wa" });
    const text = encodeURIComponent(buildMessage(fields));
    setSent("wa");
    window.open(`${WA_LINK}?text=${text}`, "_blank");
  }

  function handleEmail() {
    const fields = getFields();
    if (!fields) return;
    const dateStr = format(apptDate, "yyyy-MM-dd");
    bookSlot(dateStr, fields.time).catch(() => {});
    saveAppointment({ name: fields.name, email: fields.email, phone: fields.phone, service: fields.service, date: dateStr, time: fields.time, channel: "email" });
    const subject = encodeURIComponent(`Solicitud de cita — ${fields.service || "Muñequita Spa"} — ${fields.name}`);
    const body    = encodeURIComponent(buildMessage(fields));
    setSent("email");
    window.location.href = `mailto:${SPA_EMAIL}?subject=${subject}&body=${body}`;
  }

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
                    <p className="text-muted font-sans text-sm">
                      {sent === "wa"
                        ? "Tu WhatsApp se abrió con los detalles. Envía el mensaje y te confirmamos en breve."
                        : "Tu correo se abrió con los detalles. Envíalo y te confirmamos en menos de 24 horas."}
                    </p>
                    <button onClick={() => setSent(null)}
                      className="mt-5 text-rose/60 hover:text-rose font-sans text-xs underline underline-offset-4 transition-colors cursor-pointer">
                      Agendar otra cita
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form ref={formRef} className="flex flex-col gap-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Nombre Completo" type="text"  name="name"  placeholder="Tu nombre" required />
                    <Field label="Correo"           type="email" name="email" placeholder="tucorreo@email.com" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Teléfono" type="tel" name="phone" placeholder="+1 (809) 000-0000" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">Servicio</label>
                      <select name="service" value={selectedService} onChange={e => setSelectedService(e.target.value)}
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

                  {/* Time slot picker */}
                  <TimeSlots
                    date={apptDate}
                    selected={selectedTime}
                    onSelect={(t) => setSelectedTime(t || null)}
                  />

                  {!selectedTime && (
                    <p className="text-charcoal/40 font-sans text-[11px] -mt-2">
                      Selecciona una hora para continuar
                    </p>
                  )}

                  {/* CTA buttons */}
                  <div className="mt-2 flex flex-col sm:flex-row gap-3">
                    {/* WhatsApp */}
                    <button type="button" onClick={handleWhatsApp} disabled={!selectedTime}
                      className="flex-1 group relative overflow-hidden rounded-full bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-semibold text-sm px-6 py-4 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_20px_rgba(37,211,102,0.25)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.40)] transition-all duration-300">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Agendar por WhatsApp
                    </button>

                    {/* Email */}
                    <button type="button" onClick={handleEmail} disabled={!selectedTime}
                      className="flex-1 group rounded-full border border-rose/30 bg-rose/05 hover:bg-rose/10 disabled:opacity-40 disabled:cursor-not-allowed text-charcoal/80 hover:text-charcoal font-sans font-semibold text-sm px-6 py-4 flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300">
                      <Mail className="w-4 h-4 text-rose shrink-0" />
                      Agendar por Correo
                    </button>
                  </div>
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
