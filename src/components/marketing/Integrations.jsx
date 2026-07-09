import Image from "next/image";
import { Zap } from "lucide-react";
import SectionBadge from "@/components/ui/SectionBadge";

export default function Integrations() {
  // Added Reddit and matched the exact order from your target image
  const platforms = [
    { name: "Instagram", src: "images/instagram.svg" },
    { name: "Facebook", src: "images/facebook.svg" },
    { name: "Pinterest", src: "images/pinterest.svg" },
    { name: "LinkedIn", src: "images/linkedin.svg" },
    { name: "Reddit", src: "images/reddit.svg" },
    { name: "X", src: "images/x-twitter.svg" }, // Note: Ensure this is a valid SVG image in your public folder!
    { name: "YouTube", src: "images/youtube.svg" },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4 text-center flex flex-col items-center">
        
        {/* Badge - Passed the Zap icon explicitly to match the target */}
        <div className="mb-12">
          <SectionBadge text="Publish Seamlessly across your favorite platforms" icon={Zap} />
        </div>
        
        {/* Increased gap and size, removed the opacity dimming so they are fully vibrant */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
          {platforms.map((platform, idx) => (
            <div 
              key={idx} 
              className="transition-transform duration-200 hover:scale-110 cursor-pointer flex items-center justify-center"
            >
              <Image 
                src={platform.src} 
                alt={platform.name} 
                width={80} 
                height={80} 
                className="object-contain w-20 h-20 md:w-[100px] md:h-[100px]"
              />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}