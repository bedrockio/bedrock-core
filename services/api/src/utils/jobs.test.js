// Runs against the in-memory agenda mock (see __mocks__/agenda.js), so these
// exercise the wrapper logic in utils/jobs — not a real Mongo-backed queue.
const { defineJob } = require('./jobs');

describe('defineJob', () => {
  it('returns run/queue/queueWithResponse handles', () => {
    const job = defineJob({
      name: 'shape',
      getParams: () => {
        return {};
      },
      handler: async () => {},
    });
    expect(typeof job.run).toBe('function');
    expect(typeof job.queue).toBe('function');
    expect(typeof job.queueWithResponse).toBe('function');
  });
});

describe('run', () => {
  it('runs the handler once and returns its result', async () => {
    let calls = 0;
    const job = defineJob({
      name: 'run-success',
      getParams: (value) => {
        return {
          value,
        };
      },
      handler: async (params) => {
        calls += 1;
        return {
          doubled: params.value * 2,
        };
      },
    });

    const result = await job.run(21);

    expect(result).toEqual({
      doubled: 42,
    });
    expect(calls).toBe(1);
  });

  it('throws the handler error and leaves nothing scheduled', async () => {
    // The handler receives the job as its second arg, so we can inspect its
    // final state after the run.
    let ran;
    const job = defineJob({
      name: 'run-failure',
      getParams: () => {
        return {};
      },
      handler: async (params, jobInstance) => {
        ran = jobInstance;
        throw new Error('boom');
      },
    });

    await expect(job.run()).rejects.toThrow('boom');

    // Marked failed, but with no pending run — a one-off must never leave a
    // retry for the processor to pick up.
    expect(ran.attrs.failedAt).toBeTruthy();
    expect(ran.attrs.nextRunAt).toBeNull();
    expect(ran.attrs.disabled).toBe(true);
  });
});

describe('queue', () => {
  it('enqueues a job with the mapped params and a run time', async () => {
    const job = defineJob({
      name: 'queue-job',
      getParams: (id) => {
        return {
          id,
        };
      },
      handler: async () => {},
    });

    const queued = await job.queue('abc');

    expect(queued.attrs.data.params).toEqual({
      id: 'abc',
    });
    expect(queued.attrs.nextRunAt).toBeTruthy();
    expect(queued.attrs.disabled).toBeFalsy();
  });
});

describe('queueWithResponse', () => {
  it('responds 202 with a Location header pointing at the job', async () => {
    const job = defineJob({
      name: 'queue-response',
      getParams: () => {
        return {};
      },
      handler: async () => {},
    });

    const headers = {};
    const ctx = {
      set(key, value) {
        headers[key] = value;
      },
    };

    await job.queueWithResponse(ctx);

    expect(ctx.status).toBe(202);
    expect(headers.Location).toMatch(/^\/1\/jobs\/[a-f0-9]{24}$/);
  });
});
