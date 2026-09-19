export interface AutomationLog {
  id: string;
  issueId: string;
  ruleName: string;
  status: 'SUCCESS' | 'FAILED' | 'TRIGGERED';
  description: string;
  executedAt: string;
}

export interface RunAutomationInput {
  rule: string;
}
