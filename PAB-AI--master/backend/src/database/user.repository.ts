import { User, RefreshToken } from '../models/user.model';

export interface IUserRepository {
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByVerificationToken(token: string): Promise<User | null>;
  getUserByResetToken(token: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Refresh Token management
  createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
}
