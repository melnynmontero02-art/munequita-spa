import Navbar       from "@/components/layout/Navbar";
import Footer       from "@/components/layout/Footer";
import Hero         from "@/components/sections/Hero";
import Manifesto    from "@/components/sections/Manifesto";
import Services     from "@/components/sections/Services";
import Pricing      from "@/components/sections/Pricing";
import Gallery      from "@/components/sections/Gallery";
import Team         from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import Location     from "@/components/sections/Location";
import Contact      from "@/components/sections/Contact";

const Sep = () => (
  <div className="section-sep w-full max-w-2xl mx-auto" aria-hidden="true" />
);

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Sep />
      <Manifesto />
      <Sep />
      <Services />
      <Sep />
      <Pricing />
      <Sep />
      <Gallery />
      <Sep />
      <Team />
      <Sep />
      <Testimonials />
      <Sep />
      <Location />
      <Sep />
      <Contact />
      <Footer />
    </main>
  );
}
