const CRON_API_URL = "https://api.cron-job.org";
const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/logger/testlog?user=bagas",
    cron: {
      masuk: { jobId: "6070729", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070763", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/logger/testlog?user=agung",
    cron: {
      masuk: { jobId: "6070730", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070764", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "Andika Surya",
    email: "13666@gmail.com",
    endpoint: "/api/logger/testlog?user=surya",
    cron: {
      masuk: { jobId: "6070744", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070774", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "M Fadilla",
    email: "13686@gmail.com",
    endpoint: "/api/logger/testlog?user=fadil",
    cron: {
      masuk: { jobId: "6070741", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070775", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "Nauval Fadil",
    email: "13157@gmail.com",
    endpoint: "/api/logger/testlog?user=naufal",
    cron: {
      masuk: { jobId: "6070747", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070771", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/logger/testlog?user=fahmi",
    cron: {
      masuk: { jobId: "6070749", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070772", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "Hasta Adhitama",
    email: "13643@gmail.com",
    endpoint: "/api/logger/testlog?user=hasta",
    cron: {
      masuk: { jobId: "6070737", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070767", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "Andhika Eko",
    email: "13664@gmail.com",
    endpoint: "/api/logger/testlog?user=eko",
    cron: {
      masuk: { jobId: "6070739", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070769", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "Azka MF",
    email: "13706@gmail.com",
    endpoint: "/api/logger/testlog?user=azka",
    cron: {
      masuk: { jobId: "6070750", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070777", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  },
  {
    name: "Vino Alimazt",
    email: "13734@gmail.com",
    endpoint: "/api/logger/testlog?user=vino",
    cron: {
      masuk: { jobId: "6070758", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" },
      pulang: { jobId: "6070776", apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE=" }
    }
  }
];


// ========== Function Utilities ==========

function formatTanggal(date = new Date()) {
  return new Date(date).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase().replace(/\./g, '');
}

async function getCronStatus(cronId, apiKey) {
  try {
    const response = await fetch(`${CRON_API_URL}/jobs/${cronId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.jobDetails) {
      throw new Error('Invalid job details structure');
    }

    return data.jobDetails; // <--- Langsung return bagian jobDetails aja
  } catch (error) {
    console.error('Error fetching cron status:', error);
    throw error;
  }
}

async function toggleBothCrons(acc, enable) {
  const body = { job: { enabled: enable } };

  const requests = [
    fetch(`${CRON_API_URL}/jobs/${acc.cron.masuk.jobId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${acc.cron.masuk.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }),
    fetch(`${CRON_API_URL}/jobs/${acc.cron.pulang.jobId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${acc.cron.pulang.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
  ];

  const responses = await Promise.all(requests);
  if (!responses.every(r => r.ok)) {
    throw new Error('Gagal mengubah status cron');
  }
}

async function updateCronSchedule(acc, jamMasuk, jamPulang) {
  const [jamMasukHours, jamMasukMinutes] = jamMasuk.split(':').map(Number);
  const [jamPulangHours, jamPulangMinutes] = jamPulang.split(':').map(Number);

  const bodyMasuk = {
    job: {
      schedule: {
        timezone: "Asia/Jakarta",
        minutes: [jamMasukMinutes],
        hours: [jamMasukHours],
        mdays: [-1],
        months: [-1],
        wdays: [1,2,3,4,5]
      }
    }
  };
  const bodyPulang = {
    job: {
      schedule: {
        timezone: "Asia/Jakarta",
        minutes: [jamPulangMinutes],
        hours: [jamPulangHours],
        mdays: [-1],
        months: [-1],
        wdays: [1,2,3,4,5]
      }
    }
  };

  const requests = [
    fetch(`${CRON_API_URL}/jobs/${acc.cron.masuk.jobId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${acc.cron.masuk.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyMasuk)
    }),
    fetch(`${CRON_API_URL}/jobs/${acc.cron.pulang.jobId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${acc.cron.pulang.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPulang)
    })
  ];

  const responses = await Promise.all(requests);
  if (!responses.every(r => r.ok)) {
    throw new Error('Gagal update jadwal cron');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");
  const icons = ['fa-user-graduate', 'fa-user-tie', 'fa-user-ninja'];
  let loading = false;

  accounts.forEach((acc, index) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl border-2 border-indigo-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 group hover:-translate-y-2 transform-gpu";

    const randomIcon = icons[index % icons.length];

    card.innerHTML = `
      <div class="flex items-start mb-4">
        <div class="bg-indigo-100 p-3 rounded-xl mr-4 transition-colors group-hover:bg-indigo-200">
          <i class="fas ${randomIcon} text-2xl text-indigo-600"></i>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-indigo-900">${acc.name}</h3>
          <p class="text-indigo-500 mt-1">${acc.email}</p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
          <i class="fas fa-external-link-alt mr-2"></i>Detail
        </span>
      </div>
    `;

    card.onclick = async () => {
      if (loading) return;
      loading = true;

      try {
        card.querySelector('i').className = 'fas fa-spinner fa-spin';

        const [cronMasuk, cronPulang, absensiRes] = await Promise.all([
          getCronStatus(acc.cron.masuk.jobId, acc.cron.masuk.apiKey),
          getCronStatus(acc.cron.pulang.jobId, acc.cron.pulang.apiKey),
          fetch(acc.endpoint).then(res => {
            if (!res.ok) throw new Error(`Gagal fetch endpoint: ${res.status}`);
            return res.text();
          })
        ]);
        
        const semuaAktif = cronMasuk.enabled && cronPulang.enabled;
        
        const jamMasukDefault = cronMasuk.schedule.hours[0] !== -1 ?
          `${String(cronMasuk.schedule.hours[0]).padStart(2, '0')}:${String(cronMasuk.schedule.minutes[0]).padStart(2, '0')}` : "08:00";
        
        const jamPulangDefault = cronPulang.schedule.hours[0] !== -1 ?
          `${String(cronPulang.schedule.hours[0]).padStart(2, '0')}:${String(cronPulang.schedule.minutes[0]).padStart(2, '0')}` : "17:00";


        const formatWaktuLokal = (timestamp) => timestamp ? 
          new Date(timestamp * 1000).toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }) : '-';

        const statusContainer = document.getElementById("cron-status-container");
        statusContainer.innerHTML = `
          <div class="space-y-6 w-full mb-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="bg-white p-4 rounded-xl border-2 border-indigo-100">
                <h4 class="font-semibold text-indigo-500 mb-2">Cron Masuk</h4>
                <p class="${cronMasuk.enabled ? 'text-green-600' : 'text-red-600'} font-bold">${cronMasuk.enabled ? 'AKTIF' : 'NONAKTIF'}</p>
                <p class="text-xs text-gray-500 mt-1">Next: ${formatWaktuLokal(cronMasuk.nextExecution)}</p>
              </div>
              <div class="bg-white p-4 rounded-xl border-2 border-indigo-100">
                <h4 class="font-semibold text-indigo-500 mb-2">Cron Pulang</h4>
                <p class="${cronPulang.enabled ? 'text-green-600' : 'text-red-600'} font-bold">${cronPulang.enabled ? 'AKTIF' : 'NONAKTIF'}</p>
                <p class="text-xs text-gray-500 mt-1">Next: ${formatWaktuLokal(cronPulang.nextExecution)}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-indigo-600 mb-1">Jam Masuk</label>
                <input id="input-jam-masuk" type="time" class="w-full border rounded-lg p-2" value="${jamMasukDefault}">
              </div>
              <div>
                <label class="block text-sm font-semibold text-indigo-600 mb-1">Jam Pulang</label>
                <input id="input-jam-pulang" type="time" class="w-full border rounded-lg p-2" value="${jamPulangDefault}">
              </div>
            </div>

            <div class="flex gap-4 mt-4">
              <button id="save-cron-btn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold">Simpan Jadwal</button>
              <button id="toggle-cron-btn" class="flex-1 ${semuaAktif ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white py-2 rounded-lg font-semibold">
                ${semuaAktif ? 'Nonaktifkan Semua' : 'Aktifkan Semua'}
              </button>
            </div>
          </div>
        `;

        document.getElementById("save-cron-btn").onclick = async () => {
          const jamMasuk = document.getElementById("input-jam-masuk").value;
          const jamPulang = document.getElementById("input-jam-pulang").value;
          try {
            loading = true;
            await updateCronSchedule(acc, jamMasuk, jamPulang);
            alert('Jadwal berhasil diupdate!');
            location.reload();
          } catch (error) {
            alert(error.message);
          } finally {
            loading = false;
          }
        };

        // Event untuk tombol Aktif/Nonaktifkan
        document.getElementById("toggle-cron-btn").onclick = async () => {
          try {
            loading = true;
        
            const enable = !(cronMasuk.enabled && cronPulang.enabled); // ambil dari data yang sudah ada
            await toggleBothCrons(acc, enable);
        
            alert(`Cron Job berhasil ${enable ? 'diaktifkan' : 'dinonaktifkan'}!`);
            location.reload();
          } catch (error) {
            alert(`Error Toggle Cron: ${error.message}`);
          } finally {
            loading = false;
          }
        };


        // ===============================
        // Lanjut Parsing Absensi
        // ===============================

        const parser = new DOMParser();
        const doc = parser.parseFromString(absensiRes, 'text/html');
        const table = doc.querySelector('#swdatatable');
        const rows = table ? table.querySelectorAll('tbody tr') : [];
        const thead = table ? table.querySelector('thead tr') : null;
        let headers = [];
        if (thead) {
          headers = Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim().toUpperCase());
        }

        const tanggalIndex = headers.indexOf('TANGGAL');
        const absenMasukIndex = headers.indexOf('ABSEN MASUK');
        const absenPulangIndex = headers.indexOf('ABSEN PULANG');

        const tanggalHariIni = formatTanggal();
        let status = { masuk: 'Belum Absen', pulang: 'Belum Pulang' };

        rows.forEach(row => {
          const cols = row.querySelectorAll('td, th');
          if (cols.length > Math.max(tanggalIndex, absenMasukIndex, absenPulangIndex) && tanggalIndex !== -1 && absenMasukIndex !== -1 && absenPulangIndex !== -1) {
            const tanggalDiLog = cols[tanggalIndex].textContent.trim().toUpperCase();
            if (tanggalDiLog === tanggalHariIni) {
              const absenMasukText = cols[absenMasukIndex].textContent.trim() || 'Belum Absen';
              status.masuk = absenMasukText.split(' ')[0];
              const jamPulang = cols[absenPulangIndex].textContent.trim();
              status.pulang = jamPulang === '00:00:00' ? 'Belum Pulang' : (jamPulang || 'Belum Pulang');
            }
          }
        });

        const absensiStatusHTML = `
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg border border-indigo-200">
              <div class="flex items-center mb-2">
                <i class="fas ${status.masuk === 'Belum Absen' ? 'fa-times text-red-500' : 'fa-clock text-blue-500'} mr-2"></i>
                <span class="font-semibold">Absen Masuk</span>
              </div>
              <p class="${status.masuk === 'Belum Absen' ? 'text-red-600' : 'text-gray-600'}">${status.masuk}</p>
            </div>

            <div class="bg-white p-4 rounded-lg border border-indigo-200">
              <div class="flex items-center mb-2">
                <i class="fas ${status.pulang === 'Belum Pulang' ? 'fa-times text-orange-500' : 'fa-check text-green-500'} mr-2"></i>
                <span class="font-semibold">Absen Pulang</span>
              </div>
              <p class="${status.pulang === 'Belum Pulang' ? 'text-orange-600' : 'text-gray-600'}">${status.pulang}</p>
            </div>
          </div>
          <div class="mb-4 text-sm text-indigo-500">
            <i class="fas fa-calendar-day mr-2"></i> Pengecekan tanggal: ${tanggalHariIni}
          </div>
        `;

        let riwayatHTML = '';
        if (table) {
          table.classList.add('w-full', 'border-collapse', 'mb-6', 'history-table');
          table.querySelectorAll('th').forEach(th => {
            th.classList.add('bg-indigo-100', 'text-indigo-900', 'px-4', 'py-3', 'border', 'border-indigo-200', 'text-left');
          });
          table.querySelectorAll('td').forEach(td => {
            td.classList.add('px-4', 'py-3', 'border', 'border-indigo-200', 'text-gray-700');
          });
          table.querySelectorAll('tbody tr').forEach(tr => {
            tr.classList.add('hover:bg-indigo-50', 'transition-colors');
          });
          riwayatHTML = table.outerHTML;
        } else {
          riwayatHTML = '<p class="text-center text-indigo-500">Tidak ada riwayat absensi.</p>';
        }


        document.getElementById("dialog-title").textContent = acc.name;
        document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
        document.getElementById("dialog-last").innerHTML = `
          ${absensiStatusHTML}
          <div class="mt-6">
            <h4 class="text-lg font-semibold text-indigo-900 mb-3">
              <i class="fas fa-history mr-2"></i> Riwayat Absensi
            </h4>
            ${riwayatHTML}
          </div>
        `;

        document.getElementById("detail-dialog").showModal();

      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        loading = false;
        card.querySelector('i').className = `fas ${randomIcon}`;
      }
    };

    list.appendChild(card);
  });
});


