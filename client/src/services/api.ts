import {
  Model,
  GradeSettings,
  CalculationBreakdown,
  Evaluation,
  Variant,
  Part,
  User,
  StoreSummary,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';

const TOKEN_KEY = 'iavalia_token';
const USER_KEY = 'iavalia_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getAuthHeaders(hasBody = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function handleUnauthorized(res: Response) {
  if (res.status === 401) {
    clearAuthSession();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
}

// ================= AUTH API =================

export async function login(credentials: { email?: string; username?: string; password: string }): Promise<{ token: string; user: User }> {
  const payload = {
    email: credentials.email || credentials.username,
    username: credentials.username || credentials.email,
    password: credentials.password,
  };
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao realizar login');
  }

  const data = await res.json();
  setAuthSession(data.token, data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Falha ao autenticar usuário');
  }

  const data = await res.json();
  return data.user;
}

export async function fetchStores(): Promise<StoreSummary[]> {
  const res = await fetch(`${API_BASE}/auth/stores`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Falha ao carregar lista de lojas');
  }

  return res.json();
}

// ================= MODELS & CATALOG API =================

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_BASE}/models`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Falha ao carregar modelos');
  }
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
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar modelo');
  }
  return res.json();
}

export async function deleteModel(id: number): Promise<{ message: string; deletedId: number }> {
  const res = await fetch(`${API_BASE}/models/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao excluir modelo');
  }
  return res.json();
}

export async function updateVariantPrice(variantId: number, priceGradeA: number): Promise<Variant> {
  const res = await fetch(`${API_BASE}/models/variants/${variantId}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ priceGradeA }),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar preço da capacidade');
  }
  return res.json();
}

export async function addVariant(modelId: number, capacity: string, priceGradeA: number): Promise<Variant> {
  const res = await fetch(`${API_BASE}/models/${modelId}/variants`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ capacity, priceGradeA }),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao adicionar capacidade');
  }
  return res.json();
}

export async function deleteVariant(variantId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/models/variants/${variantId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao remover capacidade');
  }
}

// ================= GRADE SETTINGS API =================

export async function fetchGradeSettings(): Promise<GradeSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Falha ao carregar configurações de grade');
  }
  return res.json();
}

export async function updateGradeSettings(data: { discountB: number; discountC: number }): Promise<{ message: string; settings: GradeSettings }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar configurações');
  }
  return res.json();
}

// ================= PARTS API =================

export async function addPart(modelId: number, name: string, cost: number): Promise<Part> {
  const res = await fetch(`${API_BASE}/parts`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ modelId, name, cost }),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao adicionar peça');
  }
  return res.json();
}

export async function updatePart(partId: number, data: { name?: string; cost?: number }): Promise<Part> {
  const res = await fetch(`${API_BASE}/parts/${partId}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar peça');
  }
  return res.json();
}

export async function deletePart(partId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/parts/${partId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao remover peça');
  }
}

// ================= EVALUATIONS API =================

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
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
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
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao salvar avaliação');
  }
  return res.json();
}

export async function fetchEvaluations(storeId?: string): Promise<Evaluation[]> {
  const url = storeId && storeId !== 'ALL'
    ? `${API_BASE}/evaluations?storeId=${encodeURIComponent(storeId)}`
    : `${API_BASE}/evaluations`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Falha ao buscar histórico de avaliações');
  }
  return res.json();
}

export async function deleteEvaluation(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/evaluations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao excluir avaliação');
  }
}
