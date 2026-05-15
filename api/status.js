import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import os from 'node:os';

const execFileAsync = promisify(execFile);
const ROUTER_MODELS_URL = process.env.MIMOOPS_ROUTER_MODELS_URL || 'http://127.0.0.1:20128/v1/models';
const GATEWAY_PROCESS_PATTERN = process.env.MIMOOPS_GATEWAY_PROCESS_PATTERN || 'hermes gateway run';
const ROUTER_PROCESS_PATTERN = process.env.MIMOOPS_ROUTER_PROCESS_PATTERN || '9router';

async function run(command, args = [], timeout = 1800) {
  try {
    const { stdout } = await execFileAsync(command, args, { timeout });
    return { ok: true, stdout: stdout.trim() };
  } catch (error) {
    return { ok: false, stdout: error.stdout?.trim() || '', error: error.message };
  }
}

async function processCount(pattern) {
  const result = await run('pgrep', ['-af', pattern]);
  if (!result.ok || !result.stdout) return { running: false, count: 0, sample: '' };
  const lines = result.stdout.split('\n').filter((line) => !line.includes('pgrep -af'));
  return { running: lines.length > 0, count: lines.length, sample: lines[0] || '' };
}

async function diskUsage() {
  const result = await run('df', ['-P', '/']);
  if (!result.ok) return { usedPercent: null, label: 'unknown' };
  const line = result.stdout.split('\n')[1] || '';
  const parts = line.trim().split(/\s+/);
  const percent = Number((parts[4] || '0').replace('%', ''));
  return { usedPercent: Number.isFinite(percent) ? percent : null, label: parts[4] || 'unknown' };
}

async function memoryUsage() {
  const meminfo = await readFile('/proc/meminfo', 'utf8').catch(() => '');
  const total = Number(meminfo.match(/^MemTotal:\s+(\d+)/m)?.[1] || 0);
  const available = Number(meminfo.match(/^MemAvailable:\s+(\d+)/m)?.[1] || 0);
  if (!total || !available) return { usedPercent: null };
  return { usedPercent: Math.round(((total - available) / total) * 100) };
}

async function routerLatency() {
  const started = Date.now();
  try {
    const response = await fetch(ROUTER_MODELS_URL, { signal: AbortSignal.timeout(1800) });
    await response.arrayBuffer();
    return { ok: response.ok, ms: Date.now() - started, status: response.status };
  } catch (error) {
    return { ok: false, ms: null, status: 'offline', error: error.message };
  }
}

async function statusPayload() {
  const [hermes, routerProcess, router, disk, memory] = await Promise.all([
    processCount(GATEWAY_PROCESS_PATTERN),
    processCount(ROUTER_PROCESS_PATTERN),
    routerLatency(),
    diskUsage(),
    memoryUsage(),
  ]);

  const pressure = Math.max(disk.usedPercent ?? 0, memory.usedPercent ?? 0);
  const routerRisk = router.ok ? Math.min(45, Math.round((router.ms || 0) / 10)) : 82;
  const gatewayRisk = hermes.running ? 12 : 78;
  const runtimeRisk = Math.min(95, pressure);
  const recoveryScore = Math.max(28, 100 - Math.round((routerRisk + gatewayRisk + runtimeRisk) / 3));
  const healthyCount = [hermes.running, routerProcess.running && router.ok, pressure < 85].filter(Boolean).length;

  return {
    generatedAt: new Date().toISOString(),
    host: process.env.VERCEL ? 'vercel-serverless-runtime' : os.hostname(),
    overall: healthyCount >= 3 ? 'healthy' : healthyCount === 2 ? 'degraded' : 'alert',
    recoveryScore,
    services: [
      {
        name: 'Hermes Gateway',
        status: hermes.running ? 'Healthy' : 'Demo Probe',
        value: hermes.running ? 'online' : 'serverless',
        meta: hermes.sample || `Process pattern: ${GATEWAY_PROCESS_PATTERN}`,
        tone: hermes.running ? 'green' : 'amber',
      },
      {
        name: '9Router Models',
        status: router.ok ? 'Synced' : 'Demo Fallback',
        value: router.ms ? `${router.ms} ms` : String(router.status),
        meta: routerProcess.running ? 'Local model router process detected' : 'Router process not found in serverless runtime',
        tone: router.ok ? 'blue' : 'amber',
      },
      {
        name: 'Cron Watchdog',
        status: 'Armed',
        value: '15m',
        meta: 'Expected watchdog cadence for recovery checks',
        tone: 'amber',
      },
      {
        name: 'Runtime',
        status: pressure < 85 ? 'Stable' : 'Pressure',
        value: `${pressure}%`,
        meta: `Memory ${memory.usedPercent ?? '?'}% / Disk ${disk.label}`,
        tone: pressure < 85 ? 'green' : 'amber',
      },
    ],
    incidents: [
      { time: new Date().toISOString().slice(11, 19), title: 'Serverless health snapshot generated', detail: 'MiMoOps collected runtime, process, router, memory, and disk signals from the public deployment.' },
      { time: 'watchdog', title: hermes.running ? 'Gateway process verified' : 'Gateway probe in demo mode', detail: hermes.running ? 'Hermes gateway is visible in the process table.' : 'Vercel serverless does not keep VPS processes alive, so this probe reports demo/runtime context.' },
      { time: 'router', title: router.ok ? 'Model endpoint responded' : 'Model endpoint unavailable', detail: router.ok ? `Router returned HTTP ${router.status} in ${router.ms} ms.` : `MiMoOps could not reach ${ROUTER_MODELS_URL}.` },
      { time: 'system', title: pressure < 85 ? 'Runtime pressure acceptable' : 'Runtime pressure high', detail: `Current pressure score is ${pressure}%.` },
    ],
    runbooks: [
      { command: 'mimoops recover gateway --verify', result: hermes.running ? 'Skipped: gateway already healthy' : 'Preview: recovery requires connected VPS agent', state: hermes.running ? 'ready' : 'armed' },
      { command: 'mimoops recover 9router --verify', result: router.ok ? `Skipped: router healthy at ${router.ms} ms` : 'Preview: warm restart router and poll /v1/models', state: router.ok ? 'ready' : 'armed' },
      { command: 'mimoops report --send telegram', result: 'Ready: summarize incident timeline for operator handoff', state: 'ready' },
    ],
    risks: [
      { label: 'Gateway drift', score: gatewayRisk, copy: hermes.running ? 'Process exists, endpoint path monitored' : 'Serverless runtime has no persistent gateway process' },
      { label: 'Router latency', score: routerRisk, copy: router.ok ? `Model endpoint answered in ${router.ms} ms` : 'Router endpoint needs connected runtime' },
      { label: 'Runtime pressure', score: runtimeRisk, copy: `Memory ${memory.usedPercent ?? '?'}% / Disk ${disk.label}` },
    ],
    proof: [
      'Public Vercel serverless API',
      'Runtime and endpoint probes',
      'Recovery runbook preview',
      'Operator-ready incident report',
    ],
  };
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.status(204).end();
    return;
  }

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json(await statusPayload());
}
