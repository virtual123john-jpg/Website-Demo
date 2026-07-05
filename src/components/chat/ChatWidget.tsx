"use client";

import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList, type UiMessage } from "./ChatMessageList";
import { DisclaimerBanner } from "./DisclaimerBanner";
import type { ChatImage } from "@/lib/types";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(text: string, image: ChatImage | null) {
    const userMessage: UiMessage = {
      role: "user",
      content: text,
      imagePreviewUrl: image?.dataUrl,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content || "(image attached)" })),
          message: text,
          image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Could not reach the assistant. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="flex h-[32rem] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-brand-navy-900/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-brand-navy-950 px-4 py-3 text-white">
            <span className="text-sm font-semibold">JAI Medicare &amp; Medigap Assistant</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
          <DisclaimerBanner />
          <ChatMessageList messages={messages} isLoading={isLoading} />
          {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        >
          Ask about Medicare
        </button>
      )}
    </div>
  );
}
