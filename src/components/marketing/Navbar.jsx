import Link from "next/link";
import Image from "next/image";
import AppButton from "@/components/ui/AppButton";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-4">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
          src="/images/logo.svg"
          alt="SocialPilot Logo"
          width={100}
          height={100}
          style={{ width: "40px", height: "40px" }}
        />
          <span className="text-xl font-bold text-slate-900 tracking-tight">SocialPilot</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#home" className="hover:text-[#4a00ff] transition-colors">Home</Link>
          <Link href="#features" className="hover:text-[#4a00ff] transition-colors">Features</Link>
          <Link href="#about" className="hover:text-[#4a00ff] transition-colors">About</Link>
          <Link href="#contact" className="hover:text-[#4a00ff] transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-3">
          <AppButton variant="outline" className="px-6 py-2 text-sm">Login</AppButton>
          <AppButton variant="primary" className="px-6 py-2 text-sm">Get Started</AppButton>
        </div>
      </div>
    </nav>
  );
}
