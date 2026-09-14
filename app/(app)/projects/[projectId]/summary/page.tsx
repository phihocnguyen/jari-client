'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Edit3, FileText, Calendar, Plus, ChevronDown,
  ArrowUp, ArrowDown, Minus, Ban, ChevronsUp, Bookmark, CheckSquare, Zap, Layers,
} from 'lucide-react';
import { projectApi } from '@/lib/api/project';
import { Avatar } from '@/components/ui/Avatar';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectSummaryPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const projectId = resolvedParams?.projectId ?? '';

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? projectApi.get(projectId).then(r => r.data) : null),
    enabled: Boolean(projectId),
  });

  if (!projectId) return null;

  const pId = projectId || 'proj-demo-1';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Breadcrumb & Project Icon Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
          Projects
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, backgroundColor: '#EAB308',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.875rem',
          }}>
            H
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {project?.name || 'Horizon'}
          </h1>
        </div>
      </div>

      {/* Top Sub-Navigation Tabs Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.5rem',
        overflowX: 'auto', paddingBottom: 2,
      }}>
        {[
          { label: 'Summary', href: `/projects/${pId}/summary`, active: true },
          { label: 'Backlog', href: `/projects/${pId}/backlog` },
          { label: 'Board', href: `/projects/${pId}/board` },
          { label: 'List', href: `/projects/${pId}/issues` },
          { label: 'Reports', href: `/projects/${pId}/reports` },
          { label: 'Components', href: `/projects/${pId}/components` },
          { label: 'Code', href: '#' },
          { label: 'Security', href: '#' },
          { label: 'Releases', href: `/projects/${pId}/releases` },
          { label: 'Issues', href: `/projects/${pId}/issues` },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              padding: '8px 14px',
              fontSize: '0.875rem',
              fontWeight: tab.active ? 600 : 400,
              color: tab.active ? 'var(--color-green-brand)' : 'var(--color-text-secondary)',
              borderBottom: tab.active ? '2px solid var(--color-green-accent)' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </Link>
        ))}
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          6 more <Plus size={14} />
        </span>
      </div>

      {/* Top 4 Summary Metric Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        <MetricCard
          icon={<CheckCircle2 size={18} color="#22C55E" />}
          title="14 completed"
          subtitle="in the last 7 days"
          bg="#DCFCE7"
        />
        <MetricCard
          icon={<Edit3 size={18} color="#6366F1" />}
          title="8 updated"
          subtitle="in the last 7 days"
          bg="#EEF2FF"
        />
        <MetricCard
          icon={<FileText size={18} color="#0EA5E9" />}
          title="7 created"
          subtitle="in the last 7 days"
          bg="#E0F2FE"
        />
        <MetricCard
          icon={<Calendar size={18} color="#EF4444" />}
          title="12 due"
          subtitle="in the next 7 days"
          bg="#FEE2E2"
        />
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Widget 1: Status Overview (Donut Chart) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Status overview</h2>
              <Link href={`/projects/${pId}/issues`} style={{ fontSize: '0.8125rem', color: 'var(--color-green-accent)', fontWeight: 500 }}>
                View all issues
              </Link>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Get a snapshot of the status of your issues.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {/* SVG Donut Chart */}
              <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
                <svg width="170" height="170" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284C7" strokeWidth="14" strokeDasharray="100 140" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#7C3AED" strokeWidth="14" strokeDasharray="50 190" strokeDashoffset="-100" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EA580C" strokeWidth="14" strokeDasharray="30 210" strokeDashoffset="-150" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#DB2777" strokeWidth="14" strokeDasharray="32 208" strokeDashoffset="-180" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1E3A8A" strokeWidth="14" strokeDasharray="19 221" strokeDashoffset="-212" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="14" strokeDasharray="8 232" strokeDashoffset="-231" />
                </svg>
                {/* Donut Center Label */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.1 }}>248</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', maxWidth: 70 }}>
                    Total issue count
                  </div>
                </div>
              </div>

              {/* Status Legend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <LegendRow color="#0284C7" label="Deprioritized" count={100} />
                <LegendRow color="#7C3AED" label="To do" count={50} />
                <LegendRow color="#EA580C" label="Boulders" count={30} />
                <LegendRow color="#DB2777" label="In design review" count={32} />
                <LegendRow color="#1E3A8A" label="In eng development" count={19} />
                <LegendRow color="#94A3B8" label="In progress" count={8} />
              </div>
            </div>
          </div>

          {/* Widget 4: Priority Breakdown (Bar Chart) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Priority breakdown</h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Get a holistic view of how work is being prioritized.{' '}
              <span style={{ color: 'var(--color-green-accent)', cursor: 'pointer' }}>
                See what your team&apos;s been focusing on
              </span>
            </p>

            {/* Priority Bar Chart */}
            <div style={{ backgroundColor: '#FAF9F6', borderRadius: 12, padding: '1.25rem 1rem 0.75rem' }}>
              <div style={{ display: 'flex', height: 160, alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                {[
                  { label: 'Blocked', icon: <Ban size={14} color="#DC2626" />, height: '40%', val: 40 },
                  { label: 'Highest', icon: <ChevronsUp size={14} color="#DC2626" />, height: '58%', val: 58 },
                  { label: 'High', icon: <ArrowUp size={14} color="#EA580C" />, height: '64%', val: 64 },
                  { label: 'Medium', icon: <Minus size={14} color="#D97706" />, height: '55%', val: 55 },
                  { label: 'Low', icon: <ArrowDown size={14} color="#2563EB" />, height: '38%', val: 38 },
                  { label: 'Lowest', icon: <ArrowDown size={14} color="#0284C7" />, height: '48%', val: 48 },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', width: 44 }}>
                    <div style={{ width: 28, height: item.height, backgroundColor: '#64748B', borderRadius: '4px 4px 0 0' }} />
                  </div>
                ))}
              </div>

              {/* X-Axis Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 8 }}>
                {[
                  { label: 'Blocked', icon: <Ban size={13} color="#DC2626" /> },
                  { label: 'Highest', icon: <ChevronsUp size={13} color="#DC2626" /> },
                  { label: 'High', icon: <ArrowUp size={13} color="#EA580C" /> },
                  { label: 'Medium', icon: <Minus size={13} color="#D97706" /> },
                  { label: 'Low', icon: <ArrowDown size={13} color="#2563EB" /> },
                  { label: 'Lowest', icon: <ArrowDown size={13} color="#0284C7" /> },
                ].map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--color-text-secondary)', width: 44, justifyContent: 'center' }}>
                    {cat.icon}
                    <span>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 6: Team Workload */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Team workload</h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Monitor the capacity of your team.{' '}
              <span style={{ color: 'var(--color-green-accent)', cursor: 'pointer' }}>
                Reassign issues to get the right balance
              </span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <WorkloadBar name="Dunya Syed" percent={49} color="#94A3B8" />
              <WorkloadBar name="Andrew Park" percent={38} color="#94A3B8" />
              <WorkloadBar name="Victoria Styles" percent={84} color="#EA580C" />
              <WorkloadBar name="Melanie Lee" percent={54} color="#94A3B8" />
              <WorkloadBar name="Veronica Rodriguez" percent={22} color="#22C55E" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Widget 3: Recent Activity */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent activity</h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Stay up to date with what&apos;s happening across the project.
            </p>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
              Today
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Activity Item 1 */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar name="Jane Rotanson" size={32} />
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Jane Rotanson</span> changed status to <span style={{ fontWeight: 600 }}>Done</span> on{' '}
                    <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>TIC-186 Team 24 design support</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Just now</div>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar name="Peter Andre" size={32} />
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Peter Andre</span> made 2 updates on{' '}
                    <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>TIC-249 Approvals to software</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>about 15 hours ago</div>
                </div>
              </div>

              {/* Activity Item 3 with Quote Box */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar name="Lucy Peters" size={32} />
                <div style={{ fontSize: '0.8125rem', lineHeight: 1.45, flex: 1 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Lucy Peters</span> updated the description of{' '}
                    <span style={{ color: 'var(--color-green-accent)', fontWeight: 600 }}>TIC-200 Budget tools</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2, marginBottom: 8 }}>
                    about 20 hours ago
                  </div>

                  {/* Quoted Box Snippet */}
                  <div style={{
                    backgroundColor: '#FAF9F6',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: '0.78125rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                  }}>
                    Request for design support to mock a potential future experience to make a case for public forms. Mocks included for the design within the file in{' '}
                    <span style={{ color: 'var(--color-green-accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                      https://hello.atlassian.net/wiki/spaces/Spork/pageid7580671230
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 5: Types of Work */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Types of work</h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Get a breakdown of issues by their types.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <TypeProgressRow icon={<CheckSquare size={16} color="#2563EB" />} label="Task" percent={49} />
              <TypeProgressRow icon={<Bookmark size={16} color="#0284C7" />} label="Sub-task" percent={15} />
              <TypeProgressRow icon={<Zap size={16} color="#9333EA" />} label="Epic" percent={64} />
            </div>
          </div>

          {/* Widget 7: Epic Progress */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Epic progress</h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-green-accent)', fontWeight: 500, cursor: 'pointer' }}>
                View all epics
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              See how your epics are progressing at a glance.
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#22C55E' }} />
                <span>Done</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#3B82F6' }} />
                <span>In progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#94A3B8' }} />
                <span>To do</span>
              </div>
            </div>

            {/* Multi-Segmented Epic Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <EpicSegmentRow
                keyName="PLAT-7"
                title="User Authentication Overhaul"
                done={0} inProgress={45} todo={45}
              />
              <EpicSegmentRow
                keyName="PLAT-7"
                title="Mobile App User Interface Redesign"
                done={60} inProgress={24} todo={16}
              />
              <EpicSegmentRow
                keyName="PLAT-7"
                title="API Integration for Third-Party Services"
                done={70} inProgress={25} todo={5}
              />
              <EpicSegmentRow
                keyName="PLAT-7"
                title="Make working with our space travel partners easier"
                done={30} inProgress={55} todo={15}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers & Components ──────────────────────────────────────────

function MetricCard({ icon, title, subtitle, bg }: {
  icon: React.ReactNode; title: string; subtitle: string; bg: string;
}) {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
        <span style={{ color: 'var(--color-text-primary)' }}>{label}:</span>
      </div>
      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{count}</span>
    </div>
  );
}

function WorkloadBar({ name, percent, color }: { name: string; percent: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140, flexShrink: 0 }}>
        <Avatar name={name} size={24} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
      </div>
      <div style={{ flex: 1, height: 16, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
        </div>
      </div>
    </div>
  );
}

function TypeProgressRow({ icon, label, percent }: { icon: React.ReactNode; label: string; percent: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 90, flexShrink: 0, fontSize: '0.8125rem', fontWeight: 500 }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ flex: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#64748B', borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{percent}%</span>
        </div>
      </div>
    </div>
  );
}

function EpicSegmentRow({ keyName, title, done, inProgress, todo }: {
  keyName: string; title: string; done: number; inProgress: number; todo: number;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6 }}>
        <Zap size={14} color="#9333EA" />
        <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{keyName}</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{title}</span>
      </div>
      <div style={{ height: 16, borderRadius: 4, overflow: 'hidden', display: 'flex', backgroundColor: 'rgba(0,0,0,0.06)' }}>
        {done > 0 && (
          <div style={{ width: `${done}%`, backgroundColor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {done}%
          </div>
        )}
        {inProgress > 0 && (
          <div style={{ width: `${inProgress}%`, backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {inProgress}%
          </div>
        )}
        {todo > 0 && (
          <div style={{ width: `${todo}%`, backgroundColor: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {todo}%
          </div>
        )}
      </div>
    </div>
  );
}
