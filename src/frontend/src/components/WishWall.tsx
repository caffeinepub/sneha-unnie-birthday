import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { WishRecord, backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

const CARD_BG_STYLES = [
  {
    background:
      "linear-gradient(135deg, oklch(0.93 0.05 0 / 0.7), oklch(0.95 0.04 0 / 0.5))",
  },
  {
    background:
      "linear-gradient(135deg, oklch(0.90 0.05 280 / 0.7), oklch(0.93 0.04 0 / 0.5))",
  },
  {
    background:
      "linear-gradient(135deg, oklch(0.93 0.06 50 / 0.7), oklch(0.95 0.04 80 / 0.5))",
  },
  {
    background:
      "linear-gradient(135deg, oklch(0.93 0.05 160 / 0.7), oklch(0.95 0.03 120 / 0.5))",
  },
  {
    background:
      "linear-gradient(135deg, oklch(0.91 0.04 240 / 0.7), oklch(0.93 0.05 280 / 0.5))",
  },
  {
    background:
      "linear-gradient(135deg, oklch(0.92 0.06 30 / 0.7), oklch(0.94 0.05 60 / 0.5))",
  },
];

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WishWall({ actor, isAdmin }: Props) {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const loadWishes = useCallback(async () => {
    if (!actor) return;
    try {
      const list = await actor.listWishes();
      setWishes([...list].reverse());
    } catch {
      toast.error("Failed to load wishes");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) loadWishes();
  }, [actor, loadWishes]);

  const handleSubmit = useCallback(async () => {
    if (!actor || !name.trim() || !message.trim()) {
      toast.error("Please enter your name and a wish 💌");
      return;
    }
    setSubmitting(true);
    try {
      const wish = await actor.submitWish(name.trim(), message.trim());
      setWishes((prev) => [wish, ...prev]);
      setName("");
      setMessage("");
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
      toast.success("Your wish was sent! 💕");
    } catch {
      toast.error("Failed to send wish");
    } finally {
      setSubmitting(false);
    }
  }, [actor, name, message]);

  const handleDelete = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deleteWish(id);
        setWishes((prev) => prev.filter((w) => w.id !== id));
        toast.success("Wish removed");
      } catch {
        toast.error("Delete failed");
      }
    },
    [actor],
  );

  return (
    <section
      id="wishes"
      className="relative z-10 py-20 px-4"
      data-ocid="wishes.section"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-rose mb-3">
            Birthday Wishes 💌
          </h2>
          <p className="text-muted-foreground text-lg">
            Leave your love and warm wishes for Sneha Unnie
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-3xl p-6 sm:p-8 mb-14 max-w-2xl mx-auto relative overflow-hidden"
          style={{ border: "1.5px solid oklch(0.80 0.10 0 / 0.3)" }}
        >
          <AnimatePresence>
            {justSubmitted && (
              <motion.div
                key="hearts"
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-6xl animate-bounce">💕</span>
              </motion.div>
            )}
          </AnimatePresence>
          <h3
            className="playfair text-2xl font-bold mb-6 text-center"
            style={{ color: "oklch(0.50 0.15 0)" }}
          >
            Send Your Wish 🌸
          </h3>
          <div className="space-y-4">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              data-ocid="wishes.input"
            />
            <Textarea
              placeholder="Write your birthday wish for Sneha Unnie..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="rounded-xl resize-none"
              data-ocid="wishes.textarea"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting || !actor}
              className="w-full rounded-xl py-3 text-base font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.15 0), oklch(0.55 0.12 280))",
                color: "white",
              }}
              data-ocid="wishes.submit_button"
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="animate-spin">✨</span> Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <span className="heart-icon">💕</span> Send Wish
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <span className="text-3xl animate-spin inline-block">✨</span>
            <p className="text-muted-foreground mt-2">Loading wishes...</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-16" data-ocid="wishes.empty_state">
            <p className="text-5xl mb-4">💌</p>
            <p className="text-muted-foreground text-lg">
              No wishes yet. Be the first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {wishes.map((wish, i) => (
                <motion.div
                  key={wish.id.toString()}
                  className="wish-card relative rounded-3xl p-6 backdrop-blur-sm group"
                  initial={{ opacity: 0, y: 20, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.5,
                    type: "spring",
                  }}
                  style={{
                    ...CARD_BG_STYLES[i % CARD_BG_STYLES.length],
                    border: "1.5px solid oklch(0.80 0.08 0 / 0.3)",
                    boxShadow: "0 4px 20px oklch(0.55 0.15 0 / 0.08)",
                  }}
                  data-ocid={`wishes.item.${i + 1}`}
                >
                  <span className="absolute top-3 right-4 text-lg opacity-60 heart-icon">
                    💕
                  </span>
                  <p
                    className="text-base leading-relaxed mb-4"
                    style={{ color: "oklch(0.30 0.05 0)" }}
                  >
                    “{wish.message}”
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "oklch(0.50 0.15 0)" }}
                      >
                        — {wish.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.55 0.05 280)" }}
                      >
                        {formatDate(wish.submittedAt)}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(wish.id)}
                        className="ml-3 text-red-400 hover:text-red-600 transition-colors text-sm opacity-0 group-hover:opacity-100"
                        data-ocid={`wishes.delete_button.${i + 1}`}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
