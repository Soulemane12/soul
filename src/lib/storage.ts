import { Chat, Message } from '@/types';

// Simple in-memory storage for development
// In production, replace with a real database
let chats: Chat[] = [];
let nextId = 1;

export class ChatStorage {
  static async createChat(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> {
    const newChat: Chat = {
      ...chat,
      id: `chat_${nextId++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chats.push(newChat);
    return newChat;
  }

  static async getChat(id: string): Promise<Chat | null> {
    return chats.find(chat => chat.id === id) || null;
  }

  static async getAllChats(): Promise<Chat[]> {
    return [...chats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  static async updateChat(id: string, updates: Partial<Chat>): Promise<Chat | null> {
    const chatIndex = chats.findIndex(chat => chat.id === id);
    if (chatIndex === -1) return null;

    chats[chatIndex] = {
      ...chats[chatIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return chats[chatIndex];
  }

  static async deleteChat(id: string): Promise<boolean> {
    const chatIndex = chats.findIndex(chat => chat.id === id);
    if (chatIndex === -1) return false;

    chats.splice(chatIndex, 1);
    return true;
  }

  static async addMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message | null> {
    const chat = await this.getChat(chatId);
    if (!chat) return null;

    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    chat.updatedAt = new Date();

    return newMessage;
  }

  static async updateMessage(chatId: string, messageId: string, updates: Partial<Message>): Promise<Message | null> {
    const chat = await this.getChat(chatId);
    if (!chat) return null;

    const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return null;

    chat.messages[messageIndex] = {
      ...chat.messages[messageIndex],
      ...updates,
    };
    chat.updatedAt = new Date();

    return chat.messages[messageIndex];
  }

  static async clearChats(): Promise<void> {
    chats = [];
    nextId = 1;
  }
}
