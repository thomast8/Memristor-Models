import { useSimulationStore } from '../../stores/simulation.ts';
import { MODEL_REGISTRY } from '../../engine/models/index.ts';
import { ParameterSlider } from './ParameterSlider.tsx';
import { GROUP_LABELS, GROUP_DESCRIPTIONS } from '../../content/parameters.ts';

export function ParameterPanel() {
  const modelId = useSimulationStore((s) => s.modelId);
  const modelParams = useSimulationStore((s) => s.modelParams);
  const setModelParam = useSimulationStore((s) => s.setModelParam);

  const model = MODEL_REGISTRY[modelId];
  if (!model) return null;

  // Group parameters by their group field
  const groups = new Map<string, typeof model.parameterInfo>();
  for (const param of model.parameterInfo) {
    const existing = groups.get(param.group) ?? [];
    existing.push(param);
    groups.set(param.group, existing);
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${groups.size}, 1fr)`,
        gap: '20px',
        minWidth: 0,
      }}
    >
      {Array.from(groups.entries()).map(([groupKey, params]) => (
        <div key={groupKey}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              marginBottom: '4px',
            }}
            title={GROUP_DESCRIPTIONS[groupKey] ?? ''}
          >
            {GROUP_LABELS[groupKey] ?? groupKey}
          </div>
          {params.map((info) => (
            <ParameterSlider
              key={info.name}
              info={info}
              value={modelParams[info.name] ?? info.default}
              onChange={(val) => setModelParam(info.name, val)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
