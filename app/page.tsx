import Board from "@/components/Board";
import { getBoard } from "@/lib/board";

export default async function Home() {
  const columns = await getBoard();

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          textAlign: "center"
        }}
      >
        Team Kanban
      </h1>
      <Board initialColumns={columns} />
    </main>
  );
}
