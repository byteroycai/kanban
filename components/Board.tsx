"use client";

import { useCallback, useMemo, useState } from "react";
import type { Column, Task } from "@prisma/client";
import {
  DragDropContext,
  type DropResult,
  Draggable,
  Droppable
} from "@hello-pangea/dnd";
import NewTaskForm from "@/components/NewTaskForm";
import TaskCard from "@/components/TaskCard";

export type ColumnWithTasks = Column & { tasks: Task[] };

type BoardProps = {
  initialColumns: ColumnWithTasks[];
};

function cloneColumns(columns: ColumnWithTasks[]) {
  return columns.map((column) => ({
    ...column,
    tasks: column.tasks.map((task) => ({ ...task }))
  }));
}

export default function Board({ initialColumns }: BoardProps) {
  const [columns, setColumns] = useState(() => cloneColumns(initialColumns));
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [submittingColumnId, setSubmittingColumnId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columnsById = useMemo(() => {
    const map = new Map<number, ColumnWithTasks>();
    for (const column of columns) {
      map.set(column.id, column);
    }

    return map;
  }, [columns]);

  const refreshBoard = useCallback(async () => {
    const response = await fetch("/api/board", {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error("Failed to refresh board state");
    }

    const data = (await response.json()) as ColumnWithTasks[];
    setColumns(cloneColumns(data));
  }, []);

  const handleCreateTask = useCallback(
    async (
      columnId: number,
      values: { title: string; description?: string }
    ) => {
      setSubmittingColumnId(columnId);
      setError(null);
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            columnId,
            title: values.title,
            description: values.description
          })
        });

        if (!response.ok) {
          throw new Error("Unable to create task");
        }

        await refreshBoard();
        setActiveColumnId(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSubmittingColumnId(null);
      }
    },
    [refreshBoard]
  );

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const sourceColumnId = Number.parseInt(source.droppableId, 10);
      const destinationColumnId = Number.parseInt(destination.droppableId, 10);
      const taskId = Number.parseInt(draggableId, 10);

      setColumns((previous) => {
        const draft = cloneColumns(previous);
        const sourceColumn = draft.find((column) => column.id === sourceColumnId);
        const destinationColumn = draft.find(
          (column) => column.id === destinationColumnId
        );

        if (!sourceColumn || !destinationColumn) {
          return previous;
        }

        const [task] = sourceColumn.tasks.splice(source.index, 1);
        if (!task) {
          return previous;
        }

        task.columnId = destinationColumnId;
        destinationColumn.tasks.splice(destination.index, 0, task);

        return draft;
      });

      try {
        setIsSyncing(true);
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            columnId: destinationColumnId,
            position: destination.index
          })
        });

        if (!response.ok) {
          throw new Error("Failed to reorder task");
        }

        await refreshBoard();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error");
        await refreshBoard();
      } finally {
        setIsSyncing(false);
      }
    },
    [refreshBoard]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error ? (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            fontSize: "0.9rem"
          }}
        >
          {error}
        </div>
      ) : null}
      {isSyncing ? (
        <div
          style={{
            backgroundColor: "#e0f2fe",
            color: "#075985",
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            fontSize: "0.85rem"
          }}
        >
          Syncing board...
        </div>
      ) : null}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "flex-start",
            overflowX: "auto",
            paddingBottom: "0.5rem"
          }}
        >
          {columns.map((column) => (
            <Droppable droppableId={column.id.toString()} key={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: "0 0 280px",
                    minWidth: "260px",
                    background: snapshot.isDraggingOver
                      ? "linear-gradient(160deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))"
                      : "linear-gradient(160deg, #f8fafc, #e2e8f0)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "1rem",
                    padding: "1rem",
                    boxShadow:
                      "0 20px 45px -20px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                    minHeight: "280px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem"
                  }}
                >
                  <header style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "1.2rem",
                          fontWeight: 600
                        }}
                      >
                        {column.name}
                      </h2>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {column.tasks.length} tasks
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveColumnId((current) =>
                          current === column.id ? null : column.id
                        )
                      }
                      style={{
                        background: "none",
                        border: "1px solid rgba(148, 163, 184, 0.5)",
                        borderRadius: "999px",
                        padding: "0.25rem 0.75rem",
                        cursor: "pointer",
                        fontSize: "0.85rem"
                      }}
                    >
                      {activeColumnId === column.id ? "Close" : "+ Task"}
                    </button>
                  </header>
                  {activeColumnId === column.id ? (
                    <NewTaskForm
                      onSubmit={async (values) => {
                        await handleCreateTask(column.id, values);
                      }}
                      onCancel={() => setActiveColumnId(null)}
                      isSubmitting={submittingColumnId === column.id}
                    />
                  ) : null}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {column.tasks.map((task, index) => (
                      <Draggable
                        draggableId={task.id.toString()}
                        index={index}
                        key={task.id}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              opacity: dragSnapshot.isDragging ? 0.75 : 1
                            }}
                          >
                            <TaskCard task={task} column={columnsById.get(task.columnId)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
