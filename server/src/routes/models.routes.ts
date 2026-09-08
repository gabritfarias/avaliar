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

// POST /api/models - Create a new model
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, order } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Nome do modelo é obrigatório.' });
    }

    const count = await prisma.model.count();
    const newModel = await prisma.model.create({
      data: {
        name: name.trim(),
        order: order !== undefined ? Number(order) : count + 1,
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

export default router;
