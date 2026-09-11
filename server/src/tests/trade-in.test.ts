import { prisma } from '../prisma';

async function testTradeIn() {
  console.log('🧪 Iniciando teste de Orçamento e Fechamento (Trade-in)...');
  const BASE_URL = 'http://localhost:3001/api';

  // 1. Login como Administrador
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin', password: 'Fa21689100' }),
  });
  if (!loginRes.ok) throw new Error('Falha no login do admin');
  const loginData: any = await loginRes.json();
  const token = loginData.token;

  // 2. Buscar variante
  const variant = await prisma.variant.findFirst({
    include: { model: true },
  });
  if (!variant) throw new Error('Nenhuma variante encontrada');

  // 3. Criar avaliação com Trade-in
  const tradeInPayload = {
    targetDeviceName: 'iPhone 14 Pro Max 128GB',
    targetDeviceValue: 3100,
    tradeInDifference: 1650,
    paymentMethod: 'CREDIT_CELL',
    paymentMethodLabel: 'Crédito - Tabela Celular (10x)',
    installments: 10,
    paymentFeeRate: 0.12,
    paymentFeeAmount: 198,
    finalTradeInValue: 1848,
    installmentValue: 184.8,
  };

  const createRes = await fetch(`${BASE_URL}/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      variantId: variant.id,
      grade: 'A',
      hasReplacedPart: false,
      partIds: [],
      customerName: 'Cliente Trade-in Teste',
      notes: 'Fechamento com troca de aparelho',
      tradeIn: tradeInPayload,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`Falha ao salvar avaliação com trade-in: ${JSON.stringify(err)}`);
  }

  const createdData: any = await createRes.json();
  const evalId = createdData.evaluation.id;
  console.log('1. Avaliação criada com sucesso! ID:', evalId);

  // 4. Validar dados gravados no banco
  const dbEval = await prisma.evaluation.findUnique({
    where: { id: evalId },
  });

  if (!dbEval) throw new Error('Avaliação não encontrada no banco');
  if (dbEval.targetDeviceName !== 'iPhone 14 Pro Max 128GB') throw new Error('targetDeviceName incorreto');
  if (dbEval.targetDeviceValue !== 3100) throw new Error('targetDeviceValue incorreto');
  if (dbEval.tradeInDifference !== 1650) throw new Error('tradeInDifference incorreto');
  if (dbEval.paymentMethod !== 'CREDIT_CELL') throw new Error('paymentMethod incorreto');
  if (dbEval.installments !== 10) throw new Error('installments incorreto');
  if (dbEval.paymentFeeRate !== 0.12) throw new Error('paymentFeeRate incorreto');
  if (dbEval.paymentFeeAmount !== 198) throw new Error('paymentFeeAmount incorreto');
  if (dbEval.finalTradeInValue !== 1848) throw new Error('finalTradeInValue incorreto');
  if (dbEval.installmentValue !== 184.8) throw new Error('installmentValue incorreto');

  console.log('2. Todos os campos de Trade-in foram persistidos corretamente no banco Neon!');

  // 5. Limpar avaliação de teste
  await prisma.evaluation.delete({ where: { id: evalId } });
  console.log('3. Avaliação de teste removida.');

  console.log('🎉 TESTE DE TRADE-IN CONCLUÍDO COM SUCESSO!');
}

testTradeIn()
  .catch((e) => {
    console.error('❌ Erro no teste de trade-in:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
