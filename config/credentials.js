import { env, getEnvCredentials } from './env.js';

/**
 * Credentials for the persistent Demoblaze account, read from `.env`
 * (DEMOBLAZE_USERNAME / DEMOBLAZE_PASSWORD) so nothing secret lives in git.
 *
 * `credentials` may hold undefined values when .env is not configured;
 * prefer `getEnvCredentials()`, which fails with a clear message instead.
 */
const credentials = env.credentials;

export { credentials, getEnvCredentials };
