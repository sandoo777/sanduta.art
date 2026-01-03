'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function HomeHeader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header 
      className={`w-full bg-[#6A0DAD] py-8 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Logo Section */}
        <div className="mb-6 flex justify-center">
          <div className="relative group">
            {/* Logo with glow effect */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <Link href="/" className="relative block">
              <div className="w-32 h-32 md:w-48 md:h-48 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-purple-300 transition-shadow duration-300">
                {/* Logo placeholder - replace with actual logo */}
                <svg 
                  className="w-20 h-20 md:w-32 md:h-32 text-[#6A0DAD]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Festive Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Sanduta.art
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl md:text-4xl animate-pulse">❄️</span>
            <p className="text-lg md:text-2xl font-semibold text-white">
              С Новым годом и Рождеством!
            </p>
            <span className="text-3xl md:text-4xl animate-pulse">🎄</span>
          </div>
          <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
            Печать фотографий и сувениров с вашими воспоминаниями
          </p>
        </div>

        {/* Snowflakes decoration */}
        <div className="flex justify-center gap-4 text-2xl md:text-3xl animate-pulse">
          <span>✨</span>
          <span>⭐</span>
          <span>✨</span>
          <span>⭐</span>
          <span>✨</span>
        </div>

        {/* Floating snowflakes animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="snowflake text-white text-2xl opacity-70" style={{ left: '10%', animationDelay: '0s' }}>❄️</div>
          <div className="snowflake text-white text-xl opacity-50" style={{ left: '20%', animationDelay: '1s' }}>❄️</div>
          <div className="snowflake text-white text-3xl opacity-60" style={{ left: '30%', animationDelay: '2s' }}>❄️</div>
          <div className="snowflake text-white text-xl opacity-70" style={{ left: '40%', animationDelay: '0.5s' }}>❄️</div>
          <div className="snowflake text-white text-2xl opacity-50" style={{ left: '50%', animationDelay: '1.5s' }}>❄️</div>
          <div className="snowflake text-white text-xl opacity-60" style={{ left: '60%', animationDelay: '2.5s' }}>❄️</div>
          <div className="snowflake text-white text-3xl opacity-70" style={{ left: '70%', animationDelay: '0.7s' }}>❄️</div>
          <div className="snowflake text-white text-2xl opacity-50" style={{ left: '80%', animationDelay: '1.8s' }}>❄️</div>
          <div className="snowflake text-white text-xl opacity-60" style={{ left: '90%', animationDelay: '3s' }}>❄️</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .snowflake {
          position: absolute;
          top: -100px;
          animation: snowfall 10s linear infinite;
        }
      `}</style>
    </header>
  );
}
