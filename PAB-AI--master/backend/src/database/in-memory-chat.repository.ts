import { IChatRepository } from './chat.repository';
import { Folder, Conversation, Message } from '../models/chat.model';
import { InMemoryDB } from './in-memory-db';
import crypto from 'crypto';

export class InMemoryChatRepository implements IChatRepository {
  // Folders
  async createFolder(userId: string, name: string): Promise<Folder> {
    const folder: Folder = {
      id: crypto.randomUUID(),
      userId,
      name,
      createdAt: new Date(),
    };
    InMemoryDB.folders.push(folder);
    return folder;
  }

  async getFolders(userId: string): Promise<Folder[]> {
    return InMemoryDB.folders.filter((f) => f.userId === userId);
  }

  async deleteFolder(userId: string, folderId: string): Promise<void> {
    InMemoryDB.folders = InMemoryDB.folders.filter((f) => !(f.id === folderId && f.userId === userId));
    // Set folderId to null for all conversations in this folder
    InMemoryDB.conversations.forEach((c) => {
      if (c.folderId === folderId && c.userId === userId) {
        c.folderId = null;
      }
    });
  }

  // Conversations
  async createConversation(
    userId: string,
    title: string,
    folderId: string | null = null,
    metadata: Record<string, any> = {}
  ): Promise<Conversation> {
    const convo: Conversation = {
      id: crypto.randomUUID(),
      userId,
      title,
      folderId,
      isPinned: false,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    InMemoryDB.conversations.push(convo);
    return convo;
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    return InMemoryDB.conversations.find((c) => c.id === id) || null;
  }

  async getConversations(
    userId: string,
    filters?: { folderId?: string | null; search?: string; pinnedOnly?: boolean }
  ): Promise<Conversation[]> {
    let convos = InMemoryDB.conversations.filter((c) => c.userId === userId);

    if (filters) {
      if (filters.folderId !== undefined) {
        convos = convos.filter((c) => c.folderId === filters.folderId);
      }
      if (filters.pinnedOnly) {
        convos = convos.filter((c) => c.isPinned);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        convos = convos.filter((c) => c.title.toLowerCase().includes(query));
      }
    }

    // Sort by pinned first, then updatedAt descending
    return convos.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const index = InMemoryDB.conversations.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Conversation not found');
    }
    const updatedConvo = {
      ...InMemoryDB.conversations[index],
      ...updates,
      updatedAt: new Date(),
    };
    InMemoryDB.conversations[index] = updatedConvo;
    return updatedConvo;
  }

  async deleteConversation(id: string): Promise<void> {
    InMemoryDB.conversations = InMemoryDB.conversations.filter((c) => c.id !== id);
    await this.deleteMessagesByConversationId(id);
  }

  // Messages
  async createMessage(conversationId: string, sender: 'user' | 'ai', content: string): Promise<Message> {
    const msg: Message = {
      id: crypto.randomUUID(),
      conversationId,
      sender,
      content,
      createdAt: new Date(),
    };
    InMemoryDB.messages.push(msg);

    // Update conversation's updatedAt timestamp
    const convoIndex = InMemoryDB.conversations.findIndex((c) => c.id === conversationId);
    if (convoIndex !== -1) {
      InMemoryDB.conversations[convoIndex].updatedAt = new Date();
    }

    return msg;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return InMemoryDB.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    InMemoryDB.messages = InMemoryDB.messages.filter((m) => m.conversationId !== conversationId);
  }
}
