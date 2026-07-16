import { IChatRepository } from './chat.repository';
import { Folder, Conversation, Message } from '../models/chat.model';
import { supabase } from '../config/supabase';

export class SupabaseChatRepository implements IChatRepository {
  // Folders mapping
  private mapDbToFolder(row: any): Folder {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      createdAt: new Date(row.created_at),
    };
  }

  // Conversations mapping
  private mapDbToConversation(row: any): Conversation {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      folderId: row.folder_id,
      isPinned: row.is_pinned,
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapConversationToDb(convo: Partial<Conversation>): Record<string, any> {
    const row: Record<string, any> = {};
    if (convo.title !== undefined) row.title = convo.title;
    if (convo.folderId !== undefined) row.folder_id = convo.folderId;
    if (convo.isPinned !== undefined) row.is_pinned = convo.isPinned;
    if (convo.metadata !== undefined) row.metadata = convo.metadata;
    return row;
  }

  // Messages mapping
  private mapDbToMessage(row: any): Message {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      sender: row.sender,
      content: row.content,
      createdAt: new Date(row.created_at),
    };
  }

  // Folders implementation
  async createFolder(userId: string, name: string): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .insert([{ user_id: userId, name }])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating folder: ${error.message}`);
    return this.mapDbToFolder(data);
  }

  async getFolders(userId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw new Error(`Supabase error fetching folders: ${error.message}`);
    return (data || []).map(this.mapDbToFolder);
  }

  async deleteFolder(userId: string, folderId: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', userId);

    if (error) throw new Error(`Supabase error deleting folder: ${error.message}`);
  }

  // Conversations implementation
  async createConversation(
    userId: string,
    title: string,
    folderId: string | null = null,
    metadata: Record<string, any> = {}
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title,
          folder_id: folderId,
          metadata,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating conversation: ${error.message}`);
    return this.mapDbToConversation(data);
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Supabase error fetching conversation: ${error.message}`);
    return data ? this.mapDbToConversation(data) : null;
  }

  async getConversations(
    userId: string,
    filters?: { folderId?: string | null; search?: string; pinnedOnly?: boolean }
  ): Promise<Conversation[]> {
    let query = supabase.from('conversations').select('*').eq('user_id', userId);

    if (filters) {
      if (filters.folderId !== undefined) {
        if (filters.folderId === null) {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', filters.folderId);
        }
      }
      if (filters.pinnedOnly) {
        query = query.eq('is_pinned', true);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
    }

    // Order: pinned first, then updated_at descending
    query = query.order('is_pinned', { ascending: false }).order('updated_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`Supabase error fetching conversations: ${error.message}`);
    return (data || []).map(this.mapDbToConversation);
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const dbData = this.mapConversationToDb(updates);
    const { data, error } = await supabase
      .from('conversations')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error updating conversation: ${error.message}`);
    return this.mapDbToConversation(data);
  }

  async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (error) throw new Error(`Supabase error deleting conversation: ${error.message}`);
  }

  // Messages implementation
  async createMessage(conversationId: string, sender: 'user' | 'ai', content: string): Promise<Message> {
    // Add message
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender,
          content,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating message: ${error.message}`);

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return this.mapDbToMessage(data);
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Supabase error fetching messages: ${error.message}`);
    return (data || []).map(this.mapDbToMessage);
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) throw new Error(`Supabase error deleting messages: ${error.message}`);
  }
}
