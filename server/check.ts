import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const req = await prisma.vendorRequest.findUnique({ where: { id: 'cmrlsq5900001e5xgfciydc4p' } });
  if (req) {
    const v = await prisma.vendor.findFirst({ where: { shopName: 'Jee a' } });
    if (v) {
      await prisma.vendor.update({ where: { id: v.id }, data: { customerId: req.customerId } });
      console.log('updated vendor');
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
