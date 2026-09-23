"""Publish a completed comparison report; run only from an administrator shell."""
import json
import os
import sys
from pathlib import Path


def publish(source):
    report = json.loads((source / 'raw.json').read_text(encoding='utf-8'))
    rows = report.get('summary', [])
    if not report.get('finished_at') or len(rows) != 8:
        raise ValueError('Only a completed eight-target comparison can be published.')
    samples = report.get('observations', [])
    if len(samples) != 88 or sum(not s['warmup'] for s in samples) != 80:
        raise ValueError('Unexpected sample count.')
    for row in rows:
        matching = [s for s in samples if not s['warmup'] and s['page'] == row['page'] and s['platform'] == row['platform']]
        if len(matching) != 10 or sum(s['ok'] for s in matching) != row['ok'] or row['failed'] != 10-row['ok']:
            raise ValueError('Summary does not match observations.')
    # Explicit public projection: never publish cookies, credentials or local error details.
    public = {key: report[key] for key in ['started_at', 'finished_at', 'execution_host', 'python', 'method', 'limitations', 'summary']}
    public['observations'] = [{key: sample[key] for key in
        ['page', 'platform', 'url', 'warmup', 'round', 'observed_at', 'ok', 'status', 'header_ms', 'total_ms', 'decoded_bytes', 'headers']
        if key in sample} for sample in samples]
    folder = Path('evaluation/published')
    folder.mkdir(parents=True, exist_ok=True)
    target = folder/'comparison-latest.json'
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps(public, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    os.replace(temp, target)
    print(target)


if __name__ == '__main__':
    publish(Path(sys.argv[1]))
