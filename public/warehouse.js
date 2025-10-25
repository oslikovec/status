// =======================================
// 🌐 API NAPOJENÍ NA RAILWAY BACKEND
// =======================================


// Pomocné funkce =========================

// === NAVIGAČNÍ PŘEPÍNAČ SEKCE ===
const dashboardBtn = document.getElementById("dashboardBtn");
const inventoryBtn = document.getElementById("inventoryBtn");
const addItemBtn = document.getElementById("addItemBtn");

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");
}

// tlačítka nahoře
dashboardBtn.addEventListener("click", () => showSection("dashboard"));
inventoryBtn.addEventListener("click", () => showSection("inventory"));
addItemBtn.addEventListener("click", () => showSection("addItem"));


const API_BASE = "https://database-production-e5a6.up.railway.app/api";
// Načti položky podle ID skladu
async function loadWarehouse(warehouseId) {
  try {
    const res = await fetch(`${API_BASE}/items/${warehouseId}`);
    const data = await res.json();
    renderTable(data);
  } catch (err) {
    console.error("❌ Chyba při načítání skladu:", err);
  }
}

// Přidání nové položky
async function addItem(name, qty, category, warehouse_id) {
  try {
    await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, qty, category, warehouse_id })
    });
    loadWarehouse(warehouse_id);
  } catch (err) {
    console.error("❌ Chyba při přidávání:", err);
  }
}

// Smazání položky
async function deleteItem(id, warehouse_id) {
  try {
    await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
    loadWarehouse(warehouse_id);
  } catch (err) {
    console.error("❌ Chyba při mazání:", err);
  }
}

// =======================================
// 🧱 FRONTENDOVÁ LOGIKA
// =======================================

const warehouseBtns = document.querySelectorAll(".warehouse-btn");
const warehouseView = document.getElementById("warehouseView");
const warehouseTitle = document.getElementById("warehouseTitle");
const inventoryTable = document.getElementById("inventoryTable");
const backToSelector = document.getElementById("backToSelector");

// Mapování názvů skladů na jejich ID v DB
const warehouseMap = {
  bootcamp: 1,
  stromecek: 2
};

// Po kliknutí na tlačítko skladu
warehouseBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.warehouse;
    const warehouseId = warehouseMap[name];
    warehouseView.classList.remove("hidden");
    document.querySelector(".warehouse-selector").classList.add("hidden");
    warehouseTitle.textContent = `Inventář – ${name}`;
    loadWarehouse(warehouseId);
  });
});

// Zpět na výběr skladů
backToSelector.addEventListener("click", () => {
  warehouseView.classList.add("hidden");
  document.querySelector(".warehouse-selector").classList.remove("hidden");
  inventoryTable.innerHTML = "";
  warehouseTitle.textContent = "";
});


# zakreslení tabulek

function renderTable(data) {
  inventoryTable.innerHTML = "";
  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.category}</td>
      <td>${new Date(item.updated).toLocaleString()}</td>
      <td>
        <button class="btn small" onclick="updateQty(${item.id}, ${item.qty + 1}, ${item.warehouse_id})">➕</button>
        <button class="btn small" onclick="updateQty(${item.id}, ${item.qty - 1}, ${item.warehouse_id})">➖</button>
        <button class="btn small danger" onclick="deleteItem(${item.id}, ${item.warehouse_id})">🗑️</button>
      </td>
    `;
    inventoryTable.appendChild(tr);
  });
}


// Aktualizace množství
async function updateQty(id, newQty, warehouse_id) {
  try {
    await fetch(`${API_BASE}/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty: newQty })
    });
    loadWarehouse(warehouse_id);
  } catch (err) {
    console.error("❌ Chyba při změně množství:", err);
  }
}


// =======================================
// 🧩 Odeslání nové položky (formulář)
// =======================================
const addForm = document.getElementById("addForm");
if (addForm) {
  addForm.addEventListener("submit", e => {
    e.preventDefault();
    const inputs = addForm.querySelectorAll("input, select");
    const [warehouseSel, name, qty, category] = inputs;
    const warehouseName = warehouseSel.value;
    const warehouse_id = warehouseMap[warehouseName];
    addItem(name.value, parseInt(qty.value), category.value, warehouse_id);
    addForm.reset();
  });
}

async function addWarehouse(name) {
  try {
    await fetch(`${API_BASE}/warehouses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    alert("✅ Nový sklad byl vytvořen!");
  } catch (err) {
    console.error("❌ Chyba při přidání skladu:", err);
  }
}



console.log("%cWarehouse.js connected to Railway backend ✅", "color: lime; font-weight: bold;");
