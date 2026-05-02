import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ScanSearch, Sparkles } from "lucide-react";
import {
  createOutfitUpload,
  fetchUser,
  formatPossessive,
  OutfitDetection,
  OutfitUpload,
  titleize,
  User,
} from "../lib/closet";
import { ItemHeroPreview } from "./ItemHeroPreview";
import { ItemPhotoField } from "./ItemPhotoField";
import { useItemPhotoState } from "../lib/useItemPhotoState";

interface OutfitImportPageProps {
  userId: number | null;
  initialUser?: User | null;
  onBack: () => void;
}

export function OutfitImportPage({ userId, initialUser, onBack }: OutfitImportPageProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [outfitUpload, setOutfitUpload] = useState<OutfitUpload | null>(null);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const photoState = useItemPhotoState();

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      if (!userId) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (initialUser?.id === userId) {
        setUser(initialUser);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextUser = await fetchUser(userId, controller.signal);
        setUser(nextUser);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load this user.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, [initialUser, userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setErrorMessage("A user is required before you can import an outfit photo.");
      return;
    }

    if (!photoState.selectedFile) {
      setErrorMessage("Choose a photo before running detection.");
      return;
    }

    setIsDetecting(true);
    setErrorMessage("");

    try {
      const nextUpload = await createOutfitUpload(userId, { photo: photoState.selectedFile });
      setOutfitUpload(nextUpload);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to analyze this outfit photo.",
      );
    } finally {
      setIsDetecting(false);
    }
  }

  function resetFlow() {
    setOutfitUpload(null);
    setErrorMessage("");
    photoState.reset();
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse grid lg:grid-cols-[1.1fr_1fr] gap-10">
          <div className="aspect-[4/5] bg-muted" />
          <div className="space-y-4">
            <div className="h-12 bg-muted w-2/3" />
            <div className="h-4 bg-muted w-1/3" />
            <div className="h-48 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-lg mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            A user is required before you can import an outfit.
          </p>
          <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            {errorMessage || "Pick a valid user and try again."}
          </p>
        </div>
      </div>
    );
  }

  const detectionCount = outfitUpload?.detections.length ?? 0;
  const statusLabel = outfitUpload ? outfitUpload.status.replace(/_/g, " ") : "Awaiting photo";
  const secondaryDetail = outfitUpload?.vision_model
    ? `Detected with ${outfitUpload.vision_model}`
    : `Importing for ${formatPossessive(titleize(user.username))}`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
        <ItemHeroPreview
          imageUrl={photoState.imageUrl ?? outfitUpload?.source_photo_url ?? null}
          label="Outfit Import"
          primaryDetail={statusLabel}
          secondaryDetail={secondaryDetail}
          title={detectionCount > 0 ? `${detectionCount} detected item${detectionCount === 1 ? "" : "s"}` : "Upload an outfit photo"}
        />

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3">
              Outfit Detection
            </p>
            <h2 className="mb-1">Import From Photo</h2>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Upload one full-outfit image and we will detect visible pieces using OpenRouter with
              `openai/gpt-4.1-mini`.
            </p>
          </div>

          {errorMessage && (
            <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm">
              {errorMessage}
            </div>
          )}

          {outfitUpload?.status === "failed" && outfitUpload.error_message && (
            <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm">
              {outfitUpload.error_message}
            </div>
          )}

          <ItemPhotoField
            description="For the first version, we store the photo and return structured detections only."
            inputRef={photoState.inputRef}
            onClearSelection={photoState.clearSelectedFile}
            onFileChange={photoState.updateSelectedFile}
            selectedFileName={photoState.selectedFile?.name}
          />

          <div className="border border-border bg-card p-5">
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
              What We Save
            </p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Category, confidence, suggested item name, color guess, material guess, style guess,
              and notes for each visible piece.
            </p>
          </div>

          <div className="border-t border-border pt-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={resetFlow}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isDetecting}
              className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <ScanSearch className="w-4 h-4" />
              {isDetecting ? "Detecting..." : "Detect Items"}
            </button>
          </div>
        </motion.form>
      </div>

      {outfitUpload && (
        <div className="mt-12 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3">
                Detection Results
              </p>
              <h2 className="mb-1">Visible Pieces</h2>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Review the structured data returned by the model before we turn this into closet
                items in the next phase.
              </p>
            </div>
            <div className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Status: {statusLabel}
            </div>
          </div>

          {outfitUpload.detections.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                No items detected
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Try a clearer outfit photo or check your API credentials if detection failed.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {outfitUpload.detections.map((detection, index) => (
                <DetectionCard key={detection.id} detection={detection} index={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetectionCard({ detection, index }: { detection: OutfitDetection; index: number }) {
  const confidenceLabel =
    detection.confidence == null ? "Confidence unavailable" : `${Math.round(detection.confidence * 100)}% confidence`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-2">
            {detection.category}
          </p>
          <h3>{detection.suggested_name || titleize(detection.category)}</h3>
        </div>
        <div className="h-10 w-10 border border-border rounded-full flex items-center justify-center bg-muted">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
        {confidenceLabel}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
        <DetectionDetail label="Color" value={detection.details.dominant_color} />
        <DetectionDetail label="Material" value={detection.details.material_guess} />
        <DetectionDetail label="Style" value={detection.details.style_guess} />
        <DetectionDetail label="Notes" value={detection.details.notes} />
      </div>
    </motion.div>
  );
}

function DetectionDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border border-border/80 bg-background/40 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
      <p>{value?.trim() ? value : "Not provided"}</p>
    </div>
  );
}
