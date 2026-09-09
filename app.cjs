const http = require('node:http')
const next = require('next')

const app = next({ dev: false, dir: __dirname })
const handle = app.getRequestHandler()
app.prepare().then(() => {
  http.createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000)
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
