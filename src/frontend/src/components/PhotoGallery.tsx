import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PhotoRecord, backendInterface } from "../backend";
import { ExternalBlob } from "../backend";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: PhotoRecord[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];
  if (!photo) return null;
  return (
    <motion.div
      key="lightbox"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-ocid="photo.modal"
    >
      <motion.div
        className="relative max-w-4xl w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.blob.getDirectURL()}
          alt={photo.caption}
          className="w-full max-h-[80vh] object-contain rounded-2xl"
        />
        {photo.caption && (
          <p className="text-center text-white mt-4 text-lg">{photo.caption}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center text-white text-xl"
          data-ocid="photo.close_button"
        >
          ×
        </button>
        {index > 0 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl"
            data-ocid="photo.pagination_prev"
          >
            ‹
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl"
            data-ocid="photo.pagination_next"
          >
            ›
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function PhotoGallery({ actor, isAdmin }: Props) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    if (!actor) return;
    try {
      const list = await actor.listPhotos();
      setPhotos(list);
    } catch {
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) loadPhotos();
  }, [actor, loadPhotos]);

  const handleUpload = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !actor) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const eb = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      await actor.addPhoto(eb, caption);
      toast.success("Photo uploaded! 📸");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      await loadPhotos();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [actor, caption, loadPhotos]);

  const handleDelete = useCallback(
    async (id: bigint) => {
      if (!actor) return;
      try {
        await actor.deletePhoto(id);
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        toast.success("Photo deleted");
      } catch {
        toast.error("Delete failed");
      }
    },
    [actor],
  );

  return (
    <section
      id="gallery"
      className="relative z-10 py-20 px-4"
      data-ocid="gallery.section"
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
            Our Beautiful Memories 📸
          </h2>
          <p className="text-muted-foreground text-lg">
            Captured moments that last forever
          </p>
        </motion.div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-10"
            style={{ border: "1.5px solid oklch(0.75 0.10 0 / 0.3)" }}
          >
            <h3
              className="font-semibold text-lg mb-4"
              style={{ color: "oklch(0.50 0.15 0)" }}
            >
              📸 Upload New Photo
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold cursor-pointer"
                  style={{ color: "oklch(0.40 0.08 0)" }}
                  data-ocid="photo.upload_button"
                />
              </div>
              <Input
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="flex-1 min-w-[160px]"
                data-ocid="photo.input"
              />
              <Button
                onClick={handleUpload}
                disabled={uploading}
                style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
                className="rounded-full px-6"
                data-ocid="photo.submit_button"
              >
                {uploading ? "Uploading..." : "Upload 📸"}
              </Button>
            </div>
            {uploading && (
              <div className="mt-3">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <Skeleton key={k} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16" data-ocid="gallery.empty_state">
            <p className="text-5xl mb-4">📷</p>
            <p className="text-muted-foreground text-lg">
              No photos yet. Be the first to add memories!
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id.toString()}
                className="photo-card relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group"
                whileHover={{ y: -4 }}
                onClick={() => setLightboxIdx(i)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                data-ocid={`gallery.item.${i + 1}`}
              >
                <img
                  src={photo.blob.getDirectURL()}
                  alt={photo.caption || "Memory"}
                  className="w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {photo.caption && (
                      <p className="text-white text-sm font-medium">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    data-ocid={`gallery.delete_button.${i + 1}`}
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={photos}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() =>
              setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i))
            }
            onNext={() =>
              setLightboxIdx((i) =>
                i !== null && i < photos.length - 1 ? i + 1 : i,
              )
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}
