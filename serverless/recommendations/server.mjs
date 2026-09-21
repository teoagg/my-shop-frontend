import { handler } from './handler.mjs'
import { startServer } from './runtime.mjs'

startServer({
  service: 'recommendations',
  routes: { '/recommendations': handler },
  port: 8787,
  envFile: new URL('./.env', import.meta.url),
})
