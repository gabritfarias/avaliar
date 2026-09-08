"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const pricing_service_1 = require("../services/pricing.service");
const router = (0, express_1.Router)();
// GET /api/settings
router.get('/', async (_req, res) => {
    try {
        const settings = await (0, pricing_service_1.getGradeSettings)();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Erro ao buscar configurações.' });
    }
});
// PUT /api/settings
router.put('/', async (req, res) => {
    try {
        const { discountB, discountC } = req.body;
        if (discountB !== undefined) {
            const numB = Number(discountB);
            if (isNaN(numB) || numB < 0) {
                return res.status(400).json({ error: 'O desconto da Grade B deve ser um número maior ou igual a zero.' });
            }
            await prisma_1.prisma.gradeSetting.upsert({
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
            await prisma_1.prisma.gradeSetting.upsert({
                where: { key: 'discount_grade_c' },
                update: { value: numC },
                create: { key: 'discount_grade_c', value: numC, description: 'Desconto aplicado para aparelhos Grade C (R$)' },
            });
        }
        const updated = await (0, pricing_service_1.getGradeSettings)();
        res.json({ message: 'Configurações atualizadas com sucesso!', settings: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Erro ao atualizar configurações.' });
    }
});
exports.default = router;
