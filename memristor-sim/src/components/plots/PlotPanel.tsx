import { useSimulationStore } from '../../stores/simulation.ts';
import { TimeSeriesPlot } from './TimeSeriesPlot.tsx';
import { IVCurvePlot } from './IVCurvePlot.tsx';

export function PlotPanel() {
  const result = useSimulationStore((s) => s.result);
  const error = useSimulationStore((s) => s.error);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
        }}
      >
        <div
          style={{
            padding: '20px 28px',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
            fontSize: '13px',
            maxWidth: '500px',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>
            Simulation Error
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {error}
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            Try adjusting the parameters or loading a preset.
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}
      >
        Select a model and parameters to begin simulation.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        height: '100%',
        minHeight: 0,
      }}
    >
      <div
        style={{
          borderRight: '1px solid var(--color-border)',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <TimeSeriesPlot result={result} />
      </div>
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        <IVCurvePlot result={result} />
      </div>
    </div>
  );
}
