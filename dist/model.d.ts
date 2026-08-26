import type { ApixModel, InternalApixState, ModelInternals, ModelOptions } from './types.js';
export declare const createApixModel: <TData>(apixState: InternalApixState, initialUrl: string, initialOptions?: ModelOptions<TData>, bodyType?: ModelInternals["bodyType"]) => ApixModel<TData>;
