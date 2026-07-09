import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-4">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
          src="/images/logo.png"
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

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-[#4a00ff] px-4 py-2 border-2 border-transparent hover:border-[#4a00ff]/10 rounded-full transition-all">
            Login
          </Link>
          <Link href="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}