/**
 * Yakopcic Generalised Memristor Model.
 *
 * Reference:
 *   C. Yakopcic, T. M. Taha, G. Subramanyam, R. E. Pino, and S. Rogers,
 *   "A Memristor Device Model," IEEE Electron Device Letters, vol. 32,
 *   no. 10, pp. 1436-1438, Oct. 2011.
 *
 * The model captures memristive switching behaviour using three coupled
 * functions:
 *
 *   I(t)    = a * x(t) * sinh(b * V(t))     — I-V relationship
 *   dx/dt   = η * g(V) * f(V, x)            — state evolution
 *   g(V)    = threshold function              — onset of switching
 *   f(V, x) = windowing function              — bounds on state variable
 *
 * It has 11 tunable parameters plus the sign flag η.
 */

import type { MemristorModel, ParameterInfo, ParamValues } from './types.ts';

const PARAMETER_INFO: ParameterInfo[] = [
  // — I-V relationship group —
  {
    name: 'a1', symbol: 'a_1', default: 0.17,
    min: 1e-8, max: 2, step: 0.001,
    unit: '', group: 'iv',
    description:
      'Forward-bias current amplitude. Relates to dielectric layer ' +
      'thickness — thinner barriers allow more electron tunneling, ' +
      'increasing conductivity in the positive voltage regime.',
  },
  {
    name: 'a2', symbol: 'a_2', default: 0.17,
    min: 1e-8, max: 2, step: 0.001,
    unit: '', group: 'iv',
    description:
      'Reverse-bias current amplitude. Same physical origin as a₁ but ' +
      'for negative applied voltage, allowing asymmetric I-V curves.',
  },
  {
    name: 'b', symbol: 'b', default: 0.05,
    min: 0.001, max: 5, step: 0.001,
    unit: '', group: 'iv',
    description:
      'I-V curvature. Controls how much of the conduction is Ohmic ' +
      'versus tunneling-dominated. Larger values create a more ' +
      'pronounced sinh nonlinearity.',
  },
  // — Threshold group —
  {
    name: 'Vp', symbol: 'V_p', default: 0.16,
    min: 0.001, max: 5, step: 0.001,
    unit: 'V', group: 'threshold',
    description:
      'Positive voltage threshold. The device state only changes when ' +
      'V > Vp. May relate to the density of oxygen vacancies — more ' +
      'vacancies mean higher current draw and a lower switching ' +
      'threshold.',
  },
  {
    name: 'Vn', symbol: 'V_n', default: 0.15,
    min: 0.001, max: 5, step: 0.001,
    unit: 'V', group: 'threshold',
    description:
      'Negative voltage threshold. The device state only changes when ' +
      'V < −Vn. Allows asymmetric SET/RESET thresholds, common in ' +
      'real oxide-based devices.',
  },
  {
    name: 'Ap', symbol: 'A_p', default: 4000,
    min: 0.001, max: 50000, step: 1,
    unit: '', group: 'threshold',
    description:
      'Positive ion-motion speed. Controls how fast the state variable ' +
      'changes once V exceeds Vp. Related to oxygen-vacancy mobility ' +
      'in the specific metal-oxide dielectric.',
  },
  {
    name: 'An', symbol: 'A_n', default: 4000,
    min: 0.001, max: 50000, step: 1,
    unit: '', group: 'threshold',
    description:
      'Negative ion-motion speed. Controls how fast the state variable ' +
      'changes when V drops below −Vn. Often differs from Ap due to ' +
      'asymmetric electrode materials.',
  },
  // — State variable dynamics group —
  {
    name: 'xp', symbol: 'x_p', default: 0.3,
    min: 0.01, max: 0.99, step: 0.01,
    unit: '', group: 'state',
    description:
      'Positive state-variable linearity boundary. Below xp the state ' +
      'moves freely; above xp the motion is exponentially damped. ' +
      'Physically relates to electrode-dielectric interface effects.',
  },
  {
    name: 'xn', symbol: 'x_n', default: 0.5,
    min: 0.01, max: 0.99, step: 0.01,
    unit: '', group: 'state',
    description:
      'Negative state-variable linearity boundary. Above (1 − xn) the ' +
      'state moves freely; below (1 − xn) the reverse motion is ' +
      'exponentially damped.',
  },
  {
    name: 'alphap', symbol: '\\alpha_p', default: 1,
    min: 0.01, max: 20, step: 0.01,
    unit: '', group: 'state',
    description:
      'Positive exponential decay rate. Determines how aggressively ' +
      'state-variable motion is damped when x > xp. Higher values ' +
      'create a harder boundary.',
  },
  {
    name: 'alphan', symbol: '\\alpha_n', default: 5,
    min: 0.01, max: 20, step: 0.01,
    unit: '', group: 'state',
    description:
      'Negative exponential decay rate. Determines how aggressively ' +
      'state-variable motion is damped when x < (1 − xn). Higher ' +
      'values create a harder boundary.',
  },
  {
    name: 'eta', symbol: '\\eta', default: 1,
    min: -1, max: 1, step: 2,
    unit: '', group: 'state',
    description:
      'State-variable direction flag (+1 or −1). When η = 1 a positive ' +
      'voltage above threshold increases x; when η = −1 it decreases ' +
      'x. Depends on device polarity convention.',
  },
];

/**
 * Windowing function wp(x) ensuring f → 0 as x → 1.
 * wp(x) = (xp − x) / (1 − xp) + 1
 */
function wp(x: number, xp: number): number {
  return (xp - x) / (1 - xp) + 1;
}

/**
 * Windowing function wn(x) ensuring f → 0 as x → 0.
 * wn(x) = x / (1 − xn)
 */
function wn(x: number, xn: number): number {
  return x / (1 - xn);
}

/**
 * Threshold function g(V).
 *
 * Returns 0 when |V| is within the threshold band [−Vn, Vp].
 * Outside the band the rate of state change grows exponentially.
 * The constant term (e^Vp or e^Vn) ensures g starts at 0 right at
 * the threshold, avoiding a discontinuous jump.
 */
function g(v: number, Ap: number, An: number, Vp: number, Vn: number): number {
  if (v > Vp) {
    return Ap * (Math.exp(v) - Math.exp(Vp));
  } else if (v < -Vn) {
    return -An * (Math.exp(-v) - Math.exp(Vn));
  }
  return 0;
}

/**
 * State-variable windowing function f(V, x).
 *
 * Divides state motion into two regimes:
 *   1. Linear region (f = 1): motion is unimpeded
 *   2. Damped region (f decays exponentially): near physical boundaries
 *
 * The direction of motion depends on η·V:
 *   - η·V ≥ 0 → x is increasing → damping kicks in above xp
 *   - η·V < 0 → x is decreasing → damping kicks in below (1 − xn)
 */
function fWindow(
  v: number, x: number,
  alphap: number, alphan: number,
  xp: number, xn: number, eta: number,
): number {
  if (eta * v >= 0) {
    // State increasing
    if (x >= xp) {
      return Math.exp(-alphap * (x - xp)) * wp(x, xp);
    }
    return 1;
  } else {
    // State decreasing
    if (x <= 1 - xn) {
      return Math.exp(alphan * (x + xn - 1)) * wn(x, xn);
    }
    return 1;
  }
}

export const yakopcicModel: MemristorModel = {
  id: 'yakopcic',
  name: 'Yakopcic Generalised Model',
  parameterInfo: PARAMETER_INFO,

  current(v: number, x: number, p: ParamValues): number {
    const a = v >= 0 ? p.a1 : p.a2;
    return a * x * Math.sinh(p.b * v);
  },

  dxdt(
    t: number,
    x: number,
    vFunc: (t: number) => number,
    p: ParamValues,
  ): number {
    const v = vFunc(t);
    const eta = p.eta;
    return (
      eta *
      g(v, p.Ap, p.An, p.Vp, p.Vn) *
      fWindow(v, x, p.alphap, p.alphan, p.xp, p.xn, eta)
    );
  },
};
