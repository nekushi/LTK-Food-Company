"use client";

import { useState } from "react";
import type { ChatConversation, ChatMessage } from "./types";

type ChatLayoutProps = {
  title: string;
  subtitle?: string;
  conversations: ChatConversation[];
  messages: ChatMessage[];
  onSendMessage?: (conversationId: string, body: string) => void;
};

export function ChatLayout({
  title,
  subtitle,
  conversations,
  messages,
  onSendMessage,
}: ChatLayoutProps) {
  const [selectedId, setSelectedId] = useState<string>(
    conversations[0]?.id ?? "",
  );
  const [inputValue, setInputValue] = useState("");

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const threadMessages = messages.filter(
    (m) => m.conversationId === selectedId,
  );

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !selectedId) return;
    onSendMessage?.(selectedId, trimmed);
    setInputValue("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-100 flex-col rounded-xl border border-amber-200 bg-white shadow-sm md:flex-row">
      {/* Conversation list */}
      <aside className="w-full border-b border-amber-200 md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-amber-200 p-3">
          <h2 className="text-sm font-semibold text-amber-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-amber-700/80">{subtitle}</p>
          )}
        </div>
        <ul className="max-h-50 overflow-y-auto md:max-h-none md:flex-1">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`flex w-full flex-col gap-0.5 px-3 py-3 text-left transition-colors hover:bg-amber-50 focus:bg-amber-50 focus:outline-none ${
                  selectedId === c.id ? "bg-amber-100" : ""
                }`}
              >
                <span className="text-sm font-medium text-amber-900">
                  {c.name}
                </span>
                {c.lastMessage && (
                  <span className="truncate text-xs text-amber-700/80">
                    {c.lastMessage}
                  </span>
                )}
                {c.lastAt && (
                  <span className="text-xs text-amber-600/70">{c.lastAt}</span>
                )}
                {c.unread !== undefined && c.unread > 0 && (
                  <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-medium text-white">
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Message thread */}
      <div className="flex flex-1 flex-col min-h-0">
        {selectedConversation ? (
          <>
            <div className="border-b border-amber-200 px-4 py-2">
              <p className="text-sm font-semibold text-amber-900">
                {selectedConversation.name}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto bg-[var(--ltk-blue-white)]/30 p-4">
              <div className="space-y-3">
                {threadMessages.length === 0 ? (
                  <p className="text-center text-sm text-amber-600/80">
                    No messages yet. Send one below.
                  </p>
                ) : (
                  threadMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          msg.isFromCurrentUser
                            ? "bg-amber-500 text-white"
                            : "bg-white text-amber-900 shadow-sm border border-amber-200"
                        }`}
                      >
                        {!msg.isFromCurrentUser && (
                          <p className="mb-0.5 text-xs font-medium text-amber-700">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">
                          {msg.body}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            msg.isFromCurrentUser
                              ? "text-amber-100"
                              : "text-amber-600/80"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border-t border-amber-200 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/70 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-amber-600/80">
            <p className="text-sm">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
