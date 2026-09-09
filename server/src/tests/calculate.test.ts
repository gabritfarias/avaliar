import { prisma } from '../prisma';
import { calculateEvaluation } from '../services/pricing.service';

async function runTests() {
  console.log('🧪 Iniciando testes das regras de negócio e persistência...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Buscar iPhone 12 128GB
    const iphone12 = await prisma.model.findUnique({
      where: { name: 'iPhone 12' },
      include: { variants: true, parts: true },
    });

    if (!iphone12) throw new Error('iPhone 12 não encontrado no banco!');
    const var128 = iphone12.variants.find((v) => v.capacity === '128GB');
    if (!var128) throw new Error('iPhone 12 128GB não encontrado!');

    console.log(`Testando com ${iphone12.name} ${var128.capacity} (Preço Grade A = R$ ${var128.priceGradeA})`);

    // Teste 1: Grade A sem peças
    const resA = await calculateEvaluation({
      variantId: var128.id,
      grade: 'A',
      hasReplacedPart: false,
      partIds: [],
    });
    assert(resA.effectiveGrade === 'A', 'Grade efetiva deve ser A');
    assert(resA.gradeDiscount === 0, 'Desconto Grade A deve ser 0');
    assert(resA.finalValue === var128.priceGradeA, `Valor final deve ser ${var128.priceGradeA}`);

    // Teste 2: Grade B sem peças
    const resB = await calculateEvaluation({
      variantId: var128.id,
      grade: 'B',
      hasReplacedPart: false,
      partIds: [],
    });
    assert(resB.effectiveGrade === 'B', 'Grade efetiva deve ser B');
    assert(resB.gradeDiscount === 100, 'Desconto padrão Grade B deve ser 100');
    assert(resB.finalValue === var128.priceGradeA - 100, `Valor final Grade B deve ser ${var128.priceGradeA - 100}`);

    // Teste 3: Grade C sem peças
    const resC = await calculateEvaluation({
      variantId: var128.id,
      grade: 'C',
      hasReplacedPart: false,
      partIds: [],
    });
    assert(resC.effectiveGrade === 'C', 'Grade efetiva deve ser C');
    assert(resC.gradeDiscount === 200, 'Desconto padrão Grade C deve ser 200');
    assert(resC.finalValue === var128.priceGradeA - 200, `Valor final Grade C deve ser ${var128.priceGradeA - 200}`);

    // Teste 4: Flag de Peça Trocada força Grade C
    const resForcedC = await calculateEvaluation({
      variantId: var128.id,
      grade: 'A', // Selecionou A, mas tem mensagem de peça trocada!
      hasReplacedPart: true,
      partIds: [],
    });
    assert(resForcedC.effectiveGrade === 'C', 'Aparelho com mensagem de peça trocada DEVE ter Grade C');
    assert(resForcedC.forcedGradeC === true, 'forcedGradeC deve ser true');
    assert(resForcedC.gradeDiscount === 200, 'Desconto aplicado deve ser da Grade C (200)');
    assert(resForcedC.finalValue === var128.priceGradeA - 200, 'Valor final deve refletir Grade C');

    // Teste 5: Abatimento de Múltiplas Peças
    const bateria = iphone12.parts.find((p) => p.name === 'Bateria');
    const tela = iphone12.parts.find((p) => p.name.includes('Tela'));
    if (!bateria || !tela) throw new Error('Peças não encontradas no iPhone 12');

    const resParts = await calculateEvaluation({
      variantId: var128.id,
      grade: 'A',
      hasReplacedPart: false,
      partIds: [bateria.id, tela.id],
    });
    const expectedPartsCost = bateria.cost + tela.cost;
    assert(resParts.parts.length === 2, 'Deve ter 2 peças abatidas');
    assert(resParts.totalPartsDeduction === expectedPartsCost, `Custo total das peças deve ser ${expectedPartsCost}`);
    assert(resParts.finalValue === var128.priceGradeA - expectedPartsCost, `Valor final deve ser ${var128.priceGradeA - expectedPartsCost}`);

    // Teste 6: Persistência no Banco de Dados
    const savedEval = await prisma.evaluation.create({
      data: {
        variantId: var128.id,
        grade: resParts.effectiveGrade,
        hasReplacedPart: false,
        basePriceGradeA: resParts.basePriceGradeA,
        gradeDiscount: resParts.gradeDiscount,
        totalPartsDeduction: resParts.totalPartsDeduction,
        finalValue: resParts.finalValue,
        customerName: 'Cliente Teste Automatizado',
        notes: 'Avaliação de teste',
        parts: {
          create: resParts.parts.map((p) => ({
            partId: p.id,
            partName: p.name,
            cost: p.cost,
          })),
        },
      },
      include: { parts: true },
    });

    assert(savedEval.id > 0, 'Avaliação deve ter sido gravada com ID positivo');
    assert(savedEval.parts.length === 2, 'Avaliação deve ter gravado as 2 peças históricas');

    // Limpeza do teste de persistência
    await prisma.evaluation.delete({ where: { id: savedEval.id } });
    console.log('🧹 Avaliação temporária de teste removida.');

    // Teste 7: Gestão Completa de Modelos (Criar, Avaliar, Excluir em cascata e Preservar Histórico)
    console.log('\n--- Teste 7: Inclusão e Exclusão de Modelo com Sincronização de Peças e Histórico ---');
    
    // Limpeza prévia se existir resíduo de teste anterior
    await prisma.model.deleteMany({ where: { name: 'iPhone Teste Especial' } });

    // 7.1 Criação do modelo com capacidades e peças padrão
    const createdModel = await prisma.model.create({
      data: {
        name: 'iPhone Teste Especial',
        order: 999,
        variants: {
          create: [
            { capacity: '128GB', priceGradeA: 2000 },
            { capacity: '256GB', priceGradeA: 2400 },
          ],
        },
        parts: {
          create: [
            { name: 'Bateria', cost: 250 },
            { name: 'Tela / Display', cost: 600 },
            { name: 'Câmera Traseira', cost: 350 },
            { name: 'Conector de Carga', cost: 180 },
            { name: 'Tampa Traseira (Vidro)', cost: 200 },
            { name: 'Face ID / Câmera Frontal', cost: 250 },
          ],
        },
      },
      include: { variants: true, parts: true },
    });

    assert(createdModel.id > 0, 'Novo modelo deve ter sido criado com ID válido');
    assert(createdModel.variants.length === 2, 'Novo modelo deve possuir as 2 capacidades cadastradas');
    assert(createdModel.parts.length === 6, 'Novo modelo deve ter as 6 peças padrão autogeradas');

    const testVariant = createdModel.variants[0];

    // 7.2 Salvar uma avaliação para este modelo
    const historyEval = await prisma.evaluation.create({
      data: {
        variantId: testVariant.id,
        modelName: createdModel.name,
        capacityName: testVariant.capacity,
        grade: 'A',
        hasReplacedPart: false,
        basePriceGradeA: testVariant.priceGradeA,
        gradeDiscount: 0,
        totalPartsDeduction: 0,
        finalValue: testVariant.priceGradeA,
        customerName: 'Cliente Preservação',
        notes: 'Verificação de retenção de histórico',
      },
    });

    assert(historyEval.id > 0, 'Avaliação histórica deve ter sido criada');

    // 7.3 Excluir o modelo com a lógica de preservação
    for (const v of createdModel.variants) {
      await prisma.evaluation.updateMany({
        where: { variantId: v.id },
        data: {
          modelName: createdModel.name,
          capacityName: v.capacity,
          variantId: { set: null },
        },
      });
    }

    await prisma.model.delete({ where: { id: createdModel.id } });

    // 7.4 Verificar que as peças e variantes do modelo foram excluídas em cascata
    const remainingVariants = await prisma.variant.findMany({ where: { modelId: createdModel.id } });
    const remainingParts = await prisma.part.findMany({ where: { modelId: createdModel.id } });
    assert(remainingVariants.length === 0, 'Variantes do modelo devem ser removidas em cascata');
    assert(remainingParts.length === 0, 'Peças do modelo devem ser removidas em cascata da aba de peças');

    // 7.5 Verificar que o histórico da avaliação foi preservado intacto
    const preservedEval = await prisma.evaluation.findUnique({ where: { id: historyEval.id } });
    assert(preservedEval !== null, 'Registro de avaliação no histórico DEVE ser preservado');
    assert(preservedEval?.variantId === null, 'variantId deve ter sido desacoplado com segurança para null');
    assert(preservedEval?.modelName === 'iPhone Teste Especial', 'modelName histórico original deve estar gravado intacto');
    assert(preservedEval?.capacityName === '128GB', 'capacityName histórica deve estar gravada intacta');
    assert(preservedEval?.finalValue === 2000, 'Valor final da avaliação histórica preservada deve ser 2000');

    // Limpeza da avaliação de teste
    await prisma.evaluation.delete({ where: { id: historyEval.id } });
    console.log('🧹 Dados de teste de ciclo de vida de modelo removidos.');

    console.log(`\n================================`);
    console.log(`Resultados: ${passed} passaram, ${failed} falharam.`);
    console.log(`================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Erro durante os testes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
