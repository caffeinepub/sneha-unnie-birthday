import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { ExternalBlob } from "../backend";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  shouldPause: boolean;
}

export default function BackgroundMusic({
  actor,
  isAdmin,
  shouldPause,
}: Props) {
  const [muted, setMuted] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const wasPlayingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const userMutedRef = useRef(false);

  const loadAndPlay = useCallback(async () => {
    if (!actor || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    try {
      const blob = await actor.getBackgroundMusic();
      if (!blob) return;
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = blob.getDirectURL();
      audio.loop = true;
      audio.volume = 0.3;
      audio.muted = true;
      audio.load();

      const playResult = await audio.play().catch(() => null);
      if (playResult === null) {
        // Autoplay fully blocked -- show play button
        setNeedsInteraction(true);
        setBgLoaded(true);
        return;
      }
      setBgLoaded(true);

      // Unmute on first user interaction
      const unmute = () => {
        if (!userMutedRef.current) {
          audio.muted = false;
          setMuted(false);
        }
      };
      document.addEventListener("click", unmute, { once: true });
      document.addEventListener("scroll", unmute, { once: true });
      document.addEventListener("touchstart", unmute, { once: true });
    } catch {
      hasLoadedRef.current = false; // allow retry
    }
  }, [actor]);

  useEffect(() => {
    if (actor) loadAndPlay();
  }, [actor, loadAndPlay]);

  // Handle pause/resume when playlist song plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (shouldPause) {
      if (!audio.paused) {
        wasPlayingRef.current = true;
        audio.pause();
      }
    } else {
      if (wasPlayingRef.current) {
        wasPlayingRef.current = false;
        audio.play().catch(() => {});
      }
    }
  }, [shouldPause]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !muted;
    audio.muted = newMuted;
    userMutedRef.current = newMuted;
    setMuted(newMuted);
  };

  const handleManualPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    setMuted(false);
    userMutedRef.current = false;
    await audio.play().catch(() => {});
    setNeedsInteraction(false);
  };

  const handleUploadBg = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !actor) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const eb = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      await actor.setBackgroundMusic(eb);
      toast.success("Background music updated! 🎵");
      setShowPanel(false);
      if (fileRef.current) fileRef.current.value = "";
      // Reset and reload
      hasLoadedRef.current = false;
      loadAndPlay();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [actor, loadAndPlay]);

  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: background music */}
      <audio ref={audioRef} loop preload="none" />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isAdmin && showPanel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="glass-card rounded-2xl p-4 w-64 shadow-pastel"
              style={{ border: "1.5px solid oklch(0.75 0.10 0 / 0.3)" }}
              data-ocid="music.panel"
            >
              <p
                className="text-sm font-semibold mb-3"
                style={{ color: "oklch(0.50 0.15 0)" }}
              >
                🎵 Background Music
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="block w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs cursor-pointer mb-2"
                style={{ color: "oklch(0.40 0.08 0)" }}
                data-ocid="music.dropzone"
              />
              {uploading && (
                <Progress value={uploadProgress} className="h-1.5 mb-2" />
              )}
              <button
                type="button"
                onClick={handleUploadBg}
                disabled={uploading}
                className="w-full py-1.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                style={{ background: "oklch(0.55 0.15 0)" }}
                data-ocid="music.save_button"
              >
                {uploading
                  ? `${Math.round(uploadProgress)}%`
                  : "Set as BG Music"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowPanel((v) => !v)}
              className="glass-card w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-pastel"
              style={{ border: "1.5px solid oklch(0.75 0.10 0 / 0.3)" }}
              title="Manage BG Music"
              data-ocid="music.edit_button"
            >
              🎼
            </button>
          )}
          {needsInteraction && (
            <button
              type="button"
              onClick={handleManualPlay}
              className="glass-card px-4 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-pastel gap-1.5"
              style={{
                border: "1.5px solid oklch(0.75 0.10 0 / 0.3)",
                color: "oklch(0.45 0.15 0)",
              }}
              title="Play background music"
              data-ocid="music.primary_button"
            >
              ▶ Play Music
            </button>
          )}
          {bgLoaded && !needsInteraction && (
            <button
              type="button"
              onClick={toggleMute}
              className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-pastel transition-all hover:scale-105"
              style={{ border: "1.5px solid oklch(0.75 0.10 0 / 0.3)" }}
              title={muted ? "Unmute" : "Mute"}
              data-ocid="music.toggle"
            >
              {muted ? "🔇" : "🎵"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
