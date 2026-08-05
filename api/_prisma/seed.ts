import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@attendx.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        department: "Administration",
        year: 1,
        role: "ADMIN",
        pointsBalance: 0,
        skills: ["Management", "Leadership"],
        interests: ["Platform Growth", "Student Welfare"],
      },
    });
    console.log("✅ Admin user created: admin@attendx.com / admin123");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  const sampleRewards = [
    { title: "Samosa + Chai Combo", category: "CANTEEN", pointCost: 10, availableQty: 50 },
    { title: "Free Lunch Coupon", category: "CANTEEN", pointCost: 30, availableQty: 20 },
    { title: "Notebook Pack (5)", category: "STATIONERY", pointCost: 15, availableQty: 30 },
    { title: "College Pen Set", category: "STATIONERY", pointCost: 5, availableQty: 100 },
    { title: "50 Print Credits", category: "PRINTING", pointCost: 20, availableQty: 40 },
    { title: "100 Print Credits", category: "PRINTING", pointCost: 35, availableQty: 20 },
  ];

  for (const reward of sampleRewards) {
    const exists = await prisma.rewardItem.findFirst({ where: { title: reward.title } });
    if (!exists) {
      await prisma.rewardItem.create({ data: reward });
    }
  }
  console.log("✅ Sample reward items seeded");

  const sampleLaptops = [
    { modelName: "Dell Inspiron 15", specs: "i5/8GB/256GB SSD", labLocation: "Lab 101", hourlyRate: 5 },
    { modelName: "HP Pavilion 14", specs: "i7/16GB/512GB SSD", labLocation: "Lab 102", hourlyRate: 8 },
    { modelName: "Lenovo ThinkPad", specs: "i5/8GB/256GB SSD", labLocation: "Lab 101", hourlyRate: 6 },
    { modelName: "MacBook Air M1", specs: "M1/8GB/256GB", labLocation: "Lab 201", hourlyRate: 12 },
    { modelName: "ASUS ROG Zephyrus", specs: "i7/16GB/1TB SSD/RTX3060", labLocation: "Lab 202", hourlyRate: 15 },
  ];

  for (const laptop of sampleLaptops) {
    const exists = await prisma.laptopInventory.findFirst({ where: { modelName: laptop.modelName } });
    if (!exists) {
      await prisma.laptopInventory.create({ data: laptop });
    }
  }
  console.log("✅ Sample laptops seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
