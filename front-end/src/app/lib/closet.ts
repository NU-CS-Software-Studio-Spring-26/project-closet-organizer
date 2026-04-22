const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface ClothingItemTags {
  material?: string;
  season?: string;
  style?: string;
  brand?: string;
  color?: string;
}

export interface UserSummary {
  id: number;
  username: string;
  preferred_style?: string | null;
}

export interface ClothingItem {
  id: number;
  name: string;
  size: string;
  date: string | null;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  tags: ClothingItemTags;
  user?: UserSummary;
}

export interface User extends UserSummary {
  clothing_items: ClothingItem[];
}

export interface ClothingItemFormValues {
  name: string;
  size: string;
  date: string;
  material: string;
  season: string;
  style: string;
  brand: string;
  color: string;
}

export function emptyClothingItemFormValues(): ClothingItemFormValues {
  return {
    name: "",
    size: "medium",
    date: "",
    material: "",
    season: "",
    style: "",
    brand: "",
    color: "",
  };
}

export function titleize(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPossessive(name: string) {
  if (name.endsWith("s") || name.endsWith("S")) {
    return `${name}' Closet`;
  }

  return `${name}'s Closet`;
}

export function formatPreferredStyle(style?: string | null) {
  return style ? titleize(style) : null;
}

export function formatDisplaySize(size: string) {
  const normalized = size.trim().toLowerCase();

  if (normalized === "xl" || normalized === "xs") {
    return normalized.toUpperCase();
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function buildPlaceholderLabel(name: string) {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function toClothingItemFormValues(item: ClothingItem): ClothingItemFormValues {
  return {
    name: item.name,
    size: item.size,
    date: toDateInputValue(item.date),
    material: item.tags.material ?? "",
    season: item.tags.season ?? "",
    style: item.tags.style ?? "",
    brand: item.tags.brand ?? "",
    color: item.tags.color ?? "",
  };
}

export async function fetchClosetOwner(signal?: AbortSignal) {
  const users = await fetchUsers(signal);
  return users[0] ?? null;
}

export async function fetchUsers(signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/users`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as User[];
}

export async function fetchUser(id: number, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as User;
}

export async function fetchClothingItem(id: number, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/clothing_items/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as ClothingItem;
}

export async function saveClothingItem(id: number, userId: number, values: ClothingItemFormValues) {
  const response = await fetch(`${API_BASE_URL}/clothing_items/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      clothing_item: {
        name: values.name,
        user_id: userId,
        size: values.size,
        date: values.date || null,
        material: values.material,
        season: values.season,
        style: values.style,
        brand: values.brand,
        color: values.color,
      },
    }),
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as ClothingItem;
}

export async function createClothingItem(userId: number, values: ClothingItemFormValues) {
  const response = await fetch(`${API_BASE_URL}/clothing_items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      clothing_item: {
        name: values.name,
        user_id: userId,
        size: values.size,
        date: values.date || null,
        material: values.material,
        season: values.season,
        style: values.style,
        brand: values.brand,
        color: values.color,
      },
    }),
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as ClothingItem;
}

export async function destroyClothingItem(id: number) {
  const response = await fetch(`${API_BASE_URL}/clothing_items/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }
}

async function buildApiError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string; errors?: string[] };
    const message = payload.errors?.join(", ") || payload.error;
    return new Error(message || `Request failed with status ${response.status}`);
  } catch {
    return new Error(`Request failed with status ${response.status}`);
  }
}
