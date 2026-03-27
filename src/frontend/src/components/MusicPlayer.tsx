import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SongRecord, backendInterface } from "../backend";
import { ExternalBlob } from "../backend";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  onPlayStart?: () => void;
  onPlayStop?: () => void;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer({
  actor,
  isAdmin,
  onPlayStart,
  onPlayStop,
}: Props) {
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isPlayingRef = useRef(isPlaying);

  const currentSong = songs[currentIdx] ?? null;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      onPlayStart?.();
    } else {
      onPlayStop?.();
    }
  }, [isPlaying, onPlayStart, onPlayStop]);

  const loadSongs = useCallback(async () => {
    if (!actor) return;
    try {
      const list = await actor.listSongs();
      setSongs(list);
    } catch {
      toast.error("Failed to load songs");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) loadSongs();
  }, [actor, loadSongs]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally sync on idx/id change only
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.blob.getDirectURL();
    audio.load();
    if (isPlayingRef.current) audio.play().catch(() => {});
  }, [currentIdx, currentSong?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (shuffle) {
        setCurrentIdx(Math.floor(Math.random() * songs.length));
        setIsPlaying(true);
      } else if (currentIdx < songs.length - 1) {
        setCurrentIdx((i) => i + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIdx, repeat, shuffle, songs.length]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const playAt = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setIsPlaying(true);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setIsPlaying(true);
    }
  }, [currentIdx]);

  const handleNext = useCallback(() => {
    if (shuffle) {
      setCurrentIdx(Math.floor(Math.random() * songs.length));
      setIsPlaying(true);
    } else if (currentIdx < songs.length - 1) {
      setCurrentIdx((i) => i + 1);
      setIsPlaying(true);
    }
  }, [currentIdx, shuffle, songs.length]);

  const handleSeek = useCallback((vals: number[]) => {
    const audio = audioRef.current;
    if (!audio || vals[0] === undefined) return;
    audio.currentTime = vals[0];
    setCurrentTime(vals[0]);
  }, []);

  const handleUpload = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !actor || !title.trim()) {
      toast.error("Please select a file and enter a title");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const eb = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      await actor.addSong(eb, title.trim(), artist.trim() || "Unknown");
      toast.success("Song uploaded! 🎵");
      setTitle("");
      setArtist("");
      if (fileRef.current) fileRef.current.value = "";
      await loadSongs();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [actor, title, artist, loadSongs]);

  const handleDelete = useCallback(
    async (id: bigint, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!actor) return;
      try {
        await actor.deleteSong(id);
        setSongs((prev) => prev.filter((s) => s.id !== id));
        toast.success("Song removed");
      } catch {
        toast.error("Delete failed");
      }
    },
    [actor],
  );

  return (
    <section
      id="music"
      className="relative z-10 py-20 px-4"
      data-ocid="music.section"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: music player needs no captions */}
      <audio ref={audioRef} preload="metadata" />
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-rose mb-3">
            Birthday Playlist 🎵
          </h2>
          <p className="text-muted-foreground text-lg">
            Songs to celebrate this special day
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-6 sm:p-8"
              style={{ border: "1.5px solid oklch(0.80 0.10 0 / 0.3)" }}
            >
              <div
                className="w-full aspect-square rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.88 0.06 0), oklch(0.85 0.06 280), oklch(0.87 0.07 50))",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-center"
                  >
                    <span className="text-7xl">🎵</span>
                    {isPlaying && (
                      <div className="flex items-end justify-center gap-1 mt-3 h-8">
                        {[0, 0.2, 0.4, 0.1, 0.3].map((d) => (
                          <div
                            key={d}
                            className="eq-bar"
                            style={{ animationDelay: `${d}s`, height: "100%" }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="text-center mb-5">
                <p
                  className="playfair text-xl font-bold truncate"
                  style={{ color: "oklch(0.35 0.10 0)" }}
                >
                  {currentSong?.title ?? "No song selected"}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(0.55 0.08 280)" }}
                >
                  {currentSong?.artist ?? ""}
                </p>
              </div>

              <div className="mb-4">
                <Slider
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  disabled={!currentSong}
                  className="mb-1"
                />
                <div
                  className="flex justify-between text-xs"
                  style={{ color: "oklch(0.55 0.06 0)" }}
                >
                  <span>{fmt(currentTime)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShuffle((s) => !s)}
                  className="p-2 rounded-full transition-all text-lg"
                  style={{
                    color: shuffle
                      ? "oklch(0.55 0.15 0)"
                      : "oklch(0.65 0.05 0)",
                    background: shuffle ? "oklch(0.92 0.05 0)" : "transparent",
                  }}
                  data-ocid="music.toggle"
                >
                  🔀
                </button>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="p-3 rounded-full transition-all text-xl disabled:opacity-30"
                  style={{ color: "oklch(0.50 0.12 0)" }}
                  data-ocid="music.pagination_prev"
                >
                  ⏮
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!currentSong}
                  className="p-4 rounded-full text-white text-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.15 0), oklch(0.60 0.12 280))",
                    boxShadow: "0 4px 20px oklch(0.55 0.15 0 / 0.40)",
                  }}
                  data-ocid="music.primary_button"
                >
                  {isPlaying ? "⏸" : "▶️"}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIdx >= songs.length - 1 && !shuffle}
                  className="p-3 rounded-full transition-all text-xl disabled:opacity-30"
                  style={{ color: "oklch(0.50 0.12 0)" }}
                  data-ocid="music.pagination_next"
                >
                  ⏭
                </button>
                <button
                  type="button"
                  onClick={() => setRepeat((r) => !r)}
                  className="p-2 rounded-full transition-all text-lg"
                  style={{
                    color: repeat ? "oklch(0.55 0.15 0)" : "oklch(0.65 0.05 0)",
                    background: repeat ? "oklch(0.92 0.05 0)" : "transparent",
                  }}
                  data-ocid="music.secondary_button"
                >
                  🔁
                </button>
              </div>
            </motion.div>

            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 mt-5"
                style={{ border: "1.5px solid oklch(0.75 0.10 0 / 0.25)" }}
              >
                <h4
                  className="font-semibold mb-3"
                  style={{ color: "oklch(0.50 0.15 0)" }}
                >
                  🎵 Upload Song
                </h4>
                <div className="space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="audio/*"
                    className="block w-full text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm cursor-pointer"
                    style={{ color: "oklch(0.40 0.08 0)" }}
                    data-ocid="music.upload_button"
                  />
                  <Input
                    placeholder="Song title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl"
                    data-ocid="music.input"
                  />
                  <Input
                    placeholder="Artist name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || songs.length >= 20}
                    className="w-full rounded-xl"
                    style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
                    data-ocid="music.submit_button"
                  >
                    {uploading
                      ? `Uploading ${Math.round(uploadProgress)}%`
                      : songs.length >= 20
                        ? "Max 20 songs"
                        : "Upload Song"}
                  </Button>
                  {uploading && (
                    <Progress value={uploadProgress} className="h-1.5" />
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-6 h-full"
              style={{ border: "1.5px solid oklch(0.80 0.10 0 / 0.3)" }}
            >
              <h3
                className="playfair text-xl font-bold mb-5"
                style={{ color: "oklch(0.45 0.12 0)" }}
              >
                Playlist
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <span className="text-3xl animate-spin inline-block">🎵</span>
                </div>
              ) : songs.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="music.empty_state"
                >
                  <p className="text-4xl mb-3">🎵</p>
                  <p className="text-muted-foreground">
                    No songs yet. Admin can upload songs!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {songs.map((song, i) => (
                    <motion.div
                      key={song.id.toString()}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => playAt(i)}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer group transition-all"
                      style={{
                        background:
                          currentIdx === i
                            ? "linear-gradient(135deg, oklch(0.88 0.06 0 / 0.8), oklch(0.85 0.06 280 / 0.6))"
                            : "oklch(1 0 0 / 0.4)",
                        border: `1.5px solid ${
                          currentIdx === i
                            ? "oklch(0.75 0.10 0 / 0.4)"
                            : "transparent"
                        }`,
                      }}
                      data-ocid={`music.item.${i + 1}`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{
                          background:
                            currentIdx === i
                              ? "linear-gradient(135deg, oklch(0.55 0.15 0), oklch(0.55 0.12 280))"
                              : "oklch(0.90 0.05 0)",
                          color:
                            currentIdx === i ? "white" : "oklch(0.55 0.12 0)",
                        }}
                      >
                        {currentIdx === i && isPlaying ? "▶" : String(i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: "oklch(0.30 0.08 0)" }}
                        >
                          {song.title}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "oklch(0.55 0.05 280)" }}
                        >
                          {song.artist}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(song.id, e)}
                          className="ml-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm flex-shrink-0"
                          data-ocid={`music.delete_button.${i + 1}`}
                        >
                          🗑️
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
