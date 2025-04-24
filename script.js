document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("account-list");
  const icons = ['fa-user-graduate', 'fa-user-tie', 'fa-user-ninja'];
  
  try {
    // Muat data akun dari file JSON
    const response = await fetch('/accounts.json');
    const accounts = await response.json();

    // Handle error jaringan
    if (!response.ok) {
      throw new Error(`Gagal memuat data akun (${response.status})`);
    }

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

      let loading = false;
      const originalIcon = card.querySelector('i').className;

      card.onclick = async () => {
        if (loading) return;
        loading = true;
        
        try {
          // Tampilkan loading spinner
          card.querySelector('i').className = 'fas fa-spinner fa-spin';

          // Ambil data endpoint dan cron status
          const [endpointRes, cronRes] = await Promise.all([
            fetch(acc.endpoint).then(r => r.text()),
            fetch(`/api/cron-status?jobId=${acc.cronJobId}`)
          ]);

          // Handle error cron status
          if (!cronRes.ok) {
            throw new Error(`Gagal mengambil status cron (${cronRes.status})`);
          }

          const cronData = await cronRes.json();
          
          // Update dialog content
          document.getElementById("dialog-title").textContent = acc.name;
          document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
          document.getElementById("dialog-last").textContent = endpointRes;

          // Update cron status display
          const statusContainer = document.getElementById("cron-status-container");
          if (cronData?.jobDetails) {
            const job = cronData.jobDetails;
            statusContainer.innerHTML = `
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-white rounded-lg">
                  <div class="flex items-center mb-2">
                    <i class="fas ${job.enabled ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'} mr-2"></i>
                    <span class="font-semibold">Status: ${job.enabled ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">${job.title || '-'}</p>
                </div>
                
                <div class="p-4 bg-white rounded-lg">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-clock text-blue-500 mr-2"></i>
                    <span class="font-semibold">Jadwal</span>
                  </div>
                  <p class="text-sm text-gray-600">
                    Berikutnya: ${new Date(job.nextExecution * 1000).toLocaleString()}<br>
                    Terakhir: ${job.lastExecution ? new Date(job.lastExecution * 1000).toLocaleString() : 'Belum pernah'}
                  </p>
                </div>
                
                <div class="p-4 bg-white rounded-lg col-span-2">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-link text-purple-500 mr-2"></i>
                    <span class="font-semibold">Target Endpoint</span>
                  </div>
                  <code class="text-sm break-all">${job.url}</code>
                </div>
              </div>
            `;
          } else {
            statusContainer.innerHTML = `
              <div class="p-4 bg-red-100 text-red-700 rounded-lg">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Data cron job tidak valid
              </div>
            `;
          }

          document.getElementById("detail-dialog").showModal();
        } catch (error) {
          console.error('Error:', error);
          alert(`Error: ${error.message}`);
        } finally {
          loading = false;
          card.querySelector('i').className = originalIcon;
        }
      };

      list.appendChild(card);
    });

  } catch (error) {
    console.error('Gagal memuat data:', error);
    list.innerHTML = `
      <div class="col-span-3 p-8 bg-red-50 text-red-700 rounded-xl text-center">
        <i class="fas fa-exclamation-triangle text-3xl mb-4"></i>
        <h2 class="text-xl font-bold mb-2">Gagal Memuat Data Akun</h2>
        <p>${error.message}</p>
        <p class="text-sm mt-2">Cek koneksi internet atau hubungi administrator</p>
      </div>
    `;
  }
})
