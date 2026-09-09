import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { getGradeSettings } from '../services/pricing.service';
import { authenticateToken, requireMaster } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// GET /api/settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await getGradeSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar configurações.' });
  }
});

// PUT /api/settings - Apenas Master pode alterar descontos de grade
router.put('/', requireMaster, async (req: Request, res: Response) => {
  try {
    const { discountB, discountC } = req.body;

    if (discountB !== undefined) {
      const numB = Number(discountB);
      if (isNaN(numB) || numB < 0) {
        return res.status(400).json({ error: 'O desconto da Grade B deve ser um número maior ou igual a zero.' });
      }
      await prisma.gradeSetting.upsert({
        where: { key: 'discount_grade_b' },
        update: { value: numB },
        create: { key: 'discount_grade_b', value: numB, description: 'Desconto aplicado para aparelhos Grade B (R$)' },
      });
    }

    if (discountC !== undefined) {
      const numC = Number(discountC);
      if (isNaN(numC) || numC < 0) {
        return res.status(400).json({ error: 'O desconto da Grade C deve ser um número maior ou igual a zero.' });
      }
      await prisma.gradeSetting.upsert({
        where: { key: 'discount_grade_c' },
        update: { value: numC },
        create: { key: 'discount_grade_c', value: numC, description: 'Desconto aplicado para aparelhos Grade C (R$)' },
      });
    }

    const updated = await getGradeSettings();
    res.json({ message: 'Configurações atualizadas com sucesso!', settings: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar configurações.' });
  }
});

export default router;
