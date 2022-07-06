import colors from 'colors';
import { mergeDeepWith, concat } from 'ramda';
import { generateId } from '@rugo-vn/common';

const log = (messages, cols) => {
  let content = '';

  for (let i = 0; i < messages.length; i++) { content += colors[cols[i]](messages[i]); }

  console.log(content);
};

const manage = {
  log (message) {
    console.log(colors.yellow('[manage] ') + message);
  }
};

export const createTask = config => {
  return {
    name: generateId(),

    ...config
  };
};

const runPhrase = async (phraseName, tasks, context) => {
  const result = {};

  for (const task of tasks) {
    result[task.name] = {};
    result[task.name][phraseName] = {
      status: 'skip',
      duration: 0
    };

    if (!task[phraseName]) { continue; }

    const startTime = Date.now();
    let error = null;

    try {
      await task[phraseName].bind(manage)(context);
    } catch (err) {
      error = err;
    }

    const duration = Date.now() - startTime;

    log(
      ['[manage] ', 'Task ', task.name, ' is ', error ? 'not ' : '', phraseName, ` +${duration}ms`],
      ['yellow', 'white', 'cyan', 'white', 'red', 'cyan', 'green']
    );

    result[task.name][phraseName] = {
      status: error ? 'error' : 'success',
      duration
    };

    if (error) { console.log(error.stack); }
  }

  return result;
};

const startRunner = async (tasks, context) => {
  manage.log('Start runner');

  const startingResult = await runPhrase('starting', tasks, context);
  const startedResult = await runPhrase('started', tasks, context);

  return mergeDeepWith(concat, startingResult, startedResult);
};

const closeRunner = async (tasks, context) => {
  manage.log('Close runner');

  const closingResult = await runPhrase('closing', tasks, context);
  const closedResult = await runPhrase('closed', tasks, context);

  return mergeDeepWith(concat, closingResult, closedResult);
};

const summary = async fn => {
  const result = await fn;

  const sum = {};
  for (const taskName in result) {
    const task = result[taskName];
    for (const phraseName in task) {
      sum[phraseName] = sum[phraseName] || { success: [], error: [], skip: [] };
      sum[phraseName][task[phraseName].status].push(taskName);
    }
  }

  for (const phraseName in sum) {
    if (!(sum[phraseName].success.length || sum[phraseName].error.length || sum[phraseName].skip.length)) { continue; }

    manage.log('Summary ' + colors.cyan(phraseName));

    if (sum[phraseName].success.length) { manage.log('  ' + colors.green('success') + ': ' + sum[phraseName].success.join(', ')); }

    if (sum[phraseName].error.length) { manage.log('  ' + colors.red('error') + ': ' + sum[phraseName].error.join(', ')); }

    if (sum[phraseName].skip.length) { manage.log('  ' + colors.blue('skip') + ': ' + sum[phraseName].skip.join(', ')); }
  }

  return result;
};

export const createRunner = tasks => {
  const context = {};

  return {
    context,

    start: () => summary(startRunner(tasks, context)),
    close: () => summary(closeRunner(tasks, context))
  };
};
