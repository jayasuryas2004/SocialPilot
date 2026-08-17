import Navbar from "@/components/marketing/Navbar";
import ContactHero from "@/components/marketing/ContactHero";
import ContactInfoCards from "@/components/marketing/ContactInfoCards";
import ContactForm from "@/components/marketing/ContactForm";
import FooterCTA from "@/components/marketing/FooterCTA";

export const metadata = { title: "Contact — SocialPilot" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactHero />
        <ContactInfoCards />
        <div className="pb-24 px-6">
          <ContactForm />
        </div>
      </main>
      <FooterCTA />
    </>
  );
}