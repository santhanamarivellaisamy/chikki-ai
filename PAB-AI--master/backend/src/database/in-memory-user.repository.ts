import { IUserRepository } from './user.repository';
import { User, RefreshToken } from '../models/user.model';
import { InMemoryDB } from './in-memory-db';
import crypto from 'crypto';

export class InMemoryUserRepository implements IUserRepository {
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    InMemoryDB.users.push(user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = InMemoryDB.users.find((u) => u.id === id);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = InMemoryDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    const user = InMemoryDB.users.find((u) => u.verificationToken === token);
    return user || null;
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    const user = InMemoryDB.users.find(
      (u) =>
        u.resetToken === token &&
        u.resetTokenExpires &&
        u.resetTokenExpires.getTime() > Date.now()
    );
    return user || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const index = InMemoryDB.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    const updatedUser = {
      ...InMemoryDB.users[index],
      ...updates,
      updatedAt: new Date(),
    };
    InMemoryDB.users[index] = updatedUser;
    return updatedUser;
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const rToken: RefreshToken = {
      id: crypto.randomUUID(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    InMemoryDB.refreshTokens.push(rToken);
    return rToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const rToken = InMemoryDB.refreshTokens.find((t) => t.token === token);
    if (!rToken) return null;
    if (rToken.expiresAt.getTime() < Date.now()) {
      await this.deleteRefreshToken(token);
      return null;
    }
    return rToken;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    InMemoryDB.refreshTokens = InMemoryDB.refreshTokens.filter((t) => t.token !== token);
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    InMemoryDB.refreshTokens = InMemoryDB.refreshTokens.filter((t) => t.userId !== userId);
  }
}
