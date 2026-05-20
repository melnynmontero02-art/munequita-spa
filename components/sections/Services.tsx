"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const services = [
  { n: "01", title: "Skin Glow",                    price: "RD$6,500",   duration: "60 min",    desc: "Glow inmediato y piel visiblemente transformada. Hidratación profunda, vitaminas, ácido hialurónico y activos premium para una piel jugosa, luminosa y radiante desde la primera sesión." },
  { n: "02", title: "Collagen Booster",              price: "RD$12,500",  duration: "75 min",    desc: "Activa tu colágeno natural con bioestimuladores de élite: PDRN, polinucleótidos y ácido hialurónico de alta concentración. Piel más firme, elástica y rejuvenecida con resultados progresivos y duraderos." },
  { n: "03", title: "Armonización Facial",           price: "A consultar", duration: "75 min",  desc: "Diseño y equilibrio facial personalizado para realzar tu simetría natural. Resultados elegantes y naturales que te hacen lucir renovada, armoniosa y completamente tú." },
  { n: "04", title: "Volumen & Glow Labial",         price: "A consultar", duration: "45 min",  desc: "Labios más voluminosos, definidos e irresistiblemente hidratados con ácido hialurónico premium. Corrección de asimetrías y ese brillo natural que transforma toda tu expresión." },
  { n: "05", title: "Botox de Precisión",            price: "RD$17,000",  duration: "30 min",   desc: "3 áreas tratadas con toxina botulínica de máxima pureza. Suaviza líneas de expresión, previene arrugas y te devuelve un rostro fresco, descansado y naturalmente joven." },
  { n: "06", title: "Bioestimulación de Colágeno",   price: "A consultar", duration: "60 min",  desc: "Estimula los fibroblastos de tu piel para producir colágeno propio. Firmeza, elasticidad y luminosidad que crecen semana a semana con resultados naturales que duran meses." },
  { n: "07", title: "Ritual de Limpieza Profunda",   price: "RD$4,500",   duration: "75 min",   desc: "Pureza total en un ritual de lujo: limpieza, exfoliación, extracción y activos calmantes premium. Poros libres, piel renovada y ese glow fresco que sólo Muñequita Spa sabe dar." },
  { n: "08", title: "Hollywood Peel",                price: "RD$4,000",   duration: "50 min",   desc: "El secreto glow de las celebrities. Peeling láser de carbono que afina poros, borra manchas y revela una piel cinematográficamente luminosa. Sesión mensual por 4 meses para resultados óptimos." },
  { n: "09", title: "Hidratación & Glow Intensivo",  price: "A consultar", duration: "60 min",  desc: "Infusión de ácido hialurónico, vitaminas y sueros de alta concentración para una piel plumpeada, iluminada y visiblemente más joven. El ritual de hidratación más completo del menú." },
  { n: "10", title: "Acné, Manchas & Cicatrices",    price: "RD$5,000",   duration: "60 min",   desc: "Protocolo clínico-estético personalizado que controla brotes, borra manchas oscuras y suaviza cicatrices. Piel más uniforme, saludable y luminosa desde las primeras sesiones." },
  { n: "11", title: "Micropigmentación Artística",   price: "Desde RD$4,000", duration: "120 min", desc: "Cejas perfectas desde RD$8,000 · Labios definidos desde RD$4,000. Arte semipermanente de precisión que enmarca tu belleza natural y te ahorra tiempo sin perder elegancia." },
  { n: "12", title: "Blanqueamiento Corporal",       price: "A consultar", duration: "60 min",  desc: "Aclara y unifica zonas pigmentadas — axilas, entrepiernas, rodillas, codos y zona íntima — con protocolos seguros, no invasivos y adaptados a tu tono de piel. Luminosidad y confianza en cada cm²." },
  { n: "13", title: "Masajes Corporales",            price: "A consultar", duration: "60 min",  desc: "Relajante, reductivo, drenaje linfático, descontracturante, anticelulítico, piedras calientes o postoperatorio. Elige tu ritual de bienestar corporal y déjate envolver en pura relajación sensorial." },
  { n: "14", title: "Láser Diodo Ice",               price: "Desde RD$600", duration: "45 min", desc: "Depilación definitiva sin dolor con tecnología de crioenfriamiento de última generación. Áreas cortas RD$600 · Áreas largas RD$800. Piel suave y libre de vello para siempre." },
  { n: "15", title: "Eliminación de Tatuajes",       price: "Desde RD$3,500", duration: "30 min", desc: "Láser Q-switched de vanguardia para eliminar o aclarar tatuajes de forma segura y progresiva. Piel renovada, sin marcas y lista para comenzar de nuevo con la confianza que mereces." },
  { n: "16", title: "Nutrición & Bienestar Integral", price: "A consultar", duration: "Continuo", desc: "Tu transformación comienza desde adentro. Planes de nutrición y bienestar personalizados que potencian tus tratamientos estéticos y te llevan a tu mejor versión de forma sostenible." },
];

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

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
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              delay: (i % 4) * 0.07,
            }),
        });
        // Start from below
        gsap.set(card, { y: 40 });
        kills.push(k);
      });
    };

    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  return (
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
              >
                {/* Top accent bar — slides in on hover */}
                <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-rose-deep via-rose to-transparent transition-all duration-500 ease-out" />

                {/* Ambient glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(212,97,140,0.07) 0%, transparent 65%)" }}
                />

                {/* Number */}
                <span className="text-rose/60 group-hover:text-rose font-sans text-[10px] font-medium tracking-[0.3em] uppercase mb-4 block transition-colors duration-300">
                  {s.n}
                </span>

                {/* Title */}
                <h3 className="font-display font-light text-charcoal/80 group-hover:text-charcoal text-2xl md:text-[1.65rem] leading-tight mb-3 transition-colors duration-300">
                  {s.title}
                </h3>

                {/* Price */}
                <p className="gradient-text font-display font-medium text-3xl md:text-4xl leading-none mb-5 transition-transform duration-300 group-hover:-translate-y-0.5">
                  {s.price}
                </p>

                {/* Description */}
                <p className="text-charcoal/45 group-hover:text-charcoal/65 font-sans text-xs leading-relaxed mb-5 flex-1 transition-colors duration-300">
                  {s.desc}
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-rose/40 group-hover:bg-rose transition-colors duration-300" />
                    <span className="text-charcoal/30 group-hover:text-charcoal/50 font-sans text-[10px] tracking-widest uppercase transition-colors duration-300">
                      {s.duration}
                    </span>
                  </div>
                  {/* Arrow hint on hover */}
                  <span className="text-rose/0 group-hover:text-rose/70 font-sans text-xs tracking-widest transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    →
                  </span>
                </div>

                {/* Bottom line — extends on hover */}
                <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-gradient-to-r from-rose/30 to-transparent transition-all duration-700 ease-out" />
              </motion.article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
