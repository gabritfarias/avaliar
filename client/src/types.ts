export interface Variant {
  id: number;
  modelId: number;
  capacity: string;
  priceGradeA: number;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: number;
  modelId: number;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: number;
  name: string;
  order: number;
  variants: Variant[];
  parts: Part[];
}

export interface GradeSettings {
  discountB: number;
  discountC: number;
  raw?: Array<{ id: number; key: string; value: number; description?: string }>;
}

export type ReplacedPartStatus = 'GENUINE' | 'UNKNOWN';

export interface ReplacedComponentDetail {
  name: string;
  status: ReplacedPartStatus;
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
  unknownPartsCount?: number;
  unknownPartsDeduction?: number;
  forcedGradeC?: boolean;
  gradeDiscountBSetting: number;
  gradeDiscountCSetting: number;
  gradeDiscount: number;
  priceAfterGrade: number;
  parts: Array<{ id: number; name: string; cost: number }>;
  totalPartsDeduction: number;
  finalValue: number;
  suggestedPurchasePrice: number;
  suggestedSellingPrice: number;
}

export type Role = 'MASTER' | 'STORE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface StoreSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface EvaluationPart {
  id: number;
  evaluationId: number;
  partId?: number | null;
  partName: string;
  cost: number;
}

export interface Evaluation {
  id: number;
  variantId?: number | null;
  variant?: (Variant & { model: Model }) | null;
  storeId?: string | null;
  store?: StoreSummary | null;
  modelName?: string | null;
  capacityName?: string | null;
  grade: 'A' | 'B' | 'C';
  hasReplacedPart: boolean;
  replacedComponents?: string | null;
  replacedComponentsStatus?: string | null;
  unknownPartsCount?: number | null;
  unknownPartsDeduction?: number | null;
  basePriceGradeA: number;
  gradeDiscount: number;
  totalPartsDeduction: number;
  finalValue: number;
  suggestedPurchasePrice?: number | null;
  suggestedSellingPrice?: number | null;
  customerName?: string | null;
  notes?: string | null;
  createdAt: string;
  parts: EvaluationPart[];
}
