# MiMoOps Command Center

MiMoOps Command Center is an AI-native operations dashboard for monitoring, diagnosing, and recovering developer infrastructure with MiMo-powered reasoning.

It is built for Xiaomi MiMo Orbit builders who run AI agents, model routers, API gateways, schedulers, and automation workflows on VPS or local infrastructure. Instead of leaving operators with raw logs and silent failures, MiMoOps turns infrastructure signals into a clear command center: live service status, incident timeline, risk scoring, recovery runbooks, and operator-ready summaries.

## Submission Snapshot

MiMoOps is not only a static landing page. The MVP includes a React dashboard plus a Node.js telemetry API that reads live VPS/process/runtime signals and feeds them into the UI.

Current proof points:

- Live dashboard for Hermes Gateway, 9Router, watchdog cadence, and VPS runtime pressure.
- Telemetry API at `GET /api/status` with live service, risk, runbook, and proof payloads.
- Recovery timeline showing detection, diagnosis, action, and verification steps.
- MiMo operator brief UI that turns infrastructure status into a human-readable incident summary.
- Screenshot capture script for generating submission proof images.

## Max Tier Strategy

MiMoOps is positioned for a top-tier Xiaomi MiMo Orbit submission by focusing on depth, usefulness, and proof instead of a simple promotional page.

What makes this project aim for the highest tier:

- **Working product surface**: a polished dashboard that can be opened, reviewed, and demoed immediately.
- **Real backend signal**: a Node.js API checks processes, endpoint latency, memory pressure, disk usage, and runtime health.
- **MiMo-native use case**: the product is designed around MiMo reasoning for diagnosis, recovery planning, and operator reporting.
- **Builder relevance**: it solves a real problem for AI agent operators who run gateways, model routers, schedulers, and automation stacks.
- **Evidence-ready submission**: screenshots, local run commands, API output, and proof notes are prepared for reviewer validation.
- **Scalable direction**: the MVP can grow into automated runbook execution, notification delivery, incident memory, and multi-host monitoring.

Reviewer checklist for Max tier consideration:

- Live or local demo URL is available.
- Screenshot proof is included.
- Dashboard is more than static UI; it consumes structured telemetry.
- README explains the MiMo integration path clearly.
- The project has a credible roadmap beyond the initial hackathon build.

## Why MiMoOps

AI productivity tools are becoming operational systems. Developers do not only ask AI to write code; they use AI agents to run tasks, watch services, schedule jobs, and operate infrastructure. When those systems fail, the operator needs fast answers:

- Is the gateway still running?
- Is the model router responding?
- Is the VPS under pressure?
- What failed first?
- What recovery action is safe?
- What should be reported back to the builder?

MiMoOps is a working MVP for that workflow: an AI operations control plane where MiMo can inspect infrastructure, explain failures, propose safe recovery actions, and produce trustworthy reports.

## Features

- **Live infrastructure dashboard** for gateway, model router, watchdog, and runtime pressure.
- **Telemetry API** that checks process status, router latency, memory pressure, and disk usage.
- **Automation score** that summarizes current recovery readiness.
- **Risk matrix** for gateway drift, router latency, and runtime pressure.
- **MiMo operator brief UI** for turning raw signals into human-readable incident explanations.
- **Recovery timeline** that shows detection, diagnosis, action, and verification steps.
- **Runbook console** that previews verified recovery commands such as `mimoops recover 9router --verify`.
- **Demo fallback mode** so the website still looks complete even when the local API is not running.
- **Configurable probes** for adapting MiMoOps to other developer infrastructure.

## Architecture

```text
Collectors -> Telemetry API -> MiMo Reasoning Layer -> Recovery Runbooks -> Operator Report
```

Current MVP:

- React + Vite frontend
- Node.js telemetry API for local/VPS demos
- Vercel serverless API at `api/status.js` for persistent public review links
- Process probes via `pgrep`
- Router probe via `/v1/models`-compatible endpoint
- Runtime probes via `/proc/meminfo` and `df`
- Dashboard fallback data for demo/reviewer environments

Planned MiMo integration:

- Summarize incidents from telemetry and logs
- Recommend safe recovery runbooks
- Generate daily operator reports
- Compare failure patterns across repeated incidents
- Trigger operator notifications through Telegram/Discord/email

## Quick Start

```bash
npm install
npm run build
npm run start:demo
```

Default local URLs:

```text
Web: http://127.0.0.1:5173
API: http://127.0.0.1:8787/api/status
Health: http://127.0.0.1:8787/healthz
```

Current public demo tunnel:

```text
Web: https://goals-retirement-develop-cells.trycloudflare.com
API: https://goals-retirement-develop-cells.trycloudflare.com/api/status
```

Note: the public tunnel uses Cloudflare Quick Tunnel for free review access. The URL can change when the tunnel process restarts.

## Development

Run the API and frontend separately:

```bash
npm run api
npm run dev
```

Build production assets:

```bash
npm run build
npm run preview
```

Capture proof screenshots while the web server is running:

```bash
python3 scripts/capture_screenshots.py
```

Generated screenshots are written to:

```text
/tmp/mimoops-screenshots/mimoops-desktop-hero.png
/tmp/mimoops-screenshots/mimoops-desktop-full.png
/tmp/mimoops-screenshots/mimoops-mobile-full.png
```

## Configuration

Copy the example environment file when you want custom probes:

```bash
cp configs/mimoops.env.example .env
```

Available variables:

```bash
MIMOOPS_PORT=8787
MIMOOPS_WEB_PORT=5173
MIMOOPS_ROUTER_MODELS_URL=http://127.0.0.1:20128/v1/models
MIMOOPS_GATEWAY_PROCESS_PATTERN=hermes gateway run
MIMOOPS_ROUTER_PROCESS_PATTERN=9router
```

## Scripts

```bash
npm run dev        # start frontend dev server
npm run api        # start telemetry API
npm run build      # build production frontend
npm run preview    # preview production build
npm run start:demo # start API + web demo
```

## API Preview

`GET /api/status` returns a dashboard payload:

```json
{
  "generatedAt": "2026-05-15T02:46:01.743Z",
  "host": "builder-vps",
  "overall": "healthy",
  "recoveryScore": 82,
  "services": [
    {
      "name": "Hermes Gateway",
      "status": "Healthy",
      "value": "online",
      "tone": "green"
    }
  ],
  "incidents": [
    {
      "time": "12:35:12",
      "title": "Live health snapshot generated",
      "detail": "MiMoOps collected process, router, memory, and disk signals from this VPS."
    }
  ],
  "runbooks": [
    {
      "command": "mimoops recover 9router --verify",
      "result": "Skipped: router healthy at 35 ms",
      "state": "ready"
    }
  ],
  "risks": [
    {
      "label": "Router latency",
      "score": 4,
      "copy": "Model endpoint answered in 35 ms"
    }
  ],
  "proof": [
    "Live Node telemetry API",
    "Process and endpoint probes",
    "Recovery runbook preview",
    "Operator-ready incident report"
  ]
}
```

## Product Direction

MiMoOps is built for Pro and Max level AI users: developers, builders, and automation-heavy operators who use AI as a core productivity layer. The long-term goal is a full AI operations control plane where MiMo can inspect infrastructure, explain failures, propose fixes, execute verified runbooks, and generate trustworthy reports.

The Max-tier roadmap is intentionally practical:

- **Phase 1: Observe** - collect reliable health, latency, process, memory, disk, and incident signals.
- **Phase 2: Reason** - let MiMo summarize what happened, identify likely root cause, and rank safe actions.
- **Phase 3: Recover** - execute approved runbooks with verification gates and rollback notes.
- **Phase 4: Remember** - build incident memory so repeated failures become faster to diagnose.
- **Phase 5: Coordinate** - deliver operator reports and alerts across team channels.

This keeps the project grounded as a working MVP while showing a credible path toward a larger MiMo-powered operations platform.

## License

MIT
