import { prisma } from "@/lib/prisma";

export async function getBoard() {
  const columns = await prisma.column.findMany({
    orderBy: { order: "asc" },
    include: {
      tasks: {
        orderBy: { position: "asc" }
      }
    }
  });

  return columns;
}
