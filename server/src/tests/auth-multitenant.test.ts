import { prisma } from '../prisma';

async function runTests() {
  console.log('🧪 Iniciando testes de Autenticação e Multi-Tenant...');

  const BASE_URL = 'http://localhost:3001/api';

  // 1. Teste de login com senha incorreta
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin', password: 'wrongpassword' }),
  });
  console.log('1. Login com credenciais incorretas status:', badLoginRes.status, '(Esperado: 401)');
  if (badLoginRes.status !== 401) throw new Error('Deveria ter retornado 401');

  // 2. Teste de login Master
  const masterLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin', password: 'Fa21689100' }),
  });
  const masterData: any = await masterLoginRes.json();
  console.log('2. Login Master status:', masterLoginRes.status, 'Role:', masterData.user?.role, '(Esperado: MASTER)');
  if (masterData.user?.role !== 'MASTER') throw new Error('Role do Master incorreta');

  // 3. Teste de login Loja 1 (phonemix_centro)
  const storeLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'phonemix_centro', password: '123' }),
  });
  const storeData: any = await storeLoginRes.json();
  console.log('3. Login Loja 1 status:', storeLoginRes.status, 'Role:', storeData.user?.role, '(Esperado: STORE)');
  if (storeData.user?.role !== 'STORE') throw new Error('Role da Loja incorreta');

  // 4. Teste de requisição sem token em rota protegida
  const unauthRes = await fetch(`${BASE_URL}/models`);
  console.log('4. Acesso sem token em /models:', unauthRes.status, '(Esperado: 401)');
  if (unauthRes.status !== 401) throw new Error('Deveria ter bloqueado com 401');

  // 5. Teste de Loja tentando criar modelo (restrito a Master)
  const storeCreateModelRes = await fetch(`${BASE_URL}/models`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeData.token}`,
    },
    body: JSON.stringify({ name: 'iPhone Hacker Test' }),
  });
  console.log('5. Loja tentando criar modelo:', storeCreateModelRes.status, '(Esperado: 403 Forbidden)');
  if (storeCreateModelRes.status !== 403) throw new Error('Deveria ter bloqueado com 403');

  // 6. Teste de criação de avaliação vinculada à Loja 1
  const variant = await prisma.variant.findFirst({
    include: { model: true },
  });
  if (!variant) throw new Error('Nenhuma variante encontrada');

  const createEvalRes = await fetch(`${BASE_URL}/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeData.token}`,
    },
    body: JSON.stringify({
      variantId: variant.id,
      grade: 'B',
      hasReplacedPart: true,
      replacedComponents: ['Bateria'],
      replacedDetails: [{ name: 'Bateria', status: 'GENUINE' }],
      partIds: [],
      customerName: 'Cliente Teste Multi-Tenant',
      notes: 'Avaliado pela Loja 1',
    }),
  });
  const evalCreated: any = await createEvalRes.json();
  console.log('6. Criação de avaliação pela Loja 1:', createEvalRes.status, 'storeId gravado:', evalCreated.evaluation?.storeId, '(Esperado:', storeData.user.id, ')');
  if (evalCreated.evaluation?.storeId !== storeData.user.id) {
    throw new Error('storeId não corresponde ao usuário da loja logada!');
  }

  // 7. Teste de login Loja 2 (phonemix_premio)
  const store2LoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'phonemix_premio', password: '123' }),
  });
  const store2Data: any = await store2LoginRes.json();

  // Loja 2 buscando histórico: NÃO deve ver a avaliação criada pela Loja 1
  const store2EvalsRes = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${store2Data.token}` },
  });
  const store2Evals: any = await store2EvalsRes.json();
  const foundInStore2 = store2Evals.some((ev: any) => ev.id === evalCreated.evaluation.id);
  console.log('7. Loja 2 vê avaliação da Loja 1?', foundInStore2, '(Esperado: false - isolamento total)');
  if (foundInStore2) throw new Error('Falha de isolamento Multi-Tenant: Loja 2 viu avaliação da Loja 1!');

  // 8. Master buscando histórico: DEVE ver a avaliação da Loja 1
  const masterEvalsRes = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${masterData.token}` },
  });
  const masterEvals: any = await masterEvalsRes.json();
  const foundInMaster = masterEvals.some((ev: any) => ev.id === evalCreated.evaluation.id);
  console.log('8. Master vê avaliação da Loja 1?', foundInMaster, '(Esperado: true - visão consolidada)');
  if (!foundInMaster) throw new Error('Master não conseguiu visualizar a avaliação criada pela loja!');

  // Limpeza da avaliação de teste
  await prisma.evaluation.delete({ where: { id: evalCreated.evaluation.id } });

  console.log('🎉 TODOS OS TESTES DE AUTENTICAÇÃO E MULTI-TENANT PASSARAM COM SUCESSO!');
}

runTests()
  .catch((e) => {
    console.error('❌ Testes falharam:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
