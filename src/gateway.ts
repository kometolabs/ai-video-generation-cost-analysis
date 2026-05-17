import { createGateway } from 'ai'
import { Agent, fetch as undiciFetch } from 'undici'

// Video generation jobs can hold the connection open for several minutes.
// Node's default Undici headersTimeout/bodyTimeout (5 minutes) closes long
// requests before the gateway returns. Bump both to 15 minutes.
const dispatcher = new Agent({
  headersTimeout: 15 * 60 * 1000,
  bodyTimeout: 15 * 60 * 1000,
})

export const gateway = createGateway({
  // biome-ignore lint/suspicious/noExplicitAny: undici fetch types diverge from globalThis.fetch (preconnect static, etc.)
  fetch: ((input: any, init: any) => undiciFetch(input, { ...init, dispatcher })) as unknown as typeof fetch,
})
