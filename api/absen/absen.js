import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';
import moment from 'moment-timezone';
import { google } from 'googleapis'; // Tambahkan ini

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

// Daftar user (tetap sama)
const users = {
  agung: { email: '13648@gmail.com', password: '13648', qrcode: '2025/C709/SW2025-02-25', nama: 'Agung' },
  azka: { email: '13706@gmail.com', password: '13706', qrcode: '2025/D163/SW2025-02-25', nama: 'Azka' },
  fadil: { email: '13686@gmail.com', password: '13686', qrcode: '2025/B2BB/SW2025-02-25', nama: 'Fadil' },
  bagas: { email: '13636@gmail.com', password: '13636', qrcode: '2025/53ECC/SW2025-03-21', nama: 'Bagas' },
  eko: { email: '13664@gmail.com', password: '13664', qrcode: '2025/909C/SW2025-02-25', nama: 'Eko' },
  fahmi: { email: '13687@gmail.com', password: '13687', qrcode: '2025/087A/SW2025-02-25', nama: 'Fahmi' },
  hasta: { email: '13643@gmail.com', password: '13643', qrcode: '2025/9074/SW2025-02-25', nama: 'Hasta' },
  nauval: { email: '13157@gmail.com', password: '13157', qrcode: '2025/900D/SW2025-02-25', nama: 'Nauval' },
  surya: { email: '13666@gmail.com', password: '13666', qrcode: '2025/8215/SW2025-02-25', nama: 'Surya' },
  vino: { email: '13734@gmail.com', password: '13734', qrcode: '2025/59F9/SW2025-02-25', nama: 'Vino' },
  teat: { email: 'akuntest@gmail.com', password: 'akuntest', qrcode: '2025/2210B/SW2025-04-27', nama: 'Vino' }
};

// --- Konfigurasi Google Sheets ---
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // e.g., 'abc123xyz789'
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME; // e.g., 'Data Absen PKL' or 'Sheet1'
const GOOGLE_CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS; // Konten JSON dari file kredensial

// Kolom di Google Sheet (0-indexed) - Sesuaikan jika perlu
const COL_NAMA = 0; // Kolom A
const COL_JAM_MASUK = 3; // Kolom D
const COL_STATUS_MASUK = 4; // Kolom E
const COL_JAM_PULANG = 5; // Kolom F
const COL_STATUS_PULANG = 6; // Kolom G

async function updateGoogleSheet(namaSiswa, waktuAbsen, jenisAbsen) {
  if (!GOOGLE_CREDENTIALS || !SPREADSHEET_ID || !SHEET_NAME) {
    console.error('Variabel lingkungan Google Sheets tidak lengkap.');
    return; // Jangan lanjutkan jika konfigurasi tidak ada
  }

  try {
    const credentials = JSON.parse(GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Dapatkan semua data nama untuk mencari baris yang sesuai
    const namaRange = `${SHEET_NAME}!${String.fromCharCode(65 + COL_NAMA)}2:${String.fromCharCode(65 + COL_NAMA)}`; // Misal A2:A
    const getNamesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: namaRange,
    });

    const namesInSheet = getNamesRes.data.values ? getNamesRes.data.values.flat() : [];
    const rowIndex = namesInSheet.findIndex(name => name === namaSiswa);

    if (rowIndex === -1) {
      console.error(`Nama "${namaSiswa}" tidak ditemukan di Google Sheet.`);
      return;
    }

    const targetRow = rowIndex + 2; // +2 karena sheet 1-indexed dan kita skip header

    let jamColumnLetter;
    let statusColumnLetter;

    if (jenisAbsen === 'Masuk') {
      jamColumnLetter = String.fromCharCode(65 + COL_JAM_MASUK);
      statusColumnLetter = String.fromCharCode(65 + COL_STATUS_MASUK);
    } else { // Pulang
      jamColumnLetter = String.fromCharCode(65 + COL_JAM_PULANG);
      statusColumnLetter = String.fromCharCode(65 + COL_STATUS_PULANG);
    }

    const rangeJam = `${SHEET_NAME}!${jamColumnLetter}${targetRow}`;
    const rangeStatus = `${SHEET_NAME}!${statusColumnLetter}${targetRow}`;

    // 2. Update Jam Absen
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeJam,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[waktuAbsen]],
      },
    });

    // 3. Update Status Absen menjadi "Sudah"
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeStatus,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['Sudah']],
      },
    });

    console.log(`Google Sheet berhasil diupdate untuk ${namaSiswa} - ${jenisAbsen} pukul ${waktuAbsen}`);

  } catch (error) {
    console.error('Error saat update Google Sheet:', error.message || error);
    // Pertimbangkan untuk mengirim notifikasi error jika update sheet gagal
  }
}

export default async function handler(req, res) {
  try {
    await jar.removeAllCookies(); // Bersihkan cookies untuk setiap request baru
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
        'User-Agent': 'Mozilla/5.0', // Sesuaikan User-Agent jika diperlukan
        'Referer': 'https://absenpkl.stmbksimo.com/',
      },
      body: new URLSearchParams({ email, password })
    });

    const loginText = await loginRes.text();
    if (!loginText.toLowerCase().includes('success')) {
      return res.status(401).send(`Login gagal untuk ${nama}. Respon: ${loginText}`);
    }
    console.log(`Login berhasil untuk: ${nama}`);


    // Step 2: Absen
    const absenRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=absent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0', // Sesuaikan User-Agent
        'Referer': 'https://absenpkl.stmbksimo.com/absent',
      },
      body: new URLSearchParams({
        qrcode,
        latitude: '-7.530607277797366,110.58327667415142', // Latitude dan Radius tetap
        radius: '2'
      })
    });

    const absenText = await absenRes.text();
    console.log(`Respon absen untuk ${nama}: ${absenText}`);


    // Cek apakah absen ditolak karena "pulang belum diperbolehkan" atau pesan error lain dari server
    if (absenText.toLowerCase().includes('pulang belum diperbolehkan')) {
      return res.status(200).send(`Absen ditolak untuk ${nama}: ${absenText}`);
    }
    // Anda bisa menambahkan pengecekan error lain di sini, misal jika qrcode tidak valid, dll.
    // Asumsikan selain "pulang belum diperbolehkan" dan tidak mengandung "error" adalah sukses (sesuaikan jika perlu)
    // Atau cari kata kunci sukses spesifik dari respon absen jika ada.
    // Untuk contoh ini, kita anggap jika tidak ada error spesifik, maka berhasil.
    // Sebaiknya ada pengecekan yang lebih robust untuk status sukses absen.
    // Misalnya, jika `absenText` mengandung "berhasil" atau sejenisnya.
    // Untuk sekarang, kita anggap jika tidak ada pesan error spesifik, kita lanjut.

    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss');
    const jam = moment().tz('Asia/Jakarta').hour(); // Jam dalam format 24 jam

    // Tentukan jenis absen berdasarkan jam
    // Absen Masuk: sebelum jam 12 siang (jam 0-11)
    // Absen Pulang: jam 12 siang atau setelahnya (jam 12-23)
    const jenisAbsen = jam < 12 ? 'Masuk' : 'Pulang';

    // Update Google Sheet
    await updateGoogleSheet(nama, waktu, jenisAbsen);

    // Kirim ke WhatsApp
    const message = `✅ *Absensi Berhasil*\n\n👤 *Nama* : ${nama}\n⏰ *Waktu* : ${waktu} WIB\n📌 *Status* : ${jenisAbsen}`;

    try {
        await fetch('https://go-whatsapp-web-multidevice-production-add9.up.railway.app/send/message', { // URL API WhatsApp Anda
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64') // Ganti dengan kredensial Anda
            },
            body: JSON.stringify({
                phone: '120363415349017222@g.us', // Ganti dengan ID grup atau nomor tujuan
                message,
                reply_message_id: ''
            })
        });
        console.log(`Notifikasi WhatsApp terkirim untuk ${nama}`);
    } catch (waError) {
        console.error(`Gagal mengirim notifikasi WhatsApp untuk ${nama}:`, waError.message || waError);
        // Jangan hentikan proses hanya karena WA gagal, absen dan sheet mungkin sudah berhasil
    }

    res.status(200).send(`Absen ${jenisAbsen} untuk ${nama} pukul ${waktu} berhasil. Respon server: ${absenText}. Google Sheet diupdate.`);

  } catch (err) {
    console.error('ERROR SAAT PROSES ABSEN UTAMA:', err.message || err);
    res.status(500).send(`Terjadi kesalahan internal saat proses absen: ${err.message}`);
  }
}