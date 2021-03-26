/* global dataLayer */

// Out of the box tracking with GTM.
// For more see README.md

import { pick } from 'lodash';

const ENABLED = typeof dataLayer !== 'undefined';

// Request body params will be stripped out unless
// explicitly added here.
const PARAM_WHITELIST = [];

export function trackRequest(request, response) {
  if (ENABLED) {
    request = sanitizeRequest(request);
    response = sanitizeResponse(response);
    dataLayer.push({
      event: 'request',
      request,
      response,
    });
  }
}

export function trackSession(action, key, data) {
  if (ENABLED) {
    dataLayer.push({
      event: 'session',
      key,
      action,
      data: sanitize(data),
    });
  }
}

export function setUserId(userId) {
  if (ENABLED) {
    dataLayer.push({
      userId,
    });
  }
}

// Strip out potentially sensitive data by whitelist. In theory
// this data still doesn't leave the browser context even if
// passed to the data layer unless a trigger is specifically
// set up to track it, but adding an extra layer of protection
// here.
function sanitizeRequest(request) {
  return {
    ...request,
    body: sanitize(request.body),
  };
}

function sanitizeResponse(response) {
  return {
    ...response,
    data: sanitize(response.data),
  };
}

function sanitize(obj) {
  return pick(obj.body, PARAM_WHITELIST);
}
