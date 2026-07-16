import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { userRepository } from '../database/db';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { message: 'Authentication token missing or invalid' } });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await userRepository.getUserById(payload.userId);
    if (!user) {
      res.status(401).json({ error: { message: 'User not found' } });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ error: { message: error.message || 'Unauthorized' } });
  }
};

export const requireVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: { message: 'Authentication required' } });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({ error: { message: 'Email verification is required to access this resource' } });
    return;
  }

  next();
};
