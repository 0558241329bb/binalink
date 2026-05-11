import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from './db/prisma';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'binalink-access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'binalink-refresh-secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Helper to calculate completion score
export const calculateCompletionScore = (user: any, profile?: any) => {
  let score = 0;
  
  // Basic info (40%)
  if (user.name && user.phone && user.wilaya) score += 40;
  
  if (user.role === 'PROVIDER' && profile) {
    // Trade & Experience (20%)
    if (profile.trade && profile.yearsExperience !== undefined) score += 20;
    
    // Portfolio & ID (40%)
    const portfolio = JSON.parse(profile.portfolioImages || '[]');
    if (portfolio.length > 0) score += 20;
    if (profile.idCopyUrl) score += 20;
  } else if (user.role === 'CLIENT') {
    // Clients might have different criteria, for now let's say 100% if basic info is there
    score = 100;
  }
  
  // Phone verified bonus (part of basic or extra)
  if (user.isPhoneVerified) score = Math.min(100, score + 10);
  
  return score;
};

// Generate Tokens
export const generateTokens = (user: { id: string, role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// Middleware: Authenticate
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string, role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden' });
  }
};

// Middleware: Authorize
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth Handlers
export const register = async (req: Request, res: Response) => {
  const { name, phone, wilaya, password, role, trade, yearsExperience, portfolioImages, idCopyUrl } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mock OTP for MVP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        wilaya,
        password: hashedPassword,
        role: role || 'CLIENT',
        otpCode,
        otpExpires,
        providerProfile: role === 'PROVIDER' ? {
          create: {
            trade: trade || 'OTHER',
            yearsExperience: parseInt(yearsExperience) || 0,
            portfolioImages: JSON.stringify(portfolioImages || []),
            idCopyUrl: idCopyUrl || '',
            completionScore: 0 // Will update after creation
          }
        } : undefined
      },
      include: { providerProfile: true }
    });

    // Update completion score
    if (user.role === 'PROVIDER' && user.providerProfile) {
      const score = calculateCompletionScore(user, user.providerProfile);
      await prisma.providerProfile.update({
        where: { id: user.providerProfile.id },
        data: { completionScore: score }
      });
    }

    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.status(201).json({ 
      message: 'User registered. Please verify your phone.',
      otp: otpCode, // Returning OTP for MVP testing
      user: { id: user.id, name: user.name, role: user.role },
      accessToken,
      refreshToken
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { providerProfile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        isPhoneVerified: user.isPhoneVerified,
        completionScore: user.providerProfile?.completionScore || 100
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, code } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { providerProfile: true }
    });

    // Mock: Accept '123456' for testing as requested
    const isMockCode = code === '123456';
    const isRealCode = user && user.otpCode === code && (user.otpExpires && user.otpExpires > new Date());

    if (!user || (!isMockCode && !isRealCode)) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isPhoneVerified: true,
        otpCode: null,
        otpExpires: null
      }
    });

    // Update score after verification
    if (user.role === 'PROVIDER' && user.providerProfile) {
      const score = calculateCompletionScore({ ...user, isPhoneVerified: true }, user.providerProfile);
      await prisma.providerProfile.update({
        where: { id: user.providerProfile.id },
        data: { completionScore: score }
      });
    }

    res.json({ message: 'Phone verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const sendOTP = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { phone },
      data: { otpCode, otpExpires }
    });

    res.json({ message: 'OTP sent successfully', otp: otpCode });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    });

    if (!user) return res.status(403).json({ error: 'Invalid refresh token' });

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const tokens = generateTokens({ id: user.id, role: user.role });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.json(tokens);
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};
