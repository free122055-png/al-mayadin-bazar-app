import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, FileText, RefreshCcw, Truck } from "lucide-react";
import { SEO } from "../components/SEO";

export const Legal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getInitialTab = () => {
    if (location.pathname.includes("terms")) return "terms";
    if (location.pathname.includes("refund")) return "refund";
    if (location.pathname.includes("shipping")) return "shipping";
    if (location.pathname.includes("security")) return "security";
    return "privacy";
  };

  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "refund" | "shipping" | "security">(getInitialTab());

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO title="আইনি শর্তাবলী ও পলিসি" description="All Mayadin Bazar Legal Terms & Privacy Policy" />

      {/* Header */}
      <div className="bg-[#004b23] px-5 pt-10 pb-6 rounded-b-[40px] shadow-lg sticky top-0 z-50 flex items-center gap-3 text-white">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black">আইনি ও নিরাপত্তা</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {[
            { id: "privacy", label: "গোপনীয়তা নীতি", icon: Shield },
            { id: "terms", label: "শর্তাবলী", icon: FileText },
            { id: "security", label: "নিরাপত্তা", icon: Shield },
            { id: "refund", label: "রিফান্ড", icon: RefreshCcw },
            { id: "shipping", label: "শিপিং", icon: Truck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-black transition-all border shrink-0 flex items-center gap-2 ${
                activeTab === tab.id ? "bg-[#004b23] text-white border-[#004b23] shadow-md" : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4 text-sm text-gray-700 leading-relaxed min-h-[50vh]">
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-3">গোপনীয়তা নীতি (Privacy Policy)</h2>
              <p className="font-medium">অল মায়াদিন বাজার (All Mayadin Bazar) গ্রাহকের গোপনীয়তা সুরক্ষাকে সর্বোচ্চ অগ্রাধিকার দেয়। আমাদের প্ল্যাটফর্ম ব্যবহারের মাধ্যমে গ্রাহক যে তথ্য প্রদান করেন, তা সম্পূর্ণ নিরাপদ থাকে।</p>
              <div className="space-y-4">
                <section className="space-y-1">
                  <h3 className="font-black text-[#004b23]">১. তথ্য সংগ্রহ ও ব্যবহার:</h3>
                  <p className="text-xs text-gray-500 font-medium">অর্ডার প্রসেসিং, হোম ডেলিভারি এবং কাস্টমার সেবার জন্য নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও ইমেইল সংগ্রহ করা হয়।</p>
                </section>
                <section className="space-y-1">
                  <h3 className="font-black text-[#004b23]">২. তথ্যের নিরাপত্তা:</h3>
                  <p className="text-xs text-gray-500 font-medium">আপনার ব্যক্তিগত তথ্য বা পেমেন্ট ডেটা কখনোই কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দেওয়া হয় না। সকল তথ্য উন্নত এনক্রিপশন সিস্টেমের মাধ্যমে সংরক্ষিত থাকে।</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-3">নিরাপত্তা পলিসি (Security)</h2>
              <div className="space-y-4">
                <section className="space-y-1">
                  <h3 className="font-black text-[#004b23]">১. অ্যাকাউন্ট নিরাপত্তা:</h3>
                  <p className="text-xs text-gray-500 font-medium">আপনার পাসওয়ার্ড গোপন রাখা আপনার দায়িত্ব। আমরা কখনোই আপনার কাছে ফোন বা ইমেইলে পাসওয়ার্ড জানতে চাইব না।</p>
                </section>
                <section className="space-y-1">
                  <h3 className="font-black text-[#004b23]">২. নিরাপদ লেনদেন:</h3>
                  <p className="text-xs text-gray-500 font-medium">আমাদের পেমেন্ট সিস্টেম সম্পূর্ণ নিরাপদ এবং এনক্রিপ্টেড। আপনার কার্ড বা ব্যাংক তথ্য আমাদের সার্ভারে সংরক্ষিত হয় না।</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-3">
              <h2 className="text-base font-black text-gray-900 border-b pb-2">ব্যবহারের শর্তাবলী (Terms & Conditions)</h2>
              <p>আমাদের ওয়েবসাইট বা মোবাইল অ্যাপ্লিকেশনে অর্ডার করার সময় গ্রাহককে নিম্নলিখিত শর্তসমূহ মেনে চলার অনুরোধ করা হচ্ছে:</p>
              <h3 className="font-bold text-gray-800">১. অর্ডার ও মূল্য পরিশোধ:</h3>
              <p>প্রদর্শিত মূল্যের সাথে নির্ধারিত ডেলিভারি চার্জ যুক্ত হতে পারে। সঠিক পণ্য নির্বাচন ও সঠিক ঠিকানা প্রদান গ্রাহকের দায়িত্ব।</p>
              <h3 className="font-bold text-gray-800">২. ডেলিভারি ও রিসিভিং:</h3>
              <p>ডেলিভারি গ্রহণের সময় পণ্য যাচাই করে নেওয়া উত্তম। কোনো অসঙ্গতি থাকলে তাৎক্ষণিক ডেলিভারি প্রতিনিধির সাথে আলোচনা করুন।</p>
            </div>
          )}

          {activeTab === "refund" && (
            <div className="space-y-3">
              <h2 className="text-base font-black text-gray-900 border-b pb-2">রিফান্ড ও ক্যান্সেলেশন পলিসি (Refund & Cancellation)</h2>
              <p>আমাদের সকল পণ্যের মানের নিশ্চয়তা রয়েছে। কোনো কারণে পণ্য ক্ষতিগ্রস্ত বা ভুল পৌঁছালে আমরা শতভাগ রিফান্ড অথবা রিপ্লেসমেন্ট সুবিধা প্রদান করি।</p>
              <h3 className="font-bold text-gray-800">১. রিটার্ন সময়সীমা:</h3>
              <p>পণ্য গ্রহণের ৪৮ ঘণ্টার মধ্যে আমাদের হেল্পলাইন বা কাস্টমার সাপোর্টে অবহিত করতে হবে।</p>
              <h3 className="font-bold text-gray-800">২. রিফান্ড পদ্ধতি:</h3>
              <p>যাচাইকরণ শেষে ৩ থেকে ৫ কার্যদিবসের মধ্যে আপনার বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে রিফান্ড টাকা ফেরত দেওয়া হবে।</p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-3">
              <h2 className="text-base font-black text-gray-900 border-b pb-2">শিপিং ও ডেলিভারি পলিসি (Shipping & Delivery)</h2>
              <p>আমরা সমগ্র বাংলাদেশে দ্রুত ও নির্ভরযোগ্য কুরিয়ার পার্টনারের মাধ্যমে পণ্য ডেলিভারি করে থাকি।</p>
              <h3 className="font-bold text-gray-800">১. ডেলিভারির সময়:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>ঢাকা মেট্রো এলাকা: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে।</li>
                <li>ঢাকার বাইরে জেলা ও উপজেলা: ২ থেকে ৩ কার্যদিবস।</li>
              </ul>
              <h3 className="font-bold text-gray-800">২. ডেলিভারি চার্জ:</h3>
              <p>ঢাকা সিটির ভেতরে ৬০ টাকা এবং ঢাকার বাইরে সারাদেশে ১২০ টাকা ডেলিভারি চার্জ প্রযোজ্য।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
