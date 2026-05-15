import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const demoServices = [
  { name: 'Hermes Gateway', status: 'Healthy', value: '99.98%', meta: 'OpenAI-compatible agent gateway', tone: 'green' },
  { name: '9Router Models', status: 'Synced', value: '38 ms', meta: 'MiMo + multi-model routing endpoint', tone: 'blue' },
  { name: 'Cron Watchdog', status: 'Armed', value: '15m', meta: 'Autonomous recovery schedule', tone: 'amber' },
  { name: 'VPS Runtime', status: 'Stable', value: '42%', meta: 'CPU/RAM/disk pressure score', tone: 'green' },
];

const demoIncidents = [
  { time: '22:41:08', title: 'Router health probe failed', detail: 'MiMoOps detected a stale /v1/models response and opened a recovery run.' },
  { time: '22:41:11', title: 'MiMo diagnosis generated', detail: 'Likely process exit after gateway restart. Recommended router warm restart.' },
  { time: '22:41:16', title: 'Self-healing command executed', detail: 'Restarted 9router, verified PID, and replayed model availability check.' },
  { time: '22:41:19', title: 'Service recovered', detail: 'Endpoint returned 200 OK. Incident summary prepared for the operator.' },
];

const capabilities = [
  'Live health checks for AI gateways, routers, cron jobs, and VPS resources',
  'MiMo-powered incident summaries that turn raw terminal logs into decisions',
  'Self-healing runbooks for common agent infrastructure failures',
  'Operator dashboard designed for developers, builders, and high-intensity AI users',
];

function useLiveStatus() {
  const [payload, setPayload] = useState(null);
  const [mode, setMode] = useState('demo');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!ignore) {
          setPayload(data);
          setMode('live');
        }
      } catch {
        if (!ignore) setMode('demo');
      }
    }

    load();
    const timer = setInterval(load, 15000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  return { payload, mode };
}

function App() {
  const { payload, mode } = useLiveStatus();
  const services = payload?.services || demoServices;
  const incidents = payload?.incidents || demoIncidents;
  const generatedAt = useMemo(() => {
    if (!payload?.generatedAt) return 'demo snapshot';
    return new Date(payload.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [payload]);

  return (
    <main>
      <section className="hero shell">
        <nav className="nav">
          <div className="brand"><span /> MiMoOps</div>
          <a href="#dashboard">Live Demo</a>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">Built for Xiaomi MiMo Orbit builders</p>
            <h1>AI-native command center for self-healing developer infrastructure.</h1>
            <p className="lead">
              MiMoOps turns MiMo into an autonomous DevOps operator: monitoring AI gateways,
              explaining failures, executing recovery playbooks, and reporting what happened in plain language.
            </p>
            <div className="actions">
              <a className="button primary" href="#dashboard">Open Dashboard</a>
              <a className="button ghost" href="#architecture">See Architecture</a>
            </div>
            <div className="signalStrip" aria-label="Key metrics">
              <strong>{services.length}</strong><span>services watched</span>
              <strong>{mode === 'live' ? '15s' : '19s'}</strong><span>{mode === 'live' ? 'refresh loop' : 'demo recovery'}</span>
              <strong>24/7</strong><span>agent loop</span>
            </div>
          </div>

          <div className="terminalCard" aria-label="MiMo incident summary preview">
            <div className="terminalHeader"><span /> MiMo Incident Summary</div>
            <pre>{`root@vps:~$ mimoops doctor

mode: ${mode === 'live' ? 'live VPS telemetry' : 'demo simulation'}
status: ${payload?.overall || 'degraded -> recovered'}
host: ${payload?.host || 'mimo-builder-vps'}
mimo: inspect services, explain risk,
      recommend verified runbook

last_check: ${generatedAt}
report: operator-ready summary generated`}</pre>
          </div>
        </div>
      </section>

      <section className="shell dashboard" id="dashboard">
        <div className="sectionTitle">
          <p className="eyebrow">Product demo</p>
          <h2>One screen for monitoring, diagnosis, and recovery.</h2>
        </div>

        <div className="dashboardPanel">
          <div className="panelTop">
            <div>
              <p className="muted">Command Center / {generatedAt}</p>
              <h3>Production AI Ops Overview</h3>
            </div>
            <div className="liveBadge"><span /> {mode === 'live' ? 'Live VPS telemetry' : 'Live simulation'}</div>
          </div>

          <div className="serviceGrid">
            {services.map((service) => (
              <article className={`serviceCard ${service.tone}`} key={service.name}>
                <p>{service.name}</p>
                <strong>{service.value}</strong>
                <span>{service.status}</span>
                <small>{service.meta}</small>
              </article>
            ))}
          </div>

          <div className="opsGrid">
            <div className="timeline">
              <h4>Recovery Timeline</h4>
              {incidents.map((item) => (
                <div className="event" key={`${item.time}-${item.title}`}>
                  <time>{item.time}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="aiPanel">
              <h4>MiMo Operator Brief</h4>
              <p>
                {mode === 'live'
                  ? 'This dashboard is reading real VPS telemetry. MiMoOps can turn these signals into a concise incident brief, then run verified recovery steps for the operator.'
                  : 'The system recovered without human intervention. No token loss, no gateway restart, and no queued jobs were dropped. Suggested next action: pin 9router under a supervised process manager and keep the watchdog at 15 minutes.'}
              </p>
              <div className="commandBox">
                <code>mimoops status --json</code>
                <code>mimoops recover 9router --verify</code>
                <code>mimoops report --send telegram</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell featureSection">
        {capabilities.map((capability, index) => (
          <article className="feature" key={capability}>
            <span>0{index + 1}</span>
            <p>{capability}</p>
          </article>
        ))}
      </section>

      <section className="shell architecture" id="architecture">
        <div>
          <p className="eyebrow">Architecture</p>
          <h2>From raw infrastructure signals to MiMo-guided action.</h2>
          <p>
            MiMoOps is designed as a practical control plane: collectors read service status and logs,
            MiMo generates operator-grade diagnosis, and recovery adapters execute safe runbooks with verification.
          </p>
        </div>
        <div className="flow">
          <span>Collectors</span>
          <span>MiMo Reasoning</span>
          <span>Runbooks</span>
          <span>Operator Report</span>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
