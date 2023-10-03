const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countItemsByUID(uid) {
  console.log(`Counting items by UID: ${uid}`);
  try {
    const count = await prisma.Genshin_Draw.count({
      where: {
        Genshin_UID: uid,
      },
    });

    return count;
  } catch (error) {
    console.error('Error counting items by UID:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
async function example(UID) {
  const itemCount = await countItemsByUID(UID);
  console.log(`Total items with Genshin_UID ${UID}: ${itemCount}`);
}

    // 812517138 CL // 812650839 JY // 802199629 XH // 801235702 Hadi
example('812517138');
example('812650839');
example('802199629');
example('801235702');
