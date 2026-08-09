"use client";

import React, { useEffect, useState } from "react";

export interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  tx: number; // horizontal distance in px (-240 to 240)
  tyUp: number; // upward burst height in px (80 to 220)
  tyDown: number; // downward fall height in px (350 to 650)
  rot: number; // total rotation in degrees (360 to 1440)
  scale: number; // scale factor (0.6 to 1.2)
  color: string; // color hex code
  delay: number; // delay in seconds (0 to 0.3)
  duration: number; // duration in seconds (2.0 to 2.4)
  isCircle: boolean;
  size: number; // width/height in px (6 to 12)
}

const CONFETTI_COLORS = [
  "#fbbf24", // amber-400
  "#f59e0b", // amber-500
  "#34d399", // emerald-400
  "#ffffff", // white
  "#fb7185", // rose-400
];

function generateParticles(count: number = 36): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.sin(i * 99) * 0.5;
    const distance = 120 + Math.sin(i * 37) * 120;
    const tx = Math.cos(angle) * distance;
    const tyUp = 90 + Math.abs(Math.sin(i * 23)) * 130;
    const tyDown = 350 + Math.abs(Math.cos(i * 17)) * 300;
    const rot = (i % 2 === 0 ? 1 : -1) * (360 + Math.abs(Math.sin(i * 43)) * 1080);
    const scale = 0.6 + Math.abs(Math.sin(i * 53)) * 0.6;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const delay = (i % 8) * 0.04;
    const duration = 2.0 + (i % 5) * 0.1;
    const isCircle = i % 3 === 0;
    const size = 7 + (i % 6);

    particles.push({
      id: i,
      tx,
      tyUp,
      tyDown,
      rot,
      scale,
      color,
      delay,
      duration,
      isCircle,
      size,
    });
  }
  return particles;
}

export default function ConfettiCelebration({
  show,
  onComplete,
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setParticles(generateParticles(36));
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes confetti-burst-fall {
          0% {
            transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          15% {
            transform: translate(-50%, -50%) translate3d(calc(var(--tx) * 0.35), calc(var(--ty-up) * -1), 0) rotate(calc(var(--rot) * 0.2)) scale(var(--sc));
            opacity: 1;
          }
          75% {
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) translate3d(var(--tx), var(--ty-down), 0) rotate(var(--rot)) scale(calc(var(--sc) * 0.4));
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((p) => {
        const customStyle: React.CSSProperties & Record<string, string> = {
          position: "absolute",
          left: "50%",
          top: "40%",
          width: `${p.size}px`,
          height: `${p.size}px`,
          backgroundColor: p.color,
          borderRadius: p.isCircle ? "50%" : "2px",
          boxShadow: `0 0 6px ${p.color}80`,
          "--tx": `${p.tx}px`,
          "--ty-up": `${p.tyUp}px`,
          "--ty-down": `${p.tyDown}px`,
          "--rot": `${p.rot}deg`,
          "--sc": `${p.scale}`,
          animation: `confetti-burst-fall ${p.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${p.delay}s forwards`,
        };

        return <div key={p.id} style={customStyle} />;
      })}
    </div>
  );
}
