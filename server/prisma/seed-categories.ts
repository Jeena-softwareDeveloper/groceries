import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');

  const categories = [
    {
      name: 'Groceries',
      slug: 'groceries',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Placeholder
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Fruits & Vegetables',
      slug: 'fruits-vegetables',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Placeholder
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Dairy & Bakery',
      slug: 'dairy-bakery',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Placeholder
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Placeholder
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Snacks & Beverages',
      slug: 'snacks-beverages',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Placeholder
      isActive: true,
      sortOrder: 5,
    }
  ];

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        imageUrl: cat.imageUrl,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
      },
      create: cat,
    });
    console.log(`Upserted category: ${created.name}`);
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
