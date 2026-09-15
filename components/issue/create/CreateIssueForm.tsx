'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { IssueTypeSelect } from './IssueTypeSelect';
import { IssueParentBanner } from './IssueParentBanner';
import type { ReferenceItem } from '@/lib/api/ref';
import type { ProjectMember } from '@/types/project';
import type { Sprint } from '@/types/sprint';
import type { Issue } from '@/types/issue';
import type { CreateIssueFormData } from '@/lib/validations/issue';

interface CreateIssueFormProps {
  register: UseFormRegister<CreateIssueFormData>;
  setValue: UseFormSetValue<CreateIssueFormData>;
  errors: FieldErrors<CreateIssueFormData>;
  selectedType?: string;
  issueTypes: ReferenceItem[];
  statuses: ReferenceItem[];
  priorities: ReferenceItem[];
  members: ProjectMember[];
  sprints: Sprint[];
  existingIssues: Issue[];
  initialParentId?: string;
  initialParentKey?: string;
  initialParentTitle?: string;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function CreateIssueForm({
  register,
  setValue,
  errors,
  selectedType,
  issueTypes,
  priorities,
  members,
  existingIssues,
  initialParentId,
  initialParentKey,
  initialParentTitle,
  onSubmit,
}: CreateIssueFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
    >
      {/* Parent Issue Banner */}
      <IssueParentBanner
        parentId={initialParentId}
        parentKey={initialParentKey}
        parentTitle={initialParentTitle}
      />

      {/* Row 1: Issue Type */}
      <div>
        <IssueTypeSelect
          selectedType={selectedType}
          issueTypes={issueTypes}
          register={register}
          setValue={setValue}
        />
      </div>

      {/* Row 2: Title / Summary */}
      <div>
        <Input
          id="iss-title"
          label="Summary"
          placeholder="What needs to be done?"
          error={errors.title?.message}
          {...register('title')}
          style={{ height: 38, fontSize: '0.875rem' }}
        />
      </div>

      {/* Row 3: Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Description
        </label>
        <textarea
          {...register('description')}
          className="input"
          rows={4}
          style={{
            resize: 'vertical',
            fontSize: '0.84rem',
            padding: '8px 10px',
            minHeight: 80,
            backgroundColor: '#ffffff',
          }}
          placeholder="Add details, steps to reproduce, or acceptance criteria..."
        />
      </div>

      {/* Row 4: Priority & Assignee */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Priority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Priority <span style={{ color: 'var(--color-red)' }}>*</span>
          </label>
          <select
            {...register('priority', {
              onChange: (e) => {
                const prioName = e.target.value;
                const matched = priorities.find(
                  (p) => p.name.toUpperCase() === prioName.toUpperCase()
                );
                if (matched) setValue('priorityId', matched.id);
              },
            })}
            className="input"
            style={{
              height: 36,
              fontSize: '0.84rem',
              cursor: 'pointer',
              backgroundColor: '#ffffff',
            }}
          >
            {priorities.length > 0 ? (
              priorities.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name.charAt(0) + p.name.slice(1).toLowerCase()}
                </option>
              ))
            ) : (
              <>
                <option value="HIGHEST">Highest</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="LOWEST">Lowest</option>
              </>
            )}
          </select>
        </div>

        {/* Assignee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Assignee
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: 10,
                pointerEvents: 'none',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <User size={15} />
            </span>
            <select
              {...register('assigneeId')}
              className="input"
              style={{
                paddingLeft: '1.85rem',
                height: 36,
                fontSize: '0.84rem',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 5: Parent Issue / Epic */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Parent Issue / Epic
        </label>
        <select
          {...register('parentId')}
          className="input"
          style={{
            height: 36,
            fontSize: '0.84rem',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
          }}
        >
          <option value="">None (Top level issue)</option>
          {existingIssues
            .filter((iss) => iss.id !== initialParentId)
            .map((iss) => (
              <option key={iss.id} value={iss.id}>
                [{iss.key}] {iss.title.length > 35 ? iss.title.slice(0, 35) + '...' : iss.title}
              </option>
            ))}
        </select>
      </div>

      {/* Row 6: Due Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Due Date
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              position: 'absolute',
              left: 10,
              pointerEvents: 'none',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Calendar size={15} />
          </span>
          <input
            type="date"
            {...register('dueDate')}
            className="input"
            style={{
              paddingLeft: '1.85rem',
              height: 36,
              fontSize: '0.84rem',
              backgroundColor: '#ffffff',
            }}
          />
        </div>
      </div>
    </form>
  );
}
