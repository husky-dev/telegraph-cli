/* eslint-disable no-console */
export enum LogLevel {
  none = -1,
  err = 0,
  warn = 1,
  info = 2,
  debug = 3,
  trace = 4,
}

let level: LogLevel = LogLevel.info;

export const log = {
  err: (...args: unknown[]) => (level >= LogLevel.err ? console.log(`[x]:`, ...args) : undefined),
  warn: (...args: unknown[]) => (level >= LogLevel.warn ? console.log(`[!]:`, ...args) : undefined),
  info: (...args: unknown[]) => (level >= LogLevel.info ? console.log(`[+]:`, ...args) : undefined),
  debug: (...args: unknown[]) => (level >= LogLevel.debug ? console.log(`[-]:`, ...args) : undefined),
  trace: (...args: unknown[]) => (level >= LogLevel.trace ? console.log(`[*]:`, ...args) : undefined),
  errAndExit: (...args: unknown[]) => {
    console.log(`[x]:`, ...args);
    process.exit(1);
  },
  simple: (...args: unknown[]) => console.log(...args),
  json: (data: unknown) => console.log(JSON.stringify(data)),
  simpleAndExit: (...args: unknown[]) => {
    console.log(...args);
    process.exit(0);
  },
  setLevel: (val: LogLevel) => (level = val),
};
