import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus } from "lucide-react";
import {
  ClothingItem,
  createClothingItem,
  emptyClothingItemFormValues,
  fetchUser,
  formatDisplaySize,
  formatPossessive,
  titleize,
  User,
} from "../lib/closet";
import { ItemHeroPreview } from "./ItemHeroPreview";
import { ItemMetadataFields } from "./ItemMetadataFields";
import { ItemPhotoField } from "./ItemPhotoField";
import { useItemPhotoState } from "../lib/useItemPhotoState";

interface CreateItemPageProps {
  userId: number | null;
  initialUser?: User | null;
  onBack: () => void;
  onItemCreated: (item: ClothingItem) => void;
}

export function CreateItemPage({
  userId,
  initialUser,
  onBack,
  onItemCreated,
}: CreateItemPageProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [formValues, setFormValues] = useState(emptyClothingItemFormValues);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isCreating, setIsCreating] = useState(false);
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

  const previewName = formValues.name.trim() || "Untitled Item";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          imageUrl={photoState.imageUrl}
          label="New Clothing Item"
          primaryDetail={formatDisplaySize(formValues.size)}
          secondaryDetail={`Adding to ${formatPossessive(titleize(user.username))}`}
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
        </motion.form>
      </div>
    </div>
  );
}
