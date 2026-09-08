import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ModelData {
  name: string;
  order: number;
  variants: { capacity: string; priceGradeA: number }[];
  partCosts: {
    battery: number;
    screen: number;
    rearCamera: number;
    chargingPort: number;
    backGlass: number;
    faceId: number;
  };
}

const modelsData: ModelData[] = [
  // iPhone 12 Series
  {
    name: 'iPhone 12 mini',
    order: 1,
    variants: [
      { capacity: '64GB', priceGradeA: 1100 },
      { capacity: '128GB', priceGradeA: 1250 },
      { capacity: '256GB', priceGradeA: 1400 },
    ],
    partCosts: { battery: 280, screen: 450, rearCamera: 350, chargingPort: 200, backGlass: 250, faceId: 300 },
  },
  {
    name: 'iPhone 12',
    order: 2,
    variants: [
      { capacity: '64GB', priceGradeA: 1300 },
      { capacity: '128GB', priceGradeA: 1450 },
      { capacity: '256GB', priceGradeA: 1600 },
    ],
    partCosts: { battery: 300, screen: 480, rearCamera: 380, chargingPort: 200, backGlass: 250, faceId: 320 },
  },
  {
    name: 'iPhone 12 Pro',
    order: 3,
    variants: [
      { capacity: '128GB', priceGradeA: 1800 },
      { capacity: '256GB', priceGradeA: 2000 },
      { capacity: '512GB', priceGradeA: 2200 },
    ],
    partCosts: { battery: 320, screen: 550, rearCamera: 450, chargingPort: 220, backGlass: 280, faceId: 350 },
  },
  {
    name: 'iPhone 12 Pro Max',
    order: 4,
    variants: [
      { capacity: '128GB', priceGradeA: 2100 },
      { capacity: '256GB', priceGradeA: 2350 },
      { capacity: '512GB', priceGradeA: 2550 },
    ],
    partCosts: { battery: 350, screen: 650, rearCamera: 480, chargingPort: 220, backGlass: 300, faceId: 380 },
  },

  // iPhone 13 Series
  {
    name: 'iPhone 13 mini',
    order: 5,
    variants: [
      { capacity: '128GB', priceGradeA: 1700 },
      { capacity: '256GB', priceGradeA: 1900 },
      { capacity: '512GB', priceGradeA: 2100 },
    ],
    partCosts: { battery: 320, screen: 520, rearCamera: 380, chargingPort: 220, backGlass: 280, faceId: 350 },
  },
  {
    name: 'iPhone 13',
    order: 6,
    variants: [
      { capacity: '128GB', priceGradeA: 2000 },
      { capacity: '256GB', priceGradeA: 2250 },
      { capacity: '512GB', priceGradeA: 2500 },
    ],
    partCosts: { battery: 340, screen: 550, rearCamera: 400, chargingPort: 220, backGlass: 280, faceId: 350 },
  },
  {
    name: 'iPhone 13 Pro',
    order: 7,
    variants: [
      { capacity: '128GB', priceGradeA: 2600 },
      { capacity: '256GB', priceGradeA: 2900 },
      { capacity: '512GB', priceGradeA: 3200 },
      { capacity: '1TB', priceGradeA: 3500 },
    ],
    partCosts: { battery: 360, screen: 750, rearCamera: 550, chargingPort: 240, backGlass: 320, faceId: 400 },
  },
  {
    name: 'iPhone 13 Pro Max',
    order: 8,
    variants: [
      { capacity: '128GB', priceGradeA: 2900 },
      { capacity: '256GB', priceGradeA: 3200 },
      { capacity: '512GB', priceGradeA: 3500 },
      { capacity: '1TB', priceGradeA: 3800 },
    ],
    partCosts: { battery: 380, screen: 850, rearCamera: 580, chargingPort: 240, backGlass: 340, faceId: 420 },
  },

  // iPhone 14 Series
  {
    name: 'iPhone 14',
    order: 9,
    variants: [
      { capacity: '128GB', priceGradeA: 2600 },
      { capacity: '256GB', priceGradeA: 2900 },
      { capacity: '512GB', priceGradeA: 3200 },
    ],
    partCosts: { battery: 360, screen: 650, rearCamera: 450, chargingPort: 240, backGlass: 300, faceId: 380 },
  },
  {
    name: 'iPhone 14 Plus',
    order: 10,
    variants: [
      { capacity: '128GB', priceGradeA: 2800 },
      { capacity: '256GB', priceGradeA: 3100 },
      { capacity: '512GB', priceGradeA: 3400 },
    ],
    partCosts: { battery: 380, screen: 720, rearCamera: 450, chargingPort: 240, backGlass: 320, faceId: 380 },
  },
  {
    name: 'iPhone 14 Pro',
    order: 11,
    variants: [
      { capacity: '128GB', priceGradeA: 3400 },
      { capacity: '256GB', priceGradeA: 3750 },
      { capacity: '512GB', priceGradeA: 4100 },
      { capacity: '1TB', priceGradeA: 4500 },
    ],
    partCosts: { battery: 400, screen: 950, rearCamera: 650, chargingPort: 260, backGlass: 350, faceId: 450 },
  },
  {
    name: 'iPhone 14 Pro Max',
    order: 12,
    variants: [
      { capacity: '128GB', priceGradeA: 3800 },
      { capacity: '256GB', priceGradeA: 4200 },
      { capacity: '512GB', priceGradeA: 4600 },
      { capacity: '1TB', priceGradeA: 5000 },
    ],
    partCosts: { battery: 420, screen: 1050, rearCamera: 700, chargingPort: 260, backGlass: 380, faceId: 480 },
  },

  // iPhone 15 Series
  {
    name: 'iPhone 15',
    order: 13,
    variants: [
      { capacity: '128GB', priceGradeA: 3300 },
      { capacity: '256GB', priceGradeA: 3700 },
      { capacity: '512GB', priceGradeA: 4100 },
    ],
    partCosts: { battery: 400, screen: 780, rearCamera: 500, chargingPort: 280, backGlass: 340, faceId: 420 },
  },
  {
    name: 'iPhone 15 Plus',
    order: 14,
    variants: [
      { capacity: '128GB', priceGradeA: 3600 },
      { capacity: '256GB', priceGradeA: 4000 },
      { capacity: '512GB', priceGradeA: 4400 },
    ],
    partCosts: { battery: 420, screen: 850, rearCamera: 500, chargingPort: 280, backGlass: 360, faceId: 420 },
  },
  {
    name: 'iPhone 15 Pro',
    order: 15,
    variants: [
      { capacity: '128GB', priceGradeA: 4300 },
      { capacity: '256GB', priceGradeA: 4800 },
      { capacity: '512GB', priceGradeA: 5300 },
      { capacity: '1TB', priceGradeA: 5800 },
    ],
    partCosts: { battery: 450, screen: 1150, rearCamera: 750, chargingPort: 300, backGlass: 420, faceId: 500 },
  },
  {
    name: 'iPhone 15 Pro Max',
    order: 16,
    variants: [
      { capacity: '256GB', priceGradeA: 5000 },
      { capacity: '512GB', priceGradeA: 5600 },
      { capacity: '1TB', priceGradeA: 6200 },
    ],
    partCosts: { battery: 480, screen: 1250, rearCamera: 800, chargingPort: 300, backGlass: 450, faceId: 550 },
  },

  // iPhone 16 Series
  {
    name: 'iPhone 16',
    order: 17,
    variants: [
      { capacity: '128GB', priceGradeA: 4300 },
      { capacity: '256GB', priceGradeA: 4800 },
      { capacity: '512GB', priceGradeA: 5400 },
    ],
    partCosts: { battery: 450, screen: 950, rearCamera: 600, chargingPort: 320, backGlass: 380, faceId: 480 },
  },
  {
    name: 'iPhone 16 Plus',
    order: 18,
    variants: [
      { capacity: '128GB', priceGradeA: 4700 },
      { capacity: '256GB', priceGradeA: 5200 },
      { capacity: '512GB', priceGradeA: 5800 },
    ],
    partCosts: { battery: 480, screen: 1050, rearCamera: 600, chargingPort: 320, backGlass: 400, faceId: 480 },
  },
  {
    name: 'iPhone 16 Pro',
    order: 19,
    variants: [
      { capacity: '128GB', priceGradeA: 5500 },
      { capacity: '256GB', priceGradeA: 6100 },
      { capacity: '512GB', priceGradeA: 6800 },
      { capacity: '1TB', priceGradeA: 7500 },
    ],
    partCosts: { battery: 520, screen: 1350, rearCamera: 850, chargingPort: 350, backGlass: 480, faceId: 580 },
  },
  {
    name: 'iPhone 16 Pro Max',
    order: 20,
    variants: [
      { capacity: '256GB', priceGradeA: 6400 },
      { capacity: '512GB', priceGradeA: 7100 },
      { capacity: '1TB', priceGradeA: 7900 },
    ],
    partCosts: { battery: 550, screen: 1450, rearCamera: 900, chargingPort: 350, backGlass: 500, faceId: 620 },
  },
];

async function main() {
  console.log('Seeding database...');

  // 1. Seed Grade Settings
  await prisma.gradeSetting.upsert({
    where: { key: 'discount_grade_b' },
    update: { value: 100 },
    create: {
      key: 'discount_grade_b',
      value: 100,
      description: 'Desconto aplicado para aparelhos Grade B (R$)',
    },
  });

  await prisma.gradeSetting.upsert({
    where: { key: 'discount_grade_c' },
    update: { value: 200 },
    create: {
      key: 'discount_grade_c',
      value: 200,
      description: 'Desconto aplicado para aparelhos Grade C (R$)',
    },
  });

  console.log('Grade settings seeded.');

  // 2. Seed Models, Variants, and Parts
  for (const m of modelsData) {
    const model = await prisma.model.upsert({
      where: { name: m.name },
      update: { order: m.order },
      create: {
        name: m.name,
        order: m.order,
      },
    });

    // Variants
    for (const v of m.variants) {
      await prisma.variant.upsert({
        where: {
          modelId_capacity: {
            modelId: model.id,
            capacity: v.capacity,
          },
        },
        update: { priceGradeA: v.priceGradeA },
        create: {
          modelId: model.id,
          capacity: v.capacity,
          priceGradeA: v.priceGradeA,
        },
      });
    }

    // Common Parts
    const partsToSeed = [
      { name: 'Bateria', cost: m.partCosts.battery },
      { name: 'Tela / Display', cost: m.partCosts.screen },
      { name: 'Câmera Traseira', cost: m.partCosts.rearCamera },
      { name: 'Conector de Carga', cost: m.partCosts.chargingPort },
      { name: 'Tampa Traseira (Vidro)', cost: m.partCosts.backGlass },
      { name: 'Face ID / Câmera Frontal', cost: m.partCosts.faceId },
    ];

    for (const p of partsToSeed) {
      await prisma.part.upsert({
        where: {
          modelId_name: {
            modelId: model.id,
            name: p.name,
          },
        },
        update: { cost: p.cost },
        create: {
          modelId: model.id,
          name: p.name,
          cost: p.cost,
        },
      });
    }
  }

  console.log(`Successfully seeded ${modelsData.length} iPhone models with variants and parts!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
