import { IssueStatus } from '@/types/issue';

export const getStatusBadgeStyle = (status: IssueStatus) => {
  switch (status) {
    case 'DONE':
      return {
        bg: '#e3fcef',
        color: '#006644',
        label: 'Done',
      };
    case 'IN_PROGRESS':
      return {
        bg: '#e9f2ff',
        color: '#0052cc',
        label: 'In Progress',
      };
    case 'IN_REVIEW':
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
