import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : undefined;
    const columnId = Number(body.columnId);

    if (!title || Number.isNaN(columnId)) {
      return NextResponse.json(
        { message: "Title and column are required" },
        { status: 400 }
      );
    }

    const column = await prisma.column.findUnique({
      where: { id: columnId }
    });

    if (!column) {
      return NextResponse.json(
        { message: "Column not found" },
        { status: 404 }
      );
    }

    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" }
    });

    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        columnId,
        position
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}
