import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.superAdmin.upsert({
    where: { email: 'admin@districtmart.com' },
    update: {},
    create: { email: 'admin@districtmart.com', passwordHash: adminPassword, name: 'Super Admin' },
  });

  const district = await prisma.district.upsert({
    where: { code: 'CHN' },
    update: {},
    create: { name: 'Chennai', code: 'CHN', isActive: true },
  });

  let area = await prisma.area.findFirst({ where: { districtId: district.id, name: 'T. Nagar' } });
  if (!area) {
    area = await prisma.area.create({ data: { districtId: district.id, name: 'T. Nagar', pincode: '600017', isActive: true } });
  }

  const groceries = await prisma.category.upsert({
    where: { slug: 'groceries' },
    update: {},
    create: { name: 'Groceries', slug: 'groceries', sortOrder: 1, isActive: true },
  });

  const dairy = await prisma.category.upsert({
    where: { slug: 'dairy' },
    update: {},
    create: { name: 'Dairy', slug: 'dairy', parentId: groceries.id, sortOrder: 1, isActive: true },
  });

  const snacks = await prisma.category.upsert({
    where: { slug: 'snacks' },
    update: {},
    create: { name: 'Snacks', slug: 'snacks', parentId: groceries.id, sortOrder: 2, isActive: true },
  });

  const vendorPassword = await bcrypt.hash('Vendor@123', 12);
  const vendor = await prisma.vendor.upsert({
    where: { email: 'vendor@districtmart.com' },
    update: {},
    create: {
      email: 'vendor@districtmart.com',
      passwordHash: vendorPassword,
      shopName: 'Fresh Mart',
      slug: 'fresh-mart',
      address: '12 Main Road, T. Nagar',
      phone: '9876543210',
      areaId: area.id,
      districtId: district.id,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: admin.id,
      rating: 4.5,
      ratingCount: 120,
    },
  });

  const products = [
    { name: 'Amul Taaza Milk 1L', slug: 'amul-taaza-1l', mrp: 62, sellingPrice: 58, unit: '1L', categoryId: dairy.id, tags: 'BEST_SELLER' },
    { name: 'Britannia Bread', slug: 'britannia-bread', mrp: 45, sellingPrice: 42, unit: '400g', categoryId: groceries.id, tags: 'FEATURED' },
    { name: 'Lays Classic Salted', slug: 'lays-classic', mrp: 20, sellingPrice: 18, unit: '52g', categoryId: snacks.id, tags: 'NEW_ARRIVAL' },
    { name: 'Fresh Tomatoes', slug: 'fresh-tomatoes', mrp: 40, sellingPrice: 35, unit: '500g', categoryId: groceries.id, tags: null },
    { name: 'Curd 500g', slug: 'curd-500g', mrp: 35, sellingPrice: 32, unit: '500g', categoryId: dairy.id, tags: 'INSTANT_DELIVERY' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { vendorId_slug: { vendorId: vendor.id, slug: p.slug } },
      update: { status: 'PUBLISHED' },
      create: {
        vendorId: vendor.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        unit: p.unit,
        tags: p.tags,
        status: 'PUBLISHED',
        inventory: { create: { stock: 100, reorderLevel: 10 } },
      },
    });
  }

  await prisma.banner.upsert({
    where: { id: 'seed-banner-1' },
    update: {},
    create: { id: 'seed-banner-1', title: 'Welcome to DistrictMart', imageUrl: 'https://placehold.co/800x300/16a34a/white?text=Fresh+Groceries', districtId: district.id, sortOrder: 1, isActive: true },
  });

  await prisma.microBanner.upsert({
    where: { id: 'seed-micro-1' },
    update: {},
    create: { id: 'seed-micro-1', title: 'Free delivery above ₹199', imageUrl: 'https://placehold.co/400x100/22c55e/white?text=Free+Delivery', districtId: district.id, sortOrder: 1, isActive: true },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: { code: 'WELCOME50', description: '₹50 off first order', scope: 'PLATFORM', discountAmt: 50, minOrder: 199, isActive: true },
  });

  await prisma.deliveryChargeRule.upsert({
    where: { id: 'seed-delivery-1' },
    update: {},
    create: { id: 'seed-delivery-1', districtId: district.id, name: 'Standard', minDistance: 0, maxDistance: 5, charge: 29, freeAbove: 199, isActive: true },
  });

  await prisma.staticPage.upsert({
    where: { slug: 'privacy-policy' },
    update: {},
    create: { slug: 'privacy-policy', title: 'Privacy Policy', content: '<p>Your privacy matters to All Time Market.</p>', isActive: true },
  });

  await prisma.staticPage.upsert({
    where: { slug: 'terms' },
    update: {},
    create: { slug: 'terms', title: 'Terms of Service', content: '<p>Terms and conditions for using All Time Market.</p>', isActive: true },
  });

  await prisma.appSetting.upsert({ where: { key: 'minOrderValue' }, update: {}, create: { key: 'minOrderValue', value: 99 } });
  await prisma.appSetting.upsert({ where: { key: 'taxPercent' }, update: {}, create: { key: 'taxPercent', value: 5 } });

  const homePageLayout = {
    heroBanner: {
      trustBadge: 'Freshness You Can Trust',
      title: 'Groceries\nDelivered Fast',
      subtitle: 'Your daily essentials,\ndelivered to your door.',
      buttonText: 'Shop Now',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    },
    freeDelivery: {
      title: 'FREE DELIVERY',
      subtitle: 'On all orders above ₹199',
    },
    bulkOrders: {
      title: 'Bulk Orders?',
      subtitle: 'Get exclusive discounts on bulk orders',
      buttonText: 'Order Now',
    },
    features: [
      { icon: 'leaf-outline', text: '100% Fresh\nProducts' },
      { icon: 'time-outline', text: 'On-time\nDelivery' },
      { icon: 'pricetag-outline', text: 'Best Prices\nEveryday' }
    ],
    whyShopWithUs: [
      { icon: 'grid-outline', title: 'Wide Range', subtitle: 'Everything you need in one place' },
      { icon: 'rocket-outline', title: 'Fast Delivery', subtitle: 'Quick & reliable delivery at your doorstep' },
      { icon: 'checkmark-circle-outline', title: 'Best Quality', subtitle: 'Handpicked & quality checked products' },
      { icon: 'refresh-outline', title: 'Easy Returns', subtitle: 'Hassle-free returns & refunds' }
    ],
    referEarn: {
      title: 'Refer & Earn',
      subtitle: 'Invite your friends and earn exciting rewards',
      buttonText: 'Refer Now',
    },
    popularSearches: ['Milk', 'Eggs', 'Rice', 'Oil', 'Onion', 'Potato'],
    footer: {
      title: 'Everything You Need,\nDelivered With Care',
      subtitle: 'From fresh produce to daily essentials,\nwe\'ve got you covered.',
      stats: [
        { icon: 'happy-outline', number: '10K+', label: 'Happy Customers' },
        { icon: 'basket-outline', number: '500+', label: 'Daily Orders' },
        { icon: 'storefront-outline', number: '50+', label: 'Partner Stores' }
      ],
      download: {
        title: 'Download the All Time Market App',
        subtitle: 'Get the best shopping experience on our app',
      }
    }
  };

  await prisma.appSetting.upsert({
    where: { key: 'HOME_PAGE_LAYOUT' },
    update: { value: homePageLayout },
    create: { key: 'HOME_PAGE_LAYOUT', value: homePageLayout }
  });

  // Sample customer with address for checkout testing
  const customer = await prisma.customer.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: { phone: '9876543210', name: 'Test Customer' },
  });
  await prisma.wallet.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id, balance: 100 },
  });
  const existingAddr = await prisma.address.findFirst({ where: { customerId: customer.id } });
  if (!existingAddr) {
    await prisma.address.create({
      data: {
        customerId: customer.id,
        label: 'Home',
        line1: '42 Test Street',
        city: 'Chennai',
        state: 'TN',
        pincode: '600017',
        isDefault: true,
      },
    });
  }

  // Second district for multi-district testing
  const district2 = await prisma.district.upsert({
    where: { code: 'BLR' },
    update: {},
    create: { name: 'Bengaluru', code: 'BLR', isActive: true },
  });
  let area2 = await prisma.area.findFirst({ where: { districtId: district2.id, name: 'Koramangala' } });
  if (!area2) {
    area2 = await prisma.area.create({ data: { districtId: district2.id, name: 'Koramangala', pincode: '560034', isActive: true } });
  }

  // Pending vendor for approval flow
  await prisma.vendor.upsert({
    where: { email: 'pending@alltimemarket.com' },
    update: {},
    create: {
      email: 'pending@alltimemarket.com',
      passwordHash: vendorPassword,
      shopName: 'Pending All Time Market Store',
      slug: 'pending-all-time-market-store',
      address: '99 Test Road',
      phone: '9000000001',
      areaId: area.id,
      districtId: district.id,
      status: 'PENDING',
    },
  });

  console.log('Seed complete!');
  console.log('  Admin:    admin@districtmart.com / Admin@123'); // Kept original email as requested for testing
  console.log('  Vendor:   vendor@districtmart.com / Vendor@123');
  console.log('  Customer: any phone + OTP 123456');
  console.log(`  District: ${district.name} (${district.id})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
