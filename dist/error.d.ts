import type { PathKey } from './types.js';
export interface ApixErrorInput {
    httpCode: number | null;
    body?: any;
    message?: string | null;
    errors?: any;
    aborted?: boolean;
    timeout?: boolean;
    cause?: unknown;
}
export declare class ApixError extends Error {
    readonly httpCode: number | null;
    readonly body: any;
    readonly aborted: boolean;
    readonly timeout: boolean;
    readonly cause?: unknown;
    private readonly errorBag;
    constructor(input: ApixErrorInput);
    error(key: PathKey): string | null;
    errors(): any;
    errors(key: PathKey): string[];
    keys(): string[];
    has(keyOrKeys: PathKey | PathKey[]): boolean;
    firstKey(): string | null;
}
export declare const getMessageFromBody: (body: any, fallback?: string) => string;
export declare const getErrorsFromBody: (body: any) => any;
//# sourceMappingURL=error.d.ts.map