import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'

const root = process.cwd()
const configPath = resolve(root, 'evaluation/config.json')
const reportsDir = resolve(root, 'evaluation/reports')
const latestJsonPath = resolve(reportsDir, 'latest.json')
const summaryPath = resolve(reportsDir, 'summary.md')

function round(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function percentile(values, p) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

function summarize(samples) {
  const okSamples = samples.filter((sample) => sample.ok)
  const headerTimes = okSamples.map((sample) => sample.headerMs)
  const totalTimes = okSamples.map((sample) => sample.totalMs)

  return {
    ok: okSamples.length,
    failed: samples.length - okSamples.length,
    statusCodes: samples.reduce((acc, sample) => {
      const key = String(sample.status || 'error')
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {}),
    ttfb: {
      avgMs: round(headerTimes.reduce((sum, value) => sum + value, 0) / (headerTimes.length || 1)),
      minMs: round(Math.min(...headerTimes, 0)),
      maxMs: round(Math.max(...headerTimes, 0)),
      p95Ms: round(percentile(headerTimes, 95)),
    },
    total: {
      avgMs: round(totalTimes.reduce((sum, value) => sum + value, 0) / (totalTimes.length || 1)),
      minMs: round(Math.min(...totalTimes, 0)),
      maxMs: round(Math.max(...totalTimes, 0)),
      p95Ms: round(percentile(totalTimes, 95)),
    },
  }
}

async function timedFetch(url) {
  const started = performance.now()

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'strapi-shop-evaluation/1.0',
      },
    })
    const headerMs = performance.now() - started
    await response.arrayBuffer()
    const totalMs = performance.now() - started

    return {
      ok: response.ok,
      status: response.status,
      headerMs: round(headerMs),
      totalMs: round(totalMs),
      bytes: Number(response.headers.get('content-length') || 0),
    }
  } catch (error) {
    const totalMs = performance.now() - started
    return {
      ok: false,
      status: 0,
      headerMs: round(totalMs),
      totalMs: round(totalMs),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function measureGroup(baseUrl, paths, iterations) {
  const results = []

  for (const path of paths) {
    const url = new URL(path, baseUrl).toString()
    const samples = []

    for (let index = 0; index < iterations; index += 1) {
      samples.push(await timedFetch(url))
    }

    results.push({
      path,
      url,
      samples,
      summary: summarize(samples),
    })
  }

  return results
}

function headerValue(headers, name) {
  return headers.get(name) || ''
}

function scoreSecurityHeaders(headers, url) {
  const checks = [
    {
      key: 'contentSecurityPolicy',
      label: 'Content-Security-Policy',
      passed: Boolean(headerValue(headers, 'content-security-policy')),
      value: headerValue(headers, 'content-security-policy'),
    },
    {
      key: 'xFrameOptions',
      label: 'X-Frame-Options',
      passed: Boolean(headerValue(headers, 'x-frame-options')),
      value: headerValue(headers, 'x-frame-options'),
    },
    {
      key: 'xContentTypeOptions',
      label: 'X-Content-Type-Options',
      passed: headerValue(headers, 'x-content-type-options').toLowerCase() === 'nosniff',
      value: headerValue(headers, 'x-content-type-options'),
    },
    {
      key: 'referrerPolicy',
      label: 'Referrer-Policy',
      passed: Boolean(headerValue(headers, 'referrer-policy')),
      value: headerValue(headers, 'referrer-policy'),
    },
    {
      key: 'permissionsPolicy',
      label: 'Permissions-Policy',
      passed: Boolean(headerValue(headers, 'permissions-policy')),
      value: headerValue(headers, 'permissions-policy'),
    },
    {
      key: 'strictTransportSecurity',
      label: 'Strict-Transport-Security',
      passed: url.startsWith('http://') || Boolean(headerValue(headers, 'strict-transport-security')),
      value: headerValue(headers, 'strict-transport-security') || 'not required for local HTTP',
    },
  ]

  const passed = checks.filter((check) => check.passed).length

  return {
    score: round((passed / checks.length) * 100, 0),
    checks,
    cors: {
      accessControlAllowOrigin: headerValue(headers, 'access-control-allow-origin') || 'not exposed',
    },
  }
}

async function scanSecurity(targets) {
  const scans = []

  for (const target of targets) {
    try {
      const response = await fetch(target.url, {
        redirect: 'manual',
        headers: {
          'User-Agent': 'strapi-shop-security-scan/1.0',
        },
      })

      scans.push({
        name: target.name,
        url: target.url,
        status: response.status,
        ...scoreSecurityHeaders(response.headers, target.url),
      })
    } catch (error) {
      scans.push({
        name: target.name,
        url: target.url,
        status: 0,
        score: 0,
        error: error instanceof Error ? error.message : String(error),
        checks: [],
        cors: {
          accessControlAllowOrigin: 'scan failed',
        },
      })
    }
  }

  return scans
}

async function checkAuthorization(strapiBaseUrl) {
  const url = new URL('/api/orders/my', strapiBaseUrl).toString()
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'strapi-shop-auth-check/1.0',
    },
  })

  return {
    endpoint: '/api/orders/my',
    expected: '401 or 403 without JWT',
    status: response.status,
    passed: response.status === 401 || response.status === 403,
  }
}

function compareAgainstTraditionalCms(report) {
  const frontendAvg =
    report.frontend.reduce((sum, item) => sum + item.summary.ttfb.avgMs, 0) /
    (report.frontend.length || 1)
  const apiAvg =
    report.api.reduce((sum, item) => sum + item.summary.total.avgMs, 0) /
    (report.api.length || 1)

  return [
    {
      criterion: 'Architecture',
      current: 'Headless Next.js frontend + Strapi API + composable services',
      traditional: report.traditionalCmsBaseline.architecture,
      observation: 'Current system separates presentation, CMS content APIs, analytics and recommender concerns.',
    },
    {
      criterion: 'TTFB / frontend response',
      current: `${round(frontendAvg)} ms average measured TTFB`,
      traditional: 'Often template/plugin/runtime dependent',
      observation: 'Measured on local development infrastructure; production hosting would require a separate run.',
    },
    {
      criterion: 'API latency',
      current: `${round(apiAvg)} ms average total API response`,
      traditional: 'Usually coupled to CMS page rendering and plugin stack',
      observation: 'API-first design allows endpoints to be profiled independently.',
    },
    {
      criterion: 'Security surface',
      current: 'Separated frontend, API, authenticated order endpoint and measurable headers',
      traditional: 'Single monolithic administration and rendering surface',
      observation: 'Header and auth checks are generated by this toolkit for repeatable comparison.',
    },
    {
      criterion: 'PWA / UX experimentation',
      current: 'Next.js PWA, recommender tracking, A/B metrics',
      traditional: 'Usually plugin/theme dependent',
      observation: 'Experimentation is implemented as application code and tracked through Strapi interactions.',
    },
  ]
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

function buildSummary(report) {
  const frontendRows = report.frontend.map((item) => [
    item.path,
    `${item.summary.ttfb.avgMs} ms`,
    `${item.summary.ttfb.p95Ms} ms`,
    `${item.summary.total.avgMs} ms`,
    `${item.summary.ok}/${item.samples.length}`,
  ])

  const apiRows = report.api.map((item) => [
    item.path,
    `${item.summary.ttfb.avgMs} ms`,
    `${item.summary.total.avgMs} ms`,
    `${item.summary.total.p95Ms} ms`,
    `${item.summary.ok}/${item.samples.length}`,
  ])

  const securityRows = report.security.map((item) => [
    item.name,
    String(item.status),
    `${item.score}/100`,
    item.checks
      .filter((check) => !check.passed)
      .map((check) => check.label)
      .join(', ') || 'None',
  ])

  const comparisonRows = report.comparison.map((item) => [
    item.criterion,
    item.current,
    item.traditional,
    item.observation,
  ])

  return `# Evaluation Report

Generated: ${report.generatedAt}

## Frontend TTFB

${markdownTable(['Path', 'Avg TTFB', 'P95 TTFB', 'Avg total', 'OK samples'], frontendRows)}

## API Latency

${markdownTable(['Endpoint', 'Avg TTFB', 'Avg total', 'P95 total', 'OK samples'], apiRows)}

## Security Headers

${markdownTable(['Target', 'Status', 'Score', 'Missing / weak checks'], securityRows)}

## Authorization Check

- Endpoint: ${report.authorization.endpoint}
- Expected: ${report.authorization.expected}
- Status: ${report.authorization.status}
- Passed: ${report.authorization.passed ? 'yes' : 'no'}

## Lighthouse

Lighthouse is optional in this local toolkit. Install or run Lighthouse separately and store the exported JSON/HTML under \`evaluation/reports/\` for formal browser lab evidence.

## Comparative Study

${markdownTable(['Criterion', 'Current platform', 'Traditional CMS', 'Observation'], comparisonRows)}
`
}

async function main() {
  const config = JSON.parse(await readFile(configPath, 'utf8'))

  await mkdir(dirname(latestJsonPath), { recursive: true })

  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      frontendBaseUrl: config.frontendBaseUrl,
      strapiBaseUrl: config.strapiBaseUrl,
      iterations: config.iterations,
    },
    traditionalCmsBaseline: config.traditionalCmsBaseline,
    frontend: await measureGroup(
      config.frontendBaseUrl,
      config.frontendPaths,
      config.iterations
    ),
    api: await measureGroup(config.strapiBaseUrl, config.apiPaths, config.iterations),
    security: await scanSecurity(config.securityTargets),
    authorization: await checkAuthorization(config.strapiBaseUrl),
  }

  report.comparison = compareAgainstTraditionalCms(report)

  await writeFile(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`)
  await writeFile(summaryPath, buildSummary(report))

  console.log(`Evaluation complete: ${latestJsonPath}`)
  console.log(`Summary written: ${summaryPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
