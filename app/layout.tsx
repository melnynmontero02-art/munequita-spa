import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import FloatingSocials from "@/components/ui/FloatingSocials";
import MotionProvider from "@/components/providers/MotionProvider";
import CrownCursor from "@/components/ui/CrownCursor";

export const metadata: Metadata = {
  title: "Muñequita Spa — Medicina Estética & Bienestar | Santo Domingo Este",
  description: "Clínica de medicina estética y spa de lujo en Sector Vista Hermosa, Santo Domingo Este. Tratamientos faciales, Botox, armonización facial, láser y más. Dra. Yesenia Moreta.",
  keywords: ["spa", "medicina estética", "botox", "armonización facial", "tratamientos faciales", "láser", "Santo Domingo", "República Dominicana", "Muñequita Spa"],
  authors: [{ name: "Muñequita Spa" }],
  openGraph: {
    title: "Muñequita Spa — Medicina Estética & Bienestar",
    description: "Clínica de medicina estética y spa de lujo en Santo Domingo Este. Dra. Yesenia Moreta.",
    type: "website",
    locale: "es_DO",
    siteName: "Muñequita Spa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muñequita Spa",
    description: "Medicina estética y bienestar de lujo en Santo Domingo Este.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0807",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Preload hero video */}
        <link rel="preload" href="/videos/spa-loop.mp4" as="video" type="video/mp4" />
        {/* Local business structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              name: "Muñequita Spa",
              description: "Clínica de medicina estética y spa de lujo en Santo Domingo Este.",
              url: "https://munequitaspa.com",
              telephone: "+18096270658",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Calle Oeste 10",
                addressLocality: "Sector Vista Hermosa, Santo Domingo Este",
                addressCountry: "DO",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 18.518944,
                longitude: -69.851000,
              },
              openingHoursSpecification: [
                { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "20:00" },
                { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday","Sunday"], opens: "10:00", closes: "17:00" },
              ],
              sameAs: ["https://www.instagram.com/munequitaspa"],
            }),
          }}
        />
      </head>
      <body className="grain">
        <MotionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </MotionProvider>
        <FloatingSocials />
        <CrownCursor />
      </body>
    </html>
  );
}
