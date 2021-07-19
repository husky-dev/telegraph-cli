import { readFileSync, writeFileSync, existsSync, mkdirSync, fstat } from 'fs';
import { resolve } from 'path';
import { errToStr, isStrOrUndef, isUnknownDict, log } from 'utils';

interface Config {
  token?: string;
}

export const isConfig = (val: unknown): val is Config => !!val && isUnknownDict(val) && isStrOrUndef(val.token);

export const getConfig = (): Config | undefined => {
  checkConfigFolder();
  const configFile = getConfigFilePath();
  if (!existsSync(configFile)) return undefined;
  try {
    const str = readFileSync(configFile, 'utf-8');
    if (!str) return undefined;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const data = JSON.parse(str) as unknown;
    if (!isConfig(data)) return undefined;
    return data;
  } catch (err: unknown) {
    log.err('parsing config file err:', errToStr(err));
    return undefined;
  }
};

export const setConfig = (config: Partial<Config>) => {
  checkConfigFolder();
  const curConfig = getConfig();
  const configFilePath = getConfigFilePath();
  const newConfig: Config = curConfig ? { ...curConfig, ...config } : { ...config };
  writeFileSync(configFilePath, JSON.stringify(newConfig), 'utf-8');
};

const checkConfigFolder = () => {
  const folderPath = getConfigFolderPath();
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath);
  }
};

const getConfigFilePath = () => resolve(getConfigFolderPath(), 'config.json');

const getConfigFolderPath = () => resolve(getUserDataFolderPath(), 'telegraph');

const getUserDataFolderPath = () =>
  process.env.APPDATA ||
  (process.platform == 'darwin' ? `${process.env.HOME || ''}/Library/Preferences` : `${process.env.HOME || ''}/.local/share`);
