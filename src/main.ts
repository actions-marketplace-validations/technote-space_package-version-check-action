import { resolve } from 'path';
import { setFailed } from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { ContextHelper, Utils } from '@technote-space/github-action-helper';
import { Logger } from '@technote-space/github-action-log-helper';
import { TARGET_EVENTS } from './constant';
import { updatePackageVersion, commit } from './utils/package';

const run = async(): Promise<void> => {
  const logger  = new Logger();
  const context = new Context();
  ContextHelper.showActionInfo(resolve(__dirname, '..'), logger, context);

  if (!isTargetEvent(TARGET_EVENTS, context)) {
    logger.info('This is not target event.');
    return;
  }

  if (await updatePackageVersion(context, logger)) {
    await commit(Utils.getOctokit(), context, logger);
  }
};

run().catch(error => {
  console.log(error);
  setFailed(error.message);
});
