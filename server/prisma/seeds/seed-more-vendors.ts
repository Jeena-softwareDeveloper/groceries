import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newVendors = [
  {
    shopName: 'Green Mart Supermarket',
    slug: 'green-mart',
    email: 'greenmart@districtmart.com',
    phone: '9876543211',
    address: '45 Green Street, T. Nagar',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    ratingCount: 320,
    minOrderValue: 99,
  },
  {
    shopName: 'Daily Needs Grocery',
    slug: 'daily-needs',
    email: 'dailyneeds@districtmart.com',
    phone: '9876543212',
    address: '12 Market Road, T. Nagar',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    rating: 4.3,
    ratingCount: 150,
    minOrderValue: 50,
  },
  {
    shopName: 'Organic Life Store',
    slug: 'organic-life',
    email: 'organiclife@districtmart.com',
    phone: '9876543213',
    address: '88 Nature Avenue, T. Nagar',
    logoUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    ratingCount: 500,
    minOrderValue: 199,
  }
];

async function main() {
  console.log('🏪 Seeding more Approved Vendors...');

  const firstVendor = await prisma.vendor.findFirst({ where: { status: 'APPROVED' } });
  
  if (!firstVendor) {
    console.error('No approved vendors found to copy area/district from!');
    return;
  }

  for (const v of newVendors) {
    const existing = await prisma.vendor.findUnique({ where: { slug: v.slug } });
    if (!existing) {
      await prisma.vendor.create({
        data: {
          ...v,
          passwordHash: firstVendor.passwordHash, // just use the same password hash
          status: 'APPROVED',
          areaId: firstVendor.areaId,
          districtId: firstVendor.districtId,
        }
      });
      console.log(`✅ Created Vendor: ${v.shopName}`);
    } else {
      console.log(`⚠️ Vendor ${v.shopName} already exists.`);
    }
  }

  console.log('🎉 More Vendors Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
