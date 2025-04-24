const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas",
    cronId: "6056513",
    cronApiKey: "wEQWzgMOWtDUoqf2ukcmFP3vhOVQATgDxObmHigmc74="
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/agung",
    cronId: "6056513",
    cronApiKey: "wEQWzgMOWtDUoqf2ukcmFP3vhOVQATgDxObmHigmc74="
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/fahmi",
    cronId: "6056513",
    cronApiKey: "wEQWzgMOWtDUoqf2ukcmFP3vhOVQATgDxObmHigmc74="
  }
];

async function getCronStatus(cronId, apiKey) {
  try {
    const response = await fetch(`https://api.cron-job.org/jobs/${cronId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching cron status:', error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");

  accounts.forEach((acc) => {
    const card = document.createElement("div");
    const icons = ['fa-user-graduate', 'fa-user-tie', 'fa-user-ninja'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    card.className = "bg-white rounded-2xl border-2 border-indigo-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 group hover:-translate-y-2 transform-gpu";

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
        const [endpointRes, cronStatus] = await Promise.all([
          fetch(acc.endpoint).then(res => res.text()),
          getCronStatus(acc.cronId, acc.cronApiKey)
        ]);

        document.getElementById("dialog-title").textContent = acc.name;
        document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
        document.getElementById("dialog-last").textContent = endpointRes;

        const cronContainer = document.getElementById("cron-status-container");
        if (cronStatus && cronStatus.job) {
          cronContainer.innerHTML = `
            <div class="bg-white p-4 rounded-lg flex items-center">
              <div class="mr-4 text-2xl ${cronStatus.job.enabled ? 'text-green-500' : 'text-red-500'}">
                <i class="fas ${cronStatus.job.enabled ? 'fa-check-circle' : 'fa-times-circle'}"></i>
              </div>
              <div>
                <p class="font-semibold">Status: ${cronStatus.job.enabled ? 'Aktif' : 'Nonaktif'}</p>
                <p class="text-sm text-gray-500">Terakhir dijalankan: ${new Date(cronStatus.job.lastExecution).toLocaleString()}</p>
                <p class="text-sm text-gray-500">Jadwal berikutnya: ${new Date(cronStatus.job.nextExecution).toLocaleString()}</p>
              </div>
            </div>
            <div class="bg-white p-4 rounded-lg">
              <div class="flex items-center mb-2">
                <i class="fas fa-link text-gray-500 mr-2"></i>
                <span class="font-medium">Endpoint:</span>
              </div>
              <code class="text-sm break-all">${cronStatus.job.url}</code>
            </div>`;
        } else {
          cronContainer.innerHTML = `<div class="text-red-500 p-4 bg-white rounded-lg">
            <i class="fas fa-exclamation-triangle mr-2"></i>Gagal memuat status cron job
          </div>`;
        }

        document.getElementById("detail-dialog").showModal();
      } catch (e) {
        alert("Gagal mengambil data");
      }

      card.innerHTML = originalHTML;
      loading = false;
    };

    list.appendChild(card);
  });
});
