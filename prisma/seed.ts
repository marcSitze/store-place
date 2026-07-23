import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin and Customer Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@aura.com',
      role: 'ADMIN',
    }
  })

  const customer = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      role: 'CUSTOMER',
    }
  })

  // Create Brands
  const brandAura = await prisma.brand.create({
    data: { name: 'Aura Labs', slug: 'aura-labs', description: 'Premium lifestyle gear' }
  })
  const brandNike = await prisma.brand.create({
    data: { name: 'Nike', slug: 'nike', description: 'Active lifestyle footwear' }
  })
  const brandApple = await prisma.brand.create({
    data: { name: 'Apple', slug: 'apple', description: 'State of the art electronics' }
  })

  // Create Categories
  const catApparel = await prisma.category.create({
    data: { name: 'Apparel', slug: 'apparel', description: 'Curated clothing items', isFeatured: true }
  })
  const catFootwear = await prisma.category.create({
    data: { name: 'Footwear', slug: 'footwear', description: 'Premium active shoes', isFeatured: true }
  })
  const catElectronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics', description: 'Sleek premium hardware', isFeatured: true }
  })

  // Create Products
  // 1. Aura Premium Tee
  const tee = await prisma.product.create({
    data: {
      name: 'Aura Organic Cotton Tee',
      slug: 'aura-organic-cotton-tee',
      sku: 'AURA-TEE-ORG',
      description: 'A heavyweight, organic cotton t-shirt with a relaxed silhouette and soft hand-feel. Sustainably made.',
      shortDescription: '100% organic cotton luxury t-shirt.',
      price: 45.00,
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: catApparel.id,
      brandId: brandAura.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60', alt: 'Aura Organic Tee Front', position: 0 }
        ]
      },
      variants: {
        create: [
          { sku: 'AURA-TEE-BLK-S', price: 45.00, stock: 50, color: 'Black', size: 'S' },
          { sku: 'AURA-TEE-BLK-M', price: 45.00, stock: 75, color: 'Black', size: 'M' },
          { sku: 'AURA-TEE-BLK-L', price: 45.00, stock: 40, color: 'Black', size: 'L' },
          { sku: 'AURA-TEE-WHT-S', price: 45.00, stock: 30, color: 'White', size: 'S' },
          { sku: 'AURA-TEE-WHT-M', price: 45.00, stock: 60, color: 'White', size: 'M' }
        ]
      }
    }
  })

  // 2. Nike Aura Runner
  const runner = await prisma.product.create({
    data: {
      name: 'Nike Aura Runner',
      slug: 'nike-aura-runner',
      sku: 'NIKE-AUR-RUN',
      description: 'Engineered mesh upper for breathability, Zoom Air cushioning in the forefoot, and a durable rubber outsole for grip.',
      shortDescription: 'Cushioned mesh running shoe.',
      price: 130.00,
      discountPrice: 110.00,
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60', alt: 'Nike Aura Runner Red', position: 0 }
        ]
      },
      variants: {
        create: [
          { sku: 'NIKE-RUN-RED-9', price: 130.00, discountPrice: 110.00, stock: 25, color: 'Red', size: '9' },
          { sku: 'NIKE-RUN-RED-10', price: 130.00, discountPrice: 110.00, stock: 35, color: 'Red', size: '10' },
          { sku: 'NIKE-RUN-RED-11', price: 130.00, discountPrice: 110.00, stock: 15, color: 'Red', size: '11' }
        ]
      }
    }
  })

  // 3. Apple Watch Aura Edition
  const watch = await prisma.product.create({
    data: {
      name: 'Apple Watch Aura Edition',
      slug: 'apple-watch-aura-edition',
      sku: 'APL-WCH-AUR',
      description: 'Exclusive custom stainless steel case with premium leather band. Complete fitness tracking and seamless integration.',
      shortDescription: 'Custom leather smartwatch.',
      price: 499.00,
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: catElectronics.id,
      brandId: brandApple.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=60', alt: 'Apple Watch Aura Edition', position: 0 }
        ]
      },
      variants: {
        create: [
          { sku: 'APL-WCH-BRN-44', price: 499.00, stock: 10, color: 'Brown Leather', size: '44mm' },
          { sku: 'APL-WCH-BRN-40', price: 499.00, stock: 15, color: 'Brown Leather', size: '40mm' }
        ]
      }
    }
  })

  // 4. Aura Minimalist Cap
  const cap = await prisma.product.create({
    data: {
      name: 'Aura Minimalist Baseball Cap',
      slug: 'aura-minimalist-baseball-cap',
      sku: 'AURA-CAP-MIN',
      description: 'Low-profile six panel unstructured cap with strapback adjustment. Custom metal clasp detail.',
      shortDescription: 'Premium daily baseball cap.',
      price: 35.00,
      status: 'PUBLISHED',
      isFeatured: false,
      categoryId: catApparel.id,
      brandId: brandAura.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=60', alt: 'Aura Minimalist Cap', position: 0 }
        ]
      },
      variants: {
        create: [
          { sku: 'AURA-CAP-NVY-OS', price: 35.00, stock: 100, color: 'Navy', size: 'One Size' }
        ]
      }
    }
  })

  // Create a default Coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.00,
      minPurchase: 30.00,
      usageLimit: 500,
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
