"use client";

import { useRef, useState } from "react";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_JPEG_QUALITY,
  MAX_IMAGE_EDGE_PX,
  isAcceptedImageMimeType,
} from "@/lib/imageValidation";
import type { ChatImage } from "@/lib/types";

function resizeToJpegDataUrl(file: File): Promise<{ dataUrl: string; approxBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_EDGE_PX / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", IMAGE_JPEG_QUALITY);
      URL.revokeObjectURL(objectUrl);
      resolve({ dataUrl, approxBytes: dataUrl.length });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image file"));
    };
    img.src = objectUrl;
  });
}

export function ImageUploadButton({
  onImageSelected,
  disabled,
}: {
  onImageSelected: (image: ChatImage) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isAcceptedImageMimeType(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    try {
      const { dataUrl, approxBytes } = await resizeToJpegDataUrl(file);
      setError(null);
      onImageSelected({ dataUrl, mimeType: "image/jpeg", approxBytes });
    } catch {
      setError("Could not process that image. Please try another file.");
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-brand-navy-900/20 px-3 py-2 text-sm text-brand-navy-900 transition hover:bg-brand-light disabled:opacity-50"
        aria-label="Attach an image"
      >
        Attach image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
