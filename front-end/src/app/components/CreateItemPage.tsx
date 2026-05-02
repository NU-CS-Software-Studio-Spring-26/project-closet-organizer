import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus, ScanSearch, Sparkles } from "lucide-react";
import {
  ClothingItem,
  createClothingItem,
  createOutfitUpload,
  CreateItemMode,
  emptyClothingItemFormValues,
  fetchUser,
  formatDisplaySize,
  formatPossessive,
  OutfitDetection,
  OutfitUpload,
  titleize,
  toClothingItemFormValuesFromDetection,
  User,
} from "../lib/closet";
import { ItemHeroPreview } from "./ItemHeroPreview";
import { ItemMetadataFields } from "./ItemMetadataFields";
import { ItemPhotoField } from "./ItemPhotoField";
import { useItemPhotoState } from "../lib/useItemPhotoState";

interface CreateItemPageProps {
  userId: number | null;
  initialMode?: CreateItemMode;
  initialUser?: User | null;
  onBack: () => void;
  onItemCreated: (item: ClothingItem) => void;
}

export function CreateItemPage({
  userId,
  initialMode = "manual",
  initialUser,
  onBack,
  onItemCreated,
}: CreateItemPageProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [formValues, setFormValues] = useState(emptyClothingItemFormValues);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isCreating, setIsCreating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasAttemptedDetection, setHasAttemptedDetection] = useState(initialMode !== "image");
  const [outfitUpload, setOutfitUpload] = useState<OutfitUpload | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<number | null>(null);
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

  const isImageMode = initialMode === "image";
  const selectedDetection =
    outfitUpload?.detections.find((detection) => detection.id === selectedDetectionId) ?? null;
  const showMetadataStep = !isImageMode || hasAttemptedDetection;
  const detectionCount = outfitUpload?.detections.length ?? 0;
  const statusLabel = outfitUpload ? outfitUpload.status.replace(/_/g, " ") : "Awaiting image";
  const previewName =
    formValues.name.trim() ||
    (isImageMode && !showMetadataStep ? "Upload and detect an item" : "Untitled Item");
  const secondaryDetail = user
    ? `Adding to ${formatPossessive(titleize(user.username))}`
    : null;

  function applyDetectionToForm(detection: OutfitDetection) {
    setSelectedDetectionId(detection.id);
    setFormValues(toClothingItemFormValuesFromDetection(detection));
  }

  async function handleDetectFromImage() {
    if (!userId) {
      setErrorMessage("A user is required before you can upload from an image.");
      return;
    }

    if (!photoState.selectedFile) {
      setErrorMessage("Choose a photo before running detection.");
      return;
    }

    setIsDetecting(true);
    setHasAttemptedDetection(true);
    setErrorMessage("");
    setOutfitUpload(null);
    setSelectedDetectionId(null);
    setFormValues(emptyClothingItemFormValues());

    try {
      const nextUpload = await createOutfitUpload(userId, { photo: photoState.selectedFile });
      setOutfitUpload(nextUpload);

      const firstDetection = nextUpload.detections[0];
      if (firstDetection) {
        applyDetectionToForm(firstDetection);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to analyze this item photo.",
      );
    } finally {
      setIsDetecting(false);
    }
  }

  function resetImageFlow() {
    setFormValues(emptyClothingItemFormValues());
    setOutfitUpload(null);
    setSelectedDetectionId(null);
    setHasAttemptedDetection(false);
    setErrorMessage("");
    photoState.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setErrorMessage("A user is required before you can create an item.");
      setIsCreating(false);
      return;
    }

    if (isImageMode && !hasAttemptedDetection) {
      setErrorMessage("Upload a photo and run detection before creating the item.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const createdItem = await createClothingItem(userId, formValues, {
        photo: photoState.selectedFile,
      });
      onItemCreated(createdItem);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create this clothing item.");
      setIsCreating(false);
    }
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
            A user is required before you can add an item.
          </p>
          <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            {errorMessage || "Pick a valid user and try again."}
          </p>
        </div>
      </div>
    );
  }

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
          label={isImageMode ? "Add From Image" : "New Clothing Item"}
          primaryDetail={
            isImageMode
              ? detectionCount > 0
                ? `${detectionCount} detected item${detectionCount === 1 ? "" : "s"}`
                : statusLabel
              : formatDisplaySize(formValues.size)
          }
          secondaryDetail={
            isImageMode && outfitUpload?.vision_model
              ? `Detected with ${outfitUpload.vision_model}`
              : secondaryDetail
          }
          title={previewName}
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
              {isImageMode ? "Image Upload" : "Add Item"}
            </p>
            <h2 className="mb-1">
              {isImageMode ? "Create New Item From Image" : "Create New Item"}
            </h2>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {isImageMode
                ? `Upload one image, let detection prefill the details, then save the item to ${titleize(user.username)}'s closet.`
                : `Fill in the details for ${titleize(user.username)} and create a new clothing item in Rails.`}
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

          {isImageMode ? (
            <>
              <ItemPhotoField
                description="Upload a closet item photo or outfit shot. The same uploaded image will be attached to the created item by default."
                inputRef={photoState.inputRef}
                onClearSelection={photoState.clearSelectedFile}
                onFileChange={photoState.updateSelectedFile}
                selectedFileName={photoState.selectedFile?.name}
              />

              <div className="border border-border bg-card p-5">
                <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
                  How It Works
                </p>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                  We parse the uploaded image, prefill the item details from the strongest match,
                  and keep the uploaded image attached when you save.
                </p>
              </div>

              <div className="border-t border-border pt-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={resetImageFlow}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Start Over
                </button>

                <button
                  type="button"
                  onClick={handleDetectFromImage}
                  disabled={isDetecting}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-border hover:border-foreground transition-colors disabled:opacity-50"
                >
                  <ScanSearch className="w-4 h-4" />
                  {isDetecting ? "Detecting..." : detectionCount > 0 ? "Detect Again" : "Detect Item Details"}
                </button>
              </div>

              {showMetadataStep && (
                <>
                  <div className="border-t border-border pt-6 space-y-3">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
                        Parsed Results
                      </p>
                      <h3 className="mb-1">Choose the item to prefill</h3>
                      <p
                        className="text-sm text-muted-foreground"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      >
                        {detectionCount > 0
                          ? "Select a detected piece to load its details into the create-item form."
                          : "No detected item is selected yet. You can still enter the details manually and keep the uploaded image attached."}
                      </p>
                    </div>

                    {outfitUpload && detectionCount > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {outfitUpload.detections.map((detection, index) => (
                          <DetectionOptionCard
                            key={detection.id}
                            detection={detection}
                            index={index}
                            isSelected={detection.id === selectedDetection?.id}
                            onSelect={() => applyDetectionToForm(detection)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-border p-6 text-center">
                        <p
                          className="text-2xl mb-2"
                          style={{ fontFamily: "Cormorant Garamond, serif" }}
                        >
                          No parsed items yet
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{ fontFamily: "Outfit, sans-serif" }}
                        >
                          Try a clearer image or continue by filling in the details yourself.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-5">
                    <ItemMetadataFields values={formValues} onChange={setFormValues} />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <ItemPhotoField
                description="Upload a photo to display behind the item title in the closet and detail views."
                inputRef={photoState.inputRef}
                onClearSelection={photoState.clearSelectedFile}
                onFileChange={photoState.updateSelectedFile}
                selectedFileName={photoState.selectedFile?.name}
              />
              <ItemMetadataFields values={formValues} onChange={setFormValues} />
            </div>
          )}

          {showMetadataStep && (
            <div className="border-t border-border pt-5 flex items-center justify-end">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isCreating ? "Creating..." : "Create Item"}
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </div>
  );
}

function DetectionOptionCard({
  detection,
  index,
  isSelected,
  onSelect,
}: {
  detection: OutfitDetection;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const confidenceLabel =
    detection.confidence == null
      ? "Confidence unavailable"
      : `${Math.round(detection.confidence * 100)}% confidence`;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={onSelect}
      className={`border bg-card p-5 text-left space-y-4 transition-colors ${
        isSelected ? "border-foreground" : "border-border hover:border-foreground"
      }`}
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
    </motion.button>
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
