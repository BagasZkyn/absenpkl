const accounts = [
    {
        id: "1",
        name: "Bagas Zakyan",
        email: "13636@gmail.com",
        cronJobId: "6056513" // Ganti dengan ID sebenarnya
    }
];

let currentJobId = null;

async function fetchJobStatus(jobId) {
    try {
        const res = await fetch(`/api/cron-status?jobId=${jobId}`);
        return await res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function updateJob(jobId, data) {
    try {
        const res = await fetch(`/api/update-cron`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, ...data })
        });
        return await res.json();
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, error: error.message };
    }
}

function showEditForm() {
    const formHtml = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 class="text-xl font-bold mb-4">Edit Jadwal</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Jam (HH:MM)</label>
                        <input type="time" id="edit-time1" class="w-full p-2 border rounded-lg" required>
                        <input type="time" id="edit-time2" class="w-full p-2 border rounded-lg mt-2" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Hari Kerja</label>
                        <select id="edit-days" multiple class="w-full p-2 border rounded-lg h-32">
                            <option value="1">Senin</option>
                            <option value="2">Selasa</option>
                            <option value="3">Rabu</option>
                            <option value="4">Kamis</option>
                            <option value="5">Jumat</option>
                        </select>
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button onclick="this.closest('div').remove()" class="px-4 py-2 text-gray-500">
                        Batal
                    </button>
                    <button onclick="saveSchedule()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">
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

async function saveSchedule() {
    const time1 = document.getElementById('edit-time1').value;
    const time2 = document.getElementById('edit-time2').value;
    const days = Array.from(document.getElementById('edit-days').selectedOptions)
        .map(opt => parseInt(opt.value));

    if (!time1 || !time2 || days.length === 0) {
        alert('Harap isi semua field');
        return;
    }

    const schedule = `0 ${time1.split(':')[0]},${time2.split(':')[0]} * * ${days.join(',')}`;
    
    const result = await updateJob(currentJobId, { schedule });
    if (result.success) {
        alert('Jadwal berhasil diperbarui!');
        location.reload();
    } else {
        alert('Error: ' + (result.error || 'Gagal memperbarui jadwal'));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const accountList = document.getElementById('account-list');

    accounts.forEach(acc => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl border-2 border-indigo-100 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all';
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="bg-indigo-100 p-3 rounded-lg">
                    <i class="fas fa-user text-indigo-600"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-indigo-900">${acc.name}</h3>
                    <p class="text-indigo-500">${acc.email}</p>
                </div>
            </div>
        `;

        card.addEventListener('click', async () => {
            currentJobId = acc.cronJobId;
            const dialog = document.getElementById('detail-dialog');
            
            // Load job details
            const jobData = await fetchJobStatus(acc.cronJobId);
            
            if (jobData?.jobDetails) {
                document.getElementById('dialog-title').textContent = acc.name;
                document.getElementById('dialog-email').textContent = acc.email;
                document.getElementById('toggle-job').checked = jobData.jobDetails.enabled;
                
                // Parse schedule
                const [_, hours, __, ___, days] = jobData.jobDetails.schedule.split(' ');
                const times = hours.split(',').map(h => `${h.padStart(2, '0')}:00`);
                const dayNames = days.split(',').map(d => ['Senin','Selasa','Rabu','Kamis','Jumat'][d-1]);
                
                document.getElementById('schedule-display').innerHTML = `
                    <div>
                        <p class="text-gray-600">Waktu:</p>
                        <div class="flex gap-2 mt-1">
                            ${times.map(t => `<span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">${t}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <p class="text-gray-600">Hari:</p>
                        <div class="flex flex-wrap gap-2 mt-1">
                            ${dayNames.map(d => `<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full">${d}</span>`).join('')}
                        </div>
                    </div>
                `;
                
                dialog.showModal();
            }
        });

        accountList.appendChild(card);
    });

    // Toggle handler
    document.getElementById('toggle-job').addEventListener('change', async (e) => {
        const result = await updateJob(currentJobId, { enabled: e.target.checked });
        if (!result.success) {
            alert('Gagal memperbarui status: ' + (result.error || 'Unknown error'));
            e.target.checked = !e.target.checked;
        }
    });
});

// Expose functions to global scope
window.showEditForm = showEditForm;
window.saveSchedule = saveSchedule;
