import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', validate(refreshTokenSchema), logout);
router.get('/verify', validate(verifyEmailSchema), verifyEmail);
router.post('/request-reset', validate(requestPasswordResetSchema), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Helper debug endpoint to verify token authentication works
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
      fullName: req.user?.fullName,
      avatarUrl: req.user?.avatarUrl,
      isVerified: req.user?.isVerified,
      preferences: req.user?.preferences,
    },
  });
});

export default router;
