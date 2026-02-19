/**
 * HP Labs Ion-Drift Memristor Model.
 *
 * References:
 *   D. B. Strukov, G. S. Snider, D. R. Stewart, and R. S. Williams,
 *   "The missing memristor found," Nature, vol. 453, pp. 80-83, May 2008.
 *
 *   J. J. Yang, M. D. Pickett, X. Li, D. A. A. Ohlberg, D. R. Stewart,
 *   and R. S. Williams, "Memristive switching mechanism for
 *   metal/oxide/metal nanodevices," Nature Nanotechnology, vol. 3,
 *   pp. 429-433, Jul. 2008.
 *
 * This is a physical model based on the drift of oxygen vacancies in a
 * thin TiO₂ film sandwiched between two platinum electrodes. The device
 * has two regions: a doped region (width w) with low resistance RON and
 * an undoped region (width D − w) with high resistance ROFF.
 *
 * The normalised state variable x = w/D represents the fraction of the
 * device occupied by the doped region:
 *
 *   V(t) = [RON·x + ROFF·(1 − x)] · I(t)
 *   dx/dt = (μD·RON / D²) · I(t) · F(x, i)
 *
 * where F(x, i) is a window function that prevents x from exceeding [0, 1].
 */

import type { MemristorModel, ParameterInfo, ParamValues } from './types.ts';

const PARAMETER_INFO: ParameterInfo[] = [
  {
    name: 'D', symbol: 'D', default: 27e-9,
    min: 1e-9, max: 200e-9, step: 1e-9,
    unit: 'm', group: 'device',
    description:
      'Total device thickness (doped + undoped region). Typical TiO₂ ' +
      'devices are 10–100 nm. Thinner films switch faster but are ' +
      'harder to fabricate reliably.',
  },
  {
    name: 'RON', symbol: 'R_{\\mathrm{ON}}', default: 10e3,
    min: 100, max: 1e6, step: 100,
    unit: '\\Omega', group: 'device',
    description:
      'Low-resistance state (LRS). The resistance when the doped ' +
      'region spans the entire device (x = 1). Determined by the ' +
      'dopant concentration and film area.',
  },
  {
    name: 'ROFF', symbol: 'R_{\\mathrm{OFF}}', default: 100e3,
    min: 1e3, max: 1e8, step: 1e3,
    unit: '\\Omega', group: 'device',
    description:
      'High-resistance state (HRS). The resistance when the undoped ' +
      'region spans the entire device (x = 0). Typically 10–1000× ' +
      'larger than RON.',
  },
  {
    name: 'muD', symbol: '\\mu_D', default: 1e-14,
    min: 1e-16, max: 1e-10, step: 1e-16,
    unit: 'm^2 s^{-1} V^{-1}', group: 'device',
    description:
      'Average drift mobility of oxygen vacancies. This is the key ' +
      'material parameter — it determines switching speed. For TiO₂ ' +
      'values are typically 10⁻¹⁴ to 10⁻¹⁰ m²s⁻¹V⁻¹.',
  },
];

export const hpLabsModel: MemristorModel = {
  id: 'hp_labs',
  name: 'HP Labs Ion-Drift Model',
  parameterInfo: PARAMETER_INFO,

  current(v: number, x: number, p: ParamValues): number {
    const R = p.RON * x + p.ROFF * (1 - x);
    return v / R;
  },

  dxdt(
    t: number,
    x: number,
    vFunc: (t: number) => number,
    p: ParamValues,
    windowFunc?: (x: number, i: number) => number,
  ): number {
    const v = vFunc(t);
    const R = p.RON * x + p.ROFF * (1 - x);
    const i = v / R;
    const F = windowFunc ? windowFunc(x, i) : 1;
    return ((p.muD * p.RON) / (p.D * p.D)) * i * F;
  },
};
