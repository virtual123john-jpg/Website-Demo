// Shared between client (ImageUploadButton) and server (chatOrchestrator) so both
// enforce the same limits.
export const MAX_IMAGE_EDGE_PX = 1280;
export const IMAGE_JPEG_QUALITY = 0.7;
export const MAX_IMAGE_BASE64_BYTES = 3_500_000;

export const ACCEPTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAcceptedImageMimeType(mimeType: string): boolean {
  return (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}
