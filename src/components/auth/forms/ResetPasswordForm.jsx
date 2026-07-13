"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, ChevronRight, ChevronLeft, LogIn } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { isValidPassword } from "@/lib/validators";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // comes from the emailed reset link, e.g. ?token=abc123

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValid = useMemo(
    () => isValidPassword(form.password) && form.password === form.confirmPassword,
    [form.password, form.confirmPassword]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidPassword(form.password)) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.password);
      router.push("/login");
    } catch (err) {
      setError(err.message || "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      <div className="w-full max-w-[1100px] min-w-[950px] h-[580px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        {/* Left Side: 55% width */}
        <div className="w-[55%] p-4">
          <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px] overflow-hidden">
            <Image
              src="/images/resetpassfr.svg"
              alt="SocialPilot Logo"
              width={575}
              height={500}
              priority
              style={{ width: "40px", height: "40px" }}
            />
            <Link href="/login">
              <button
                type="button"
                className="absolute top-6 right-6 border border-[#260b79] text-[#260b79] px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-[#260b79] hover:text-white transition-colors"
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
                  src="/images/logo.svg"
                  alt="SocialPilot Logo"
                  width={100}
                  height={100}
                  priority
                  style={{ width: "40px", height: "40px" }}
                />
                <h1 className="text-[24px] font-extrabold text-black tracking-tight whitespace-nowrap">
                  SocialPilot
                </h1>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 whitespace-nowrap">
                  Set New Password
                </h2>
                <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                  Your new password must be different from previously used passwords.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">
                  New Password
                </label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] focus-within:border-[#4B00D1] border border-transparent transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
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
                  Confirm Password
                </label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] focus-within:border-[#4B00D1] border border-transparent transition-all shadow-sm">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
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
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Reset Button — now genuinely gated by isValid */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!mounted || !isValid || loading}
                  className={`w-full h-10 rounded-lg text-[13px] font-semibold shadow-md transition-colors ${
                    mounted && isValid && !loading
                      ? "bg-[#260b79] hover:bg-[#1f0962] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {loading ? "Saving..." : "Save & Login"}
                </button>
              </div>

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