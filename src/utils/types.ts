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

export const isStrOrUndef = (val: unknown): val is string | undefined => isStr(val) || isUndef(val);

type UnknownFunc = (...args: unknown[]) => unknown;

export const isFunc = (val: unknown): val is UnknownFunc => {
  if (!val) return false;
  return Boolean({}.toString.call(val) === '[object Function]');
};

export const numOrUndef = (val?: string): number | undefined => (val ? parseInt(val, 10) : undefined);

export const select = <K extends string | number, T extends unknown>(key: K, data: Record<K, T>) => data[key];
