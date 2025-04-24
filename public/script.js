const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas",
    cronJob: {
      id: "6056513", // Ganti dengan ID sebenarnya
      enabled: true,
      times: ["08:00", "16:00"],
      days: [1, 2, 3, 4, 5] // 1-5 = Senin-Jumat
    }
  }
  // Tambahkan akun lain di sini
];

// Fungsi untuk toggle status job
async function toggleJob(jobId, enabled) {
  try {
    const response = await fetch(`/api/update-cron`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId,
        enabled
      })
    });

    const result = await response.json();
    if (!result.success) {
      alert('Gagal memperbarui status: ' + (result.error || 'Unknown error'));
      document.querySelector(`input[type="checkbox"]`).checked = !enabled;
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Fungsi konversi ke cron schedule
function convertToCronSchedule(times, days) {
  const minutes = '0';
  const hours = times.map(t => t.split(':')[0]).join(',');
  return `${minutes} ${hours} * * ${days.join(',')}`;
}

// Tampilkan form edit
function showEditForm(currentData) {
  const formHtml = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Edit Jadwal</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Jam Pertama:</label>
            <input type="time" id="edit-time1" value="${currentData.times[0]}" 
              class="w-full p-2 border rounded-lg" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Jam Kedua:</label>
            <input type="time" id="edit-time2" value="${currentData.times[1]}" 
              class="w-full p-2 border rounded-lg" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Hari:</label>
            <select id="edit-days" multiple class="w-full p-2 border rounded-lg h-32">
              ${[1, 2, 3, 4, 5].map(d => `
                <option value="${d}" ${currentData.days.includes(d) ? 'selected' : ''}>
                  ${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][d - 1]}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button onclick="this.closest('div').remove()" 
            class="px-4 py-2 text-gray-500 hover:text-gray-700">
            Batal
          </button>
          <button onclick="handleSaveEdit('${currentData.id}')" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Simpan
          </button>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = formHtml;
  document.body.appendChild(div);
}

// Handle simpan edit
async function handleSaveEdit(jobId) {
  const time1 = document.getElementById('edit-time1').value;
  const time2 = document.getElementById('edit-time2').value;
  const days = Array.from(document.getElementById('edit-days').selectedOptions)
    .map(opt => parseInt(opt.value));

  if (!time1 || !time2 || days.length === 0) {
    alert('Harap isi semua field');
    return;
  }

  try {
    const schedule = convertToCronSchedule([time1, time2], days);
    
    const response = await fetch(`/api/update-cron`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId,
        schedule,
        times: [time1, time2],
        days
      })
    });

    const result = await response.json();
    if (result.success) {
      alert('Jadwal berhasil diperbarui!');
      location.reload();
    } else {
      alert('Gagal memperbarui: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
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

    let loading = false;
    const originalIcon = card.querySelector('i').className;

    card.onclick = async () => {
      if (loading) return;
      loading = true;
      
      try {
        card.querySelector('i').className = 'fas fa-spinner fa-spin animate-spin';
        
        const [endpointRes, cronRes] = await Promise.all([
          fetch(acc.endpoint).then(r => r.text()),
          fetch(`/api/cron-status?jobId=${acc.cronJob.id}`)
        ]);

        if (!cronRes.ok) throw new Error('Gagal mengambil status cron');

        const cronData = await cronRes.json();

        document.getElementById("dialog-title").textContent = acc.name;
        document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
        document.getElementById("dialog-last").textContent = endpointRes;

        const statusContainer = document.getElementById("cron-status-container");
        if (cronData?.jobDetails) {
          statusContainer.innerHTML = `
            <div class="bg-white p-6 rounded-xl">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold">Jadwal Harian</h3>
                <label class="switch">
                  <input type="checkbox" ${acc.cronJob.enabled ? 'checked' : ''} 
                    onchange="toggleJob('${acc.cronJob.id}', this.checked)">
                  <span class="slider"></span>
                </label>
              </div>
              
              <div class="space-y-4">
                <div>
                  <p class="text-gray-600">Waktu Eksekusi:</p>
                  <div class="flex gap-2 mt-1">
                    ${acc.cronJob.times.map(t => `
                      <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        ${t}
                      </span>
                    `).join('')}
                  </div>
                </div>
                
                <div>
                  <p class="text-gray-600">Hari:</p>
                  <div class="flex flex-wrap gap-2 mt-1">
                    ${acc.cronJob.days.map(d => `
                      <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        ${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][d - 1]}
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
              
              <button 
                onclick="showEditForm(${JSON.stringify(acc.cronJob)})"
                class="mt-6 w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all"
              >
                <i class="fas fa-edit mr-2"></i>Edit Jadwal
              </button>
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
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        loading = false;
        card.querySelector('i').className = originalIcon;
      }
    };

    list.appendChild(card);
  });
});

// Expose fungsi ke global scope
window.toggleJob = toggleJob;
window.showEditForm = showEditForm;
window.handleSaveEdit = handleSaveEdit;
