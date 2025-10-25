const sections = document.querySelectorAll(".section");
const buttons = document.querySelectorAll(".btn");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.id.replace("Btn", "");
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  });
});

// Simulace dat (později se nahradí databází)
const inventoryData = [
  { id: 1, name: "Kovová bedna", qty: 14, category: "Materiál" },
  { id: 2, name: "Palivo", qty: 3, category: "Zásoby" },
  { id: 3, name: "Opravná sada", qty: 22, category: "Nářadí" },
];

function renderInventory() {
  const tbody = document.getElementById("inventoryTable");
  tbody.innerHTML = "";
  inventoryData.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.category}</td>
      <td><button class="btn small">🗑️</button></td>
    `;
    tbody.appendChild(row);
  });
  document.getElementById("totalItems").textContent = inventoryData.length;
  document.getElementById("lowStock").textContent = inventoryData.filter(i => i.qty < 5).length;
  document.getElementById("lastUpdate").textContent = new Date().toLocaleString();
}

renderInventory();
