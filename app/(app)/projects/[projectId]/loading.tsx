import { GlobalLoadingOverlay } from '@/components/loading';

export default function ProjectLoading() {
  return (
    <GlobalLoadingOverlay
      label="Opening project..."
      sublabel="Loading project summary and configuration"
    />
  );
}
