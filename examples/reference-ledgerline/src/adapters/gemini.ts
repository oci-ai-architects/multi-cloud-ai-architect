import { generateText, Output, type LanguageModel } from 'ai';
import { createGoogle } from '@ai-sdk/google';
import { ExtractionSchema } from '../core/schema.ts';
import { EXPLAIN_SYSTEM, EXTRACT_SYSTEM, wrapUntrusted } from '../core/prompt.ts';
import type { ExplainEvidence, ModelSeam } from '../core/types.ts';

// Default id comes from the example in the @ai-sdk/google package docs (version 4.0.88).
// Whether the id is available to a given API key is [UNVERIFIED].
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

export interface GeminiOptions {
  apiKey?: string;
  modelId?: string;
  /** Inject a model, for contract tests that must not touch the network. */
  model?: LanguageModel;
}

export function geminiSeam(opts: GeminiOptions): ModelSeam {
  const modelId = opts.modelId ?? DEFAULT_GEMINI_MODEL;
  const model = opts.model ?? createGoogle({ apiKey: opts.apiKey })(modelId);
  const common = { model, temperature: 0, maxRetries: 1, abortSignal: AbortSignal.timeout(30_000) } as const;
  return {
    id: `gemini:${modelId}`,
    async extractInvoice(text: string) {
      const { output } = await generateText({
        ...common,
        system: EXTRACT_SYSTEM,
        prompt: wrapUntrusted('untrusted_invoice', text),
        output: Output.object({ schema: ExtractionSchema }),
      });
      return output;
    },
    async explainFlag(e: ExplainEvidence) {
      const prompt = [
        `Flags: ${JSON.stringify(e.flags)}`,
        wrapUntrusted('untrusted_invoice', e.untrustedInvoiceText),
        ...(e.untrustedEmailBody ? [wrapUntrusted('untrusted_email', e.untrustedEmailBody)] : []),
      ].join('\n\n');
      const { text } = await generateText({ ...common, system: EXPLAIN_SYSTEM, prompt });
      return text;
    },
  };
}
