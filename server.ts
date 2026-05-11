import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  register, login, verifyOTP, sendOTP, refresh, 
  authenticate, AuthRequest, authorize, firebaseSync 
} from './server/auth';
import prisma from './server/db/prisma';

async function seedPremiumContractors() {
  const existing = await prisma.user.findFirst({ where: { phone: '+213550001001' } });
  if (existing) return;

  // Contractor 1: بوهميلة
  await prisma.user.create({
    data: {
      phone: '+213550001001',
      email: 'bouhemila@contractors.dz',
      password: '$2b$10$placeholder_hashed_password',
      name: 'بوهميلة للمقاولة',
      wilaya: '23 Annaba',
      role: 'PROVIDER',
      isPhoneVerified: true,
      providerProfile: {
        create: {
          trade: 'CONTRACTOR',
          contractorTier: 'PREMIUM',
          yearsExperience: 22,
          capitalAmount: 150000000,
          brandReputation: 'REGIONAL',
          priceRangeMin: 45000,
          priceRangeMax: 85000,
          serviceType: 'FULL_BUILD',
          portfolioImages: '[]',
          blueprintImages: '[]',
          publicPhone: '+213550001001',
          publicEmail: 'bouhemila@contractors.dz',
          starRating: 5,
          idCopyUrl: '',
          verificationStatus: 'VERIFIED',
          completionScore: 95
        }
      }
    }
  });

  // Contractor 2: فطيمي
  await prisma.user.create({
    data: {
      phone: '+213550001002',
      email: 'fatimi@contractors.dz',
      password: '$2b$10$placeholder_hashed_password',
      name: 'فطيمي للبناء',
      wilaya: '23 Annaba',
      role: 'PROVIDER',
      isPhoneVerified: true,
      providerProfile: {
        create: {
          trade: 'CONTRACTOR',
          contractorTier: 'PREMIUM',
          yearsExperience: 15,
          capitalAmount: 80000000,
          brandReputation: 'LOCAL',
          priceRangeMin: 35000,
          priceRangeMax: 65000,
          serviceType: 'SEMI_BUILD',
          portfolioImages: '[]',
          blueprintImages: '[]',
          publicPhone: '+213550001002',
          publicEmail: 'fatimi@contractors.dz',
          starRating: 4,
          idCopyUrl: '',
          verificationStatus: 'VERIFIED',
          completionScore: 88
        }
      }
    }
  });
}

async function startServer() {
  if (process.env.SEED_PREMIUM === 'true') {
    await seedPremiumContractors();
  }

  const app = express();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      env: process.env.NODE_ENV,
      time: new Date().toISOString()
    });
  });

  // --- AUTH ROUTES ---
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.post('/api/auth/refresh', refresh);
  app.post('/api/auth/verify-otp', verifyOTP);
  app.post('/api/auth/send-otp', sendOTP);
  app.post('/api/auth/firebase-sync', firebaseSync);

  // --- PROVIDER ENDPOINTS ---
  app.get('/api/providers', async (req, res) => {
    const { category, location, featured, tier } = req.query;
    
    try {
      const providers = await prisma.user.findMany({
        where: {
          role: 'PROVIDER',
          providerProfile: {
            trade: category ? (category as string) : undefined,
            contractorTier: tier ? (tier as string) : undefined,
            user: { wilaya: location ? (location as string) : undefined },
            ...(featured === 'true' ? { completionScore: { gte: 80 } } : {})
          }
        },
        include: { 
          providerProfile: true,
          assignedProjects: {
            include: { review: true }
          }
        }
      });
      res.json({ data: providers });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  });

  app.get('/api/providers/:id', async (req, res) => {
    try {
      const provider = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: { 
          providerProfile: true,
          assignedProjects: {
            include: { review: true }
          }
        }
      });
      if (!provider || provider.role !== 'PROVIDER') {
        return res.status(404).json({ error: 'Provider not found' });
      }
      res.json({ data: provider });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch provider detail' });
    }
  });

  app.patch('/api/providers/:id/profile', authenticate, async (req: AuthRequest, res) => {
    const { id } = req.params;
    if (req.user!.id !== id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    try {
      const { 
        trade, yearsExperience, portfolioImages, idCopyUrl,
        contractorTier, capitalAmount, brandReputation, priceRangeMin,
        priceRangeMax, serviceType, blueprintImages, publicPhone,
        publicEmail, starRating, reputationScore, pricePerUnit, completionTimeWeeks
      } = req.body;
      const updated = await prisma.providerProfile.upsert({
        where: { userId: id },
        update: {
          trade,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          portfolioImages: portfolioImages ? (typeof portfolioImages === 'string' ? portfolioImages : JSON.stringify(portfolioImages)) : undefined,
          idCopyUrl,
          contractorTier,
          capitalAmount: capitalAmount ? parseInt(capitalAmount) : undefined,
          brandReputation,
          priceRangeMin: priceRangeMin ? parseInt(priceRangeMin) : undefined,
          priceRangeMax: priceRangeMax ? parseInt(priceRangeMax) : undefined,
          serviceType,
          blueprintImages: blueprintImages ? (typeof blueprintImages === 'string' ? blueprintImages : JSON.stringify(blueprintImages)) : undefined,
          publicPhone,
          publicEmail,
          starRating: starRating ? parseInt(starRating) : undefined,
          reputationScore,
          pricePerUnit: pricePerUnit ? parseInt(pricePerUnit) : undefined,
          completionTimeWeeks: completionTimeWeeks ? parseInt(completionTimeWeeks) : undefined
        },
        create: {
          userId: id,
          trade: trade || 'OTHER',
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : 0,
          portfolioImages: portfolioImages ? (typeof portfolioImages === 'string' ? portfolioImages : JSON.stringify(portfolioImages)) : '[]',
          idCopyUrl: idCopyUrl || '',
          contractorTier,
          capitalAmount: capitalAmount ? parseInt(capitalAmount) : undefined,
          brandReputation,
          priceRangeMin: priceRangeMin ? parseInt(priceRangeMin) : undefined,
          priceRangeMax: priceRangeMax ? parseInt(priceRangeMax) : undefined,
          serviceType,
          blueprintImages: blueprintImages ? (typeof blueprintImages === 'string' ? blueprintImages : JSON.stringify(blueprintImages)) : undefined,
          publicPhone,
          publicEmail,
          starRating: starRating ? parseInt(starRating) : undefined,
          reputationScore,
          pricePerUnit: pricePerUnit ? parseInt(pricePerUnit) : undefined,
          completionTimeWeeks: completionTimeWeeks ? parseInt(completionTimeWeeks) : undefined
        }
      });
      res.json({ data: updated, message: 'Profile updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update provider profile' });
    }
  });

  app.get('/api/contractors/premium', async (req, res) => {
    const { wilaya } = req.query;
    const where: any = {
      role: 'PROVIDER',
      providerProfile: {
        trade: 'CONTRACTOR',
        contractorTier: 'PREMIUM',
        verificationStatus: 'VERIFIED'
      }
    };
    if (wilaya) where.wilaya = wilaya as string;
    const contractors = await prisma.user.findMany({
      where,
      include: { providerProfile: true },
      orderBy: { providerProfile: { starRating: 'desc' } }
    });
    res.json(contractors);
  });

  app.get('/api/contractors/standard', async (req, res) => {
    const { wilaya } = req.query;
    const where: any = {
      role: 'PROVIDER',
      providerProfile: {
        trade: 'CONTRACTOR',
        contractorTier: 'STANDARD',
        verificationStatus: 'VERIFIED'
      }
    };
    if (wilaya) where.wilaya = wilaya as string;
    const contractors = await prisma.user.findMany({
      where,
      include: { providerProfile: true },
      orderBy: { providerProfile: { starRating: 'desc' } }
    });
    res.json(contractors);
  });

  // --- PROJECT ENDPOINTS ---
  app.post('/api/projects', authenticate, async (req: AuthRequest, res) => {
    const { title, description, budget, providerId, wilaya, address } = req.body;
    
    try {
      const project = await prisma.project.create({
        data: {
          title,
          description,
          budget: parseInt(budget) || 0,
          clientId: req.user!.id,
          providerId,
          wilaya,
          address
        }
      });
      res.status(201).json({ data: project, message: 'Project request created' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  app.get('/api/projects', authenticate, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    try {
      const projects = await prisma.project.findMany({
        where: role === 'PROVIDER' ? { providerId: userId } : { clientId: userId },
        include: {
          client: { select: { name: true, phone: true } },
          provider: { select: { name: true, phone: true } },
          milestones: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ data: projects });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:id', authenticate, async (req: AuthRequest, res) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          client: { select: { id: true, name: true, phone: true, wilaya: true } },
          provider: { select: { id: true, name: true, phone: true, providerProfile: true } },
          milestones: true,
          review: true
        }
      });

      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      // Ownership check
      if (project.clientId !== req.user!.id && project.providerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ data: project });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch project details' });
    }
  });

  app.patch('/api/projects/:id/status', authenticate, async (req: AuthRequest, res) => {
    const { status } = req.body;
    try {
      const updated = await prisma.project.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json({ data: updated, message: 'Project status updated' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update project status' });
    }
  });

  // --- MILESTONES ENDPOINTS ---
  app.post('/api/projects/:id/milestones', authenticate, async (req: AuthRequest, res) => {
    const { title, description } = req.body;
    try {
      const milestone = await prisma.milestone.create({
        data: {
          projectId: req.params.id,
          title,
          description
        }
      });
      res.status(201).json({ data: milestone, message: 'Milestone added' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add milestone' });
    }
  });

  app.patch('/api/milestones/:id', authenticate, async (req: AuthRequest, res) => {
    const { progress, status } = req.body;
    try {
      const updated = await prisma.milestone.update({
        where: { id: req.params.id },
        data: { 
          progress: progress !== undefined ? parseInt(progress) : undefined, 
          status 
        }
      });
      res.json({ data: updated, message: 'Milestone updated' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update milestone' });
    }
  });

  // --- ADMIN ENDPOINTS ---
  app.get('/api/admin/stats', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
      const [userCount, projectCount, pendingProviders, totalRevenue] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.providerProfile.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.project.aggregate({
          _sum: { budget: true },
          where: { status: 'COMPLETED' }
        })
      ]);

      res.json({
        data: {
          totalUsers: userCount,
          activeProjects: projectCount,
          pendingVerifications: pendingProviders,
          revenue: totalRevenue._sum.budget || 0
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/admin/providers', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
      const providers = await prisma.user.findMany({
        where: { role: 'PROVIDER' },
        include: { providerProfile: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ data: providers });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch providers for admin' });
    }
  });

  app.patch('/api/admin/providers/:id/verify', authenticate, authorize(['ADMIN']), async (req, res) => {
    const { status } = req.body; // VERIFIED, REJECTED
    try {
      const updated = await prisma.providerProfile.update({
        where: { userId: req.params.id },
        data: { verificationStatus: status }
      });
      res.json({ data: updated, message: `Provider status updated to ${status}` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to verify provider' });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
