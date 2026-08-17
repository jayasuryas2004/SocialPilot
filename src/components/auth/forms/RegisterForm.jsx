"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, Eye, EyeOff, ChevronLeft, LogIn, Lock, User,
  Video, Smartphone, Building2, Megaphone, Users, Sparkles,
  ArrowRight, CheckCircle2, Circle, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/api/auth";
import { isValidEmail } from "@/lib/validators";

const ROLES = [
  {
    id: "Content Creator",
    title: "Content Creator",
    description: "Creating video, photo, or written content",
    icon: Video,
    color: "text-[#E1306C] bg-pink-50",
  },
  {
    id: "Social Media Manager",
    title: "Social Media Manager",
    description: "Managing brand channels & schedules",
    icon: Smartphone,
    color: "text-[#1877F2] bg-blue-50",
  },
  {
    id: "Business Owner",
    title: "Business Owner",
    description: "Growing a company or store online",
    icon: Building2,
    color: "text-[#0A66C2] bg-sky-50",
  },
  {
    id: "Marketing Professional",
    title: "Marketing Professional",
    description: "Running paid campaigns & growth",
    icon: Megaphone,
    color: "text-[#FF4500] bg-orange-50",
  },
  {
    id: "Agency",
    title: "Agency",
    description: "Managing multiple client workspaces",
    icon: Users,
    color: "text-[#311b92] bg-purple-50",
  },
  {
    id: "Influencer",
    title: "Influencer",
    description: "Engaging followers & sponsorships",
    icon: Sparkles,
    color: "text-[#d97706] bg-amber-50",
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  // Multi-step state: 1 for Account Details, 2 for Role Selection
  const [step, setStep] = useState(1);

  // Registration form inputs state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Content Creator",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real-time password strength validation rules
  const passwordRequirements = useMemo(() => {
    const pwd = form.password || "";
    const hasLength = pwd.length >= 8;
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(pwd);
    const isStrong = hasLength && hasNumber && hasSpecial;
    return {
      hasLength,
      hasNumber,
      hasSpecial,
      isStrong,
    };
  }, [form.password]);

  // Step 1 overall validation
  const isStep1Valid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      isValidEmail(form.email) &&
      passwordRequirements.isStrong &&
      form.password === form.confirmPassword
    );
  }, [form.name, form.email, form.password, form.confirmPassword, passwordRequirements.isStrong]);

  /**
   * Advance from Step 1 to Step 2 after client validation
   */
  const handleProceedToStep2 = (e) => {
    if (e) e.preventDefault();
    if (!isStep1Valid) {
      if (!passwordRequirements.isStrong) {
        setError("Please satisfy all password strength requirements.");
      } else if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
      } else if (!isValidEmail(form.email)) {
        setError("Please enter a valid email address.");
      } else {
        setError("Please fill in all required fields.");
      }
      return;
    }
    setError(null);
    setStep(2);
  };

  /**
   * Final Step 2 Submission to live backend
   * On success: Redirects to /connect_accounts onboarding flow
   */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!isStep1Valid) {
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send registration POST request to FastAPI backend
      const result = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      // Redirect user to Connect Accounts onboarding flow
      if (result && (result.token || result.access_token)) {
        router.push("/connect_accounts");
      } else {
        router.push("/login");
      }
    } catch (err) {
      const message = err?.message || "Registration failed. Please verify your details and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      <div className="w-full max-w-[1100px] min-w-[950px] min-h-[640px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        
        {/* LEFT COLUMN (Illustration & Branding) */}
        <div className="w-[50%] p-4 flex">
          <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px] flex items-center justify-center overflow-hidden">
            <Image
              src="/images/Registerfr.svg"
              alt="SocialPilot Illustration"
              fill
              className="object-cover"
              priority
            />
            {step === 1 ? (
              <Link href="/login">
                <button
                  type="button"
                  className="absolute top-6 right-6 border border-[#260b79] text-[#260b79] px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-[#260b79] hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="absolute top-6 right-6 border border-[#260b79] text-[#260b79] px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-[#260b79] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Step 1
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Multi-step Form) */}
        <div className="w-[50%] flex items-center justify-center px-8 py-6">
          <div className="w-full max-w-[420px]">

            {/* BRAND HEADER */}
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Image
                  src="/images/logo.svg"
                  alt="SocialPilot Logo"
                  priority
                  width={100}
                  height={100}
                  style={{ width: "36px", height: "36px" }}
                />
                <h1 className="text-[22px] font-extrabold text-black tracking-tight whitespace-nowrap">
                  SocialPilot
                </h1>
              </div>

              {/* STEP 1 HEADER */}
              {step === 1 ? (
                <>
                  <h2 className="text-[20px] font-bold text-gray-900 mb-1 whitespace-nowrap">
                    Create an Account
                  </h2>
                  <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                    Step 1 of 2 — Enter your account credentials
                  </p>
                </>
              ) : (
                /* STEP 2 HEADER */
                <>
                  <div className="inline-block mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#260b79] bg-[#f2effb] px-3 py-0.5 rounded-full border border-purple-100">
                      Step 2 of 2 — About You
                    </span>
                  </div>
                  <h2 className="text-[20px] font-bold text-gray-900 mb-1 whitespace-nowrap">
                    Tell us about yourself
                  </h2>
                  <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                    Select the role that best describes what you do
                  </p>
                </>
              )}
            </div>

            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <form onSubmit={handleProceedToStep2} className="space-y-2.5" suppressHydrationWarning>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Full name</label>
                  <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] border border-transparent transition-all">
                    <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Jayasurya S"
                      required
                      suppressHydrationWarning
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
                      type="email"
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
                      suppressHydrationWarning
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

                {/* REAL-TIME PASSWORD STRENGTH CHECKLIST */}
                {form.password.length > 0 && (
                  <div className="bg-[#f8f9fb] p-2.5 rounded-lg border border-slate-200/80 space-y-1 text-[11px] font-medium transition-all">
                    <div className="flex items-center gap-2">
                      {passwordRequirements.hasLength ? (
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" strokeWidth={3} />
                      ) : (
                        <Circle size={13} className="text-slate-300 shrink-0" />
                      )}
                      <span className={passwordRequirements.hasLength ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {passwordRequirements.hasNumber ? (
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" strokeWidth={3} />
                      ) : (
                        <Circle size={13} className="text-slate-300 shrink-0" />
                      )}
                      <span className={passwordRequirements.hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                        At least one number (0-9)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {passwordRequirements.hasSpecial ? (
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" strokeWidth={3} />
                      ) : (
                        <Circle size={13} className="text-slate-300 shrink-0" />
                      )}
                      <span className={passwordRequirements.hasSpecial ? "text-emerald-700 font-semibold" : "text-slate-500"}>
                        At least one special character (@, #, $, !, etc.)
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Confirm password</label>
                  <div className="flex w-full h-10 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#4B00D1] focus-within:ring-1 focus-within:ring-[#4B00D1] transition-all shadow-sm">
                    <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      suppressHydrationWarning
                      className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none focus:ring-0 border-none"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-0.5">Passwords don't match</p>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">{error}</p>
                )}

                <button
                  type="submit"
                  suppressHydrationWarning
                  className={`w-full h-10 rounded-lg text-[13px] font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 mt-1 ${
                    isStep1Valid
                      ? "bg-[#260b79] hover:bg-[#1f0962] text-white cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  Continue to Role Selection <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-700 transition-colors"
                >
                  <Image src="/images/google.png" alt="Google" width={16} height={16} />
                  Sign up with Google
                </button>

                <div className="text-center text-[12px] font-medium text-gray-500 pt-0.5 flex items-center justify-center gap-1 whitespace-nowrap">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1">
                    <LogIn size={14} /> Login
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2: ROLE SELECTION */}
            {step === 2 && (
              <div className="space-y-4">
                
                {/* ROLE SELECTION GRID */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[310px] overflow-y-auto pr-0.5">
                  {ROLES.map((roleItem) => {
                    const Icon = roleItem.icon;
                    const isSelected = form.role === roleItem.id;
                    return (
                      <div
                        key={`reg-role-${roleItem.id}`}
                        onClick={() => setForm({ ...form, role: roleItem.id })}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#260b79] bg-[#f8f5ff] shadow-sm ring-1 ring-[#260b79]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className={`w-8 h-8 rounded-lg ${roleItem.color} flex items-center justify-center`}>
                            <Icon size={16} />
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-[#260b79] bg-[#260b79]" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-slate-900 leading-snug">{roleItem.title}</p>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{roleItem.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-1/3 h-10 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-[13px] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-2/3 h-10 bg-[#260b79] hover:bg-[#1f0962] text-white font-semibold rounded-lg text-[13px] shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
                    ) : (
                      <>Complete Registration</>
                    )}
                  </button>
                </div>

                <div className="text-center text-[12px] font-medium text-gray-500 pt-1 flex items-center justify-center gap-1 whitespace-nowrap">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1">
                    <LogIn size={14} /> Login
                  </Link>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}