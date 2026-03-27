import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const TARGET_DATE = new Date("2026-03-29T00:00:00+05:30").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-tile flex flex-col items-center glass-card rounded-2xl px-4 py-5 sm:px-8 sm:py-7 min-w-[80px] sm:min-w-[120px]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -30, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="countdown-number text-4xl sm:text-6xl font-bold leading-none"
          style={{ color: "oklch(0.50 0.18 0)" }}
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <span
        className="mt-2 text-xs sm:text-sm font-semibold tracking-widest uppercase"
        style={{ color: "oklch(0.55 0.08 280)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);
  const prevRef = useRef<TimeLeft>(timeLeft);

  useEffect(() => {
    const id = setInterval(() => {
      const next = calcTimeLeft();
      prevRef.current = next;
      setTimeLeft(next);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isBirthday = timeLeft.total <= 0;

  return (
    <section
      id="countdown"
      className="relative z-10 py-20 px-4"
      data-ocid="countdown.section"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-gradient-rose">
            {isBirthday
              ? "🎉 The Day is Here! 🎉"
              : "Counting Down to the Big Day"}
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            March 29, 2026 — Sneha Unnie&apos;s 26th Birthday
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isBirthday ? (
            <motion.div
              key="celebrate"
              className="celebrate-message"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="inline-block glass-card rounded-3xl px-10 py-8 shadow-glow">
                <p className="text-4xl sm:text-6xl font-bold playfair text-gradient-rose mb-4">
                  🎉 Happy Birthday Sneha Unnie! 🎉
                </p>
                <p className="text-xl text-muted-foreground">
                  Wishing you the most magical day! 🌸✨💕
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              className="flex flex-wrap justify-center gap-3 sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <TimeTile value={timeLeft.days} label="Days" />
              <div
                className="flex items-center text-4xl font-bold"
                style={{ color: "oklch(0.70 0.12 0)" }}
              >
                :
              </div>
              <TimeTile value={timeLeft.hours} label="Hours" />
              <div
                className="flex items-center text-4xl font-bold"
                style={{ color: "oklch(0.70 0.12 0)" }}
              >
                :
              </div>
              <TimeTile value={timeLeft.minutes} label="Minutes" />
              <div
                className="flex items-center text-4xl font-bold"
                style={{ color: "oklch(0.70 0.12 0)" }}
              >
                :
              </div>
              <TimeTile value={timeLeft.seconds} label="Seconds" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 text-muted-foreground italic text-lg"
        >
          Every second is a step closer to celebrating you 🌸
        </motion.p>
      </div>
    </section>
  );
}
