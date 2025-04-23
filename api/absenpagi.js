const endpoints = [
  '/api/bagas',
  '/api/agung',
  '/api/fahmi'
  // Tambahkan endpoint lainnya di sini
];

export default async function handler(req, res) {
  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${req.headers.host.startsWith('localhost') ? 'http' : 'https'}://${req.headers.host}${endpoint}`);
      const text = await response.text();
      results.push(`=== ${endpoint} ===\n${text}`);
    } catch (err) {
      results.push(`=== ${endpoint} ===\nERROR: ${err.message}`);
    }
  }

  res.status(200).send(results.join('\n\n'));
}
