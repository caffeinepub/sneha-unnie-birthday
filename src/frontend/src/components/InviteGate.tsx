import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";

const STORAGE_KEY = "sneha_invite_code";
const PASSWORD_KEY = "sneha_guest_password";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  children: ReactNode;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

export default function InviteGate({ actor, isAdmin, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const checkedRef = useRef(false);
  const pendingSubmitRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      setUnlocked(true);
      setChecking(false);
      return;
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    if (!actor) {
      // If actor takes too long, stop spinner and show login form
      const timeout = setTimeout(() => setChecking(false), 8000);
      return () => clearTimeout(timeout);
    }
    if (checkedRef.current) {
      // Actor just became available; if there's a pending submit, run it
      if (pendingSubmitRef.current !== null) {
        const pw = pendingSubmitRef.current;
        pendingSubmitRef.current = null;
        runSubmit(actor, pw);
      }
      return;
    }
    checkedRef.current = true;

    const autoCheck = async () => {
      // Check invite code first
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("invite");
      const storedCode = localStorage.getItem(STORAGE_KEY);
      const codeToCheck = urlCode || storedCode;

      if (codeToCheck) {
        try {
          const valid = await actor.validateInviteCode(codeToCheck);
          if (valid) {
            localStorage.setItem(STORAGE_KEY, codeToCheck);
            setUnlocked(true);
            setChecking(false);
            return;
          }
        } catch (_e) {
          console.error("Failed to validate invite code", _e);
        }
      }

      // Check stored password
      const storedPassword = localStorage.getItem(PASSWORD_KEY);
      if (storedPassword) {
        try {
          const valid = await actor.validateGuestPassword(storedPassword);
          if (valid) {
            setUnlocked(true);
            setChecking(false);
            return;
          }
          localStorage.removeItem(PASSWORD_KEY);
        } catch (_e) {
          console.error("Failed to validate password");
        }
      }

      setChecking(false);
    };

    autoCheck();
  }, [actor, isAdmin]);

  const runSubmit = async (actorInstance: backendInterface, code: string) => {
    setSubmitting(true);
    setError("");
    try {
      // Try invite code first
      let inviteValid = false;
      try {
        inviteValid = await withRetry(() =>
          actorInstance.validateInviteCode(code),
        );
      } catch {
        inviteValid = false;
      }
      if (inviteValid) {
        localStorage.setItem(STORAGE_KEY, code);
        setUnlocked(true);
        return;
      }
      // Try as password
      let passwordValid = false;
      try {
        passwordValid = await withRetry(() =>
          actorInstance.validateGuestPassword(code),
        );
      } catch (e) {
        console.error("Password validation error:", e);
        setError("Connection error. Please check your internet and try again.");
        return;
      }
      if (passwordValid) {
        localStorage.setItem(PASSWORD_KEY, code);
        setUnlocked(true);
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const code = inputCode.trim();
    if (!code) return;
    if (!actor) {
      // Store pending submit; it will run when actor becomes available
      pendingSubmitRef.current = code;
      setSubmitting(true);
      setError("");
      // Auto-cancel after 15 seconds if actor never arrives
      setTimeout(() => {
        if (pendingSubmitRef.current !== null) {
          pendingSubmitRef.current = null;
          setSubmitting(false);
          setError("Connection error. Please try again in a moment.");
        }
      }, 15000);
      return;
    }
    await runSubmit(actor, code);
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
          This is a private celebration. Enter the password to join.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              className="rounded-xl text-center pr-10"
              style={{ background: "oklch(1 0 0 / 0.7)" }}
              data-ocid="invite.input"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

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
          Don&apos;t have the password? Ask the birthday organiser.
        </p>
      </motion.div>
    </div>
  );
}
