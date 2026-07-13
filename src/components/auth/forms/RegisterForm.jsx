"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Eye, EyeOff, ChevronLeft, LogIn, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/api/auth";
import { isValidEmail, isValidPassword } from "@/lib/validators";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "creator" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      isValidEmail(form.email) &&
      isValidPassword(form.password) &&
      form.password === form.confirmPassword
    );
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      router.push("/connect_accounts");
    } catch (err) {
      setError(err.message || "Couldn't create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      <div className="w-full max-w-[1100px] min-w-[950px] h-[620px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        <div className="w-[55%] p-4">
          <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px] flex items-center justify-center overflow-hidden">
            <Image
              src="/images/Registerfr.svg"
              alt="SocialPilot Logo"
              width={600}
              height={500}
              priority
              style={{ width: "40px", height: "40px" }}
            />
            <Link href="/login">
              <button
                type="button"
                className="absolute top-6 right-6 border border-[#260b79] text-[#260b79] px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-[#260b79] hover:text-white transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            </Link>
          </div>
        </div>

        <div className="w-[45%] flex items-center justify-center px-8">
          <div className="w-full max-w-[350px]">
            <div className="mb-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <Image
                  src="/images/logo.svg"
                  alt="SocialPilot Logo"
                  priority
                  width={100}
                  height={100}
                  style={{ width: "40px", height: "40px" }}
                />
                <h1 className="text-[24px] font-extrabold text-black tracking-tight whitespace-nowrap">
                  SocialPilot
                </h1>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 whitespace-nowrap">
                Create an Account
              </h2>
              <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                Start scheduling and managing your social media
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Full name</label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] border border-transparent transition-all">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="James Okonkwo"
                    required
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Email</label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] border border-transparent transition-all">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="you@company.com"
                    required
                    suppressHydrationWarning
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Password</label>
                <div className="flex w-full h-10 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#4B00D1] focus-within:ring-1 focus-within:ring-[#4B00D1] transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none focus:ring-0 border-none"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center w-10 text-gray-400 hover:text-[#4B00D1] transition-colors shrink-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Confirm password</label>
                <div className="flex w-full h-10 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#4B00D1] focus-within:ring-1 focus-within:ring-[#4B00D1] transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none focus:ring-0 border-none"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={!mounted || !isValid || loading}
                className={`w-full h-10 rounded-lg text-[13px] font-semibold shadow-md transition-colors ${
                  mounted && isValid && !loading
                    ? "bg-[#260b79] hover:bg-[#1f0962] text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                {loading ? "Creating account..." : "Register"}
              </button>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-700 transition-colors"
              >
                <Image src="/images/google.png" alt="Google" width={16} height={16} />
                Sign up with Google
              </button>

              <div className="text-center text-[12px] font-medium text-gray-500 pt-1 flex items-center justify-center gap-1 whitespace-nowrap">
                Already have an account?{" "}
                <Link href="/login" className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1">
                  <LogIn size={14} /> Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}