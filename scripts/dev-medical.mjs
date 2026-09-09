import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', '3001'], {
  cwd: root,
  env: { ...process.env, SITE_MODE: 'medical' },
  stdio: 'inherit',
})

child.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
child.on('exit', (code) => { process.exitCode = code ?? 1 })
