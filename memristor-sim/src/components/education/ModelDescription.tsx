import katex from 'katex';
import { useSimulationStore } from '../../stores/simulation.ts';
import { MODEL_CONTENT } from '../../content/models.ts';

export function ModelDescription() {
  const modelId = useSimulationStore((s) => s.modelId);
  const content = MODEL_CONTENT[modelId];

  if (!content) return null;

  return (
    <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
      <p
        style={{
          color: 'var(--color-text-muted)',
          marginTop: 0,
          marginBottom: '12px',
        }}
      >
        {content.shortDescription}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {content.equations.map((eq, idx) => (
          <div
            key={idx}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              {eq.label}
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(eq.latex, {
                  throwOnError: false,
                  displayMode: true,
                }),
              }}
              style={{
                overflowX: 'auto',
                fontSize: '11px',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '14px' }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-text-muted)',
            marginBottom: '6px',
          }}
        >
          References
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: '16px',
            color: 'var(--color-text-muted)',
            fontSize: '10px',
            lineHeight: 1.5,
          }}
        >
          {content.references.map((ref, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              {ref}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
