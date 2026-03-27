import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";

const STORAGE_KEY = "sneha_invite_code";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  children: ReactNode;
}

export default function InviteGate({ actor, isAdmin, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (isAdmin) {
      setUnlocked(true);
      setChecking(false);
      return;
    }

    if (!actor || checkedRef.current) return;
    checkedRef.current = true;

    const autoCheck = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("invite");
      const storedCode = localStorage.getItem(STORAGE_KEY);
      const codeToCheck = urlCode || storedCode;

      if (codeToCheck) {
        try {
          const valid = await (actor as any).validateInviteCode(codeToCheck);
          if (valid) {
            localStorage.setItem(STORAGE_KEY, codeToCheck);
            setUnlocked(true);
          }
        } catch (e) {
          console.error("Failed to validate invite code", e);
        }
      }
      setChecking(false);
    };

    autoCheck();
  }, [actor, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setUnlocked(true);
      setChecking(false);
    }
  }, [isAdmin]);

  const handleSubmit = async () => {
    if (!inputCode.trim() || !actor) return;
    setSubmitting(true);
    setError("");
    try {
      const valid = await (actor as any).validateInviteCode(inputCode.trim());
      if (valid) {
        localStorage.setItem(STORAGE_KEY, inputCode.trim());
        setUnlocked(true);
      } else {
        setError("Invalid invite code. Please check your link.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="fixed inset-0 animated-gradient-bg flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "oklch(0.55 0.15 0)" }}
        />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div
      className="fixed inset-0 animated-gradient-bg flex items-center justify-center p-4"
      data-ocid="invite.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card rounded-3xl p-8 w-full max-w-sm shadow-pastel text-center"
        style={{ border: "1.5px solid oklch(0.80 0.10 0 / 0.3)" }}
      >
        <div className="text-5xl mb-4">🎂</div>
        <h1
          className="playfair text-2xl font-bold mb-2"
          style={{ color: "oklch(0.45 0.15 0)" }}
        >
          Sneha Unnie&apos;s Birthday
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          This is a private celebration. Enter your invite code to join.
        </p>

        <div className="space-y-3">
          <Input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter invite code"
            className="rounded-xl text-center tracking-widest"
            style={{ background: "oklch(1 0 0 / 0.7)" }}
            data-ocid="invite.input"
          />

          {error && (
            <p
              className="text-sm"
              style={{ color: "oklch(0.50 0.18 27)" }}
              data-ocid="invite.error_state"
            >
              {error}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting || !inputCode.trim()}
            className="w-full rounded-xl"
            style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
            data-ocid="invite.submit_button"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {submitting ? "Checking..." : "Enter 🎉"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Don&apos;t have a code? Ask the birthday organiser for a link.
        </p>
      </motion.div>
    </div>
  );
}
