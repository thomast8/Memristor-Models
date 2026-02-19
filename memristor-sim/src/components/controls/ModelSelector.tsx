import { useSimulationStore } from '../../stores/simulation.ts';
import { MODEL_REGISTRY } from '../../engine/models/index.ts';
import { Tooltip } from '../ui/Tooltip.tsx';

const MODEL_TOOLTIPS: Record<string, string> = {
  hp_labs:
    'The original 2008 HP Labs physical model. Simulates oxygen vacancy drift in a nanoscale TiO₂ film. Best for understanding the fundamental memristive mechanism.',
  yakopcic:
    'A generalised behavioural model fitted to many oxide-based memristors. Uses sinh I–V relationship with threshold-gated state evolution. Supports Oblea, Miao, and Jo device datasets.',
};

export function ModelSelector() {
  const modelId = useSimulationStore((s) => s.modelId);
  const setModel = useSimulationStore((s) => s.setModel);
  const models = Object.values(MODEL_REGISTRY);

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {models.map((model) => (
        <Tooltip
          key={model.id}
          text={MODEL_TOOLTIPS[model.id] ?? model.name}
          containerStyle={{ flex: 1 }}
        >
          <button
            onClick={() => setModel(model.id)}
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '12px',
              fontWeight: model.id === modelId ? 600 : 400,
              borderRadius: '6px',
              border:
                model.id === modelId
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
              background:
                model.id === modelId
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'var(--color-surface)',
              color:
                model.id === modelId
                  ? 'var(--color-primary)'
                  : 'var(--color-text)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
          >
            {model.name.replace(' Model', '').replace(' Generalised', '')}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
