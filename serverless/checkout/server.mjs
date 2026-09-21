import { handler } from './handler.mjs'
import { startServer } from './runtime.mjs'

startServer({
  service: 'checkout',
  routes: { '/checkout': handler },
  port: 8789,
  envFile: new URL('./.env', import.meta.url),
})
