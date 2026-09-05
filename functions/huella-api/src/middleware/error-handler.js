import { toClientError } from '../shared/errors.js';

export function handleError(err, log) {
  return toClientError(err, log);
}
