"use client";

import { useState } from "react";
import { ImageUploadButton } from "./ImageUploadButton";
import type { ChatImage } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 4000;

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string, image: ChatImage | null) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<ChatImage | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !pendingImage) return;
    onSend(trimmed, pendingImage);
    setText("");
    setPendingImage(null);
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-brand-navy-900/10 p-3">
      {pendingImage && (
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage.dataUrl} alt="Selected attachment" className="h-12 w-12 rounded object-cover" />
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-brand-navy-900/60 underline"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Ask about Medicare or Medigap…"
          className="flex-1 resize-none rounded-md border border-brand-navy-900/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
        />
        <ImageUploadButton onImageSelected={setPendingImage} disabled={disabled} />
        <button
          type="submit"
          disabled={disabled || (!text.trim() && !pendingImage)}
          className="rounded-md bg-brand-gradient px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
