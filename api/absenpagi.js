const endpoints = [
  '/api/absen/bagas',
  '/api/absen/agung',
  '/api/absen/fahmi',
  '/api/absen/nauval',
  '/api/absen/fadil',
  '/api/absen/surya',
  '/api/absen/vino',
  '/api/absen/azka'
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
