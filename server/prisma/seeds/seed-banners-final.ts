import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const banners = [
  {
    title: 'Grocery Mega Sale', // This won't be shown if overlay is removed, but good for DB
    imageUrl: 'https://placehold.co/800x400/14532d/ffffff?text=MEGA+SALE%0AUPTO+50%25+OFF%0AON+GROCERIES&font=montserrat',
    linkUrl: '/(tabs)/search?q=grocery',
    themeColor: '#14532d', // Top: Dark Green
    themeColorEnd: '#4ade80', // Bottom: Light Green
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Fresh Fruits',
    imageUrl: 'https://placehold.co/800x400/7c2d12/ffffff?text=FRESH+FRUITS%0AFrom+Farm+to+Home&font=montserrat',
    linkUrl: '/(tabs)/search?q=fruits',
    themeColor: '#7c2d12', // Top: Dark Orange
    themeColorEnd: '#fb923c', // Bottom: Light Orange
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Dairy Products',
    imageUrl: 'https://placehold.co/800x400/1e3a8a/ffffff?text=DAIRY+PRODUCTS%0ABuy+1+Get+1+Free&font=montserrat',
    linkUrl: '/(tabs)/search?q=dairy',
    themeColor: '#1e3a8a', // Top: Dark Blue
    themeColorEnd: '#60a5fa', // Bottom: Light Blue
    sortOrder: 3,
    isActive: true,
  }
];

async function main() {
  console.log('🖼️ Seeding Banners with Text and Gradient (Dark to Light)...');

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
