import { useSimulationStore } from '../../stores/simulation.ts';
import { MODEL_REGISTRY } from '../../engine/models/index.ts';

export function ModelSelector() {
  const modelId = useSimulationStore((s) => s.modelId);
  const setModel = useSimulationStore((s) => s.setModel);
  const models = Object.values(MODEL_REGISTRY);

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => setModel(model.id)}
          style={{
            flex: 1,
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
      ))}
    </div>
  );
}
