let pendingCreateItemImage: File | null = null;

export function stagePendingCreateItemImage(file: File) {
  pendingCreateItemImage = file;
}

export function consumePendingCreateItemImage() {
  const nextImage = pendingCreateItemImage;
  pendingCreateItemImage = null;
  return nextImage;
}
