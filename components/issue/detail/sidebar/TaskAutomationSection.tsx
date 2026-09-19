'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { automationApi } from '@/lib/api/automation';
import type { AutomationLog } from '@/types/automation';
import { timeAgo } from './sidebarUtils';

interface TaskAutomationSectionProps {
  issueId: string;
}

export function TaskAutomationSection({ issueId }: TaskAutomationSectionProps) {
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [isRunningRule, setIsRunningRule] = useState(false);

  useEffect(() => {
    if (!issueId || !autoExpanded) return;
    setIsAutoLoading(true);
    automationApi
      .listLogs(issueId)
      .then((data) => setAutomationLogs(data))
      .catch((err) => console.error('Failed to load automation logs:', err))
      .finally(() => setIsAutoLoading(false));
  }, [issueId, autoExpanded]);

  const handleRunRule = async (ruleCode: string) => {
    setIsRunningRule(true);
    try {
      const res = await automationApi.runRule(issueId, ruleCode);
      setAutomationLogs((prev) => [res, ...prev]);
      toast.success(`Rule finished: ${res.status}`);
    } catch (err) {
      toast.error('Failed to run rule');
    } finally {
      setIsRunningRule(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.84rem',
        }}
        onClick={() => setAutoExpanded(!autoExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {autoExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>Automation {automationLogs.length > 0 && `(${automationLogs.length})`}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#626f86',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <Zap size={12} />
          <span>Rule executions</span>
        </div>
      </div>

      {autoExpanded && (
        <div style={{ padding: '8px 14px 12px', fontSize: '0.8125rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#626f86' }}>Trigger rule:</span>
            <button
              type="button"
              disabled={isRunningRule}
              onClick={() => handleRunRule('AUTO_CLOSE_PARENT')}
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#f1f2f4',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#172b4d',
              }}
            >
              Auto-evaluate subtasks
            </button>
            <button
              type="button"
              disabled={isRunningRule}
              onClick={() => handleRunRule('AUTO_ASSIGN_ME')}
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#f1f2f4',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#172b4d',
              }}
            >
              Assign to me
            </button>
          </div>

          {isAutoLoading ? (
            <div style={{ color: '#626f86', padding: '4px 0' }}>Loading automation audit logs...</div>
          ) : automationLogs.length === 0 ? (
            <div style={{ color: '#626f86', padding: '4px 0' }}>
              No automation rules have executed for this task recently.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {automationLogs.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid rgba(0,0,0,0.06)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#172b4d' }}>{item.ruleName}</span>
                    <span style={{ color: '#626f86', fontSize: '0.6875rem' }}>{timeAgo(item.executedAt)}</span>
                  </div>
                  <p style={{ margin: 0, color: '#44546f', lineHeight: 1.4 }}>{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
