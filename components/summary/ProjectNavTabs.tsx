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
  DragEndEvent,
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
}

function SortableTab({ tab, isActive }: SortableTabProps) {
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
    transition,
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : 'auto',
    userSelect: 'none',
    position: 'relative',
    transitionProperty: 'color, border-color, opacity, transform',
  };

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

  // Sync hrefs if pId changes & restore custom order from localStorage
  useEffect(() => {
    const storageKey = `jari_tabs_order_${pId}`;
    const savedOrder = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
        const reordered: TabItem[] = [];
        // Add existing items in saved order (ignoring 'issues' if previously saved)
        orderIds.forEach((id) => {
          if (id === 'issues') return;
          const found = defaultTabs.find((t) => t.id === id);
          if (found) reordered.push(found);
        });
        // Append any new tabs not in saved order
        defaultTabs.forEach((tab) => {
          if (!reordered.find((t) => t.id === tab.id)) {
            reordered.push(tab);
          }
        });
        setTabs(reordered);
        return;
      } catch {
        // Fallback to default
      }
    }
    setTabs(defaultTabs);
  }, [pId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // 4px drag before activating DnD so standard clicks navigate cleanly
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
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
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
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
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}
