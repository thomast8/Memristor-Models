/**
 * Triangle-wave voltage generator with asymmetric amplitude.
 *
 * Produces a triangle/sawtooth waveform that ramps up to +vp in the
 * first half of the simulation, then ramps down to −vn in the second half.
 * This is the standard waveform used for DC voltage sweeps in memristor
 * characterisation (e.g. 0 → +V → 0 → −V → 0).
 *
 * Ported from functions.py:Triangle, which uses scipy.signal.sawtooth.
 */

import type { InputSignal, SignalParams } from './types.ts';

/**
 * Attempt to produce a sawtooth that, when passed through Math.abs(),
 * gives a triangle wave.  This matches scipy.signal.sawtooth(t, 0.5)
 * which produces a symmetric triangle from −1 to +1.
 */
function sawtooth(phase: number): number {
  // Normalise phase to [0, 2π)
  const p = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  // scipy.signal.sawtooth(t, 0.5) = symmetric triangle:
  //   rises from −1 to +1 over [0, π], falls from +1 to −1 over [π, 2π]
  if (p <= Math.PI) {
    return -1 + (2 * p) / Math.PI;
  }
  return 1 - (2 * (p - Math.PI)) / Math.PI;
}

export function createTriangleSignal(
  params: SignalParams,
  tMax: number,
): InputSignal {
  const { vp } = params;
  const vn = params.vn ?? vp;
  const freq = params.frequency ?? (params.period ? 1 / params.period : 1);

  return (t: number): number => {
    const phase = 2 * Math.PI * freq * t + Math.PI / 2;
    const saw = sawtooth(phase);
    let pos = vp * Math.abs(saw);
    const neg = -vn * Math.abs(saw);

    // In the second half of the total sweep, flip the positive waveform
    // to create the full 0 → +V → 0 → −V → 0 characteristic
    if (t > tMax / 2) {
      pos *= -1;
    }

    return pos > 0 ? pos : neg;
  };
}
