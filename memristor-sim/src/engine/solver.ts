/**
 * Adaptive Dormand-Prince (RK45) ODE solver.
 *
 * Solves the scalar initial-value problem dx/dt = f(t, x) over [t0, tEnd]
 * with adaptive step-size control. The state variable is clamped to [0, 1]
 * after every step because memristor state variables are physically bounded
 * (x represents a normalised dopant width or filament extent).
 *
 * The Dormand-Prince method is the same algorithm used by MATLAB's ode45
 * and is the default RK45 in scipy's solve_ivp. It uses 6 function
 * evaluations per step and provides a 4th-order solution with a 5th-order
 * error estimate for step-size control (FSAL property).
 */

export interface SolverOptions {
  /** Number of evenly-spaced output points (default 2000). */
  numPoints?: number;
  /** Relative tolerance for step-size control (default 1e-8). */
  rtol?: number;
  /** Absolute tolerance for step-size control (default 1e-10). */
  atol?: number;
  /** Maximum number of internal steps before giving up (default 500000). */
  maxSteps?: number;
}

export interface SolverResult {
  /** Evenly-spaced output times. */
  t: Float64Array;
  /** State variable values at each output time. */
  y: Float64Array;
}

/**
 * Dormand-Prince coefficients.
 * c_i: time nodes
 * a_ij: RK matrix (row-major, lower-triangular)
 * b_i: 5th-order weights
 * e_i: (b_i - b*_i) error weights (difference between 5th and 4th order)
 */
const c2 = 1 / 5, c3 = 3 / 10, c4 = 4 / 5, c5 = 8 / 9;
// c6 = 1, c7 = 1 (not needed explicitly)

const a21 = 1 / 5;
const a31 = 3 / 40, a32 = 9 / 40;
const a41 = 44 / 45, a42 = -56 / 15, a43 = 32 / 9;
const a51 = 19372 / 6561, a52 = -25360 / 2187, a53 = 64448 / 6561, a54 = -212 / 729;
const a61 = 9017 / 3168, a62 = -355 / 33, a63 = 46732 / 5247, a64 = 49 / 176, a65 = -5103 / 18656;
const a71 = 35 / 384, a73 = 500 / 1113, a74 = 125 / 192, a75 = -2187 / 6784, a76 = 11 / 84;

// Error coefficients: e_i = b_i - b*_i
const e1 = 71 / 57600, e3 = -71 / 16695, e4 = 71 / 1920, e5 = -17253 / 339200, e6 = 22 / 525, e7 = -1 / 40;

/** Clamp x to the physically valid range [0, 1]. */
function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Solve dx/dt = f(t, x), x(t0) = x0, outputting at evenly-spaced points.
 *
 * Uses dense output (Hermite interpolation) to evaluate the solution at
 * the requested output times without degrading accuracy.
 */
export function solve(
  f: (t: number, x: number) => number,
  tSpan: [number, number],
  x0: number,
  options: SolverOptions = {},
): SolverResult {
  const numPoints = options.numPoints ?? 2000;
  const rtol = options.rtol ?? 1e-8;
  const atol = options.atol ?? 1e-10;
  const maxSteps = options.maxSteps ?? 500_000;

  const [t0, tEnd] = tSpan;
  const dt = (tEnd - t0) / (numPoints - 1);

  // Output arrays
  const tOut = new Float64Array(numPoints);
  const yOut = new Float64Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    tOut[i] = t0 + i * dt;
  }
  tOut[numPoints - 1] = tEnd; // exact endpoint

  // First output point
  yOut[0] = clamp01(x0);

  let tCur = t0;
  let xCur = clamp01(x0);
  let outIdx = 1; // next output index to fill

  // Initial step-size estimate
  let h = (tEnd - t0) * 1e-3;
  const hMin = (tEnd - t0) * 1e-12;
  const hMax = (tEnd - t0) * 0.1;

  let k1 = f(tCur, xCur);
  let steps = 0;

  while (tCur < tEnd && outIdx < numPoints) {
    if (steps++ > maxSteps) {
      // Fill remaining output with last computed value
      for (let i = outIdx; i < numPoints; i++) yOut[i] = xCur;
      break;
    }

    // Don't overshoot the end
    if (tCur + h > tEnd) h = tEnd - tCur;
    if (h < hMin) h = hMin;

    // --- Dormand-Prince stages ---
    // k1 is already computed (FSAL)
    const k2 = f(tCur + c2 * h, clamp01(xCur + h * a21 * k1));
    const k3 = f(tCur + c3 * h, clamp01(xCur + h * (a31 * k1 + a32 * k2)));
    const k4 = f(tCur + c4 * h, clamp01(xCur + h * (a41 * k1 + a42 * k2 + a43 * k3)));
    const k5 = f(tCur + c5 * h, clamp01(xCur + h * (a51 * k1 + a52 * k2 + a53 * k3 + a54 * k4)));
    const k6 = f(tCur + h, clamp01(xCur + h * (a61 * k1 + a62 * k2 + a63 * k3 + a64 * k4 + a65 * k5)));

    // 5th-order solution
    const xNew = xCur + h * (a71 * k1 + a73 * k3 + a74 * k4 + a75 * k5 + a76 * k6);
    const k7 = f(tCur + h, clamp01(xNew));

    // Error estimate
    const err = h * (e1 * k1 + e3 * k3 + e4 * k4 + e5 * k5 + e6 * k6 + e7 * k7);
    const scale = atol + rtol * Math.max(Math.abs(xCur), Math.abs(xNew));
    const errNorm = Math.abs(err) / scale;

    if (errNorm <= 1.0) {
      // Step accepted
      const tNew = tCur + h;
      const xClamped = clamp01(xNew);

      // Fill output points that fall within [tCur, tNew] using Hermite interpolation
      while (outIdx < numPoints && tOut[outIdx] <= tNew + 1e-14 * Math.abs(tNew)) {
        const theta = (tOut[outIdx] - tCur) / h;
        // 4th-order Hermite interpolant for Dormand-Prince
        const b1 = theta * (1 + theta * (-1337 / 480 + theta * (1039 / 360 - theta * 1163 / 1152)));
        const b3 = theta * theta * (100 / 13 * (theta * (-242 / 45 + theta * 311 / 144)));
        const b4 = theta * theta * (-125 / 48 * (theta * (-2 + theta * 151 / 144)));
        const b5 = theta * theta * (theta * (18225 / 848 * (theta * (-3 / 5 + theta * 121 / 336))));
        const b6 = theta * theta * (theta * (-11 / 3 * (theta * (-3 / 2 + theta * 121 / 120))));
        const b7 = theta * theta * (theta * (1 / 2 * (theta * (-4 / 3 + theta))));
        const xInterp = xCur + h * (b1 * k1 + b3 * k3 + b4 * k4 + b5 * k5 + b6 * k6 + b7 * k7);
        yOut[outIdx] = clamp01(xInterp);
        outIdx++;
      }

      tCur = tNew;
      xCur = xClamped;
      k1 = k7; // FSAL: reuse last stage
    }

    // Step-size adjustment (PI controller)
    const safety = 0.9;
    const errPow = errNorm > 0 ? Math.pow(errNorm, -0.2) : 5.0;
    let hNew = h * Math.min(5.0, Math.max(0.2, safety * errPow));
    if (hNew > hMax) hNew = hMax;
    if (hNew < hMin) hNew = hMin;
    h = hNew;
  }

  // Fill any remaining points (shouldn't normally happen)
  for (let i = outIdx; i < numPoints; i++) {
    yOut[i] = xCur;
  }

  return { t: tOut, y: yOut };
}
