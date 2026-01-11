#!/usr/bin/env node
// Send deployment notification
// scripts/notifyDeployment.js

async function notifyDeployment(options) {
  const {
    environment,
    version,
    status,
    url,
  } = options;

  const emoji = status === 'success' ? '✅' : '❌';
  const statusText = status === 'success' ? 'succeeded' : 'failed';

  const message = `
${emoji} **Deployment ${statusText}**

Environment: ${environment}
Version: ${version}
URL: ${url}
Time: ${new Date().toISOString()}
  `.trim();

  console.log(message);

  // Send to Slack if webhook is configured
  if (process.env.SLACK_WEBHOOK) {
    try {
      const response = await fetch(process.env.SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      if (response.ok) {
        console.log('✅ Slack notification sent');
      } else {
        console.error('❌ Failed to send Slack notification');
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  // Send email if configured
  if (process.env.RESEND_API_KEY) {
    // TODO: Send email notification
    console.log('Email notification would be sent here');
  }
}

// Parse command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const value = args[index + 1];
      options[key] = value;
    }
  });

  notifyDeployment(options).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = notifyDeployment;
