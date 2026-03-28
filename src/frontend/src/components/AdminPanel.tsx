import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Identity } from "@icp-sdk/core/agent";
import { Copy, Eye, EyeOff, Link, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface InviteCodeRecord {
  code: string;
  created: bigint;
  used: boolean;
}

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  identity: Identity | undefined;
}

export default function AdminPanel({ actor, isAdmin, identity }: Props) {
  const { login, isLoggingIn, loginStatus } = useInternetIdentity();
  const [open, setOpen] = useState(false);
  const isAuthenticated = !!identity;

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-50 glass-card w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-pastel transition-all hover:scale-110"
        style={{ border: "1.5px solid oklch(0.75 0.10 0 / 0.3)" }}
        title="Admin Panel"
        data-ocid="admin.open_modal_button"
      >
        ⚙️
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
            data-ocid="admin.modal"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-md max-h-[80vh] overflow-y-auto"
              style={{ border: "1.5px solid oklch(0.80 0.10 0 / 0.3)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="playfair text-2xl font-bold"
                  style={{ color: "oklch(0.45 0.15 0)" }}
                >
                  Admin Panel ⚙️
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10"
                  style={{ color: "oklch(0.50 0.10 0)" }}
                  data-ocid="admin.close_button"
                >
                  ×
                </button>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-5xl mb-4">🔐</p>
                  <p className="text-muted-foreground mb-6">
                    Please log in with Internet Identity to access the admin
                    panel.
                  </p>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="rounded-full px-8"
                    style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
                    data-ocid="admin.primary_button"
                  >
                    {isLoggingIn ? "Logging in..." : "Admin Login"}
                  </Button>
                  {loginStatus === "loginError" && (
                    <p className="text-red-500 text-sm mt-3">
                      Login failed. Please try again.
                    </p>
                  )}
                </div>
              ) : !isAdmin ? (
                <div className="text-center py-8" data-ocid="admin.error_state">
                  <p className="text-5xl mb-4">🚫</p>
                  <p className="text-muted-foreground">
                    Access Denied. This account is not an admin.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Principal:{" "}
                    {identity?.getPrincipal().toString().slice(0, 20)}...
                  </p>
                </div>
              ) : (
                <AdminContent actor={actor} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AdminContent({ actor }: { actor: backendInterface | null }) {
  const { clear } = useInternetIdentity();
  const sections = [
    {
      label: "📸 Photo Gallery",
      id: "gallery",
      desc: "Upload photos and delete by hovering over them.",
    },
    {
      label: "💌 Wish Wall",
      id: "wishes",
      desc: "Delete inappropriate wishes by hovering over wish cards.",
    },
    {
      label: "🎵 Music Player",
      id: "music",
      desc: "Upload songs (max 20). Use the 🎼 button for background music.",
    },
  ];

  return (
    <div>
      <div
        className="mb-4 p-3 rounded-xl text-sm"
        style={{
          background: "oklch(0.92 0.05 160 / 0.5)",
          color: "oklch(0.35 0.10 160)",
        }}
      >
        ✅ Logged in as Admin
      </div>
      <Tabs defaultValue="password">
        <TabsList className="w-full rounded-xl mb-4">
          <TabsTrigger
            value="password"
            className="flex-1 rounded-lg"
            data-ocid="admin.tab"
          >
            🔑 Password
          </TabsTrigger>
          <TabsTrigger
            value="invites"
            className="flex-1 rounded-lg"
            data-ocid="admin.tab"
          >
            🔗 Invites
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="flex-1 rounded-lg"
            data-ocid="admin.tab"
          >
            Guide
          </TabsTrigger>
          <TabsTrigger
            value="nav"
            className="flex-1 rounded-lg"
            data-ocid="admin.tab"
          >
            Navigate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <GuestPasswordPanel actor={actor} />
        </TabsContent>

        <TabsContent value="invites">
          <InviteLinksPanel actor={actor} />
        </TabsContent>

        <TabsContent value="info">
          <div className="space-y-3">
            {sections.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl text-sm"
                style={{ background: "oklch(0.94 0.03 60)" }}
              >
                <p
                  className="font-semibold mb-1"
                  style={{ color: "oklch(0.40 0.10 0)" }}
                >
                  {s.label}
                </p>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nav">
          <div className="space-y-2">
            {sections.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() =>
                  document
                    .getElementById(s.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full text-left text-sm py-3 px-4 rounded-xl transition-colors hover:bg-white/50"
                style={{
                  background: "oklch(0.94 0.03 60)",
                  color: "oklch(0.40 0.10 0)",
                }}
                data-ocid="admin.link"
              >
                {s.label}
              </button>
            ))}
            <Button
              onClick={() => clear()}
              variant="outline"
              className="w-full rounded-xl mt-2"
              data-ocid="admin.secondary_button"
            >
              Logout
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function ensureAdmin(actor: backendInterface): Promise<boolean> {
  try {
    const isAdmin = await actor.isCallerAdmin();
    if (isAdmin) return true;
    // Try to claim first admin
    const claimed = await (actor as any).claimFirstAdmin?.();
    if (claimed) return true;
    return false;
  } catch {
    return false;
  }
}

function GuestPasswordPanel({ actor }: { actor: backendInterface | null }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSave = async () => {
    if (!actor) return;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const adminOk = await ensureAdmin(actor);
      if (!adminOk) {
        setError("Not recognized as admin. Please log out and log in again.");
        return;
      }
      await actor.setGuestPassword(password);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setPassword("");
      setConfirm("");
    } catch (_e) {
      setError("Failed to save password. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!actor) return;
    setSaving(true);
    setError("");
    try {
      const adminOk = await ensureAdmin(actor);
      if (!adminOk) {
        setError("Not recognized as admin. Please log out and log in again.");
        return;
      }
      await actor.setGuestPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to clear password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set a password that guests must enter to access the site. Leave blank to
        remove the password requirement.
      </p>

      <div className="space-y-2">
        <div className="relative">
          <Input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="New password"
            type={showPw ? "text" : "password"}
            className="rounded-xl pr-10"
            style={{ background: "oklch(1 0 0 / 0.7)" }}
            data-ocid="admin.input"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            tabIndex={-1}
          >
            {showPw ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <Input
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError("");
          }}
          placeholder="Confirm password"
          type={showPw ? "text" : "password"}
          className="rounded-xl"
          style={{ background: "oklch(1 0 0 / 0.7)" }}
          data-ocid="admin.input"
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "oklch(0.50 0.18 27)" }}>
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm" style={{ color: "oklch(0.45 0.12 160)" }}>
          ✅ Saved successfully!
        </p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || !password.trim()}
          className="flex-1 rounded-xl"
          style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
          data-ocid="admin.primary_button"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {saving ? "Saving..." : "Set Password"}
        </Button>
        <Button
          onClick={handleClear}
          disabled={saving}
          variant="outline"
          className="rounded-xl"
          data-ocid="admin.secondary_button"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function InviteLinksPanel({ actor }: { actor: backendInterface | null }) {
  const [codes, setCodes] = useState<InviteCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const fetchCodes = useCallback(async () => {
    if (!actor) return;
    try {
      const list = await (actor as any).listInviteCodes();
      setCodes(list);
    } catch (_e) {
      console.error("Failed to fetch invite codes");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerate = async () => {
    if (!actor) return;
    setGenerating(true);
    const code =
      customCode.trim() || Math.random().toString(36).substring(2, 10);
    try {
      await (actor as any).generateInviteCode(code);
      setCustomCode("");
      await fetchCodes();
    } catch (_e) {
      console.error("Failed to generate invite code");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (code: string) => {
    if (!actor) return;
    try {
      await (actor as any).revokeInviteCode(code);
      await fetchCodes();
    } catch (_e) {
      console.error("Failed to revoke invite code");
    }
  };

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}?invite=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Generate invite codes to share with guests. Only people with a valid
        code can view the site.
      </p>

      <div className="flex gap-2">
        <Input
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="Custom code (optional)"
          className="rounded-xl text-sm flex-1"
          style={{ background: "oklch(1 0 0 / 0.7)" }}
          data-ocid="admin.input"
        />
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-xl shrink-0"
          style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
          data-ocid="admin.primary_button"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>

      {loading ? (
        <div
          className="flex justify-center py-4"
          data-ocid="admin.loading_state"
        >
          <Loader2
            className="w-5 h-5 animate-spin"
            style={{ color: "oklch(0.55 0.15 0)" }}
          />
        </div>
      ) : codes.length === 0 ? (
        <div
          className="text-center py-6 rounded-xl text-sm text-muted-foreground"
          style={{ background: "oklch(0.94 0.03 60)" }}
          data-ocid="admin.empty_state"
        >
          <Link className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No invite codes yet. Generate one above.
        </div>
      ) : (
        <div className="space-y-2" data-ocid="admin.list">
          {codes.map((rec, idx) => (
            <motion.div
              key={rec.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "oklch(0.94 0.03 60)" }}
              data-ocid={`admin.item.${idx + 1}`}
            >
              <code
                className="flex-1 text-xs font-mono truncate"
                style={{ color: "oklch(0.40 0.12 0)" }}
              >
                {rec.code}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(rec.code)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/60 shrink-0"
                title="Copy invite link"
                data-ocid="admin.secondary_button"
              >
                {copiedCode === rec.code ? (
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.45 0.12 160)" }}
                  >
                    ✓
                  </span>
                ) : (
                  <Copy
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.50 0.10 0)" }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleRevoke(rec.code)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-100 shrink-0"
                title="Revoke code"
                data-ocid="admin.delete_button"
              >
                <Trash2
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.50 0.18 27)" }}
                />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
