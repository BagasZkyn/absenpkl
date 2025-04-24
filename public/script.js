const CRON_API_URL = "https://api.cron-job.org";

const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas",
    cron: {
      jobId: "6056513",
      apiKey: "wEQWzgMOWtDUoqf2ukcmFP3vhOVQATgDxObmHigmc74"
    }
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/agung",
    cron: {
      jobId: "6056513",
      apiKey: "wEQWzgMOWtDUoqf2ukcmFP3vhOVQATgDxObmHigmc74"
    }
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/fahmi",
    cron: {
      jobId: "6056513",
      apiKey: "wEQWzgMOWtDUoqf2ukcmFP3vhOVQATgDxObmHigmc74"
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

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (!data || data.kind !== "Response#Job") throw new Error("Invalid API response structure");

    return data;

  } catch (error) {
    console.error('Cron API Error:', error);
    const errDiv = document.getElementById('cron-error');
    errDiv.textContent = `Error: ${error.message}`;
    errDiv.classList.remove('hidden');
    setTimeout(() => errDiv.classList.add('hidden'), 5000);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");

  accounts.forEach((acc) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl border-2 border-indigo-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 group hover:-translate-y-2 transform-gpu";

    const icons = ['fa-user-graduate', 'fa-user-tie', 'fa-user-ninja'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

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
      const originalHTML = card.innerHTML;

      card.innerHTML = `
        <div class="h-full flex items-center justify-center py-8">
          <i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i>
        </div>
      `;

      try {
        const [endpointRes, cronStatus] = await Promise.allSettled([
          fetch(acc.endpoint).then(res => res.text()),
          getCronStatus(acc.cron.jobId, acc.cron.apiKey)
        ]);

        if (endpointRes.status === 'fulfilled') {
          document.getElementById("dialog-title").textContent = acc.name;
          document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
          document.getElementById("dialog-last").textContent = endpointRes.value;
        } else {
          throw new Error("Gagal mengambil data dari endpoint.");
        }

        const statusContainer = document.getElementById("cron-status-container");
        if (cronStatus.status === 'fulfilled' && cronStatus.value?.job) {
          const job = cronStatus.value.job;
          statusContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas ${job.enabled ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'} mr-2"></i>
                  <span class="font-semibold">Status: ${job.enabled ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">${job.title}</p>
              </div>
              
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-2">
                  <i class="fas fa-history text-blue-500 mr-2"></i>
                  <span class="font-semibold">Eksekusi Terakhir</span>
                </div>
                <p class="text-sm text-gray-600">${new Date(job.lastExecutionDate).toLocaleString() || 'Belum pernah'}</p>
              </div>
              
              <div class="p-4 bg-white rounded-lg col-span-2">
                <div class="flex items-center mb-2">
                  <i class="fas fa-link text-purple-500 mr-2"></i>
                  <span class="font-semibold">Target URL</span>
                </div>
                <code class="text-sm break-all">${job.url}</code>
              </div>
            </div>
          `;
        } else {
          statusContainer.innerHTML = `
            <div class="p-4 bg-red-100 text-red-700 rounded-lg">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Gagal memuat status cron job
            </div>
          `;
        }

        document.getElementById("detail-dialog").showModal();
      } catch (e) {
        alert(`Terjadi kesalahan: ${e.message}`);
        console.error(e);
      }

      card.innerHTML = originalHTML;
      loading = false;
    };

    list.appendChild(card);
  });
});
