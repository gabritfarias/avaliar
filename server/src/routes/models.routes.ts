import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/models - List all models with variants and parts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const models = await prisma.model.findMany({
      orderBy: { order: 'asc' },
      include: {
        variants: {
          orderBy: { priceGradeA: 'asc' },
        },
        parts: {
          orderBy: { name: 'asc' },
        },
      },
    });
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao listar modelos.' });
  }
});

// GET /api/models/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { priceGradeA: 'asc' } },
        parts: { orderBy: { name: 'asc' } },
      },
    });
    if (!model) return res.status(404).json({ error: 'Modelo não encontrado.' });
    res.json(model);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/models - Create a new model with variants and default parts
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, order, variants, createDefaultParts = true } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Nome do modelo é obrigatório.' });
    }

    const trimmedName = name.trim();

    // Validação case-insensitive de duplicidade
    const existing = await prisma.model.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: `Já existe um modelo cadastrado com o nome "${trimmedName}".` });
    }

    const count = await prisma.model.count();

    // Prepara variantes (pelo menos uma capacidade inicial se fornecida)
    const initialVariants: Array<{ capacity: string; priceGradeA: number }> = [];
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (v.capacity && typeof v.capacity === 'string' && v.priceGradeA !== undefined) {
          const price = Number(v.priceGradeA);
          if (!isNaN(price) && price >= 0) {
            initialVariants.push({
              capacity: v.capacity.trim().toUpperCase(),
              priceGradeA: price,
            });
          }
        }
      }
    }

    // Se nenhuma variante válida foi fornecida, cria uma padrão de 128GB com R$ 1.000
    if (initialVariants.length === 0) {
      initialVariants.push({ capacity: '128GB', priceGradeA: 1000 });
    }

    // Conjunto padrão de peças com valores placeholder realistas
    const defaultParts = createDefaultParts
      ? [
          { name: 'Bateria', cost: 250 },
          { name: 'Tela / Display', cost: 600 },
          { name: 'Câmera Traseira', cost: 350 },
          { name: 'Conector de Carga', cost: 180 },
          { name: 'Tampa Traseira (Vidro)', cost: 200 },
          { name: 'Face ID / Câmera Frontal', cost: 250 },
        ]
      : [];

    const newModel = await prisma.model.create({
      data: {
        name: trimmedName,
        order: order !== undefined ? Number(order) : count + 1,
        variants: {
          create: initialVariants,
        },
        parts: {
          create: defaultParts,
        },
      },
      include: {
        variants: { orderBy: { priceGradeA: 'asc' } },
        parts: { orderBy: { name: 'asc' } },
      },
    });

    res.status(201).json(newModel);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe um modelo com este nome.' });
    }
    res.status(500).json({ error: error.message || 'Erro ao criar modelo.' });
  }
});

// POST /api/models/:id/variants - Add a capacity variant to a model
router.post('/:id/variants', async (req: Request, res: Response) => {
  try {
    const modelId = Number(req.params.id);
    const { capacity, priceGradeA } = req.body;

    if (!capacity || typeof capacity !== 'string' || capacity.trim() === '') {
      return res.status(400).json({ error: 'Capacidade é obrigatória (ex: 128GB).' });
    }

    const price = Number(priceGradeA);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Preço da Grade A deve ser um número válido e não negativo.' });
    }

    const variant = await prisma.variant.create({
      data: {
        modelId,
        capacity: capacity.trim().toUpperCase(),
        priceGradeA: price,
      },
    });

    res.status(201).json(variant);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Esta capacidade já está cadastrada para este modelo.' });
    }
    res.status(500).json({ error: error.message || 'Erro ao adicionar capacidade.' });
  }
});

// PUT /api/variants/:id - Update variant price or capacity
router.put('/variants/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { capacity, priceGradeA } = req.body;

    const data: any = {};
    if (capacity !== undefined) {
      if (typeof capacity !== 'string' || capacity.trim() === '') {
        return res.status(400).json({ error: 'Capacidade inválida.' });
      }
      data.capacity = capacity.trim().toUpperCase();
    }

    if (priceGradeA !== undefined) {
      const price = Number(priceGradeA);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Preço da Grade A deve ser maior ou igual a zero.' });
      }
      data.priceGradeA = price;
    }

    const updated = await prisma.variant.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar variante.' });
  }
});

// DELETE /api/variants/:id - Delete a capacity variant
router.delete('/variants/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.variant.delete({
      where: { id },
    });
    res.json({ message: 'Capacidade removida com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover capacidade.' });
  }
});

// DELETE /api/models/:id - Delete a model and its cascading variants/parts while preserving evaluation history
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!model) {
      return res.status(404).json({ error: 'Modelo não encontrado.' });
    }

    // 1. Preservar o histórico das avaliações que utilizaram as variantes deste modelo
    // Garante que modelName e capacityName fiquem gravados permanentemente no registro da avaliação
    if (model.variants.length > 0) {
      for (const variant of model.variants) {
        await prisma.evaluation.updateMany({
          where: { variantId: variant.id },
          data: {
            modelName: model.name,
            capacityName: variant.capacity,
            variantId: null,
          },
        });
      }
    }

    // 2. Exclui o modelo (onDelete: Cascade remove automaticamente suas variantes e peças)
    await prisma.model.delete({
      where: { id },
    });

    res.json({
      message: `Modelo "${model.name}" e todas as suas peças e capacidades foram removidos com sucesso. O histórico de avaliações foi preservado.`,
      deletedId: id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir modelo.' });
  }
});

export default router;
