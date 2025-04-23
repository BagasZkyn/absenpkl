import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

// Fungsi untuk memproses absen per akun
async function processAccount(account) {
  const jar = new CookieJar();
  const fetchWithCookies = fetchCookie(fetch, jar);
  
  try {
    // Login
    const loginRes = await fetchWithCookies(
      'https://absenpkl.stmbksimo.com/sw-proses?action=login',
      {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
          Referer: 'https://absenpkl.stmbksimo.com/',
        },
        body: new URLSearchParams({
          email: account.email,
          password: account.password,
        }),
      }
    );

    const loginText = await loginRes.text();
    if (!loginText.toLowerCase().includes('success')) {
      return { status: 'error', account: account.email, message: 'Login gagal' };
    }

    // Absen
    const absenRes = await fetchWithCookies(
      'https://absenpkl.stmbksimo.com/sw-proses?action=absent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
          Referer: 'https://absenpkl.stmbksimo.com/absent',
        },
        body: new URLSearchParams({
          qrcode: account.qrcode,
          latitude: '-7.530607277797366,110.58327667415142',
          radius: '2',
        }),
      }
    );

    const absenText = await absenRes.text();
    return { status: 'success', account: account.email, response: absenText };
  } catch (err) {
    return { status: 'error', account: account.email, message: err.message };
  }
}

export default async function handler(req, res) {
  // Daftar akun yang akan diproses
  const accounts = [
    {
      email: '13636@gmail.com',
      password: '13636',
      qrcode: '2025/53ECC/SW2025-03-21',
    },
    {
      email: '13648@gmail.com',
      password: '13648',
      qrcode: '2025/C709/SW2025-02-25',
    }
  ];

  try {
    // Proses semua akun secara paralel
    const results = await Promise.all(
      accounts.map((account) => processAccount(account))
    );

    // Format response
    const response = {
      total: accounts.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'error').length,
      details: results,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses semua akun' });
  }
          
