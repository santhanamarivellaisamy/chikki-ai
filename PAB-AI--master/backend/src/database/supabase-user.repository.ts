import { IUserRepository } from './user.repository';
import { User, RefreshToken } from '../models/user.model';
import { supabase } from '../config/supabase';

export class SupabaseUserRepository implements IUserRepository {
  private mapDbToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      isVerified: row.is_verified,
      verificationToken: row.verification_token,
      resetToken: row.reset_token,
      resetTokenExpires: row.reset_token_expires ? new Date(row.reset_token_expires) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      preferences: row.preferences,
    };
  }

  private mapUserToDb(user: Partial<User>): Record<string, any> {
    const dbRow: Record<string, any> = {};
    if (user.email !== undefined) dbRow.email = user.email;
    if (user.passwordHash !== undefined) dbRow.password_hash = user.passwordHash;
    if (user.fullName !== undefined) dbRow.full_name = user.fullName;
    if (user.avatarUrl !== undefined) dbRow.avatar_url = user.avatarUrl;
    if (user.isVerified !== undefined) dbRow.is_verified = user.isVerified;
    if (user.verificationToken !== undefined) dbRow.verification_token = user.verificationToken;
    if (user.resetToken !== undefined) dbRow.reset_token = user.resetToken;
    if (user.resetTokenExpires !== undefined) {
      dbRow.reset_token_expires = user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null;
    }
    if (user.preferences !== undefined) dbRow.preferences = user.preferences;
    return dbRow;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const dbData = this.mapUserToDb(userData);
    const { data, error } = await supabase
      .from('users')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error creating user: ${error.message}`);
    }
    return this.mapDbToUser(data);
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase error getting user by id: ${error.message}`);
    }
    return data ? this.mapDbToUser(data) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase error getting user by email: ${error.message}`);
    }
    return data ? this.mapDbToUser(data) : null;
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase error getting user by token: ${error.message}`);
    }
    return data ? this.mapDbToUser(data) : null;
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase error getting user by reset token: ${error.message}`);
    }
    return data ? this.mapDbToUser(data) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const dbData = this.mapUserToDb(updates);
    const { data, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error updating user: ${error.message}`);
    }
    return this.mapDbToUser(data);
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .insert([
        {
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error creating refresh token: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
    };
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase error getting refresh token: ${error.message}`);
    }

    if (!data) return null;

    const expiresAt = new Date(data.expires_at);
    if (expiresAt.getTime() < Date.now()) {
      await this.deleteRefreshToken(token);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      expiresAt,
      createdAt: new Date(data.created_at),
    };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const { error } = await supabase
      .from('refresh_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      throw new Error(`Supabase error deleting refresh token: ${error.message}`);
    }
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const { error } = await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Supabase error deleting user refresh tokens: ${error.message}`);
    }
  }
}
