import { RefObject } from "react";

interface ItemPhotoFieldProps {
  description: string;
  hasExistingPhoto?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  isRemovingExisting?: boolean;
  onClearSelection: () => void;
  onFileChange: (file: File | null) => void;
  onKeepExisting?: () => void;
  onRemoveExisting?: () => void;
  selectedFileName?: string | null;
}

export function ItemPhotoField({
  description,
  hasExistingPhoto = false,
  inputRef,
  isRemovingExisting = false,
  onClearSelection,
  onFileChange,
  onKeepExisting,
  onRemoveExisting,
  selectedFileName,
}: ItemPhotoFieldProps) {
  const isShowingPhotoRow = (Boolean(selectedFileName) || hasExistingPhoto) && !isRemovingExisting;

  return (
    <label className="space-y-2 sm:col-span-2">
      <span>Photo</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        className="w-full border border-border bg-card px-4 py-3 file:mr-4 file:border-0 file:bg-transparent file:font-medium"
      />
      <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
        {description}
      </p>

      {isShowingPhotoRow && (
        <div className="flex items-center justify-between gap-4 border border-border bg-card px-4 py-3">
          <span className="text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
            {selectedFileName || "Current photo attached"}
          </span>
          <button
            type="button"
            onClick={selectedFileName ? onClearSelection : onRemoveExisting}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {selectedFileName ? "Clear Selection" : "Remove Photo"}
          </button>
        </div>
      )}

      {isRemovingExisting && (
        <div className="flex items-center justify-between gap-4 border border-dashed border-border px-4 py-3">
          <span className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            The current photo will be removed when you save.
          </span>
          <button
            type="button"
            onClick={onKeepExisting}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Keep Photo
          </button>
        </div>
      )}
    </label>
  );
}
