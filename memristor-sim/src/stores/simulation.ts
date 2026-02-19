/**
 * Central application state using Zustand.
 *
 * Holds the selected model, all parameter values, signal configuration,
 * and the latest simulation result. Every parameter change triggers an
 * immediate re-simulation (< 5 ms in-browser) and plot update.
 */

import { create } from 'zustand';
import { MODEL_REGISTRY } from '../engine/models/index.ts';
import type { ParamValues } from '../engine/models/types.ts';
import type { SignalType } from '../engine/signals/types.ts';
import type { WindowType } from '../engine/windows.ts';
import { PRESETS } from '../engine/presets.ts';
import type { ExperimentPreset } from '../engine/presets.ts';
import { simulate } from '../engine/simulate.ts';
import type { SimulationResult } from '../engine/simulate.ts';

export interface SimulationState {
  // Model
  modelId: string;
  modelParams: ParamValues;

  // Signal
  signalType: SignalType;
  signalParams: { vp: number; vn: number; frequency: number };

  // Simulation
  x0: number;
  tMax: number;

  // HP Labs window
  windowType: WindowType;
  windowP: number;
  windowJ: number;

  // Results
  result: SimulationResult | null;
  error: string | null;

  // Actions
  setModel: (modelId: string) => void;
  setModelParam: (name: string, value: number) => void;
  setSignalType: (type: SignalType) => void;
  setSignalParam: (name: string, value: number) => void;
  setX0: (x0: number) => void;
  setTMax: (tMax: number) => void;
  setWindowType: (type: WindowType) => void;
  setWindowP: (p: number) => void;
  setWindowJ: (j: number) => void;
  loadPreset: (preset: ExperimentPreset) => void;
  runSimulation: () => void;
  resetToDefaults: () => void;
}

/** Build a ParamValues record from a model's default parameter info. */
function defaultParams(modelId: string): ParamValues {
  const model = MODEL_REGISTRY[modelId];
  if (!model) return {};
  const params: ParamValues = {};
  for (const info of model.parameterInfo) {
    params[info.name] = info.default;
  }
  return params;
}

/** Run the simulation and return result or error. */
function runSim(state: {
  modelId: string;
  modelParams: ParamValues;
  signalType: SignalType;
  signalParams: { vp: number; vn: number; frequency: number };
  x0: number;
  tMax: number;
  windowType: WindowType;
  windowP: number;
  windowJ: number;
}): { result: SimulationResult | null; error: string | null } {
  try {
    const result = simulate({
      modelId: state.modelId,
      modelParams: state.modelParams,
      signalType: state.signalType,
      signalParams: state.signalParams,
      x0: state.x0,
      tMax: state.tMax,
      windowType: state.modelId === 'hp_labs' ? state.windowType : undefined,
      windowP: state.windowP,
      windowJ: state.windowJ,
    });
    return { result, error: null };
  } catch (e) {
    return { result: null, error: e instanceof Error ? e.message : String(e) };
  }
}

// Load the first preset as the initial state
const initialPreset = PRESETS[0];

export const useSimulationStore = create<SimulationState>()((set, get) => {
  const initialState = {
    modelId: initialPreset.modelId,
    modelParams: { ...initialPreset.modelParams },
    signalType: initialPreset.signalType,
    signalParams: { ...initialPreset.signalParams },
    x0: initialPreset.x0,
    tMax: initialPreset.tMax,
    windowType: (initialPreset.windowType ?? 'joglekar') as WindowType,
    windowP: initialPreset.windowP ?? 1,
    windowJ: initialPreset.windowJ ?? 1,
  };

  const { result, error } = runSim(initialState);

  return {
    ...initialState,
    result,
    error,

    setModel: (modelId: string) => {
      const params = defaultParams(modelId);
      const model = MODEL_REGISTRY[modelId];
      if (!model) return;

      // Find a matching preset for sensible defaults
      const preset = PRESETS.find((p) => p.modelId === modelId);
      const newState = {
        ...get(),
        modelId,
        modelParams: preset ? { ...preset.modelParams } : params,
        signalType: (preset?.signalType ?? get().signalType) as SignalType,
        signalParams: preset ? { ...preset.signalParams } : get().signalParams,
        x0: preset?.x0 ?? 0.1,
        tMax: preset?.tMax ?? 1,
        windowType: (preset?.windowType ?? 'joglekar') as WindowType,
        windowP: preset?.windowP ?? 1,
        windowJ: preset?.windowJ ?? 1,
      };
      const { result, error } = runSim(newState);
      set({ ...newState, result, error });
    },

    setModelParam: (name: string, value: number) => {
      const newState = {
        ...get(),
        modelParams: { ...get().modelParams, [name]: value },
      };
      const { result, error } = runSim(newState);
      set({ modelParams: newState.modelParams, result, error });
    },

    setSignalType: (signalType: SignalType) => {
      const newState = { ...get(), signalType };
      const { result, error } = runSim(newState);
      set({ signalType, result, error });
    },

    setSignalParam: (name: string, value: number) => {
      const newSignalParams = { ...get().signalParams, [name]: value };
      const newState = { ...get(), signalParams: newSignalParams };
      const { result, error } = runSim(newState);
      set({ signalParams: newSignalParams, result, error });
    },

    setX0: (x0: number) => {
      const newState = { ...get(), x0 };
      const { result, error } = runSim(newState);
      set({ x0, result, error });
    },

    setTMax: (tMax: number) => {
      const newState = { ...get(), tMax };
      const { result, error } = runSim(newState);
      set({ tMax, result, error });
    },

    setWindowType: (windowType: WindowType) => {
      const newState = { ...get(), windowType };
      const { result, error } = runSim(newState);
      set({ windowType, result, error });
    },

    setWindowP: (windowP: number) => {
      const newState = { ...get(), windowP };
      const { result, error } = runSim(newState);
      set({ windowP, result, error });
    },

    setWindowJ: (windowJ: number) => {
      const newState = { ...get(), windowJ };
      const { result, error } = runSim(newState);
      set({ windowJ, result, error });
    },

    loadPreset: (preset: ExperimentPreset) => {
      const newState = {
        modelId: preset.modelId,
        modelParams: { ...preset.modelParams },
        signalType: preset.signalType as SignalType,
        signalParams: { ...preset.signalParams },
        x0: preset.x0,
        tMax: preset.tMax,
        windowType: (preset.windowType ?? 'joglekar') as WindowType,
        windowP: preset.windowP ?? 1,
        windowJ: preset.windowJ ?? 1,
      };
      const { result, error } = runSim(newState);
      set({ ...newState, result, error });
    },

    runSimulation: () => {
      const { result, error } = runSim(get());
      set({ result, error });
    },

    resetToDefaults: () => {
      const preset = PRESETS[0];
      get().loadPreset(preset);
    },
  };
});
