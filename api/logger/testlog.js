import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

// Mapping akun berdasarkan username
const accounts = {
  bagas: { email: '13636@gmail.com', password: '13636' },
  agung: { email: '13648@gmail.com', password: '13648' },
  surya: { email: '13666@gmail.com', password: '13666' },
  fadil: { email: '13686@gmail.com', password: '13686' },
  hasta: { email: '13643@gmail.com', password: '13643' },
  eko: { email: '13664@gmail.com', password: '13664' },
  nauval: { email: '13157@gmail.com', password: '13157' },
  fahmi: { email: '13687@gmail.com', password: '13687' },
  azka: { email: '13706@gmail.com', password: '13706' },
  vino: { email: '13734@gmail.com', password: '13734' }
  // ... dan seterusnya
};

function getDateRange() {
  const today = new Date();
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  const format = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return {
    from: format(fiveDaysAgo),
    to: format(today)
  };
}

export default async function handler(req, res) {
  const { user } = req.query; // ambil param user dari query

  if (!user || !accounts[user]) {
    return res.status(400).send('User tidak ditemukan.');
  }

  const { email, password } = accounts[user];

  try {
    // Login
    const loginRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=login', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Referer': 'https://absenpkl.stmbksimo.com/',
      },
      body: new URLSearchParams({ email, password })
    });

    const loginText = await loginRes.text();
    if (!loginText.toLowerCase().includes('success')) {
      return res.status(401).send('Login gagal. Cek email/password.');
    }

    // History
    const { from, to } = getDateRange();
    const historyRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'text/plain, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Referer': 'https://absenpkl.stmbksimo.com/history',
      },
      body: new URLSearchParams({ from, to })
    });

    const historyText = await historyRes.text();
    res.status(200).send(historyText);
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan saat mengambil history.');
  }
}
