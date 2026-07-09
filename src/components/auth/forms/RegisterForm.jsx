"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ChevronLeft, LogIn } from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration submitted:", form);
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      
      {/* Matches Login dimensions but adjusted height to 680px to accommodate extra fields smoothly */}
      <div className="w-full max-w-[1100px] min-w-[950px] h-[680px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        
        {/* Left Side: 55% width */}
        <div className="w-[55%] p-4">
          <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px]">
            <Link href="/login">
              <button 
                type="button"
                className="absolute top-6 right-6 border border-white text-white px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-white/20 transition"
              >
                <ChevronLeft size={16} /> Back
              </button>
            </Link>
          </div>
        </div>

        {/* Right Side: 45% width */}
        <div className="w-[45%] flex items-center justify-center px-8">
          <div className="w-full max-w-[350px]">
            
            {/* Header section */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
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

              <div className="text-center mb-4">
                <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 whitespace-nowrap">
                  Create an Account
                </h2>
                <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                  Join now to Schedule posts, manage campaigns, collaborate with your team, and every social platform.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Name Input */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">
                  Name
                </label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] focus-within:border-[#4B00D1] border border-transparent transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email Input (With TempMail protection intact) */}
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
                    name="register_username"
                    placeholder="Enter your email"
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                    title="Please enter a valid email address (e.g., name@example.com)"
                    required
                    suppressHydrationWarning={true} /* Add this line right here! */
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">
                  Password
                </label>
                <div className="flex w-full h-10 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#4B00D1] focus-within:ring-1 focus-within:ring-[#4B00D1] transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none focus:outline-none focus:ring-0 border-none"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center w-10 text-gray-400 hover:text-[#4B00D1] transition-colors focus:outline-none shrink-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">
                  Confirm password
                </label>
                <div className="flex w-full h-10 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#4B00D1] focus-within:ring-1 focus-within:ring-[#4B00D1] transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none focus:outline-none focus:ring-0 border-none"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="flex items-center justify-center w-10 text-gray-400 hover:text-[#4B00D1] transition-colors focus:outline-none shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full h-10 bg-[#260b79] hover:bg-[#1f0962] text-white rounded-lg text-[13px] font-semibold shadow-md transition-colors"
                >
                  Register
                </button>
                
                <button
                  type="button"
                  className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-700 transition-colors"
                >
                  <Image src="/images/google.png" alt="Google" width={16} height={16} />
                  Sign In with Google
                </button>
              </div>
            </form>

            <div className="text-center text-[12px] font-medium text-gray-500 pt-5 flex items-center justify-center gap-1 whitespace-nowrap">
              Already have an account?{" "}
              <Link href="/login" className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1">
                <LogIn size={14} className="rotate-180" /> Login
              </Link>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}