'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { sprintApi } from '@/lib/api/sprint';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Sprint } from '@/types/sprint';

interface StartSprintModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sprint: Sprint | null;
  issuesCount: number;
  hasActiveSprint: boolean;
}

function toDatetimeLocalString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function computeEndDate(startDateStr: string, duration: string): string {
  if (duration === 'custom') return '';
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) return '';
  let days = 14;
  if (duration === '1 week') days = 7;
  else if (duration === '2 weeks') days = 14;
  else if (duration === '3 weeks') days = 21;
  else if (duration === '4 weeks') days = 28;
  d.setDate(d.getDate() + days);
  return toDatetimeLocalString(d);
}

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#42526E',
  marginBottom: 4,
};

const fieldInput: React.CSSProperties = {
  width: '100%',
  height: 38,
  padding: '0 10px',
  borderRadius: 4,
  border: '1px solid #DFE1E6',
  fontSize: '0.875rem',
  color: '#172B4D',
  boxSizing: 'border-box',
  outline: 'none',
  backgroundColor: '#FFFFFF',
};

function focusBlue(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#0052CC';
  e.target.style.boxShadow = '0 0 0 2px rgba(0, 82, 204, 0.2)';
}

function blurGray(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#DFE1E6';
  e.target.style.boxShadow = 'none';
}

export function StartSprintModal({
  open,
  onClose,
  projectId,
  sprint,
  issuesCount,
  hasActiveSprint,
}: StartSprintModalProps) {
  const qc = useQueryClient();

  const [sprintName, setSprintName] = useState('');
  const [duration, setDuration] = useState('2 weeks');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [autoComplete, setAutoComplete] = useState(false);
  const [goal, setGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && sprint) {
      setSprintName(sprint.name || '');
      setGoal(sprint.goal || '');

      const initialStart = sprint.startDate
        ? toDatetimeLocalString(new Date(sprint.startDate))
        : toDatetimeLocalString(new Date());

      setStartDate(initialStart);

      if (sprint.endDate) {
        setEndDate(toDatetimeLocalString(new Date(sprint.endDate)));
        setDuration('custom');
      } else {
        setDuration('2 weeks');
        setEndDate(computeEndDate(initialStart, '2 weeks'));
      }
      setAutoComplete(false);
      setIsSubmitting(false);
    }
  }, [open, sprint]);

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    if (newDuration !== 'custom') {
      const calculatedEnd = computeEndDate(startDate || toDatetimeLocalString(new Date()), newDuration);
      if (calculatedEnd) setEndDate(calculatedEnd);
    }
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (duration !== 'custom') {
      const calculatedEnd = computeEndDate(newStart, duration);
      if (calculatedEnd) setEndDate(calculatedEnd);
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    setDuration('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint) return;
    if (!sprintName.trim()) {
      toast.error('Sprint name is required');
      return;
    }
    if (!startDate) {
      toast.error('Start date is required');
      return;
    }
    if (!endDate) {
      toast.error('End date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await sprintApi.update(sprint.id, {
        name: sprintName.trim(),
        goal: goal.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      await sprintApi.start(sprint.id);

      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      qc.invalidateQueries({ queryKey: ['board', projectId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint started successfully!');
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to start sprint';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = hasActiveSprint ? 'Start another sprint' : 'Start sprint';

  return (
    <Modal
      open={open && Boolean(sprint)}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting}
            onClick={() => {
              const form = document.getElementById('start-sprint-form') as HTMLFormElement | null;
              form?.requestSubmit();
            }}
          >
            {isSubmitting ? 'Starting…' : 'Start'}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: '0.875rem', color: '#172B4D', margin: '0 0 8px' }}>
        <strong>{issuesCount}</strong> {issuesCount === 1 ? 'work item' : 'work items'} will be included in this sprint.
      </p>
      <p style={{ fontSize: '0.78rem', color: '#6B778C', margin: '0 0 18px' }}>
        Required fields are marked with an asterisk <span style={{ color: '#DE350B' }}>*</span>
      </p>

      <form
        id="start-sprint-form"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div>
          <label htmlFor="sprint-name-input" style={fieldLabel}>
            Sprint name <span style={{ color: '#DE350B' }}>*</span>
          </label>
          <input
            id="sprint-name-input"
            type="text"
            required
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            style={fieldInput}
            onFocus={focusBlue}
            onBlur={blurGray}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="sprint-duration-select" style={fieldLabel}>
            Duration <span style={{ color: '#DE350B' }}>*</span>
          </label>
          <select
            id="sprint-duration-select"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            style={{ ...fieldInput, cursor: 'pointer' }}
            onFocus={focusBlue}
            onBlur={blurGray}
          >
            <option value="custom">custom</option>
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="3 weeks">3 weeks</option>
            <option value="4 weeks">4 weeks</option>
          </select>
        </div>

        <div>
          <label htmlFor="sprint-start-date" style={fieldLabel}>
            Start date <span style={{ color: '#DE350B' }}>*</span>
          </label>
          <input
            id="sprint-start-date"
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            style={fieldInput}
            onFocus={focusBlue}
            onBlur={blurGray}
          />
          <p style={{ fontSize: '0.72rem', color: '#6B778C', marginTop: 4, lineHeight: 1.4 }}>
            A sprint&apos;s start date impacts velocity and scope in reports.{' '}
            <span style={{ color: '#0052CC', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              Learn more. <ExternalLink size={10} />
            </span>
            <br />
            Date format: MM/DD/YYYY. Time format: e.g. 1:00 PM.
          </p>
        </div>

        <div>
          <label htmlFor="sprint-end-date" style={fieldLabel}>
            End date <span style={{ color: '#DE350B' }}>*</span>
          </label>
          <input
            id="sprint-end-date"
            type="datetime-local"
            required
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            style={fieldInput}
            onFocus={focusBlue}
            onBlur={blurGray}
          />
          <p style={{ fontSize: '0.72rem', color: '#6B778C', marginTop: 4 }}>
            Date format: MM/DD/YYYY. Time format: e.g. 1:00 PM.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            role="switch"
            aria-checked={autoComplete}
            onClick={() => setAutoComplete(!autoComplete)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              backgroundColor: autoComplete ? '#0052CC' : '#DFE1E6',
              position: 'relative',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
              flexShrink: 0,
              border: 'none',
              padding: 0,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                top: 3,
                left: autoComplete ? 19 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
              }}
            />
          </button>
          <span
            onClick={() => setAutoComplete(!autoComplete)}
            style={{ fontSize: '0.84rem', fontWeight: 600, color: '#172B4D', cursor: 'pointer', userSelect: 'none' }}
          >
            Automatically complete sprint
          </span>
        </div>

        <div>
          <label htmlFor="sprint-goal-textarea" style={fieldLabel}>
            Sprint goal
          </label>
          <textarea
            id="sprint-goal-textarea"
            rows={4}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What is the goal of this sprint?"
            style={{
              ...fieldInput,
              height: 'auto',
              padding: '8px 10px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={focusBlue}
            onBlur={blurGray}
          />
        </div>
      </form>
    </Modal>
  );
}
