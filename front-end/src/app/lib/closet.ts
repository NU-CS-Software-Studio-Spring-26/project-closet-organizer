const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

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
  image_url?: string | null;
  user?: UserSummary;
}

export interface User extends UserSummary {
  clothing_items: ClothingItem[];
}

export interface OutfitDetection {
  id: number;
  outfit_upload_id: number;
  category: string;
  confidence: number | null;
  suggested_name?: string | null;
  details: {
    dominant_color?: string;
    material_guess?: string;
    style_guess?: string;
    notes?: string;
  };
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface OutfitUpload {
  id: number;
  user_id: number;
  status: string;
  provider?: string | null;
  vision_model?: string | null;
  error_message?: string | null;
  detected_at?: string | null;
  source_photo_url?: string | null;
  detections: OutfitDetection[];
  created_at?: string;
  updated_at?: string;
}

export type CreateItemMode = "manual" | "image";

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

export interface ClothingItemPhotoOptions {
  photo?: File | null;
  removePhoto?: boolean;
}

export interface OutfitUploadPhotoOptions {
  photo: File;
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

export function toClothingItemFormValuesFromDetection(
  detection: OutfitDetection,
): ClothingItemFormValues {
  return {
    name: detection.suggested_name?.trim() || titleize(detection.category),
    size: "medium",
    date: "",
    material: detection.details.material_guess?.trim() ?? "",
    season: "",
    style: detection.details.style_guess?.trim() ?? "",
    brand: "",
    color: detection.details.dominant_color?.trim() ?? "",
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

export async function fetchOutfitUpload(id: number, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/outfit_uploads/${id}`, { signal });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as OutfitUpload;
}

export async function saveClothingItem(
  id: number,
  userId: number,
  values: ClothingItemFormValues,
  photoOptions: ClothingItemPhotoOptions = {},
) {
  const response = await fetch(`${API_BASE_URL}/clothing_items/${id}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
    body: buildClothingItemFormData(userId, values, photoOptions),
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as ClothingItem;
}

export async function createClothingItem(
  userId: number,
  values: ClothingItemFormValues,
  photoOptions: ClothingItemPhotoOptions = {},
) {
  const response = await fetch(`${API_BASE_URL}/clothing_items`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: buildClothingItemFormData(userId, values, photoOptions),
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as ClothingItem;
}

export async function createOutfitUpload(
  userId: number,
  photoOptions: OutfitUploadPhotoOptions,
) {
  const formData = new FormData();
  formData.append("outfit_upload[user_id]", String(userId));
  formData.append("outfit_upload[source_photo]", photoOptions.photo);

  const response = await fetch(`${API_BASE_URL}/outfit_uploads`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as OutfitUpload;
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

function buildClothingItemFormData(
  userId: number,
  values: ClothingItemFormValues,
  photoOptions: ClothingItemPhotoOptions,
) {
  const formData = new FormData();

  formData.append("clothing_item[name]", values.name);
  formData.append("clothing_item[user_id]", String(userId));
  formData.append("clothing_item[size]", values.size);
  formData.append("clothing_item[date]", values.date);
  formData.append("clothing_item[material]", values.material);
  formData.append("clothing_item[season]", values.season);
  formData.append("clothing_item[style]", values.style);
  formData.append("clothing_item[brand]", values.brand);
  formData.append("clothing_item[color]", values.color);

  if (photoOptions.photo) {
    formData.append("clothing_item[photo]", photoOptions.photo);
  }

  if (photoOptions.removePhoto) {
    formData.append("clothing_item[remove_photo]", "true");
  }

  return formData;
}
