/* eslint-disable max-len */
import { program } from 'commander';
import { getApi, getConfig, isTelegraphAccountField, parseMarkdownFile, setConfig, TelegraphAccountField } from 'lib';
import { errToStr, isStr, log, LogLevel, numOrUndef } from 'utils';

const getToken = (opt: Record<string, string | boolean>): string | undefined => {
  if (isStr(opt.token)) return opt.token;
  const storedToken = getConfig()?.token;
  if (storedToken) return storedToken;
  return undefined;
};

const strToAccountFields = (val: string): TelegraphAccountField[] => {
  const res: TelegraphAccountField[] = [];
  for (const item of val.split(',')) {
    if (!isTelegraphAccountField(item)) {
      throw new Error(`"${item}" is not acocunt field`);
    }
    res.push(item);
  }
  return res;
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
  .command('getAccountInfo')
  .description(`Use this method to get information about a Telegraph account. Returns an Account object on success.`)
  .option(
    '-f, --fields <fields>',
    `List of account fields to return. Available fields: short_name, author_name, author_url, auth_url, page_count.`,
  )
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .action(async (opt: { fields?: string; token?: string }) => {
    const { fields } = opt;
    try {
      const api = getApi({ token: getToken(opt) });
      const resp = await api.getAccountInfo({ fields: fields ? strToAccountFields(fields) : undefined });
      log.json(resp);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program
  .command('revokeAccessToken')
  .description(
    `Use this method to revoke access_token and generate a new one, for example, if the user would like to reset all connected sessions, or you have reasons to believe the token was compromised. On success, returns an Account object with new access_token and auth_url fields.`,
  )
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .action(async (opt: { token?: string }) => {
    try {
      const api = getApi({ token: getToken(opt) });
      const resp = await api.revokeAccessToken();
      log.json(resp);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program
  .command('createPage')
  .description('Use this method to create a new Telegraph page. On success, returns a Page object.')
  .option('--content <content>', 'Required. Path to a markdown file with content')
  .option('--title <title>', 'Required. Page title.')
  .option('--author_name <author_name>', `Author name, displayed below the article's title.`)
  .option(
    '--author_url <author_url>',
    `Profile link, opened when users click on the author's name below the title. Can be any link, not necessarily to a Telegram profile or channel.`,
  )
  .option('--return_content', `If true, a content field will be returned in the Page object`)
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .action(
    async (opt: {
      token?: string;
      title?: string;
      content?: string;
      author_name?: string;
      author_url?: string;
      return_content?: boolean;
    }) => {
      initProgram();
      const { title, author_name, author_url, return_content, content: contentFilePath } = opt;
      if (!title) {
        return log.errAndExit('title required');
      }
      if (!contentFilePath) {
        return log.errAndExit('content file path required');
      }
      try {
        const api = getApi({ token: getToken(opt) });
        const content = parseMarkdownFile(contentFilePath);
        const resp = await api.createPage({ title, content, author_name, author_url, return_content });
        log.json(resp);
      } catch (err: unknown) {
        log.errAndExit(errToStr(err));
      }
    },
  );

program
  .command('editPage')
  .description('Use this method to edit an existing Telegraph page. On success, returns a Page object.')
  .option('-p, --path <path>', 'Required. Path to the page.')
  .option('--content <content>', 'Required. Path to a markdown file with content')
  .option('--title <title>', 'Required. Page title.')
  .option('--author_name <author_name>', `Author name, displayed below the article's title.`)
  .option(
    '--author_url <author_url>',
    `Profile link, opened when users click on the author's name below the title. Can be any link, not necessarily to a Telegram profile or channel.`,
  )
  .option('--return_content', `If true, a content field will be returned in the Page object`)
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .action(
    async (opt: {
      path?: string;
      token?: string;
      content?: string;
      title?: string;
      author_name?: string;
      author_url?: string;
      return_content?: boolean;
    }) => {
      initProgram();
      const { path, title, author_name, author_url, return_content, content: contentFilePath } = opt;
      if (!title) {
        return log.errAndExit('title required');
      }
      if (!path) {
        return log.errAndExit('path required');
      }
      if (!contentFilePath) {
        return log.errAndExit('content file path required');
      }
      try {
        const api = getApi({ token: getToken(opt) });
        const content = parseMarkdownFile(contentFilePath);
        const resp = await api.editPage(path, { title, content, author_name, author_url, return_content });
        log.json(resp);
      } catch (err: unknown) {
        log.errAndExit(errToStr(err));
      }
    },
  );

program
  .command('getPage')
  .description('Use this method to get a Telegraph page. Returns a Page object on success.')
  .option(
    '-p, --path <path>',
    `Path to the Telegraph page (in the format Title-12-31, i.e. everything that comes after http://telegra.ph/)`,
  )
  .option('--return_content', 'if true, content field will be returned in Page object')
  .action(async (opt: { path?: string; return_content?: boolean }) => {
    initProgram();
    const { return_content, path } = opt;
    if (!path) {
      return log.errAndExit('path required');
    }
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
    `Use this method to get a list of pages belonging to a Telegraph account. Returns a PageList object, sorted by most recently created pages first.`,
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

program
  .command('getViews')
  .description(
    `Use this method to get the number of views for a Telegraph article. Returns a PageViews object on success. By default, the total number of page views will be returned.`,
  )
  .option(
    '-p, --path <path>',
    `Required. Path to the Telegraph page (in the format Title-12-31, where 12 is the month and 31 the day the article was first published).`,
  )
  .option(
    '-y, --year <year>',
    `Required if month is passed. If passed, the number of page views for the requested year will be returned.`,
  )
  .option(
    '-m, --month <month>',
    `Required if day is passed. If passed, the number of page views for the requested month will be returned.`,
  )
  .option(
    '-d, --day <day>',
    `Required if hour is passed. If passed, the number of page views for the requested day will be returned.`,
  )
  .option('-h, --hour <hour>', `If passed, the number of page views for the requested hour will be returned.`)
  .action(async (opt: { path?: string; year?: string; month?: string; day?: string; hour?: string }) => {
    initProgram();
    const { path, year, month, day, hour } = opt;
    if (!path) {
      return log.errAndExit('path required');
    }
    try {
      const api = getApi();
      const resp = await api.getViews(path, { year, month, day, hour });
      log.json(resp);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program.parse(process.argv);
