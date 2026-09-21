import { handler, summary } from './handler.mjs'
import { startServer } from './runtime.mjs'
startServer({service:'analytics',routes:{'/track':handler,'/summary':summary},port:8788,envFile:new URL('./.env',import.meta.url)})
