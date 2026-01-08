import React, { useEffect, useState } from 'react';

const DailyDuaa: React.FC = () => {
  const [duaa, setDuaa] = useState('');

  useEffect(() => {
    const fetchDuaa = () => {
        const stored = localStorage.getItem('lumina_daily_duaa');
        if (stored) {
            setDuaa(stored);
        } else {
            setDuaa("May your heart be filled with peace and your path illuminated with spiritual clarity today.");
        }
    };

    fetchDuaa();
  }, []);

  if (!duaa) return null;

  return (
    <div className="w-full bg-accent-500 border-b border-white/10 h-10 flex relative z-40 shadow-xl overflow-hidden">
      {/* Left Static Label */}
      <div className="bg-spirit-900 text-accent-100 px-6 flex items-center justify-center font-serif font-bold text-[10px] tracking-[0.3em] shrink-0 z-10 shadow-2xl h-full uppercase">
        Sacred Wisdom
      </div>
      
      {/* Right Scrolling Content */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <style>{`
          @keyframes marquee-shifa {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee-shifa {
            animation: marquee-shifa 35s linear infinite;
            white-space: nowrap;
            display: inline-block;
          }
          .animate-marquee-shifa:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="flex items-center w-full h-full relative">
            <div className="animate-marquee-shifa text-white font-bold text-sm px-10 tracking-wide">
              {duaa} • {duaa} • {duaa}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDuaa;