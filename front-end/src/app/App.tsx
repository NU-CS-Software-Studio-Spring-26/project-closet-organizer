import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Plus, Users } from "lucide-react";
import { ClothingCard } from "./components/ClothingCard";
import { CreateItemPage } from "./components/CreateItemPage";
import { ItemDetailPage } from "./components/ItemDetailPage";
import { UserDetailPage } from "./components/UserDetailPage";
import { UsersDirectoryPage } from "./components/UsersDirectoryPage";
import {
  beginGoogleSignIn,
  ClothingItem,
  fetchClosetOwner,
  formatPossessive,
  formatPreferredStyle,
  logoutSession,
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
}

type AppRoute =
  | RouteState
  | ClosetRouteState
  | ItemRouteState
  | UsersRouteState
  | UserRouteState
  | NewItemRouteState;

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
    return { kind: "new-item", userId: userId ? Number(userId) : null };
  }

  if (normalizedPath === "/closet") {
    return { kind: "closet" };
  }

  if (normalizedPath === "/users") {
    return { kind: "users" };
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
  if (window.location.pathname === pathname) {
    return;
  }

  window.history.pushState({}, "", pathname);
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

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (route.kind !== "closet") {
      return;
    }

    const controller = new AbortController();

    async function loadCloset() {
      setIsLoading(true);
      setErrorMessage("");
      setHomeMessage("");

      try {
        const nextUser = await fetchClosetOwner(controller.signal);
        if (!nextUser) {
          setHomeMessage("Please sign in with Google to open your closet.");
          navigateTo("/");
          return;
        }
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

    loadCloset();

    return () => controller.abort();
  }, [route.kind]);

  const clothingItems = user?.clothing_items ?? [];

  const closetTitle = user ? formatPossessive(titleize(user.username)) : "Your Closet";
  const preferredStyle = formatPreferredStyle(user?.preferred_style);
  const selectedItem =
    route.kind === "item"
      ? clothingItems.find((item) => item.id === route.itemId) ?? null
      : null;

  if (route.kind === "home") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
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
            className="text-lg text-muted-foreground mb-10"
            style={{ fontFamily: "Outfit, sans-serif", lineHeight: "1.7" }}
          >
            Organize clothing items, manage closet details.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => beginGoogleSignIn()}
              className="inline-flex items-center justify-center gap-3 px-6 py-3 border border-border hover:border-foreground transition-colors"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Sign in with Google
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo("/users")}
              className="inline-flex items-center justify-center gap-3 px-6 py-3 border border-border hover:border-foreground transition-colors"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              View Our Users
              <Users className="w-4 h-4" />
            </button>
          </div>
          {homeMessage ? (
            <p className="text-sm text-muted-foreground mt-6" style={{ fontFamily: "Outfit, sans-serif" }}>
              {homeMessage}
            </p>
          ) : null}
        </motion.div>
      </div>
    );
  }

  if (route.kind === "users") {
    return (
      <UsersDirectoryPage
        onBack={() => navigateTo("/")}
        onSelectUser={(userId) => navigateTo(`/users/${userId}`)}
      />
    );
  }

  if (route.kind === "user") {
    const selectedUser = user?.id === route.userId ? user : null;

    return (
      <UserDetailPage
        userId={route.userId}
        initialUser={selectedUser}
        onBack={() => navigateTo("/users")}
        onOpenItem={(itemId) => navigateTo(`/items/${itemId}`)}
        onAddItem={(userId) => navigateTo(`/items/new?userId=${userId}`)}
      />
    );
  }

  if (route.kind === "new-item") {
    const targetUser =
      route.userId && user?.id === route.userId ? user : route.userId ? null : user;
    const targetUserId = route.userId ?? user?.id ?? null;

    return (
      <div className="min-h-screen bg-background">
        <CreateItemPage
          userId={targetUserId}
          initialUser={targetUser}
          onBack={() => {
            if (route.userId) {
              navigateTo(`/users/${route.userId}`);
              return;
            }

            navigateTo("/closet");
          }}
          onItemCreated={(nextItem) => {
            setUser((current) => {
              if (!current || current.id !== nextItem.user_id) {
                return current;
              }

              return {
                ...current,
                clothing_items: [...current.clothing_items, nextItem].sort((left, right) =>
                  left.name.localeCompare(right.name),
                ),
              };
            });
            navigateTo(`/items/${nextItem.id}`);
          }}
        />
      </div>
    );
  }

  if (route.kind === "item") {
    return (
      <div className="min-h-screen bg-background">
        <ItemDetailPage
          itemId={route.itemId}
          initialItem={selectedItem}
          onBack={() => navigateTo("/closet")}
          onItemSaved={(nextItem) => setUser((current) => updateUserItem(current, nextItem))}
          onItemDeleted={(itemId) => {
            setUser((current) => removeUserItem(current, itemId));
            navigateTo("/closet");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between mb-8 gap-6">
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
                className="text-muted-foreground tracking-wide"
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
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <button
                onClick={() => {
                  if (!user) {
                    return;
                  }

                  navigateTo(`/items/new?userId=${user.id}`);
                }}
                disabled={!user}
                className="flex items-center justify-center gap-3 px-5 py-3 border border-border hover:border-foreground transition-colors disabled:opacity-50"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              <button
                onClick={async () => {
                  try {
                    await logoutSession();
                  } catch (error) {
                    setErrorMessage(
                      error instanceof Error ? error.message : "Unable to sign out right now.",
                    );
                    return;
                  }
                  setUser(null);
                  navigateTo("/");
                }}
                className="flex items-center justify-center gap-3 px-5 py-3 border border-border hover:border-foreground transition-colors"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <Users className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {errorMessage ? (
          <div className="border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-lg mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              The closet data could not be loaded.
            </p>
            <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {errorMessage}. Make sure both dev servers are running through `./start.sh`.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-muted" />
                <div className="h-6 bg-muted w-2/3" />
                <div className="h-4 bg-muted w-1/2" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {clothingItems.map((item, index) => (
                  <ClothingCard
                    key={item.id}
                    {...item}
                    index={index}
                    onSelect={(itemId) => navigateTo(`/items/${itemId}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border p-10 text-center">
                <p className="text-2xl mb-3" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {user ? "No matching items yet" : "No closet data found"}
                </p>
                <p className="text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {user
                    ? "Try another search or filter, or add clothing items in the backend."
                    : "Create or seed a user in the Rails app and refresh this page."}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
