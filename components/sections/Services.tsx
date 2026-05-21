"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Sparkles } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const services = [
  {
    n: "01", title: "Skin Glow", price: "RD$6,500", duration: "60 min",
    desc: "Glow inmediato y piel visiblemente transformada. Hidratación profunda, vitaminas, ácido hialurónico y activos premium para una piel jugosa, luminosa y radiante desde la primera sesión.",
    benefits: ["Hidratación profunda con ácido hialurónico", "Vitaminas C y E de alta concentración", "Efecto glow inmediato desde la primera sesión", "Sin tiempo de recuperación", "Apta para todo tipo de piel"],
    ideal: "Todo tipo de piel, especialmente piel opaca o deshidratada",
  },
  {
    n: "02", title: "Collagen Booster", price: "RD$12,500", duration: "75 min",
    desc: "Activa tu colágeno natural con bioestimuladores de élite: PDRN, polinucleótidos y ácido hialurónico de alta concentración. Piel más firme, elástica y rejuvenecida con resultados progresivos y duraderos.",
    benefits: ["PDRN y polinucleótidos de última generación", "Estimulación natural de colágeno propio", "Resultados visibles desde la 2ª semana", "Efecto lifting progresivo", "Duración: 6–12 meses"],
    ideal: "Piel con pérdida de firmeza, flacidez leve o signos de envejecimiento",
  },
  {
    n: "03", title: "Armonización Facial", price: "A consultar", duration: "75 min",
    desc: "Diseño y equilibrio facial personalizado para realzar tu simetría natural. Resultados elegantes y naturales que te hacen lucir renovada, armoniosa y completamente tú.",
    benefits: ["Análisis facial personalizado previo", "Rellenos de ácido hialurónico premium", "Diseño simétrico y proporcionado", "Resultados naturales e inmediatos", "Reversible y seguro"],
    ideal: "Quienes buscan mejorar su armonía facial sin cambiar su esencia",
  },
  {
    n: "04", title: "Volumen & Glow Labial", price: "A consultar", duration: "45 min",
    desc: "Labios más voluminosos, definidos e irresistiblemente hidratados con ácido hialurónico premium. Corrección de asimetrías y ese brillo natural que transforma toda tu expresión.",
    benefits: ["Ácido hialurónico de ultra alta densidad", "Corrección de asimetrías", "Definición del arco de Cupido", "Hidratación intensa y duradera", "Efecto natural, no exagerado"],
    ideal: "Labios finos, asimétricos o que han perdido volumen y definición",
  },
  {
    n: "05", title: "Botox de Precisión", price: "RD$17,000", duration: "30 min",
    desc: "3 áreas tratadas con toxina botulínica de máxima pureza. Suaviza líneas de expresión, previene arrugas y te devuelve un rostro fresco, descansado y naturalmente joven.",
    benefits: ["Toxina botulínica de máxima pureza", "Incluye frente, entrecejo y patas de gallo", "Sin expresión congelada — resultado natural", "Efecto visible en 5–7 días", "Duración: 4–6 meses"],
    ideal: "Líneas de expresión, frente marcada, entrecejo fruncido",
  },
  {
    n: "06", title: "Bioestimulación de Colágeno", price: "A consultar", duration: "60 min",
    desc: "Estimula los fibroblastos de tu piel para producir colágeno propio. Firmeza, elasticidad y luminosidad que crecen semana a semana con resultados naturales que duran meses.",
    benefits: ["Estimulación de fibroblastos dérmicos", "Colágeno 100% natural producido por tu piel", "Mejora textura, firmeza y luminosidad", "Resultados acumulativos y progresivos", "Protocolo de 3–4 sesiones recomendado"],
    ideal: "Piel madura, con pérdida de elasticidad o textura irregular",
  },
  {
    n: "07", title: "Ritual de Limpieza Profunda", price: "RD$4,500", duration: "75 min",
    desc: "Pureza total en un ritual de lujo: limpieza, exfoliación, extracción y activos calmantes premium. Poros libres, piel renovada y ese glow fresco que sólo Muñequita Spa sabe dar.",
    benefits: ["Limpieza enzimática en 3 pasos", "Extracción profesional de comedones", "Mascarilla purificante con argilla blanca", "Sueros calmantes post-tratamiento", "Ideal mensual para mantenimiento"],
    ideal: "Piel con poros dilatados, exceso de grasa o impurezas acumuladas",
  },
  {
    n: "08", title: "Hollywood Peel", price: "RD$4,000", duration: "50 min",
    desc: "El secreto glow de las celebrities. Peeling láser de carbono que afina poros, borra manchas y revela una piel cinematográficamente luminosa. Sesión mensual por 4 meses para resultados óptimos.",
    benefits: ["Láser de carbono activo Nd:YAG", "Afina poros visiblemente en una sesión", "Reduce manchas y tono desigual", "Sin dolor ni tiempo de recuperación", "Resultado glow inmediato y duradero"],
    ideal: "Todo tipo de piel, especialmente piel con poros abiertos, manchas o tono irregular",
  },
  {
    n: "09", title: "Hidratación & Glow Intensivo", price: "A consultar", duration: "60 min",
    desc: "Infusión de ácido hialurónico, vitaminas y sueros de alta concentración para una piel plumpeada, iluminada y visiblemente más joven. El ritual de hidratación más completo del menú.",
    benefits: ["Cóctel vitamínico personalizado", "Ácido hialurónico multi-molecular", "Efecto plumping inmediato", "Piel iluminada desde la primera sesión", "Refuerza la barrera cutánea"],
    ideal: "Piel deshidratada, apagada o con signos de estrés y fatiga",
  },
  {
    n: "10", title: "Acné, Manchas & Cicatrices", price: "RD$5,000", duration: "60 min",
    desc: "Protocolo clínico-estético personalizado que controla brotes, borra manchas oscuras y suaviza cicatrices. Piel más uniforme, saludable y luminosa desde las primeras sesiones.",
    benefits: ["Diagnóstico personalizado de piel", "Ácidos despigmentantes de alta eficacia", "Luz LED anti-inflamatoria", "Sueros cicatrizantes y reguladores", "Protocolo de seguimiento incluido"],
    ideal: "Acné activo, manchas post-inflamatorias, cicatrices superficiales",
  },
  {
    n: "11", title: "Micropigmentación Artística", price: "Desde RD$4,000", duration: "120 min",
    desc: "Cejas perfectas desde RD$8,000 · Labios definidos desde RD$4,000. Arte semipermanente de precisión que enmarca tu belleza natural y te ahorra tiempo sin perder elegancia.",
    benefits: ["Diseño previo personalizado", "Pigmentos orgánicos de larga duración", "Técnica pelo a pelo o sombreado", "Retoque incluido a las 4–6 semanas", "Duración: 1–3 años según cuidados"],
    ideal: "Cejas escasas, asimétricas o quienes desean un maquillaje semipermanente natural",
  },
  {
    n: "12", title: "Blanqueamiento Corporal", price: "A consultar", duration: "60 min",
    desc: "Aclara y unifica zonas pigmentadas — axilas, entrepiernas, rodillas, codos y zona íntima — con protocolos seguros, no invasivos y adaptados a tu tono de piel.",
    benefits: ["Protocolos adaptados a cada tono de piel", "Activos despigmentantes de última generación", "Tratamiento 100% no invasivo", "Sin irritación ni tiempo de recuperación", "Resultados visibles desde la 3ª sesión"],
    ideal: "Hiperpigmentación en zonas de fricción, manchas por depilación o cambios hormonales",
  },
  {
    n: "13", title: "Masajes Corporales", price: "A consultar", duration: "60 min",
    desc: "Relajante, reductivo, drenaje linfático, descontracturante, anticelulítico, piedras calientes o postoperatorio. Elige tu ritual de bienestar corporal y déjate envolver en pura relajación sensorial.",
    benefits: ["7 tipos de masaje disponibles", "Aceites esenciales premium", "Ambiente spa de lujo", "Técnicas certificadas", "Reductivo con resultados medibles"],
    ideal: "Tensión muscular, retención de líquidos, post-operatorio, estrés o celulitis",
  },
  {
    n: "14", title: "Láser Diodo Ice", price: "Desde RD$600", duration: "45 min",
    desc: "Depilación definitiva sin dolor con tecnología de crioenfriamiento de última generación. Áreas cortas RD$600 · Áreas largas RD$800. Piel suave y libre de vello para siempre.",
    benefits: ["Tecnología Ice — sin dolor", "Efectivo en todo tipo de piel y vello", "Resultados definitivos en 6–8 sesiones", "Sesiones rápidas (20–45 min)", "Apta para rostro y cuerpo"],
    ideal: "Cualquier zona del cuerpo — apta para todo tipo de piel",
  },
  {
    n: "15", title: "Eliminación de Tatuajes", price: "Desde RD$3,500", duration: "30 min",
    desc: "Láser Q-switched de vanguardia para eliminar o aclarar tatuajes de forma segura y progresiva. Piel renovada, sin marcas y lista para comenzar de nuevo con la confianza que mereces.",
    benefits: ["Láser Q-switched Nd:YAG multicromático", "Fragmenta tinta sin dañar tejido sano", "Progresivo y seguro", "Número de sesiones según tamaño y color", "Evaluación previa gratuita"],
    ideal: "Tatuajes de cualquier color, tamaño y antigüedad",
  },
  {
    n: "16", title: "Nutrición & Bienestar Integral", price: "A consultar", duration: "Continuo",
    desc: "Tu transformación comienza desde adentro. Planes de nutrición y bienestar personalizados que potencian tus tratamientos estéticos y te llevan a tu mejor versión de forma sostenible.",
    benefits: ["Plan nutricional 100% personalizado", "Seguimiento semanal con especialista", "Suplementación dirigida", "Potencia resultados de tratamientos estéticos", "Enfoque integral cuerpo-mente"],
    ideal: "Quienes desean potenciar sus resultados estéticos desde adentro",
  },
];

export type ServiceItem = typeof services[0];

function ServiceModal({ service, onClose, onBook }: { service: ServiceItem; onClose: () => void; onBook: (title: string) => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full sm:max-w-lg bg-[#120e0c] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top gradient line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/40 to-transparent" />

          {/* Header */}
          <div className="flex items-start justify-between p-7 pb-5 shrink-0">
            <div>
              <span className="text-rose/60 font-sans text-[10px] tracking-[0.3em] uppercase block mb-1">{service.n}</span>
              <h3 className="font-display font-light text-2xl text-charcoal leading-tight">{service.title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-charcoal/50 hover:text-charcoal transition-all cursor-pointer shrink-0 mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-7 pb-7 flex flex-col gap-5">
            {/* Subscription + duration */}
            <div className="flex items-center gap-4">
              <div>
                <span className="text-charcoal/30 font-sans text-[9px] tracking-[0.25em] uppercase block mb-0.5">Planes</span>
                <span className="gradient-text font-display font-medium text-3xl">
                  {service.price}<span className="text-charcoal/30 font-sans text-sm font-normal ml-1">/ mes</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-charcoal/40">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-sans text-xs">{service.duration}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-charcoal/60 font-sans text-sm leading-relaxed">{service.desc}</p>

            {/* Benefits */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-rose/70" />
                <span className="text-charcoal/40 font-sans text-[10px] tracking-[0.25em] uppercase">Incluye</span>
              </div>
              <ul className="flex flex-col gap-2">
                {service.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-rose/50 mt-1.5 shrink-0" />
                    <span className="text-charcoal/65 font-sans text-xs leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideal for */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <span className="text-charcoal/35 font-sans text-[10px] tracking-widest uppercase block mb-1">Ideal para</span>
              <p className="text-charcoal/60 font-sans text-xs leading-relaxed">{service.ideal}</p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => onBook(service.title)}
              className="w-full rounded-full bg-gradient-to-r from-rose-deep to-rose text-white font-sans font-semibold text-sm px-6 py-4 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(212,97,140,0.35)] hover:shadow-[0_6px_28px_rgba(212,97,140,0.5)] transition-all duration-300"
            >
              Agendar esta cita
              <span className="text-white/70">→</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    const kills: { kill: () => void }[] = [];

    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!ref.current) return;

      const heading = ref.current.querySelector<HTMLElement>(".section-heading");
      if (heading) {
        const words = splitWords(heading);
        gsap.set(words, { opacity: 0, yPercent: 100, rotation: 5 });
        const k = ScrollTrigger.create({
          trigger: heading,
          start: "top 80%",
          once: true,
          onEnter: () => gsap.to(words, { opacity: 1, yPercent: 0, rotation: 0, duration: 1, stagger: 0.08, ease: "power1.out" }),
        });
        kills.push(k);
      }

      const cards = ref.current.querySelectorAll<HTMLElement>(".srv-card");
      cards.forEach((card, i) => {
        const k = ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(card, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: (i % 4) * 0.07 }),
        });
        gsap.set(card, { y: 40 });
        kills.push(k);
      });
    };

    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  function handleBook(serviceTitle: string) {
    setActiveService(null);
    // Notify Contact section to pre-select this service
    window.dispatchEvent(new CustomEvent("service:select", { detail: serviceTitle }));
    // Scroll to contact
    setTimeout(() => {
      const lenis = (window as unknown as Record<string, unknown>).__lenis as { scrollTo: (target: string, opts: object) => void } | undefined;
      if (lenis) {
        lenis.scrollTo("#contact", { offset: -80 });
      } else {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  return (
    <>
      <section id="services" ref={ref} className="relative py-20 md:py-28 bg-cream">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 80% 30%, rgba(212,97,140,0.07) 0%, transparent 65%)" }}
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Rituales de Belleza</p>
            <h2 className="section-heading font-display font-light text-5xl md:text-6xl lg:text-7xl text-charcoal leading-tight">
              Tratamientos que <span className="gradient-text italic">te enamoran</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/[0.06]">
            {services.map((s, i) => (
              <div key={s.n} className="srv-card">
                <motion.article
                  className="group relative bg-cream px-7 py-8 cursor-pointer overflow-hidden h-full flex flex-col"
                  animate={{
                    opacity: hovered === null || hovered === i ? 1 : 0.2,
                    filter:  hovered === null || hovered === i ? "blur(0px)" : "blur(2px)",
                    scale:   hovered === null || hovered === i ? 1 : 0.98,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  onHoverStart={() => setHovered(i)}
                  onHoverEnd={() => setHovered(null)}
                  onClick={() => setActiveService(s)}
                >
                  <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-rose-deep via-rose to-transparent transition-all duration-500 ease-out" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(212,97,140,0.07) 0%, transparent 65%)" }}
                  />
                  <span className="text-rose/60 group-hover:text-rose font-sans text-[10px] font-medium tracking-[0.3em] uppercase mb-4 block transition-colors duration-300">
                    {s.n}
                  </span>
                  <h3 className="font-display font-light text-charcoal/80 group-hover:text-charcoal text-2xl md:text-[1.65rem] leading-tight mb-3 transition-colors duration-300">
                    {s.title}
                  </h3>
                  <div className="mb-5">
                    <span className="text-charcoal/30 font-sans text-[9px] tracking-[0.25em] uppercase block mb-1 transition-colors duration-300 group-hover:text-charcoal/45">Planes</span>
                    <p className="gradient-text font-display font-medium text-3xl md:text-4xl leading-none transition-transform duration-300 group-hover:-translate-y-0.5">
                      {s.price}<span className="text-charcoal/30 font-sans text-sm font-normal ml-1">/ mes</span>
                    </p>
                  </div>
                  <p className="text-charcoal/45 group-hover:text-charcoal/65 font-sans text-xs leading-relaxed mb-5 flex-1 transition-colors duration-300">
                    {s.desc}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-rose/40 group-hover:bg-rose transition-colors duration-300" />
                      <span className="text-charcoal/30 group-hover:text-charcoal/50 font-sans text-[10px] tracking-widest uppercase transition-colors duration-300">
                        {s.duration}
                      </span>
                    </div>
                    <span className="text-rose/0 group-hover:text-rose/70 font-sans text-xs tracking-widest transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      Ver más →
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-gradient-to-r from-rose/30 to-transparent transition-all duration-700 ease-out" />
                </motion.article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeService && (
        <ServiceModal
          service={activeService}
          onClose={() => setActiveService(null)}
          onBook={handleBook}
        />
      )}
    </>
  );
}
