import { Button } from "@/components/ui/button";
import AppButton from "@/components/ui/AppButton";

export default function FooterCTA() {
  return (
    <section className="py-24 bg-[#280382] text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Grow Your Social<br />Media ?
        </h2>
        <p className="text-purple-200 mb-10 text-lg">
          Join 4,000+ businesses scheduling smarter, allocating faster, and growing fast with SocialPilot.
        </p>
        <div className="">
              <AppButton variant="primary" className="px-6 py-5 text-lg">Get Started</AppButton>
        </div>
      </div>
    </section>
  );
}
