import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const columns = [
    { name: "Backlog", order: 0 },
    { name: "In Progress", order: 1 },
    { name: "Review", order: 2 },
    { name: "Done", order: 3 }
  ];

  for (const column of columns) {
    await prisma.column.upsert({
      where: { order: column.order },
      create: column,
      update: { name: column.name }
    });
  }

  const tasksCount = await prisma.task.count();

  if (tasksCount === 0) {
    const backlog = await prisma.column.findFirstOrThrow({
      where: { name: "Backlog" }
    });

    await prisma.task.createMany({
      data: [
        {
          title: "Design project structure",
          description: "Sketch initial data model and UI layout",
          columnId: backlog.id,
          position: 0
        },
        {
          title: "Draft requirements",
          description: "Collect user stories for MVP",
          columnId: backlog.id,
          position: 1
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
