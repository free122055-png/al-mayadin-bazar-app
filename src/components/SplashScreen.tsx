import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide native Capacitor splash screen if running on Android/iOS
    try {
      if (typeof window !== "undefined" && (window as any).Capacitor?.Plugins?.SplashScreen) {
        (window as any).Capacitor.Plugins.SplashScreen.hide().catch(() => {});
      }
    } catch {
      // Ignore in standard web browser
    }

    // Keep the official AL MAYADIN BAZAAR splash screen visible for 1.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="official-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white select-none pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center p-6"
          >
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-xl shadow-black/5 bg-white flex items-center justify-center border border-gray-100/80">
              <img
                src="/app_icon.png"
                alt="AL MAYADIN BAZAAR"
                className="w-full h-full object-contain"
                loading="eager"
                decoding="sync"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mt-6 text-center"
            >
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#005a36] uppercase font-sans">
                AL MAYADIN BAZAAR
              </h1>
              <p className="text-xs font-semibold text-gray-500 tracking-widest mt-1">
                ONLINE SHOPPING & GROCERY
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
