import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  ShieldCheck,
  Truck,
  Heart,
  ChevronLeft,
  AlertCircle,
  HelpCircle,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { otpService } from "../lib/otpService";
import { OtpVerificationView } from "../components/OtpVerificationView";
import { parseBangladeshiPhone, getBanglaAuthErrorMessage } from "../lib/phoneUtils";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, registerWithEmail } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect") || "/account";
  
  const [view, setView] = useState<'login' | 'register' | 'otp'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; errorType: string } | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const phoneParsed = parseBangladeshiPhone(phoneNumber);
    if (!phoneParsed.isValid) {
      setErrorInfo({
        message: "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 016XXXXXXXX)।",
        errorType: "validation"
      });
      return;
    }

    if (!password) {
      setErrorInfo({
        message: "অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।",
        errorType: "validation"
      });
      return;
    }

    setLoading(true);

    try {
      const loginPromise = loginWithEmail(phoneParsed.email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("auth/network-timeout")), 10000)
      );
      await Promise.race([loginPromise, timeoutPromise]);
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.warn("Login attempt notice:", err);
      const mapped = getBanglaAuthErrorMessage(err, 'login', phoneParsed.formatted);
      setErrorInfo(mapped);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const phoneParsed = parseBangladeshiPhone(phoneNumber);
    if (!phoneParsed.isValid) {
      setErrorInfo({
        message: "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 016XXXXXXXX)।",
        errorType: "validation"
      });
      return;
    }

    if (password.length < 6) {
      setErrorInfo({
        message: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
        errorType: "validation"
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorInfo({
        message: "উভয় পাসওয়ার্ড একই হতে হবে।",
        errorType: "validation"
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Check if Admin has enabled OTP Verification (Direct Firestore read)
      const otpStatus = await otpService.getStatus();

      if (otpStatus.otpVerificationEnabled) {
        if (!otpStatus.masterEnabled) {
          setErrorInfo({
            message: "OTP ভেরিফিকেশন সেবাটি সাময়িকভাবে বন্ধ আছে। দয়া করে কিছুক্ষণ পর চেষ্টা করুন।",
            errorType: "general"
          });
          setLoading(false);
          return;
        }

        const sendResult = await otpService.sendOtp(phoneParsed.formatted);
        if (!sendResult.success) {
          setErrorInfo({
            message: sendResult.error || "OTP পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
            errorType: "general"
          });
          setLoading(false);
          return;
        }

        setView('otp');
        setLoading(false);
        return;
      }

      // 2. If OTP is OFF: register directly with 12s timeout guard
      const regPromise = registerWithEmail({
        name: name.trim() || "সম্মানিত গ্রাহক",
        email: phoneParsed.email,
        phone: phoneParsed.formatted,
        password,
        address: "",
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || "user"}`,
        isPhoneVerified: false,
        otpState: "OTP_VERIFIED"
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("auth/network-timeout")), 12000)
      );
      await Promise.race([regPromise, timeoutPromise]);
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      console.warn("Register attempt notice:", err);
      const mapped = getBanglaAuthErrorMessage(err, 'register', phoneParsed.formatted);
      setErrorInfo(mapped);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async (verificationToken: string) => {
    setLoading(true);
    setErrorInfo(null);

    const phoneParsed = parseBangladeshiPhone(phoneNumber);

    try {
      await registerWithEmail({
        name: name.trim() || "সম্মানিত গ্রাহক",
        email: phoneParsed.email,
        phone: phoneParsed.formatted,
        password,
        address: "",
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || "user"}`,
        isPhoneVerified: true,
        otpState: "OTP_VERIFIED",
        phoneVerifiedAt: Date.now(),
        otpVerificationToken: verificationToken
      });
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      setErrorInfo({
        message: "রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        errorType: "general"
      });
      setView('register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#002A1A] relative overflow-hidden font-['Plus_Jakarta_Sans'] selection:bg-[#F4A300] selection:text-white">
      {/* Background Icons Pattern - Enhanced to match photo */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20h10v10H20V20zm40 40h10v10H60V60zM30 70h5v5h-5v-5zm40-40h5v5h-5v-5z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 py-6 flex flex-col min-h-screen">
        {/* Exact Logo Layout from Photo */}
        <div className="text-center mb-6 pt-4">
          <div className="flex flex-col items-center justify-center mb-1">
            <span className="text-[9px] font-black tracking-[0.4em] text-white/90 mb-1 leading-none">ALL</span>
            <div className="bg-[#F4A300] p-1.5 rounded-lg shadow-lg shadow-black/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          </div>
          <h1 className="text-[38px] font-black text-white tracking-[-0.03em] leading-none mb-2">MAYADIN</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#F4A300]/50 relative">
              <div className="absolute -right-1 -top-[1.5px] w-1 h-1 bg-[#F4A300] rotate-45" />
            </div>
            <span className="text-[13px] font-black tracking-[0.6em] text-[#F4A300] translate-x-1">BAZAR</span>
            <div className="h-[1px] w-12 bg-[#F4A300]/50 relative">
              <div className="absolute -left-1 -top-[1.5px] w-1 h-1 bg-[#F4A300] rotate-45" />
            </div>
          </div>
          <p className="text-[14px] text-[#F4A300] font-medium opacity-100">আপনার বাজার, আপনার ঠিকানা</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 pb-10 relative">
                {/* Visual Accent - Top Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#F4A300] rounded-full opacity-60" />

                <h2 className="text-[22px] font-black text-[#002A1A] text-center mb-8 mt-2">লগইন করুন</h2>

                {errorInfo && (
                  <div className={`mb-6 p-4 rounded-2xl text-[13px] border flex flex-col gap-2.5 ${
                    errorInfo.errorType === 'not-found' 
                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">{errorInfo.message}</p>
                    </div>
                    {errorInfo.errorType === 'not-found' && (
                      <button
                        type="button"
                        onClick={() => {
                          setView('register');
                          setErrorInfo(null);
                        }}
                        className="w-full bg-[#002A1A] hover:bg-[#00381A] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow transition-all active:scale-98"
                      >
                        👉 নতুন অ্যাকাউন্ট তৈরি করতে এখানে চাপুন
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-2 px-1">মোবাইল নম্বর</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                        <Phone className="w-5 h-5 text-gray-700" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] focus:ring-4 focus:ring-green-500/5 rounded-[18px] py-4.5 pl-16 pr-6 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-2 px-1">পাসওয়ার্ড</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                        <Lock className="w-5 h-5 text-gray-700" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="আপনার পাসওয়ার্ড লিখুন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] focus:ring-4 focus:ring-green-500/5 rounded-[18px] py-4.5 pl-16 pr-14 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="text-right mt-3">
                      <button 
                        type="button" 
                        onClick={() => setShowForgotModal(true)}
                        className="text-[13px] font-bold text-[#003322] hover:underline opacity-90 cursor-pointer"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-[#002A1A] to-[#014028] text-white py-5 rounded-[20px] font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-98 transition-all disabled:opacity-70"
                  >
                    {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-8 mb-6 flex items-center gap-4 px-4">
                  <div className="h-[1px] flex-1 bg-gray-100" />
                  <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">অথবা</span>
                  <div className="h-[1px] flex-1 bg-gray-100" />
                </div>

                <div className="text-center space-y-4">
                  <p className="text-[14px] font-bold text-gray-400">Mayadin Bazar-এ নতুন?</p>
                  <button
                    onClick={() => setView('register')}
                    className="w-full py-4.5 border-2 border-gray-100 rounded-[20px] text-[#002A1A] font-black text-[15px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-98"
                  >
                    <User className="w-5 h-5" />
                    নতুন অ্যাকাউন্ট তৈরি করুন
                  </button>
                </div>
              </div>
            </motion.div>
          ) : view === 'register' ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 pb-10 relative">
                <button 
                  onClick={() => setView('login')}
                  className="absolute left-6 top-6 w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-[#002A1A]" />
                </button>

                <h2 className="text-[22px] font-black text-[#002A1A] text-center mb-8 mt-4">নতুন অ্যাকাউন্ট তৈরি করুন</h2>

                {errorInfo && (
                  <div className={`mb-6 p-4 rounded-2xl text-[13px] border flex flex-col gap-2.5 ${
                    errorInfo.errorType === 'already-exists' 
                      ? 'bg-amber-50 text-amber-900 border-amber-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">{errorInfo.message}</p>
                    </div>
                    {errorInfo.errorType === 'already-exists' && (
                      <button
                        type="button"
                        onClick={() => {
                          setView('login');
                          setErrorInfo(null);
                        }}
                        className="w-full bg-[#002A1A] hover:bg-[#00381A] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow transition-all active:scale-98"
                      >
                        👉 সরাসরি লগইন করতে এখানে চাপুন
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">আপনার নাম</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                        <User className="w-5 h-5 text-gray-700" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="পূর্ণ নাম লিখুন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-6 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">মোবাইল নম্বর</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                        <Phone className="w-5 h-5 text-gray-700" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-6 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">পাসওয়ার্ড</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                        <Lock className="w-5 h-5 text-gray-700" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="একটি শক্তিশালী পাসওয়ার্ড দিন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-14 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5 px-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                        <Lock className="w-5 h-5 text-gray-700" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="আবার পাসওয়ার্ড লিখুন"
                        className="w-full bg-white border border-gray-200 focus:border-[#003322] rounded-[18px] py-4 pl-16 pr-14 text-[15px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-gradient-to-r from-[#002A1A] to-[#014028] text-white py-5 rounded-[20px] font-black text-[16px] flex items-center justify-center gap-3 shadow-xl active:scale-98 transition-all disabled:opacity-70"
                  >
                    {loading ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[12px] font-bold text-gray-400 leading-relaxed px-4">
                    অ্যাকাউন্ট তৈরি করে আপনি আমাদের <br />
                    <span className="text-[#002A1A] underline underline-offset-2">Terms & Conditions</span> এবং <span className="text-[#002A1A] underline underline-offset-2">Privacy Policy</span>-তে সম্মত হচ্ছেন।
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 pb-10 relative">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#F4A300] rounded-full opacity-60" />
                <div className="mt-2">
                  <OtpVerificationView
                    phoneNumber={phoneNumber}
                    onVerified={handleOtpVerified}
                    onBack={() => setView('register')}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Features - Exact from Photo */}
        <div className="mt-auto py-8">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-11 h-11 rounded-full bg-[#F4A300]/15 flex items-center justify-center border border-[#F4A300]/20">
                <ShieldCheck className="w-6 h-6 text-[#F4A300]" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-white/70 text-center tracking-tight">নিরাপদ লেনদেন</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-11 h-11 rounded-full bg-[#F4A300]/15 flex items-center justify-center border border-[#F4A300]/20">
                <Truck className="w-6 h-6 text-[#F4A300]" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-white/70 text-center tracking-tight">দ্রুত ডেলিভারি</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-11 h-11 rounded-full bg-[#F4A300]/15 flex items-center justify-center border border-[#F4A300]/20">
                <ShieldCheck className="w-6 h-6 text-[#F4A300]" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-white/70 text-center tracking-tight">বিশ্বস্ত সেবা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Assistance Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-gray-900">পাসওয়ার্ড পুনরুদ্ধার</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে আমাদের কাস্টমার সার্ভিসের সাথে সরাসরি যোগাযোগ করুন।
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100 text-center">
                <p className="text-[11px] font-bold text-gray-400 uppercase">জরুরি হটলাইন / হোয়াটসঅ্যাপ</p>
                <p className="text-base font-black text-[#002A1A]">০১৬২৪২২৮৪৭৬ / ০১৬১৮৫৯৯০৭৭</p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href="tel:01618599077"
                  className="w-full bg-[#002A1A] text-white py-3 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> সরাসরি কল করুন
                </a>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs"
                >
                  ঠিক আছে
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
