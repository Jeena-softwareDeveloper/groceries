import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Groceries & Staples',
    slug: 'groceries-and-staples',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3724/3724788.png',
    sortOrder: 1,
    subcategories: [
      { name: 'Rice & Atta', slug: 'rice-and-atta', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
      { name: 'Dals & Pulses', slug: 'dals-and-pulses', imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d7570072c62?auto=format&fit=crop&w=200&q=80' },
      { name: 'Cooking Oils', slug: 'cooking-oils', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80' },
      { name: 'Spices & Masalas', slug: 'spices-and-masalas', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Dry Fruits', slug: 'dry-fruits', imageUrl: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Sugar & Sweeteners', slug: 'sugar-and-sweeteners', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Fruits & Vegetables',
    slug: 'fruits-and-vegetables',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png',
    sortOrder: 2,
    subcategories: [
      { name: 'Fresh Fruits', slug: 'fresh-fruits', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80' },
      { name: 'Fresh Vegetables', slug: 'fresh-vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=200&q=80' },
      { name: 'Leafy Vegetables', slug: 'leafy-vegetables', imageUrl: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=200&q=80' },
      { name: 'Exotic Fruits', slug: 'exotic-fruits', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Dairy & Bakery',
    slug: 'dairy-and-bakery',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3014/3014527.png',
    sortOrder: 3,
    subcategories: [
      { name: 'Milk & Curd', slug: 'milk-and-curd', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80' },
      { name: 'Butter & Cheese', slug: 'butter-and-cheese', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Breads & Buns', slug: 'breads-and-buns', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
      { name: 'Eggs', slug: 'eggs', imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Snacks & Beverages',
    slug: 'snacks-and-beverages',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2738/2738730.png',
    sortOrder: 4,
    subcategories: [
      { name: 'Namkeen & Snacks', slug: 'namkeen-and-snacks', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=200&q=80' },
      { name: 'Biscuits & Cookies', slug: 'biscuits-and-cookies', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=200&q=80' },
      { name: 'Cold Drinks', slug: 'cold-drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80' },
      { name: 'Tea & Coffee', slug: 'tea-and-coffee', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=200&q=80' },
    ],
  }
];

async function main() {
  console.log('🌱 Seeding Categories...');

  for (const parent of categories) {
    // Upsert parent category
    const parentCategory = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        imageUrl: parent.imageUrl,
        sortOrder: parent.sortOrder,
        parentId: null, // Ensure it's a root category
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        imageUrl: parent.imageUrl,
        sortOrder: parent.sortOrder,
      },
    });

    console.log(`✅ Upserted Main Category: ${parentCategory.name}`);

    // Upsert subcategories
    let subOrder = 1;
    for (const sub of parent.subcategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          imageUrl: sub.imageUrl,
          sortOrder: subOrder,
          parentId: parentCategory.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          imageUrl: sub.imageUrl,
          sortOrder: subOrder,
          parentId: parentCategory.id,
        },
      });
      subOrder++;
    }
    console.log(`   -> Upserted ${parent.subcategories.length} subcategories for ${parentCategory.name}`);
  }

  console.log('🎉 Category Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
