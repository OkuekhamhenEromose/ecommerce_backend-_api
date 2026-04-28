import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('✅ Prisma Client loaded successfully!');
  console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
  
  // Test category model
  const categories = await prisma.category.findMany();
  console.log('Categories count:', categories.length);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
