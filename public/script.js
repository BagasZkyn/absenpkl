const CRON_API_URL = "https://api.cron-job.org";

const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas",
    cron: { jobId: "6056513", apiKey: CRON_API_KEY }
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/agung",
    cron: { jobId: "6056513", apiKey: CRON_API_KEY }
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/fahmi",
    cron: { jobId: "6056513", apiKey: CRON_API_KEY }
  },
  {
    name: "Andika Surya",
    email: "13666@gmail.com",
    endpoint: "/api/surya",
    cron: { jobId: "6056513", apiKey: CRON_API_KEY }
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
    if (!data?.jobDetails) throw new Error('Struktur response API tidak valid');
    return data;

  } catch (error) {
    showToast(error.message, 'error');
    return null;
  }
}

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

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

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

        document.getElementById("dialog-title").textContent = acc.name;
        document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
        document.getElementById("dialog-last").textContent = endpointRes;

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
                    onclick="openScheduleEditor('${acc.cron.jobId}', '${acc.cron.apiKey}', ${JSON.stringify(job.schedule)})" 
                    class="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg"
                  >
                    <i class="fas fa-edit mr-2"></i>Edit Jadwal
                  </button>
                </div>
              </div>
              
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas fa-calendar-alt text-purple-500 mr-2"></i>
                  <span class="font-semibold">Hari Kerja</span>
                </div>
                <p class="text-sm text-gray-600">Senin - Jumat</p>
              </div>
              
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas fa-clock text-blue-500 mr-2"></i>
                  <span class="font-semibold">Jam Absen</span>
                </div>
                <p class="text-sm text-gray-600">
                  Pagi: ${job.schedule.hours[0]}:${String(job.schedule.minutes[0]).padStart(2, '0')}<br>
                  Sore: ${job.schedule.hours[1]}:${String(job.schedule.minutes[1]).padStart(2, '0')}
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

  document.addEventListener('click', async (e) => {
    if (e.target.id === 'toggle-cron-status') {
      const jobId = e.target.dataset.jobId;
      const apiKey = e.target.dataset.apiKey;
      const currentStatus = e.target.dataset.currentStatus === 'true';
      
      try {
        await updateCronJob(jobId, apiKey, { job: { enabled: !currentStatus } });
        showToast('Status berhasil diupdate!', 'success');
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
      }
    }
  });
});

function openScheduleEditor(jobId, apiKey, currentSchedule) {
  document.getElementById('edit-jobId').value = jobId;
  document.getElementById('edit-apiKey').value = apiKey;
  
  const form = document.getElementById('schedule-form');
  form.elements['morning-hour'].value = currentSchedule.hours[0] || 7;
  form.elements['morning-minute'].value = currentSchedule.minutes[0] || 0;
  form.elements['afternoon-hour'].value = currentSchedule.hours[1] || 16;
  form.elements['afternoon-minute'].value = currentSchedule.minutes[1] || 0;
  
  document.getElementById('schedule-dialog').showModal();
}

document.getElementById('schedule-form').onsubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const schedule = {
    timezone: 'Asia/Jakarta',
    minutes: [
      parseInt(formData.get('morning-minute')),
      parseInt(formData.get('afternoon-minute'))
    ],
    hours: [
      parseInt(formData.get('morning-hour')),
      parseInt(formData.get('afternoon-hour'))
    ],
    mdows: [1,2,3,4,5],
    months: [-1],
    mdays: [-1]
  };

  try {
    await updateCronJob(
      formData.get('jobId'),
      formData.get('apiKey'),
      { job: { schedule }
    );
    document.getElementById('schedule-dialog').close();
    showToast('Jadwal berhasil diupdate!', 'success');
    setTimeout(() => location.reload(), 1000);
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
  }
};
