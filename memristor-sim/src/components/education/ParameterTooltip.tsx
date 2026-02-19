import katex from 'katex';
import type { ParameterInfo } from '../../engine/models/types.ts';

interface Props {
  info: ParameterInfo;
}

/**
 * Standalone tooltip card for a parameter, showing its LaTeX symbol,
 * physical meaning, and unit. Used in parameter guides and help panels.
 */
export function ParameterTooltip({ info }: Props) {
  const symbolHtml = katex.renderToString(info.symbol, {
    throwOnError: false,
  });

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '6px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        fontSize: '12px',
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: symbolHtml }} />
        {info.unit && (
          <span
            style={{
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              padding: '1px 6px',
              borderRadius: '3px',
              background: 'var(--color-surface-alt)',
            }}
          >
            {info.unit}
          </span>
        )}
      </div>
      <div style={{ color: 'var(--color-text-muted)' }}>{info.description}</div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '10px',
          color: 'var(--color-text-muted)',
          fontFamily: 'monospace',
        }}
      >
        Range: [{formatValue(info.min)}, {formatValue(info.max)}] | Default:{' '}
        {formatValue(info.default)}
      </div>
    </div>
  );
}

function formatValue(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 100000) return n.toString();
  return n.toExponential(1);
}
