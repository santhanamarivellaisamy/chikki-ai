import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your_custom_jwt_secret_if_needed'
  ? process.env.JWT_SECRET
  : 'default_super_secure_development_jwt_secret_12345';

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes access token
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days refresh token

export interface TokenPayload {
  userId: string;
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshTokenString(): string {
  // Returns a unique cryptographically strong random token string or a signed token
  return jwt.sign({ random: Math.random().toString() }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
