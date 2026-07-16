import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabase, isMockMode } from '../config/supabase';

export interface UploadedFile {
  id: string;
  userId: string;
  originalName: string;
  storagePath: string;
  publicUrl: string;
  mimetype: string;
  size: number;
  category: string;
  createdAt: Date;
}

const STORAGE_BUCKET = 'chat-uploads';

// In-memory store for mock mode
const mockFileStore: UploadedFile[] = [];

export class FileUploadService {
  /**
   * Upload a file to Supabase Storage (or mock store if in mock mode).
   */
  async uploadFile(
    userId: string,
    localFilePath: string,
    originalName: string,
    mimetype: string,
    category: string
  ): Promise<UploadedFile> {
    const fileId = crypto.randomUUID();
    const ext = path.extname(originalName);
    const storagePath = `${userId}/${category}/${fileId}${ext}`;

    if (isMockMode) {
      // In mock mode, we keep a reference to the local temp file
      const mockFile: UploadedFile = {
        id: fileId,
        userId,
        originalName,
        storagePath: localFilePath,
        publicUrl: `http://localhost:5000/uploads/temp/${path.basename(localFilePath)}`,
        mimetype,
        size: fs.statSync(localFilePath).size,
        category,
        createdAt: new Date(),
      };
      mockFileStore.push(mockFile);
      return mockFile;
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(localFilePath);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase storage upload error: ${uploadError.message}`);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    const publicUrl = urlData?.signedUrl || '';

    // Cleanup temp file
    fs.unlinkSync(localFilePath);

    return {
      id: fileId,
      userId,
      originalName,
      storagePath,
      publicUrl,
      mimetype,
      size: fileBuffer.length,
      category,
      createdAt: new Date(),
    };
  }

  /**
   * Delete a file from Supabase Storage.
   */
  async deleteFile(storagePath: string): Promise<void> {
    if (isMockMode) {
      // Remove from mock store
      const idx = mockFileStore.findIndex((f) => f.storagePath === storagePath);
      if (idx !== -1) mockFileStore.splice(idx, 1);
      return;
    }

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (error) throw new Error(`Supabase storage delete error: ${error.message}`);
  }

  /**
   * Get a fresh signed URL for an existing file.
   */
  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
    if (isMockMode) {
      return `http://localhost:5000/uploads/temp/${path.basename(storagePath)}`;
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) throw new Error(`Supabase signed URL error: ${error.message}`);
    return data?.signedUrl || '';
  }

  getMockFiles(): UploadedFile[] {
    return mockFileStore;
  }
}

export const fileUploadService = new FileUploadService();
