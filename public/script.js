const CRON_API_URL = "https://api.cron-job.org";

const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas",
    cron: {
      jobId: "6056513",
      apiKey: CRON_API_KEY // Mengambil dari config.js
    }
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/agung",
    cron: {
      jobId: "6056513", 
      apiKey: CRON_API_KEY
    }
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/fahmi",
    cron: {
      jobId: "6056513",
      apiKey: CRON_API_KEY
    }
  },
  {
    name: "Andika Surya",
    email: "13666@gmail.com",
    endpoint: "/api/surya",
    cron: {
      jobId: "6056513",
      apiKey: CRON_API_KEY
    }
  }
];

// Fungsi untuk mendapatkan status cron
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
    
    if (!data?.jobDetails) {
      console.error('Response tidak valid:', data);
      throw new Error('Struktur response API tidak valid');
    }

    return data;

  } catch (error) {
    console.error('Error API:', error);
    showToast(error.message, 'error');
    return null;
  }
}

// Fungsi update cron job
async function updateCronJob(jobId, apiKey, updateData) {
  try {
    const response = await fetch(`${CRON_API_URL}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.status === 401) throw new Error('API Key tidak valid');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

// Fungsi tampilkan notifikasi
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
    type === 'error' ? 'bg-red-500' : 
    type === 'success' ? 'bg-green-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");
  const icons = ['fa-user-graduate', 'fa-user-tie', 'fa-user-ninja'];

  // Render kartu akun
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
          
          statusContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-white rounded-lg col-span-2">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <i class="fas ${job.enabled ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'} mr-2"></i>
                    <span class="font-semibold">Status: ${job.enabled ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  <button 
                    id="toggle-cron-status" 
                    class="px-3 py-1 text-sm ${job.enabled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded-lg"
                    data-job-id="${acc.cron.jobId}"
                    data-api-key="${acc.cron.apiKey}"
                    data-current-status="${job.enabled}"
                  >
                    ${job.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-gray-600">Next Run: ${new Date(job.nextExecution * 1000).toLocaleString()}</span>
                  <button 
                    onclick="openScheduleEditor('${acc.cron.jobId}', '${acc.cron.apiKey}', ${JSON.stringify(job.schedule.hours)})" 
                    class="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg"
                  >
                    <i class="fas fa-edit mr-2"></i>Edit Jadwal
                  </button>
                </div>
              </div>
              
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas fa-clock text-blue-500 mr-2"></i>
                  <span class="font-semibold">Jadwal Saat Ini</span>
                </div>
                <p class="text-sm text-gray-600">
                  ${job.schedule.hours.map(h => `${h}:00`).join(', ')}
                </p>
              </div>
              
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas fa-history text-purple-500 mr-2"></i>
                  <span class="font-semibold">Terakhir Dieksekusi</span>
                </div>
                <p class="text-sm text-gray-600">
                  ${job.lastExecution ? new Date(job.lastExecution * 1000).toLocaleString() : 'Belum pernah'}
                </p>
              </div>
            </div>
          `;
        }

        document.getElementById("detail-dialog").showModal();
      } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
      } finally {
        loading = false;
        card.querySelector('i').className = `fas ${randomIcon}`;
      }
    };

    list.appendChild(card);
  });

  // Handle toggle status
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'toggle-cron-status') {
      const jobId = e.target.dataset.jobId;
      const apiKey = e.target.dataset.apiKey;
      const currentStatus = e.target.dataset.currentStatus === 'true';
      
      try {
        const result = await updateCronJob(jobId, apiKey, {
          job: { enabled: !currentStatus }
        });
        
        if (result) {
          showToast('Status berhasil diupdate!', 'success');
          setTimeout(() => location.reload(), 1000); // Refresh data
        }
      } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
      }
    }
  });
});

// Fungsi edit jadwal
function openScheduleEditor(jobId, apiKey, currentSchedule) {
  document.getElementById('edit-jobId').value = jobId;
  document.getElementById('edit-apiKey').value = apiKey;
  
  const form = document.getElementById('schedule-form');
  
  // Pagi - ambil jadwal pertama
  const [morningHour, morningMinute] = currentSchedule.hours.length > 0 ? 
    [currentSchedule.hours[0], currentSchedule.minutes[0]] : 
    [7, 0];
    
  // Sore - ambil jadwal kedua
  const [afternoonHour, afternoonMinute] = currentSchedule.hours.length > 1 ? 
    [currentSchedule.hours[1], currentSchedule.minutes[1]] : 
    [16, 0];

  form.elements['morning-hour'].value = morningHour;
  form.elements['morning-minute'].value = morningMinute;
  form.elements['afternoon-hour'].value = afternoonHour;
  form.elements['afternoon-minute'].value = afternoonMinute;
  
  document.getElementById('schedule-dialog').showModal();
}

// Handle form submit
document.getElementById('schedule-form').onsubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const jobId = formData.get('jobId');
  const apiKey = formData.get('apiKey');
  const morning = formData.get('morning');
  const afternoon = formData.get('afternoon');

  const schedule = {
    timezone: 'Asia/Jakarta',
    minutes: [0],
    hours: [parseInt(morning), parseInt(afternoon)],
    mdows: [-1],
    months: [-1],
    mdays: [-1]
  };

  try {
    const result = await updateCronJob(jobId, apiKey, {
      job: { schedule }
    });
    
    if (result) {
      document.getElementById('schedule-dialog').close();
      showToast('Jadwal berhasil diupdate!', 'success');
      setTimeout(() => location.reload(), 1000); // Refresh data
    }
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
  }
};
