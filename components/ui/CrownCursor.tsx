"use client";

import { useEffect, useRef } from "react";

export default function CrownCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let cx = -100, cy = -100;

    const onMove = (e: MouseEvent) => {
      cx = e.clientX;
      cy = e.clientY;
    };

    const tick = () => {
      if (ref.current) {
        ref.current.style.transform = `translate(${cx}px, ${cy}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="crown-cursor fixed top-0 left-0 pointer-events-none select-none z-[99999] will-change-transform"
      style={{ fontSize: "26px", lineHeight: 1, marginLeft: "-13px", marginTop: "-13px" }}
    >
      👑
    </div>
  );
}
