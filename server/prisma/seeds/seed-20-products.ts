import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newProducts = [
  { name: 'Aashirvaad Select Premium Sharbati Atta', brand: 'Aashirvaad', mrp: 260, sellingPrice: 245, unit: 'kg', weight: '5', desc: '100% MP Sharbati wheat, premium quality.', tags: '100% Whole Wheat, Premium, High Fiber', categoryName: 'Groceries' },
  { name: 'India Gate Basmati Rice Classic', brand: 'India Gate', mrp: 850, sellingPrice: 799, unit: 'kg', weight: '5', desc: 'Aged basmati rice with long grains and rich aroma.', tags: 'Basmati, Aged, Premium', categoryName: 'Groceries' },
  { name: 'Fortune Sunlite Refined Sunflower Oil', brand: 'Fortune', mrp: 165, sellingPrice: 145, unit: 'L', weight: '1', desc: 'Light and healthy cooking oil enriched with vitamins.', tags: 'Healthy, Vitamins, Light', categoryName: 'Groceries' },
  { name: 'Tata Salt Vacuum Evaporated', brand: 'Tata', mrp: 28, sellingPrice: 25, unit: 'kg', weight: '1', desc: 'Iodized salt for everyday cooking.', tags: 'Iodized, Pure, Essential', categoryName: 'Groceries' },
  { name: 'Maggi 2-Minute Noodles Masala', brand: 'Nestle', mrp: 14, sellingPrice: 14, unit: 'g', weight: '70', desc: 'Classic masala noodles ready in 2 minutes.', tags: 'Instant, Snack, Masala', categoryName: 'Snacks' },
  { name: 'Britannia Good Day Cashew Cookies', brand: 'Britannia', mrp: 30, sellingPrice: 28, unit: 'g', weight: '200', desc: 'Rich cashew cookies baked to perfection.', tags: 'Cookies, Cashew, Sweet', categoryName: 'Snacks' },
  { name: 'Haldiram\'s Bhujia Sev', brand: 'Haldiram', mrp: 105, sellingPrice: 95, unit: 'g', weight: '400', desc: 'Spicy tepary bean and gram flour noodles.', tags: 'Spicy, Savory, Snack', categoryName: 'Snacks' },
  { name: 'Lipton Yellow Label Tea', brand: 'Lipton', mrp: 230, sellingPrice: 215, unit: 'g', weight: '500', desc: 'Premium black tea for a refreshing morning.', tags: 'Tea, Black Tea, Refreshing', categoryName: 'Beverages' },
  { name: 'Nescafe Classic Instant Coffee', brand: 'Nescafe', mrp: 330, sellingPrice: 310, unit: 'g', weight: '100', desc: '100% pure coffee perfect for any time of the day.', tags: 'Coffee, Instant, Pure', categoryName: 'Beverages' },
  { name: 'Cadbury Dairy Milk Silk', brand: 'Cadbury', mrp: 80, sellingPrice: 75, unit: 'g', weight: '60', desc: 'Smooth and creamy milk chocolate.', tags: 'Chocolate, Sweet, Dessert', categoryName: 'Snacks' },
  { name: 'Amul Butter Pasteurized', brand: 'Amul', mrp: 54, sellingPrice: 52, unit: 'g', weight: '100', desc: 'Pure milk fat butter, utterly butterly delicious.', tags: 'Dairy, Butter, Pure', categoryName: 'Dairy' },
  { name: 'Nandini GoodLife UHT Milk', brand: 'Nandini', mrp: 60, sellingPrice: 58, unit: 'L', weight: '1', desc: 'UHT treated toned milk, no boiling required.', tags: 'Milk, UHT, Dairy', categoryName: 'Dairy' },
  { name: 'Milky Mist Paneer', brand: 'Milky Mist', mrp: 95, sellingPrice: 85, unit: 'g', weight: '200', desc: 'Soft and fresh paneer made from pure cow milk.', tags: 'Paneer, Fresh, Dairy', categoryName: 'Dairy' },
  { name: 'Dabur Honey', brand: 'Dabur', mrp: 199, sellingPrice: 185, unit: 'g', weight: '400', desc: '100% pure honey, natural immunity booster.', tags: 'Honey, Natural, Healthy', categoryName: 'Groceries' },
  { name: 'Kissan Fresh Tomato Ketchup', brand: 'Kissan', mrp: 140, sellingPrice: 125, unit: 'g', weight: '950', desc: 'Made from 100% real juicy tomatoes.', tags: 'Ketchup, Sauce, Condiment', categoryName: 'Groceries' },
  { name: 'Everest Garam Masala', brand: 'Everest', mrp: 82, sellingPrice: 76, unit: 'g', weight: '100', desc: 'A perfect blend of pure spices.', tags: 'Spices, Masala, Essential', categoryName: 'Groceries' },
  { name: 'Surf Excel Easy Wash Detergent', brand: 'Surf Excel', mrp: 130, sellingPrice: 118, unit: 'kg', weight: '1', desc: 'Removes tough stains easily.', tags: 'Cleaning, Detergent, Wash', categoryName: 'Household' },
  { name: 'Colgate Strong Teeth Toothpaste', brand: 'Colgate', mrp: 104, sellingPrice: 95, unit: 'g', weight: '200', desc: 'Calcium and minerals for strong teeth.', tags: 'Oral Care, Hygiene', categoryName: 'Personal Care' },
  { name: 'Dove Cream Beauty Bathing Bar', brand: 'Dove', mrp: 155, sellingPrice: 140, unit: 'g', weight: '300', desc: 'Moisturizing beauty bar for soft skin.', tags: 'Soap, Skincare, Beauty', categoryName: 'Personal Care' },
  { name: 'Parachute Advanced Jasmine Hair Oil', brand: 'Parachute', mrp: 110, sellingPrice: 98, unit: 'ml', weight: '300', desc: 'Non-sticky hair oil with jasmine extracts.', tags: 'Hair Care, Oil, Jasmine', categoryName: 'Personal Care' },
];

async function main() {
  console.log('🔄 Adding 20 new products to the first store...');

  const vendor = await prisma.vendor.findFirst({ where: { status: 'APPROVED' } });
  if (!vendor) {
    throw new Error('No approved vendor found!');
  }

  // Get categories or create them if they don't exist
  const categories = await prisma.category.findMany();
  
  for (const p of newProducts) {
    let category = categories.find(c => c.name === p.categoryName);
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: p.categoryName,
          slug: p.categoryName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true
        }
      });
      categories.push(category);
    }

    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

    // Create product
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: category.id,
        name: p.name,
        slug: slug,
        brand: p.brand,
        description: p.desc,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        unit: p.unit,
        weight: p.weight,
        tags: p.tags,
        status: 'PUBLISHED', // APPROVED product
        inventory: {
          create: { stock: Math.floor(Math.random() * 100) + 10 }
        }
      }
    });

    // Create approval record
    await prisma.productApproval.create({
      data: {
        productId: product.id,
        vendorId: vendor.id,
        status: 'APPROVED',
        adminNotes: 'Auto approved.',
        reviewedAt: new Date(),
      }
    });
  }

  console.log(`✅ Successfully added 20 products for store: ${vendor.shopName}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
