import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult } from '../../engine/simulate.ts';

interface Props {
  result: SimulationResult;
}

/**
 * I-V characteristic hysteresis loop with directional arrows.
 * The arrows show which direction the voltage is sweeping, making the
 * pinched hysteresis loop easier to interpret.
 *
 * Replicates the arrows() function from functions.py:109-116.
 */
export function IVCurvePlot({ result }: Props) {
  const { scaledCurrent, currentUnit, arrows } = useMemo(
    () => processData(result),
    [result],
  );

  return (
    <Plot
      data={[
        // Main I-V curve
        {
          x: result.voltage,
          y: scaledCurrent,
          type: 'scattergl',
          mode: 'lines',
          name: 'I-V Curve',
          line: { color: '#60a5fa', width: 2 },
          hovertemplate:
            `V = %{x:.4g} V<br>I = %{y:.4g} ${currentUnit}<extra></extra>`,
        },
        // Arrows showing sweep direction — increasing voltage (red >)
        {
          x: arrows.increasing.v,
          y: arrows.increasing.i,
          type: 'scatter',
          mode: 'markers',
          name: 'V increasing',
          marker: {
            symbol: 'triangle-right',
            size: 7,
            color: '#f87171',
            opacity: 0.7,
          },
          hoverinfo: 'skip',
          showlegend: true,
        },
        // Arrows showing sweep direction — decreasing voltage (blue <)
        {
          x: arrows.decreasing.v,
          y: arrows.decreasing.i,
          type: 'scatter',
          mode: 'markers',
          name: 'V decreasing',
          marker: {
            symbol: 'triangle-left',
            size: 7,
            color: '#818cf8',
            opacity: 0.7,
          },
          hoverinfo: 'skip',
          showlegend: true,
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 65, r: 20, t: 35, b: 50 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e0e0ee', size: 11 },
        title: {
          text: 'I-V Characteristic',
          font: { size: 13, color: '#8888a0' },
          x: 0.5,
          y: 0.98,
        },
        xaxis: {
          title: { text: 'Voltage (V)', standoff: 8 },
          gridcolor: '#2a2a3c',
          zerolinecolor: '#505068',
          zerolinewidth: 1,
          color: '#8888a0',
        },
        yaxis: {
          title: { text: `Current (${currentUnit})`, standoff: 6 },
          gridcolor: '#2a2a3c',
          zerolinecolor: '#505068',
          zerolinewidth: 1,
          color: '#8888a0',
        },
        legend: {
          x: 0.01,
          y: 0.99,
          bgcolor: 'rgba(30,30,46,0.8)',
          bordercolor: '#383850',
          borderwidth: 1,
          font: { size: 10 },
        },
        hovermode: 'closest',
      }}
      config={{
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        displaylogo: false,
        toImageButtonOptions: {
          format: 'svg',
          filename: 'memristor_iv_curve',
        },
      }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
    />
  );
}

interface ArrowData {
  increasing: { v: number[]; i: number[] };
  decreasing: { v: number[]; i: number[] };
}

function processData(result: SimulationResult) {
  const maxI = Math.max(...result.current.map(Math.abs));
  const { factor, unit } = siPrefix(maxI, 'A');
  const scaledCurrent = result.current.map((i) => i / factor);

  // Sample every ~200th point for arrows (matching Python code)
  const step = Math.max(1, Math.floor(result.voltage.length / 200));
  const increasing: { v: number[]; i: number[] } = { v: [], i: [] };
  const decreasing: { v: number[]; i: number[] } = { v: [], i: [] };

  for (let idx = step; idx < result.voltage.length; idx += step) {
    const dv = result.voltage[idx] - result.voltage[idx - step];
    if (dv > 0) {
      increasing.v.push(result.voltage[idx]);
      increasing.i.push(scaledCurrent[idx]);
    } else if (dv < 0) {
      decreasing.v.push(result.voltage[idx]);
      decreasing.i.push(scaledCurrent[idx]);
    }
  }

  return {
    scaledCurrent,
    currentUnit: unit,
    arrows: { increasing, decreasing } as ArrowData,
  };
}

function siPrefix(
  value: number,
  baseUnit: string,
): { factor: number; unit: string } {
  const abs = Math.abs(value);
  if (abs === 0) return { factor: 1, unit: baseUnit };

  const prefixes: [number, string][] = [
    [1e-15, 'f'],
    [1e-12, 'p'],
    [1e-9, 'n'],
    [1e-6, '\u00B5'],
    [1e-3, 'm'],
    [1, ''],
    [1e3, 'k'],
    [1e6, 'M'],
  ];

  for (let i = 0; i < prefixes.length - 1; i++) {
    if (abs < prefixes[i + 1][0]) {
      return { factor: prefixes[i][0], unit: prefixes[i][1] + baseUnit };
    }
  }

  const last = prefixes[prefixes.length - 1];
  return { factor: last[0], unit: last[1] + baseUnit };
}
