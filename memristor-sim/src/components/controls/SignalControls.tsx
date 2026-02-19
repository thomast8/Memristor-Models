import { useSimulationStore } from '../../stores/simulation.ts';
import type { SignalType } from '../../engine/signals/types.ts';

export function SignalControls() {
  const signalType = useSimulationStore((s) => s.signalType);
  const signalParams = useSimulationStore((s) => s.signalParams);
  const setSignalType = useSimulationStore((s) => s.setSignalType);
  const setSignalParam = useSimulationStore((s) => s.setSignalParam);

  const signalTypes: { value: SignalType; label: string }[] = [
    { value: 'sine', label: 'Sine' },
    { value: 'triangle', label: 'Triangle' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Signal type toggle */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {signalTypes.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSignalType(value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '12px',
              borderRadius: '6px',
              border:
                value === signalType
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
              background:
                value === signalType
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'var(--color-surface)',
              color:
                value === signalType
                  ? 'var(--color-primary)'
                  : 'var(--color-text)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Signal parameters */}
      <CompactInput
        label="V+ (V)"
        value={signalParams.vp}
        step={0.01}
        min={0.01}
        max={20}
        onChange={(v) => setSignalParam('vp', v)}
      />
      <CompactInput
        label="V- (V)"
        value={signalParams.vn}
        step={0.01}
        min={0.01}
        max={20}
        onChange={(v) => setSignalParam('vn', v)}
      />
      <CompactInput
        label="Frequency (Hz)"
        value={signalParams.frequency}
        step={0.1}
        min={0.001}
        max={10000}
        onChange={(v) => setSignalParam('frequency', v)}
      />
    </div>
  );
}

function CompactInput({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <label style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <input
        type="number"
        value={parseFloat(value.toPrecision(6))}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }}
        style={{
          width: '100px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          color: 'var(--color-text)',
          textAlign: 'right',
        }}
      />
    </div>
  );
}
