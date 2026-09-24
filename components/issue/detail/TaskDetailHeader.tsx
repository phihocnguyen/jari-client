"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ChevronUp,
  ChevronDown,
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Maximize2,
  PanelRightClose,
  Trash2,
  Plus,
  CheckSquare,
  Bookmark,
  AlertCircle,
  Zap,
  GitFork,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import type { Issue, IssueType } from "@/types/issue";
import { issueApi, type WatcherUser } from "@/lib/api/issue";

interface TaskDetailHeaderProps {
  issue: Issue;
  projectId: string;
  viewMode: "modal" | "right-bar" | "full-page";
  onToggleViewMode?: () => void;
  onClose?: () => void;
  prevIssue?: Issue | null;
  nextIssue?: Issue | null;
  onNavigateIssue?: (issueId: string) => void;
  onDeleteIssue: () => void;
  projectName?: string;
  parentKey?: string;
}

export function TaskDetailHeader({
  issue,
  projectId,
  viewMode,
  onToggleViewMode,
  onClose,
  prevIssue = null,
  nextIssue = null,
  onNavigateIssue,
  onDeleteIssue,
  projectName,
  parentKey,
}: TaskDetailHeaderProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [watchersCount, setWatchersCount] = useState(0);
  const [watchersList, setWatchersList] = useState<WatcherUser[]>([]);
  const [watchersPopoverOpen, setWatchersPopoverOpen] = useState(false);
  const [isWatchLoading, setIsWatchLoading] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (!issue?.id) return;
    issueApi
      .getWatchers(issue.id)
      .then((data) => {
        if (data) {
          setIsWatching(data.isWatching);
          setWatchersCount(data.count);
          setWatchersList(data.watchers || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load watchers:", err);
      });
  }, [issue?.id]);

  const handleToggleWatch = async () => {
    if (!issue?.id || isWatchLoading) return;
    setIsWatchLoading(true);
    try {
      if (isWatching) {
        await issueApi.unwatchIssue(issue.id);
        setIsWatching(false);
        setWatchersCount((prev) => Math.max(0, prev - 1));
        toast.success("Stopped watching issue");
      } else {
        await issueApi.watchIssue(issue.id);
        setIsWatching(true);
        setWatchersCount((prev) => prev + 1);
        toast.success("You are now watching this issue");
      }
      const updated = await issueApi.getWatchers(issue.id);
      if (updated) {
        setIsWatching(updated.isWatching);
        setWatchersCount(updated.count);
        setWatchersList(updated.watchers || []);
      }
    } catch (err) {
      toast.error("Failed to update watcher status");
    } finally {
      setIsWatchLoading(false);
    }
  };

  const handleShare = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/projects/${projectId}/issues/${issue.key || issue.id}`
        : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const getTypeIcon = (type?: IssueType) => {
    switch (type) {
      case "EPIC":
        return <Zap size={16} color="#9333ea" fill="#9333ea" />;
      case "STORY":
        return <Bookmark size={16} color="#16a34a" fill="#16a34a" />;
      case "BUG":
        return <AlertCircle size={16} color="#dc2626" />;
      case "SUBTASK":
        return <GitFork size={15} color="#0284c7" />;
      case "TASK":
      default:
        return <CheckSquare size={16} color="#2563eb" />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding:
          viewMode === "modal" || viewMode === "full-page"
            ? "12px 24px"
            : "10px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Breadcrumb / Work item label */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
      >
        {viewMode === "full-page" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#626f86",
              fontSize: "0.8125rem",
            }}
          >
            <Link
              href={`/projects/${projectId}/backlog`}
              title="Back to backlog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: 4,
                color: "#44546f",
                textDecoration: "none",
                backgroundColor: "transparent",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                marginRight: 2,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f2f4";
                e.currentTarget.style.color = "#172b4d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#44546f";
              }}
            >
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/projects"
              style={{ color: "#626f86", textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              Spaces
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${projectId}/backlog`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                color: "#626f86",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  backgroundColor: "#0c66e4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                }}
              >
                {projectName ? projectName.charAt(0).toUpperCase() : "P"}
              </div>
              <span>{projectName || "Project"}</span>
            </Link>
            {parentKey && (
              <>
                <span>/</span>
                <Link
                  href={`/projects/${projectId}/issues/${parentKey}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#626f86",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  <Zap size={14} color="#9333ea" fill="#9333ea" />
                  <span>{parentKey}</span>
                </Link>
              </>
            )}
            <span>/</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              {getTypeIcon(issue.type)}
              <span
                style={{
                  color: "#0052cc",
                  padding: "2px 6px",
                  borderRadius: 4,
                  backgroundColor: "rgba(9, 30, 66, 0.04)",
                }}
              >
                {issue.key}
              </span>
            </div>
          </div>
        ) : viewMode === "right-bar" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {getTypeIcon(issue.type)}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#626f86",
              fontSize: "0.8125rem",
            }}
          >
            {/* Add epic link: opens new issue page prefilled with EPIC type and parent id when relevant.
                Epics themselves have no parent, so hide this control for EPIC issues. */}
            {issue.type !== "EPIC" && (
              <Link
                href={`/projects/${projectId}/issues/new?type=EPIC&parentId=${issue.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#626f86",
                  textDecoration: "none",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Create epic linked to this issue"
              >
                <Plus size={14} />
                <span>Add epic</span>
              </Link>
            )}
            <span>/</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              {getTypeIcon(issue.type)}
              <Link
                href={`/projects/${projectId}/issues/${issue.key}`}
                title="Open full page"
                style={{
                  color: "#0052cc",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 6px",
                  borderRadius: 4,
                  backgroundColor: "rgba(9, 30, 66, 0.04)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.backgroundColor =
                    "rgba(9, 30, 66, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                  e.currentTarget.style.backgroundColor =
                    "rgba(9, 30, 66, 0.04)";
                }}
              >
                {issue.key}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Previous / Next Issue navigation (modal / right-bar only) */}
        {viewMode !== "full-page" && (
          <>
            <button
              type="button"
              disabled={!prevIssue}
              onClick={() => prevIssue && onNavigateIssue?.(prevIssue.id)}
              title={
                prevIssue
                  ? `Previous issue: ${prevIssue.key}`
                  : "No previous issue"
              }
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 4,
                padding: 6,
                cursor: prevIssue ? "pointer" : "default",
                color: prevIssue ? "#44546f" : "#b3b9c4",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                prevIssue && (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <ChevronUp size={18} />
            </button>

            <button
              type="button"
              disabled={!nextIssue}
              onClick={() => nextIssue && onNavigateIssue?.(nextIssue.id)}
              title={
                nextIssue ? `Next issue: ${nextIssue.key}` : "No next issue"
              }
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 4,
                padding: 6,
                cursor: nextIssue ? "pointer" : "default",
                color: nextIssue ? "#44546f" : "#b3b9c4",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                nextIssue && (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <ChevronDown size={18} />
            </button>
          </>
        )}

        {/* Padlock Icon */}
        <button
          type="button"
          title="Restricted access"
          style={{
            background: "transparent",
            border: "1px solid rgba(0, 0, 0, 0.12)",
            borderRadius: 4,
            padding: "5px 8px",
            cursor: "pointer",
            color: "#44546f",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f1f2f4")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Lock size={15} />
        </button>

        {/* Watchers Eye Button + Popover */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: isWatching
                ? "1px solid #0c66e4"
                : "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 4,
              backgroundColor: isWatching ? "#e9f2ff" : "transparent",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={handleToggleWatch}
              disabled={isWatchLoading}
              title={isWatching ? "Stop watching issue" : "Watch issue"}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 6px",
                cursor: "pointer",
                color: isWatching ? "#0c66e4" : "#44546f",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = isWatching
                  ? "#dbe8fc"
                  : "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Eye size={15} color={isWatching ? "#0c66e4" : "#626f86"} />
            </button>
            <button
              type="button"
              onClick={() => setWatchersPopoverOpen(!watchersPopoverOpen)}
              title="View watchers"
              style={{
                background: "transparent",
                border: "none",
                borderLeft: isWatching
                  ? "1px solid #b3d4ff"
                  : "1px solid rgba(0, 0, 0, 0.1)",
                padding: "4px 6px",
                cursor: "pointer",
                color: isWatching ? "#0c66e4" : "#44546f",
                fontSize: "0.8125rem",
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = isWatching
                  ? "#dbe8fc"
                  : "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {watchersCount}
            </button>
          </div>

          {watchersPopoverOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 4,
                backgroundColor: "#ffffff",
                borderRadius: 6,
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "10px 14px",
                minWidth: 220,
                zIndex: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#172b4d",
                  }}
                >
                  Watchers ({watchersCount})
                </span>
                <button
                  type="button"
                  onClick={() => setWatchersPopoverOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#626f86",
                    padding: 2,
                  }}
                >
                  <X size={13} />
                </button>
              </div>

              {watchersList.length === 0 ? (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#626f86",
                    padding: "6px 0",
                  }}
                >
                  No one is watching this issue yet.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxHeight: 150,
                    overflowY: "auto",
                    marginBottom: 8,
                  }}
                >
                  {watchersList.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.8125rem",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          backgroundColor: "#0c66e4",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {(w.displayName || w.fullName || w.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span
                        style={{
                          color: "#172b4d",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {w.displayName || w.fullName || w.username}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  borderTop: "1px solid #ebecf0",
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    handleToggleWatch();
                    setWatchersPopoverOpen(false);
                  }}
                  disabled={isWatchLoading}
                  style={{
                    width: "100%",
                    padding: "5px 10px",
                    borderRadius: 4,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: isWatching ? "#ffebe6" : "#e9f2ff",
                    color: isWatching ? "#de350b" : "#0c66e4",
                  }}
                >
                  {isWatching ? "Stop watching" : "Start watching this issue"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          title="Share issue link"
          style={{
            background: "transparent",
            border: "1px solid rgba(0, 0, 0, 0.12)",
            borderRadius: 4,
            padding: "5px 8px",
            cursor: "pointer",
            color: "#44546f",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f1f2f4")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Share2 size={15} />
        </button>

        {/* More Menu Dropdown (...) */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            title="More actions"
            style={{
              background: moreMenuOpen ? "#f1f2f4" : "transparent",
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 4,
              padding: "5px 8px",
              cursor: "pointer",
              color: "#44546f",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f1f2f4")
            }
            onMouseLeave={(e) =>
              !moreMenuOpen &&
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <MoreHorizontal size={15} />
          </button>

          {moreMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 4,
                backgroundColor: "#ffffff",
                borderRadius: 6,
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "4px 0",
                minWidth: 160,
                zIndex: 30,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  navigator.clipboard?.writeText(issue.key);
                  toast.success(`Copied key ${issue.key}`);
                }}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  color: "#172b4d",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Copy issue key
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  handleShare();
                }}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  color: "#172b4d",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Copy link
              </button>
              <div
                style={{
                  height: 1,
                  backgroundColor: "rgba(0,0,0,0.08)",
                  margin: "4px 0",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen(false);
                  if (
                    window.confirm(
                      "Are you sure you want to delete this issue?",
                    )
                  ) {
                    onDeleteIssue();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  color: "#c82014",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffebe6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Trash2 size={14} />
                <span>Delete issue</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls only for Modal & Right-Bar modes */}
        {viewMode !== "full-page" && (
          <>
            {/* Popout to Standalone URL */}
            <Link
              href={`/projects/${projectId}/issues/${issue.key || issue.id}`}
              title="Open in full page"
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 4,
                padding: 6,
                color: "#44546f",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f2f4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <ExternalLink size={16} />
            </Link>

            {/* Toggle Full-size Modal vs Right Bar */}
            {onToggleViewMode && (
              <button
                type="button"
                onClick={onToggleViewMode}
                title={
                  viewMode === "modal"
                    ? "Dock to right bar (Side panel)"
                    : "Full size (Expand to modal)"
                }
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  padding: 6,
                  cursor: "pointer",
                  color: "#44546f",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {viewMode === "modal" ? (
                  <PanelRightClose size={17} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
            )}

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  padding: 6,
                  cursor: "pointer",
                  color: "#44546f",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f2f4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <X size={18} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
