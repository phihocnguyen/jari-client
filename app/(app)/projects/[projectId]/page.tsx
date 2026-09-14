import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectMainPage({ params }: PageProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;
  redirect(`/projects/${projectId}/summary`);
}
