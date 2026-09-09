import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  LayoutGrid, 
  Package, 
  ShoppingCart, 
  Heart, 
  MapPin, 
  Crown, 
  Settings, 
  Tag, 
  Gift, 
  Bell, 
  HelpCircle, 
  Phone, 
  Shield, 
  FileText, 
  RotateCcw, 
  Truck, 
  LogOut, 
  ChevronRight, 
  Camera, 
  Check, 
  Plus, 
  Trash2, 
  Send, 
  Eye, 
  EyeOff, 
  Copy, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNotificationContext } from "../context/NotificationContext";
import { auth, db } from "../lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { items: cartItems } = useCart();
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();

  // Active modal state for live drawer actions
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.displayName || "মোঃ আরিফুল ইসলাম");
  const [profilePhone, setProfilePhone] = useState("01700-000000");
  const [profileEmail, setProfileEmail] = useState(user?.email || "user@allmayadin.com");
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Addresses State
  const [addresses, setAddresses] = useState([
    { id: "1", title: "হোম (Home)", name: "মোঃ আরিফুল ইসলাম", phone: "01711-223344", address: "বাড়ি # ১২, রোড # ৪, ধানমন্ডি", city: "ঢাকা", isDefault: true },
    { id: "2", title: "অফিস (Work)", name: "মোঃ আরিফুল ইসলাম", phone: "01711-223344", address: "লেভেল ৫, গুলশান ১", city: "ঢাকা", isDefault: false }
  ]);
  const [newAddress, setNewAddress] = useState({ title: "হোম (Home)", name: "", phone: "", address: "", city: "ঢাকা" });
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // Offers & Coupons
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const coupons = [
    { code: "MAYADIN50", discount: "৫০ টাকা ছাড়", min: "৫০০ টাকার অর্ডারে", desc: "প্রথম অর্ডারে বিশেষ ছাড়" },
    { code: "FREE100", discount: "ফ্রি ডেলিভারি", min: "১০০০ টাকার অর্ডারে", desc: "সারাদেশে ফ্রি হোম ডেলিভারি" },
    { code: "EIDSPECIAL", discount: "১০% ক্যাশব্যাক", min: "১৫০০ টাকার অর্ডারে", desc: "সর্বোচ্চ ২০০ টাকা ছাড়" },
  ];

  // Reward Points State
  const [rewardPoints, setRewardPoints] = useState(120);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "অর্ডার কনফার্ম হয়েছে", desc: "আপনার অর্ডার #AMB-9842 সফলভাবে গ্রহণ করা হয়েছে।", time: "১০ মিনিট আগে", unread: true },
    { id: "n2", title: "৫০% পর্যন্ত ছাড়!", desc: "ফ্যাশন ও রূপসজ্জা বাজারে চলছে বিশেষ ধামাকা অফার।", time: "২ ঘণ্টা আগে", unread: true },
    { id: "n3", title: "ডেলিভারি আপডেট", desc: "আপনার অর্ডারটি ডেলিভারির জন্য পাঠানো হয়েছে।", time: "গতকাল", unread: true },
    { id: "n4", title: "ওয়েলকাম বোনাস", desc: "অল মায়াদিন বাজারে স্বাগতম! আপনার ওয়ালেটে ৫০ পয়েন্ট যোগ হয়েছে।", time: "৩ দিন আগে", unread: false },
  ]);

  // Security password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState("");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Legal tab state
  const [legalTab, setLegalTab] = useState<"privacy" | "terms" | "refund" | "shipping">("privacy");

  useEffect(() => {
    if (user) {
      if (user.displayName) setProfileName(user.displayName);
      if (user.email) setProfileEmail(user.email);
      if (user.photoURL) setProfilePhoto(user.photoURL);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveModal(null);
      onClose();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      if (user) {
        await updateProfile(user, {
          displayName: profileName,
          photoURL: profilePhoto
        });
        await setDoc(doc(db, "users", user.uid), {
          displayName: profileName,
          phone: profilePhone,
          photoURL: profilePhoto,
          updatedAt: new Date()
        }, { merge: true });
      }
      setProfileSuccessMsg("প্রোফাইল সফলভাবে আপডেট হয়েছে!");
      setTimeout(() => {
        setProfileSuccessMsg("");
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address || !newAddress.phone) return;
    const item = {
      id: Date.now().toString(),
      title: newAddress.title,
      name: newAddress.name || profileName,
      phone: newAddress.phone,
      address: newAddress.address,
      city: newAddress.city,
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, item]);
    setNewAddress({ title: "হোম (Home)", name: "", phone: "", address: "", city: "ঢাকা" });
    setShowAddAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const faqs = [
    { q: "অর্ডার করার নিয়ম কি?", a: "পণ্য সিলেক্ট করে 'কার্ট' বা 'এখনই কিনুন' বাটনে ক্লিক করে ডেলিভারি ঠিকানা দিন এবং ক্যাশ অন ডেলিভারি বা অনলাইনে পেমেন্ট নিশ্চিত করুন।" },
    { q: "ডেলিভারি পেতে কত দিন সময় লাগবে?", a: "ঢাকার মধ্যে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।" },
    { q: "পেমেন্ট করার পদ্ধতি কি কি?", a: "ক্যাশ অন ডেলিভারি (Cash on Delivery), বিকাশ (bKash), নগদ (Nagad), রকেট ও ভিসা/মাস্টারকার্ডের মাধ্যমে পেমেন্ট করতে পারবেন।" },
    { q: "পণ্য পছন্দ না হলে বা নষ্ট হলে কি করব?", a: "পণ্য হাতে পাওয়ার ৪৮ ঘণ্টার মধ্যে আমাদের হেল্পলাইন বা সাপোর্টে জানালে তাৎক্ষণিক রিটার্ন ও রিফান্ড সুবিধা পাওয়া যাবে।" }
  ];

  return (
    <>
      {/* Background Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 w-[88%] max-w-[360px] bg-[#f2f4f7] text-gray-800 z-[1000] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Dark Green Top Header Section */}
            <div className="bg-[#031d14] text-white pt-6 pb-6 px-5 relative overflow-hidden shrink-0 border-b border-[#007f3e]/20">
              {/* Close Button Top Right */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95 border border-white/10"
                aria-label="Close Menu"
                title="মেনু বন্ধ করুন"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Center Logo Branding */}
              <div className="flex flex-col items-center justify-center text-center mt-1 mb-5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black tracking-[0.25em] text-white/90">ALL</span>
                  <div className="bg-[#ffb703] p-1 rounded-md shadow-xs flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                      <path d="M3 6h18"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                </div>
                <div className="text-[26px] font-black tracking-tight leading-none text-white font-sans">
                  MAYADIN
                </div>
                <div className="text-[11px] font-black text-[#ffb703] tracking-[0.5em] leading-none mt-1.5">
                  BAZAR
                </div>
                <div className="text-[11px] font-medium text-[#ffb703]/90 mt-2 tracking-normal">
                  আপনার বাজার, আপনার ঠিকানা
                </div>
              </div>

              {/* Profile Card Overlay */}
              <div 
                onClick={() => setActiveModal("profile")}
                className="cursor-pointer bg-white text-gray-900 rounded-2xl p-3.5 shadow-lg flex items-center justify-between border border-white/80 active:scale-[0.99] transition-all relative overflow-hidden"
              >
                {/* Subtle Islamic/Floral watermarked decoration background */}
                <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center justify-end pr-2 text-gray-400">
                  <Sparkles className="w-20 h-20" />
                </div>

                <div className="flex items-center gap-3 relative z-10 min-w-0">
                  {/* User Avatar Circle */}
                  <div className="w-12 h-12 rounded-full bg-[#022c1e] text-white flex items-center justify-center shrink-0 overflow-hidden border border-[#007f3e]/30 shadow-inner">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#022c1e]">
                        <svg className="w-7 h-7 text-[#e6f4ea]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-gray-600 leading-tight">
                      আসসালামু আলাইকুম
                    </div>
                    <div className="text-sm font-black text-gray-900 truncate leading-snug mt-0.5">
                      {profileName}
                    </div>
                    <div className="inline-flex items-center gap-1 bg-[#fffbeb] text-[#b45309] border border-[#fde68a] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                      <span>👑</span> Gold Member
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 relative z-10" />
              </div>
            </div>

            {/* Menu Body - Scrollable Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              
              {/* 1. শপিং (Shopping Group) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="bg-[#fcfdfd] px-4 py-2.5 text-[12px] font-black text-gray-800 border-b border-gray-100">
                  শপিং
                </div>
                <div className="divide-y divide-gray-100/90 text-[13px]">
                  <button
                    onClick={() => { onClose(); navigate("/categories"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>সব ক্যাটাগরি</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => { onClose(); navigate("/cart"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>কার্ট</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cartItems.length > 0 && (
                        <span className="bg-[#007f3e] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {cartItems.length}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveModal("addresses")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>আমার ঠিকানা</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 2. অ্যাকাউন্ট (Account Group) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="bg-[#fcfdfd] px-4 py-2.5 text-[12px] font-black text-gray-800 border-b border-gray-100">
                  অ্যাকাউন্ট
                </div>
                <div className="divide-y divide-gray-100/90 text-[13px]">
                  <button
                    onClick={() => setActiveModal("accountSettings")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>অ্যাকাউন্ট সেটিংস</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 3. সার্ভিস ও সুবিধা (Services Group) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="bg-[#fcfdfd] px-4 py-2.5 text-[12px] font-black text-gray-800 border-b border-gray-100">
                  সার্ভিস ও সুবিধা
                </div>
                <div className="divide-y divide-gray-100/90 text-[13px]">
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/notifications");
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>নোটিফিকেশন সেন্টার</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="bg-[#ffb703] text-black font-black text-xs px-2.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>

              {/* 4. সহায়তা (Help Group) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="bg-[#fcfdfd] px-4 py-2.5 text-[12px] font-black text-gray-800 border-b border-gray-100">
                  সহায়তা
                </div>
                <div className="divide-y divide-gray-100/90 text-[13px]">
                  <button
                    onClick={() => setActiveModal("faq")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>সাহায্য কেন্দ্র</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setActiveModal("contact")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>যোগাযোগ করুন</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* 5. আইন ও নীতিমালা (Legal Group) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="bg-[#fcfdfd] px-4 py-2.5 text-[12px] font-black text-gray-800 border-b border-gray-100">
                  আইন ও নীতিমালা
                </div>
                <div className="divide-y divide-gray-100/90 text-[13px]">
                  <button
                    onClick={() => { setLegalTab("privacy"); setActiveModal("legal"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>প্রাইভেসি পলিসি</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => { setLegalTab("terms"); setActiveModal("legal"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>টার্মস ও কন্ডিশন</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => { setLegalTab("refund"); setActiveModal("legal"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>রিফান্ড ও রিটার্ন পলিসি</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => { setLegalTab("shipping"); setActiveModal("legal"); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-gray-800 font-semibold transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-emerald-700 stroke-[2]" />
                      <span>ডেলিভারি পলিসি</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Developer & Android Release Keystore Card */}
              <div className="bg-gradient-to-r from-amber-950/20 to-orange-950/20 border-2 border-amber-500/40 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-amber-500/15 px-4 py-2 text-[12px] font-black text-amber-950 border-b border-amber-500/30 flex items-center justify-between">
                  <span>Android Signing Keystore</span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">Codemagic</span>
                </div>
                <div className="p-3 space-y-2">
                  <a
                    href="/api/download-keystore"
                    download="release.keystore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer"
                  >
                    <span>⬇️ Download release.keystore</span>
                  </a>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/download-cert");
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-gray-50 active:scale-95 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-between border border-gray-200 transition cursor-pointer"
                  >
                    <span>কী ও সার্টিফিকেট পেইজ</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Bottom Logout Button */}
              <div className="pt-2 pb-6">
                <button
                  onClick={() => {
                    if (user) {
                      setActiveModal("logoutConfirm");
                    } else {
                      onClose();
                      navigate("/login");
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#ef4444] font-black text-sm rounded-2xl flex items-center justify-center gap-2 border border-[#fecaca] active:scale-[0.98] transition-all shadow-xs"
                >
                  <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
                  <span>{user ? "লগআউট" : "লগইন করুন"}</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE LIVE MODALS
         ========================================================================= */}

      {/* 1. PROFILE MODAL WITH PHOTO UPLOAD & EDIT */}
      <AnimatePresence>
        {activeModal === "profile" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-[#031d14] text-white p-4 flex items-center justify-between">
                <div className="font-black text-sm flex items-center gap-2">
                  <span>👤</span> আমার প্রোফাইল (Profile)
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                {profileSuccessMsg && (
                  <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {profileSuccessMsg}
                  </div>
                )}

                {/* Photo Uploader */}
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full border-4 border-[#007f3e] overflow-hidden shadow-md group bg-[#022c1e] text-white">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#022c1e]">
                        <svg className="w-10 h-10 text-[#e6f4ea]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5" />
                      <span className="text-[8px] font-bold mt-0.5">ছবি দিন</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1.5">ছবিতে ট্যাপ করে নতুন ফটো যোগ করুন</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">পূর্ণ নাম</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-bold focus:border-[#007f3e] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">মোবাইল নাম্বার</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-bold focus:border-[#007f3e] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">ইমেইল এড্রেস</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 font-bold focus:border-[#007f3e] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-[#007f3e] hover:bg-[#006e36] text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল সংরক্ষণ করুন"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SAVED ADDRESSES MODAL */}
      <AnimatePresence>
        {activeModal === "addresses" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="bg-[#031d14] text-white p-4 flex items-center justify-between shrink-0">
                <div className="font-black text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ffb703]" /> আমার সংরক্ষিত ঠিকানা
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {addresses.map((item) => (
                  <div key={item.id} className={`p-3 rounded-2xl border ${item.isDefault ? 'border-[#007f3e] bg-[#e6f4ea]/30' : 'border-gray-200 bg-gray-50'} relative`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#007f3e]" /> {item.title}
                      </span>
                      {item.isDefault && (
                        <span className="bg-[#007f3e] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          ডিফল্ট ঠিকানা
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-600 font-medium">
                      <div>প্রাপক: <strong>{item.name}</strong> ({item.phone})</div>
                      <div>{item.address}, {item.city}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/60">
                      {!item.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(item.id)}
                          className="text-[10px] text-[#007f3e] font-black hover:underline"
                        >
                          ডিফল্ট করুন
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(item.id)}
                        className="text-[10px] text-red-500 font-bold ml-auto flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3 h-3" /> মুছুন
                      </button>
                    </div>
                  </div>
                ))}

                {showAddAddressForm ? (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
                    <div className="font-black text-gray-800 text-xs">নতুন ঠিকানা যোগ করুন</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500">ঠিকানার ধরন</label>
                        <select
                          value={newAddress.title}
                          onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 font-semibold bg-white"
                        >
                          <option value="হোম (Home)">হোম (Home)</option>
                          <option value="অফিস (Work)">অফিস (Work)</option>
                          <option value="অন্যান্য (Other)">অন্যান্য (Other)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500">শহর / জেলা</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 font-semibold bg-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500">প্রাপকের নাম</label>
                      <input
                        type="text"
                        placeholder="নাম লিখুন"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 font-semibold bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500">মোবাইল নাম্বার</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 font-semibold bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500">সম্পূর্ণ ঠিকানা (বাসা/রাস্তা)</label>
                      <textarea
                        rows={2}
                        placeholder="বাড়ি নং, রোড নং, এলাকা..."
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 font-semibold bg-white"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className="flex-1 bg-[#007f3e] text-white py-2 rounded-xl font-black">
                        ঠিকানা যোগ করুন
                      </button>
                      <button type="button" onClick={() => setShowAddAddressForm(false)} className="px-4 bg-gray-200 text-gray-700 py-2 rounded-xl font-bold">
                        বাতিল
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddAddressForm(true)}
                    className="w-full py-2.5 border-2 border-dashed border-[#007f3e]/40 hover:border-[#007f3e] rounded-2xl text-[#007f3e] font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" /> নতুন ঠিকানা যোগ করুন
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MEMBERSHIP MODAL */}
      <AnimatePresence>
        {activeModal === "membership" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#d97706] to-[#b45309] text-white p-5 text-center relative">
                <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
                  👑
                </div>
                <h3 className="font-black text-lg">গোল্ড মেম্বারশিপ (Gold Member)</h3>
                <p className="text-xs text-white/90 mt-1">অল মায়াদিন বাজার প্রিমিয়াম লয়্যালটি ক্লাব</p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/80 space-y-2">
                  <div className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                    <span>✨</span> গোল্ড মেম্বারদের বিশেষ সুবিধাসমূহ:
                  </div>
                  <ul className="space-y-1.5 text-amber-800 text-[11px] font-medium pl-1">
                    <li>• প্রতি অর্ডারে ৫% অতিরিক্ত ক্যাশব্যাক পয়েন্ট</li>
                    <li>• এক্সপ্রেস সুপারফাস্ট প্রায়োরিটি হোম ডেলিভারি</li>
                    <li>• ২৪/৭ ডেডিকেটেড ভিআইপি কাস্টমার সাপোর্ট</li>
                    <li>• বিশেষ উৎসব ও ফ্ল্যাশ সেলে অগ্রিম অ্যাক্সেস</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold">বর্তমান পয়েন্ট ব্যালেন্স</div>
                    <div className="text-base font-black text-[#007f3e]">{rewardPoints} পয়েন্ট (৳{rewardPoints})</div>
                  </div>
                  <button 
                    onClick={() => { setActiveModal("rewards"); }}
                    className="bg-[#007f3e] text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xs"
                  >
                    পয়েন্ট রিডিম
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. OFFERS & COUPONS MODAL */}
      <AnimatePresence>
        {activeModal === "offers" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-[#031d14] text-white p-4 flex items-center justify-between">
                <div className="font-black text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#ffb703]" /> অফার ও কুপন কোড
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
                {coupons.map((c) => (
                  <div key={c.code} className="p-3.5 rounded-2xl border-2 border-dashed border-[#007f3e]/40 bg-[#e6f4ea]/20 flex items-center justify-between gap-3">
                    <div>
                      <span className="bg-[#007f3e] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {c.code}
                      </span>
                      <h4 className="text-xs font-black text-gray-900 mt-1">{c.discount}</h4>
                      <p className="text-[10px] text-gray-500">{c.min} • {c.desc}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                        copiedCoupon === c.code ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-xs"
                      }`}
                    >
                      {copiedCoupon === c.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedCoupon === c.code ? "কপি হয়েছে" : "কপি"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. REWARD POINTS MODAL */}
      <AnimatePresence>
        {activeModal === "rewards" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#007f3e]" /> রিওয়ার্ড পয়েন্ট ওয়ালেট
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-[#007f3e] to-[#022c1e] text-white p-4 rounded-2xl text-center shadow-md">
                <div className="text-[11px] text-white/80 font-bold">মোট প্রাপ্ত পয়েন্ট</div>
                <div className="text-3xl font-black mt-0.5 tracking-tight">{rewardPoints}</div>
                <div className="text-[10px] text-[#ffb703] font-black mt-1">১ পয়েন্ট = ১ টাকা ডিসকাউন্ট</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-black text-gray-800">পয়েন্ট অর্জনের নিয়ম:</div>
                <div className="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-600 space-y-1">
                  <div>🛒 প্রতিটি সফল কেনাকাটায় ১০০ টাকায় পাবেন ২ পয়েন্ট।</div>
                  <div>⭐ পণ্যের রিভিউ ও রেটিং দিলে পাবেন ৫ পয়েন্ট।</div>
                  <div>🎁 বন্ধুদের রেফার করে জয়েন করালে পাবেন ২০ পয়েন্ট।</div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate("/cart");
                }}
                className="w-full bg-[#007f3e] hover:bg-[#006e36] text-white font-black py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-all"
              >
                কার্টে পয়েন্ট ব্যবহার করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. NOTIFICATIONS MODAL */}
      <AnimatePresence>
        {activeModal === "notifications" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="bg-[#031d14] text-white p-4 flex items-center justify-between shrink-0">
                <div className="font-black text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#ffb703]" /> নোটিফিকেশন
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-[11px]">
                  <span className="font-bold text-gray-500">{notifications.length}টি বার্তা</span>
                  <button
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                    className="text-[#007f3e] font-bold hover:underline"
                  >
                    সব পঠিত করুন
                  </button>
                </div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      notif.unread ? "bg-emerald-50/60 border-emerald-200" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">🔔</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-900">{notif.title}</h4>
                        <span className="text-[9px] font-semibold text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{notif.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. ACCOUNT SETTINGS MODAL */}
      <AnimatePresence>
        {activeModal === "accountSettings" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#007f3e]" /> অ্যাকাউন্ট সেটিংস
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-black text-gray-800">অর্ডার এসএমএস নোটিফিকেশন</div>
                    <div className="text-[10px] text-gray-500">অর্ডার স্ট্যাটাসের এসএমএস পান</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#007f3e]" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-black text-gray-800">প্রমোশনাল অফার অ্যালার্ট</div>
                    <div className="text-[10px] text-gray-500">বিশেষ ছাড় ও কুপন নোটিফিকেশন</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#007f3e]" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-black text-gray-800">অটো লগইন (Remember Me)</div>
                    <div className="text-[10px] text-gray-500">পরবর্তী ভিজিটে স্বয়ংক্রিয় লগইন</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#007f3e]" />
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#007f3e] text-white font-black py-2.5 rounded-xl shadow-md active:scale-95 transition-all text-xs"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. FAQ / HELP CENTER MODAL */}
      <AnimatePresence>
        {activeModal === "faq" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="bg-[#031d14] text-white p-4 flex items-center justify-between shrink-0">
                <div className="font-black text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#ffb703]" /> সাহায্য কেন্দ্র (Help Center)
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
                <div className="text-xs font-black text-gray-800 mb-1">সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ):</div>
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-3 text-left font-bold text-xs bg-gray-50 flex items-center justify-between text-gray-900"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === idx ? "rotate-90" : ""}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="p-3 text-[11px] text-gray-600 bg-white border-t border-gray-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. CONTACT US MODAL */}
      <AnimatePresence>
        {activeModal === "contact" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="font-black text-sm text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#007f3e]" /> যোগাযোগ করুন (Contact Us)
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {contactSent ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-center text-xs font-bold space-y-1">
                  <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div>ধন্যবাদ! আপনার বার্তা আমরা পেয়েছি।</div>
                  <p className="text-[10px] text-emerald-700 font-normal">আমাদের প্রতিনিধি খুব দ্রুত আপনার সাথে যোগাযোগ করবেন।</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:+8801700000000"
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center text-emerald-900 font-bold text-xs gap-1"
                    >
                      <Phone className="w-4 h-4 text-[#007f3e]" />
                      <span>সরাসরি কল</span>
                      <span className="text-[9px] text-emerald-700 font-normal">২৪/৭ সেবা</span>
                    </a>
                    <a
                      href="https://wa.me/8801700000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-2xl flex flex-col items-center justify-center text-center text-green-900 font-bold text-xs gap-1"
                    >
                      <span className="text-base">💬</span>
                      <span>হোয়াটসঅ্যাপ</span>
                      <span className="text-[9px] text-green-700 font-normal">দ্রুত চ্যাট</span>
                    </a>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSent(true);
                      setTimeout(() => {
                        setContactSent(false);
                        setActiveModal(null);
                      }, 2000);
                    }}
                    className="space-y-2.5 text-xs"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-gray-500">আপনার নাম</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="নাম লিখুন"
                        className="w-full border border-gray-200 rounded-xl p-2 font-bold focus:border-[#007f3e] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500">মোবাইল নাম্বার</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full border border-gray-200 rounded-xl p-2 font-bold focus:border-[#007f3e] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500">আপনার বার্তা</label>
                      <textarea
                        rows={2}
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="কীভাবে সাহায্য করতে পারি..."
                        className="w-full border border-gray-200 rounded-xl p-2 font-semibold focus:border-[#007f3e] focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#007f3e] hover:bg-[#006e36] text-white font-black py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> বার্তা পাঠান
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. LEGAL & POLICIES MODAL */}
      <AnimatePresence>
        {activeModal === "legal" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="bg-[#031d14] text-white p-4 flex items-center justify-between shrink-0">
                <div className="font-black text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#ffb703]" /> আইন ও নীতিমালা (Legal & Policies)
                </div>
                <button onClick={() => setActiveModal(null)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b text-[11px] font-bold bg-gray-50 shrink-0">
                <button
                  onClick={() => setLegalTab("privacy")}
                  className={`flex-1 py-2.5 text-center border-b-2 ${legalTab === "privacy" ? "border-[#007f3e] text-[#007f3e] bg-white" : "border-transparent text-gray-500"}`}
                >
                  প্রাইভেসি
                </button>
                <button
                  onClick={() => setLegalTab("terms")}
                  className={`flex-1 py-2.5 text-center border-b-2 ${legalTab === "terms" ? "border-[#007f3e] text-[#007f3e] bg-white" : "border-transparent text-gray-500"}`}
                >
                  শর্তাবলী
                </button>
                <button
                  onClick={() => setLegalTab("refund")}
                  className={`flex-1 py-2.5 text-center border-b-2 ${legalTab === "refund" ? "border-[#007f3e] text-[#007f3e] bg-white" : "border-transparent text-gray-500"}`}
                >
                  রিফান্ড
                </button>
                <button
                  onClick={() => setLegalTab("shipping")}
                  className={`flex-1 py-2.5 text-center border-b-2 ${legalTab === "shipping" ? "border-[#007f3e] text-[#007f3e] bg-white" : "border-transparent text-gray-500"}`}
                >
                  ডেলিভারি
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 text-xs text-gray-700 leading-relaxed space-y-2.5">
                {legalTab === "privacy" && (
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">গোপনীয়তা নীতি (Privacy Policy)</h4>
                    <p>অল মায়াদিন বাজার গ্রাহকের ডেটা সুরক্ষায় প্রতিশ্রুতিবদ্ধ। আপনার নাম, ঠিকানা ও পেমেন্ট সংক্রান্ত তথ্য ১০০% এনক্রিপ্টেড এবং সম্পূর্ণ নিরাপদ।</p>
                  </div>
                )}
                {legalTab === "terms" && (
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">ব্যবহারের শর্তাবলী (Terms & Conditions)</h4>
                    <p>অল মায়াদিন বাজারে প্রতিটি অর্ডার করার সাথে সাথে আপনি ডেলিভারি ও রিসিভিং শর্ত মেনে নিচ্ছেন। ভুল তথ্য প্রদান থেকে বিরত থাকুন।</p>
                  </div>
                )}
                {legalTab === "refund" && (
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">রিফান্ড ও রিটার্ন পলিসি</h4>
                    <p>পণ্য গ্রহণের ৪৮ ঘণ্টার মধ্যে সমস্যা জানালে শতভাগ মূল্য ফেরত বা নতুন পণ্য প্রদান করা হয়। ক্যাশব্যাক ৩ কার্যদিবসের মধ্যে দেওয়া হয়।</p>
                  </div>
                )}
                {legalTab === "shipping" && (
                  <div>
                    <h4 className="font-black text-gray-900 mb-1">ডেলিভারি পলিসি</h4>
                    <p>ঢাকা মেট্রো এলাকায় ২৪ থেকে ৪৮ ঘণ্টায় এবং ঢাকার বাইরে ২ থেকে ৩ দিনে হোম ডেলিভারি সম্পন্ন হয়। ডেলিভারি চার্জ ৬০-১২০ টাকা।</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {activeModal === "logoutConfirm" && (
          <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl p-5 text-center space-y-3"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl">
                <LogOut className="w-6 h-6" />
              </div>
              <h4 className="font-black text-gray-900 text-sm">আপনি কি লগআউট করতে চান?</h4>
              <p className="text-[11px] text-gray-500">পরবর্তী সময়ে কেনাকাটার জন্য আপনাকে পুনরায় লগইন করতে হবে।</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs"
                >
                  হ্যাঁ, লগআউট
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  বাতিল
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
