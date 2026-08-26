import type { PathKey, PathList, ResponseFilter } from './types.js';
export interface PathHit {
    exists: boolean;
    value: any;
    segments: string[];
}
export declare const isPlainObject: (value: unknown) => value is Record<string, any>;
export declare const isObjectLike: (value: unknown) => value is Record<string, any>;
export declare const normalizePath: (path: PathKey) => string;
export declare const cloneDeep: <T>(value: T) => T;
export declare const mergeDeep: <T>(target: T, source: any) => T;
export declare const locatePath: (source: any, path: PathKey) => PathHit;
export declare const getByPath: (source: any, path: PathKey) => any;
export declare const hasByPath: (source: any, path: PathKey) => boolean;
export declare const setBySegments: (target: Record<string, any>, segments: string[], value: any) => void;
export declare const setByPath: (target: Record<string, any>, path: PathKey, value: any) => void;
export declare const deleteByPath: (target: any, path: PathKey) => void;
export declare const pickPaths: (source: any, paths: PathList) => any;
export declare const filterData: (source: any, filter?: ResponseFilter) => any;
export declare const createSnapshot: (source: any, omit?: PathList) => any;
export declare const deepEqual: (left: any, right: any) => boolean;
export declare const getDirtyData: (current: any, original: any) => any;
export declare const collectChangedPaths: (current: any, previous: any, prefix?: string) => string[];
//# sourceMappingURL=path.d.ts.map