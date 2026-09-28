/* eslint-disable no-console */
async function main() {
  const webhook = process.env.SLACK_WEBHOOK_URL || process.env.ALERT_WEBHOOK_URL;

  if (!webhook) {
    console.log('alert: error (missing SLACK_WEBHOOK_URL/ALERT_WEBHOOK_URL)');
    process.exit(1);
  }

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '[simulate-failure] Reconciliation/webhook failure alert test' }),
  });

  if (!response.ok) {
    console.log(`alert: error (${response.status})`);
    process.exit(1);
  }

  console.log('alert: sent');
}

main().catch((error) => {
  console.error(error);
  console.log('alert: error');
  process.exit(1);
});
