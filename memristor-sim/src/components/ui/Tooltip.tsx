import { useState, useRef, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({
  text,
  children,
  containerStyle,
}: {
  text: string;
  children: ReactNode;
  containerStyle?: CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-flex', ...containerStyle }}
      onMouseEnter={() => {
        updatePosition();
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -100%)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              lineHeight: 1.4,
              maxWidth: '220px',
              whiteSpace: 'normal',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  );
}
