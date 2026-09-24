import EvaluationRunner from '@/components/EvaluationRunner'
import { getComparisonReport } from '@/lib/comparison-report'

const pageNames: Record<string, string> = { Home: 'Αρχική', Catalog: 'Κατάλογος', Product: 'Προϊόν', 'Empty cart': 'Άδειο καλάθι' }
const metric = (n: number | null) => n === null ? '—' : `${n.toLocaleString('el-GR', { maximumFractionDigits: 1 })} ms`
const headers = ['content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'strict-transport-security']

export default async function StoreComparison() {
  const report = await getComparisonReport()
  if (!report) return <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">Σύγκριση με WooCommerce</h2><EvaluationRunner /><p className="mt-3">Δεν έχει δημοσιευτεί ολοκληρωμένη συγκριτική μέτρηση.</p></section>
  const platforms = [...new Set(report.summary.map(row => row.platform))]
  const pages = [...new Set(report.summary.map(row => row.page))]
  const maximum = Math.max(1, ...report.summary.map(row => row.median_ms ?? 0))
  const success = report.summary.reduce((sum, row) => sum + row.ok, 0)
  const count = report.summary.reduce((sum, row) => sum + row.ok + row.failed, 0)
  const warmupFailures = report.observations.filter(row => row.warmup && !row.ok).length
  const date = new Date(report.finished_at).toLocaleString('el-GR', { timeZone: 'Europe/Athens' })
  return (
    <section id="woocommerce-comparison" className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5 sm:p-7">
      <p className="text-sm font-bold uppercase text-[var(--accent)]">Πειραματική σύγκριση εγκαταστάσεων</p>
      <h2 className="mt-2 text-3xl font-black">Σύγκριση με WooCommerce</h2>
      <EvaluationRunner />
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">Μετρήσεις HTTP του HTML από τον ίδιο υπολογιστή, χωρίς σύνδεση χρήστη. Δεν μετράται η πλήρης φόρτωση εικόνων και JavaScript ή η οπτική απόδοση στον browser.</p>
      <p className="mt-3 text-sm">Ολοκλήρωση: <time dateTime={report.finished_at}>{date}</time> (ώρα Ελλάδας) · Σημείο μέτρησης: {report.execution_host}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[['Επιτυχημένες αιτήσεις', `${success}/${count}`], ['Δείγματα ανά σελίδα / σύστημα', '10'], ['Αποτυχίες προθέρμανσης', String(warmupFailures)]].map(([label, value]) => <div key={label} className="rounded-lg bg-[#f5f5ef] p-4"><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold" href="/api/evaluation/comparison?format=csv" download>Λήψη CSV</a>
        <a className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold" href="/api/evaluation/comparison?format=json" download>Λήψη JSON με δείγματα</a>
      </div>
      <h3 className="mt-7 text-xl font-bold">Διάμεσος χρόνος παραλαβής HTML</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">Μικρότερη τιμή σημαίνει ταχύτερη απόκριση στο συγκεκριμένο δείγμα.</p>
      <div className="mt-5 space-y-6">
        {pages.map(page => <div key={page}><h4 className="font-bold">{pageNames[page] || page}</h4>{report.summary.filter(row => row.page === page).map(row => <div key={row.platform} className="mt-2"><div className="flex flex-wrap justify-between gap-2 text-sm"><span>{row.platform}</span><strong>{metric(row.median_ms)}</strong></div><div aria-hidden="true" className="mt-1 h-3 overflow-hidden rounded bg-[#f5f5ef]"><div className={`h-full rounded ${row.platform === platforms[0] ? 'bg-[#16796f]' : 'bg-[#7956ad]'}`} style={{ width: `${(row.median_ms ?? 0) / maximum * 100}%` }} /></div></div>)}</div>)}
      </div>
      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <caption className="mb-3 text-left font-bold">Αποτελέσματα ανά σελίδα και εγκατάσταση</caption>
          <thead><tr>{['Σελίδα', 'Εγκατάσταση', 'Επιτυχίες', 'Διάμεσος', 'Μέσος', 'P95'].map(label => <th key={label} scope="col" className="border-b border-[var(--line)] py-3 pr-4">{label}</th>)}</tr></thead>
          <tbody>{report.summary.map(row => <tr key={row.page + row.platform}>{[pageNames[row.page] || row.page, row.platform, `${row.ok}/${row.ok + row.failed}`, metric(row.median_ms), metric(row.mean_ms), metric(row.p95_ms)].map((value, i) => <td key={i} className="border-b border-[var(--line)] py-3 pr-4">{value}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <details className="mt-6 rounded-lg border border-[var(--line)] p-4"><summary className="cursor-pointer font-bold">Έλεγχοι HTTP security headers</summary><p className="mt-3 text-sm">Παρουσία headers στην τελευταία επιτυχημένη αίτηση αρχικής. Δεν αποτελεί πλήρη έλεγχο ασφάλειας ή αξιολόγηση της ορθότητας κάθε πολιτικής.</p><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr><th scope="col" className="py-2">Header</th>{platforms.map(p => <th key={p} scope="col" className="px-3 py-2">{p}</th>)}</tr></thead><tbody>{headers.map(header => <tr key={header}><th scope="row" className="py-2 font-normal">{header}</th>{platforms.map(p => {const last = report.observations.filter(r => r.page === 'Home' && r.platform === p && r.ok).at(-1); return <td key={p} className="px-3 py-2">{last?.headers?.[header] ? 'Παρόν' : 'Δεν καταγράφηκε'}</td>})}</tr>)}</tbody></table></div></details>
      <details open className="mt-4 rounded-lg border border-[var(--line)] p-4"><summary className="cursor-pointer font-bold">Μεθοδολογία και όρια ερμηνείας</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6"><li>Μία προθέρμανση ανά URL εκτός στατιστικών και 10 μετρήσεις. Εναλλαγή σειράς των συστημάτων, παύση ενός δευτερολέπτου, χωρίς παράλληλες αιτήσεις ή εκκαθάριση cache.</li><li>Python urllib, ανώνυμο GET, επαλήθευση TLS, ακολούθηση ανακατευθύνσεων και identity encoding. Οι χρόνοι δεν συγκρίνονται απευθείας με το ξεχωριστό report Node.js από το Plesk.</li><li>Σε 10 δείγματα το P95 nearest-rank ισούται με τη μέγιστη επιτυχημένη τιμή. Οι αποτυχίες εμφανίζονται χωριστά.</li><li>Τα draft προϊόντα έχουν αφαιρεθεί από το WooCommerce. Η αλλαγή αποτυπώνεται σε μετρήσεις που εκτελούνται μετά την αφαίρεσή τους. Παραμένουν διαφορές στα προϊόντα, στις εικόνες και στα templates των δύο καταστημάτων.</li><li>Οι ρυθμίσεις cache και οι πόροι hosting επηρεάζουν τις μετρήσεις και δεν επαληθεύονται αυτόματα. Σύγκρινε εκτελέσεις από το ίδιο σημείο μέτρησης· οι μετρήσεις Windows και Plesk αποτελούν διαφορετικές σειρές.</li><li>Τα αποτελέσματα αφορούν αυτές τις εγκαταστάσεις. Δεν αποδεικνύουν γενική υπεροχή πλατφόρμας ή ικανότητα κλιμάκωσης υπό φορτίο.</li></ul></details>
      <p className="mt-5 text-sm text-[var(--muted)]">Η σελίδα εμφανίζει το τελευταίο δημοσιευμένο report. Νέες μετρήσεις εκτελούνται και δημοσιεύονται από τον διαχειριστή.</p>
    </section>
  )
}
