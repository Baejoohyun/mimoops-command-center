export default function handler(_request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({ ok: true, service: 'mimoops-vercel-api' });
}
