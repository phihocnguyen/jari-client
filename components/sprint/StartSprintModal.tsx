'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Calendar, ExternalLink } from 'lucide-react';
import { sprintApi } from '@/lib/api/sprint';
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
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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
    }
  }, [open, sprint]);

  if (!open || !sprint) return null;

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
      // 1. Update sprint details with form values
      await sprintApi.update(sprint.id, {
        name: sprintName.trim(),
        goal: goal.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      // 2. Start sprint
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 30, 66, 0.54)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6B778C',
            width: 28,
            height: 28,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F4F5F7')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#172B4D',
            marginBottom: '8px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>

        {/* Work items message */}
        <p style={{ fontSize: '0.875rem', color: '#172B4D', marginBottom: '8px' }}>
          <strong>{issuesCount}</strong> {issuesCount === 1 ? 'work item' : 'work items'} will be included in this sprint.
        </p>

        {/* Required fields note */}
        <p style={{ fontSize: '0.78rem', color: '#6B778C', marginBottom: '18px' }}>
          Required fields are marked with an asterisk <span style={{ color: '#DE350B' }}>*</span>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sprint Name */}
          <div>
            <label
              htmlFor="sprint-name-input"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#42526E',
                marginBottom: '4px',
              }}
            >
              Sprint name <span style={{ color: '#DE350B' }}>*</span>
            </label>
            <input
              id="sprint-name-input"
              type="text"
              required
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 10px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                fontSize: '0.875rem',
                color: '#172B4D',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0052CC';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 82, 204, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFE1E6';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="sprint-duration-select"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#42526E',
                marginBottom: '4px',
              }}
            >
              Duration <span style={{ color: '#DE350B' }}>*</span>
            </label>
            <select
              id="sprint-duration-select"
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 10px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                fontSize: '0.875rem',
                color: '#172B4D',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                cursor: 'pointer',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0052CC';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 82, 204, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFE1E6';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="custom">custom</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="3 weeks">3 weeks</option>
              <option value="4 weeks">4 weeks</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="sprint-start-date"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#42526E',
                marginBottom: '4px',
              }}
            >
              Start date <span style={{ color: '#DE350B' }}>*</span>
            </label>
            <input
              id="sprint-start-date"
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 10px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                fontSize: '0.875rem',
                color: '#172B4D',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0052CC';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 82, 204, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFE1E6';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{ fontSize: '0.72rem', color: '#6B778C', marginTop: '4px', lineHeight: 1.4 }}>
              A sprint's start date impacts velocity and scope in reports.{' '}
              <span style={{ color: '#0052CC', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                Learn more. <ExternalLink size={10} />
              </span>
              <br />
              Date format: MM/DD/YYYY. Time format: e.g. 1:00 PM.
            </p>
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="sprint-end-date"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#42526E',
                marginBottom: '4px',
              }}
            >
              End date <span style={{ color: '#DE350B' }}>*</span>
            </label>
            <input
              id="sprint-end-date"
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 10px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                fontSize: '0.875rem',
                color: '#172B4D',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0052CC';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 82, 204, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFE1E6';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{ fontSize: '0.72rem', color: '#6B778C', marginTop: '4px' }}>
              Date format: MM/DD/YYYY. Time format: e.g. 1:00 PM.
            </p>
          </div>

          {/* Automatically complete sprint Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <div
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
              }}
            >
              <div
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
                }}
              />
            </div>
            <span
              onClick={() => setAutoComplete(!autoComplete)}
              style={{ fontSize: '0.84rem', fontWeight: 600, color: '#172B4D', cursor: 'pointer', userSelect: 'none' }}
            >
              Automatically complete sprint
            </span>
          </div>

          {/* Sprint Goal */}
          <div>
            <label
              htmlFor="sprint-goal-textarea"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#42526E',
                marginBottom: '4px',
              }}
            >
              Sprint goal
            </label>
            <textarea
              id="sprint-goal-textarea"
              rows={4}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What is the goal of this sprint?"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 4,
                border: '1px solid #DFE1E6',
                fontSize: '0.875rem',
                color: '#172B4D',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0052CC';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 82, 204, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DFE1E6';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                height: 34,
                padding: '0 12px',
                borderRadius: 4,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#42526E',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EBECF0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: 34,
                padding: '0 16px',
                borderRadius: 4,
                backgroundColor: '#0052CC',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0065FF';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0052CC';
              }}
            >
              {isSubmitting ? 'Starting...' : 'Start'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
