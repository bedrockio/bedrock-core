import request from './request';

const DEFAULT_INTERVAL = 1000;

// A parallel to `request` for endpoints that queue a background job: it fires
// the request, and if the server responds 202 with a Location header it polls
// that job until it finishes, then returns the result as if it were a single
// API call. Pass `skipResources: true` to return the job's own result instead
// of fetching the `{ resource }` it points at.
export async function requestWithPolling(options) {
  const {
    interval = DEFAULT_INTERVAL,
    skipResources = false,
    ...rest
  } = options;

  const response = await request(rest);

  if (response.status === 202) {
    const location = response.headers.get('location');

    if (!location) {
      throw new Error('Could not derive location for 202 response.');
    }

    while (true) {
      await sleep(interval);
      const { data: job } = await request({
        path: location,
        method: 'GET',
      });

      if (job.failedAt) {
        throw new Error(job.failReason || 'Job errored');
      } else if (job.data?.result?.resource && !skipResources) {
        const path = job.data.result.resource;
        return await request({
          path,
          method: 'GET',
        });
      } else if (job.data?.result) {
        return {
          data: job.data.result,
        };
      }
    }
  } else {
    return response;
  }
}

async function sleep(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
