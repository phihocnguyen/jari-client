export type ColumnId =
  | 'work'
  | 'assignee'
  | 'reporter'
  | 'priority'
  | 'status'
  | 'resolution'
  | 'created'
  | 'updated'
  | 'dueDate';

export interface ColumnDef {
  id: ColumnId;
  label: string;
  defaultWidth: number;
  minWidth: number;
}

export const DEFAULT_COLUMN_DEFINITIONS: ColumnDef[] = [
  { id: 'work', label: 'Work', defaultWidth: 320, minWidth: 130 },
  { id: 'assignee', label: 'Assignee', defaultWidth: 150, minWidth: 100 },
  { id: 'reporter', label: 'Reporter', defaultWidth: 130, minWidth: 90 },
  { id: 'priority', label: 'Priority', defaultWidth: 110, minWidth: 80 },
  { id: 'status', label: 'Status', defaultWidth: 120, minWidth: 90 },
  { id: 'resolution', label: 'Resolution', defaultWidth: 110, minWidth: 80 },
  { id: 'created', label: 'Created', defaultWidth: 140, minWidth: 90 },
  { id: 'updated', label: 'Update', defaultWidth: 140, minWidth: 90 },
  { id: 'dueDate', label: 'Due Date', defaultWidth: 140, minWidth: 110 },
];

export const DEFAULT_COLUMN_ORDER: ColumnId[] = [
  'work',
  'assignee',
  'reporter',
  'priority',
  'status',
  'resolution',
  'created',
  'updated',
  'dueDate',
];

export const DEFAULT_COLUMN_WIDTHS: Record<ColumnId, number> = {
  work: 320,
  assignee: 150,
  reporter: 130,
  priority: 110,
  status: 120,
  resolution: 110,
  created: 140,
  updated: 140,
  dueDate: 140,
};
