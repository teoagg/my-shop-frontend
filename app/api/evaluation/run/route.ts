import { mkdir, readFile, writeFile, rename, rmdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { isEvaluationAdmin } from '@/lib/evaluation-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const root = resolve(process.cwd(), 'evaluation/reports')
const lock = resolve(root, 'web-run.lock')
const stateFile = resolve(root, 'web-run.json')
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
type State = { id: string; status: string; startedAt: string; finishedAt?: string; message?: string }
async function state(): Promise<State | null> {
  try { return JSON.parse(await readFile(stateFile, 'utf8')) } catch { return null }
}
async function save(value: State) {
  await writeFile(stateFile + '.tmp', JSON.stringify(value))
  await rename(stateFile + '.tmp', stateFile)
}
export async function GET(request: Request) {
  if (!await isEvaluationAdmin(request)) return reply({ error: 'Forbidden' }, 403)
  const current = await state()
  let completed = 0
  if (current) {
    try {
      const raw = JSON.parse(await readFile(resolve(root, `comparison-web-${current.id}/raw.json`), 'utf8'))
      completed = raw.observations.length
    } catch { /* Worker has not written its first observation yet. */ }
  }
  return reply({ run: current, completed, total: 88 })
}
export async function POST(request: Request) {
  if (!await isEvaluationAdmin(request)) return reply({ error: 'Forbidden' }, 403)
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin) return reply({ error: 'Invalid origin' }, 403)
  await mkdir(root, { recursive: true })
  try { await mkdir(lock) } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return reply({ error: 'Υπάρχει ήδη μέτρηση σε εξέλιξη.' }, 409)
    throw error
  }
  try {
    const previous = await state()
    if (previous && Date.now() - Date.parse(previous.startedAt) < 300000) {
      await rmdir(lock)
      return reply({ error: 'Περίμενε 5 λεπτά από την προηγούμενη εκκίνηση.' }, 429)
    }
    const run: State = { id: randomUUID(), status: 'running', startedAt: new Date().toISOString() }
    await save(run)
    const child = spawn(process.env.EVALUATION_PYTHON || 'python3', [resolve('evaluation/web-worker.py'), run.id], {
      cwd: process.cwd(), detached: true, stdio: 'ignore',
    })
    await new Promise<void>((accept, reject) => { child.once('spawn', accept); child.once('error', reject) })
    child.unref()
    return reply({ run }, 202)
  } catch {
    const current = await state()
    if (current) await save({ ...current, status: 'failed', finishedAt: new Date().toISOString(), message: 'Δεν ήταν δυνατή η εκκίνηση. Επικοινώνησε με τον διαχειριστή.' })
    await rmdir(lock).catch(() => {})
    return reply({ error: 'Δεν ήταν δυνατή η εκκίνηση της μέτρησης.' }, 500)
  }
}
