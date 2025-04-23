export default async function handler(req, res) {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard Absen</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 text-gray-800">
    <div class="max-w-3xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Dashboard Absen</h1>
      <ul id="akunList" class="space-y-2">
        ${akunList.map(akun => `
          <li class="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer" onclick="showInfo('${akun.endpoint}', '${akun.nama}', '${akun.email}')">
            <div class="font-semibold">${akun.nama}</div>
            <div class="text-sm text-gray-500">${akun.email}</div>
          </li>
        `).join('')}
      </ul>
    </div>

    <div id="dialog" class="fixed inset-0 hidden bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 id="dialogNama" class="text-xl font-bold mb-2"></h2>
        <p id="dialogEmail" class="text-sm text-gray-500 mb-4"></p>
        <pre id="dialogResponse" class="text-sm bg-gray-100 p-2 rounded overflow-x-auto"></pre>
        <button onclick="closeDialog()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Tutup</button>
      </div>
    </div>

    <script>
      function closeDialog() {
        document.getElementById("dialog").classList.add("hidden");
      }

      async function showInfo(endpoint, nama, email) {
        document.getElementById("dialog").classList.remove("hidden");
        document.getElementById("dialogNama").innerText = nama;
        document.getElementById("dialogEmail").innerText = email;

        try {
          const res = await fetch(endpoint);
          const text = await res.text();
          document.getElementById("dialogResponse").innerText = text;
        } catch (err) {
          document.getElementById("dialogResponse").innerText = "Gagal mengambil data.";
        }
      }
    </script>
  </body>
  </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}

const akunList = [
  {
    nama: "Nathan Kanaeru",
    email: "13636@gmail.com",
    endpoint: "/api/absen"
  },
  {
    nama: "Rizky Saputra",
    email: "13648@gmail.com",
    endpoint: "/api/absen2"
  },
  // Tambah akun lain di sini
];
