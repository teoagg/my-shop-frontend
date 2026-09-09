import { createServer } from 'node:http'
import { handler as recommendations } from './recommendations/handler.mjs'
import { handler as analytics } from './analytics/handler.mjs'
import { handler as checkout } from './checkout/handler.mjs'

const routes = new Map([
  ['GET /recommendations', recommendations],
  ['POST /track', analytics],
  ['POST /checkout', checkout],
  ['OPTIONS /recommendations', recommendations],
  ['OPTIONS /track', analytics],
  ['OPTIONS /checkout', checkout],
])

function readBody(request) {
  return new Promise((resolve) => {
    const chunks = []

    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

function send(response, lambdaResponse) {
  response.writeHead(lambdaResponse.statusCode, lambdaResponse.headers)
  response.end(lambdaResponse.body)
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1')
  const key = `${request.method} ${url.pathname}`
  const route = routes.get(key)

  if (!route) {
    send(response, {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Route not found.' }),
    })
    return
  }

  const lambdaResponse = await route({
    httpMethod: request.method,
    path: url.pathname,
    queryStringParameters: Object.fromEntries(url.searchParams),
    headers: request.headers,
    body: await readBody(request),
    requestContext: {
      http: {
        method: request.method,
        path: url.pathname,
      },
    },
  })

  send(response, lambdaResponse)
})

const port = Number(process.env.SERVERLESS_PORT || 8787)

server.listen(port, () => {
  console.log(`Composable serverless demo listening on http://127.0.0.1:${port}`)
  console.log('Routes:')
  console.log('  GET  /recommendations')
  console.log('  POST /track')
  console.log('  POST /checkout')
})
