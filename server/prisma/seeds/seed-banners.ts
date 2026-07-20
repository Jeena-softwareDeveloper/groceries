import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const banners = [
  {
    title: '50% OFF on Groceries',
    // A nice bright grocery image
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/(tabs)/search?q=grocery',
    themeColor: '#dcfce7', // light pastel green
    themeColorEnd: '#86efac', 
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Fresh Fruits Festival',
    // Bright fruits image
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/(tabs)/search?q=fruits',
    themeColor: '#ffedd5', // light pastel orange
    themeColorEnd: '#fdba74', 
    sortOrder: 2,
    isActive: true,
  },
  {
    title: 'Buy 1 Get 1 Free - Dairy',
    // Bright milk/dairy image
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/(tabs)/search?q=dairy',
    themeColor: '#dbeafe', // light pastel blue
    themeColorEnd: '#93c5fd', 
    sortOrder: 3,
    isActive: true,
  }
];

async function main() {
  console.log('🖼️ Seeding Lighter Banners...');

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
