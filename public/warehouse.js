
// === NAVIGAČNÍ PŘEPÍNAČ SEKCE ===

// definuj tlačítka podle ID
const dashboardBtn = document.getElementById("dashboardBtn");
const inventoryBtn = document.getElementById("inventoryBtn");
const addItemBtn = document.getElementById("addItemBtn");

// funkce pro přepnutí sekce
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");
}

// přiřazení akcí
dashboardBtn.addEventListener("click", () => showSection("dashboard"));
inventoryBtn.addEventListener("click", () => showSection("inventory"));
addItemBtn.addEventListener("click", () => showSection("addItem"));



// simulovaná data skladu
const warehouses = {
  bootcamp: [
    { id: 1, name: "Kovová bedna", qty: 14, category: "Materiál", updated: "2025-10-23" },
    { id: 2, name: "Palivo", qty: 3, category: "Zásoby", updated: "2025-10-22" },
  ],
  stromecek: [
    { id: 1, name: "Opravná sada", qty: 22, category: "Nářadí", updated: "2025-10-24" }
  ]
};

// inventura logika
const lastInventoryDate = document.getElementById("bootcampUpdate");
const updateBtn = document.getElementById("updateInventoryBtn"); // zatím skrytý, můžeš později přidat

function checkInventoryDate() {
  const dateStr = lastInventoryDate.textContent;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / (1000 * 60 * 60 * 24);
  if (diff > 3) {
    lastInventoryDate.style.color = "var(--red)";
  } else {
    lastInventoryDate.style.color = "var(--green)";
  }
}

updateBtn?.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  lastInventoryDate.textContent = today;
  checkInventoryDate();

  // reload pro aktualizaci zobrazení
  setTimeout(() => location.reload(), 400);
});

checkInventoryDate();

// update počtů z dat
document.getElementById("bootcampCount").textContent = warehouses.bootcamp.length;
document.getElementById("stromecekCount").textContent = warehouses.stromecek.length;


// výběr skladu
const warehouseBtns = document.querySelectorAll(".warehouse-btn");
const warehouseView = document.getElementById("warehouseView");
const warehouseTitle = document.getElementById("warehouseTitle");
const inventoryTable = document.getElementById("inventoryTable");
const backToSelector = document.getElementById("backToSelector");

warehouseBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const w = btn.dataset.warehouse;
    showWarehouse(w);
  });
});

function showWarehouse(name) {
  document.querySelector(".warehouse-selector").classList.add("hidden");
  warehouseView.classList.remove("hidden");
  warehouseTitle.textContent = "Inventář – " + name.charAt(0).toUpperCase() + name.slice(1);
  renderTable(warehouses[name]);
}

// tlačítko zpět v inventáři
const backToSelector = document.getElementById("backToSelector");

backToSelector.addEventListener("click", () => {
  // schová tabulku a zobrazí výběr skladů
  warehouseView.classList.add("hidden");
  document.querySelector(".warehouse-selector").classList.remove("hidden");
  
  // vyčistí tabulku
  inventoryTable.innerHTML = "";
});


function renderTable(data) {
  inventoryTable.innerHTML = "";
  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.category}</td>
      <td>${item.updated}</td>
      <td>
        <button class="btn small">➕</button>
        <button class="btn small">➖</button>
        <button class="btn small danger">🗑️</button>
      </td>
    `;
    inventoryTable.appendChild(tr);
  });
}
