import React, { useMemo } from "react";

const COLORS = ["#f59e0b", "#fbbf24", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"];

/**
 * Lightweight pure-CSS particle celebration confetti
 */
function Confetti({ count = 35 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.5,
      duration: 2.2 + Math.random() * 2,
      size: 8 + Math.random() * 6,
    }));
  }, [count]);

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
