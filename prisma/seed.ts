import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Moradia", icon: "🏠", color: "#6366f1" },
  { name: "Alimentação", icon: "🛒", color: "#f59e0b" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6" },
  { name: "Saúde", icon: "💊", color: "#10b981" },
  { name: "Lazer", icon: "🎬", color: "#ec4899" },
  { name: "Educação", icon: "📚", color: "#8b5cf6" },
  { name: "Serviços", icon: "💡", color: "#06b6d4" },
  { name: "Vestuário", icon: "👕", color: "#f97316" },
  { name: "Pet", icon: "🐾", color: "#84cc16" },
  { name: "Outros", icon: "📦", color: "#6b7280" },
  { name: "Salário", icon: "💰", color: "#22c55e" },
];

function dateInPast(monthsAgo: number, day: number) {
  const d = new Date();
  d.setDate(day);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.couple.deleteMany();

  const hashedPassword = await bcrypt.hash("demo123", 12);

  const couple = await prisma.couple.create({
    data: { inviteCode: "DEMO01" },
  });

  const [ana, carlos] = await Promise.all([
    prisma.user.create({
      data: { name: "Ana Silva", email: "ana@demo.com", password: hashedPassword, coupleId: couple.id },
    }),
    prisma.user.create({
      data: { name: "Carlos Oliveira", email: "carlos@demo.com", password: hashedPassword, coupleId: couple.id },
    }),
  ]);

  const cats = await Promise.all(
    CATEGORIES.map((c) =>
      prisma.category.create({ data: { ...c, coupleId: couple.id, isDefault: true } })
    )
  );

  const catMap = Object.fromEntries(cats.map((c) => [c.name, c]));

  const transactions: Parameters<typeof prisma.transaction.create>[0]["data"][] = [];

  for (let mo = 5; mo >= 0; mo--) {
    const anaSalary = 5200 + (mo % 2 === 0 ? 300 : 0);
    const carlosSalary = 4800 + (mo % 3 === 0 ? 500 : 0);

    transactions.push(
      { type: "income", amount: anaSalary, description: "Salário - Ana", date: dateInPast(mo, 5), categoryId: catMap["Salário"].id, userId: ana.id, coupleId: couple.id },
      { type: "income", amount: carlosSalary, description: "Salário - Carlos", date: dateInPast(mo, 6), categoryId: catMap["Salário"].id, userId: carlos.id, coupleId: couple.id },
      { type: "expense", amount: 1800, description: "Aluguel", date: dateInPast(mo, 10), categoryId: catMap["Moradia"].id, userId: ana.id, coupleId: couple.id, isRecurring: true },
      { type: "expense", amount: 89, description: "Internet + TV", date: dateInPast(mo, 10), categoryId: catMap["Serviços"].id, userId: carlos.id, coupleId: couple.id, isRecurring: true },
      { type: "expense", amount: 45, description: "Luz", date: dateInPast(mo, 12), categoryId: catMap["Serviços"].id, userId: ana.id, coupleId: couple.id },
      { type: "expense", amount: 520 + Math.random() * 100, description: "Mercado semanal", date: dateInPast(mo, 8), categoryId: catMap["Alimentação"].id, userId: ana.id, coupleId: couple.id },
      { type: "expense", amount: 180 + Math.random() * 50, description: "Restaurante", date: dateInPast(mo, 14), categoryId: catMap["Alimentação"].id, userId: carlos.id, coupleId: couple.id },
      { type: "expense", amount: 220 + Math.random() * 80, description: "Gasolina", date: dateInPast(mo, 7), categoryId: catMap["Transporte"].id, userId: carlos.id, coupleId: couple.id },
      { type: "expense", amount: 55, description: "Netflix + Spotify", date: dateInPast(mo, 3), categoryId: catMap["Lazer"].id, userId: ana.id, coupleId: couple.id, isRecurring: true },
      { type: "expense", amount: 280, description: "Plano de saúde", date: dateInPast(mo, 5), categoryId: catMap["Saúde"].id, userId: ana.id, coupleId: couple.id, isRecurring: true },
    );

    if (mo % 2 === 0) {
      transactions.push(
        { type: "expense", amount: 350 + Math.random() * 200, description: "Roupas", date: dateInPast(mo, 20), categoryId: catMap["Vestuário"].id, userId: ana.id, coupleId: couple.id },
      );
    }
    if (mo % 3 === 0) {
      transactions.push(
        { type: "income", amount: 800, description: "Freelance", date: dateInPast(mo, 18), categoryId: catMap["Salário"].id, userId: carlos.id, coupleId: couple.id },
      );
    }
    if (mo === 0) {
      transactions.push(
        { type: "expense", amount: 120, description: "Academia", date: dateInPast(0, 3), categoryId: catMap["Saúde"].id, userId: carlos.id, coupleId: couple.id, isRecurring: true },
        { type: "expense", amount: 85, description: "Veterinário - Thor", date: dateInPast(0, 9), categoryId: catMap["Pet"].id, userId: ana.id, coupleId: couple.id },
        { type: "expense", amount: 450, description: "Curso de inglês", date: dateInPast(0, 2), categoryId: catMap["Educação"].id, userId: carlos.id, coupleId: couple.id },
      );
    }
  }

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx as Parameters<typeof prisma.transaction.create>[0]["data"] });
  }

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  await Promise.all([
    prisma.budget.create({ data: { coupleId: couple.id, categoryId: catMap["Alimentação"].id, month: currentMonth, limitAmount: 800 } }),
    prisma.budget.create({ data: { coupleId: couple.id, categoryId: catMap["Lazer"].id, month: currentMonth, limitAmount: 300 } }),
    prisma.budget.create({ data: { coupleId: couple.id, categoryId: catMap["Transporte"].id, month: currentMonth, limitAmount: 400 } }),
  ]);

  console.log("✅ Seed concluído!");
  console.log("📧 Ana: ana@demo.com / demo123");
  console.log("📧 Carlos: carlos@demo.com / demo123");
  console.log(`🔗 Código de convite: DEMO01`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
