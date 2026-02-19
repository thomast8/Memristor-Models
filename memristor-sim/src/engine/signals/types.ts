/** A callable that returns the input voltage at time t. */
export type InputSignal = (t: number) => number;

/** Signal types available in the UI. */
export type SignalType = 'sine' | 'triangle';

/** Parameters shared by all signal generators. */
export interface SignalParams {
  /** Positive peak voltage (V). */
  vp: number;
  /** Negative peak voltage (V). If undefined, mirrors vp. */
  vn?: number;
  /** Signal frequency in Hz. Exactly one of frequency/period must be set. */
  frequency?: number;
  /** Signal period in seconds. Exactly one of frequency/period must be set. */
  period?: number;
}
