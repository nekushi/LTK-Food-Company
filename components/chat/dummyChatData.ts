import type { ChatConversation, ChatMessage } from "./types";

/** Dummy conversations for inventory personnel (chat with stores) */
export const INVENTORY_CONVERSATIONS: ChatConversation[] = [
  {
    id: "store-alpha",
    name: "Store Alpha",
    lastMessage: "Can we get 5 reams of bond paper?",
    lastAt: "2m ago",
    unread: 1,
  },
  {
    id: "store-beta",
    name: "Store Beta",
    lastMessage: "Request received. Will deliver tomorrow.",
    lastAt: "1h ago",
  },
  {
    id: "store-gamma",
    name: "Store Gamma",
    lastMessage: "Thanks for the quick response.",
    lastAt: "Yesterday",
  },
];

/** Dummy conversations for store account (chat with inventory) */
export const STORE_CONVERSATIONS: ChatConversation[] = [
  {
    id: "inventory-main",
    name: "Inventory Personnel",
    lastMessage: "Request received. Will deliver tomorrow.",
    lastAt: "1h ago",
  },
];

/** Dummy conversations for HR (internal / support) */
export const HR_CONVERSATIONS: ChatConversation[] = [
  {
    id: "support",
    name: "Support",
    lastMessage: "Payroll file has been processed.",
    lastAt: "30m ago",
  },
  {
    id: "admin",
    name: "Admin",
    lastMessage: "New accounts created: 2.",
    lastAt: "Yesterday",
  },
];

/** Shared dummy messages for a thread (inventory ↔ store) */
export const DUMMY_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "store-alpha",
    senderId: "store",
    senderName: "Store Alpha",
    body: "Hi, we need to request some items for this week.",
    timestamp: "10:00 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m2",
    conversationId: "store-alpha",
    senderId: "inventory",
    senderName: "You",
    body: "Sure, what do you need?",
    timestamp: "10:02 AM",
    isFromCurrentUser: true,
  },
  {
    id: "m3",
    conversationId: "store-alpha",
    senderId: "store",
    senderName: "Store Alpha",
    body: "Can we get 5 reams of bond paper and 2 boxes of ballpens?",
    timestamp: "10:03 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m4",
    conversationId: "store-alpha",
    senderId: "inventory",
    senderName: "You",
    body: "Noted. I'll prepare the items and assign delivery. You should receive them by tomorrow.",
    timestamp: "10:05 AM",
    isFromCurrentUser: true,
  },
  {
    id: "m5",
    conversationId: "store-alpha",
    senderId: "store",
    senderName: "Store Alpha",
    body: "Thank you!",
    timestamp: "10:06 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m6",
    conversationId: "store-beta",
    senderId: "inventory",
    senderName: "You",
    body: "Delivery for your request has been scheduled.",
    timestamp: "9:00 AM",
    isFromCurrentUser: true,
  },
  {
    id: "m7",
    conversationId: "store-beta",
    senderId: "store",
    senderName: "Store Beta",
    body: "Request received. Will deliver tomorrow.",
    timestamp: "9:15 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m8",
    conversationId: "inventory-main",
    senderId: "store",
    senderName: "You",
    body: "Hi, we need to request some items for this week.",
    timestamp: "10:00 AM",
    isFromCurrentUser: true,
  },
  {
    id: "m9",
    conversationId: "inventory-main",
    senderId: "inventory",
    senderName: "Inventory Personnel",
    body: "Sure, what do you need?",
    timestamp: "10:02 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m10",
    conversationId: "inventory-main",
    senderId: "store",
    senderName: "You",
    body: "Can we get 5 reams of bond paper and 2 boxes of ballpens?",
    timestamp: "10:03 AM",
    isFromCurrentUser: true,
  },
  {
    id: "m11",
    conversationId: "inventory-main",
    senderId: "inventory",
    senderName: "Inventory Personnel",
    body: "Request received. Will deliver tomorrow.",
    timestamp: "10:05 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m12",
    conversationId: "support",
    senderId: "support",
    senderName: "Support",
    body: "Payroll file has been processed. 12 records imported.",
    timestamp: "11:30 AM",
    isFromCurrentUser: false,
  },
  {
    id: "m13",
    conversationId: "support",
    senderId: "hr",
    senderName: "You",
    body: "Thanks, I'll review the attendance cards.",
    timestamp: "11:35 AM",
    isFromCurrentUser: true,
  },
];
