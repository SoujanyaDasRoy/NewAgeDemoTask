import { prisma } from "../lib/prisma";

async function main() {
  const count = await prisma.accessItem.count();
  console.log("Total access items:", count);
  const all = await prisma.accessItem.findMany({ select: { id: true, name: true, eligibleGroups: true } });
  for (const item of all) {
    console.log(`  ${item.id}: ${item.name} | eligibleGroups: ${item.eligibleGroups}`);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
