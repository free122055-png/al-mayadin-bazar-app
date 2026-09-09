import React, { useState } from "react";
import { Menu, Bell, Search, Scan } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuDrawer } from "./MenuDrawer";
import { useScanner } from "../context/ScannerContext";
import { useNotificationContext } from "../context/NotificationContext";

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openScanner } = useScanner();
  const { unreadCount } = useNotificationContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isHome = location.pathname === "/";

  if (!isHome) return null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val === "122055") {
      localStorage.setItem("admin_secret_unlocked", "true");
      navigate("/admin");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm === "122055") {
      localStorage.setItem("admin_secret_unlocked", "true");
      navigate("/admin");
      return;
    }
    if (searchTerm.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 bg-[#052b1b] text-white shadow-md transition-all duration-300 ${!isHome ? 'py-2' : ''}`}>
        <div className="px-4 pt-3.5 pb-3 max-w-7xl mx-auto">
          {/* Top Row: Menu - Brand Logo - Notifications */}
          <div className={`flex items-center justify-between transition-all duration-300 ${!isHome ? 'mb-2' : 'mb-3'}`}>
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 active:scale-95 rounded-full border border-white/10 text-white transition-all shadow-xs" 
              aria-label="Menu"
              title="মেনু খুলুন"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
            
            {/* Brand Logo - Smaller on non-home pages */}
            <Link to="/" className={`flex flex-col items-center group transition-all duration-300 ${!isHome ? 'scale-90' : ''}`}>
              <div className="flex items-center gap-1 mb-[-3px]">
                <span className="text-[10px] font-black tracking-[0.25em] text-white/95 uppercase">ALL</span>
                <div className="bg-[#ffb703] p-0.5 rounded-[4px] shadow-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                    <path d="M3 6h18"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
              </div>
              <span className={`${!isHome ? 'text-[18px]' : 'text-[23px] sm:text-[25px]'} font-black tracking-tight leading-tight text-white transition-all`}>MAYADIN</span>
              <span className={`text-[10px] sm:text-[11px] font-black text-[#ffb703] tracking-[0.5em] leading-none mt-0.5 transition-all ${!isHome ? 'hidden' : ''}`}>BAZAR</span>
            </Link>

            {/* Notification Button */}
            <button 
              onClick={() => navigate("/notifications")}
              className="relative w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 active:scale-95 rounded-full border border-white/10 text-white transition-all shadow-xs"
              aria-label="Notifications"
              title="বিজ্ঞপ্তি সেন্টার"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ffb703] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#052b1b] shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar with Integrated Scanner */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-gray-500 stroke-[2.2]" />
            </div>
            <input
              type="text"
              placeholder="আপনার প্রয়োজনীয় পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full bg-white text-gray-800 rounded-full pl-12 pr-14 text-sm font-medium shadow-md focus:outline-none placeholder:text-gray-500 placeholder:font-normal transition-all duration-300 ${!isHome ? 'py-2.5' : 'py-3'}`}
            />
            <button 
              type="button"
              onClick={() => openScanner()}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#054429] hover:bg-[#065332] active:scale-95 rounded-2xl text-[#4ade80] shadow-sm flex items-center justify-center transition-all border border-emerald-600/30 ${!isHome ? 'w-8 h-8 rounded-xl' : ''}`}
              title="সেন্ট্রাল বারকোড ও কিউআর স্ক্যানার"
            >
              <Scan className={`${!isHome ? 'w-4 h-4' : 'w-5 h-5'} stroke-[2.5]`} />
            </button>
          </form>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

