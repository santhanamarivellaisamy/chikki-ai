import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '../database/db';
import { generateAccessToken, generateRefreshTokenString } from '../utils/jwt.utils';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, fullName, avatarUrl } = req.body;

    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: { message: 'User with this email already exists' } });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate simple verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await userRepository.createUser({
      email,
      passwordHash,
      fullName,
      avatarUrl,
      isVerified: false,
      verificationToken,
      resetToken: null,
      resetTokenExpires: null,
      preferences: {},
    });

    // In production, send a verification email. For now, log it.
    console.log(`[AUTH] Verification email token for ${email}: ${verificationToken}`);
    console.log(`[AUTH] Link: http://localhost:5000/api/auth/verify?token=${verificationToken}`);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: { message: 'Invalid email or password' } });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: { message: 'Invalid email or password' } });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshTokenStr = generateRefreshTokenString();
    
    // Save refresh token to database (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await userRepository.createRefreshToken(user.id, refreshTokenStr, expiresAt);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken: refreshTokenStr,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const tokenRecord = await userRepository.getRefreshToken(refreshToken);
    if (!tokenRecord) {
      res.status(401).json({ error: { message: 'Invalid or expired refresh token' } });
      return;
    }

    const user = await userRepository.getUserById(tokenRecord.userId);
    if (!user) {
      res.status(401).json({ error: { message: 'User not found' } });
      return;
    }

    // Generate new Access Token
    const newAccessToken = generateAccessToken(user.id);
    
    // Optionally rotate refresh token
    const newRefreshTokenStr = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Delete old refresh token, insert new one
    await userRepository.deleteRefreshToken(refreshToken);
    await userRepository.createRefreshToken(user.id, newRefreshTokenStr, expiresAt);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenStr,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await userRepository.deleteRefreshToken(refreshToken);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.query.token as string;

    const user = await userRepository.getUserByVerificationToken(token);
    if (!user) {
      res.status(400).json({ error: { message: 'Invalid or expired verification token' } });
      return;
    }

    await userRepository.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
    });

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await userRepository.getUserByEmail(email);
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour validity

      await userRepository.updateUser(user.id, {
        resetToken,
        resetTokenExpires,
      });

      // In production, send email. For now, log it.
      console.log(`[AUTH] Password reset token for ${email}: ${resetToken}`);
      console.log(`[AUTH] Link: http://localhost:5000/api/auth/reset-password?token=${resetToken}`);
    }

    // Always return generic success to prevent email enumeration attacks
    res.status(200).json({
      message: 'If a user with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await userRepository.getUserByResetToken(token);
    if (!user) {
      res.status(400).json({ error: { message: 'Invalid or expired reset token' } });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await userRepository.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    });

    // Revoke all refresh tokens for security on password change
    await userRepository.deleteUserRefreshTokens(user.id);

    res.status(200).json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    next(error);
  }
};
