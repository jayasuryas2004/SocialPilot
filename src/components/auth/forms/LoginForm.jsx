// "use client";


// import { useState } from "react";
// import Link from "next/link";

// import Image from "next/image";
// import { Mail, Eye, EyeOff, ChevronRight, LogIn, Lock, ChevronLeft } from "lucide-react";


// export default function LoginForm() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     remember: false,
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Login Data:", form);
//     // API call will go here later
//   };

//   return (
//     // Added overflow-auto so if the screen is too small, you can scroll instead of the card squishing
//     <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      
//       {/* Increased max-w to 1100px, added min-w-[950px] to strictly prevent squishing, fixed height to 580px */}
//       <div className="w-full max-w-[1100px] min-w-[950px] h-[580px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        
//         {/* Left Side: 55% width */}
//         <div className="w-[55%] p-4">
//           <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px] overflow-hidden">
//           <Image 
//             src="/images/loginfr.svg" // Change this to your image file path
//             alt="Description of image"
//             width={800}
//             height={200}
//             className="object-cover object-[center_100%]"
//             priority
//           />
//            <Link href="/">
//   <button
//     type="button"
//     className="absolute top-6 right-6 border border-white text-white px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-white/20 transition"
//   >
//     <ChevronLeft size={16} /> Back
//   </button>
// </Link>
//           </div>
//         </div>

//         {/* Right Side: 45% width, reduced horizontal padding to px-8 to give the form more room */}
//         <div className="w-[45%] flex items-center justify-center px-8">
//           <div className="w-full max-w-[350px]">
            
//             {/* Header Section */}
//             <div className="mb-6 text-center">
//               <div className="flex items-center justify-center gap-2 mb-6">
//                 <Image
//                 src="/images/logo.svg"
//                 alt="SocialPilot Logo"
//                 width={100}
//                 height={100}
//                 style={{ width: "40px", height: "40px" }}
// />
//                 <h1 className="text-[24px] font-extrabold text-black tracking-tight whitespace-nowrap">
//                   SocialPilot
//                 </h1>
//               </div>

//               <div className="text-center mb-6">
//                 <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 whitespace-nowrap">
//                   Welcome Back
//                 </h2>
//                 <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
//                   Enter your email and password to access your account
//                 </p>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-3.5">
              
//       {/* Email Input */}
//       <div>
//           <label className="block mb-1 text-[13px] font-semibold text-gray-800">
//             Email
//           </label>
          
//           {/* The Input Group Container */}
//           <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] focus-within:border-[#4B00D1] border border-transparent transition-all">
            
//             {/* The protected Icon Box */}
//             <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200">
//               <Mail size={16} />
//             </div>

//             {/* The actual input */}
//             <input
//               type="text"
//               name="login_username"
//               placeholder="Enter your email"
//               /* The pattern forces the browser to check for an @ symbol and a .com/.org etc. */
//               pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
//               title="Please enter a valid email address (e.g., name@example.com)"
//               suppressHydrationWarning
//               required
//               className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//             />
//           </div>
//       </div>

//           {/* Password Input */}
//             <div>
//               <label className="block mb-1 text-[13px] font-semibold text-gray-800">
//                 Password
//               </label>
              
//               {/* The Input Group Container */}
//               <div className="flex w-full h-10 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#4B00D1] focus-within:ring-1 focus-within:ring-[#4B00D1] transition-all shadow-sm">
                
//                 {/* The left Icon Box (Lock) */}
//                 <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200 shrink-0">
//                   <Lock size={16} />
//                 </div>

//                 {/* The actual input */}
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none focus:outline-none focus:ring-0 border-none"
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 />

//                 {/* The right Icon Box (Eye Toggle) */}
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="flex items-center justify-center w-10 text-gray-400 hover:text-[#4B00D1] transition-colors focus:outline-none shrink-0"
//                 >
//                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
                
//               </div>
//             </div>

//               {/* Options */}
//               <div className="flex justify-between items-center text-[11px] pt-1 pb-1">
//                 <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-600 whitespace-nowrap">
//                   <input
//                     type="checkbox"
//                     className="w-3.5 h-3.5 rounded border-gray-300 text-[#4B00D1] focus:ring-[#4B00D1]"
//                     checked={form.remember}
//                     onChange={(e) =>
//                       setForm({ ...form, remember: e.target.checked })
//                     }
//                   />
//                   Remember me
//                 </label>
//                 <Link
//                   href="/forgot-password"
//                   className="text-[#4B00D1] font-semibold hover:underline whitespace-nowrap"
//                 >
//                   Forgot Password?
//                 </Link>
//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 className="w-full h-10 bg-[#260b79] hover:bg-[#1f0962] text-white rounded-lg text-[13px] font-semibold shadow-md transition-colors"
//               >
//                 Login
//               </button>

//               {/* Google Button */}
//               <button
//                 type="button"
//                 className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-700 transition-colors mt-2"
//               >
//                 <Image
//                   src="/images/google.png"
//                   alt="Google"
//                   width={16}
//                   height={16}
//                 />
//                 Sign In with Google
//               </button>

//               {/* Register */}
//               <div className="text-center text-[12px] font-medium text-gray-500 pt-2 flex items-center justify-center gap-1 whitespace-nowrap">
//                 Don't have an account?{" "}
//                 <Link
//                   href="/register"
//                   className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1"
//                 >
//                   <LogIn size={14} /> Register
//                 </Link>
//               </div>

//             </form>
//           </div>
//         </div>
        
//       </div>
//     </div>
//   );
//  }

// authetication setup

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Eye, EyeOff, ChevronLeft, LogIn, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/api/auth";
import { isValidEmail } from "@/lib/validators";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isValid = useMemo(
    () => isValidEmail(form.email) && form.password.length > 0,
    [form.email, form.password]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5fb] flex items-center justify-center p-6 overflow-auto">
      <div className="w-full max-w-[1100px] min-w-[950px] h-[580px] bg-white rounded-[32px] shadow-xl overflow-hidden flex">
        {/* Left Side */}
        <div className="w-[55%] p-4">
  <div className="w-full h-full bg-[#9ca3af] relative rounded-[24px] overflow-hidden">
    <Image
      src="/images/loginfr.svg" 
      alt="Login illustration"
      fill
      className="object-cover"
      priority
      style={{ width: "40px", height: "40px" }}
    />
    <Link href="/">
     <button
  type="button"
  className="absolute top-6 right-6 border border-[#260b79] text-[#260b79] px-5 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-[#260b79] hover:text-white transition-colors"
>
  <ChevronLeft size={16} /> Back
</button>
    </Link>
  </div>
</div>

        {/* Right Side */}
        <div className="w-[45%] flex items-center justify-center px-8">
          <div className="w-full max-w-[350px]">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Image
                  src="/images/logo.svg"
                  alt="SocialPilot Logo"
                  width={100}
                  height={100}
                  style={{ width: "40px", height: "40px" }}
                />
                <h1 className="text-[24px] font-extrabold text-black tracking-tight whitespace-nowrap">
                  SocialPilot
                </h1>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 whitespace-nowrap">
                  Welcome Back
                </h2>
                <p className="text-gray-500 text-[12px] leading-relaxed font-medium px-2">
                  Enter your email and password to access your account
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Email</label>
                <div className="flex w-full h-10 bg-gray-100 rounded-lg overflow-hidden focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4B00D1] focus-within:border-[#4B00D1] border border-transparent transition-all">
                  <div className="flex items-center justify-center w-10 text-gray-400 border-r border-gray-200">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    name="login_username"
                    placeholder="Enter your email"
                    required
                    suppressHydrationWarning
                    className="flex-1 bg-transparent px-3 text-[13px] text-gray-900 outline-none border-none focus:ring-0"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Password</label>
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

              <div className="flex justify-between items-center text-[11px] pt-1 pb-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#4B00D1] focus:ring-[#4B00D1]"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-[#4B00D1] font-semibold hover:underline whitespace-nowrap">
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Login Button — gated by isValid, not just loading */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full h-10 rounded-lg text-[13px] font-semibold shadow-md transition-colors ${
                  isValid && !loading
                    ? "bg-[#260b79] hover:bg-[#1f0962] text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Google Button — wired to real redirect */}
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-700 transition-colors mt-2"
              >
                <Image src="/images/google.png" alt="Google" width={16} height={16} />
                Sign In with Google
              </button>

              <div className="text-center text-[12px] font-medium text-gray-500 pt-2 flex items-center justify-center gap-1 whitespace-nowrap">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#260b79] font-bold flex items-center gap-1 hover:underline ml-1">
                  <LogIn size={14} /> Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}