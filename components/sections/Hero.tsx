'use client';

import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export default function Hero() {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="/videos/spa-loop.mp4"
      posterSrc="/poster-opt.jpg"
title="MUÑEQUITA SPA"
      date="Tu ritual de belleza comienza aquí"
      scrollToExpand="Descubre tu glow"
      textBlend
    />
  );
}
