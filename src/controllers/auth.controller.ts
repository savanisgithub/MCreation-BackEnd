import { Request, Response } from 'express';
import { User, RefreshToken } from '../models/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Sign Up
export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser) {
    return sendError(res, 'User already exists', 'Email is already registered', 400);
  }

  // Check if username already exists
  const existingUsername = await User.findOne({
    where: {
      username,
    },
  });

  if (existingUsername) {
    return sendError(res, 'Username already taken', 'Please choose a different username', 400);
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token to database
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: expiryDate,
  });

  return sendSuccess(
    res,
    'User registered successfully',
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    },
    201
  );
});

// Sign In
export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    return sendError(res, 'Authentication failed', 'Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account is inactive', 'Please contact support', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return sendError(res, 'Authentication failed', 'Invalid email or password', 401);
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token to database
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: expiryDate,
  });

  return sendSuccess(res, 'Sign in successful', {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
  });
});

// Refresh Token
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', undefined, 400);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', undefined, 401);
  }

  // Check if refresh token exists in database and is not revoked
  const tokenRecord = await RefreshToken.findOne({
    where: {
      token: refreshToken,
      userId: decoded.userId,
      isRevoked: false,
    },
  });

  if (!tokenRecord) {
    return sendError(res, 'Invalid refresh token', 'Token not found or revoked', 401);
  }

  // Check if token has expired
  if (new Date() > tokenRecord.expiresAt) {
    return sendError(res, 'Refresh token expired', undefined, 401);
  }

  // Find user
  const user = await User.findByPk(decoded.userId);

  if (!user || !user.isActive) {
    return sendError(res, 'User not found or inactive', undefined, 401);
  }

  // Generate new access token
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(tokenPayload);

  return sendSuccess(res, 'Access token refreshed successfully', {
    accessToken,
  });
});

// Sign Out
export const signOut = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', undefined, 400);
  }

  // Revoke the refresh token
  await RefreshToken.update(
    { isRevoked: true },
    {
      where: {
        token: refreshToken,
        userId: req.user?.userId,
      },
    }
  );

  return sendSuccess(res, 'Signed out successfully');
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 'User not found', undefined, 404);
  }

  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'email', 'isActive', 'createdAt'],
  });

  if (!user) {
    return sendError(res, 'User not found', undefined, 404);
  }

  return sendSuccess(res, 'User retrieved successfully', {
    user,
  });
});
