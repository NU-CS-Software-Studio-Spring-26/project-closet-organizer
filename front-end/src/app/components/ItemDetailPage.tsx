import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  ClothingItem,
  ClothingItemFormValues,
  destroyClothingItem,
  fetchClothingItem,
  formatDisplaySize,
  saveClothingItem,
  titleize,
  toClothingItemFormValues,
} from "../lib/closet";

interface ItemDetailPageProps {
  itemId: number;
  initialItem?: ClothingItem | null;
  onBack: () => void;
  onItemSaved: (item: ClothingItem) => void;
  onItemDeleted: (itemId: number) => void;
}

const sizeOptions = ["xs", "small", "medium", "large", "xl"];

const tagFields: Array<keyof Pick<
  ClothingItemFormValues,
  "brand" | "color" | "material" | "season" | "style"
>> = ["brand", "color", "material", "season", "style"];

export function ItemDetailPage({
  itemId,
  initialItem,
  onBack,
  onItemSaved,
  onItemDeleted,
}: ItemDetailPageProps) {
  const [item, setItem] = useState<ClothingItem | null>(initialItem ?? null);
  const [formValues, setFormValues] = useState<ClothingItemFormValues | null>(
    initialItem ? toClothingItemFormValues(initialItem) : null,
  );
  const [isLoading, setIsLoading] = useState(!initialItem);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadItem() {
      if (initialItem?.id === itemId) {
        setItem(initialItem);
        setFormValues(toClothingItemFormValues(initialItem));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextItem = await fetchClothingItem(itemId, controller.signal);
        setItem(nextItem);
        setFormValues(toClothingItemFormValues(nextItem));
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load this clothing item.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadItem();

    return () => controller.abort();
  }, [initialItem, itemId]);

  const isDirty = useMemo(() => {
    if (!item || !formValues) {
      return false;
    }

    return JSON.stringify(toClothingItemFormValues(item)) !== JSON.stringify(formValues);
  }, [item, formValues]);

  const previewName = item?.name?.trim() || "Untitled Item";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || !formValues) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedItem = await saveClothingItem(item.id, item.user_id, formValues);
      setItem(updatedItem);
      setFormValues(toClothingItemFormValues(updatedItem));
      setSuccessMessage("Item details saved.");
      onItemSaved(updatedItem);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save this clothing item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) {
      return;
    }

    const confirmed = window.confirm(`Delete ${item.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await destroyClothingItem(item.id);
      onItemDeleted(item.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete this clothing item.");
      setIsDeleting(false);
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

  if (!item || !formValues) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to closet
        </button>
        <div className="border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-lg mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            This item could not be loaded.
          </p>
          <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
            {errorMessage || "The requested item may have been deleted."}
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
        Back to closet
      </button>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="aspect-[4/5] bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200 border border-border p-8 flex flex-col justify-between"
        >
          <div>
            <p
              className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Clothing Item
            </p>
            <h1
              className="mb-0 max-w-[12ch] break-words text-stone-700/85"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(2.75rem, 5vw, 4.75rem)",
                lineHeight: "0.95",
              }}
            >
              {previewName}
            </h1>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatDisplaySize(item.size)}
            </p>
            {item.tags.style && (
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                {titleize(item.tags.style)} style
              </p>
            )}
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3">
                Item Details
              </p>
              <h2 className="mb-1">Edit Item</h2>
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Update the metadata shown in the closet and save it back to Rails.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>

          {errorMessage && (
            <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="border border-emerald-300/40 bg-emerald-50 p-4 text-sm text-emerald-900">
              {successMessage}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span>Name</span>
              <input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) =>
                    current ? { ...current, name: event.target.value } : current,
                  )
                }
                className="w-full border border-border bg-card px-4 py-3"
                required
              />
            </label>

            <label className="space-y-2">
              <span>Size</span>
              <select
                value={formValues.size}
                onChange={(event) =>
                  setFormValues((current) =>
                    current ? { ...current, size: event.target.value } : current,
                  )
                }
                className="w-full border border-border bg-card px-4 py-3"
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {formatDisplaySize(size)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span>Date</span>
              <input
                type="date"
                value={formValues.date}
                onChange={(event) =>
                  setFormValues((current) =>
                    current ? { ...current, date: event.target.value } : current,
                  )
                }
                className="w-full border border-border bg-card px-4 py-3"
              />
            </label>

            {tagFields.map((fieldName) => (
              <label key={fieldName} className="space-y-2">
                <span>{titleize(fieldName)}</span>
                <input
                  value={formValues[fieldName]}
                  onChange={(event) =>
                    setFormValues((current) =>
                      current ? { ...current, [fieldName]: event.target.value } : current,
                    )
                  }
                  className="w-full border border-border bg-card px-4 py-3"
                />
              </label>
            ))}
          </div>

          <div className="border-t border-border pt-5 flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </div>

            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
