// Manual mock for the ESM `agenda` package. Jest can't parse Agenda's ESM build,
// and it's pulled into the app graph via src/jobs, so without this mock every
// test that loads the app fails to run. This is a small in-memory fake: enough
// for the app to load and for utils/jobs.test.js to exercise the job wrappers
// (define / create / now / run with backoff) deterministically.
const crypto = require('crypto');

function objectId() {
  return crypto.randomBytes(12).toString('hex');
}

class FakeJob {
  constructor(agenda, name, data) {
    this.agenda = agenda;
    this.attrs = {
      _id: objectId(),
      name,
      data: data || {},
    };
  }

  disable() {
    this.attrs.disabled = true;
    return this;
  }

  enable() {
    this.attrs.disabled = false;
    return this;
  }

  async save() {
    return this;
  }

  async run() {
    const definition = this.agenda.definitions[this.attrs.name];
    this.attrs.lastRunAt = new Date();
    try {
      await definition.processor(this);
      this.attrs.lastFinishedAt = new Date();
    } catch (error) {
      // Mirror Agenda: record the failure, then let the backoff strategy
      // schedule a retry by setting nextRunAt. Agenda's own run() swallows the
      // error (it surfaces via failedAt), so we don't rethrow here.
      this.attrs.failReason = error.message;
      this.attrs.failCount = (this.attrs.failCount || 0) + 1;
      this.attrs.failedAt = new Date();
      this.attrs.lastFinishedAt = new Date();
      const backoff = definition.options && definition.options.backoff;
      if (backoff) {
        const delay = backoff({
          attempt: this.attrs.failCount,
          error,
          jobName: this.attrs.name,
          jobData: this.attrs.data,
        });
        if (delay !== null) {
          this.attrs.nextRunAt = new Date(Date.now() + delay);
        }
      }
    }
  }
}

class Agenda {
  constructor(options) {
    this.options = options || {};
    this.backend = (options && options.backend) || {
      async disconnect() {},
    };
    this.definitions = {};
  }

  define(name, processor, options) {
    this.definitions[name] = {
      processor,
      options: options || {},
    };
  }

  create(name, data) {
    return new FakeJob(this, name, data);
  }

  async now(name, data) {
    const job = this.create(name, data);
    job.attrs.nextRunAt = new Date();
    return job;
  }

  async every() {}

  async start() {}

  async stop() {}
}

function exponential(options = {}) {
  const { delay = 1000, factor = 2, maxRetries = 3 } = options;
  return (context) => {
    if (context.attempt > maxRetries) {
      return null;
    }
    return delay * factor ** (context.attempt - 1);
  };
}

module.exports = {
  Agenda,
  exponential,
};
