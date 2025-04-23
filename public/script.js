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
    card.className = "bg-white rounded-xl border border-indigo-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 min-h-[140px] flex flex-col justify-center";

    card.innerHTML = `
      <h3 class="text-xl font-bold text-indigo-700">${acc.name}</h3>
      <p class="text-sm text-gray-500 mt-1">${acc.email}</p>
    `;

    let loading = false;

    card.onclick = async () => {
      if (loading) return;
      loading = true;
      const originalHTML = card.innerHTML;

      card.innerHTML += `<div class="mt-3 text-sm text-indigo-500 animate-pulse">Mengambil data...</div>`;
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
