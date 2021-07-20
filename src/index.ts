/* eslint-disable max-len */
import { program } from 'commander';
import { getApi, getConfig, parseMarkdownFile, setConfig } from 'lib';
import { errToStr, isStr, log, LogLevel, numOrUndef } from 'utils';

const getToken = (opt: Record<string, string | boolean>): string | undefined => {
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

const initProgram = () => {
  const opts = program.opts();
  if (opts.debug) {
    log.setLevel(LogLevel.verbose);
  } else {
    log.setLevel(LogLevel.err);
  }
};

program
  .command('setAccessToken')
  .argument('<token>', 'telega.ph access token')
  .description('Set default access token')
  .action((token: string) => {
    setConfig({ token });
  });

program
  .command('createAccount')
  .description(
    `Use this method to create a new Telegraph account. Most users only need one account, but this can be useful for channel administrators who would like to keep individual author names and profile links for each of their channels. On success, returns an Account object with the regular fields and an additional access_token field.`,
  )
  .option(
    '--short_name <short_name>',
    `Required, Account name, helps users with several accounts remember which they are currently using. Displayed to the user above the "Edit/Publish" button on Telegra.ph, other users don't see this name.`,
  )
  .option('--author_name <author_name>', 'Default author name used when creating new articles.')
  .option(
    '--author_url <author_url>',
    `Default profile link, opened when users click on the author's name below the title. Can be any link, not necessarily to a Telegram profile or channel.`,
  )
  .action(async (opt: { short_name?: string; author_name?: string; author_url?: string }) => {
    const { short_name, author_name, author_url } = opt;
    if (!short_name) return log.errAndExit('short_name required');
    try {
      const api = getApi();
      const resp = await api.createAccount({ short_name, author_name, author_url });
      log.json(resp);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program
  .command('editAccountInfo')
  .description(
    `Use this method to update information about a Telegraph account. Pass only the parameters that you want to edit. On success, returns an Account object with the default fields.`,
  )
  .option('--short_name <short_name>', `New account name.`)
  .option('--author_name <author_name>', 'New default author name used when creating new articles.')
  .option(
    '--author_url <author_url>',
    `New default profile link, opened when users click on the author's name below the title. Can be any link, not necessarily to a Telegram profile or channel.`,
  )
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .action(async (opt: { short_name?: string; author_name?: string; author_url?: string; token?: string }) => {
    const { short_name, author_name, author_url } = opt;
    try {
      const api = getApi({ token: getToken(opt) });
      const resp = await api.editAccountInfo({ short_name, author_name, author_url });
      log.json(resp);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program
  .command('createPage')
  .description('create a new page')
  .argument('<file>', 'path to a markdown file with content')
  .option('--title <title>', 'page title (required)')
  .option('--author_name <author_name>', `author name, displayed below the article's title`)
  .option(
    '--author_url <author_url>',
    `profile link, opened when users click on the author's name below the title. Can be any link, not necessarily to a Telegram profile or channel`,
  )
  .option('--return_content', 'if true, content field will be returned in Page object')
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .action(
    async (
      fileName: string,
      opt: { token?: string; title?: string; author_name?: string; author_url?: string; return_content?: boolean },
    ) => {
      initProgram();
      const { title, author_name, author_url, return_content } = opt;
      if (!title) {
        return log.errAndExit('title required');
      }
      try {
        const api = getApi({ token: getToken(opt) });
        const content = parseMarkdownFile(fileName);
        const resp = await api.createPage({ title, content, author_name, author_url, return_content });
        log.json(resp);
      } catch (err: unknown) {
        log.errAndExit(errToStr(err));
      }
    },
  );

program
  .command('getPage')
  .description('get a page, returns a Page object on success')
  .argument(
    '<path>',
    'path to the Telegraph page (in the format Title-12-31, i.e. everything that comes after http://telegra.ph/)',
  )
  .option('--return_content', 'if true, content field will be returned in Page object')
  .action(async (path: string, opt: { return_content?: boolean }) => {
    initProgram();
    const { return_content } = opt;
    try {
      const api = getApi();
      const resp = await api.getPage(path, { return_content });
      log.json(resp);
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
    initProgram();
    const { offset, limit } = opt;
    try {
      const api = getApi({ token: getToken(opt) });
      const resp = await api.getPageList({ offset: numOrUndef(offset), limit: numOrUndef(limit) });
      log.json(resp);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program.parse(process.argv);
