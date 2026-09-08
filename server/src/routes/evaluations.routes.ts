import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { calculateEvaluation, CalculationInput } from '../services/pricing.service';

const router = Router();

// POST /api/evaluations/calculate - Memory of calculation in real time
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { variantId, grade, hasReplacedPart, partIds } = req.body;

    if (!variantId) {
      return res.status(400).json({ error: 'ID da variante/capacidade é obrigatório.' });
    }

    if (!['A', 'B', 'C'].includes(grade)) {
      return res.status(400).json({ error: 'Grade deve ser A, B ou C.' });
    }

    const calculation = await calculateEvaluation({
      variantId: Number(variantId),
      grade,
      hasReplacedPart: Boolean(hasReplacedPart),
      partIds: Array.isArray(partIds) ? partIds.map(Number) : [],
    });

    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao calcular avaliação.' });
  }
});

// POST /api/evaluations - Save evaluation in database
router.post('/', async (req: Request, res: Response) => {
  try {
    const { variantId, grade, hasReplacedPart, partIds, customerName, notes } = req.body;

    if (!variantId) {
      return res.status(400).json({ error: 'ID da variante/capacidade é obrigatório.' });
    }

    if (!['A', 'B', 'C'].includes(grade)) {
      return res.status(400).json({ error: 'Grade deve ser A, B ou C.' });
    }

    // Realiza o cálculo oficial
    const breakdown = await calculateEvaluation({
      variantId: Number(variantId),
      grade,
      hasReplacedPart: Boolean(hasReplacedPart),
      partIds: Array.isArray(partIds) ? partIds.map(Number) : [],
    });

    // Salva no banco de dados com snapshots de valores
    const evaluation = await prisma.evaluation.create({
      data: {
        variantId: breakdown.variantId,
        modelName: breakdown.modelName,
        capacityName: breakdown.capacity,
        grade: breakdown.effectiveGrade,
        hasReplacedPart: breakdown.hasReplacedPart,
        basePriceGradeA: breakdown.basePriceGradeA,
        gradeDiscount: breakdown.gradeDiscount,
        totalPartsDeduction: breakdown.totalPartsDeduction,
        finalValue: breakdown.finalValue,
        customerName: customerName ? String(customerName).trim() : null,
        notes: notes ? String(notes).trim() : null,
        parts: {
          create: breakdown.parts.map((p) => ({
            partId: p.id,
            partName: p.name,
            cost: p.cost,
          })),
        },
      },
      include: {
        variant: {
          include: { model: true },
        },
        parts: true,
      },
    });

    res.status(201).json({
      message: 'Avaliação salva com sucesso!',
      evaluation,
      breakdown,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao salvar avaliação.' });
  }
});

// GET /api/evaluations - List evaluations history
router.get('/', async (_req: Request, res: Response) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: { model: true },
        },
        parts: true,
      },
    });
    res.json(evaluations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar histórico de avaliações.' });
  }
});

// GET /api/evaluations/:id - Get single evaluation details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        variant: {
          include: { model: true },
        },
        parts: true,
      },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/evaluations/:id - Delete an evaluation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.evaluation.delete({
      where: { id },
    });
    res.json({ message: 'Avaliação excluída com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir avaliação.' });
  }
});

export default router;
