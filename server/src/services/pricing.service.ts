import { prisma } from '../prisma';

export type ReplacedPartStatus = 'GENUINE' | 'UNKNOWN';

export interface ReplacedComponentDetail {
  name: string;
  status: ReplacedPartStatus;
}

export interface CalculationInput {
  variantId: number;
  grade: 'A' | 'B' | 'C';
  hasReplacedPart: boolean;
  replacedComponents?: string[];
  replacedDetails?: ReplacedComponentDetail[];
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
  replacedComponents?: string[];
  replacedDetails?: ReplacedComponentDetail[];
  replacedComponentsStatus?: string | null;
  unknownPartsCount: number;
  unknownPartsDeduction: number;
  forcedGradeC: boolean;
  gradeDiscountBSetting: number;
  gradeDiscountCSetting: number;
  gradeDiscount: number;
  priceAfterGrade: number;
  parts: PartDeduction[];
  totalPartsDeduction: number;
  finalValue: number;
  suggestedPurchasePrice: number;
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

  // 3. Processar detalhes de peças substituídas (Genuína vs. Desconhecida)
  let unknownPartsCount = 0;
  let replacedDetails: ReplacedComponentDetail[] = [];

  if (hasReplacedPart) {
    if (input.replacedDetails && input.replacedDetails.length > 0) {
      replacedDetails = input.replacedDetails;
      unknownPartsCount = replacedDetails.filter((d) => d.status === 'UNKNOWN').length;
    } else if (input.replacedComponents && input.replacedComponents.length > 0) {
      // Compatibilidade: inferir pelo texto
      replacedDetails = input.replacedComponents.map((item) => {
        const isUnknown = item.toLowerCase().includes('desconhecid') || item.toUpperCase().includes('UNKNOWN');
        const cleanName = item.replace(/\s*\((Desconhecida|Genuína Apple|Desconhecido|Genuíno)\)/i, '').trim();
        return {
          name: cleanName,
          status: isUnknown ? 'UNKNOWN' : 'GENUINE',
        };
      });
      unknownPartsCount = replacedDetails.filter((d) => d.status === 'UNKNOWN').length;
    }
  }

  const hasUnknownPart = hasReplacedPart && unknownPartsCount > 0;

  // Determinar status agregado
  let replacedComponentsStatus: string | null = null;
  if (hasReplacedPart) {
    if (unknownPartsCount > 0 && replacedDetails.some((d) => d.status === 'GENUINE')) {
      replacedComponentsStatus = 'Misto';
    } else if (unknownPartsCount > 0) {
      replacedComponentsStatus = 'Desconhecida';
    } else {
      replacedComponentsStatus = 'Genuína Apple';
    }
  }

  // Regra de Negócio:
  // - Peça Desconhecida: Trava automaticamente em Grade C
  // - Peça Genuína Apple: Permite escolha manual livre entre Grade B e Grade C (bloqueia Grade A)
  let effectiveGrade: 'A' | 'B' | 'C' = input.grade;
  let forcedGradeC = false;

  if (hasUnknownPart) {
    effectiveGrade = 'C';
    forcedGradeC = true;
  } else if (hasReplacedPart && effectiveGrade === 'A') {
    effectiveGrade = 'B';
  }

  // 4. Determina o desconto da grade
  let gradeDiscount = 0;
  if (effectiveGrade === 'B') {
    gradeDiscount = discountB;
  } else if (effectiveGrade === 'C') {
    gradeDiscount = discountC;
  }

  // Penalidade de Peça Desconhecida:
  // - 1 peça desconhecida: R$ 200 extra
  // - 2 ou mais peças desconhecidas: R$ 300 extra
  let unknownPartsDeduction = 0;
  if (hasUnknownPart) {
    unknownPartsDeduction = unknownPartsCount >= 2 ? 300 : 200;
  }

  const basePriceGradeA = variant.priceGradeA;
  const priceAfterGrade = Math.max(0, basePriceGradeA - gradeDiscount);

  // 5. Abatimento de peças selecionadas (reparos da loja)
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

  // 6. Base de referência após grade e penalidade de peça desconhecida
  const baseAfterUnknownDeduction = Math.max(0, priceAfterGrade - unknownPartsDeduction);

  // 7. Valor Final pago ao cliente: desconta grade, peça desconhecida e peças avariadas da loja
  const finalValue = Math.max(0, baseAfterUnknownDeduction - totalPartsDeduction);

  // 8. Valor Sugerido para Compra: reflete Grade C e peças desconhecidas (sem afetar reparos da loja)
  const suggestedPurchasePrice = baseAfterUnknownDeduction;

  // 9. Valor Sugerido para Venda: recalculado sobre a base ajustada com margem de R$ 500
  const suggestedSellingPrice = baseAfterUnknownDeduction + 500;

  // Montar lista legível de replacedComponents com indicação do status
  const formattedReplacedComponents = replacedDetails.length > 0
    ? replacedDetails.map((d) => `${d.name} (${d.status === 'UNKNOWN' ? 'Desconhecida' : 'Genuína Apple'})`)
    : input.replacedComponents || [];

  return {
    variantId: variant.id,
    modelId: variant.modelId,
    modelName: variant.model.name,
    capacity: variant.capacity,
    basePriceGradeA,
    requestedGrade: input.grade,
    effectiveGrade,
    hasReplacedPart,
    replacedComponents: formattedReplacedComponents,
    replacedDetails,
    replacedComponentsStatus,
    unknownPartsCount,
    unknownPartsDeduction,
    forcedGradeC,
    gradeDiscountBSetting: discountB,
    gradeDiscountCSetting: discountC,
    gradeDiscount,
    priceAfterGrade,
    parts: partsList,
    totalPartsDeduction,
    finalValue,
    suggestedPurchasePrice,
    suggestedSellingPrice,
  };
}
