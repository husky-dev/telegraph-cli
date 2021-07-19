export interface UnknownDict {
  [index: string]: unknown;
}

export const isUnknownDict = (candidate: unknown): candidate is UnknownDict =>
  typeof candidate === 'object' && candidate !== null;

export const isErr = (val: unknown): val is Error => val instanceof Error;

export const isStr = (val: unknown): val is string => typeof val === 'string';

export const isNum = (val: unknown): val is number => typeof val === 'number';

export const isBool = (val: unknown): val is boolean => typeof val === 'boolean';

export const isNull = (val: unknown): val is null => val === null;

export const isUndef = (val: unknown): val is undefined => typeof val === 'undefined';

type UnknownFunc = (...args: unknown[]) => unknown;

export const isFunc = (val: unknown): val is UnknownFunc => {
  if (!val) return false;
  return Boolean({}.toString.call(val) === '[object Function]');
};

export const numOrUndef = (val?: string): number | undefined => (val ? parseInt(val, 10) : undefined);
