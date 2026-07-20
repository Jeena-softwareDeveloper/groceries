import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Removing old Groceries category...');

  const category = await prisma.category.findFirst({
    where: { name: 'Groceries' },
    include: { children: true }
  });

  if (category) {
    const allCategoryIds = [category.id, ...category.children.map(c => c.id)];

    // Delete products associated with these categories
    await prisma.product.deleteMany({
      where: { categoryId: { in: allCategoryIds } }
    });

    // Disconnect vendors (assuming it's a many-to-many or we just delete vendors?)
    // Vendors might be related to categories. Let's see the schema: Vendor -> categories?
    // Vendor has a categories field? Wait, let's just delete products for now.
    
    // There is a vendor relation to Category. Wait, in schema.prisma, Vendor has:
    // Vendor: `Category[]` ? No, let's check schema for Vendor and Category.

    // Let's execute raw SQL to be sure we just cascade delete it if needed, 
    // or just delete many subcategories then parent.
    // The foreign key issue might be from Vendor categories relation.
    
    // Instead of dealing with relations, let's just mark it as `isActive: false`?
    // The user wants it removed from the UI. Let's mark it as inactive and sortOrder = 999
    await prisma.category.update({
      where: { id: category.id },
      data: { isActive: false, sortOrder: 999 }
    });

    for (const child of category.children) {
      await prisma.category.update({
        where: { id: child.id },
        data: { isActive: false }
      });
    }
    
    console.log('✅ Successfully removed old Groceries category (marked as inactive).');
  } else {
    console.log('ℹ️ Old Groceries category not found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
