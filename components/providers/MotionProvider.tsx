"use client";

import { LazyMotion, domAnimation } from "framer-motion";

// LazyMotion with domAnimation loads only the features used (translate, opacity, scale)
// instead of the full Framer Motion bundle — saves ~32 KB of JS.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      {children}
    </LazyMotion>
  );
}
