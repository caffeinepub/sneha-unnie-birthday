import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import BackgroundMusic from "./components/BackgroundMusic";
import CountdownTimer from "./components/CountdownTimer";
import FloatingElements from "./components/FloatingElements";
import HeroSection from "./components/HeroSection";
import InviteGate from "./components/InviteGate";
import MusicPlayer from "./components/MusicPlayer";
import PhotoGallery from "./components/PhotoGallery";
import WishWall from "./components/WishWall";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [playlistPlaying, setPlaylistPlaying] = useState(false);

  const checkAdmin = useCallback(async () => {
    if (!actor || !identity) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }
    try {
      const adminResult = await actor.isCallerAdmin();
      if (adminResult) {
        setIsAdmin(true);
        setAdminChecked(true);
        return;
      }
      const claimed = await (actor as any).claimFirstAdmin?.();
      setIsAdmin(!!claimed);
    } catch (e) {
      console.error("Admin check failed:", e);
      setIsAdmin(false);
    } finally {
      setAdminChecked(true);
    }
  }, [actor, identity]);

  useEffect(() => {
    if (identity && actor) {
      checkAdmin();
    } else if (!identity) {
      setIsAdmin(false);
      setAdminChecked(true);
    }
  }, [identity, actor, checkAdmin]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <InviteGate actor={actor} isAdmin={isAdmin}>
        <div className="fixed inset-0 animated-gradient-bg -z-10" />
        <FloatingElements />
        <BackgroundMusic
          actor={actor}
          isAdmin={isAdmin}
          shouldPause={playlistPlaying}
        />
        <main>
          <HeroSection />
          <CountdownTimer />
          <PhotoGallery actor={actor} isAdmin={isAdmin} />
          <WishWall actor={actor} isAdmin={isAdmin} />
          <MusicPlayer
            actor={actor}
            isAdmin={isAdmin}
            onPlayStart={() => setPlaylistPlaying(true)}
            onPlayStop={() => setPlaylistPlaying(false)}
          />
        </main>
        <footer className="relative z-10 py-8 text-center">
          <div className="glass-card mx-auto max-w-md rounded-full px-8 py-3 inline-block">
            <p className="text-sm text-muted-foreground">
              Made with{" "}
              <span
                className="heart-icon inline-block"
                style={{ color: "oklch(0.55 0.15 0)" }}
              >
                ❤️
              </span>{" "}
              for Sneha Unnie&apos;s 26th Birthday · ©{" "}
              {new Date().getFullYear()} ·{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
        {adminChecked && (
          <AdminPanel actor={actor} isAdmin={isAdmin} identity={identity} />
        )}
      </InviteGate>
      <Toaster richColors position="top-right" />
    </div>
  );
}
