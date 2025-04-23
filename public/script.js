// public/script.js
const accounts = [
  {
    name: "Nathan Kanaeru",
    email: "13636@gmail.com",
    endpoint: "/api/absen"
  },
  {
    name: "Rizky Pratama",
    email: "13648",
    endpoint: "/api/absen2"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("account-list");

  accounts.forEach((acc) => {
    const li = document.createElement("li");
    li.className = "p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-100";
    li.textContent = acc.name;
    li.onclick = async () => {
      const res = await fetch(acc.endpoint);
      const text = await res.text();
      document.getElementById("dialog-title").textContent = acc.name;
      document.getElementById("dialog-email").textContent = `Email: ${acc.email}`;
      document.getElementById("dialog-last").textContent = `Log terakhir: ${text.slice(0, 100)}...`;
      document.getElementById("detail-dialog").showModal();
    };
    list.appendChild(li);
  });
});
