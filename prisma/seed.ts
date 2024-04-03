import { prisma } from "../src/lib/prisma";

async function seed() {
  await prisma.event.create({
    data: {
      id: "4d581edb-3f8c-4224-9182-c4398cfea080",
      title: "Unite Summit 2024",
      slug: "unite-summit-2024",
      details: "First annual Unite Summit in 2024",
      maximumAttendees: 120,
      price: 0,
    },
  });
}

seed().then(() => {
  console.log("🌱 Seed complete");
  prisma.$disconnect();
});
