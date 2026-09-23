import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ABMetricsPanel from '@/components/ABMetricsPanel'
import StoreComparison from '@/components/StoreComparison'

export const dynamic = 'force-dynamic'

type MetricSummary = {
  ttfb: {
    avgMs: number
    p95Ms: number
  }
  total: {
    avgMs: number
    p95Ms: number
  }
  ok: number
  failed: number
}

type MeasuredRoute = {
  path: string
  summary: MetricSummary
  samples: unknown[]
}

type SecurityScan = {
  name: string
  status: number
  score: number
  checks: {
    label: string
    passed: boolean
  }[]
}

type EvaluationReport = {
  generatedAt: string
  environment: {
    iterations: number
  }
  frontend: MeasuredRoute[]
  api: MeasuredRoute[]
  security: SecurityScan[]
  authorization: {
    endpoint: string
    status: number
    passed: boolean
  }
  comparison: {
    criterion: string
    current: string
    traditional: string
    observation: string
  }[]
}

async function getLatestReport(): Promise<EvaluationReport | null> {
  try {
    const file = await readFile(
      resolve(process.cwd(), 'evaluation/reports/latest.json'),
      'utf8'
    )
    return JSON.parse(file) as EvaluationReport
  } catch {
    return null
  }
}

function formatMetric(value: number) {
  return `${value.toFixed(1)} ms`
}

const evaluationAreas = [
  {
    title: 'Απόδοση',
    description:
      'Έλεγχος Lighthouse, Core Web Vitals, μέτρηση φόρτωσης καταλόγου και σύγκριση με παραδοσιακό CMS.',
    items: ['LCP / CLS / INP', 'TTFB προϊόντων', 'Next image optimization', 'PWA cache behavior'],
  },
  {
    title: 'Ασφάλεια',
    description:
      'Καταγραφή ελέγχων για authentication, δικαιώματα Strapi, HTTP headers και ασφαλή δημιουργία παραγγελιών.',
    items: ['JWT checkout', 'Server-side total calculation', 'Security headers', 'Role permissions'],
  },
  {
    title: 'Εμπειρία χρήστη',
    description:
      'Αξιολόγηση ροής αναζήτησης, φίλτρων, καλαθιού, checkout και λειτουργίας σε mobile viewport.',
    items: ['Search and sorting', 'Cart feedback', 'Responsive layout', 'Offline fallback'],
  },
  {
    title: 'Composable / MACH',
    description:
      'Μερική μετάβαση: ανεξάρτητες υπηρεσίες προτάσεων και analytics σε AWS Lambda. Ο κατάλογος και το checkout παραμένουν στο Strapi.',
    items: ['AWS Lambda', 'DynamoDB analytics', 'API-first JSON contracts', 'Headless CMS core'],
  },
]

const comparison = [
  ['Αρχιτεκτονική', 'Headless Strapi + Next.js', 'Monolithic CMS'],
  ['Επεκτασιμότητα', 'API-first και composable', 'Στενότερη σύνδεση frontend/backend'],
  ['PWA', 'Service worker και manifest', 'Συνήθως μέσω plugin'],
  ['Περιεχόμενο', 'CMS-managed products/categories', 'CMS-managed templates/content'],
  ['MACH readiness', 'Optional serverless services', 'Plugin/theme dependent extension'],
]

export default async function EvaluationPage() {
  const latestReport = await getLatestReport()

  return (
    <main className="shell py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">
          Παραδοτέο διπλωματικής
        </p>
        <h1 className="mt-2 text-4xl font-black">Πλάνο αξιολόγησης</h1>
        <p className="mt-3 text-[var(--muted)]">
          Η σελίδα αυτή συγκεντρώνει τα βασικά σημεία αξιολόγησης που ζητά η
          εργασία: επιδόσεις, ασφάλεια, UX και σύγκριση με παραδοσιακά CMS.
        </p>
      </div>

      <StoreComparison />

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {evaluationAreas.map((area) => (
          <article
            key={area.title}
            className="rounded-[8px] border border-[var(--line)] bg-white p-5"
          >
            <h2 className="text-2xl font-black">{area.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {area.description}
            </p>
            <ul className="mt-5 space-y-2 text-sm font-bold">
              {area.items.map((item) => (
                <li key={item} className="rounded-[8px] bg-[#f5f5ef] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[8px] border border-[var(--line)] bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-[var(--accent)]">
              Quantitative metrics
            </p>
            <h2 className="mt-1 text-2xl font-black">Τελευταία μέτρηση</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {latestReport
              ? `Generated ${new Date(latestReport.generatedAt).toLocaleString('el-GR')}`
              : 'Τρέξε npm run evaluate για να δημιουργηθεί report.'}
          </p>
        </div>

        {latestReport ? (
          <>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[8px] bg-[#f5f5ef] p-4">
                <p className="text-xs font-bold uppercase text-[var(--muted)]">
                  Iterations
                </p>
                <p className="mt-2 text-3xl font-black">
                  {latestReport.environment.iterations}
                </p>
              </div>
              <div className="rounded-[8px] bg-[#f5f5ef] p-4">
                <p className="text-xs font-bold uppercase text-[var(--muted)]">
                  Protected endpoint
                </p>
                <p className="mt-2 text-3xl font-black">
                  {latestReport.authorization.passed ? 'Pass' : 'Fail'}
                </p>
              </div>
              <div className="rounded-[8px] bg-[#f5f5ef] p-4">
                <p className="text-xs font-bold uppercase text-[var(--muted)]">
                  Security avg score
                </p>
                <p className="mt-2 text-3xl font-black">
                  {Math.round(
                    latestReport.security.reduce((sum, item) => sum + item.score, 0) /
                      latestReport.security.length
                  )}
                  /100
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="py-3 pr-4">Frontend path</th>
                    <th className="py-3 pr-4">Avg TTFB</th>
                    <th className="py-3 pr-4">P95 TTFB</th>
                    <th className="py-3 pr-4">Avg total</th>
                    <th className="py-3 pr-4">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReport.frontend.map((route) => (
                    <tr key={route.path} className="border-b border-[var(--line)] last:border-0">
                      <td className="py-3 pr-4 font-bold">{route.path}</td>
                      <td className="py-3 pr-4">{formatMetric(route.summary.ttfb.avgMs)}</td>
                      <td className="py-3 pr-4">{formatMetric(route.summary.ttfb.p95Ms)}</td>
                      <td className="py-3 pr-4">{formatMetric(route.summary.total.avgMs)}</td>
                      <td className="py-3 pr-4">{route.summary.failed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="py-3 pr-4">API endpoint</th>
                    <th className="py-3 pr-4">Avg TTFB</th>
                    <th className="py-3 pr-4">Avg total</th>
                    <th className="py-3 pr-4">P95 total</th>
                    <th className="py-3 pr-4">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReport.api.map((route) => (
                    <tr key={route.path} className="border-b border-[var(--line)] last:border-0">
                      <td className="py-3 pr-4 font-bold">{route.path}</td>
                      <td className="py-3 pr-4">{formatMetric(route.summary.ttfb.avgMs)}</td>
                      <td className="py-3 pr-4">{formatMetric(route.summary.total.avgMs)}</td>
                      <td className="py-3 pr-4">{formatMetric(route.summary.total.p95Ms)}</td>
                      <td className="py-3 pr-4">{route.summary.failed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="py-3 pr-4">Security target</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Score</th>
                    <th className="py-3 pr-4">Missing / weak</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReport.security.map((scan) => {
                    const weak = scan.checks
                      .filter((check) => !check.passed)
                      .map((check) => check.label)

                    return (
                      <tr key={scan.name} className="border-b border-[var(--line)] last:border-0">
                        <td className="py-3 pr-4 font-bold">{scan.name}</td>
                        <td className="py-3 pr-4">{scan.status}</td>
                        <td className="py-3 pr-4">{scan.score}/100</td>
                        <td className="py-3 pr-4 text-[var(--muted)]">
                          {weak.length ? weak.join(', ') : 'None'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[8px] bg-[#f5f5ef] p-4 text-sm text-[var(--muted)]">
            Δεν υπάρχει ακόμα αρχείο `evaluation/reports/latest.json`. Ξεκίνα Next.js
            και Strapi και μετά τρέξε `npm run evaluate`.
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[8px] border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Συγκριτική μελέτη</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="py-3 pr-4">Κριτήριο</th>
                <th className="py-3 pr-4">Προτεινόμενη λύση</th>
                <th className="py-3 pr-4">Παραδοσιακό CMS</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([criterion, proposed, traditional]) => (
                <tr key={criterion} className="border-b border-[var(--line)] last:border-0">
                  <td className="py-3 pr-4 font-bold">{criterion}</td>
                  <td className="py-3 pr-4">{proposed}</td>
                  <td className="py-3 pr-4 text-[var(--muted)]">{traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ABMetricsPanel />
    </main>
  )
}
