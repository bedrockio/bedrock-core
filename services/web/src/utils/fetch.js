// window.fetch does not support timeouts or have the best error
// handling so this utility is intended to smooth over those issues
// while dispatching events that can be listened to as well as set
// a threshold for connection errors to indicate network instability.

import { CustomError } from './error';

const TIMEOUT_DELAY = 20000;
const ERROR_THRESHOLD = 1;

let errorCount = 0;

export class NetworkError extends CustomError {
  constructor() {
    // this allows consumers to discriminate network errors
    // vs API errors and also normalizes the error message for
    // different browser vendors
    // TODO: make this message better
    super('Bad connection');
  }
}

export class TimeoutError extends CustomError {
  constructor() {
    // TODO: make this message better
    super('Timed out when talking to server');
  }
}

export async function fetchWithTimeout(url, options) {
  try {
    // Set up an abort controller to allow the network
    // connection to be closed when the request times out.
    const controller = new AbortController();
    const res = await Promise.race([
      fetchWithNetworkError(url, {
        ...options,
        signal: controller.signal,
      }),
      timeout(controller),
    ]);
    onConnectionSuccess();
    return res;
  } catch (error) {
    onConnectionFail(error);
    throw error;
  }
}

function onConnectionFail(error) {
  errorCount += 1;
  if (errorCount >= ERROR_THRESHOLD) {
    dispatchEvent('connectionunstable', error);
  }
}

function onConnectionSuccess() {
  errorCount = 0;
  dispatchEvent('connectionstable');
}

async function fetchWithNetworkError(url, options) {
  const promise = fetch(url, options);
  try {
    // Rejected promises from fetch *usually* represent a bad
    // connection, as opposed to synchronous errors thrown due
    // to malformed requests. This is not 100% guaranteed however
    // as bad CORS headers etc will still reject asynchoronously,
    // so this could potentially be better.
    return await promise;
  } catch (err) {
    throw new NetworkError();
  }
}

function timeout(controller) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new TimeoutError());
    }, TIMEOUT_DELAY);
  });
}

function dispatchEvent(name, detail) {
  const event = new CustomEvent(name, { detail });
  window.dispatchEvent(event);
}
