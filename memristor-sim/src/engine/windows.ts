/**
 * Window functions for the HP Labs ion-drift model.
 *
 * Window functions F(x) multiply dx/dt to prevent the state variable
 * from exceeding its physical bounds [0, 1]. Without a window, the
 * linear drift model allows x to grow unboundedly.
 *
 * Different window functions model different physical boundary effects:
 *
 *   - Joglekar: Simple polynomial that goes to 0 at x = 0 and x = 1.
 *     Higher p values create a flatter centre with sharper edges.
 *
 *   - Biolek: Current-dependent window that breaks the symmetry of
 *     SET and RESET, more accurately modelling real devices.
 *
 *   - Anusudha: Alternative polynomial window with a parameter j
 *     that provides additional control over the boundary shape.
 */

export type WindowType = 'none' | 'joglekar' | 'biolek' | 'anusudha';

/**
 * No window — F(x) = 1. Useful for debugging but allows x to exit [0, 1].
 */
function noWindow(_x: number, _i: number): number {
  return 1;
}

/**
 * Joglekar window function.
 * F(x) = 1 − (2x − 1)^(2p)
 *
 * Properties:
 *   - F(0) = F(1) = 0 (blocks drift at boundaries)
 *   - F(0.5) = 1 (maximum drift at centre)
 *   - Higher p → flatter mid-region, sharper boundary effect
 */
function joglekar(x: number, _i: number, p: number): number {
  return 1 - Math.pow(2 * x - 1, 2 * p);
}

/**
 * Biolek window function.
 * F(x, i) = 1 − (x − H(−i))^(2p)
 *
 * where H is the Heaviside step function. The current-dependence
 * means the window shifts based on drift direction, preventing the
 * state from getting "stuck" at a boundary during reversal.
 */
function biolek(x: number, i: number, p: number): number {
  const h = i < 0 ? 1 : 0; // Heaviside(−i)
  return 1 - Math.pow(x - h, 2 * p);
}

/**
 * Anusudha window function.
 * F(x) = j · (1 − 2·(x³ − x + 1)^p)
 *
 * Provides an additional scaling parameter j for fine-tuning
 * the boundary behaviour.
 */
function anusudha(x: number, _i: number, p: number, j: number): number {
  return j * (1 - 2 * Math.pow(x * x * x - x + 1, p));
}

/**
 * Create a window function closure with the given type and parameters.
 * Returns a function (x, i) → F suitable for passing to the HP Labs model.
 */
export function createWindowFunction(
  type: WindowType,
  p: number = 1,
  j: number = 1,
): (x: number, i: number) => number {
  switch (type) {
    case 'joglekar':
      return (x, i) => joglekar(x, i, p);
    case 'biolek':
      return (x, i) => biolek(x, i, p);
    case 'anusudha':
      return (x, i) => anusudha(x, i, p, j);
    case 'none':
    default:
      return noWindow;
  }
}
