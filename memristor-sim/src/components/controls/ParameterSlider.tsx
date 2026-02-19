import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import katex from 'katex';
import type { ParameterInfo } from '../../engine/models/types.ts';

interface Props {
  info: ParameterInfo;
  value: number;
  onChange: (value: number) => void;
}

export function ParameterSlider({ info, value, onChange }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
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

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    }
    setShowTooltip(true);
  };

  // KaTeX renders trusted LaTeX math — output is sanitized by the library
  const symbolHtml = katex.renderToString(info.symbol, {
    throwOnError: false,
    displayMode: false,
  });

  const displayValue = formatSciNotation(value);

  return (
    <div
      ref={containerRef}
      style={{ marginBottom: '8px', position: 'relative' }}
      onMouseEnter={handleMouseEnter}
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
        {/* eslint-disable-next-line react/no-danger */}
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

      {/* Tooltip via portal — escapes stacking context, renders above WebGL canvas */}
      {showTooltip &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: 'translate(-50%, -100%)',
              padding: '8px 12px',
              fontSize: '11px',
              lineHeight: 1.5,
              background: '#1a1a2e',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: 'var(--color-text)',
              maxWidth: '280px',
              zIndex: 9999,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              whiteSpace: 'normal',
            }}
          >
            {info.description}
            {info.unit && (
              <div style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Unit: {info.unit}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function formatSciNotation(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 100000) {
    return parseFloat(n.toPrecision(6)).toString();
  }
  return n.toExponential(3);
}
