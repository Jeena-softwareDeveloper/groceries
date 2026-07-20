import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Creating Product Approvals for existing products...');

  const products = await prisma.product.findMany();

  let pendingCount = 0;
  let approvedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    
    // Make 20% of products pending review, rest approved
    const isPending = i % 5 === 0; 
    
    const status = isPending ? 'PENDING' : 'APPROVED';
    const productStatus = isPending ? 'PENDING_REVIEW' : 'PUBLISHED';

    // Update product status
    await prisma.product.update({
      where: { id: p.id },
      data: { status: productStatus }
    });

    // Create approval record
    const existing = await prisma.productApproval.findFirst({
      where: { productId: p.id }
    });

    if (!existing) {
      await prisma.productApproval.create({
        data: {
          productId: p.id,
          vendorId: p.vendorId,
          status: status,
          adminNotes: status === 'APPROVED' ? 'Looks good, approved automatically.' : null,
          reviewedAt: status === 'APPROVED' ? new Date() : null,
        }
      });
      if (isPending) pendingCount++;
      else approvedCount++;
    }
  }

  console.log(`✅ Created ${pendingCount} PENDING and ${approvedCount} APPROVED product approvals.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
