/**
 * Simulation orchestrator.
 *
 * Ties together a memristor model, input signal, window function, and
 * ODE solver to produce a complete simulation result. This is the only
 * function the UI needs to call — it handles all the wiring.
 */

import { solve } from './solver.ts';
import { MODEL_REGISTRY } from './models/index.ts';
import type { ParamValues } from './models/types.ts';
import { createSineSignal } from './signals/sine.ts';
import { createTriangleSignal } from './signals/triangle.ts';
import type { SignalType } from './signals/types.ts';
import { createWindowFunction } from './windows.ts';
import type { WindowType } from './windows.ts';

export interface SimulationConfig {
  modelId: string;
  modelParams: ParamValues;
  signalType: SignalType;
  signalParams: { vp: number; vn: number; frequency: number };
  x0: number;
  tMax: number;
  numPoints?: number;
  windowType?: WindowType;
  windowP?: number;
  windowJ?: number;
}

export interface SimulationResult {
  time: number[];
  voltage: number[];
  current: number[];
  stateVariable: number[];
}

/**
 * Run a complete memristor simulation.
 *
 * 1. Build the input signal function
 * 2. Build the window function (HP Labs only)
 * 3. Solve the ODE dx/dt = model.dxdt(t, x, V, params, window)
 * 4. Compute I(t) = model.current(V(t), x(t), params) at each output point
 * 5. Return all arrays for plotting
 */
export function simulate(config: SimulationConfig): SimulationResult {
  const model = MODEL_REGISTRY[config.modelId];
  if (!model) {
    throw new Error(`Unknown model: ${config.modelId}`);
  }

  // Build input signal
  const sigParams = {
    vp: config.signalParams.vp,
    vn: config.signalParams.vn,
    frequency: config.signalParams.frequency,
  };
  const signal =
    config.signalType === 'triangle'
      ? createTriangleSignal(sigParams, config.tMax)
      : createSineSignal(sigParams);

  // Build window function (only used by HP Labs)
  const windowFunc = config.windowType
    ? createWindowFunction(config.windowType, config.windowP, config.windowJ)
    : undefined;

  // ODE right-hand side: dx/dt
  const rhs = (t: number, x: number): number =>
    model.dxdt(t, x, signal, config.modelParams, windowFunc);

  // Solve
  const numPoints = config.numPoints ?? 10_000;
  const sol = solve(rhs, [0, config.tMax], config.x0, { numPoints });

  // Compute voltage and current at each output point
  const time: number[] = new Array(numPoints);
  const voltage: number[] = new Array(numPoints);
  const current: number[] = new Array(numPoints);
  const stateVariable: number[] = new Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    const t = sol.t[i];
    const x = sol.y[i];
    const v = signal(t);
    time[i] = t;
    voltage[i] = v;
    current[i] = model.current(v, x, config.modelParams);
    stateVariable[i] = x;
  }

  return { time, voltage, current, stateVariable };
}
