"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import {
  DUMMY_MESSAGES,
  STORE_CONVERSATIONS,
} from "@/components/chat/dummyChatData";

export default function StoreChatsPage() {
  return (
    <div className="space-y-4 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Chats</h1>
        <p className="text-amber-800/80">
          Realtime communication with inventory personnel.
        </p>
      </div>
      <ChatLayout
        title="Conversations"
        subtitle="Inventory personnel"
        conversations={STORE_CONVERSATIONS}
        messages={DUMMY_MESSAGES}
        onSendMessage={(conversationId, body) => {
          console.log("Send (UI only)", conversationId, body);
        }}
      />
    </div>
  );
}
