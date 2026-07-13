"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ChevronRight, LogIn } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Password Reset Requested For:", email);
    // API call will go here later
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      
      {/* Exact same dimensions as the Login page for seamless transitions */}
      <div className="w-full max-w-[1100px] min-w-[950px] h-[580px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        
        {/* Left Side: 55% width */}
        <div className="w-[55%] p-4">
          <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px]">
            <Link href="/login">
              <button 
                type="button"
                className="absolute top-6 right-6 border border-white text-white px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-white/20 transition"
              >
                Back <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* Right Side: 45% width */}
        <div className="w-[45%] flex items-center justify-center px-8">
          <div className="w-full max-w-[350px]">
            
            {/* Header Section */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Image
                  src="/images/logo.png"
                  alt="SocialPilot Logo"
                  width={40}
                  height={40}
                  style={{ width: "auto", height: "auto" }}
                />
                <h1 className="text-[24px] font-extrabold text-black tracking-tight whitespace-nowrap">
                  SocialPilot
                </h1>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 whitespace-nowrap">
                  Forgot Password ?
                </h2>
                <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                  No worries, we'll send you reset instructions
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">
                  Email
                </label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] focus-within:border-[#4B00D1] border border-transparent transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Mail size={16} />
                  </div>
                 <input
                    type="text"
                    name="reset_email"
                    placeholder="Enter your email"
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                    title="Please enter a valid email address (e.g., name@example.com)"
                    required
                    suppressHydrationWarning={true} // Add this line
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
              </div>

              {/* Reset Button */}
              <button
                type="submit"
                className="w-full h-10 bg-[#260b79] hover:bg-[#1f0962] text-white rounded-lg text-[13px] font-semibold shadow-md transition-colors"
              >
                Reset password
              </button>

              {/* Back to Login Link */}
              <div className="text-center text-[12px] font-medium text-gray-500 pt-4 flex items-center justify-center gap-1 whitespace-nowrap">
                Back to login{" "}
                <Link
                  href="/login"
                  className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1"
                >
                  <LogIn size={14} className="rotate-180" /> Login
                </Link>
              </div>

            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
}
