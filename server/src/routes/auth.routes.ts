import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticateToken, requireMaster, AuthenticatedRequest, AuthPayload } from '../middlewares/auth.middleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'iavalia-super-secret-jwt-token-key-2026-secure';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, username, login: userLogin, password } = req.body;
    const identifier = email || username || userLogin;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedIdentifier },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique o usuário e a senha.' });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique o usuário e a senha.' });
    }

    const payload: AuthPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

// GET /api/auth/me - Dados do usuário atual
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
  }
});

// GET /api/auth/stores - Lista todas as lojas cadastradas (para filtros do Master)
router.get('/stores', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stores = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar lojas.' });
  }
});

// POST /api/auth/register - Cadastro de novas lojas (restrito ao Master)
router.post('/register', authenticateToken, requireMaster, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Já existe um usuário com este e-mail.' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const assignedRole = role === 'MASTER' ? 'MASTER' : 'STORE';

    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Loja cadastrada com sucesso!',
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao cadastrar loja.' });
  }
});

export default router;
