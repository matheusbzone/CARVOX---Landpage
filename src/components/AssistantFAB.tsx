import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function AssistantFAB({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      {/* Concentric Animated Green Glow Rings & Floating Sparkles around the icon */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end cursor-pointer group" 
        id="assistant-fab-container"
        onClick={onOpen}
      >
        <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {/* Green Aura / Pulsing Background Waves (Light Effects) */}
          <motion.div
            animate={{ scale: [1, 1.25, 1.4, 1], opacity: [0.7, 0.4, 0, 0.7] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute w-16 h-16 md:w-20 md:h-20 bg-[#1b6d24] rounded-full filter blur-md -z-10"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1.3, 1], opacity: [0.8, 0.3, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 1.2, ease: "easeInOut" }}
            className="absolute w-16 h-16 md:w-20 md:h-20 bg-[#a0f399] rounded-full filter blur-md -z-10"
          />

          {/* Twinkling Sparkle particles rising from the badge */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-10, -45],
                  x: [i % 2 === 0 ? -15 : 15, i % 2 === 0 ? -25 : 25],
                  scale: [0.5, 1.1, 0.3]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3 + i,
                  delay: i * 0.8,
                  ease: "easeOut"
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400"
              >
                <Sparkles className="w-4 h-4 fill-emerald-300 stroke-emerald-400" />
              </motion.div>
            ))}
          </div>

          {/* Main Decorative Badge Circle representing the exact user icon with headphones, sprout, fields, barn, and sparkles */}
          <div
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-white shadow-xl flex items-center justify-center select-none"
            style={{
              boxShadow: "0 10px 25px -5px rgba(27, 109, 36, 0.4), 0 8px 10px -6px rgba(27, 109, 36, 0.3)"
            }}
            id="assistant-badge"
          >
            {/* Custom SVG Drawing the exact circular green icon uploaded by user */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full transform transition-all duration-300"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="fabGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1b6d24" />
                  <stop offset="100%" stopColor="#0a4012" />
                </linearGradient>
                <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="30%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="70%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>

              {/* 1. Outer circular frame boundary */}
              <circle cx="50" cy="50" r="47" fill="none" stroke="#e0f4e2" strokeWidth="2.5" opacity="0.9" />
              
              {/* 2. Main green backdrop circle */}
              <circle cx="50" cy="50" r="44" fill="url(#fabGreenGrad)" />

              {/* 3. Rolling Agricultural Hills/Crop Lines at the bottom */}
              {/* Left Back Hill */}
              <path d="M 6 72 C 20 63, 42 66, 52 76 L 52 94 L 6 94 Z" fill="#13521b" opacity="0.85" />
              {/* Right Back Hill */}
              <path d="M 42 76 C 56 63, 78 61, 94 72 L 94 94 L 42 94 Z" fill="#0d4214" opacity="0.9" />
              {/* Front Foreground Rolling Crop Rows */}
              <path d="M 12 75 Q 35 60 55 69 Q 75 78 88 75 L 88 94 L 12 94 Z" fill="#2d9438" />
              {/* Accent Crop Stripes */}
              <path d="M 28 94 Q 48 77 74 69" fill="none" stroke="#a0f399" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              <path d="M 50 94 Q 68 79 86 75" fill="none" stroke="#a0f399" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              <path d="M 16 80 Q 25 84 36 94" fill="none" stroke="#a0f399" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

              {/* 4. Sprout on the left */}
              {/* Stem */}
              <path d="M 26 64 C 26 56, 26 52, 26 48" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              {/* Leaf left */}
              <path d="M 26 57 C 19 55, 19 49, 21 46 C 26 49, 26 53, 26 57 Z" fill="white" />
              {/* Leaf right */}
              <path d="M 26 53 C 33 50, 33 44, 31 42 C 27 45, 26 49, 26 53 Z" fill="white" />
              {/* Leaf top */}
              <path d="M 26 48 C 22 42, 25 39, 26 37 C 27 39, 30 42, 26 48 Z" fill="white" />

              {/* 5. Center Headphones with microphone */}
              {/* Headband arch */}
              <path d="M 37 45 A 12.5 12.5 0 0 1 63 45" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
              {/* Left Ear Pad */}
              <rect x="36" y="42" width="4.5" height="10" rx="2.2" fill="white" />
              {/* Right Ear Pad */}
              <rect x="59.5" y="42" width="4.5" height="10" rx="2.2" fill="white" />
              {/* Left connector */}
              <path d="M 38 45 L 38 42" stroke="white" strokeWidth="1.5" />
              {/* Right connector */}
              <path d="M 62 45 L 62 42" stroke="white" strokeWidth="1.5" />
              {/* Microphone boom line */}
              <path d="M 61 51 Q 59 61, 51 61 L 49 61" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

              {/* 6. Farm Barn and Silo on the right */}
              {/* Silo */}
              <rect x="76" y="48" width="4" height="16" fill="white" />
              <path d="M 76 48 A 2 2 0 0 1 80 48" fill="white" />
              <line x1="76" y1="52" x2="80" y2="52" stroke="#2d9438" strokeWidth="0.8" />
              {/* Barn */}
              <path d="M 66 65 L 66 56 L 70 52 L 74 56 L 74 65 Z" fill="white" />
              {/* Barn Door */}
              <path d="M 69 65 L 69 61 L 71 61 L 71 65" fill="#2d9438" />

              {/* 7. Sparkles in top right corner */}
              {/* Giant 4-pointed Star Sparkle */}
              <path d="M 68 22 Q 68 31, 77 31 Q 68 31, 68 40 Q 68 31, 59 31 Q 68 31, 68 22 Z" fill="white" />
              {/* Small '+' Sparkle */}
              <path d="M 72 25 L 76 25 M 74 23 L 74 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

              {/* Shine Sweep Effect Overlay (Shimmer effect) */}
              <motion.rect
                x="-100"
                y="-100"
                width="300"
                height="300"
                fill="url(#shimmerGrad)"
                animate={{
                  transform: ["translate(-120px, -120px) rotate(45deg)", "translate(120px, 120px) rotate(45deg)"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4.5,
                  ease: "linear"
                }}
                style={{ mixBlendMode: "overlay" }}
              />
            </svg>

            {/* Glowing inner active dot */}
            <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
