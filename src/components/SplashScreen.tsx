import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const BinaLinkLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    width="80" 
    height="80" 
    className={className}
    fill="none"
  >
    <path d="M50 5 L93 25 L93 75 L50 95 L7 75 L7 25 Z" stroke="#1A7A5E" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M50 5 L93 25 L93 75 L50 95 L7 75 L7 25 Z" fill="#1A7A5E" fillOpacity="0.1"/>
    <text x="50" y="58" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="#1A7A5E" textAnchor="middle">BL</text>
  </svg>
);

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Slightly more than progress bar duration

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 20); // 100 * 20ms = 2000ms

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      id="web-splash-screen"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <BinaLinkLogo />
        </motion.div>

        {/* Text Animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center space-y-2"
        >
          <h1 className="text-[28px] font-bold text-[#1A7A5E] dir-rtl">BinaLink</h1>
          <p className="text-sm font-medium text-[#C8963E] dir-rtl px-4">
            نربطك بمن يبني معك
          </p>
        </motion.div>
      </div>

      {/* Progress Bar Container */}
      <div className="absolute bottom-12 left-0 right-0 px-8 flex justify-center">
        <div className="w-full max-w-sm h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#1A7A5E]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
