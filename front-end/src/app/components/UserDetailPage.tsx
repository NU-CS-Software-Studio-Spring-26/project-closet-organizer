import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, Shirt } from "lucide-react";
import {
  fetchUser,
  formatDisplaySize,
  formatPossessive,
  formatPreferredStyle,
  titleize,
  User,
} from "../lib/closet";

interface UserDetailPageProps {
  userId: number;
  initialUser?: User | null;
  onBack: () => void;
  onOpenItem: (itemId: number) => void;
}

export function UserDetailPage({
  userId,
  initialUser,
  onBack,
  onOpenItem,
}: UserDetailPageProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="h-80 bg-muted" />
            <div className="space-y-4">
              <div className="h-10 bg-muted w-1/2" />
              <div className="h-4 bg-muted w-1/3" />
              <div className="h-56 bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all users
          </button>
          <div className="border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-lg mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              This user could not be loaded.
            </p>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {errorMessage || "The requested user may have been removed."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const preferredStyle = formatPreferredStyle(user.preferred_style);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all users
        </button>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="border border-border bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200 p-8"
          >
            <p
              className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              User Profile
            </p>
            <h1 className="mb-2">{titleize(user.username)}</h1>
            <p className="text-muted-foreground mb-8" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatPossessive(titleize(user.username))}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-white/70 bg-white/60 p-5">
                <p className="text-muted-foreground mb-2">Preferred style</p>
                <p className="text-2xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {preferredStyle ?? "Not set"}
                </p>
              </div>
              <div className="border border-white/70 bg-white/60 p-5">
                <p className="text-muted-foreground mb-2">Closet size</p>
                <p className="text-2xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {user.clothing_items.length} items
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="space-y-6"
          >
            <div>
              <div>
                <p
                  className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-3"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Clothing Items
                </p>
                <h2 className="mb-1">Closet Contents</h2>
                <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Click any item to jump straight into its editable detail page.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {user.clothing_items.length === 0 ? (
                <div className="border border-dashed border-border p-8 text-center">
                  <p className="text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                    No items yet
                  </p>
                  <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                    This user does not have any clothing items in the API right now.
                  </p>
                </div>
              ) : (
                user.clothing_items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                    onClick={() => onOpenItem(item.id)}
                    className="w-full text-left border border-border bg-card p-5 hover:border-foreground transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 shrink-0 border border-border rounded-full flex items-center justify-center bg-muted">
                          <Shirt className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="mb-1">{item.name}</h3>
                          <p
                            className="text-muted-foreground"
                            style={{ fontFamily: "Outfit, sans-serif" }}
                          >
                            {formatDisplaySize(item.size)}
                            {item.tags.color ? ` · ${titleize(item.tags.color)}` : ""}
                            {item.tags.brand ? ` · ${item.tags.brand}` : ""}
                          </p>
                          <p
                            className="text-sm text-muted-foreground mt-2"
                            style={{ fontFamily: "Outfit, sans-serif" }}
                          >
                            {item.tags.season ? titleize(item.tags.season) : "No season tagged"}
                            {item.tags.style ? ` · ${titleize(item.tags.style)}` : ""}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
