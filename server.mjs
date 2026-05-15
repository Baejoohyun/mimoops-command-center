import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import os from 'node:os';

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.MIMOOPS_PORT || 8787);
const ROUTER_MODELS_URL = process.env.MIMOOPS_ROUTER_MODELS_URL || 'http://127.0.0.1:20128/v1/models';
const GATEWAY_PROCESS_PATTERN = process.env.MIMOOPS_GATEWAY_PROCESS_PATTERN || 'hermes gateway run';
const ROUTER_PROCESS_PATTERN = process.env.MIMOOPS_ROUTER_PROCESS_PATTERN || '9router';

async function run(command, args = [], timeout = 2500) {
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
    const response = await fetch(ROUTER_MODELS_URL, { signal: AbortSignal.timeout(2200) });
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
  const healthyCount = [hermes.running, routerProcess.running && router.ok, pressure < 85].filter(Boolean).length;

  return {
    generatedAt: new Date().toISOString(),
    host: os.hostname(),
    overall: healthyCount >= 3 ? 'healthy' : healthyCount === 2 ? 'degraded' : 'alert',
    services: [
      {
        name: 'Hermes Gateway',
        status: hermes.running ? 'Healthy' : 'Missing',
        value: hermes.running ? 'online' : 'down',
        meta: hermes.sample || `Process pattern: ${GATEWAY_PROCESS_PATTERN}`,
        tone: hermes.running ? 'green' : 'amber',
      },
      {
        name: '9Router Models',
        status: router.ok ? 'Synced' : 'Offline',
        value: router.ms ? `${router.ms} ms` : String(router.status),
        meta: routerProcess.running ? 'Local model router process detected' : 'Router process not found',
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
        name: 'VPS Runtime',
        status: pressure < 85 ? 'Stable' : 'Pressure',
        value: `${pressure}%`,
        meta: `Memory ${memory.usedPercent ?? '?'}% / Disk ${disk.label}`,
        tone: pressure < 85 ? 'green' : 'amber',
      },
    ],
    incidents: [
      { time: new Date().toISOString().slice(11, 19), title: 'Live health snapshot generated', detail: 'MiMoOps collected process, router, memory, and disk signals from this VPS.' },
      { time: 'watchdog', title: hermes.running ? 'Gateway process verified' : 'Gateway process missing', detail: hermes.running ? 'Hermes gateway is visible in the process table.' : 'Recovery runbook should restart Hermes gateway and verify logs.' },
      { time: 'router', title: router.ok ? 'Model endpoint responded' : 'Model endpoint unavailable', detail: router.ok ? `Router returned HTTP ${router.status} in ${router.ms} ms.` : `MiMoOps could not reach ${ROUTER_MODELS_URL}.` },
      { time: 'system', title: pressure < 85 ? 'Runtime pressure acceptable' : 'Runtime pressure high', detail: `Current pressure score is ${pressure}%.` },
    ],
  };
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (request, response) => {
  if (request.url === '/api/status') {
    sendJson(response, 200, await statusPayload());
    return;
  }

  if (request.url === '/healthz') {
    sendJson(response, 200, { ok: true, service: 'mimoops-api' });
    return;
  }

  sendJson(response, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MiMoOps API listening on http://0.0.0.0:${PORT}`);
});
