import { ModelSelector } from '../controls/ModelSelector.tsx';
import { PresetSelector } from '../controls/PresetSelector.tsx';
import { SignalControls } from '../controls/SignalControls.tsx';
import { SimulationControls } from '../controls/SimulationControls.tsx';
import { ModelDescription } from '../education/ModelDescription.tsx';

export function Sidebar() {
  return (
    <aside
      style={{
        width: '320px',
        minWidth: '320px',
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-surface-alt)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      <SidebarSection title="Model">
        <ModelSelector />
      </SidebarSection>

      <SidebarSection title="Experiment Presets">
        <PresetSelector />
      </SidebarSection>

      <SidebarSection title="Input Signal">
        <SignalControls />
      </SidebarSection>

      <SidebarSection title="Simulation">
        <SimulationControls />
      </SidebarSection>

      <SidebarSection title="Model Reference" defaultOpen={false}>
        <ModelDescription />
      </SidebarSection>
    </aside>
  );
}

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      style={{
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <summary
        style={{
          padding: '10px 16px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          userSelect: 'none',
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.15s',
            fontSize: '10px',
          }}
          className="disclosure-arrow"
        >
          &#9654;
        </span>
        {title}
      </summary>
      <div style={{ padding: '0 16px 14px' }}>{children}</div>
    </details>
  );
}
