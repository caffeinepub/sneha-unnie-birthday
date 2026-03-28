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

const STATIC_PHOTOS = [
  {
    id: "static-1",
    src: "/assets/uploads/whatsapp_image_2026-03-26_at_23.34.18_1-019d34fb-74cb-7305-a7cf-0a4055926b7e-1.jpeg",
    caption: "Beautiful Memories",
  },
  {
    id: "static-2",
    src: "/assets/uploads/whatsapp_image_2026-03-26_at_23.34.16-019d34fb-7675-70fa-b024-42c3ba28486d-2.jpeg",
    caption: "",
  },
  {
    id: "static-3",
    src: "/assets/uploads/whatsapp_image_2026-03-26_at_23.34.17-019d34fb-7779-711a-b042-d2c47e36882b-3.jpeg",
    caption: "",
  },
  {
    id: "static-4",
    src: "/assets/uploads/whatsapp_image_2026-03-26_at_23.34.18-019d34fb-7779-70b6-9f22-f251efc8d4fa-4.jpeg",
    caption: "",
  },
  {
    id: "static-5",
    src: "/assets/uploads/whatsapp_image_2026-03-26_at_23.34.17_1-019d34fb-77ac-724f-89c7-4c02d907ea05-5.jpeg",
    caption: "",
  },
];

type GalleryItem =
  | { type: "static"; id: string; src: string; caption: string }
  | { type: "dynamic"; photo: PhotoRecord };

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  if (!item) return null;
  const src =
    item.type === "static" ? item.src : item.photo.blob.getDirectURL();
  const caption = item.type === "static" ? item.caption : item.photo.caption;
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
          src={src}
          alt={caption || "Memory"}
          className="w-full max-h-[80vh] object-contain rounded-2xl"
        />
        {caption && (
          <p className="text-center text-white mt-4 text-lg">{caption}</p>
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
        {index < items.length - 1 && (
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
  const [loadError, setLoadError] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Unified gallery items: static photos first, then dynamic
  const allItems: GalleryItem[] = [
    ...STATIC_PHOTOS.map((p) => ({ type: "static" as const, ...p })),
    ...photos.map((p) => ({ type: "dynamic" as const, photo: p })),
  ];

  const loadPhotos = useCallback(async () => {
    if (!actor) return;
    setLoadError(false);
    setLoading(true);
    try {
      const list = await actor.listPhotos();
      setPhotos(list);
    } catch {
      toast.error("Failed to load photos");
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) {
      loadPhotos();
    } else {
      const timer = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [actor, loadPhotos]);

  const handleUpload = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !actor) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const eb = ExternalBlob.fromBytes(bytes, file.type).withUploadProgress(
        (pct) => setUploadProgress(pct),
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
        ) : loadError ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {STATIC_PHOTOS.map((photo, i) => (
              <StaticPhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
            <div className="text-center py-8" data-ocid="gallery.error_state">
              <p className="text-muted-foreground text-sm mb-3">
                Could not load additional photos.
              </p>
              <Button
                onClick={loadPhotos}
                style={{ background: "oklch(0.55 0.15 0)", color: "white" }}
                className="rounded-full px-6"
                data-ocid="gallery.primary_button"
              >
                Retry 🔄
              </Button>
            </div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {STATIC_PHOTOS.map((photo, i) => (
              <StaticPhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.id.toString()}
                photo={photo}
                index={STATIC_PHOTOS.length + i}
                isAdmin={isAdmin}
                onClick={() => setLightboxIdx(STATIC_PHOTOS.length + i)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            items={allItems}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() =>
              setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i))
            }
            onNext={() =>
              setLightboxIdx((i) =>
                i !== null && i < allItems.length - 1 ? i + 1 : i,
              )
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function StaticPhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: { id: string; src: string; caption: string };
  index: number;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      className="photo-card relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ y: -4 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`gallery.item.${index + 1}`}
    >
      {imgError ? (
        <div
          className="w-full h-48 flex items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.92 0.04 0), oklch(0.90 0.04 280))",
          }}
        >
          <span className="text-4xl">📷</span>
        </div>
      ) : (
        <img
          src={photo.src}
          alt={photo.caption || "Memory"}
          className="w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {photo.caption && (
            <p className="text-white text-sm font-medium">{photo.caption}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PhotoCard({
  photo,
  index,
  isAdmin,
  onClick,
  onDelete,
}: {
  photo: PhotoRecord;
  index: number;
  isAdmin: boolean;
  onClick: () => void;
  onDelete: (id: bigint) => void;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      className="photo-card relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ y: -4 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`gallery.item.${index + 1}`}
    >
      {imgError ? (
        <div
          className="w-full h-48 flex items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.92 0.04 0), oklch(0.90 0.04 280))",
          }}
        >
          <span className="text-4xl">📷</span>
        </div>
      ) : (
        <img
          src={photo.blob.getDirectURL()}
          alt={photo.caption || "Memory"}
          className="w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {photo.caption && (
            <p className="text-white text-sm font-medium">{photo.caption}</p>
          )}
        </div>
      </div>
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(photo.id);
          }}
          className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          data-ocid={`gallery.delete_button.${index + 1}`}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
