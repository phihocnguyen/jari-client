import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function IssuesRedirectPage({ params }: PageProps) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/list`);
}
