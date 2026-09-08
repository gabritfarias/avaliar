import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// POST /api/parts - Add a new part to a model
router.post('/', async (req: Request, res: Response) => {
  try {
    const { modelId, name, cost } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: 'ID do modelo é obrigatório.' });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da peça é obrigatório.' });
    }

    const partCost = Number(cost);
    if (isNaN(partCost) || partCost < 0) {
      return res.status(400).json({ error: 'O custo da peça deve ser um número maior ou igual a zero.' });
    }

    const part = await prisma.part.create({
      data: {
        modelId: Number(modelId),
        name: name.trim(),
        cost: partCost,
      },
    });

    res.status(201).json(part);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe uma peça com esse nome para este modelo.' });
    }
    res.status(500).json({ error: error.message || 'Erro ao criar peça.' });
  }
});

// PUT /api/parts/:id - Update part cost or name
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, cost } = req.body;

    const data: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Nome da peça não pode ser vazio.' });
      }
      data.name = name.trim();
    }

    if (cost !== undefined) {
      const partCost = Number(cost);
      if (isNaN(partCost) || partCost < 0) {
        return res.status(400).json({ error: 'O custo da peça deve ser maior ou igual a zero.' });
      }
      data.cost = partCost;
    }

    const updated = await prisma.part.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar peça.' });
  }
});

// DELETE /api/parts/:id - Delete a part
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.part.delete({
      where: { id },
    });
    res.json({ message: 'Peça removida com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao remover peça.' });
  }
});

export default router;
