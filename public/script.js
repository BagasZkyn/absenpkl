const CRON_API_URL = "https://api.cron-job.org";
const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas",
    cron: {
      jobId: "6056513",
      apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE="
    }
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/agung",
    cron: {
      jobId: "6056513",
      apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE="
    }
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/fahmi",
    cron: {
      jobId: "6056513",
      apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE="
    }
  },
  {
    name: "Andika Surya",
    email: "13666@gmail.com",
    endpoint: "/api/surya",
    cron: {
      jobId: "6056513",
      apiKey: "8FgWf4X2k+tXfq5wHlVintm6zBokMuob0AHPo5FabPE="
    }
  }
];

async function getCronStatus(cronId, apiKey) {
  try {
    const response = await fetch(`${CRON_API_URL}/jobs/${cronId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) throw new Error('API Key tidak valid');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();
    
    // Validasi berdasarkan struktur response baru
    if (!data?.jobDetails) {
      console.error('Response tidak valid:', data);
      throw new Error('Struktur response API tidak valid');
    }

    return data;

  } catch (error) {
    console.error('Error API:', error);
    document.getElementById('cron-error').textContent = error.message;
    document.getElementById('cron-error').classList.remove('hidden');
    setTimeout(() => document.getElementById('cron-error').classList.add('hidden'), 5000);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");
  const icons = ['fa-user-graduate', 'fa-user-tie', 'fa-user-ninja'];

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

    let originalHTML = card.innerHTML;
    let loading = false;

    card.onclick = async () => {
      if (loading) return;
      loading = true;
      
      try {
        // Tampilkan loading
        card.querySelector('i').className = 'fas fa-spinner fa-spin';

        const [endpointRes, cronData] = await Promise.all([
          fetch(acc.endpoint).then(res => res.text()),
          getCronStatus(acc.cron.jobId, acc.cron.apiKey)
        ]);

        // Update dialog content
        document.getElementById("dialog-title").textContent = acc.name;
        document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
        document.getElementById("dialog-last").textContent = endpointRes;

        // Update cron status
        const statusContainer = document.getElementById("cron-status-container");
        if (cronData?.jobDetails) {
          const job = cronData.jobDetails;
          const schedule = job.schedule;
          
          statusContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
              <!-- Status Utama -->
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas ${job.enabled ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'} mr-2"></i>
                  <span class="font-semibold">Status: ${job.enabled ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">${job.title || '-'}</p>
              </div>
              
              <!-- Waktu Eksekusi -->
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas fa-clock text-blue-500 mr-2"></i>
                  <span class="font-semibold">Jadwal</span>
                </div>
                <p class="text-sm text-gray-600">
                  Next: ${new Date(job.nextExecution * 1000).toLocaleString()}<br>
                  Last: ${job.lastExecution ? new Date(job.lastExecution * 1000).toLocaleString() : 'Belum pernah'}
                </p>
              </div>
              
              <!-- Detail Schedule -->
              <div class="p-4 bg-white rounded-lg col-span-2">
                <div class="flex items-center mb-2">
                  <i class="fas fa-calendar-alt text-purple-500 mr-2"></i>
                  <span class="font-semibold">Detail Jadwal</span>
                </div>
                <div class="text-sm text-gray-600">
                  <p>Timezone: ${schedule.timezone}</p>
                  <p>Menit: ${schedule.minutes.join(', ')}</p>
                  <p>Jam: ${schedule.hours[0] === -1 ? 'Setiap jam' : schedule.hours.join(', ')}</p>
                  <p>Hari: ${schedule.mdays[0] === -1 ? 'Setiap hari' : schedule.mdays.join(', ')}</p>
                </div>
              </div>
              
              <!-- Request Detail -->
              <div class="p-4 bg-white rounded-lg col-span-2">
                <div class="flex items-center mb-2">
                  <i class="fas fa-link text-orange-500 mr-2"></i>
                  <span class="font-semibold">Request Detail</span>
                </div>
                <div class="text-sm text-gray-600 break-all">
                  <p>Method: ${job.requestMethod === 0 ? 'GET' : 'POST'}</p>
                  <p>URL: ${job.url}</p>
                  <p>Timeout: ${job.requestTimeout} detik</p>
                  ${job.extendedData?.body ? `<p class="mt-2">Body: <br>${job.extendedData.body}</p>` : ''}
                </div>
              </div>
            </div>
          `;
        } else {
          statusContainer.innerHTML = `
            <div class="p-4 bg-red-100 text-red-700 rounded-lg">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Gagal memuat data cron job
            </div>
          `;
        }

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
