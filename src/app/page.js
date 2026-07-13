import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import Integrations from "@/components/marketing/Integrations";
import Benefits from "@/components/marketing/Benefits";
import Testimonials from "@/components/marketing/Testimonials";
import FooterCTA from "@/components/marketing/FooterCTA";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <Integrations />
      <Benefits />
      <></>
      <Testimonials />
      <FooterCTA />
    </main>
  );
}
