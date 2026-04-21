import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus } from "lucide-react";
import {
  ClothingItem,
  ClothingItemFormValues,
  createClothingItem,
  emptyClothingItemFormValues,
  fetchUser,
  formatDisplaySize,
  formatPossessive,
  titleize,
  User,
} from "../lib/closet";

interface CreateItemPageProps {
  userId: number | null;
  initialUser?: User | null;
  onBack: () => void;
  onItemCreated: (item: ClothingItem) => void;
}

const sizeOptions = ["xs", "small", "medium", "large", "xl"];
const tagFields: Array<keyof Pick<
  ClothingItemFormValues,
  "brand" | "color" | "material" | "season" | "style"
>> = ["brand", "color", "material", "season", "style"];

export function CreateItemPage({
  userId,
  initialUser,
  onBack,
  onItemCreated,
}: CreateItemPageProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [formValues, setFormValues] = useState<ClothingItemFormValues>(emptyClothingItemFormValues);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    setIsCreating(true);
    setErrorMessage("");

    try {
      const createdItem = await createClothingItem(userId, formValues);
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
              New Clothing Item
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
              {formatDisplaySize(formValues.size)}
            </p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Adding to {formatPossessive(titleize(user.username))}
            </p>
          </div>
        </motion.div>

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
            <label className="space-y-2 sm:col-span-2">
              <span>Name</span>
              <input
                value={formValues.name}
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                className="w-full border border-border bg-card px-4 py-3"
                required
              />
            </label>

            <label className="space-y-2">
              <span>Size</span>
              <select
                value={formValues.size}
                onChange={(event) => setFormValues((current) => ({ ...current, size: event.target.value }))}
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
                onChange={(event) => setFormValues((current) => ({ ...current, date: event.target.value }))}
                className="w-full border border-border bg-card px-4 py-3"
              />
            </label>

            {tagFields.map((fieldName) => (
              <label key={fieldName} className="space-y-2">
                <span>{titleize(fieldName)}</span>
                <input
                  value={formValues[fieldName]}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, [fieldName]: event.target.value }))
                  }
                  className="w-full border border-border bg-card px-4 py-3"
                />
              </label>
            ))}
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
