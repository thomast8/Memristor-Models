/**
 * Predefined experiment configurations.
 *
 * Each preset reproduces a published device characterisation from the
 * memristor literature. The parameter values are taken directly from
 * the original papers or from fitted results.
 *
 * Ported from experiments.py — preserving exact parameter values.
 */

import type { SignalType } from './signals/types.ts';
import type { WindowType } from './windows.ts';
import type { ParamValues } from './models/types.ts';

export interface ExperimentPreset {
  id: string;
  name: string;
  description: string;
  modelId: string;
  signalType: SignalType;
  signalParams: { vp: number; vn: number; frequency: number };
  modelParams: ParamValues;
  x0: number;
  tMax: number;
  windowType?: WindowType;
  windowP?: number;
  windowJ?: number;
}

export const PRESETS: ExperimentPreset[] = [
  // ─── HP Labs experiments ───
  {
    id: 'hp_sine',
    name: 'HP Labs — Sine Wave',
    description:
      'HP Labs ion-drift model with a 1 V, 1 Hz sine wave. Demonstrates ' +
      'basic memristive pinched-hysteresis behaviour with a Joglekar ' +
      'window function (p = 7) on a 27 nm TiO₂ device.',
    modelId: 'hp_labs',
    signalType: 'sine',
    signalParams: { vp: 1, vn: 1, frequency: 1 },
    modelParams: { D: 27e-9, RON: 10e3, ROFF: 100e3, muD: 1e-14 },
    x0: 0.1,
    tMax: 2,
    windowType: 'joglekar',
    windowP: 7,
  },
  {
    id: 'hp_pulsed',
    name: 'HP Labs — Triangle Pulse',
    description:
      'HP Labs model driven by a triangle wave (0.5 Hz), simulating a ' +
      'DC voltage sweep on an 85 nm device. Uses Joglekar window (p = 2) ' +
      'with lower RON showing a more gradual switching characteristic.',
    modelId: 'hp_labs',
    signalType: 'triangle',
    signalParams: { vp: 1, vn: 1, frequency: 0.5 },
    modelParams: { D: 85e-9, RON: 1e3, ROFF: 10e3, muD: 2e-14 },
    x0: 0.093,
    tMax: 8,
    windowType: 'joglekar',
    windowP: 2,
  },

  // ─── Yakopcic experiments ───
  {
    id: 'oblea_sine',
    name: 'Oblea — Sine Wave',
    description:
      'Yakopcic model fitted to Oblea et al. device data using a ' +
      '100 Hz sine wave with 0.45 V amplitude. Shows fast switching ' +
      'in a sub-millisecond timescale characteristic of Nb-doped SrTiO₃ devices.',
    modelId: 'yakopcic',
    signalType: 'sine',
    signalParams: { vp: 0.45, vn: 0.45, frequency: 100 },
    modelParams: {
      a1: 0.17, a2: 0.17, b: 0.05,
      Ap: 4000, An: 4000, Vp: 0.16, Vn: 0.15,
      alphap: 1, alphan: 5, xp: 0.3, xn: 0.5,
      eta: 1,
    },
    x0: 0.11,
    tMax: 40e-3,
  },
  {
    id: 'oblea_pulsed',
    name: 'Oblea — Triangle Pulse',
    description:
      'Yakopcic model fitted to Oblea device with a 100 Hz triangle ' +
      'pulse (±0.25 V). Demonstrates asymmetric SET/RESET with ' +
      'low-voltage operation and different a1/a2 amplitudes.',
    modelId: 'yakopcic',
    signalType: 'triangle',
    signalParams: { vp: 0.25, vn: 0.25, frequency: 100 },
    modelParams: {
      a1: 0.097, a2: 0.097, b: 0.05,
      Ap: 4000, An: 4000, Vp: 0.16, Vn: 0.15,
      alphap: 1, alphan: 5, xp: 0.3, xn: 0.5,
      eta: 1,
    },
    x0: 0.001,
    tMax: 50e-3,
  },
  {
    id: 'miao',
    name: 'Miao Device',
    description:
      'Yakopcic model fitted to Miao et al. data. Triangle-wave drive ' +
      'with asymmetric amplitude (+0.75 V / −1.25 V) over a 20 s sweep. ' +
      'Exhibits strongly asymmetric I-V with lower threshold voltages.',
    modelId: 'yakopcic',
    signalType: 'triangle',
    signalParams: { vp: 0.75, vn: 1.25, frequency: 1 / 20 },
    modelParams: {
      a1: 0.11, a2: 0.11, b: 0.5,
      Ap: 7.5, An: 2, Vp: 0.09, Vn: 0.75,
      alphap: 1, alphan: 5, xp: 0.3, xn: 0.5,
      eta: 1,
    },
    x0: 0.11,
    tMax: 20,
  },
  {
    id: 'jo',
    name: 'Jo Device',
    description:
      'Yakopcic model fitted to Jo et al. data. High drive voltages ' +
      '(+4 V / −2 V) with very small current amplitudes (a₁ ≈ 3.7×10⁻⁷), ' +
      'representing a high-resistance device with sharp switching.',
    modelId: 'yakopcic',
    signalType: 'triangle',
    signalParams: { vp: 4, vn: 2, frequency: 1 / 5 },
    modelParams: {
      a1: 3.7e-7, a2: 4.35e-7, b: 0.7,
      Ap: 0.005, An: 0.08, Vp: 1.5, Vn: 0.5,
      alphap: 1.2, alphan: 3, xp: 0.2, xn: 0.5,
      eta: 1,
    },
    x0: 0.1,
    tMax: 20,
  },
];
