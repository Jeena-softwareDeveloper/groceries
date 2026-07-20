import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vendorImages = [
  {
    logoUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
  },
  {
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
  },
  {
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    rating: 4.2,
  }
];

async function main() {
  console.log('🏪 Seeding Vendor Images...');

  const vendors = await prisma.vendor.findMany();
  
  let i = 0;
  for (const vendor of vendors) {
    const imageSet = vendorImages[i % vendorImages.length];
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        logoUrl: imageSet.logoUrl,
        bannerUrl: imageSet.bannerUrl,
        rating: imageSet.rating,
        ratingCount: Math.floor(Math.random() * 500) + 50,
      }
    });
    console.log(`✅ Updated images for Vendor: ${vendor.shopName}`);
    i++;
  }

  // If there's only 1 vendor, let's create another one so it looks good on the app
  if (vendors.length < 2) {
    console.log('📦 Creating an extra sample vendor for display...');
    
    // get area/district of first vendor
    const firstVendor = vendors[0];
    if (firstVendor) {
      // Create a dummy user for the new vendor
      const email = 'greenmart@districtmart.com';
      await prisma.vendor.create({
        data: {
          shopName: 'Green Mart Supermarket',
          slug: 'green-mart',
          email,
          passwordHash: firstVendor.passwordHash,
          phone: '9876543211',
          address: '45 Green Street, T. Nagar',
          status: 'APPROVED',
          areaId: firstVendor.areaId,
          districtId: firstVendor.districtId,
          logoUrl: vendorImages[1].logoUrl,
          bannerUrl: vendorImages[1].bannerUrl,
          rating: 4.6,
          ratingCount: 320,
          minOrderValue: 99,
        }
      });
      console.log('✅ Created Green Mart Supermarket');
    }
  }

  console.log('🎉 Vendor Image Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
