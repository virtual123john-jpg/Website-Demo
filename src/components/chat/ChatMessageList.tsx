"use client";

import { useEffect, useRef } from "react";

export interface UiMessage {
  role: "user" | "assistant";
  content: string;
  imagePreviewUrl?: string;
}

export function ChatMessageList({ messages, isLoading }: { messages: UiMessage[]; isLoading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 && (
        <p className="text-sm text-brand-navy-900/60">
          Ask a question about Medicare or Medigap, or attach a photo of a Medicare card or letter.
        </p>
      )}
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === "user"
                ? "bg-brand-gradient text-white"
                : "border border-brand-navy-900/10 bg-white text-brand-navy-950"
            }`}
          >
            {m.imagePreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.imagePreviewUrl}
                alt="Uploaded attachment"
                className="mb-2 max-h-48 rounded-lg object-contain"
              />
            )}
            {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-2xl border border-brand-navy-900/10 bg-white px-4 py-2 text-sm text-brand-navy-900/60">
            Thinking…
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
