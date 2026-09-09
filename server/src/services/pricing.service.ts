import { prisma } from '../prisma';

export interface CalculationInput {
  variantId: number;
  grade: 'A' | 'B' | 'C';
  hasReplacedPart: boolean;
  partIds?: number[];
}

export interface PartDeduction {
  id: number;
  name: string;
  cost: number;
}

export interface CalculationBreakdown {
  variantId: number;
  modelId: number;
  modelName: string;
  capacity: string;
  basePriceGradeA: number;
  requestedGrade: 'A' | 'B' | 'C';
  effectiveGrade: 'A' | 'B' | 'C';
  hasReplacedPart: boolean;
  forcedGradeC: boolean;
  gradeDiscountBSetting: number;
  gradeDiscountCSetting: number;
  gradeDiscount: number;
  priceAfterGrade: number;
  parts: PartDeduction[];
  totalPartsDeduction: number;
  finalValue: number;
  suggestedSellingPrice: number;
}

export async function getGradeSettings() {
  const settings = await prisma.gradeSetting.findMany();
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));

  const discountB = settingMap.get('discount_grade_b') ?? 100;
  const discountC = settingMap.get('discount_grade_c') ?? 200;

  return { discountB, discountC, raw: settings };
}

export async function calculateEvaluation(input: CalculationInput): Promise<CalculationBreakdown> {
  const { variantId, hasReplacedPart, partIds = [] } = input;

  // 1. Fetch Variant with Model
  const variant = await prisma.variant.findUnique({
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
  const effectiveGrade: 'A' | 'B' | 'C' = forcedGradeC ? 'C' : input.grade;

  // 4. Determina o desconto da grade
  let gradeDiscount = 0;
  if (effectiveGrade === 'B') {
    gradeDiscount = discountB;
  } else if (effectiveGrade === 'C') {
    gradeDiscount = discountC;
  }

  const basePriceGradeA = variant.priceGradeA;
  const priceAfterGrade = Math.max(0, basePriceGradeA - gradeDiscount);

  // 5. Abatimento de peças selecionadas
  let partsList: PartDeduction[] = [];
  if (partIds.length > 0) {
    const partsInDb = await prisma.part.findMany({
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

  // 7. Valor Sugerido para Venda: valor base com grade acrescido de R$ 500,00 de margem (independente de peças)
  const suggestedSellingPrice = priceAfterGrade + 500;

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
    suggestedSellingPrice,
  };
}
