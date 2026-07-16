export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  verificationToken?: string | null;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  preferences?: Record<string, any>;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
