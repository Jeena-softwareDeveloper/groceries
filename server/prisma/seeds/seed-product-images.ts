import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageMap = [
  { keyword: 'Atta', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { keyword: 'Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { keyword: 'Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { keyword: 'Salt', url: 'https://images.unsplash.com/photo-1610486047242-7360216dc7b1?w=400' },
  { keyword: 'Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
  { keyword: 'Cookies', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
  { keyword: 'Bhujia', url: 'https://images.unsplash.com/photo-1566478989037-e924e5020a1f?w=400' },
  { keyword: 'Tea', url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400' },
  { keyword: 'Coffee', url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400' },
  { keyword: 'Chocolate', url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400' },
  { keyword: 'Butter', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400' },
  { keyword: 'Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { keyword: 'Paneer', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=400' },
  { keyword: 'Honey', url: 'https://images.unsplash.com/photo-1587049352847-4d4b126a51d4?w=400' },
  { keyword: 'Ketchup', url: 'https://images.unsplash.com/photo-1601000676451-24020c02a7aa?w=400' },
  { keyword: 'Masala', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
  { keyword: 'Detergent', url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
  { keyword: 'Toothpaste', url: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=400' },
  { keyword: 'Soap', url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400' },
  { keyword: 'Oil', url: 'https://images.unsplash.com/photo-1620616147498-8ec059d0fbb3?w=400' },
  { keyword: 'default', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }, // grocery basket
];

async function main() {
  console.log('🔄 Adding images to products...');

  const products = await prisma.product.findMany({
    include: { images: true }
  });

  let added = 0;

  for (const p of products) {
    if (p.images.length === 0) {
      let matchedUrl = imageMap.find(i => p.name.includes(i.keyword))?.url;
      if (!matchedUrl) {
        matchedUrl = imageMap.find(i => i.keyword === 'default')!.url;
      }

      await prisma.productImage.create({
        data: {
          productId: p.id,
          url: matchedUrl,
          isPrimary: true
        }
      });
      added++;
    }
  }

  console.log(`✅ Successfully added images to ${added} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
