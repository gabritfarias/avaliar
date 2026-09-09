import { prisma } from '../prisma';
import { execSync } from 'child_process';

async function testSeedSafety() {
  console.log('🧪 Iniciando teste de segurança do seed (idempotência e não-sobrescrita)...');

  // 1. Obter uma variante existente (ex: iPhone 12)
  const variant = await prisma.variant.findFirst({
    where: { model: { name: 'iPhone 12' } },
  });
  if (!variant) throw new Error('Variante iPhone 12 não encontrada para o teste');

  const originalPrice = variant.priceGradeA;
  const testModifiedPrice = 9999;

  // 2. Simular alteração de preço pelo Administrador
  console.log(`1. Alterando preço da variante de R$ ${originalPrice} para R$ ${testModifiedPrice}...`);
  await prisma.variant.update({
    where: { id: variant.id },
    data: { priceGradeA: testModifiedPrice },
  });

  // 3. Simular alteração da configuração de Grade B pelo Administrador
  const gradeBSetting = await prisma.gradeSetting.findUnique({
    where: { key: 'discount_grade_b' },
  });
  const originalGradeBDiscount = gradeBSetting?.value ?? 100;
  const testGradeBDiscount = 175;

  console.log(`2. Alterando desconto Grade B de R$ ${originalGradeBDiscount} para R$ ${testGradeBDiscount}...`);
  await prisma.gradeSetting.update({
    where: { key: 'discount_grade_b' },
    data: { value: testGradeBDiscount },
  });

  // 4. Executar o script de seed
  console.log('3. Executando npm run seed...');
  const seedOutput = execSync('npm run seed', { encoding: 'utf8' });
  console.log('Saída do seed:\n', seedOutput);

  // 5. Verificar se as alterações do Administrador foram 100% PRESERVADAS
  const checkVariant = await prisma.variant.findUnique({
    where: { id: variant.id },
  });
  console.log('4. Verificando preço após seed:', checkVariant?.priceGradeA, `(Esperado: ${testModifiedPrice})`);
  if (checkVariant?.priceGradeA !== testModifiedPrice) {
    throw new Error(`FALHA: O seed sobrescreveu o preço alterado pelo Administrador! Atual: ${checkVariant?.priceGradeA}, Esperado: ${testModifiedPrice}`);
  }

  const checkGradeB = await prisma.gradeSetting.findUnique({
    where: { key: 'discount_grade_b' },
  });
  console.log('5. Verificando desconto Grade B após seed:', checkGradeB?.value, `(Esperado: ${testGradeBDiscount})`);
  if (checkGradeB?.value !== testGradeBDiscount) {
    throw new Error(`FALHA: O seed sobrescreveu a configuração de Grade B! Atual: ${checkGradeB?.value}, Esperado: ${testGradeBDiscount}`);
  }

  // 6. Restaurar dados originais
  console.log('6. Restaurando valores originais...');
  await prisma.variant.update({
    where: { id: variant.id },
    data: { priceGradeA: originalPrice },
  });
  await prisma.gradeSetting.update({
    where: { key: 'discount_grade_b' },
    data: { value: originalGradeBDiscount },
  });

  console.log('✅ PASS: O seed é seguro, idempotente e NÃO sobrescreve dados de catálogo, preços ou configurações existentes!');
}

testSeedSafety()
  .catch((e) => {
    console.error('❌ Teste de segurança do seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
