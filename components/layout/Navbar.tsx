"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SubscriberWidget from "@/components/ui/SubscriberWidget";

const links = [
  { label: "Servicios",            href: "#services" },
  { label: "Planes",               href: "#pricing" },
  { label: "Equipo",               href: "#team" },
  { label: "Galería",              href: "#gallery" },
  { label: "Ubicación y Contacto", href: "#location" },
];

function scrollTo(href: string) {
  const doScroll = () => {
    const lenis = (window as unknown as Record<string, { scrollTo: (t: string, o?: object) => void }>).__lenis;
    if (lenis) {
      lenis.scrollTo(href, { offset: -80 });
    } else {
      const el = document.querySelector(href) as HTMLElement | null;
      if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
  };

  // If Lenis is already running, scroll immediately
  if ((window as unknown as Record<string, unknown>).__lenis) {
    doScroll();
    return;
  }

  // Hero is still in control — skip its animation, then scroll once Lenis starts
  window.dispatchEvent(new Event("hero:skip"));
  window.addEventListener("lenis:start", () => setTimeout(doScroll, 150), { once: true });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]   = useState(false);
  const [open,     setOpen]     = useState(false);
  let last = 0;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setHidden(y > 120 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#0a0807]/90 backdrop-blur-md py-3 shadow-sm border-b border-white/06"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">

          {/* Brand */}
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/46F839CD-E9A4-47A0-A3D8-78B0C572B0B3.PNG"
              alt="Muñequita Spa"
              className="w-10 h-10 rounded-full object-cover object-center ring-1 ring-rose/30"
            />
            <span className="font-brand font-medium text-base tracking-[0.18em] text-white uppercase">
              Muñequita<span className="gradient-text"> Spa</span>
            </span>
          </motion.a>

          {/* Nav pill — desktop */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-full px-2 py-1.5 backdrop-blur-sm"
          >
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="px-4 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.07] text-[12px] font-sans font-medium tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                {l.label}
              </button>
            ))}
          </motion.nav>

          {/* Right: CTA + subscriber widget + hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <SubscriberWidget />
            </div>
            <motion.button
              onClick={() => scrollTo("#contact")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-deep to-rose text-white text-[13px] font-sans font-medium tracking-wide cursor-pointer shadow-[0_4px_20px_rgba(212,97,140,0.25)] shrink-0"
            >
              Reserva tu Cita
            </motion.button>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden text-white/70 hover:text-white cursor-pointer"
              aria-label="Menú"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[68px] inset-x-4 z-40 bg-[#1a1512] rounded-2xl p-6 flex flex-col gap-2 shadow-xl border border-white/08"
          >
            {links.map((l) => (
              <button key={l.href} onClick={() => { scrollTo(l.href); setOpen(false); }}
                className="text-white/60 hover:text-white font-sans text-base py-3 border-b border-white/06 last:border-0 cursor-pointer text-left">
                {l.label}
              </button>
            ))}
            <a href="/mi-plan"
              className="block text-center py-2.5 rounded-xl border border-white/[0.08] text-charcoal/50 font-sans text-sm cursor-pointer hover:border-rose/30 hover:text-charcoal/80 transition-colors mt-1">
              Ver mi membresía
            </a>
            <button onClick={() => { scrollTo("#contact"); setOpen(false); }}
              className="py-3 rounded-xl bg-gradient-to-r from-rose-deep to-rose text-white text-sm font-medium text-center cursor-pointer">
              Reservar Cita
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
