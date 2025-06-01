import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';
import moment from 'moment-timezone';

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

// Daftar user
const users = {
  agung: {
    email: '13648@gmail.com',
    password: '13648',
    qrcode: '2025/C709/SW2025-02-25',
    nama: 'Agung'
  },
  azka: {
    email: '13706@gmail.com',
    password: '13706',
    qrcode: '2025/D163/SW2025-02-25',
    nama: 'Azka'
  },
  fadil: {
    email: '13686@gmail.com',
    password: '13686',
    qrcode: '2025/B2BB/SW2025-02-25',
    nama: 'Fadil'
  },
  bagas: {
    email: '13636@gmail.com',
    password: '13636',
    qrcode: '2025/53ECC/SW2025-03-21',
    nama: 'Bagas'
  },
  eko: {
    email: '13664@gmail.com',
    password: '13664',
    qrcode: '2025/909C/SW2025-02-25',
    nama: 'Eko'
  },
  fahmi: {
    email: '13687@gmail.com',
    password: '13687',
    qrcode: '2025/087A/SW2025-02-25',
    nama: 'Fahmi'
  },
  hasta: {
    email: '13643@gmail.com',
    password: '13643',
    qrcode: '2025/9074/SW2025-02-25',
    nama: 'Hasta'
  },
  nauval: {
    email: '13157@gmail.com',
    password: '13157',
    qrcode: '2025/900D/SW2025-02-25',
    nama: 'Nauval'
  },
  surya: {
    email: '13666@gmail.com',
    password: '13666',
    qrcode: '2025/8215/SW2025-02-25',
    nama: 'Surya'
  },
  vino: {
    email: '13734@gmail.com',
    password: '13734',
    qrcode: '2025/59F9/SW2025-02-25',
    nama: 'Vino'
  }
};

export default async function handler(req, res) {
  try {
    const { user } = req.query;
    if (!user || !users[user]) {
      return res.status(400).send('User tidak ditemukan atau tidak valid.');
    }

    const { email, password, qrcode, nama } = users[user];

    // Step 1: Login
    const loginRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=login', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://absenpkl.stmbksimo.com/',
      },
      body: new URLSearchParams({ email, password })
    });

    const loginText = await loginRes.text();
    if (!loginText.toLowerCase().includes('success')) {
      return res.status(401).send('Login gagal. Cek email/password.');
    }

    // Step 2: Absen
    const absenRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=absent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://absenpkl.stmbksimo.com/absent',
      },
      body: new URLSearchParams({
        qrcode,
        latitude: '-7.530607277797366,110.58327667415142',
        radius: '2'
      })
    });

    const absenText = await absenRes.text();

    // Jika absen belum diperbolehkan
    if (absenText.toLowerCase().includes('pulang belum diperbolehkan')) {
      return res.status(200).send(`Absen ditolak: ${absenText}`);
    }

    // Kirim ke WhatsApp hanya jika absen berhasil
    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss');
    const jam = moment().tz('Asia/Jakarta').hour();
    const status = jam >= 6 && jam < 15 ? 'Masuk' : 'Pulang';

    const message = `✅ *Absensi Berhasil*\n\n👤 *Nama* : ${nama}\n⏰ *Waktu* : ${waktu} WIB\n📌 *Status* : ${status}`;

    await fetch('https://go-whatsapp-web-multidevice-production-add9.up.railway.app/send/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64')
      },
      body: JSON.stringify({
        phone: '120363415349017222@g.us',
        message,
        reply_message_id: ''
      })
    });

    res.status(200).send(`Absen response: ${absenText}`);
  } catch (err) {
    console.error('ERROR SAAT ABSEN:', err);
    res.status(500).send('Terjadi kesalahan saat absen.');
  }
}
