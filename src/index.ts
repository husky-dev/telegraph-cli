import { program } from 'commander';
import { getApi } from 'lib';
import { errToStr, log, numOrUndef } from 'utils';

program
  .name('telegraph')
  .description(DESCRIPTION)
  .version(VERSION, '-v, --version', 'output the current version')
  .option('--debug', 'output extra debugging');

program
  .command('getPageList')
  .option('-t, --token <token>', 'Access token of the Telegraph account')
  .option('-o, --offset <offset>', 'Sequential number of the first page to be returned', '0')
  .option('-l, --limit <limit>', 'Limits the number of pages to be retrieved', '50')
  .action(async (opt: { token?: string; offset?: string; limit?: string }) => {
    const { token, offset, limit } = opt;
    const api = getApi({ token: token || '' });
    try {
      const data = await api.getPageList({ offset: numOrUndef(offset), limit: numOrUndef(limit) });
      log.json(data);
    } catch (err: unknown) {
      log.errAndExit(errToStr(err));
    }
  });

program.parse(process.argv);
