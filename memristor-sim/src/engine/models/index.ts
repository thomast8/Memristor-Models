export { yakopcicModel } from './yakopcic.ts';
export { hpLabsModel } from './hplabs.ts';
export type { MemristorModel, ParameterInfo, ParamValues } from './types.ts';

import { yakopcicModel } from './yakopcic.ts';
import { hpLabsModel } from './hplabs.ts';
import type { MemristorModel } from './types.ts';

/** All available memristor models, keyed by id. */
export const MODEL_REGISTRY: Record<string, MemristorModel> = {
  yakopcic: yakopcicModel,
  hp_labs: hpLabsModel,
};
