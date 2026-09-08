"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGradeSettings = getGradeSettings;
exports.calculateEvaluation = calculateEvaluation;
const prisma_1 = require("../prisma");
async function getGradeSettings() {
    const settings = await prisma_1.prisma.gradeSetting.findMany();
    const settingMap = new Map(settings.map((s) => [s.key, s.value]));
    const discountB = settingMap.get('discount_grade_b') ?? 100;
    const discountC = settingMap.get('discount_grade_c') ?? 200;
    return { discountB, discountC, raw: settings };
}
async function calculateEvaluation(input) {
    const { variantId, hasReplacedPart, partIds = [] } = input;
    // 1. Fetch Variant with Model
    const variant = await prisma_1.prisma.variant.findUnique({
        where: { id: variantId },
        include: { model: true },
    });
    if (!variant) {
        throw new Error(`Variante com ID ${variantId} não encontrada.`);
    }
    // 2. Fetch Grade Settings
    const { discountB, discountC } = await getGradeSettings();
    // 3. Regra de Negócio: Se tem peça trocada, força Grade C
    const forcedGradeC = Boolean(hasReplacedPart);
    const effectiveGrade = forcedGradeC ? 'C' : input.grade;
    // 4. Determina o desconto da grade
    let gradeDiscount = 0;
    if (effectiveGrade === 'B') {
        gradeDiscount = discountB;
    }
    else if (effectiveGrade === 'C') {
        gradeDiscount = discountC;
    }
    const basePriceGradeA = variant.priceGradeA;
    const priceAfterGrade = Math.max(0, basePriceGradeA - gradeDiscount);
    // 5. Abatimento de peças selecionadas
    let partsList = [];
    if (partIds.length > 0) {
        const partsInDb = await prisma_1.prisma.part.findMany({
            where: {
                id: { in: partIds },
                modelId: variant.modelId, // Segurança: garantir que a peça pertence ao modelo avaliado
            },
        });
        partsList = partsInDb.map((p) => ({
            id: p.id,
            name: p.name,
            cost: p.cost,
        }));
    }
    const totalPartsDeduction = partsList.reduce((acc, curr) => acc + curr.cost, 0);
    // 6. Fórmula Geral: valor_final = preço_grade_selecionada - soma(custos_das_peças_marcadas)
    const finalValue = Math.max(0, priceAfterGrade - totalPartsDeduction);
    return {
        variantId: variant.id,
        modelId: variant.modelId,
        modelName: variant.model.name,
        capacity: variant.capacity,
        basePriceGradeA,
        requestedGrade: input.grade,
        effectiveGrade,
        hasReplacedPart,
        forcedGradeC,
        gradeDiscountBSetting: discountB,
        gradeDiscountCSetting: discountC,
        gradeDiscount,
        priceAfterGrade,
        parts: partsList,
        totalPartsDeduction,
        finalValue,
    };
}
