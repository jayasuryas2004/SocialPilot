"use client";

import SectionBadge from "@/components/ui/SectionBadge";
import TestimonialCard from "@/components/ui/TestimonialCard";

// The reviews array
const reviews = [
  {
    id: 1,
    text: "Create, schedule, and automate posts days, weeks, or even months in advance using an intuitive content calendar. Never miss the perfect time to engage your audience.",
    author: "James Okonkwo",
    role: "Social Media Director",
    initial: "JD"
  },
  {
    id: 2,
    text: "The advanced analytics dashboard has completely transformed how we report to clients. We can now prove ROI with beautiful, easy-to-understand metrics.",
    author: "Sarah Jenkins",
    role: "Agency Founder",
    initial: "SJ"
  },
  {
    id: 3,
    text: "Publishing across Instagram, LinkedIn, and Twitter simultaneously has saved my team at least 10 hours a week. It's an indispensable tool.",
    author: "Michael Chen",
    role: "Content Creator",
    initial: "MC"
  },
  {
    id: 4,
    text: "The AI-powered scheduling ensures our posts go live exactly when our audience is most active. We've seen a 40% increase in overall engagement.",
    author: "Emma Watson",
    role: "Brand Manager",
    initial: "EW"
  },
  {
    id: 5,
    text: "Team collaboration is finally seamless. I can review and approve my junior designers' posts with a single click before anything goes live.",
    author: "David Miller",
    role: "Head of Social",
    initial: "DM"
  },
  {
    id: 6,
    text: "By far the most intuitive social media management tool we've used. The interface is clean, fast, and makes planning our monthly campaigns effortless.",
    author: "Jessica Taylor",
    role: "Marketing Lead",
    initial: "JT"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      
      {/* INLINE CSS KEYFRAMES 
        This handles the buttery-smooth infinite loop without needing to edit tailwind.config.js
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `
      }} />

      {/* Header section remains centered and static */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <SectionBadge text="What customers say" />
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4">
          Loved by Marketing <span className="text-[#4a00ff]">Teams</span>
        </h2>
      </div>

      {/* Marquee Container - Full width */}
      <div className="relative w-full max-w-[100vw] mx-auto overflow-hidden flex items-center">
        
        {/* Left and Right Gradient Masks (The "Secret Sauce" for premium UI) */}
        <div className="absolute top-0 bottom-0 left-0 w-24 md:w-64 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 md:w-64 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* The Scrolling Track 
          We map the array TWICE [...reviews, ...reviews] so that when it scrolls exactly 50% 
          of the way through, it seamlessly snaps back to 0% without the user ever noticing.
        */}
        <div className="flex w-max animate-marquee gap-6 md:gap-8 px-4 py-4">
          {[...reviews, ...reviews].map((review, idx) => (
            <div 
              key={idx} 
              className="w-[320px] md:w-[400px] flex-shrink-0"
            >
              <TestimonialCard
                text={review.text}
                author={review.author}
                role={review.role}
                initial={review.initial}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
