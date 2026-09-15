import { IssueStatus } from '@/types/issue';

export const getStatusBadgeStyle = (status: IssueStatus) => {
  switch (status) {
    case 'DONE':
      return {
        bg: '#e3fcef',
        color: '#006644',
        border: '#abf5d1',
        label: 'DONE',
      };
    case 'IN_PROGRESS':
      return {
        bg: '#e9f2ff',
        color: '#0052cc',
        border: '#b3d4ff',
        label: 'IN PROGRESS',
      };
    case 'IN_REVIEW':
      return {
        bg: '#eae6ff',
        color: '#403294',
        border: '#c0b6f2',
        label: 'IN REVIEW',
      };
    case 'TODO':
    default:
      return {
        bg: '#f1f2f4',
        color: '#44546f',
        border: '#dcdfe4',
        label: 'TO DO',
      };
  }
};
