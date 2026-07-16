import { Folder, Conversation, Message } from '../models/chat.model';

export interface IChatRepository {
  // Folders
  createFolder(userId: string, name: string): Promise<Folder>;
  getFolders(userId: string): Promise<Folder[]>;
  deleteFolder(userId: string, folderId: string): Promise<void>;

  // Conversations
  createConversation(
    userId: string,
    title: string,
    folderId?: string | null,
    metadata?: Record<string, any>
  ): Promise<Conversation>;
  getConversationById(id: string): Promise<Conversation | null>;
  getConversations(
    userId: string,
    filters?: { folderId?: string | null; search?: string; pinnedOnly?: boolean }
  ): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;

  // Messages
  createMessage(conversationId: string, sender: 'user' | 'ai', content: string): Promise<Message>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  deleteMessagesByConversationId(conversationId: string): Promise<void>;
}
