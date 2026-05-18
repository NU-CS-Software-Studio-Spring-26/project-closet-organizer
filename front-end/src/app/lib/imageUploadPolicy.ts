export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_HUMAN_SIZE = "10 MB";

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export const IMAGE_FILE_INPUT_ACCEPT = ALLOWED_IMAGE_CONTENT_TYPES.join(",");
export const ALLOWED_IMAGE_HUMAN_LIST = "JPEG, PNG, WebP, GIF, or HEIC";

export type ImageValidationError = {
  code: "missing" | "invalid_type" | "too_large";
  message: string;
};

export function validateImageFile(file: File | null | undefined): ImageValidationError | null {
  if (!file) {
    return { code: "missing", message: "Select an image to continue." };
  }

  const contentType = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number])) {
    return {
      code: "invalid_type",
      message: `Image must be a ${ALLOWED_IMAGE_HUMAN_LIST} file.`,
    };
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return {
      code: "too_large",
      message: `Image must be ${MAX_IMAGE_HUMAN_SIZE} or smaller.`,
    };
  }

  return null;
}
