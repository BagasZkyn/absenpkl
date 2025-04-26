import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';
import { parse } from 'node-html-parser';

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

export default async function handler(req, res) {
  try {
    // Step 1: Login
    const loginRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=login', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://absenpkl.stmbksimo.com/',
      },
      body: new URLSearchParams({
        email: '13636@gmail.com',
        password: '13636'
      })
    });

    const loginText = await loginRes.text();
    if (!loginText.toLowerCase().includes('success')) {
      return res.status(401).send('Login gagal. Cek email/password.');
    }

    // Step 2: Ambil History Absen
    const historyRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'text/plain, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://absenpkl.stmbksimo.com/history',
      },
      body: new URLSearchParams({
        from: '',
        to: '26-04-2025'
      })
    });

    const historyText = await historyRes.text();
    
    // Step 3: Parse HTML untuk ambil absen masuk dan pulang terbaru
    const root = parse(historyText);
    const rows = root.querySelectorAll('tr');

    if (rows.length < 2) {
      return res.status(404).send('Data history tidak ditemukan.');
    }

    // Ambil baris pertama setelah header
    const firstDataRow = rows[1];
    const columns = firstDataRow.querySelectorAll('td');

    if (columns.length < 5) {
      return res.status(404).send('Format data history tidak sesuai.');
    }

    const tanggal = columns[1]?.innerText.trim();
    const absenMasuk = columns[2]?.innerText.trim();
    const absenPulang = columns[3]?.innerText.trim();

    res.status(200).json({
      tanggal,
      absenMasuk,
      absenPulang
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan saat mengambil history absen.');
  }
}
