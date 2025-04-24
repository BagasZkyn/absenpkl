const accounts = [
  {
    name: "Bagas Zakyan",
    email: "13636@gmail.com",
    endpoint: "/api/bagas"
  },
  {
    name: "M Agung",
    email: "13648@gmail.com",
    endpoint: "/api/agung"
  },
  {
    name: "M Fahmi",
    email: "13687@gmail.com",
    endpoint: "/api/fahmi"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");

  accounts.forEach((acc) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl border-2 border-indigo-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 group hover:-translate-y-2 transform-gpu";
    
    // Tambahkan ikon berbeda untuk variasi
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

      // Ganti dengan animasi loading yang lebih menarik
      card.innerHTML = `
        <div class="h-full flex items-center justify-center py-8">
          <i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i>
        </div>
      `;
      
      try {
        const res = await fetch(acc.endpoint);
        const text = await res.text();
        document.getElementById("dialog-title").textContent = acc.name;
        document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
        document.getElementById("dialog-last").textContent = text;
        document.getElementById("detail-dialog").showModal();
      } catch (e) {
        alert("Gagal mengambil data dari endpoint.");
      }

      card.innerHTML = originalHTML;
      loading = false;
    };

    list.appendChild(card);
  });
});
