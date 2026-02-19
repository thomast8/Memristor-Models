import { ParameterPanel } from '../controls/ParameterPanel.tsx';

export function ParameterBar() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface-alt)',
        padding: '14px 20px',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      <ParameterPanel />
    </div>
  );
}
