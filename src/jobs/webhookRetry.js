const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const tempFile = path.join(os.tmpdir(), `webhookRetry-${Date.now()}.ts`);
const tsxCli = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
const targetUrl = pathToFileURL(path.join(process.cwd(), 'src/jobs/webhookRetry.ts')).href;
const script = [
  'import { processWebhookRetries } from "' + targetUrl + '";',
  '(async () => {',
  '  const result = await processWebhookRetries();',
  '  console.log(JSON.stringify(result));',
  '})();',
].join('\n');

fs.writeFileSync(tempFile, script, 'utf8');

const execution = spawnSync(process.execPath, [tsxCli, tempFile], {
  cwd: process.cwd(),
  encoding: 'utf8',
});

fs.rmSync(tempFile, { force: true });

if (execution.status !== 0) {
  if (execution.error) {
    console.log(`webhook_retry: error ${execution.error.message}`);
    process.exit(1);
  }
  const reason = (execution.stderr || execution.stdout || 'unknown error').trim().split(/\r?\n/).pop();
  console.log(`webhook_retry: error ${reason}`);
  process.exit(execution.status || 1);
}

console.log('webhook_retry: success');