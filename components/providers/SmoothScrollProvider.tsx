"use client";

import { useEffect, useRef } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef  = useRef<{ destroy: () => void; on: (e: string, cb: unknown) => void; raf: (t: number) => void } | null>(null);
  const tickerRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    const destroyLenis = () => {
      if (tickerRef.current) {
        // Remove the ticker to avoid stacking duplicate raf loops
        import("gsap").then(({ gsap }) => {
          if (tickerRef.current) gsap.ticker.remove(tickerRef.current);
          tickerRef.current = null;
        });
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const createLenis = async () => {
      // Always destroy previous instance before creating a new one
      destroyLenis();

      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration:        1.2,
        easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:     true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
      });

      lenisRef.current = lenis as unknown as typeof lenisRef.current;

      // Wire Lenis scroll → GSAP ScrollTrigger
      lenis.on("scroll", () => ScrollTrigger.update());

      const tick = (time: number) => lenis.raf(time * 1000);
      tickerRef.current = tick;
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Refresh after a frame so ScrollTrigger recalculates
      // all trigger positions now that the page has rendered fully
      requestAnimationFrame(() => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    };

    window.addEventListener("lenis:start", createLenis);
    window.addEventListener("lenis:stop",  destroyLenis);

    return () => {
      window.removeEventListener("lenis:start", createLenis);
      window.removeEventListener("lenis:stop",  destroyLenis);
      destroyLenis();
    };
  }, []);

  return <>{children}</>;
}
