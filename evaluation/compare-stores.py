"""Low-rate, anonymous HTTP comparison. Run from the repository root with Python 3."""
import csv
import json
import math
import platform
import re
import statistics
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

TARGETS = {
    'Home': ['https://shop.tagg.gr/', 'https://woo.tagg.gr/'],
    'Catalog': ['https://shop.tagg.gr/products', 'https://woo.tagg.gr/?post_type=product'],
    'Product': ['https://shop.tagg.gr/products/macbook-pro', 'https://woo.tagg.gr/?product=sprite-stasis-ball-55-cm'],
    'Empty cart': ['https://shop.tagg.gr/cart', 'https://woo.tagg.gr/cart/'],
}
PLATFORMS = ['Next.js + Strapi + AWS', 'WordPress + WooCommerce']
HEADERS = ['content-security-policy', 'x-frame-options', 'x-content-type-options',
           'referrer-policy', 'permissions-policy', 'strict-transport-security']


def request(url):
    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Thesis-Comparison/1.0', 'Accept-Encoding': 'identity'})
        try:
            response = urllib.request.urlopen(req, timeout=20)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            header_ms = (time.perf_counter() - start) * 1000
            body = response.read(5_000_001)
            elapsed = (time.perf_counter() - start) * 1000
            html = body.decode('utf-8', errors='replace')
            title = re.search(r'<title[^>]*>(.*?)</title>', html, re.S | re.I)
            coming_soon = 'My Website is coming soon' in html
            return dict(status=response.status, ok=response.status == 200 and not coming_soon and len(body) <= 5_000_000,
                        final_url=response.url, header_ms=round(header_ms, 2), total_ms=round(elapsed, 2),
                        decoded_bytes=len(body), title=title.group(1) if title else '', coming_soon=coming_soon,
                        headers={h: response.headers.get(h) for h in HEADERS + ['cache-control', 'age', 'x-cache', 'x-nextjs-cache', 'server', 'content-encoding']})
    except Exception as error:
        return dict(ok=False, status=0, error=str(error), total_ms=round((time.perf_counter()-start)*1000, 2))


def summarize(rows):
    good = [r for r in rows if r['ok']]
    values = sorted(r['total_ms'] for r in good)
    return dict(ok=len(good), failed=len(rows)-len(good),
                median_ms=round(statistics.median(values), 2) if values else None,
                mean_ms=round(statistics.mean(values), 2) if values else None,
                p95_ms=values[math.ceil(.95*len(values))-1] if values else None,
                mean_header_ms=round(statistics.mean(r['header_ms'] for r in good), 2) if good else None,
                median_bytes=statistics.median(r['decoded_bytes'] for r in good) if good else None)


def main():
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    folder = Path('evaluation/reports') / ('comparison-' + timestamp)
    folder.mkdir(parents=True, exist_ok=False)
    report = dict(started_at=timestamp, execution_host=platform.system(), python=platform.python_version(),
                  method='Anonymous GET; no cookies; TLS verification on; redirects followed; identity encoding; 1 second pause after each request; alternating platform order each round. One warm-up per URL excluded, then 10 samples per URL. No concurrency. No cache flush.',
                  limitations=['Different products, images, templates and database sizes (WooCommerce retains 181 drafts).',
                               'HTTP document timing only; no browser rendering, image downloads, JavaScript, checkout transaction or load/scalability test.',
                               'WP Super Cache admin showed a permalink configuration error before this run; hosting-level cache and resource allocations unverified.',
                               'P95 uses nearest rank; with ten samples it equals the largest successful observation.',
                               'No measured traditional CMS cost baseline or matched hosting resource allocation; no causal claim about architecture.'],
                  observations=[])
    for page, urls in TARGETS.items():
        for warmup, rounds in [(True, 1), (False, 10)]:
            for i in range(rounds):
                for index in ([0, 1] if i % 2 == 0 else [1, 0]):
                    row = dict(page=page, platform=PLATFORMS[index], url=urls[index], warmup=warmup, round=i+1,
                               observed_at=datetime.now(timezone.utc).isoformat(), **request(urls[index]))
                    report['observations'].append(row)
                    (folder/'raw.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
                    print(f"{page} | {index} | {'warmup' if warmup else i+1} | {row['status']}", flush=True)
                    time.sleep(1)
    results = []
    for page in TARGETS:
        for name in PLATFORMS:
            rows = [r for r in report['observations'] if r['page']==page and r['platform']==name and not r['warmup']]
            results.append(dict(page=page, platform=name, **summarize(rows)))
    report['summary'] = results
    report['finished_at'] = datetime.now(timezone.utc).isoformat()
    (folder/'raw.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    with (folder/'summary.csv').open('w', newline='', encoding='utf-8-sig') as file:
        writer = csv.DictWriter(file, fieldnames=list(results[0])); writer.writeheader(); writer.writerows(results)
    lines = ['# Σύγκριση δημόσιων εγκαταστάσεων', '', f'Έναρξη UTC: {timestamp}', '',
             '80 μετρήσεις και 8 προθερμάνσεις. Ίδιος υπολογιστής Windows, χωρίς cookies, διαδοχικές αιτήσεις με εναλλαγή σειράς και παύση 1 δευτερολέπτου. Δεν έγινε εκκαθάριση cache.', '',
             '| Σελίδα | Εγκατάσταση | Επιτυχίες | Διάμεσος HTTP ms | Μέσος HTTP ms | P95 ms |',
             '|---|---|---:|---:|---:|---:|']
    lines += [f"| {r['page']} | {r['platform']} | {r['ok']}/10 | {r['median_ms']} | {r['mean_ms']} | {r['p95_ms']} |" for r in results]
    lines += ['', '## Περιορισμοί', '', 'Μετράται το HTML μέσω HTTP, όχι η πλήρης οπτική φόρτωση. Δεν μετρώνται Lighthouse/Core Web Vitals. Το P95 σε 10 δείγματα είναι το μέγιστο. Αποτυχίες καταγράφονται και εξαιρούνται από τους χρόνους επιτυχών αιτήσεων.', '',
              'Τα καταστήματα έχουν από 10 δημοσιευμένα προϊόντα, αλλά διαφορετικό περιεχόμενο, εικόνες, θέμα και λειτουργίες. Το WooCommerce διατηρεί 181 drafts και έχει προϊόντα με παραλλαγές. Το WP Super Cache εμφάνιζε σφάλμα permalinks. Οι πόροι φιλοξενίας και τυχόν server cache δεν έχουν επαληθευτεί. Πρόκειται για σύγκριση εγκαταστάσεων, όχι απομόνωση της επίδρασης της πλατφόρμας.', '',
              '## Παρουσία HTTP security headers', '', '| Εγκατάσταση | Header | Παρόν στην τελευταία επιτυχημένη αίτηση αρχικής |', '|---|---|---|']
    for name in PLATFORMS:
        rows=[r for r in report['observations'] if r['platform']==name and r['page']=='Home' and r['ok']]
        for header in HEADERS:
            lines.append(f"| {name} | {header} | {'Ναι' if rows and rows[-1]['headers'].get(header) else 'Όχι / μη διαθέσιμο'} |")
    lines += ['', 'Η παρουσία headers δεν αποδεικνύει σωστή πολιτική ή συνολική ασφάλεια. Δεν έγινε διεισδυτικός έλεγχος.', '',
              '## Κόστος και επεκτασιμότητα', '', 'Το κόστος εξετάζεται μόνο ποιοτικά, χωρίς προσωπικές χρεώσεις: στο WooCommerce περιλαμβάνει hosting, συντήρηση και τυχόν άδειες προσθέτων/θέματος· στην headless λύση hosting Next.js/Strapi, χρήση AWS και συντήρηση των διασυνδέσεων. Δεν προκύπτει αριθμητικό συμπέρασμα για το ποια λύση είναι φθηνότερη. Η επεκτασιμότητα συγκρίνεται αρχιτεκτονικά: πρόσθετα και hooks στο WooCommerce, ανεξάρτητα API και deploy υπηρεσιών στη headless λύση. Δεν έγινε δοκιμή κλιμάκωσης υπό φορτίο.']
    (folder/'report.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')
    print('REPORT:', folder, flush=True)


if __name__ == '__main__':
    main()
