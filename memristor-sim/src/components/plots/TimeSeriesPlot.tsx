import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult } from '../../engine/simulate.ts';

interface Props {
  result: SimulationResult;
}

/**
 * Time-series plot with dual y-axes: current (blue, left) and voltage (red, right).
 * Replicates the matplotlib twinx pattern from the original functions.py.
 */
export function TimeSeriesPlot({ result }: Props) {
  const { scaledCurrent, currentUnit, scaledTime, timeUnit } = useMemo(
    () => autoScale(result),
    [result],
  );

  return (
    <Plot
      data={[
        {
          x: scaledTime,
          y: scaledCurrent,
          type: 'scattergl',
          mode: 'lines',
          name: 'Current',
          line: { color: '#60a5fa', width: 2 },
          yaxis: 'y',
          hovertemplate:
            `I = %{y:.4g} ${currentUnit}<br>` +
            `t = %{x:.4g} ${timeUnit}<extra></extra>`,
        },
        {
          x: scaledTime,
          y: result.voltage,
          type: 'scattergl',
          mode: 'lines',
          name: 'Voltage',
          line: { color: '#f87171', width: 1.5, dash: 'dot' },
          yaxis: 'y2',
          hovertemplate: 'V = %{y:.4g} V<br>t = %{x:.4g} ' + timeUnit + '<extra></extra>',
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 65, r: 65, t: 35, b: 50 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e0e0ee', size: 11 },
        title: {
          text: 'Current & Voltage vs Time',
          font: { size: 13, color: '#8888a0' },
          x: 0.5,
          y: 0.98,
        },
        xaxis: {
          title: { text: `Time (${timeUnit})`, standoff: 8 },
          gridcolor: '#2a2a3c',
          zerolinecolor: '#383850',
          color: '#8888a0',
        },
        yaxis: {
          title: { text: `Current (${currentUnit})`, font: { color: '#60a5fa' }, standoff: 6 },
          gridcolor: '#2a2a3c',
          zerolinecolor: '#383850',
          tickfont: { color: '#60a5fa' },
          side: 'left',
        },
        yaxis2: {
          title: { text: 'Voltage (V)', font: { color: '#f87171' }, standoff: 6 },
          tickfont: { color: '#f87171' },
          overlaying: 'y',
          side: 'right',
          gridcolor: 'rgba(0,0,0,0)',
          zerolinecolor: '#383850',
        },
        legend: {
          x: 0.01,
          y: 0.99,
          bgcolor: 'rgba(30,30,46,0.8)',
          bordercolor: '#383850',
          borderwidth: 1,
          font: { size: 10 },
        },
        hovermode: 'x unified',
      }}
      config={{
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        displaylogo: false,
        toImageButtonOptions: {
          format: 'svg',
          filename: 'memristor_time_series',
        },
      }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
    />
  );
}

interface ScaleResult {
  scaledCurrent: number[];
  currentUnit: string;
  scaledTime: number[];
  timeUnit: string;
}

/**
 * Auto-scale current and time arrays to appropriate SI prefixes.
 * Replaces the order_of_magnitude.symbol() calls from the Python code.
 */
function autoScale(result: SimulationResult): ScaleResult {
  const maxI = Math.max(...result.current.map(Math.abs));
  const maxT = Math.max(...result.time);

  const { factor: iFactor, unit: iUnit } = siPrefix(maxI, 'A');
  const { factor: tFactor, unit: tUnit } = siPrefix(maxT, 's');

  return {
    scaledCurrent: result.current.map((i) => i / iFactor),
    currentUnit: iUnit,
    scaledTime: result.time.map((t) => t / tFactor),
    timeUnit: tUnit,
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
    [1e-6, '\u00B5'], // micro sign
    [1e-3, 'm'],
    [1, ''],
    [1e3, 'k'],
    [1e6, 'M'],
  ];

  for (let i = 0; i < prefixes.length - 1; i++) {
    if (abs < prefixes[i + 1][0]) {
      return {
        factor: prefixes[i][0],
        unit: prefixes[i][1] + baseUnit,
      };
    }
  }

  const last = prefixes[prefixes.length - 1];
  return { factor: last[0], unit: last[1] + baseUnit };
}
