import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const simpleSlugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const sampleProducts = [
  {
    name: 'Fresh Red Apples',
    description: 'Crisp and sweet red apples directly from the farm.',
    mrp: 150,
    sellingPrice: 120,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=400&q=80',
    stock: 50,
    catKeyword: 'fruits'
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked 100% whole wheat bread.',
    mrp: 50,
    sellingPrice: 45,
    unit: '1 pack',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    stock: 20,
    catKeyword: 'dairy' // or bakery
  },
  {
    name: 'Amul Taaza Toned Milk',
    description: 'Pasteurised toned milk.',
    mrp: 26,
    sellingPrice: 26,
    unit: '500 ml',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    stock: 100,
    catKeyword: 'dairy'
  },
  {
    name: 'Lays Classic Salted Potato Chips',
    description: 'Classic salted potato chips.',
    mrp: 20,
    sellingPrice: 18,
    unit: '50 g',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-e94dc188c037?w=400&q=80',
    stock: 150,
    catKeyword: 'snacks'
  },
  {
    name: 'Tata Salt',
    description: 'Iodized crystal salt.',
    mrp: 25,
    sellingPrice: 22,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1596489382602-53d9e86c1257?w=400&q=80',
    stock: 200,
    catKeyword: 'groceries'
  },
  {
    name: 'Aashirvaad Atta',
    description: 'Whole wheat atta.',
    mrp: 250,
    sellingPrice: 210,
    unit: '5 kg',
    imageUrl: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=400&q=80',
    stock: 40,
    catKeyword: 'groceries'
  },
  {
    name: 'Fresh Tomatoes',
    description: 'Locally grown fresh tomatoes.',
    mrp: 60,
    sellingPrice: 40,
    unit: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b140985fdea5?w=400&q=80',
    stock: 80,
    catKeyword: 'fruits'
  },
  {
    name: 'Coca Cola',
    description: 'Refreshing cola drink.',
    mrp: 40,
    sellingPrice: 38,
    unit: '750 ml',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    stock: 60,
    catKeyword: 'snacks'
  }
];

async function main() {
  console.log('📦 Seeding Products for Vendors...');

  const vendors = await prisma.vendor.findMany({ where: { status: 'APPROVED' } });
  if (!vendors.length) {
    console.error('No approved vendors found!');
    return;
  }

  // Get a default category as fallback
  const fallbackCategory = await prisma.category.findFirst();
  if (!fallbackCategory) {
    console.error('No categories found! Please run seed-categories.ts first.');
    return;
  }

  // Map keywords to category IDs if possible
  const categories = await prisma.category.findMany();
  const getCategory = (keyword: string) => {
    const cat = categories.find(c => c.slug.includes(keyword) || c.name.toLowerCase().includes(keyword));
    return cat ? cat.id : fallbackCategory.id;
  };

  for (const vendor of vendors) {
    console.log(`\n🏪 Adding products to ${vendor.shopName}...`);
    
    // Pick 4-6 random products for each vendor
    const shuffled = [...sampleProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, 5);

    for (const p of selectedProducts) {
      const slug = simpleSlugify(`${vendor.shopName}-${p.name}-${Math.random().toString(36).substring(7)}`);
      
      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          categoryId: getCategory(p.catKeyword),
          name: p.name,
          slug,
          description: p.description,
          brand: 'Generic',
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          unit: p.unit,
          status: 'APPROVED', // Assuming we want them visible right away
          isActive: true,
          
          images: {
            create: {
              url: p.imageUrl,
              isPrimary: true,
              sortOrder: 0
            }
          },
          inventory: {
            create: {
              stock: p.stock,
              reorderLevel: 5
            }
          }
        }
      });
      console.log(`   ✅ Added ${p.name}`);
    }
  }

  console.log('\n🎉 Product Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
