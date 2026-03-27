import { useMemo } from "react";

export default function FloatingElements() {
  const petals = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: `${(i * 4.5) % 100}%`,
        delay: `${(i * 1.3) % 18}s`,
        duration: `${12 + (i % 6) * 2}s`,
        size: `${10 + (i % 8)}px`,
        emoji: ["🌸", "🌹", "🌺", "🌷"][i % 4],
      })),
    [],
  );

  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${5 + ((i * 6.5) % 90)}%`,
        delay: `${(i * 2.1) % 20}s`,
        duration: `${10 + (i % 5) * 2}s`,
        size: `${12 + (i % 8)}px`,
      })),
    [],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 3.6) % 100}%`,
        top: `${(i * 3.8) % 100}%`,
        delay: `${(i * 0.4) % 5}s`,
        duration: `${2 + (i % 4) * 0.8}s`,
        size: `${6 + (i % 8)}px`,
      })),
    [],
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {petals.map((p) => (
        <span
          key={`petal-${p.id}`}
          className="floating-petal"
          style={{
            left: p.left,
            bottom: "-20px",
            fontSize: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          {p.emoji}
        </span>
      ))}
      {hearts.map((h) => (
        <span
          key={`heart-${h.id}`}
          className="floating-heart"
          style={{
            left: h.left,
            bottom: "-20px",
            fontSize: h.size,
            animationDuration: h.duration,
            animationDelay: h.delay,
            opacity: 0.65,
          }}
        >
          💕
        </span>
      ))}
      {stars.map((s) => (
        <span
          key={`star-${s.id}`}
          className="twinkling-star"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}
