"use client";

import { useEffect, useRef } from "react";
import { MapPin, Clock, Phone } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { splitWords } from "@/lib/split-words";


export default function Location() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
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

      const mapEl = ref.current.querySelector<HTMLElement>(".map-frame");
      if (mapEl) {
        gsap.from(mapEl, {
          opacity: 0,
          scale: 0.96,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: mapEl, start: "top 80%" },
        });
      }

      const infoEl = ref.current.querySelector<HTMLElement>(".location-info");
      if (infoEl) {
        gsap.from(infoEl, {
          opacity: 0,
          x: 40,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: infoEl, start: "top 80%" },
        });
      }
    };

    init();
  }, []);

  return (
    <section id="location" ref={ref} className="relative py-20 md:py-28 bg-cream overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/15 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 40% at 80% 50%, rgba(212,97,140,0.05) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-rose text-[11px] font-sans font-medium tracking-[0.35em] uppercase mb-5">Visítanos</p>
          <h2 className="section-heading font-display font-light text-5xl md:text-6xl text-charcoal leading-tight">
            Tu santuario de belleza te <span className="gradient-text italic">espera</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Map */}
          <div
            className="map-frame lg:col-span-3 relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            style={{ height: "440px" }}
          >
            <iframe
              src="https://maps.google.com/maps?q=18.518944,-69.851000&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "grayscale(0.75) contrast(1.1) brightness(0.55) sepia(0.25)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Muñequita Spa Location"
            />
            <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/[0.08]" />
            {/* Centered pin overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-2.5 drop-shadow-2xl">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-deep to-rose flex items-center justify-center shadow-[0_0_30px_rgba(212,97,140,0.7)]">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-charcoal/95 backdrop-blur border border-white/10 text-white text-xs font-sans font-medium shadow-xl">
                  Muñequita Spa
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="location-info lg:col-span-2 flex flex-col gap-5">
            <div className="bg-snow rounded-3xl p-7 border border-white/[0.06] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent" />
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose" />
                  </div>
                  <div>
                    <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-1">Dirección</p>
                    <p className="text-charcoal/80 font-sans text-sm leading-relaxed">
                      Calle Oeste 10<br />Sector Vista Hermosa<br />Santo Domingo Este
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-rose" />
                  </div>
                  <div>
                    <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-1">Horarios</p>
                    <p className="text-charcoal/75 font-sans text-sm">Lun – Vie: 9:00 AM – 8:00 PM</p>
                    <p className="text-charcoal/75 font-sans text-sm">Sáb – Dom: 10:00 AM – 5:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-rose" />
                  </div>
                  <div>
                    <p className="text-charcoal/40 font-sans text-[10px] tracking-widest uppercase mb-1">Reservas</p>
                    <p className="text-charcoal/75 font-sans text-sm">+1 809-627-0658</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
