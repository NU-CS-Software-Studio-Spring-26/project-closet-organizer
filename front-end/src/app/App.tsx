import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";
import { AddItemMenu } from "./components/AddItemMenu";
import { ClothingCard } from "./components/ClothingCard";
import { CreateItemPage } from "./components/CreateItemPage";
import { ItemDetailPage } from "./components/ItemDetailPage";
import { MyOutfitsPage } from "./components/MyOutfitsPage";
import { UserDetailPage } from "./components/UserDetailPage";
import { UsersDirectoryPage } from "./components/UsersDirectoryPage";
import {
  beginGoogleSignIn,
  ClothingItem,
  CreateItemMode,
  fetchClosetOwner,
  formatPossessive,
  formatPreferredStyle,
  loadOutfitDraftItemIds,
  logoutSession,
  saveOutfitDraftItemIds,
  titleize,
  User,
} from "./lib/closet";

interface RouteState {
  kind: "home";
}

interface ClosetRouteState {
  kind: "closet";
}

interface ItemRouteState {
  kind: "item";
  itemId: number;
}

interface UsersRouteState {
  kind: "users";
}

interface UserRouteState {
  kind: "user";
  userId: number;
}

interface NewItemRouteState {
  kind: "new-item";
  userId: number | null;
  mode: CreateItemMode;
}

interface OutfitsRouteState {
  kind: "outfits";
}

type AppRoute =
  | RouteState
  | ClosetRouteState
  | ItemRouteState
  | UsersRouteState
  | UserRouteState
  | NewItemRouteState
  | OutfitsRouteState;

function isClosetRoute(route: AppRoute) {
  return route.kind === "closet" || route.kind === "item" || route.kind === "new-item";
}

function isOutfitRoute(route: AppRoute) {
  return route.kind === "outfits";
}

function isProtectedRoute(route: AppRoute) {
  return route.kind !== "home";
}

function parseCreateItemMode(value: string | null): CreateItemMode {
  return value === "image" ? "image" : "manual";
}

function getRouteFromLocation(
  pathname = window.location.pathname,
  search = window.location.search,
): AppRoute {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const itemMatch = normalizedPath.match(/^\/items\/(\d+)$/);
  const userMatch = normalizedPath.match(/^\/users\/(\d+)$/);
  const query = new URLSearchParams(search);

  if (normalizedPath === "/items/new") {
    const userId = query.get("userId");
    return {
      kind: "new-item",
      userId: userId ? Number(userId) : null,
      mode: parseCreateItemMode(query.get("mode")),
    };
  }

  if (normalizedPath === "/closet") {
    return { kind: "closet" };
  }

  if (normalizedPath === "/users") {
    return { kind: "users" };
  }

  if (normalizedPath === "/outfits") {
    return { kind: "outfits" };
  }

  if (userMatch) {
    return { kind: "user", userId: Number(userMatch[1]) };
  }

  if (itemMatch) {
    return { kind: "item", itemId: Number(itemMatch[1]) };
  }

  if (normalizedPath === "/") {
    return { kind: "home" };
  }

  return { kind: "closet" };
}

function navigateTo(pathname: string) {
  const nextUrl = new URL(pathname, window.location.origin);
  if (window.location.pathname === nextUrl.pathname && window.location.search === nextUrl.search) {
    return;
  }

  window.history.pushState({}, "", `${nextUrl.pathname}${nextUrl.search}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function updateUserItem(user: User | null, nextItem: ClothingItem) {
  if (!user || user.id !== nextItem.user_id) {
    return user;
  }

  return {
    ...user,
    clothing_items: user.clothing_items
      .map((item) => (item.id === nextItem.id ? nextItem : item))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

function removeUserItem(user: User | null, itemId: number) {
  if (!user) {
    return user;
  }

  return {
    ...user,
    clothing_items: user.clothing_items.filter((item) => item.id !== itemId),
  };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromLocation());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [homeMessage, setHomeMessage] = useState("");
  const [outfitDraftItemIds, setOutfitDraftItemIds] = useState<number[]>([]);
  const [outfitDraftNotice, setOutfitDraftNotice] = useState("");

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!isProtectedRoute(route)) {
      return;
    }

    const controller = new AbortController();
    const unauthorizedMessage = "You do not have permission to view this page. Please log in.";

    async function loadProtectedRoute() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextUser = await fetchClosetOwner(controller.signal);
        if (!nextUser) {
          setUser(null);
          setHomeMessage(unauthorizedMessage);
          navigateTo("/");
          return;
        }

        setHomeMessage("");
        setUser(nextUser);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load closet data from the backend.",
          );
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProtectedRoute();

    return () => controller.abort();
  }, [route.kind]);

  useEffect(() => {
    if (!user) {
      setOutfitDraftItemIds([]);
      return;
    }

    const availableItemIds = new Set(user.clothing_items.map((item) => item.id));
    const persisted = loadOutfitDraftItemIds(user.id).filter((itemId) => availableItemIds.has(itemId));
    setOutfitDraftItemIds(persisted);
  }, [user?.id, user?.clothing_items]);

  useEffect(() => {
    if (!user) {
      return;
    }

    saveOutfitDraftItemIds(user.id, outfitDraftItemIds);
  }, [outfitDraftItemIds, user]);

  useEffect(() => {
    if (!outfitDraftNotice) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setOutfitDraftNotice("");
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [outfitDraftNotice]);

  const clothingItems = user?.clothing_items ?? [];
  const isLoggedOutProtectedRoute = isProtectedRoute(route) && !user;

  const closetTitle = user ? formatPossessive(titleize(user.username)) : "Your Closet";
  const preferredStyle = formatPreferredStyle(user?.preferred_style);
  const selectedItem =
    route.kind === "item"
      ? clothingItems.find((item) => item.id === route.itemId) ?? null
      : null;

  function addItemToOutfitDraft(itemId: number) {
    setOutfitDraftItemIds((current) => {
      if (current.includes(itemId)) {
        setOutfitDraftNotice("Already in your outfit draft.");
        return current;
      }

      setOutfitDraftNotice("Added to outfit draft.");
      return [itemId, ...current];
    });
  }

  const isAdminRoute = route.kind === "users" || route.kind === "user";
  const isUnauthorizedAdminRoute = Boolean(user && !user.admin && isAdminRoute);

  const globalAction = user ? (
    <button
      onClick={async () => {
        try {
          await logoutSession();
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to sign out right now.");
          return;
        }

        setUser(null);
        navigateTo("/");
      }}
      className="inline-flex items-center justify-center gap-3 border border-border px-4 py-2.5 text-sm transition-colors hover:border-foreground"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      <Users className="h-4 w-4" />
      Sign Out
    </button>
  ) : (
    <button
      onClick={() => beginGoogleSignIn()}
      className="inline-flex items-center justify-center gap-3 border border-border px-4 py-2.5 text-sm transition-colors hover:border-foreground"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      Sign In
      <ArrowRight className="h-4 w-4" />
    </button>
  );

  let pageContent;

  if (isLoggedOutProtectedRoute && isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (route.kind === "home" || (isLoggedOutProtectedRoute && !isLoading)) {
    pageContent = (
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl text-center"
        >
          <h1
            className="mb-6"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              lineHeight: "0.95",
            }}
          >
            Closet Organizer
          </h1>
          <p
            className="mb-10 text-lg text-muted-foreground"
            style={{ fontFamily: "Outfit, sans-serif", lineHeight: "1.7" }}
          >
            Organize clothing items, manage closet details.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => beginGoogleSignIn()}
              className="inline-flex items-center justify-center gap-3 border border-border px-6 py-3 transition-colors hover:border-foreground"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Sign in with Google
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {homeMessage ? (
            <div className="mt-6 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p style={{ fontFamily: "Outfit, sans-serif" }}>{homeMessage}</p>
            </div>
          ) : null}
        </motion.div>
      </section>
    );
  } else if (isUnauthorizedAdminRoute) {
    pageContent = (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <button
            onClick={() => navigateTo("/closet")}
            className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="border border-destructive/20 bg-destructive/5 p-8">
            <p
              className="uppercase tracking-[0.3em] text-xs text-destructive/80 mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Access Restricted
            </p>
            <h1 className="mb-3">You are not authorized to view this page.</h1>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              You&apos;re not authorized to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  } else if (route.kind === "users") {
    pageContent = (
      <UsersDirectoryPage
        onBack={() => navigateTo(user ? "/closet" : "/")}
        onSelectUser={(userId) => navigateTo(`/users/${userId}`)}
      />
    );
  } else if (route.kind === "user") {
    const selectedUser = user?.id === route.userId ? user : null;

    pageContent = (
      <UserDetailPage
        userId={route.userId}
        initialUser={selectedUser}
        onBack={() => navigateTo(user ? "/closet" : "/")}
        onOpenItem={(itemId) => navigateTo(`/items/${itemId}`)}
      />
    );
  } else if (route.kind === "new-item") {
    const targetUser =
      route.userId && user?.id === route.userId ? user : route.userId ? null : user;
    const targetUserId = route.userId ?? user?.id ?? null;

    pageContent = (
      <CreateItemPage
        key={`${targetUserId ?? "none"}-${route.mode}`}
        userId={targetUserId}
        initialMode={route.mode}
        initialUser={targetUser}
        onBack={() => {
          if (route.mode === "image") {
            navigateTo("/closet");
            return;
          }

          if (route.userId) {
            navigateTo(`/users/${route.userId}`);
            return;
          }

          navigateTo("/closet");
        }}
        onItemsCreated={(nextItems) => {
          setUser((current) => {
            if (!current || current.id !== targetUserId || nextItems.length === 0) {
              return current;
            }

            return {
              ...current,
              clothing_items: [...current.clothing_items, ...nextItems].sort((left, right) =>
                left.name.localeCompare(right.name),
              ),
            };
          });

          if (route.mode === "image") {
            navigateTo("/closet");
            return;
          }

          navigateTo(`/items/${nextItems[0].id}`);
        }}
      />
    );
  } else if (route.kind === "item") {
    pageContent = (
      <ItemDetailPage
        itemId={route.itemId}
        initialItem={selectedItem}
        onBack={() => navigateTo("/closet")}
        onItemSaved={(nextItem) => setUser((current) => updateUserItem(current, nextItem))}
        onItemDeleted={(itemId) => {
          setUser((current) => removeUserItem(current, itemId));
          setOutfitDraftItemIds((current) => current.filter((id) => id !== itemId));
          navigateTo("/closet");
        }}
      />
    );
  } else if (route.kind === "outfits") {
    pageContent = user ? (
      <MyOutfitsPage
        user={user}
        draftItemIds={outfitDraftItemIds}
        onDraftChange={setOutfitDraftItemIds}
        onBrowseCloset={() => navigateTo("/closet")}
        onOpenItem={(itemId) => navigateTo(`/items/${itemId}`)}
      />
    ) : null;
  } else {
    pageContent = (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-2 tracking-tight"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                lineHeight: "1",
              }}
            >
              {closetTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="tracking-wide text-muted-foreground"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {isLoading
                ? "Loading items from your backend..."
                : `${clothingItems.length} ${clothingItems.length === 1 ? "item" : "items"}${
                    preferredStyle ? ` · ${preferredStyle} style` : ""
                  }`}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AddItemMenu
              disabled={!user}
              onSelectImage={() => {
                if (!user) {
                  return;
                }

                navigateTo(`/items/new?userId=${user.id}&mode=image`);
              }}
              onSelectManual={() => {
                if (!user) {
                  return;
                }

                navigateTo(`/items/new?userId=${user.id}&mode=manual`);
              }}
            />
          </motion.div>
        </div>

        {errorMessage ? (
          <div className="border border-destructive/20 bg-destructive/5 p-6">
            <p className="mb-2 text-lg" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              The closet data could not be loaded.
            </p>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {errorMessage}. Make sure both dev servers are running through `./start.sh`.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3 animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="h-6 w-2/3 bg-muted" />
                <div className="h-4 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 flex items-center justify-between"
            >
              <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                Showing {clothingItems.length} {clothingItems.length === 1 ? "item" : "items"}
              </p>
            </motion.div>

            {user && clothingItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {clothingItems.map((item, index) => (
                  <ClothingCard
                    key={item.id}
                    {...item}
                    index={index}
                    onSelect={(itemId) => navigateTo(`/items/${itemId}`)}
                    onAddToOutfit={addItemToOutfitDraft}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border p-10 text-center">
                <p className="mb-3 text-2xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {user ? "No matching items yet" : "No closet data found"}
                </p>
                <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {user
                    ? "Add a new item to start building out this closet."
                    : "Sign in with Google to load your closet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (route.kind === "home" && !user) {
    return <div className="flex min-h-screen flex-col bg-background">{pageContent}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <button
            onClick={() => navigateTo("/")}
            className="inline-flex items-center justify-center border border-border px-4 py-2.5 text-sm transition-colors hover:border-foreground"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Home
          </button>

          <div className="flex items-center gap-3">
            {user ? (
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo("/closet")}
                  className={`inline-flex items-center justify-center border px-4 py-2.5 text-sm transition-colors ${
                    isClosetRoute(route)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Closet
                </button>
                <button
                  onClick={() => navigateTo("/outfits")}
                  className={`inline-flex items-center justify-center border px-4 py-2.5 text-sm transition-colors ${
                    isOutfitRoute(route)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  My Outfits
                </button>
              </nav>
            ) : null}
            {globalAction}
          </div>
        </div>
      </header>

      <main className={`flex-1 ${route.kind === "home" ? "flex" : ""}`}>{pageContent}</main>

      {outfitDraftNotice ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm border border-foreground/20 bg-background/95 px-4 py-3 text-sm shadow-lg backdrop-blur"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {outfitDraftNotice} Draft has {outfitDraftItemIds.length} {outfitDraftItemIds.length === 1 ? "item" : "items"}.
        </motion.div>
      ) : null}

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p style={{ fontFamily: "Outfit, sans-serif" }}>
            Curating closets and serving looks, one hanger at a time.
          </p>
          <p style={{ fontFamily: "Outfit, sans-serif" }}>Pressed, polished, and ready for the runway.</p>
        </div>
      </footer>
    </div>
  );
}
