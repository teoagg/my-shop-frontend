import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('worker', Path(__file__).resolve().parents[1]/'evaluation/web-worker.py')
worker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)
class WorkerTest(unittest.TestCase):
    def scenario(self, fail):
        old = os.getcwd()
        with tempfile.TemporaryDirectory() as temp:
            os.chdir(temp)
            try:
                root=Path('evaluation/reports');root.mkdir(parents=True)
                (root/'web-run.lock').mkdir()
                (root/'web-run.json').write_text(json.dumps({'id':'test','status':'running'}))
                def run(args, **kwargs):
                    if 'compare-stores.py' in args[1]:
                        output=Path(kwargs['env']['COMPARISON_RUN_DIR']);output.mkdir()
                        (output/'raw.json').write_text(json.dumps({'summary':[{'failed':int(fail)}]}))
                with patch.object(sys,'argv',['worker','test']), patch.object(worker.subprocess,'run',side_effect=run) as invoke:
                    worker.main()
                    self.assertEqual(invoke.call_count, 1 if fail else 2)
                self.assertEqual(json.loads((root/'web-run.json').read_text(encoding='utf-8'))['status'],'failed' if fail else 'completed')
                self.assertFalse((root/'web-run.lock').exists())
            finally: os.chdir(old)
    def test_success(self): self.scenario(False)
    def test_failed_measurements_do_not_publish(self): self.scenario(True)
    def test_timeout_keeps_old_report_and_releases_lock(self):
        old = os.getcwd()
        with tempfile.TemporaryDirectory() as temp:
            os.chdir(temp)
            try:
                root = Path('evaluation/reports'); root.mkdir(parents=True)
                (root/'web-run.lock').mkdir()
                (root/'web-run.json').write_text(json.dumps({'id':'test','status':'running'}))
                published = Path('evaluation/published'); published.mkdir()
                snapshot = published/'comparison-latest.json'; snapshot.write_text('old report')
                with patch.object(sys,'argv',['worker','test']), patch.object(worker.subprocess,'run',side_effect=worker.subprocess.TimeoutExpired('compare',600)):
                    worker.main()
                self.assertEqual(snapshot.read_text(), 'old report')
                self.assertFalse((root/'web-run.lock').exists())
                self.assertEqual(json.loads((root/'web-run.json').read_text(encoding='utf-8'))['status'], 'failed')
            finally: os.chdir(old)
if __name__=='__main__': unittest.main()

