"use client";

import React, { useState } from "react";
import { Plus, GitFork } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Issue } from "@/types/issue";

interface TaskSubtasksProps {
  subtasks: Issue[];
  isAddingSubtask: boolean;
  onOpenAddSubtask: () => void;
  onCloseAddSubtask: () => void;
  onCreateSubtask: (title: string) => void;
  isCreatingSubtask: boolean;
  onToggleSubtask: (subId: string, done: boolean) => void;
}

export function TaskSubtasks({
  subtasks,
  isAddingSubtask,
  onOpenAddSubtask,
  onCloseAddSubtask,
  onCreateSubtask,
  isCreatingSubtask,
  onToggleSubtask,
}: TaskSubtasksProps) {
  const [title, setTitle] = useState("");

  const completedCount = subtasks.filter((s) => s.status === "DONE").length;

  const handleSubmit = () => {
    if (title.trim()) {
      onCreateSubtask(title.trim());
      setTitle("");
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#44546f" }}>
          Subtasks{" "}
          {subtasks.length > 0 && `(${completedCount}/${subtasks.length})`}
        </h3>
      </div>

      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div
          style={{
            height: 5,
            backgroundColor: "#e9f2ff",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(completedCount / subtasks.length) * 100}%`,
              backgroundColor: "#16a34a",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Subtasks Table: show compact table with Work / Priority / Assignee / Status */}
      {subtasks.length > 0 && (
        <div
          style={{
            marginBottom: 8,
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background: "#fafbfc",
            }}
          >
            <strong style={{ fontSize: "0.85rem", color: "#44546f" }}>
              Child work items
            </strong>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", background: "#ffffff" }}>
                <th style={{ padding: "8px 12px", width: "50%" }}>Work</th>
                <th style={{ padding: "8px 12px", width: "15%" }}>Priority</th>
                <th style={{ padding: "8px 12px", width: "20%" }}>Assignee</th>
                <th style={{ padding: "8px 12px", width: "15%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {subtasks.map((st) => (
                <tr
                  key={st.id}
                  style={{
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                    background: "#ffffff",
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="checkbox"
                        checked={st.status === "DONE"}
                        onChange={(e) =>
                          onToggleSubtask(st.id, e.target.checked)
                        }
                        style={{ cursor: "pointer" }}
                        title={
                          st.status === "DONE"
                            ? "Mark as To Do"
                            : "Mark as Done"
                        }
                      />
                      <GitFork size={14} color="#0284c7" />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, color: "#0c66e4" }}>
                          {st.key}
                        </span>
                        <span style={{ color: "#172b4d" }}>{st.title}</span>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#44546f",
                      fontWeight: 600,
                    }}
                  >
                    {st.priority || "None"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {st.assignee ? (
                        <>
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              overflow: "hidden",
                            }}
                          >
                            {/* avatar placeholder if available */}
                            {/* ...could use Avatar component if desired */}
                          </span>
                          <span style={{ color: "#172b4d" }}>
                            {st.assignee?.fullName}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: "#626f86" }}>Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: st.status === "DONE" ? "#006644" : "#44546f",
                      fontWeight: 600,
                    }}
                  >
                    {st.status === "DONE" ? "Done" : "To Do"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Create Input or Button */}
      {isAddingSubtask ? (
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 4,
              border: "2px solid #0c66e4",
              fontSize: "0.875rem",
              outline: "none",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") onCloseAddSubtask();
            }}
          />
          <Button
            size="sm"
            disabled={!title.trim()}
            loading={isCreatingSubtask}
            onClick={handleSubmit}
          >
            Create
          </Button>
          <Button size="sm" variant="ghost" onClick={onCloseAddSubtask}>
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenAddSubtask}
          style={{
            background: "none",
            border: "none",
            padding: "6px 8px",
            borderRadius: 4,
            color: "#44546f",
            cursor: "pointer",
            fontSize: "0.8125rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f1f2f4")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Plus size={14} />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
}
