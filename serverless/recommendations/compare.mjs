const [baseline, candidate, documentId, rawIterations = '10'] = process.argv.slice(2)
const iterations = Number(rawIterations)
if (!baseline || !candidate || !documentId || !Number.isInteger(iterations) || iterations < 1 || iterations > 100) {
  console.error('Usage: node compare.mjs <baseline-url> <candidate-url> <documentId> [iterations:1-100]')
  process.exit(1)
}
async function sample(base) {
  const url = new URL(base)
  url.searchParams.set('documentId', documentId)
  url.searchParams.set('limit', '4')
  const started = performance.now()
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(35000) })
    const body = await response.json()
    return { ms: performance.now() - started, status: response.status, ok: response.ok && Array.isArray(body.data), ids: (body.data || []).map(p => p.documentId || p.id) }
  } catch (error) { return { ms: performance.now() - started, ok: false, error: error.message } }
}
const pairs = []
for (let i = 0; i < iterations; i++) {
  let before, after
  if (i % 2) { after = await sample(candidate); before = await sample(baseline) }
  else { before = await sample(baseline); after = await sample(candidate) }
  pairs.push({ baseline: before, candidate: after, orderedAgreement: before.ok && after.ok ? JSON.stringify(before.ids) === JSON.stringify(after.ids) : null })
}
function summary(key) {
  const values = pairs.map(p => p[key]).filter(p => p.ok).map(p => p.ms).sort((a,b) => a-b)
  return { successes: values.length, failures: iterations - values.length, medianMs: values.length ? values[Math.floor(values.length / 2)] : null, p95Ms: values.length ? values[Math.ceil(values.length * .95)-1] : null }
}
console.log(JSON.stringify({ documentId, iterations, baseline: summary('baseline'), candidate: summary('candidate'), pairs }, null, 2))
