"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const plans = [
  {
    name: "Esencia",
    price: "$89",
    period: "por sesión",
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
    period: "por mes",
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
    period: "día completo",
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

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let kills: { kill: () => void }[] = [];

    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!ref.current) return;

      const heading = ref.current.querySelector<HTMLElement>(".section-heading");
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

      const cards = ref.current.querySelectorAll<HTMLElement>(".price-card");
      cards.forEach((card, i) => {
        const tween = gsap.from(card, {
          opacity: 0,
          y: 50,
          rotation: i === 0 ? -2 : i === 2 ? 2 : 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            toggleActions: "play none none none",
            once: true,
          },
          delay: i * 0.12,
        });
        const st = tween.scrollTrigger;
        if (st) kills.push(st);
      });
    };

    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  return (
    <section id="pricing" ref={ref} className="relative py-20 md:py-32 bg-skin">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(212,97,140,0.06) 0%, transparent 65%)" }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 text-center">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Invierte en Ti</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl lg:text-7xl text-charcoal leading-tight">
            Elige tu <span className="gradient-text italic">experiencia</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`price-card relative rounded-3xl p-8 border transition-all duration-500 ${
                plan.highlight
                  ? "bg-gradient-to-b from-petal to-snow border-rose/25 shadow-[0_20px_60px_rgba(212,97,140,0.22)] md:-translate-y-4"
                  : "bg-snow border-white/[0.06] hover:border-rose/20 hover:shadow-[0_12px_40px_rgba(212,97,140,0.12)]"
              }`}
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

              <a
                href="#contact"
                className={`block text-center rounded-full py-3.5 text-sm font-sans font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                  plan.highlight
                    ? "bg-gradient-to-r from-rose-deep to-rose text-white shadow-[0_8px_25px_rgba(212,97,140,0.35)] hover:shadow-[0_12px_35px_rgba(212,97,140,0.45)]"
                    : "bg-white/[0.05] border border-white/10 text-charcoal/70 hover:bg-white/[0.08] hover:text-charcoal hover:border-rose/25"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
