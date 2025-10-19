import { NextResponse } from "next/server";
import { getBoard } from "@/lib/board";

export async function GET() {
  try {
    const board = await getBoard();
    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to load board" },
      { status: 500 }
    );
  }
}
