'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TabItem {
  id: string;
  label: string;
  href: string;
}

interface SortableTabProps {
  tab: TabItem;
  isActive: boolean;
  activeId: string | null;
  overId: string | null;
  tabs: TabItem[];
}

function SortableTab({ tab, isActive, activeId, overId, tabs }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    height: 42,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: isActive ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
    borderBottom: isActive ? '2px solid var(--color-green-accent)' : '2px solid transparent',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 20 : 'auto',
    userSelect: 'none',
    position: 'relative',
    transition: transition || 'color 0.15s ease, border-color 0.15s ease',
  };

  // Determine if drop indicator line with pin should be displayed
  const isOverCurrent = overId === tab.id && activeId !== null && activeId !== tab.id;
  const activeIndex = tabs.findIndex((t) => t.id === activeId);
  const currentIndex = tabs.findIndex((t) => t.id === tab.id);
  const isDropOnRight = activeIndex < currentIndex;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      title="Drag to reorder tabs"
    >
      <Link
        href={tab.href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          height: '100%',
          pointerEvents: isDragging ? 'none' : 'auto',
        }}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
      >
        {tab.label}
      </Link>

      {/* Jira-style Drop Indicator: Vertical Line with Pin Top */}
      {isOverCurrent && (
        <div
          style={{
            position: 'absolute',
            [isDropOnRight ? 'right' : 'left']: -2,
            top: 4,
            bottom: 4,
            width: 2,
            backgroundColor: '#0c66e4',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          {/* Circular Pin Head on top */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#0c66e4',
              boxShadow: '0 0 2px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ProjectNavTabs() {
  const pathname = usePathname();
  const params = useParams();
  const pId = (params?.projectId as string) || 'proj-demo-1';

  // Default tabs list (with 'List' included and 'Issues' removed)
  const defaultTabs: TabItem[] = [
    { id: 'summary',    label: 'Summary',    href: `/projects/${pId}/summary` },
    { id: 'board',      label: 'Board',      href: `/projects/${pId}/board` },
    { id: 'list',       label: 'List',       href: `/projects/${pId}/list` },
    { id: 'backlog',    label: 'Backlog',    href: `/projects/${pId}/backlog` },
    { id: 'sprints',    label: 'Sprints',    href: `/projects/${pId}/sprints` },
    { id: 'reports',    label: 'Reports',    href: `/projects/${pId}/reports` },
    { id: 'releases',   label: 'Releases',   href: `/projects/${pId}/releases` },
    { id: 'components', label: 'Components', href: `/projects/${pId}/components` },
    { id: 'settings',   label: 'Settings',   href: `/projects/${pId}/settings` },
  ];

  const [tabs, setTabs] = useState<TabItem[]>(defaultTabs);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Sync hrefs if pId changes & restore custom order from localStorage
  useEffect(() => {
    const storageKey = `jari_tabs_order_${pId}`;
    const savedOrder = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
        const reordered: TabItem[] = [];
        orderIds.forEach((id) => {
          if (id === 'issues') return;
          const found = defaultTabs.find((t) => t.id === id);
          if (found) reordered.push(found);
        });
        defaultTabs.forEach((tab) => {
          if (!reordered.find((t) => t.id === tab.id)) {
            reordered.push(tab);
          }
        });
        setTabs(reordered);
        return;
      } catch {
        // Fallback
      }
    }
    setTabs(defaultTabs);
  }, [pId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? (event.over.id as string) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    setTabs((currentTabs) => {
      const oldIndex = currentTabs.findIndex((t) => t.id === active.id);
      const newIndex = currentTabs.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(currentTabs, oldIndex, newIndex);

      if (typeof window !== 'undefined') {
        const storageKey = `jari_tabs_order_${pId}`;
        localStorage.setItem(storageKey, JSON.stringify(reordered.map((t) => t.id)));
      }
      return reordered;
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const activeTab = activeId ? tabs.find((t) => t.id === activeId) : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: 0,
        height: 42,
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        position: 'relative',
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={tabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== `/projects/${pId}/list` &&
                pathname.startsWith(`${tab.href}/`));

            return (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={isActive}
                activeId={activeId}
                overId={overId}
                tabs={tabs}
              />
            );
          })}
        </SortableContext>

        {/* Floating Drag Overlay */}
        <DragOverlay>
          {activeTab ? (
            <div
              style={{
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#0c66e4',
                backgroundColor: '#ffffff',
                border: '1.5px solid #0c66e4',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
                cursor: 'grabbing',
                userSelect: 'none',
                opacity: 0.95,
              }}
            >
              {activeTab.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
