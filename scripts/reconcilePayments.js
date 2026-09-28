const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const tempFile = path.join(os.tmpdir(), `reconcilePayments-${Date.now()}.ts`);
const tsxCli = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
const targetUrl = pathToFileURL(path.join(process.cwd(), 'src/jobs/reconcilePayments.ts')).href;
const script = [
  'import { reconcilePayments } from "' + targetUrl + '";',
  '(async () => {',
  '  const summary = await reconcilePayments();',
  '  console.log(JSON.stringify(summary));',
  '})();',
].join('\n');

fs.writeFileSync(tempFile, script, 'utf8');

const result = spawnSync(process.execPath, [tsxCli, tempFile], {
  cwd: process.cwd(),
  encoding: 'utf8',
});

fs.rmSync(tempFile, { force: true });

if (result.status !== 0) {
  if (result.error) {
    console.log(`reconcile: error ${result.error.message}`);
    process.exit(1);
  }
  const reason = (result.stderr || result.stdout || 'unknown error').trim().split(/\r?\n/).pop();
  console.log(`reconcile: error ${reason}`);
  process.exit(result.status || 1);
}

console.log('reconcile: success');