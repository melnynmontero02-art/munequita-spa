"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const lines = [
  { text: "Tu belleza merece ser celebrada.",  size: "text-5xl md:text-7xl lg:text-8xl", italic: true },
  { text: "Cada día. Sin excusas.",            size: "text-5xl md:text-7xl lg:text-8xl", italic: false },
  { text: "Cada detalle. Cada ritual. Cada tú.", size: "text-2xl md:text-3xl",          italic: false },
  { text: "Creado para revelar tu mejor versión.", size: "text-2xl md:text-3xl",        italic: true },
];

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let kills: { kill: () => void }[] = [];

    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!ref.current) return;

      // Word-by-word reveal with rotation — Salvato signature effect
      ref.current.querySelectorAll<HTMLElement>(".manifest-line").forEach((el, i) => {
        const words = splitWords(el);
        gsap.set(words, { yPercent: 105, rotation: 5, opacity: 0 });

        const k = ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          onEnter: () =>
            gsap.to(words, {
              yPercent: 0,
              rotation: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.08,
              ease: "power1.out",
              delay: i * 0.05,
            }),
        });
        kills.push(k);
      });

      // Stats counter fade-up
      ref.current.querySelectorAll<HTMLElement>(".stat-item").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    };

    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  return (
    <section id="about" ref={ref} className="relative py-20 md:py-28 bg-cream overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,97,140,0.04) 0%, transparent 70%)" }} />

      <div className="max-w-5xl mx-auto px-6">
        <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-20 opacity-80">
          Nuestra Esencia
        </p>

        <div className="flex flex-col gap-6">
          {lines.map(({ text, size, italic }, i) => (
            <p
              key={i}
              className={`manifest-line font-display font-light text-charcoal leading-[1.05] tracking-tight ${size} ${italic ? "italic" : ""}`}
            >
              {i === 0 ? <>Tu belleza merece ser <span className="gradient-text italic">celebrada.</span></> :
               i === 1 ? <>Cada día. <span className="gradient-text">Sin excusas.</span></> :
               i === 2 ? <>Cada detalle. Cada ritual. Cada tú.</> :
               <>Creado para revelar tu <span className="gradient-text italic">mejor versión.</span></>}
            </p>
          ))}
        </div>

        <div className="mt-24 flex items-center gap-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-charcoal/10 to-transparent" />
          <span className="text-charcoal/25 text-[10px] font-sans tracking-[0.3em] uppercase">Est. 2018</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-charcoal/10 to-transparent" />
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8">
          {[
            { v: "10K+", l: "Clientas Transformadas" },
            { v: "50+",  l: "Rituales Exclusivos" },
            { v: "4.9★", l: "Satisfacción Total" },
          ].map(({ v, l }) => (
            <div key={l} className="stat-item text-center">
              <div className="font-display font-light text-4xl md:text-5xl gradient-text">{v}</div>
              <div className="text-muted text-xs font-sans mt-2 tracking-widest uppercase">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
