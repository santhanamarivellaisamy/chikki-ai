export interface Folder {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  folderId: string | null;
  isPinned: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  content: string;
  createdAt: Date;
}
