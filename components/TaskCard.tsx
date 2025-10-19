"use client";

import type { Column, Task } from "@prisma/client";

type TaskCardProps = {
  task: Task;
  column?: Column;
};

export default function TaskCard({ task, column }: TaskCardProps) {
  return (
    <article
      style={{
        background: "white",
        borderRadius: "0.75rem",
        padding: "0.85rem",
        boxShadow:
          "0 12px 30px -15px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        border: "1px solid rgba(226, 232, 240, 0.8)"
      }}
    >
      <header>
        <h3
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "#1f2937"
          }}
        >
          {task.title}
        </h3>
        {column ? (
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {column.name}
          </span>
        ) : null}
      </header>
      {task.description ? (
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "#475569",
            lineHeight: 1.45
          }}
        >
          {task.description}
        </p>
      ) : null}
    </article>
  );
}
