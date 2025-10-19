"use client";

import { useEffect, useState } from "react";
import type { Column, Task } from "@prisma/client";

type TaskCardProps = {
  task: Task;
  column?: Column;
  accentColor?: string;
  onUpdate?: (values: { title: string; description?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
};

export default function TaskCard({
  task,
  column,
  accentColor,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  useEffect(() => {
    if (!isEditing) {
      setTitle(task.title);
      setDescription(task.description ?? "");
    }
  }, [task, isEditing]);

  const showActions = Boolean(onUpdate) || Boolean(onDelete);

  return (
    <article
      style={{
        background: accentColor ?? "#ffffff",
        borderRadius: "0.85rem",
        padding: "0.9rem",
        boxShadow:
          "0 14px 32px -18px rgba(15, 23, 42, 0.3), inset 0 1px 0 rgba(255,255,255,0.6)",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease"
      }}
    >
      {isEditing && onUpdate ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const trimmedTitle = title.trim();
            if (!trimmedTitle) {
              return;
            }

            try {
              await onUpdate({
                title: trimmedTitle,
                description: description.trim() ? description.trim() : undefined
              });
              setIsEditing(false);
            } catch (error) {
              console.error(error);
            }
          }}
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isUpdating}
            style={{
              padding: "0.45rem 0.65rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(100, 116, 139, 0.45)",
              fontSize: "0.95rem"
            }}
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isUpdating}
            rows={3}
            style={{
              padding: "0.45rem 0.65rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(100, 116, 139, 0.45)",
              fontSize: "0.9rem",
              resize: "vertical"
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setTitle(task.title);
                setDescription(task.description ?? "");
              }}
              disabled={isUpdating}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                border: "1px solid rgba(100, 116, 139, 0.45)",
                background: "white",
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                color: "white",
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <>
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
              <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                {column.name}
              </span>
            ) : null}
          </header>
          {task.description ? (
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "#334155",
                lineHeight: 1.45
              }}
            >
              {task.description}
            </p>
          ) : null}
        </>
      )}
      {showActions ? (
        <div
          style={{
            marginTop: "0.25rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem"
          }}
        >
          {onUpdate ? (
            <button
              type="button"
              onClick={() => setIsEditing((current) => !current)}
              disabled={isUpdating || isDeleting}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid rgba(79, 70, 229, 0.35)",
                background: isEditing ? "rgba(79, 70, 229, 0.16)" : "white",
                color: "#3730a3",
                cursor: "pointer",
                fontSize: "0.8rem"
              }}
            >
              {isEditing ? "Close" : "Edit"}
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={async () => {
                if (!onDelete || isDeleting) {
                  return;
                }

                const confirmed = window.confirm("Delete this task?");
                if (!confirmed) {
                  return;
                }

                try {
                  await onDelete();
                } catch (error) {
                  console.error(error);
                }
              }}
              disabled={isDeleting || isUpdating}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid rgba(220, 38, 38, 0.35)",
                background: "white",
                color: "#b91c1c",
                cursor: "pointer",
                fontSize: "0.8rem"
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
