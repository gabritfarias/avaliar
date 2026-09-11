import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { calculateEvaluation } from '../services/pricing.service';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de avaliação exigem autenticação
router.use(authenticateToken);

// POST /api/evaluations/calculate - Real-time calculation without saving
router.post('/calculate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { variantId, grade, hasReplacedPart, replacedComponents, replacedDetails, partIds } = req.body;

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
      replacedComponents: Array.isArray(replacedComponents)
        ? replacedComponents.map(String)
        : typeof replacedComponents === 'string' && replacedComponents
        ? [replacedComponents]
        : [],
      replacedDetails: Array.isArray(replacedDetails)
        ? replacedDetails.map((d: any) => ({
            name: String(d.name),
            status: d.status === 'UNKNOWN' ? 'UNKNOWN' : 'GENUINE',
          }))
        : undefined,
      partIds: Array.isArray(partIds) ? partIds.map(Number) : [],
    });

    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao calcular avaliação.' });
  }
});

// POST /api/evaluations - Save evaluation in database vinculada ao storeId da sessão
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { variantId, grade, hasReplacedPart, replacedComponents, replacedDetails, partIds, customerName, notes, tradeIn } = req.body;

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
      replacedComponents: Array.isArray(replacedComponents)
        ? replacedComponents.map(String)
        : typeof replacedComponents === 'string' && replacedComponents
        ? [replacedComponents]
        : [],
      replacedDetails: Array.isArray(replacedDetails)
        ? replacedDetails.map((d: any) => ({
            name: String(d.name),
            status: d.status === 'UNKNOWN' ? 'UNKNOWN' : 'GENUINE',
          }))
        : undefined,
      partIds: Array.isArray(partIds) ? partIds.map(Number) : [],
    });

    const formattedReplacedComponents = breakdown.replacedComponents && breakdown.replacedComponents.length > 0
      ? breakdown.replacedComponents.join(', ')
      : Array.isArray(replacedComponents)
      ? replacedComponents.filter(Boolean).join(', ')
      : typeof replacedComponents === 'string' && replacedComponents.trim()
      ? replacedComponents.trim()
      : null;

    // Associa automaticamente a loja do usuário autenticado
    const storeId = req.user?.id || null;

    // Salva no banco de dados com snapshots de valores
    const evaluation = await prisma.evaluation.create({
      data: {
        variantId: breakdown.variantId,
        storeId,
        modelName: breakdown.modelName,
        capacityName: breakdown.capacity,
        grade: breakdown.effectiveGrade,
        hasReplacedPart: breakdown.hasReplacedPart,
        replacedComponents: breakdown.hasReplacedPart ? formattedReplacedComponents : null,
        replacedComponentsStatus: breakdown.hasReplacedPart ? breakdown.replacedComponentsStatus : null,
        unknownPartsCount: breakdown.hasReplacedPart ? breakdown.unknownPartsCount : 0,
        unknownPartsDeduction: breakdown.hasReplacedPart ? breakdown.unknownPartsDeduction : 0,
        basePriceGradeA: breakdown.basePriceGradeA,
        gradeDiscount: breakdown.gradeDiscount,
        totalPartsDeduction: breakdown.totalPartsDeduction,
        finalValue: breakdown.finalValue,
        suggestedPurchasePrice: breakdown.suggestedPurchasePrice,
        suggestedSellingPrice: breakdown.suggestedSellingPrice,
        customerName: customerName ? String(customerName).trim() : null,
        notes: notes ? String(notes).trim() : null,
        // Dados de Trade-in / Orçamento
        targetDeviceName: tradeIn?.targetDeviceName ? String(tradeIn.targetDeviceName).trim() : null,
        targetDeviceValue: tradeIn?.targetDeviceValue != null ? Number(tradeIn.targetDeviceValue) : null,
        tradeInDifference: tradeIn?.tradeInDifference != null ? Number(tradeIn.tradeInDifference) : null,
        paymentMethod: tradeIn?.paymentMethod ? String(tradeIn.paymentMethod).trim() : null,
        paymentMethodLabel: tradeIn?.paymentMethodLabel ? String(tradeIn.paymentMethodLabel).trim() : null,
        installments: tradeIn?.installments != null ? Number(tradeIn.installments) : null,
        paymentFeeRate: tradeIn?.paymentFeeRate != null ? Number(tradeIn.paymentFeeRate) : null,
        paymentFeeAmount: tradeIn?.paymentFeeAmount != null ? Number(tradeIn.paymentFeeAmount) : null,
        finalTradeInValue: tradeIn?.finalTradeInValue != null ? Number(tradeIn.finalTradeInValue) : null,
        installmentValue: tradeIn?.installmentValue != null ? Number(tradeIn.installmentValue) : null,
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
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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

// GET /api/evaluations - List evaluations history (Multi-Tenant)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isStoreUser = req.user?.role === 'STORE';
    const storeFilter = req.query.storeId ? String(req.query.storeId) : undefined;

    // Se for Loja, filtra estritamente as avaliações da sua própria loja
    // Se for Master, pode listar todas ou filtrar por uma loja selecionada
    const whereClause: any = {};
    if (isStoreUser) {
      whereClause.storeId = req.user!.id;
    } else if (storeFilter && storeFilter !== 'ALL') {
      whereClause.storeId = storeFilter;
    }

    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: { model: true },
        },
        parts: true,
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    res.json(evaluations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar histórico de avaliações.' });
  }
});

// GET /api/evaluations/:id - Get single evaluation details
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        variant: {
          include: { model: true },
        },
        parts: true,
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    // Validação de isolamento: se usuário for STORE, não pode abrir avaliação de outra loja
    if (req.user?.role === 'STORE' && evaluation.storeId && evaluation.storeId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso não permitido a esta avaliação.' });
    }

    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/evaluations/:id - Delete an evaluation
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.evaluation.findUnique({
      where: { id },
      select: { id: true, storeId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    // Se usuário for STORE, só pode excluir avaliações de sua própria loja
    if (req.user?.role === 'STORE' && existing.storeId && existing.storeId !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir avaliações de outras lojas.' });
    }

    await prisma.evaluation.delete({
      where: { id },
    });
    res.json({ message: 'Avaliação excluída com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir avaliação.' });
  }
});

export default router;
