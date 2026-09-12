import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(CONFIG_DIR, '..');

// Real environment variables win over .env, so CI secrets and inline
// `set VAR=value&& npm run ...` overrides keep working untouched.
dotenv.config({ path: path.join(ROOT_DIR, '.env'), quiet: true });

function readString(name, fallback) {
  const value = process.env[name];

  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

function readNumber(name, fallback) {
  const value = readString(name, undefined);

  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number, received "${value}"`);
  }

  return parsed;
}

function readBoolean(name, fallback) {
  const value = readString(name, undefined);

  if (value === undefined) {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (normalized === 'true' || normalized === 'false') {
    return normalized === 'true';
  }

  throw new Error(`Environment variable ${name} must be "true" or "false", received "${value}"`);
}

const env = {
  baseUrl: readString('BASE_URL', 'https://demoblaze.com/'),
  headless: readBoolean('HEADLESS', true),
  slowMoMs: readNumber('SLOW_MO_MS', 0),
  stepTimeoutMs: readNumber('CUCUMBER_STEP_TIMEOUT_MS', 30000),
  scenarioLogs: readBoolean('CUCUMBER_SCENARIO_LOGS', true),
  credentials: {
    username: readString('DEMOBLAZE_USERNAME', undefined),
    password: readString('DEMOBLAZE_PASSWORD', undefined),
  },
};

/**
 * Credentials for the pre-existing Demoblaze account defined in `.env`.
 * Scenarios that create their own account should keep using
 * `getGeneratedCredentials()` instead — this is for flows that need a
 * persistent account (e.g. an order history that survives between runs).
 */
function getEnvCredentials() {
  const { username, password } = env.credentials;

  if (!username || !password) {
    throw new Error(
      'DEMOBLAZE_USERNAME and DEMOBLAZE_PASSWORD must be set in .env to use the configured account. Copy .env.example to .env and fill them in.'
    );
  }

  return { username, password };
}

export { env, getEnvCredentials, ROOT_DIR };
