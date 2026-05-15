# MiMoOps Command Center

MiMoOps Command Center is an AI-native operations dashboard for monitoring, diagnosing, and recovering developer infrastructure with MiMo-powered reasoning.

It is designed for builders who run AI agents, model routers, API gateways, schedulers, and automation workflows on VPS or local infrastructure. Instead of leaving operators with raw logs and silent failures, MiMoOps turns infrastructure signals into a clear command center: live status, incident timeline, recovery hints, and operator-ready summaries.

## Why MiMoOps

AI productivity tools are becoming operational systems. Developers do not only ask AI to write code; they use AI agents to run tasks, watch services, schedule jobs, and operate infrastructure. When those systems fail, the operator needs fast answers:

- Is the gateway still running?
- Is the model router responding?
- Is the VPS under pressure?
- What failed first?
- What recovery action is safe?
- What should be reported back to the builder?

MiMoOps is a product concept and working MVP for that workflow.

## Features

- **Live infrastructure dashboard** for gateway, model router, watchdog, and runtime pressure.
- **Telemetry API** that checks process status, router latency, memory pressure, and disk usage.
- **MiMo operator brief UI** for turning raw signals into human-readable incident explanations.
- **Recovery timeline** that shows detection, diagnosis, action, and verification steps.
- **Demo fallback mode** so the website still looks complete even when the local API is not running.
- **Configurable probes** for adapting MiMoOps to other developer infrastructure.

## Architecture

```text
Collectors -> Telemetry API -> MiMo Reasoning Layer -> Recovery Runbooks -> Operator Report
```

Current MVP:

- React + Vite frontend
- Node.js telemetry API
- Process probes via `pgrep`
- Router probe via `/v1/models`-compatible endpoint
- Runtime probes via `/proc/meminfo` and `df`

Planned MiMo integration:

- Summarize incidents from telemetry and logs
- Recommend safe recovery runbooks
- Generate daily operator reports
- Compare failure patterns across repeated incidents

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
  "services": [
    {
      "name": "Hermes Gateway",
      "status": "Healthy",
      "value": "online",
      "tone": "green"
    }
  ],
  "incidents": []
}
```

## Product Direction

MiMoOps is built for Pro and Max level AI users: developers, builders, and automation-heavy operators who use AI as a core productivity layer. The long-term goal is a full AI operations control plane where MiMo can inspect infrastructure, explain failures, propose fixes, and generate trustworthy reports.

## License

MIT
