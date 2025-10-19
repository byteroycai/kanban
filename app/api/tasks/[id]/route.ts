import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const id = Number.parseInt(context.params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid task id" }, { status: 400 });
  }

  const body = await request.json();
  const columnId = Number(body.columnId);
  const position = Number(body.position);

  if (Number.isNaN(columnId) || Number.isNaN(position)) {
    return NextResponse.json(
      { message: "Column and position are required" },
      { status: 400 }
    );
  }

  try {
    const destinationColumn = await prisma.column.findUnique({
      where: { id: columnId }
    });

    if (!destinationColumn) {
      return NextResponse.json({ message: "Column not found" }, { status: 404 });
    }

    await prisma.$transaction(async (transaction) => {
      const existingTask = await transaction.task.findUnique({
        where: { id }
      });

      if (!existingTask) {
        throw new Error("NOT_FOUND");
      }

      const sourceColumnId = existingTask.columnId;

      await transaction.task.update({
        where: { id },
        data: { columnId }
      });

      const movedTask = await transaction.task.findUniqueOrThrow({
        where: { id }
      });

      const destinationTasks = await transaction.task.findMany({
        where: { columnId },
        orderBy: { position: "asc" }
      });

      const filteredDestination = destinationTasks.filter((task) => task.id !== id);

      const safeIndex = Math.max(0, Math.min(position, filteredDestination.length));
      filteredDestination.splice(safeIndex, 0, movedTask);

      await Promise.all(
        filteredDestination.map((task, index) =>
          transaction.task.update({
            where: { id: task.id },
            data: { position: index }
          })
        )
      );

      if (sourceColumnId !== columnId) {
        const sourceTasks = await transaction.task.findMany({
          where: { columnId: sourceColumnId },
          orderBy: { position: "asc" }
        });

        await Promise.all(
          sourceTasks.map((task, index) =>
            transaction.task.update({
              where: { id: task.id },
              data: { position: index }
            })
          )
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json(
      { message: "Failed to move task" },
      { status: 500 }
    );
  }
}
