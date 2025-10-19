"use client";

import { useState } from "react";

type NewTaskFormProps = {
  onSubmit: (values: { title: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export default function NewTaskForm({
  onSubmit,
  onCancel,
  isSubmitting
}: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!title.trim()) {
          return;
        }

        await onSubmit({
          title: title.trim(),
          description: description.trim() ? description.trim() : undefined
        });
        setTitle("");
        setDescription("");
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        background: "rgba(248, 250, 252, 0.95)",
        borderRadius: "0.75rem",
        padding: "0.75rem"
      }}
    >
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        style={{
          padding: "0.5rem 0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(148, 163, 184, 0.6)",
          fontSize: "0.95rem"
        }}
        required
        disabled={isSubmitting}
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        style={{
          padding: "0.5rem 0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(148, 163, 184, 0.6)",
          fontSize: "0.95rem",
          resize: "vertical"
        }}
        disabled={isSubmitting}
      />
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setDescription("");
            onCancel();
          }}
          style={{
            padding: "0.45rem 1rem",
            borderRadius: "999px",
            border: "1px solid rgba(148, 163, 184, 0.6)",
            background: "white",
            cursor: "pointer"
          }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: "0.45rem 1.1rem",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
            color: "white",
            cursor: "pointer"
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Add"}
        </button>
      </div>
    </form>
  );
}
