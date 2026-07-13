import Image from "next/image";
import AppButton from "@/components/ui/AppButton";
import { ArrowRight, PlayCircle, Zap } from "lucide-react";
import SectionBadge from "@/components/ui/SectionBadge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="home" className="relative pt-28 pb-24 lg:pt-32 lg:pb-32 overflow-hidden bg-[#f4f5f8] bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:32px_32px]">
      
      <div className="max-w-[1500px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Text & Buttons */}
          <div className="text-left relative z-10 max-w-[1000px] flex flex-col justify-center">
            
            {/* Badge */}
            <div className="mb-[-10px]">
              <SectionBadge text="# 1 Social Media Management Platform" icon={Zap} />
            </div>
            
            {/* Heading - Stacked perfectly using block spans and tight leading */}
            <h1 className="text-4xl md:text-[75px] lg:text-[70px] tracking-tight leading-[1] mb-1">
              <span className="block font-semibold text-slate-900">Manage.</span>
              
              {/* Gradient applied to Schedule */}
              <span className="block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#4a00ff] to-[#a855f7] py-1">
                Schedule.
              </span>
              
              <span className="block font-semibold text-slate-900">Grow.</span>
              
              {/* Semi-bold for the sub-heading */}
              <span className="block text-3xl md:text-4xl lg:text-[40px] font-semibold text-slate-900 mt-5 leading-tight">
                All Your Social Media<br />in One Place.
              </span>
            </h1>
            
            {/* Paragraph - Set to font-light as requested */}
            <p className="text-lg text-slate-500 font-light mb-8 max-w-md leading-relaxed">
              Schedule posts, manage campaigns, collaborate with your team, 
              and track performance across every social platform.
            </p>
            
            {/* Buttons - Properly aligned */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <AppButton variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
              Get Started
            </AppButton>
            <AppButton variant="outline" icon={<PlayCircle className="w-5 h-5" />} iconPosition="left">
              Watch Demo
            </AppButton>
          </div>
          </div>

          {/* RIGHT COLUMN: Dashboard Mockup & Floating Icons */}
          <div className="relative w-full mx-auto lg:mx-0 mt-12 lg:mt-0">
            
            <div className="relative z-10 rounded-2xl bg-white shadow-2xl shadow-purple-500/10 overflow-hidden border border-slate-100">
              <div className="relative w-full aspect-[4/3] bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 font-medium">Dashboard Mockup Goes Here</span>
                {/* 
                <Image 
                  src="/dashboard-mockup.png" 
                  alt="SocialPilot Dashboard" 
                  fill
                  className="object-contain"
                  priority
                />
                */}
              </div>
            </div>
            
            {/* Floating Icons */}
            
            {/* Instagram (Top Left) */}
            <div className="absolute -left-8 top-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-20 animate-bounce" style={{ animationDuration: '3s' }}>
              <Image src="/images/instagram.svg" alt="Instagram" width={200} height={200} className="object-contain" />
            </div>

            {/* Reddit (Middle Left) */}
            <div className="absolute -left-6 bottom-1/4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
              <Image src="/images/reddit.svg" alt="Reddit" width={200} height={200} className="object-contain" />
            </div>

            {/* YouTube (Top Center) */}
            <div className="absolute -top-10 left-1/4 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
              <Image src="/images/youtube.svg" alt="YouTube" width={200} height={200} className="object-contain" />
            </div>

            {/* LinkedIn (Top Right) */}
            <div className="absolute -top-6 right-16 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
              <Image src="/images/linkedin.svg" alt="LinkedIn" width={200} height={200} className="object-contain" />
            </div>

            {/* X / Twitter (Far Right) */}
            <div className="absolute top-12 -right-8 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
              <Image src="/images/x-twitter.svg" alt="X" width={200} height={200} className="object-contain" />
            </div>

            {/* Pinterest (Bottom Right) */}
            <div className="absolute -bottom-8 right-12 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
              <Image 
              src="/images/pinterest.svg" alt="Pinterest" width={200} height={200} className="object-contain" />
            </div>

            {/* Facebook (Bottom Center) */}
            <div className="absolute -bottom-10 left-1/3 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-20">
              <Image src="/images/facebook.svg" alt="Facebook" width={200} height={200} className="object-contain" />
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}
