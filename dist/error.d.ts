import type { PathInput } from './types.js';
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
    error(key: PathInput): string | null;
    errors(): any;
    errors(key: PathInput): string[];
    keys(): string[];
    has(keyOrKeys: PathInput): boolean;
    firstKey(): string | null;
}
export declare const getMessageFromBody: (body: any, fallback?: string) => string;
export declare const getErrorsFromBody: (body: any) => any;
