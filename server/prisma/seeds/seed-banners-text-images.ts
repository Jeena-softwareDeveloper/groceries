import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const banners = [
  {
    title: 'Grocery Mega Sale',
    imageUrl: 'https://placehold.co/800x400/10b981/ffffff?text=GROCERY+DELIVERY%5CnLorem+Ipsum+Dolor+Sit+Amet',
    linkUrl: '/(tabs)/search?q=grocery',
    themeColor: '#10b981', 
    themeColorEnd: '#047857', 
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Fresh Fruits',
    imageUrl: 'https://placehold.co/800x400/f59e0b/ffffff?text=FARM+FRESH+FRUITS%5CnGet+up+to+30%25+Off',
    linkUrl: '/(tabs)/search?q=fruits',
    themeColor: '#f59e0b', 
    themeColorEnd: '#b45309', 
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Dairy Products',
    imageUrl: 'https://placehold.co/800x400/3b82f6/ffffff?text=DAILY+DAIRY+%26+BAKERY%5CnBuy+1+Get+1+Free',
    linkUrl: '/(tabs)/search?q=dairy',
    themeColor: '#3b82f6', 
    themeColorEnd: '#1d4ed8', 
    sortOrder: 3,
    isActive: true,
  }
];

async function main() {
  console.log('🖼️ Seeding Banners with Text inside Images...');

  await prisma.banner.deleteMany({});
  console.log('🗑️ Cleared existing banners.');

  for (const b of banners) {
    await prisma.banner.create({
      data: b
    });
    console.log(`✅ Created Banner: ${b.title}`);
  }

  console.log('🎉 Banner Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
