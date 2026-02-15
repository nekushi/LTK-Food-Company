export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  timestamp: string; // ISO or display string
  isFromCurrentUser: boolean;
};

export type ChatConversation = {
  id: string;
  name: string;
  lastMessage?: string;
  lastAt?: string;
  unread?: number;
};
