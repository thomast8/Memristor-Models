import { useState } from 'react';
import { MemristorIntro } from '../education/MemristorIntro.tsx';

export function Header() {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-alt)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Memristor Simulator
          </h1>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
            }}
          >
            Interactive
          </span>
        </div>
        <button
          onClick={() => setShowIntro(!showIntro)}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text)';
            e.currentTarget.style.borderColor = 'var(--color-text-muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          What is a Memristor?
        </button>
      </header>
      {showIntro && <MemristorIntro onClose={() => setShowIntro(false)} />}
    </>
  );
}
