import { IssueStatus } from '@/types/issue';

export const getStatusBadgeStyle = (status?: IssueStatus | string) => {
  const norm = (status || '').toUpperCase().replace(/[_\s-]+/g, '');
  switch (norm) {
    case 'DONE':
      return {
        bg: '#e3fcef',
        color: '#006644',
        label: 'Done',
      };
    case 'INPROGRESS':
      return {
        bg: '#e9f2ff',
        color: '#0052cc',
        label: 'In Progress',
      };
    case 'INREVIEW':
      return {
        bg: '#eae6ff',
        color: '#403294',
        label: 'In Review',
      };
    case 'TODO':
    default:
      return {
        bg: '#f1f2f4',
        color: '#44546f',
        label: 'To Do',
      };
  }
};

