import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating product statuses to PUBLISHED...');

  const result = await prisma.product.updateMany({
    where: { status: 'APPROVED' },
    data: { status: 'PUBLISHED' }
  });

  console.log(`✅ Updated ${result.count} products to PUBLISHED.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
