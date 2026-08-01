import { buildHealthReport, HEALTH_CHECK_INTERVAL_MINUTES } from './lib/app-health.js';

const sendAlert = async (report) => {
  const webhookUrl = globalThis.process?.env?.HEALTH_ALERT_WEBHOOK_URL;
  if (!webhookUrl || report.overall === 'operational') return;

  const affected = report.modules
    .filter((module) => module.status !== 'operational')
    .map((module) => `${module.label}: ${module.status}`)
    .join(', ');

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `[Info Tarkov] Health ${report.overall.toUpperCase()} — ${affected}`,
      report
    })
  });
};

export const handler = async () => {
  const report = await buildHealthReport();
  console.log(JSON.stringify({
    event: 'app-health-check',
    intervalMinutes: HEALTH_CHECK_INTERVAL_MINUTES,
    ...report
  }));

  try {
    await sendAlert(report);
  } catch (error) {
    console.error('Health alert delivery failed:', error?.message || error);
  }

  return { statusCode: 200 };
};

export const config = {
  schedule: '*/15 * * * *'
};
