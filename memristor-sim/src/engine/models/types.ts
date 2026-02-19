/**
 * Core type definitions for memristor models.
 *
 * Every model exposes its tunable parameters as ParameterInfo objects so the UI
 * can auto-generate sliders, tooltips, and educational content without
 * hard-coding anything model-specific.
 */

/** Metadata for a single tunable model parameter. */
export interface ParameterInfo {
  /** Internal key used in the params record (e.g. "a1", "RON"). */
  name: string;
  /** LaTeX symbol for display (e.g. "a_1", "R_{\\mathrm{ON}}"). */
  symbol: string;
  /** Default value used when no preset is loaded. */
  default: number;
  /** Minimum slider value. */
  min: number;
  /** Maximum slider value. */
  max: number;
  /** Slider step size. */
  step: number;
  /** Physical unit (e.g. "V", "m", "\\Omega"). Empty string if dimensionless. */
  unit: string;
  /** Human-readable description of the parameter's physical meaning. */
  description: string;
  /** Grouping key for UI organisation (e.g. "iv", "threshold", "state", "device"). */
  group: string;
}

/** A flat record mapping parameter names to their current numeric values. */
export type ParamValues = Record<string, number>;

/**
 * Interface that every memristor model must implement.
 *
 * Models are stateless pure-function objects: all mutable state (the state
 * variable x) lives in the ODE solver, and all parameter values are passed
 * explicitly via `params`.
 */
export interface MemristorModel {
  /** Unique identifier (e.g. "yakopcic", "hp_labs"). */
  id: string;
  /** Human-readable model name. */
  name: string;
  /** Ordered list of tunable parameter metadata. */
  parameterInfo: ParameterInfo[];
  /**
   * Compute the device current given voltage and state variable.
   * This is the memristance relationship I = f(V, x).
   */
  current(v: number, x: number, params: ParamValues): number;
  /**
   * Compute dx/dt — the state variable derivative.
   * `vFunc(t)` returns the input voltage at time t.
   */
  dxdt(
    t: number,
    x: number,
    vFunc: (t: number) => number,
    params: ParamValues,
    windowFunc?: (x: number, i: number) => number,
  ): number;
}
