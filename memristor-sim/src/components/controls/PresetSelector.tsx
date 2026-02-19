import { useSimulationStore } from '../../stores/simulation.ts';
import { PRESETS } from '../../engine/presets.ts';

export function PresetSelector() {
  const modelId = useSimulationStore((s) => s.modelId);
  const loadPreset = useSimulationStore((s) => s.loadPreset);
  const currentParams = useSimulationStore((s) => s.modelParams);

  const relevantPresets = PRESETS.filter((p) => p.modelId === modelId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {relevantPresets.map((preset) => {
        const isActive = isPresetActive(preset.modelParams, currentParams);
        return (
          <button
            key={preset.id}
            onClick={() => loadPreset(preset)}
            title={preset.description}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              textAlign: 'left',
              borderRadius: '6px',
              border: isActive
                ? '1px solid var(--color-accent)'
                : '1px solid var(--color-border)',
              background: isActive
                ? 'rgba(129, 140, 248, 0.1)'
                : 'var(--color-surface)',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 500 }}>{preset.name}</div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {preset.description.split('.')[0]}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--color-accent)',
                marginTop: '3px',
                fontStyle: 'italic',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: 0.85,
              }}
            >
              ◈ {preset.citation}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function isPresetActive(
  presetParams: Record<string, number>,
  currentParams: Record<string, number>,
): boolean {
  for (const key of Object.keys(presetParams)) {
    if (Math.abs((presetParams[key] ?? 0) - (currentParams[key] ?? 0)) > 1e-15) {
      return false;
    }
  }
  return true;
}
