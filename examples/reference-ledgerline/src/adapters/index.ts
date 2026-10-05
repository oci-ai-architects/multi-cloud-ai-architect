import { geminiSeam } from './gemini.ts';
import { stubSeam } from './stub.ts';
import type { ModelSeam } from '../core/types.ts';

export interface SeamEnv {
  MODEL_PROVIDER?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  GEMINI_MODEL?: string;
  LEDGERLINE_TEST?: string;
}

/** The only place that chooses a provider. The stub is selectable only in test mode. */
export function seamFromEnv(env: SeamEnv): ModelSeam {
  if (env.MODEL_PROVIDER === 'stub' && env.LEDGERLINE_TEST === '1') return stubSeam();
  return geminiSeam({
    ...(env.GOOGLE_GENERATIVE_AI_API_KEY ? { apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY } : {}),
    ...(env.GEMINI_MODEL ? { modelId: env.GEMINI_MODEL } : {}),
  });
}

export function guardFromEnv(env: { LEDGERLINE_TEST?: string; LEDGERLINE_SEED_REGRESSION?: string }) {
  if (env.LEDGERLINE_TEST === '1' && env.LEDGERLINE_SEED_REGRESSION === 'iban-guard') {
    return { requireIbanMatch: false, requireMatched: true, requireNotDuplicate: true };
  }
  return undefined;
}
