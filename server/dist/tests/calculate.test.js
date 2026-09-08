"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../prisma");
const pricing_service_1 = require("../services/pricing.service");
async function runTests() {
    console.log('🧪 Iniciando testes das regras de negócio e persistência...\n');
    let passed = 0;
    let failed = 0;
    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        }
        else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }
    try {
        // Buscar iPhone 12 128GB
        const iphone12 = await prisma_1.prisma.model.findUnique({
            where: { name: 'iPhone 12' },
            include: { variants: true, parts: true },
        });
        if (!iphone12)
            throw new Error('iPhone 12 não encontrado no banco!');
        const var128 = iphone12.variants.find((v) => v.capacity === '128GB');
        if (!var128)
            throw new Error('iPhone 12 128GB não encontrado!');
        console.log(`Testando com ${iphone12.name} ${var128.capacity} (Preço Grade A = R$ ${var128.priceGradeA})`);
        // Teste 1: Grade A sem peças
        const resA = await (0, pricing_service_1.calculateEvaluation)({
            variantId: var128.id,
            grade: 'A',
            hasReplacedPart: false,
            partIds: [],
        });
        assert(resA.effectiveGrade === 'A', 'Grade efetiva deve ser A');
        assert(resA.gradeDiscount === 0, 'Desconto Grade A deve ser 0');
        assert(resA.finalValue === var128.priceGradeA, `Valor final deve ser ${var128.priceGradeA}`);
        // Teste 2: Grade B sem peças
        const resB = await (0, pricing_service_1.calculateEvaluation)({
            variantId: var128.id,
            grade: 'B',
            hasReplacedPart: false,
            partIds: [],
        });
        assert(resB.effectiveGrade === 'B', 'Grade efetiva deve ser B');
        assert(resB.gradeDiscount === 100, 'Desconto padrão Grade B deve ser 100');
        assert(resB.finalValue === var128.priceGradeA - 100, `Valor final Grade B deve ser ${var128.priceGradeA - 100}`);
        // Teste 3: Grade C sem peças
        const resC = await (0, pricing_service_1.calculateEvaluation)({
            variantId: var128.id,
            grade: 'C',
            hasReplacedPart: false,
            partIds: [],
        });
        assert(resC.effectiveGrade === 'C', 'Grade efetiva deve ser C');
        assert(resC.gradeDiscount === 200, 'Desconto padrão Grade C deve ser 200');
        assert(resC.finalValue === var128.priceGradeA - 200, `Valor final Grade C deve ser ${var128.priceGradeA - 200}`);
        // Teste 4: Flag de Peça Trocada força Grade C
        const resForcedC = await (0, pricing_service_1.calculateEvaluation)({
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
        if (!bateria || !tela)
            throw new Error('Peças não encontradas no iPhone 12');
        const resParts = await (0, pricing_service_1.calculateEvaluation)({
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
        const savedEval = await prisma_1.prisma.evaluation.create({
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
        await prisma_1.prisma.evaluation.delete({ where: { id: savedEval.id } });
        console.log('🧹 Avaliação temporária de teste removida.');
        console.log(`\n================================`);
        console.log(`Resultados: ${passed} passaram, ${failed} falharam.`);
        console.log(`================================\n`);
        if (failed > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error('Erro durante os testes:', error);
        process.exit(1);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
runTests();
