"""Detached administrator job. Fixed targets; never accepts a URL or command from HTTP."""
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def main():
    folder = Path('evaluation/reports')
    state_path = folder / 'web-run.json'
    state = json.loads(state_path.read_text(encoding='utf-8'))
    if state['id'] != sys.argv[1]:
        return
    try:
        output = folder / ('comparison-web-' + state['id'])
        env = dict(os.environ, COMPARISON_RUN_DIR=str(output), COMPARISON_EXECUTION_HOST='Plesk server')
        with (folder / ('web-' + state['id'] + '.log')).open('w', encoding='utf-8') as log:
            subprocess.run([sys.executable, 'evaluation/compare-stores.py'], env=env,
                           stdout=log, stderr=log, timeout=600, check=True)
            report = json.loads((output / 'raw.json').read_text(encoding='utf-8'))
            if any(row['failed'] for row in report['summary']):
                raise ValueError('Incomplete successful measurements')
            subprocess.run([sys.executable, 'evaluation/publish-comparison.py', str(output)],
                           stdout=log, stderr=log, timeout=30, check=True)
        state.update(status='completed', message='Η νέα μέτρηση δημοσιεύτηκε.')
    except Exception:
        state.update(status='failed', message='Η μέτρηση δεν ολοκληρώθηκε επιτυχώς. Διατηρήθηκε το προηγούμενο report. Ο διαχειριστής μπορεί να ελέγξει τα logs.')
    finally:
        state['finishedAt'] = datetime.now(timezone.utc).isoformat()
        temp = state_path.with_suffix('.tmp')
        temp.write_text(json.dumps(state, ensure_ascii=False), encoding='utf-8')
        os.replace(temp, state_path)
        (folder / 'web-run.lock').rmdir()


if __name__ == '__main__':
    main()
