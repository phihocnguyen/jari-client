'use client';

import { Modal } from '@/components/ui/Modal';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const SHORTCUTS = [
    {
      group: 'Actions',
      items: [
        { key: 'C', description: 'Create a new issue' },
        { key: '⌘K / Ctrl+K', description: 'Open search palette' },
        { key: '?', description: 'Show keyboard shortcuts' },
      ],
    },
    {
      group: 'Navigation',
      items: [
        { key: 'B', description: 'Go to Active Board' },
        { key: 'L', description: 'Go to Backlog' },
      ],
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div style={{ padding: '4px 0 8px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#626F86', marginBottom: 16 }}>
          Boost your productivity in Jari with quick keyboard actions.
        </p>

        {SHORTCUTS.map(sec => (
          <div key={sec.group} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#626F86',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              {sec.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sec.items.map(item => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 4,
                    backgroundColor: '#F4F5F7',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: '#172B4D' }}>{item.description}</span>
                  <kbd
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DFE1E6',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#172B4D',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}
                  >
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
