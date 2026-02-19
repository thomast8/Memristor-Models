import katex from 'katex';
import { MEMRISTOR_INTRO } from '../../content/models.ts';

interface Props {
  onClose: () => void;
}

export function MemristorIntro({ onClose }: Props) {
  const equationHtml = katex.renderToString(MEMRISTOR_INTRO.keyEquation, {
    throwOnError: false,
    displayMode: true,
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
            {MEMRISTOR_INTRO.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            &times;
          </button>
        </div>

        {MEMRISTOR_INTRO.content.split('\n\n').map((paragraph, idx) => (
          <p
            key={idx}
            style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--color-text)',
              marginBottom: '16px',
            }}
          >
            {paragraph}
          </p>
        ))}

        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: equationHtml }}
            style={{ marginBottom: '8px' }}
          />
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            {MEMRISTOR_INTRO.keyEquationLabel}
          </div>
        </div>

        <div
          style={{
            marginTop: '16px',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          L. O. Chua, &ldquo;Memristor &mdash; The Missing Circuit Element,&rdquo;
          IEEE Transactions on Circuit Theory, vol. CT-18, no. 5, pp. 507-519,
          Sep. 1971.
        </div>
      </div>
    </div>
  );
}
