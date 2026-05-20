"use client";

import { Instagram, Facebook, Youtube } from "lucide-react";

const exploreLinks = [
  { label: "Servicios",      href: "#services" },
  { label: "Precios",        href: "#pricing" },
  { label: "Nuestro Equipo", href: "#team" },
  { label: "Galería",        href: "#gallery" },
  { label: "Testimonios",    href: "#testimonials" },
  { label: "Encuéntranos",   href: "#location" },
];

const policyLinks = [
  { label: "Política de Reservas",   href: "#" },
  { label: "Cancelaciones",          href: "#" },
  { label: "Política de Privacidad", href: "#" },
  { label: "Términos y Condiciones", href: "#" },
];

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/munequitaspa", label: "Instagram" },
  { icon: Facebook,  href: "#", label: "Facebook"  },
  { icon: Youtube,   href: "#", label: "YouTube"   },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#050403] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 80% at 50% 100%, rgba(212,97,140,0.06) 0%, transparent 70%)" }} />

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/46F839CD-E9A4-47A0-A3D8-78B0C572B0B3.PNG"
                alt="Muñequita Spa"
                className="w-12 h-12 rounded-full object-cover object-center ring-1 ring-rose/20"
              />
              <span className="font-brand font-light text-lg text-white tracking-[0.2em]">
                MUÑEQUITA <span className="gradient-text">SPA</span>
              </span>
            </a>
            <p className="text-white/30 font-sans text-sm leading-relaxed mt-4 max-w-xs">
              El espacio donde la ciencia estética y el lujo se unen para transformarte. Porque mereces verte y sentirte extraordinaria, cada día.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-blush hover:border-blush/25 transition-all duration-200 cursor-pointer">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-rose text-[10px] font-sans font-medium tracking-[0.3em] uppercase mb-5">Explorar</p>
            <ul className="flex flex-col gap-3">
              {exploreLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white/30 hover:text-white/70 font-sans text-sm transition-colors duration-200 cursor-pointer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-rose text-[10px] font-sans font-medium tracking-[0.3em] uppercase mb-5">Políticas</p>
            <ul className="flex flex-col gap-3">
              {policyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white/30 hover:text-white/70 font-sans text-sm transition-colors duration-200 cursor-pointer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-white/08 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 font-sans text-xs">
            © 2025 MUÑEQUITA SPA. Todos los derechos reservados.
          </p>
          <p className="text-white/15 font-sans text-xs tracking-widest">
            SANTO DOMINGO ESTE · RD
          </p>
        </div>
      </div>
    </footer>
  );
}
