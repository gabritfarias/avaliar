import { Model, GradeSettings, CalculationBreakdown, Evaluation, Variant, Part } from '../types';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Falha ao carregar modelos');
  return res.json();
}

export async function createModel(data: {
  name: string;
  order?: number;
  variants?: Array<{ capacity: string; priceGradeA: number }>;
  createDefaultParts?: boolean;
}): Promise<Model> {
  const res = await fetch(`${API_BASE}/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar modelo');
  }
  return res.json();
}

export async function deleteModel(id: number): Promise<{ message: string; deletedId: number }> {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao excluir modelo');
  }
  return res.json();
}

export async function fetchGradeSettings(): Promise<GradeSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Falha ao carregar configurações de grade');
  return res.json();
}

export async function updateGradeSettings(data: { discountB: number; discountC: number }): Promise<{ message: string; settings: GradeSettings }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar configurações');
  }
  return res.json();
}

export async function updateVariantPrice(variantId: number, priceGradeA: number): Promise<Variant> {
  const res = await fetch(`${API_BASE}/models/variants/${variantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceGradeA }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar preço da capacidade');
  }
  return res.json();
}

export async function addVariant(modelId: number, capacity: string, priceGradeA: number): Promise<Variant> {
  const res = await fetch(`${API_BASE}/models/${modelId}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity, priceGradeA }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao adicionar capacidade');
  }
  return res.json();
}

export async function deleteVariant(variantId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/models/variants/${variantId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao remover capacidade');
  }
}

export async function addPart(modelId: number, name: string, cost: number): Promise<Part> {
  const res = await fetch(`${API_BASE}/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, name, cost }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao adicionar peça');
  }
  return res.json();
}

export async function updatePart(partId: number, data: { name?: string; cost?: number }): Promise<Part> {
  const res = await fetch(`${API_BASE}/parts/${partId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar peça');
  }
  return res.json();
}

export async function deletePart(partId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/parts/${partId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao remover peça');
  }
}

export async function calculateEvaluation(data: {
  variantId: number;
  grade: 'A' | 'B' | 'C';
  hasReplacedPart: boolean;
  replacedComponents?: string[];
  replacedDetails?: Array<{ name: string; status: 'GENUINE' | 'UNKNOWN' }>;
  partIds: number[];
}): Promise<CalculationBreakdown> {
  const res = await fetch(`${API_BASE}/evaluations/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao calcular avaliação');
  }
  return res.json();
}

export async function saveEvaluation(data: {
  variantId: number;
  grade: 'A' | 'B' | 'C';
  hasReplacedPart: boolean;
  replacedComponents?: string[];
  replacedDetails?: Array<{ name: string; status: 'GENUINE' | 'UNKNOWN' }>;
  partIds: number[];
  customerName?: string;
  notes?: string;
}): Promise<{ message: string; evaluation: Evaluation; breakdown: CalculationBreakdown }> {
  const res = await fetch(`${API_BASE}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao salvar avaliação');
  }
  return res.json();
}

export async function fetchEvaluations(): Promise<Evaluation[]> {
  const res = await fetch(`${API_BASE}/evaluations`);
  if (!res.ok) throw new Error('Falha ao buscar histórico de avaliações');
  return res.json();
}

export async function deleteEvaluation(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/evaluations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao excluir avaliação');
  }
}
