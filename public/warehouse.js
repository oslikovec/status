// === NAVIGAČNÍ PŘEPÍNAČ SEKCE ===
const dashboardBtn = document.getElementById("dashboardBtn");
const inventoryBtn = document.getElementById("inventoryBtn");
const addItemBtn = document.getElementById("addItemBtn");

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");
}

dashboardBtn.addEventListener("click", () => showSection("dashboard"));
inventoryBtn.addEventListener("click", () => showSection("inventory"));
addItemBtn.addEventListener("click", () => showSection("addItem"));

// === SIMULOVANÁ DATA SKLADU ===
const warehouses = {
  bootcamp: [
    { id: 1, name: "Kovová bedna", qty: 14, category: "Materiál", updated: "2025-10-23" },
    { id: 2, name: "Palivo", qty: 3, category: "Zásoby", updated: "2025-10-22" },
  ],
  stromecek: [
    { id: 1, name: "Opravná sada", qty: 22, category: "Nářadí", updated: "2025-10-24" }
  ]
};

// === INVENTURA LOGIKA ===
const lastInventoryDate = document.getElementById("bootcampUpdate");
const updateBtn = document.getElementById("updateInventoryBtn"); // pokud existuje

function checkInventoryDate() {
  if (!lastInventoryDate) return;
  const dateStr = lastInventoryDate.textContent;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / (1000 * 60 * 60 * 24);

  if (diff > 3) {
    lastInventoryDate.style.color = "var(--red)";
    updateBtn?.classList.remove("hidden");
  } else {
    lastInventoryDate.style.color = "var(--green)";
    updateBtn?.classList.add("hidden");
  }
}

updateBtn?.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  lastInventoryDate.textContent = today;
  checkInventoryDate();

  // krátké zpoždění a refresh pro aktualizaci
  setTimeout(() => location.reload(), 400);
});

checkInventoryDate();

// === AKTUALIZACE POČTŮ NA DASHBOARDU ===
const bootcampCount = document.getElementById("bootcampCount");
const stromecekCount = document.getElementById("stromecekCount");
if (bootcampCount && stromecekCount) {
  bootcampCount.textContent = warehouses.bootcamp.length;
  stromecekCount.textContent = warehouses.stromecek.length;
}

// === INVENTÁŘ – PŘEPNUTÍ SKLADŮ ===
const warehouseBtns = document.querySelectorAll(".warehouse-btn");
const warehouseView = document.getElementById("warehouseView");
const warehouseTitle = document.getElementById("warehouseTitle");
const inventoryTable = document.getElementById("inventoryTable");
const backToSelector = document.getElementById("backToSelector");

warehouseBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const warehouseName = btn.dataset.warehouse;
    showWarehouse(warehouseName);
  });
});

function showWarehouse(name) {
  // schová výběr skladů, zobrazí konkrétní inventář
  const selector = document.querySelector(".warehouse-selector");
  selector.classList.add("hidden");
  warehouseView.classList.remove("hidden");

  // nastaví nadpis skladu
  warehouseTitle.textContent = "Inventář – " + name.charAt(0).toUpperCase() + name.slice(1);

  // vykreslí tabulku skladu
  renderTable(warehouses[name]);
}

// === TLAČÍTKO ZPĚT V INVENTÁŘI ===
backToSelector.addEventListener("click", () => {
  warehouseView.classList.add("hidden");
  document.querySelector(".warehouse-selector").classList.remove("hidden");

  // vyčistí tabulku a nadpis
  inventoryTable.innerHTML = "";
  warehouseTitle.textContent = "";
});

// === RENDER TABULKY ===
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

// === DOPLŇKOVÉ – VÝPIS NA KONZOLI (debug) ===
console.log("%cWarehouse.js loaded successfully ✅", "color: lime; font-weight: bold;");
