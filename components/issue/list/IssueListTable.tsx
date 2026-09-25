"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import type {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueType,
} from "@/types/issue";
import { IssueListRow } from "./IssueListRow";
import { IssueListQuickCreate } from "./IssueListQuickCreate";
import { IssueListFooter } from "./IssueListFooter";
import type { ColumnId } from "./column-types";
import {
  DEFAULT_COLUMN_DEFINITIONS,
  DEFAULT_COLUMN_ORDER,
  DEFAULT_COLUMN_WIDTHS,
} from "./column-types";

interface ProjectMember {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

interface IssueListTableProps {
  issues: Issue[];
  allIssuesCount: number;
  selectedIds: Set<string>;
  selectedIssueId?: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: IssueStatus) => void;
  onUpdateAssignee: (id: string, assigneeId: string | null) => void;
  onUpdatePriority: (id: string, priority: IssuePriority) => void;
  onUpdateDueDate?: (id: string, dueDate: string | null) => void;
  inlineCreateOpen: boolean;
  inlineCreateParentId?: string | "ROOT" | null;
  onCloseInlineCreate: () => void;
  onOpenInlineCreate: () => void;
  onSubmitInlineCreate: (data: {
    title: string;
    type: IssueType;
    priority: IssuePriority;
    dueDate?: string;
  }) => Promise<void>;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onAddChild?: (issue: Issue) => void;
  members: ProjectMember[];
  isSubmittingCreate: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
  expandedParentIds?: Set<string>;
  onToggleExpand?: (parentId: string) => void;
}

export function IssueListTable(props: IssueListTableProps) {
  const {
    issues,
    allIssuesCount,
    selectedIds,
    selectedIssueId,
    onToggleSelect,
    onToggleSelectAll,
    onOpenDetail,
    onDelete,
    onUpdateStatus,
    onUpdateAssignee,
    onUpdatePriority,
    onUpdateDueDate,
    inlineCreateParentId,
    onCloseInlineCreate,
    onOpenInlineCreate,
    onSubmitInlineCreate,
    onAddChild,
    members,
    isSubmittingCreate,
    onRefresh,
    isRefreshing = false,
  } = props;

  // Local state for column customization
  const [columnOrder, setColumnOrder] =
    useState<ColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnId>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<ColumnId, number>>(
    DEFAULT_COLUMN_WIDTHS,
  );
  const [resizingCol, setResizingCol] = useState<ColumnId | null>(null);
  const [hoveredCol, setHoveredCol] = useState<ColumnId | null>(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    column: ColumnId;
    direction: "asc" | "desc";
  } | null>(null);

  // Column options dropdown menu state
  const [activeMenuCol, setActiveMenuCol] = useState<ColumnId | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Column configure popover state (SlidersHorizontal)
  const [configOpen, setConfigOpen] = useState(false);
  const configBtnRef = useRef<HTMLButtonElement>(null);
  const [configPos, setConfigPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Visible columns in user-configured order
  const visibleColumns = useMemo(
    () => columnOrder.filter((id) => !hiddenColumns.has(id)),
    [columnOrder, hiddenColumns],
  );

  // Close menus on outside click
  useEffect(() => {
    if (!activeMenuCol && !configOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const colMenu = document.getElementById("column-options-portal-menu");
      if (colMenu && colMenu.contains(target)) return;

      const configMenu = document.getElementById("column-config-portal-menu");
      if (configMenu && configMenu.contains(target)) return;

      setActiveMenuCol(null);
      setConfigOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuCol, configOpen]);

  // Column Resizing logic
  const handleResizeStart = (colId: ColumnId, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const thElement = e.currentTarget.closest("th") as HTMLElement;
    const startWidth = thElement
      ? thElement.offsetWidth
      : columnWidths[colId] || DEFAULT_COLUMN_WIDTHS[colId] || 120;
    setResizingCol(colId);

    // find next visible column to resize inversely so table doesn't jump
    const visible = visibleColumns;
    const idx = visible.indexOf(colId);
    const nextColId =
      idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : null;
    const startWidthNext = nextColId
      ? columnWidths[nextColId] || DEFAULT_COLUMN_WIDTHS[nextColId] || 120
      : null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const delta = moveEvent.clientX - startX;
      const colDef = DEFAULT_COLUMN_DEFINITIONS.find((c) => c.id === colId);
      const minW = colDef?.minWidth || 60;
      const newWidth = Math.max(minW, Math.round(startWidth + delta));

      // If there's a next column, shrink/expand it inversely to keep layout steady
      if (nextColId && startWidthNext != null) {
        const nextColDef = DEFAULT_COLUMN_DEFINITIONS.find(
          (c) => c.id === nextColId,
        );
        const minNext = nextColDef?.minWidth || 60;
        const nextNew = Math.max(minNext, Math.round(startWidthNext - delta));
        setColumnWidths((prev) => {
          const cur = prev[colId] || startWidth;
          const nxt = prev[nextColId] || startWidthNext;
          if (cur === newWidth && nxt === nextNew) return prev;
          return { ...prev, [colId]: newWidth, [nextColId]: nextNew };
        });
        return;
      }

      setColumnWidths((prev) => {
        if (prev[colId] === newWidth) return prev;
        return { ...prev, [colId]: newWidth };
      });
    };

    const handleMouseUp = () => {
      setResizingCol(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Total table width calculated from column widths
  const totalTableWidth = useMemo(() => {
    const colsSum = visibleColumns.reduce((sum, id) => {
      return sum + (columnWidths[id] || DEFAULT_COLUMN_WIDTHS[id] || 120);
    }, 0);
    return 40 + colsSum; // 40 for checkbox
  }, [visibleColumns, columnWidths]);

  // Toggle column options menu
  const handleOpenColMenu = (
    colId: ColumnId,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    if (activeMenuCol === colId) {
      setActiveMenuCol(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      left: Math.max(8, rect.left + window.scrollX - 120),
    });
    setActiveMenuCol(colId);
  };

  // Open column configure menu
  const handleOpenConfig = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (configOpen) {
      setConfigOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setConfigPos({
      top: rect.bottom + window.scrollY + 4,
      left: Math.max(8, rect.right + window.scrollX - 180),
    });
    setConfigOpen(true);
  };

  // Column Menu Actions
  const handleSort = (colId: ColumnId, direction: "asc" | "desc") => {
    setSortConfig({ column: colId, direction });
    setActiveMenuCol(null);
  };

  const handleMoveToFirst = (colId: ColumnId) => {
    setColumnOrder((prev) => [colId, ...prev.filter((c) => c !== colId)]);
    setActiveMenuCol(null);
  };

  const handleMoveLeft = (colId: ColumnId) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(colId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
    setActiveMenuCol(null);
  };

  const handleMoveRight = (colId: ColumnId) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(colId);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
    setActiveMenuCol(null);
  };

  const handleMoveToLast = (colId: ColumnId) => {
    setColumnOrder((prev) => [...prev.filter((c) => c !== colId), colId]);
    setActiveMenuCol(null);
  };

  const handleRemoveColumn = (colId: ColumnId) => {
    setHiddenColumns((prev) => new Set(prev).add(colId));
    setActiveMenuCol(null);
  };

  const toggleColumnVisibility = (colId: ColumnId) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  };

  // Sorting issues
  const sortedIssues = useMemo(() => {
    if (!sortConfig) return issues;
    const { column, direction } = sortConfig;
    const mult = direction === "asc" ? 1 : -1;

    return [...issues].sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      switch (column) {
        case "work":
          aVal = a.title || a.key;
          bVal = b.title || b.key;
          break;
        case "assignee":
          aVal = a.assignee?.fullName || "";
          bVal = b.assignee?.fullName || "";
          break;
        case "reporter":
          aVal = a.reporter?.fullName || "";
          bVal = b.reporter?.fullName || "";
          break;
        case "priority": {
          const priorityWeights: Record<string, number> = {
            HIGHEST: 5,
            HIGH: 4,
            MEDIUM: 3,
            LOW: 2,
            LOWEST: 1,
          };
          aVal = priorityWeights[a.priority] || 0;
          bVal = priorityWeights[b.priority] || 0;
          return (aVal - bVal) * mult;
        }
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "resolution":
          aVal = a.status === "DONE" ? "Done" : "Unresolved";
          bVal = b.status === "DONE" ? "Done" : "Unresolved";
          break;
        case "created":
          aVal = new Date(a.createdAt).getTime() || 0;
          bVal = new Date(b.createdAt).getTime() || 0;
          return (aVal - bVal) * mult;
        case "updated":
          aVal = new Date(a.updatedAt || a.createdAt).getTime() || 0;
          bVal = new Date(b.updatedAt || b.createdAt).getTime() || 0;
          return (aVal - bVal) * mult;
        case "dueDate":
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return (aVal - bVal) * mult;
        default:
          return 0;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * mult;
      }
      return (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) * mult;
    });
  }, [issues, sortConfig]);

  const [localExpanded, setLocalExpanded] = useState<Set<string>>(new Set());
  const expandedParentIds = props.expandedParentIds ?? localExpanded;
  const onToggleExpand =
    props.onToggleExpand ??
    ((id: string) => {
      setLocalExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    });

  // Set of all issue IDs present in current list
  const issueIdSet = useMemo(
    () => new Set(sortedIssues.map((i) => i.id)),
    [sortedIssues],
  );

  // Group issues into roots and children map (by parentId)
  const { rootIssues, childrenMap } = useMemo(() => {
    const roots: Issue[] = [];
    const children = new Map<string, Issue[]>();

    sortedIssues.forEach((issue) => {
      if (issue.parentId && issueIdSet.has(issue.parentId)) {
        const list = children.get(issue.parentId) || [];
        list.push(issue);
        children.set(issue.parentId, list);
      } else {
        roots.push(issue);
      }
    });

    return { rootIssues: roots, childrenMap: children };
  }, [sortedIssues, issueIdSet]);

  const isAllSelected =
    sortedIssues.length > 0 && selectedIds.size === sortedIssues.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < sortedIssues.length;

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid #dcdfe4",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Absolute Top-Right Configure Columns Button */}
      <button
        ref={configBtnRef}
        type="button"
        onClick={handleOpenConfig}
        title="Configure columns"
        style={{
          position: "absolute",
          top: 6,
          right: 8,
          zIndex: 40,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: 4,
          border: configOpen ? "1px solid #0c66e4" : "1px solid #dcdfe4",
          backgroundColor: configOpen ? "#e9f2ff" : "#f4f5f7",
          color: configOpen ? "#0c66e4" : "#44546f",
          cursor: "pointer",
          padding: 0,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e9f2ff";
          e.currentTarget.style.color = "#0c66e4";
          e.currentTarget.style.borderColor = "#0c66e4";
        }}
        onMouseLeave={(e) => {
          if (!configOpen) {
            e.currentTarget.style.backgroundColor = "#f4f5f7";
            e.currentTarget.style.color = "#44546f";
            e.currentTarget.style.borderColor = "#dcdfe4";
          }
        }}
      >
        <SlidersHorizontal size={14} />
      </button>

      {/* Scrollable Table Area */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#94a3b8 #f1f5f9",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: totalTableWidth,
            tableLayout: "fixed",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          {/* Explicit col widths for smooth, unconstrained resizing */}
          <colgroup>
            <col style={{ width: 40 }} />
            {visibleColumns.map((colId) => (
              <col
                key={colId}
                style={{
                  width:
                    columnWidths[colId] || DEFAULT_COLUMN_WIDTHS[colId] || 120,
                }}
              />
            ))}
          </colgroup>

          {/* Table Header */}
          <thead>
            <tr
              style={{
                backgroundColor: "#f4f5f7",
                borderBottom: "1px solid #dcdfe4",
                color: "#44546f",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                userSelect: "none",
              }}
            >
              {/* Checkbox */}
              <th
                style={{
                  width: 40,
                  textAlign: "center",
                  padding: "10px 10px",
                  verticalAlign: "middle",
                  borderRight: "1px solid #dcdfe4",
                  borderBottom: "1px solid #dcdfe4",
                  boxSizing: "border-box",
                  backgroundColor: "#f4f5f7",
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={onToggleSelectAll}
                  style={{
                    cursor: "pointer",
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    accentColor: "var(--color-green-brand)",
                  }}
                />
              </th>

              {/* Dynamic Sizable Columns */}
              {visibleColumns.map((colId, index) => {
                const isLast = index === visibleColumns.length - 1;
                const colDef = DEFAULT_COLUMN_DEFINITIONS.find(
                  (c) => c.id === colId,
                );
                const label = colDef?.label || colId;
                const width =
                  columnWidths[colId] || colDef?.defaultWidth || 120;
                const isSorted = sortConfig?.column === colId;

                return (
                  <th
                    key={colId}
                    onMouseEnter={() => setHoveredCol(colId)}
                    onMouseLeave={() => setHoveredCol(null)}
                    style={{
                      padding: isLast ? "8px 38px 8px 10px" : "8px 10px",
                      width,
                      position: "relative",
                      verticalAlign: "middle",
                      borderRight: isLast ? "none" : "1px solid #dcdfe4",
                      borderBottom: "1px solid #dcdfe4",
                      boxSizing: "border-box",
                      backgroundColor: "#f4f5f7",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        minWidth: 0,
                        width: "100%",
                      }}
                    >
                      {/* Column Title + Sort click */}
                      <div
                        onClick={() => {
                          if (isSorted && sortConfig?.direction === "asc") {
                            handleSort(colId, "desc");
                          } else {
                            handleSort(colId, "asc");
                          }
                        }}
                        style={{
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          minWidth: 0,
                        }}
                        title={`Click to sort by ${label}`}
                      >
                        {colId === "work" && (
                          <ChevronRight
                            size={14}
                            style={{
                              color: "var(--color-text-secondary)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </span>
                        {isSorted && (
                          <span
                            style={{
                              color: "#0c66e4",
                              display: "inline-flex",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {sortConfig.direction === "asc" ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-dots Column Options Trigger - visible on hover or when open */}
                    {(hoveredCol === colId || activeMenuCol === colId) && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenColMenu(colId, e)}
                        title={`Options for ${label}`}
                        style={{
                          position: "absolute",
                          right: isLast ? 36 : 6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border:
                            activeMenuCol === colId
                              ? "1px solid #0c66e4"
                              : "1px solid #dcdfe4",
                          backgroundColor:
                            activeMenuCol === colId ? "#e9f2ff" : "#f4f5f7",
                          color:
                            activeMenuCol === colId
                              ? "#0c66e4"
                              : "var(--color-text-secondary)",
                          cursor: "pointer",
                          padding: 0,
                          zIndex: 10,
                          boxShadow: "-4px 0 6px rgba(244, 245, 247, 0.95)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#0c66e4";
                          e.currentTarget.style.color = "#0c66e4";
                        }}
                        onMouseLeave={(e) => {
                          if (activeMenuCol !== colId) {
                            e.currentTarget.style.borderColor = "#dcdfe4";
                            e.currentTarget.style.color =
                              "var(--color-text-secondary)";
                          }
                        }}
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    )}

                    {/* Resizable Sizable Column Handle (not on the very last edge) */}
                    {!isLast && (
                      <div
                        onMouseDown={(e) => handleResizeStart(colId, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: -4,
                          top: 0,
                          bottom: 0,
                          width: 9,
                          cursor: "col-resize",
                          userSelect: "none",
                          zIndex: 30,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Drag to resize column"
                      >
                        <div
                          style={{
                            width: 2,
                            height: "100%",
                            backgroundColor:
                              resizingCol === colId ? "#0c66e4" : "transparent",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (resizingCol !== colId)
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "#0c66e4";
                          }}
                          onMouseLeave={(e) => {
                            if (resizingCol !== colId)
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "transparent";
                          }}
                        />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {rootIssues.length > 0 ? (
              rootIssues.map((root) => {
                const subtasks = childrenMap.get(root.id) || [];
                const hasChildren = subtasks.length > 0;
                const isExpanded = expandedParentIds.has(root.id);

                return (
                  <React.Fragment key={root.id}>
                    {/* 1. Root Parent Issue */}
                    <IssueListRow
                      issue={root}
                      isSelected={selectedIds.has(root.id)}
                      onToggleSelect={onToggleSelect}
                      onOpenDetail={onOpenDetail}
                      onDelete={onDelete}
                      onUpdateStatus={onUpdateStatus}
                      onUpdateAssignee={onUpdateAssignee}
                      onUpdatePriority={onUpdatePriority}
                      onUpdateDueDate={onUpdateDueDate}
                      onAddChild={onAddChild}
                      members={members}
                      isActiveIssue={selectedIssueId === root.id}
                      isSubtask={false}
                      hasChildren={hasChildren}
                      isExpanded={isExpanded}
                      onToggleExpand={() => onToggleExpand(root.id)}
                      visibleColumns={visibleColumns}
                      columnWidths={columnWidths}
                    />

                    {/* 2. Subtasks */}
                    {isExpanded &&
                      subtasks.map((subtask) => (
                        <IssueListRow
                          key={subtask.id}
                          issue={subtask}
                          isSelected={selectedIds.has(subtask.id)}
                          onToggleSelect={onToggleSelect}
                          onOpenDetail={onOpenDetail}
                          onDelete={onDelete}
                          onUpdateStatus={onUpdateStatus}
                          onUpdateAssignee={onUpdateAssignee}
                          onUpdatePriority={onUpdatePriority}
                          onUpdateDueDate={onUpdateDueDate}
                          onAddChild={onAddChild}
                          members={members}
                          isActiveIssue={selectedIssueId === subtask.id}
                          isSubtask={true}
                          hasChildren={false}
                          visibleColumns={visibleColumns}
                          columnWidths={columnWidths}
                        />
                      ))}

                    {/* 3. Render Quick Create directly below this parent if matched */}
                    {inlineCreateParentId === root.id && (
                      <IssueListQuickCreate
                        isOpen={true}
                        onClose={onCloseInlineCreate}
                        onSubmit={onSubmitInlineCreate}
                        members={members}
                        isSubmitting={isSubmittingCreate}
                        isSubtask={root.type?.toUpperCase() !== 'EPIC'}
                        visibleColumns={visibleColumns}
                        columnWidths={columnWidths}
                      />
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  style={{
                    padding: "3rem 1rem",
                    textAlign: "center",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  No issues found in this project. Click{" "}
                  <strong>+ Create</strong> below to add one!
                </td>
              </tr>
            )}

            {/* Inline Quick Create Row at the bottom for ROOT */}
            {inlineCreateParentId === "ROOT" && (
              <IssueListQuickCreate
                isOpen={true}
                onClose={onCloseInlineCreate}
                onSubmit={onSubmitInlineCreate}
                members={members}
                isSubmitting={isSubmittingCreate}
                isSubtask={false}
                visibleColumns={visibleColumns}
                columnWidths={columnWidths}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Bar */}
      <IssueListFooter
        totalCount={allIssuesCount}
        filteredCount={issues.length}
        currentPage={props.currentPage}
        pageSize={props.pageSize}
        totalPages={props.totalPages}
        onPageChange={props.onPageChange}
        onCreateClick={onOpenInlineCreate}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        onOpenConfig={handleOpenConfig}
      />

      {/* ─── Column Options Portal Menu (As shown in screenshot) ─── */}
      {activeMenuCol &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="column-options-portal-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: menuPos.top,
              left: menuPos.left,
              zIndex: 99999,
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 8,
              boxShadow:
                "0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)",
              minWidth: 200,
              padding: "6px 0",
              fontSize: "0.8125rem",
              color: "#172b4d",
            }}
          >
            {/* Sort options */}
            <div
              onClick={() => handleSort(activeMenuCol, "asc")}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Sort in ascending order
            </div>
            <div
              onClick={() => handleSort(activeMenuCol, "desc")}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Sort in descending order
            </div>

            <div
              style={{
                height: 1,
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                margin: "4px 0",
              }}
            />

            {/* Move options */}
            <div
              onClick={() => handleMoveToFirst(activeMenuCol)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Move column to first position
            </div>
            <div
              onClick={() => handleMoveLeft(activeMenuCol)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Move column to left
            </div>
            <div
              onClick={() => handleMoveRight(activeMenuCol)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Move column to right
            </div>
            <div
              onClick={() => handleMoveToLast(activeMenuCol)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Move column to last position
            </div>

            <div
              style={{
                height: 1,
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                margin: "4px 0",
              }}
            />

            {/* Remove column */}
            <div
              onClick={() => handleRemoveColumn(activeMenuCol)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                color: "#dc2626",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fee2e2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Remove column
            </div>

            <div
              style={{
                height: 1,
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                margin: "4px 0",
              }}
            />

            {/* Configure visible columns */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setConfigPos({
                  top: rect.bottom + window.scrollY + 4,
                  left: Math.max(8, rect.left + window.scrollX - 40),
                });
                setActiveMenuCol(null);
                setConfigOpen(true);
              }}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-text-primary)",
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <SlidersHorizontal size={13} />
              <span>Configure columns...</span>
            </div>
          </div>,
          document.body,
        )}

      {/* ─── Column Configure Popover Menu (SlidersHorizontal) ─── */}
      {configOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="column-config-portal-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: configPos.top,
              left: configPos.left,
              zIndex: 99999,
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 8,
              boxShadow:
                "0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)",
              minWidth: 190,
              padding: "8px 12px",
              fontSize: "0.8125rem",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                letterSpacing: "0.04em",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Configure Columns
            </div>

            {DEFAULT_COLUMN_DEFINITIONS.map((col) => {
              const isChecked = !hiddenColumns.has(col.id);
              return (
                <label
                  key={col.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 0",
                    cursor: col.id === "work" ? "not-allowed" : "pointer",
                    userSelect: "none",
                    fontSize: "0.8125rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={col.id === "work"}
                    onChange={() => toggleColumnVisibility(col.id)}
                    style={{
                      cursor: col.id === "work" ? "not-allowed" : "pointer",
                      accentColor: "var(--color-green-brand)",
                    }}
                  />
                  <span>{col.label}</span>
                </label>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
