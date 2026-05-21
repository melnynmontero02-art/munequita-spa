"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, MessageSquarePlus, CheckCircle } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";
import { submitReview, listenApprovedReviews, type Review } from "@/lib/reviews";

const STATIC_REVIEWS: Review[] = [
  { name: "Valentina M.", role: "Empresaria · Santo Domingo", av: "VM", rating: 5, status: "aprobada", createdAt: 0,
    text: "Me sentí renovada desde la primera sesión. La atención de la Dra. Moreta es incomparable — personalizada, cálida y con resultados que yo no esperaba tan rápido. Mi piel nunca había lucido así." },
  { name: "Isabella F.", role: "Influencer & Creadora", av: "IF", rating: 5, status: "aprobada", createdAt: 0,
    text: "Vengo cada mes y cada vez supera mis expectativas. El ambiente, los productos, los rituales… todo está pensado para hacerte sentir la mujer más especial del mundo. Una experiencia que mereces vivir." },
  { name: "Luciana T.", role: "Médico · Santiago", av: "LT", rating: 5, status: "aprobada", createdAt: 0,
    text: "Como médica, soy muy exigente con los tratamientos que elijo. Muñequita Spa cumple todos mis criterios: ciencia, higiene, resultados naturales y un servicio de lujo que no encuentras en otro lugar." },
  { name: "Camila R.", role: "Directora de Moda", av: "CR", rating: 5, status: "aprobada", createdAt: 0,
    text: "Llegué buscando resultados y encontré mucho más — una experiencia que cambia cómo te ves y cómo te sientes. El glow que da el Skin Glow me duró semanas. Esto es bienestar de verdad." },
];

const marqueeItems = [
  "Skin Glow", "Medicina Estética", "Armonización Facial", "Bienestar",
  "Renovación", "Hollywood Peel", "Glow & Hidratación", "Transformación",
];

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer transition-transform hover:scale-110"
          aria-label={`${n} estrellas`}
        >
          <Star className={`w-6 h-6 transition-colors ${n <= (hover || value) ? "fill-rose text-rose" : "text-charcoal/20"}`} />
        </button>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [allReviews,  setAllReviews]  = useState<Review[]>(STATIC_REVIEWS);
  const [idx,         setIdx]         = useState(0);
  const [dir,         setDir]         = useState(1);
  const [showForm,    setShowForm]    = useState(false);
  const [sent,        setSent]        = useState(false);
  const [form,        setForm]        = useState({ name: "", role: "", rating: 5, text: "" });
  const [saving,      setSaving]      = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Load approved Firebase reviews and merge with static ones
  useEffect(() => {
    const unsub = listenApprovedReviews((fbReviews) => {
      setAllReviews([...STATIC_REVIEWS, ...fbReviews]);
    });
    return unsub;
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const t = setInterval(() => { setDir(1); setIdx(i => (i + 1) % allReviews.length); }, 6000);
    return () => clearInterval(t);
  }, [allReviews.length]);

  // GSAP scroll animations
  useEffect(() => {
    const kills: { kill: () => void }[] = [];
    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!ref.current) return;
      const heading = ref.current.querySelector<HTMLElement>(".section-heading");
      if (heading) {
        const words = splitWords(heading);
        gsap.from(words, {
          opacity: 0, yPercent: 100, rotation: 5, duration: 1,
          stagger: 0.08, ease: "power1.out",
          scrollTrigger: { trigger: heading, start: "top 80%" },
        });
      }
      const card = ref.current.querySelector<HTMLElement>(".testi-card");
      if (card) {
        gsap.from(card, {
          opacity: 0, y: 60, rotation: 2, duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 80%" },
        });
      }
    };
    init();
    return () => kills.forEach(k => k.kill());
  }, []);

  const go = (n: number) => { setDir(n > idx ? 1 : -1); setIdx(n); };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.text || !form.rating) return;
    setSaving(true);
    await submitReview({ name: form.name, role: form.role || undefined, rating: form.rating, text: form.text });
    setSaving(false);
    setSent(true);
    setForm({ name: "", role: "", rating: 5, text: "" });
  }

  const review = allReviews[idx] ?? allReviews[0];

  return (
    <section id="testimonials" ref={ref} className="relative py-20 md:py-28 bg-cream overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,97,140,0.04) 0%, transparent 70%)" }} />

      <div className="absolute top-16 inset-x-0 overflow-hidden pointer-events-none select-none">
        <div className="marquee-left flex whitespace-nowrap gap-16">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="font-display font-light text-charcoal/[0.06] text-6xl md:text-8xl shrink-0">{item}</span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-16 inset-x-0 overflow-hidden pointer-events-none select-none">
        <div className="marquee-right flex whitespace-nowrap gap-16">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="font-display font-light italic text-charcoal/[0.04] text-6xl md:text-8xl shrink-0">{item}</span>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Ellas Ya Lo Vivieron</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl text-charcoal">
            Historias que <span className="gradient-text italic">inspiran</span>
          </h2>
        </div>

        {/* Carousel card */}
        <div className="testi-card relative bg-snow rounded-3xl p-10 md:p-16 border border-white/06 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent rounded-t-3xl" />
          <div className="absolute -top-20 right-0 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,97,140,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={idx} custom={dir}
              variants={{
                enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 50 : -50 }),
                center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -35 : 35, transition: { duration: 0.3 } }),
              }}
              initial="enter" animate="center" exit="exit"
              className="flex flex-col gap-7"
            >
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-rose text-rose" />
                ))}
              </div>
              <p className="font-display font-light text-charcoal/75 text-xl md:text-2xl leading-relaxed italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-4 pt-5 border-t border-white/06">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blush to-rose flex items-center justify-center font-display font-semibold text-white text-sm shadow-[0_0_20px_rgba(212,97,140,0.25)]">
                  {review.av}
                </div>
                <div>
                  <p className="text-charcoal font-sans font-medium text-sm">{review.name}</p>
                  {review.role && <p className="text-muted font-sans text-xs">{review.role}</p>}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button type="button" onClick={() => go((idx - 1 + allReviews.length) % allReviews.length)}
              className="w-10 h-10 rounded-full bg-white/05 border border-white/10 flex items-center justify-center text-white/40 hover:text-rose hover:border-rose/30 transition-all cursor-pointer"
              aria-label="Anterior">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {allReviews.map((_, i) => (
                <button key={i} type="button" onClick={() => go(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${i === idx ? "w-7 h-2 bg-gradient-to-r from-rose-deep to-rose" : "w-2 h-2 bg-white/15 hover:bg-white/30"}`}
                  aria-label={`Testimonio ${i + 1}`} />
              ))}
            </div>
            <button type="button" onClick={() => go((idx + 1) % allReviews.length)}
              className="w-10 h-10 rounded-full bg-white/05 border border-white/10 flex items-center justify-center text-white/40 hover:text-rose hover:border-rose/30 transition-all cursor-pointer"
              aria-label="Siguiente">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CTA to leave review */}
        <div className="mt-10 text-center">
          {!showForm && !sent && (
            <button type="button" onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-rose/30 text-rose font-sans text-sm hover:bg-rose/10 transition-all cursor-pointer">
              <MessageSquarePlus className="w-4 h-4" />
              Deja tu reseña
            </button>
          )}

          {/* Success */}
          {sent && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-sans text-sm">
              <CheckCircle className="w-4 h-4" />
              ¡Gracias! Tu reseña está en revisión.
            </motion.div>
          )}
        </div>

        {/* Review form */}
        <AnimatePresence>
          {showForm && !sent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6"
            >
              <form onSubmit={handleSubmit}
                className="bg-snow border border-white/[0.08] rounded-3xl p-8 md:p-10 flex flex-col gap-5 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent rounded-t-3xl" />

                <p className="font-display font-light text-xl text-charcoal">Comparte tu experiencia</p>

                {/* Stars */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Calificación</label>
                  <StarPicker value={form.rating} onChange={n => setForm(p => ({ ...p, rating: n }))} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Nombre *</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-4 py-2.5 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Profesión / Ciudad</label>
                    <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                      placeholder="Ej. Empresaria · SD"
                      className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-4 py-2.5 text-charcoal/90 font-sans text-sm focus:outline-none transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase">Tu comentario *</label>
                  <textarea required value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                    placeholder="Cuéntanos tu experiencia en Muñequita Spa…"
                    rows={4}
                    className="bg-white/[0.04] border border-white/[0.08] focus:border-rose/40 rounded-xl px-4 py-2.5 text-charcoal/90 font-sans text-sm focus:outline-none transition-all resize-none leading-relaxed" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm hover:text-charcoal/80 transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving || !form.name || !form.text}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    {saving ? "Enviando…" : "Enviar reseña"}
                  </button>
                </div>

                <p className="text-charcoal/25 font-sans text-[11px] -mt-1">
                  Tu reseña será revisada antes de publicarse.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
