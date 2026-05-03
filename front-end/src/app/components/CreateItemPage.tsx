import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, PencilLine, Plus, Sparkles } from "lucide-react";
import {
  ClothingItem,
  ClothingItemFormValues,
  createClothingItem,
  createCleanPreviewFile,
  createOutfitUpload,
  CreateItemMode,
  emptyClothingItemFormValues,
  fetchUser,
  formatDisplaySize,
  formatPossessive,
  generateOutfitDetectionCleanImage,
  OutfitDetection,
  OutfitDetectionBoundingBox,
  OutfitUpload,
  preferredDetectionBox,
  titleize,
  toClothingItemFormValuesFromDetection,
  User,
} from "../lib/closet";
import { AiCleanImageButton } from "./AiCleanImageButton";
import { ItemMetadataFields } from "./ItemMetadataFields";
import { ItemPhotoField } from "./ItemPhotoField";
import { UploadWorkspace } from "./UploadWorkspace";
import { useItemPhotoState } from "../lib/useItemPhotoState";

interface CreateItemPageProps {
  userId: number | null;
  initialMode?: CreateItemMode;
  initialUser?: User | null;
  onBack: () => void;
  onItemsCreated: (items: ClothingItem[]) => void;
}

export function CreateItemPage({
  userId,
  initialMode = "manual",
  initialUser,
  onBack,
  onItemsCreated,
}: CreateItemPageProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [formValues, setFormValues] = useState(emptyClothingItemFormValues);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isCreating, setIsCreating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCleaningUploadedPhoto, setIsCleaningUploadedPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [outfitUpload, setOutfitUpload] = useState<OutfitUpload | null>(null);
  const [selectedDetectionIds, setSelectedDetectionIds] = useState<number[]>([]);
  const [editingDetectionIds, setEditingDetectionIds] = useState<number[]>([]);
  const [cleaningDetectionIds, setCleaningDetectionIds] = useState<number[]>([]);
  const [detectionCleanErrors, setDetectionCleanErrors] = useState<Record<number, string>>({});
  const [editedDetections, setEditedDetections] = useState<Record<number, ClothingItemFormValues>>(
    {},
  );
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
  const detectionCount = outfitUpload?.detections.length ?? 0;
  const sourceImageUrl = photoState.imageUrl ?? outfitUpload?.source_photo_url ?? null;
  const selectedDetections =
    outfitUpload?.detections.filter((detection) => selectedDetectionIds.includes(detection.id)) ?? [];
  const selectedCount = selectedDetections.length;

  async function detectItems(file: File) {
    if (!userId) {
      setErrorMessage("A user is required before you can upload from an image.");
      return;
    }

    setIsDetecting(true);
    setErrorMessage("");
    setOutfitUpload(null);
    setSelectedDetectionIds([]);
    setEditingDetectionIds([]);
    setCleaningDetectionIds([]);
    setDetectionCleanErrors({});
    setEditedDetections({});

    try {
      const nextUpload = await createOutfitUpload(userId, { photo: file });
      setOutfitUpload(nextUpload);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to analyze this item photo.",
      );
    } finally {
      setIsDetecting(false);
    }
  }

  function handleImageFileChange(file: File | null) {
    photoState.updateSelectedFile(file);
    setOutfitUpload(null);
    setSelectedDetectionIds([]);
    setEditingDetectionIds([]);
    setCleaningDetectionIds([]);
    setDetectionCleanErrors({});
    setEditedDetections({});
    setErrorMessage("");
  }

  function clearImageSelection() {
    photoState.clearSelectedFile();
    setOutfitUpload(null);
    setSelectedDetectionIds([]);
    setEditingDetectionIds([]);
    setCleaningDetectionIds([]);
    setDetectionCleanErrors({});
    setEditedDetections({});
    setErrorMessage("");
  }

  function detectionCanBeSaved(detection: OutfitDetection) {
    return Boolean(preferredDetectionBox(detection));
  }

  function toggleDetectionSelection(detection: OutfitDetection) {
    if (!detectionCanBeSaved(detection)) {
      return;
    }

    setSelectedDetectionIds((current) =>
      current.includes(detection.id)
        ? current.filter((id) => id !== detection.id)
        : [...current, detection.id],
    );
  }

  function getDetectionDraft(detection: OutfitDetection) {
    return editedDetections[detection.id] ?? toClothingItemFormValuesFromDetection(detection);
  }

  function toggleDetectionEditing(detection: OutfitDetection) {
    setEditedDetections((current) => {
      if (current[detection.id]) {
        return current;
      }

      return {
        ...current,
        [detection.id]: toClothingItemFormValuesFromDetection(detection),
      };
    });

    setEditingDetectionIds((current) =>
      current.includes(detection.id)
        ? current.filter((id) => id !== detection.id)
        : [...current, detection.id],
    );
  }

  function updateDetectionDraft(detectionId: number, nextValues: ClothingItemFormValues) {
    setEditedDetections((current) => ({
      ...current,
      [detectionId]: nextValues,
    }));
  }

  async function handleCleanUploadedPhoto() {
    if (!photoState.selectedFile) {
      setErrorMessage("Upload a photo before using the AI cleaner.");
      return;
    }

    setIsCleaningUploadedPhoto(true);
    setErrorMessage("");

    try {
      const cleanedFile = await createCleanPreviewFile(photoState.selectedFile);
      photoState.updateSelectedFile(cleanedFile);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create an AI-cleaned item image.",
      );
    } finally {
      setIsCleaningUploadedPhoto(false);
    }
  }

  async function handleCleanDetectionImage(detectionId: number) {
    setCleaningDetectionIds((current) => [...current, detectionId]);
    setDetectionCleanErrors((current) => {
      const next = { ...current };
      delete next[detectionId];
      return next;
    });

    try {
      const updatedDetection = await generateOutfitDetectionCleanImage(detectionId);
      setOutfitUpload((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          detections: current.detections.map((detection) =>
            detection.id === detectionId ? updatedDetection : detection,
          ),
        };
      });
    } catch (error) {
      setDetectionCleanErrors((current) => ({
        ...current,
        [detectionId]:
          error instanceof Error ? error.message : "Unable to create an AI-cleaned detection image.",
      }));
    } finally {
      setCleaningDetectionIds((current) => current.filter((id) => id !== detectionId));
    }
  }

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setErrorMessage("A user is required before you can create an item.");
      setIsCreating(false);
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const createdItem = await createClothingItem(userId, formValues, {
        photo: photoState.selectedFile,
      });
      onItemsCreated([createdItem]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create this clothing item.");
      setIsCreating(false);
    }
  }

  async function handleSaveSelectedItems() {
    if (!userId) {
      setErrorMessage("A user is required before you can save items to the closet.");
      return;
    }

    if (selectedDetections.length === 0) {
      setErrorMessage("Choose at least one verified detected item to add to the closet.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const createdItems: ClothingItem[] = [];

      for (const detection of selectedDetections) {
        const createdItem = await createClothingItem(userId, getDetectionDraft(detection), {
          sourceOutfitDetectionId: detection.id,
        });
        createdItems.push(createdItem);
      }

      onItemsCreated(createdItems);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save the selected items to the closet.",
      );
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

  if (isImageMode) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <UploadWorkspace
          imageUrl={sourceImageUrl}
          previewLabel="Uploaded Image"
          previewPrimaryDetail={
            isDetecting
              ? "Detecting items"
              : detectionCount > 0
                ? `${detectionCount} detected item${detectionCount === 1 ? "" : "s"}`
                : photoState.selectedFile
                  ? "Ready to detect"
                  : "Awaiting image"
          }
          previewSecondaryDetail={`Saving to ${formatPossessive(titleize(user.username))}`}
          previewTitle={photoState.selectedFile?.name ?? "Upload an image"}
        >
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3">
              Image Upload
            </p>
            <h1 className="mb-1">Review Detected Items</h1>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Upload an image first, then run detection when you are ready. Verified pieces can be
              saved directly to {formatPossessive(titleize(user.username))}.
            </p>
          </div>

          {errorMessage && (
            <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="border border-border bg-card p-5">
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
              Upload Photo
            </p>
            <ItemPhotoField
              description="Choose the source image now. Detection only runs after you click the button below."
              inputRef={photoState.inputRef}
              onClearSelection={clearImageSelection}
              onFileChange={handleImageFileChange}
              selectedFileName={photoState.selectedFile?.name}
            />
          </div>

          <div className="border border-border bg-card p-5">
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
              Detection
            </p>
            <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
              We refine and verify each detected crop before it becomes selectable below.
            </p>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={clearImageSelection}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => photoState.selectedFile && void detectItems(photoState.selectedFile)}
                disabled={isDetecting || !photoState.selectedFile}
                className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isDetecting ? "Detecting items..." : "Detect items"}
              </button>
            </div>
          </div>
        </UploadWorkspace>

        <div className="space-y-4 border-t border-border pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3">
                Detected Items
              </p>
              <h2 className="mb-1">Choose what to save</h2>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Review what the model found and choose any item you want to save to the closet.
              </p>
            </div>
            <div className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {selectedCount} selected
            </div>
          </div>

          {!photoState.selectedFile ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Upload an image to begin
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Choosing an image from the closet page will bring you here automatically.
              </p>
            </div>
          ) : isDetecting ? (
            <div className="border border-border bg-card p-8 text-center">
              <p className="text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Detecting, refining, and verifying crops
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                We are running the automated crop pipeline and preparing item-specific previews.
              </p>
            </div>
          ) : !outfitUpload ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Detect items when you are ready
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                The selected image is ready. Click the button on the right to populate detected
                items below.
              </p>
            </div>
          ) : outfitUpload?.status === "failed" && outfitUpload.error_message ? (
            <div className="border border-destructive/20 bg-destructive/5 p-6 text-sm">
              {outfitUpload.error_message}
            </div>
          ) : detectionCount === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                No items detected yet
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Try another image if the visible pieces are not being picked up clearly.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {outfitUpload.detections.map((detection, index) => (
                <DetectionReviewCard
                  key={detection.id}
                  detection={detection}
                  draftValues={getDetectionDraft(detection)}
                  index={index}
                  cleanImageError={detectionCleanErrors[detection.id]}
                  cleanedImageUrl={detection.cleaned_image_url ?? null}
                  isCleaningImage={cleaningDetectionIds.includes(detection.id)}
                  isEditing={editingDetectionIds.includes(detection.id)}
                  isSelected={selectedDetectionIds.includes(detection.id)}
                  sourceImageUrl={sourceImageUrl}
                  onCleanImage={() => void handleCleanDetectionImage(detection.id)}
                  onDraftChange={(nextValues) => updateDetectionDraft(detection.id, nextValues)}
                  onToggleEdit={() => toggleDetectionEditing(detection)}
                  onToggle={() => toggleDetectionSelection(detection)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            Selected items will use the best available crop from the uploaded image.
          </p>
          <button
            type="button"
            onClick={handleSaveSelectedItems}
            disabled={isCreating || selectedCount === 0}
            className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isCreating ? "Saving..." : "Save to closet"}
          </button>
        </div>
      </div>
    );
  }

  const previewName = formValues.name.trim() || "Untitled Item";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        onSubmit={handleManualSubmit}
        className="space-y-6"
      >
        <UploadWorkspace
          imageUrl={photoState.imageUrl}
          previewLabel="New Clothing Item"
          previewPrimaryDetail={formatDisplaySize(formValues.size)}
          previewSecondaryDetail={`Adding to ${formatPossessive(titleize(user.username))}`}
          previewTitle={previewName}
        >
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3">
              Add Item
            </p>
            <h2 className="mb-1">Create New Item</h2>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Fill in the details for {titleize(user.username)} and create a new clothing item in Rails.
            </p>
          </div>

          {errorMessage && (
            <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="border border-border bg-card p-5">
            <ItemPhotoField
              description="Upload a photo to display behind the item title in the closet and detail views."
              inputRef={photoState.inputRef}
              onClearSelection={photoState.clearSelectedFile}
              onFileChange={photoState.updateSelectedFile}
              selectedFileName={photoState.selectedFile?.name}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-border bg-background/40 px-4 py-3">
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                {photoState.selectedFile
                  ? "Use sparkle to turn the uploaded item photo into a cleaner catalog-style PNG before you save."
                  : "Upload a photo first to use the AI cleaner."}
              </p>
              <AiCleanImageButton
                disabled={!photoState.selectedFile}
                isLoading={isCleaningUploadedPhoto}
                onClick={() => void handleCleanUploadedPhoto()}
              />
            </div>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="mb-4">
              <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-2">
                Item Details
              </p>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Add the core metadata that should be saved with this item.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ItemMetadataFields values={formValues} onChange={setFormValues} />
            </div>
          </div>

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
        </UploadWorkspace>
      </motion.form>
    </div>
  );
}

function DetectionReviewCard({
  cleanImageError,
  cleanedImageUrl,
  detection,
  draftValues,
  index,
  isCleaningImage,
  isEditing,
  isSelected,
  onCleanImage,
  onDraftChange,
  sourceImageUrl,
  onToggleEdit,
  onToggle,
}: {
  cleanImageError?: string;
  cleanedImageUrl: string | null;
  detection: OutfitDetection;
  draftValues: ClothingItemFormValues;
  index: number;
  isCleaningImage: boolean;
  isEditing: boolean;
  isSelected: boolean;
  onCleanImage: () => void;
  onDraftChange: (nextValues: ClothingItemFormValues) => void;
  sourceImageUrl: string | null;
  onToggleEdit: () => void;
  onToggle: () => void;
}) {
  const confidenceLabel =
    detection.confidence == null
      ? "Confidence unavailable"
      : `${Math.round(detection.confidence * 100)}% detection confidence`;
  const suggestedName = detection.suggested_name?.trim() || titleize(detection.category);
  const previewBox = preferredDetectionBox(detection);
  const canSave = Boolean(previewBox);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`border bg-card p-5 space-y-4 transition-colors ${
        isSelected ? "border-foreground" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-2">
            {detection.category}
          </p>
          <h3>{suggestedName}</h3>
        </div>
        <div className="h-10 w-10 border border-border rounded-full flex items-center justify-center bg-muted">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
        {confidenceLabel}
      </p>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {cleanedImageUrl ? "AI-Cleaned Preview" : "Automated Crop Preview"}
        </p>
        <AiCleanImageButton
          disabled={!cleanedImageUrl && !previewBox}
          isLoading={isCleaningImage}
          onClick={onCleanImage}
        />
      </div>

      {cleanedImageUrl ? (
        <div className="overflow-hidden border border-border bg-muted">
          <img
            src={cleanedImageUrl}
            alt={`${suggestedName} AI cleaned preview`}
            className="block w-full h-auto object-contain"
          />
        </div>
      ) : sourceImageUrl && previewBox ? (
        <div className="space-y-3">
          <DetectionCropPreview sourceImageUrl={sourceImageUrl} cropBox={previewBox} />
        </div>
      ) : (
        <div className="border border-dashed border-border p-4 text-sm text-muted-foreground">
          No crop preview is available for this detection yet.
        </div>
      )}

      {cleanImageError && (
        <div className="border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm">
          {cleanImageError}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
        <DetectionDetail label="Color" value={detection.details.dominant_color} />
        <DetectionDetail label="Material" value={detection.details.material_guess} />
        <DetectionDetail label="Style" value={detection.details.style_guess} />
        <DetectionDetail label="Notes" value={detection.details.notes} />
      </div>

      {isEditing && (
        <div className="space-y-5 border-t border-border pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ItemMetadataFields values={draftValues} onChange={onDraftChange} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-foreground transition-colors"
        >
          <PencilLine className="w-4 h-4" />
          {isEditing ? "Done editing" : "Edit"}
        </button>
        <button
          type="button"
          onClick={onToggle}
          disabled={!canSave}
          className={`inline-flex items-center gap-2 px-4 py-2 border transition-colors disabled:opacity-50 ${
            isSelected
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          <Check className="w-4 h-4" />
          {isSelected ? "Will save to closet" : canSave ? "Add to closet" : "Preview unavailable"}
        </button>
      </div>
    </motion.div>
  );
}

function DetectionCropPreview({
  cropBox,
  sourceImageUrl,
}: {
  cropBox: OutfitDetectionBoundingBox;
  sourceImageUrl: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      const sourceX = image.naturalWidth * cropBox.x;
      const sourceY = image.naturalHeight * cropBox.y;
      const sourceWidth = Math.max(1, image.naturalWidth * cropBox.width);
      const sourceHeight = Math.max(1, image.naturalHeight * cropBox.height);
      const outputWidth = 320;
      const outputHeight = Math.max(1, Math.round(outputWidth * (sourceHeight / sourceWidth)));

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      context.clearRect(0, 0, outputWidth, outputHeight);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );
    };
    image.src = sourceImageUrl;
  }, [cropBox, sourceImageUrl]);

  return (
    <div className="overflow-hidden border border-border bg-muted">
      <canvas ref={canvasRef} className="block w-full h-auto" />
    </div>
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
