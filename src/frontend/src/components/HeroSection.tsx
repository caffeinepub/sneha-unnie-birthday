import { motion } from "motion/react";
import { useMemo } from "react";

const CONFETTI_COLORS = [
  "#FFB3C1",
  "#C8B6E2",
  "#FFDAB9",
  "#B5EAD7",
  "#FFD700",
  "#FF9AA2",
];

export default function HeroSection() {
  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${(i * 3.4) % 100}%`,
        delay: `${(i * 0.5) % 10}s`,
        duration: `${6 + (i % 5) * 1.5}s`,
        size: `${6 + (i % 6)}px`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: i % 3 === 0 ? "50%" : "2px",
      })),
    [],
  );

  const balloons = ["🎈", "🎈", "🎀", "🎈", "🎊", "🎈"];
  const emojis = ["🎂", "🎁", "🎊", "💐", "🥂", "🎉"];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      data-ocid="hero.section"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-birthday.dim_1600x900.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.92 0.05 0 / 0.5) 0%, oklch(0.90 0.05 280 / 0.3) 50%, transparent 100%)",
        }}
      />

      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-piece"
          style={{
            left: c.left,
            top: "-10px",
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: c.shape,
            animationDuration: c.duration,
            animationDelay: c.delay,
          }}
        />
      ))}

      <div
        className="absolute top-6 left-0 right-0 flex justify-around px-4"
        style={{ zIndex: 2 }}
      >
        {balloons.map((b, i) => (
          <span
            key={b + String(i)}
            className="balloon text-3xl md:text-5xl"
            style={{
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + i * 0.3}s`,
            }}
          >
            {b}
          </span>
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4"
        >
          <span
            className="inline-block px-6 py-2 glass-card rounded-full text-sm font-semibold tracking-widest uppercase"
            style={{ color: "oklch(0.50 0.15 0)" }}
          >
            ✨ March 29, 2026 ✨
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="hero-title text-5xl sm:text-7xl md:text-8xl font-bold mb-4 leading-tight"
        >
          Happy 26th
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="playfair text-3xl sm:text-5xl font-bold mb-4 text-gradient-rose"
        >
          Birthday,
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            delay: 1.0,
            type: "spring",
            stiffness: 100,
          }}
          className="playfair text-5xl sm:text-7xl md:text-8xl font-bold mb-8"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.15 0), oklch(0.60 0.12 280), oklch(0.55 0.15 0))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Sneha Unnie 🌸
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "oklch(0.40 0.08 0)" }}
        >
          Wishing you a day as beautiful as you are, Sneha Unnie 🌸
          <br />
          <span
            className="text-base italic"
            style={{ color: "oklch(0.50 0.08 280)" }}
          >
            May this year bring you endless joy, love &amp; beautiful memories
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-wrap justify-center gap-4 text-3xl sm:text-4xl"
        >
          {emojis.map((e, i) => (
            <span
              key={e + String(i)}
              className="balloon"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2.5s",
              }}
            >
              {e}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
        onClick={() =>
          document
            .getElementById("countdown")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        data-ocid="hero.button"
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "oklch(0.55 0.15 0)" }}
        >
          Scroll
        </span>
        <div
          className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2"
          style={{ borderColor: "oklch(0.55 0.15 0 / 0.5)" }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="w-1.5 h-3 rounded-full"
            style={{ background: "oklch(0.55 0.15 0)" }}
          />
        </div>
      </motion.button>
    </section>
  );
}
