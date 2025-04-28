// pages/api/bagas.js (Contoh endpoint)
import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

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
  try {
    // Login process
    const loginRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=login', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://absenpkl.stmbksimo.com/',
      },
      body: new URLSearchParams({
        email: '13686@gmail.com',
        password: '13686'
      })
    });

    const loginText = await loginRes.text();
    if (!loginText.toLowerCase().includes('success')) {
      return res.status(401).send('Login gagal. Cek email/password.');
    }

    // Get history
    const { from, to } = getDateRange();
    const historyRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'text/plain, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
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
