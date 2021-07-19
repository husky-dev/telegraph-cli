import { program } from 'commander';
import { getApi, getConfig, parseMarkdownFile, setConfig } from 'lib';
import { errToStr, isStr, log, numOrUndef } from 'utils';

const getToken = (opt: Record<string, string>): string | undefined => {
  if (isStr(opt.token)) return opt.token;
  const storedToken = getConfig()?.token;
  if (storedToken) return storedToken;
  return undefined;
};

program
  .name('telegraph')
  .description(DESCRIPTION)
  .version(VERSION, '-v, --version', 'output the current version')
  .option('--debug', 'output extra debugging');

program
  .command('setAccessToken')
  .argument('<token>', 'telega.ph access token')
  .description('set default access token')
  .action((token: string) => {
    setConfig({ token });
  });

program
  .command('createPage')
  .description('create a new page')
  .argument('<file>', 'path to a markdown file with content')
  .action((fileName: string) => {
    try {
      const content = parseMarkdownFile(fileName);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program
  .command('getPage')
  .description('get a page, returns a Page object on success')
  .argument(
    '<path>',
    'path to the Telegraph page (in the format Title-12-31, i.e. everything that comes after http://telegra.ph/)',
  )
  .option('-c, --content', 'if true, content field will be returned in Page object')
  .action(async (path: string, opt: { content?: boolean }) => {
    try {
      const api = getApi();
      const data = await api.getPage(path, { return_content: opt.content });
      log.json(data);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program
  .command('getPageList')
  .description(
    'get a list of pages belonging to a account. Returns a PageList object, sorted by most recently created pages first',
  )
  .option('-t, --token <token>', 'access token of the Telegraph account')
  .option('-o, --offset <offset>', 'sequential number of the first page to be returned', '0')
  .option('-l, --limit <limit>', 'limits the number of pages to be retrieved', '50')
  .action(async (opt: { token?: string; offset?: string; limit?: string }) => {
    const { offset, limit } = opt;
    try {
      const api = getApi({ token: getToken(opt) });
      const data = await api.getPageList({ offset: numOrUndef(offset), limit: numOrUndef(limit) });
      log.json(data);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program.parse(process.argv);
