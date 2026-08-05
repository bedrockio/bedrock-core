const config = require('@bedrockio/config');
const { Agenda, exponential } = require('agenda');
const { MongoBackend } = require('@agendajs/mongo-backend');

const agenda = new Agenda({
  backend: new MongoBackend({
    address: config.get('MONGO_URI'),
    collection: 'jobs', // Collection name (default: 'agendaJobs')
  }),
  // processEvery: '30 seconds', // Job polling interval
  // maxConcurrency: 20, // Max concurrent jobs
  // defaultConcurrency: 5, // Default per job type
});

// Every job retries a failed run on this schedule unless it passes its own
// `backoff`: growing delays with jitter, then it gives up and stays failed
// (Agenda emits 'retry exhausted'). Roughly 2s, 4s, 8s, 16s, 32s.
const DEFAULT_BACKOFF = exponential({
  delay: 2000,
  factor: 2,
  maxRetries: 5,
  maxDelay: 60000,
  jitter: 0.3,
});

// Recurring jobs (those defined with a `schedule`), registered when the
// processor starts.
const scheduled = [];

async function startJobProcessor() {
  // Begin pulling and running queued jobs. Only the jobs pod calls this; the
  // api pods construct the same agenda to enqueue but never start processing.
  await agenda.start();

  // agenda.every upserts a single job per name, so this is safe on every start.
  for (let job of scheduled) {
    await agenda.every(job.schedule, job.name);
  }
}

function defineJob(options) {
  const { name, schedule, getParams = () => ({}), handler, backoff = DEFAULT_BACKOFF } = options;

  if (schedule) {
    scheduled.push({
      name,
      schedule,
    });
  }

  agenda.define(
    name,
    async (job) => {
      const { params } = job.attrs.data || {};
      try {
        const result = await handler(params, job);
        job.attrs.data.result = result;
      } catch (error) {
        job.attrs.data.error = error;
        throw error;
      } finally {
        await job.save();
      }
    },
    {
      backoff,
    },
  );

  async function queueJob(...args) {
    return await agenda.now(name, {
      params: getParams(...args),
    });
  }

  function createJob(...args) {
    return agenda.create(name, {
      params: getParams(...args),
    });
  }

  return {
    async run(...args) {
      const job = createJob(...args);
      // A one-off synchronous run — the handler executed once, plus a job
      // record for analytics and error capture. Keep it disabled the whole
      // time so the processor never picks it up, and clear any nextRunAt the
      // run leaves behind (backoff schedules a retry on failure) so nothing is
      // ever left queued.
      job.disable();
      await job.save();
      await job.run();
      job.attrs.nextRunAt = null;
      await job.save();
      if (job.attrs.failedAt) {
        throw job.attrs.data.error;
      }
      return job.attrs.data.result;
    },
    async queue(...args) {
      return await queueJob(...args);
    },
    async queueWithResponse(ctx, ...args) {
      const job = await queueJob(...args);
      ctx.status = 202;
      ctx.set('Location', `/1/jobs/${getJobId(job)}`);
    },
  };
}

function getJobId(job) {
  return job.attrs._id;
}

module.exports = {
  defineJob,
  startJobProcessor,
};
