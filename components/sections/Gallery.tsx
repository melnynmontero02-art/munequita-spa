"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";

const photos = [
  { src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=900&q=85", alt: "Sala de tratamiento con velas", wide: true },
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&q=85", alt: "Tratamiento facial", wide: false },
  { src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=85", alt: "Terapia de piedras calientes", wide: false },
  { src: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=900&q=85", alt: "Zona de spa", wide: true },
  { src: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=700&q=85", alt: "Área de relajación", wide: false },
  { src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=700&q=85", alt: "Productos de spa", wide: false },
];

export default function Gallery() {
  const ref   = useRef<HTMLElement>(null);
  const [light, setLight] = useState<string | null>(null);

  useEffect(() => {
    let kills: { kill: () => void }[] = [];

    const init = async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (!ref.current) return;

      // Heading word-split
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

      // Gallery photos: scale 0.95 + rotation 1 → scrub to 1 + 0
      // Salvato: clinica-galeria-foto effect
      const items = ref.current.querySelectorAll<HTMLElement>(".gal-item");
      gsap.set(items, { scale: 0.95, rotation: 1, opacity: 0 });

      items.forEach((el, i) => {
        const k = ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          end: "top 40%",
          scrub: 0.8,
          onEnter: () => gsap.to(el, { opacity: 1, duration: 0.3 }),
          onUpdate: (self) => {
            gsap.set(el, {
              scale: 0.95 + self.progress * 0.05,
              rotation: 1 - self.progress,
            });
          },
        });
        kills.push(k);

        // Stagger delay via initial opacity reveal
        gsap.to(el, {
          opacity: 1,
          duration: 0.6,
          delay: (i % 3) * 0.12,
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });
    };

    init();
    return () => kills.forEach((k) => k.kill());
  }, []);

  return (
    <section id="gallery" ref={ref} className="relative py-20 md:py-28 bg-skin overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 20% 60%, rgba(212,97,140,0.08) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Nuestro Mundo</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl text-charcoal">
            Un espacio creado <span className="gradient-text italic">para ti</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div
              key={p.src}
              onClick={() => setLight(p.src)}
              className={`gal-item group relative overflow-hidden rounded-2xl cursor-pointer ${p.wide ? "md:col-span-2" : ""}`}
              style={{ aspectRatio: p.wide ? "16/7" : "4/5" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                  <span className="text-white text-xs font-sans font-medium tracking-wider uppercase">Ver</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {light && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLight(null)}
            className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl w-full aspect-video rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(212,97,140,0.25)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={light} alt="Galería Muñequita Spa" className="w-full h-full object-cover" />
              <button onClick={() => setLight(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 border border-white/20 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
