import { Router } from 'express';
import {
  signUp,
  signIn,
  refreshAccessToken,
  signOut,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import {
  signUpValidation,
  signInValidation,
  refreshTokenValidation,
} from '../validators/auth.validator.js';

const router = Router();

// Public routes with rate limiting
router.post('/signup', authLimiter, validate(signUpValidation), signUp);
router.post('/signin', authLimiter, validate(signInValidation), signIn);
router.post('/refresh-token', validate(refreshTokenValidation), refreshAccessToken);

// Protected routes
router.post('/signout', authenticate, validate(refreshTokenValidation), signOut);
router.get('/me', authenticate, getCurrentUser);

export default router;
