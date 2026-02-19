import { useSimulationStore } from '../../stores/simulation.ts';
import type { WindowType } from '../../engine/windows.ts';
import { Tooltip } from '../ui/Tooltip.tsx';

const WINDOW_TOOLTIPS: Record<WindowType, string> = {
  joglekar:
    'Simplest window. Slows state evolution near boundaries. Parameter p controls sharpness — higher p = sharper edge.',
  biolek:
    'Current-direction-aware window. More physical behaviour than Joglekar; boundary only activates in the relevant drift direction.',
  anusudha:
    'Alternative window formulation; symmetric exponential boundary suppression.',
  none: 'No boundary constraint — state may saturate at 0 or 1. Use with caution.',
};

export function SimulationControls() {
  const modelId = useSimulationStore((s) => s.modelId);
  const x0 = useSimulationStore((s) => s.x0);
  const tMax = useSimulationStore((s) => s.tMax);
  const windowType = useSimulationStore((s) => s.windowType);
  const windowP = useSimulationStore((s) => s.windowP);
  const setX0 = useSimulationStore((s) => s.setX0);
  const setTMax = useSimulationStore((s) => s.setTMax);
  const setWindowType = useSimulationStore((s) => s.setWindowType);
  const setWindowP = useSimulationStore((s) => s.setWindowP);
  const resetToDefaults = useSimulationStore((s) => s.resetToDefaults);

  const isHPLabs = modelId === 'hp_labs';

  const windowTypes: { value: WindowType; label: string }[] = [
    { value: 'joglekar', label: 'Joglekar' },
    { value: 'biolek', label: 'Biolek' },
    { value: 'anusudha', label: 'Anusudha' },
    { value: 'none', label: 'None' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <CompactSlider
        label="x₀ (initial state)"
        tooltip="Initial normalised state: x=0 → fully undoped (high resistance ROFF), x=1 → fully doped (low resistance RON)."
        value={x0}
        min={0.001}
        max={0.999}
        step={0.001}
        onChange={setX0}
      />
      <CompactSlider
        label="t_max (s)"
        tooltip="Total simulation duration. The adaptive RK45 solver selects step sizes automatically."
        value={tMax}
        min={0.001}
        max={100}
        step={0.001}
        onChange={setTMax}
      />

      {isHPLabs && (
        <>
          <div style={{ marginTop: '4px' }}>
            <Tooltip text="Boundary function F(x) that prevents the state variable leaving [0,1]. Required for the HP Labs model.">
              <label
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                  cursor: 'help',
                }}
              >
                Window Function <span style={{ opacity: 0.6 }}>?</span>
              </label>
            </Tooltip>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {windowTypes.map(({ value, label }) => (
                <Tooltip
                  key={value}
                  text={WINDOW_TOOLTIPS[value]}
                  containerStyle={{ flex: '1 1 auto' }}
                >
                  <button
                    onClick={() => setWindowType(value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '11px',
                      borderRadius: '4px',
                      border:
                        value === windowType
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--color-border)',
                      background:
                        value === windowType
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'var(--color-surface)',
                      color:
                        value === windowType
                          ? 'var(--color-primary)'
                          : 'var(--color-text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {windowType !== 'none' && (
            <CompactSlider
              label="Window p"
              tooltip="Sharpness exponent for the selected window function. Higher values confine state evolution closer to x=0 and x=1."
              value={windowP}
              min={1}
              max={20}
              step={1}
              onChange={setWindowP}
            />
          )}
        </>
      )}

      <button
        onClick={resetToDefaults}
        style={{
          marginTop: '6px',
          padding: '7px 12px',
          fontSize: '12px',
          borderRadius: '6px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        Reset All
      </button>
    </div>
  );
}

function CompactSlider({
  label,
  tooltip,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const displayValue =
    Math.abs(value) >= 0.001 && Math.abs(value) < 100000
      ? parseFloat(value.toPrecision(6)).toString()
      : value.toExponential(3);

  const labelEl = (
    <span
      style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        cursor: tooltip ? 'help' : 'default',
      }}
    >
      {label}
    </span>
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2px',
        }}
      >
        {tooltip ? <Tooltip text={tooltip}>{labelEl}</Tooltip> : labelEl}
        <input
          type="number"
          value={displayValue}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          style={{
            width: '90px',
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            color: 'var(--color-text)',
            textAlign: 'right',
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', margin: 0 }}
      />
    </div>
  );
}
