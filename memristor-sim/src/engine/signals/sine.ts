/**
 * Sine-wave voltage generator with asymmetric amplitude.
 *
 * Produces V(t) = vp·sin(2πft) for the positive half-cycle and
 *                 vn·sin(2πft) for the negative half-cycle.
 *
 * This allows modelling devices where the SET voltage (positive)
 * and RESET voltage (negative) have different magnitudes.
 */

import type { InputSignal, SignalParams } from './types.ts';

export function createSineSignal(params: SignalParams): InputSignal {
  const { vp } = params;
  const vn = params.vn ?? vp;
  const freq = params.frequency ?? (params.period ? 1 / params.period : 1);

  return (t: number): number => {
    const raw = Math.sin(2 * Math.PI * freq * t);
    return raw >= 0 ? vp * raw : vn * raw;
  };
}
