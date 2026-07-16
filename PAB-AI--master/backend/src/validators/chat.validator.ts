import { z } from 'zod';

export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Folder name is required').max(100, 'Folder name is too long'),
  }),
});

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    folderId: z.string().uuid().nullable().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const renameConversationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  }),
});

export const updateConversationFolderSchema = z.object({
  body: z.object({
    folderId: z.string().uuid().nullable().optional(),
  }),
});

export const continueConversationSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required'),
    provider: z.string().min(1, 'AI Provider is required'),
    model: z.string().min(1, 'AI Model is required'),
    stream: z.boolean().optional().default(false),
  }),
});
