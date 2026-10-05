import { createApp } from '../../src/core/app.ts';
import { guardFromEnv, seamFromEnv, type SeamEnv } from '../../src/adapters/index.ts';

interface Env extends SeamEnv {
  LEDGERLINE_SHARED_SECRET?: string;
  LEDGERLINE_SEED_REGRESSION?: string;
}

// Per-isolate state. Records live in memory and are lost when the isolate is evicted.
// Durable storage (D1 or a Durable Object) is not built in this reference.
let app: ReturnType<typeof createApp> | undefined;
let scheduler: (p: Promise<unknown>) => void = () => {};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    scheduler = (p) => ctx.waitUntil(p);
    app ??= createApp({
      seam: seamFromEnv(env),
      secret: env.LEDGERLINE_SHARED_SECRET,
      schedule: (p) => scheduler(p),
      testMode: env.LEDGERLINE_TEST === '1',
      guard: guardFromEnv(env),
    });
    return app.fetch(request);
  },
} satisfies ExportedHandler<Env>;
