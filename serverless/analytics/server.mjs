import { handler } from './handler.mjs'
import { startServer } from './runtime.mjs'

startServer({
  service: 'analytics',
  routes: { '/track': handler },
  port: 8788,
  envFile: new URL('./.env', import.meta.url),
})
