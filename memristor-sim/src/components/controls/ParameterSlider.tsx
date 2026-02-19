import { useCallback, useRef, useState } from 'react';
import katex from 'katex';
import type { ParameterInfo } from '../../engine/models/types.ts';

interface Props {
  info: ParameterInfo;
  value: number;
  onChange: (value: number) => void;
}

export function ParameterSlider({ info, value, onChange }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        onChange(Math.max(info.min, Math.min(info.max, val)));
      }
    },
    [onChange, info.min, info.max],
  );

  // Render LaTeX symbol
  const symbolHtml = katex.renderToString(info.symbol, {
    throwOnError: false,
    displayMode: false,
  });

  // Format value for display
  const displayValue = formatSciNotation(value);

  return (
    <div
      style={{
        marginBottom: '8px',
        position: 'relative',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: symbolHtml }}
          style={{ fontSize: '13px' }}
        />
        <input
          ref={inputRef}
          type="number"
          value={displayValue}
          step={info.step}
          onChange={handleInputChange}
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

      {/* Slider */}
      <input
        type="range"
        min={info.min}
        max={info.max}
        step={info.step}
        value={value}
        onChange={handleSliderChange}
        style={{ width: '100%', margin: 0 }}
      />

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            lineHeight: 1.5,
            background: '#1a1a2e',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text)',
            maxWidth: '280px',
            zIndex: 100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          {info.description}
          {info.unit && (
            <div style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Unit: {info.unit}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Format a number in scientific notation for small/large values. */
function formatSciNotation(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 100000) {
    // Avoid trailing zeros for "normal" numbers
    return parseFloat(n.toPrecision(6)).toString();
  }
  return n.toExponential(3);
}
