/* eslint-disable */

import { expect } from 'chai';
import { createRunner, createTask } from '../src/index.js';

describe('Rugo Manage test', () => {
  it('should create runner', async () => {
    const tasks = ['taskA', 'taskB', 'taskC'];

    const runner = createRunner(tasks.map(name => createTask({
      name,
      starting: async context => context[name] = 1
    })));

    const startStats = await runner.start();
    const closeStats = await runner.close();

    for (let key in startStats){
      expect(startStats[key].starting).to.has.property('status', 'success');
      expect(startStats[key].started).to.has.property('status', 'skip');
      expect(closeStats[key].closing).to.has.property('status', 'skip');
      expect(closeStats[key].closed).to.has.property('status', 'skip');
    }
  });

  it('should throw error', async () => {
    const runner = createRunner([
      createTask({ starting(){ throw new Error('something wrong'); } })
    ]);

    const startStats = await runner.start();
    const name = Object.keys(startStats)[0];
    expect(startStats[name].starting).to.has.property('status', 'error');
  });

  it('should log', async () => {
    const runner = createRunner([
      createTask({ starting(){ this.log('OK') } })
    ]);

    const startStats = await runner.start();
    const name = Object.keys(startStats)[0];
    expect(startStats[name].starting).to.has.property('status', 'success');
  });
});