"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const team = [
  {
    name: "Dra. Yesenia Moreta",
    role: "Fundadora & Directora Médica",
    specialty: "Medicina Estética · Armonización · Bienestar",
    bio: "La mente y el corazón detrás de Muñequita Spa. La Dra. Moreta une su formación médica de élite con una visión estética refinada para crear experiencias que van más allá de la belleza — experiencias que transforman cómo te ves y cómo te sientes.",
    img: "/dra-yesenia-opt.jpg",
    years: "Fundadora",
    featured: true,
  },
];

export default function Team() {
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

      const cards = ref.current.querySelectorAll<HTMLElement>(".team-card");
      cards.forEach((card, i) => {
        const tween = gsap.from(card, {
          opacity: 0,
          y: 60,
          rotation: 2,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          delay: (i % 4) * 0.1,
        });
        const st = tween.scrollTrigger;
        if (st) kills.push(st);
      });
    };

    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  return (
    <section id="team" ref={ref} className="relative py-20 md:py-28 bg-cream overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 30% 50%, rgba(212,97,140,0.05) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Quién Nos Guía</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl lg:text-7xl text-charcoal leading-tight">
            La <span className="gradient-text italic">mente</span> detrás de tu transformación
          </h2>
        </div>

        <div className="team-card relative grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-rose/25 bg-gradient-to-br from-petal to-snow shadow-[0_20px_70px_rgba(212,97,140,0.22)] max-w-4xl mx-auto">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/40 to-transparent z-10" />

          {/* Foto — izquierda */}
          <div className="relative bg-petal/20" style={{ minHeight: "520px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team[0].img}
              alt={team[0].name}
              loading="lazy"
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-petal/50 pointer-events-none" />
            <div className="absolute bottom-6 left-6 z-10">
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white text-[10px] font-sans font-semibold tracking-[0.2em] uppercase shadow-[0_4px_15px_rgba(212,97,140,0.45)]">
                Fundadora
              </span>
            </div>
          </div>

          {/* Texto — derecha */}
          <div className="relative flex flex-col justify-center p-10 md:p-12 gap-5">
            <div className="absolute top-0 inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-rose/20 to-transparent hidden md:block" />
            <div>
              <p className="text-rose text-[10px] font-sans tracking-[0.3em] uppercase mb-4">{team[0].role}</p>
              <h3 className="font-display font-medium text-charcoal text-3xl md:text-4xl leading-tight mb-1">
                {team[0].name}
              </h3>
              <p className="text-muted/60 font-sans text-sm tracking-wide">{team[0].specialty}</p>
            </div>
            <div className="h-px w-12 bg-gradient-to-r from-rose/40 to-transparent" />
            <p className="text-muted font-sans text-sm leading-relaxed">{team[0].bio}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
