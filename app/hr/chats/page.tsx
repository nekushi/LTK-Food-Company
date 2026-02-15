"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import {
  DUMMY_MESSAGES,
  HR_CONVERSATIONS,
} from "@/components/chat/dummyChatData";

export default function HRChatsPage() {
  return (
    <div className="space-y-4 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Chats</h1>
        <p className="text-amber-800/80">Realtime communication.</p>
      </div>
      <ChatLayout
        title="Conversations"
        subtitle="Support & admin"
        conversations={HR_CONVERSATIONS}
        messages={DUMMY_MESSAGES}
        onSendMessage={(conversationId, body) => {
          console.log("Send (UI only)", conversationId, body);
        }}
      />
    </div>
  );
}
