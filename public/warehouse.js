// =======================================
// 🌐 API NAPOJENÍ NA RAILWAY BACKEND
// =======================================
const API_BASE = "https://database-production-e5a6.up.railway.app/api"; // uprav, pokud máš jinou URL

// =======================================
// 🔧 STAV A POMOCNÉ PROMĚNNÉ
// =======================================
const state = {
  warehousesByName: {},   // např. { bootcamp: 1, stromecek: 2 }
  warehousesById: {},     // např. { 1: 'bootcamp', 2: 'stromecek' }
  currentWarehouseId: null
};

// Bezpečný helper na query
const $ = (sel) => document.querySelector(sel);

// =======================================
// 🧭 NAVIGACE MEZI SEKCI
// =======================================
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");
}

function bindNavigation() {
  const dashboardBtn = $("#dashboardBtn");
  const inventoryBtn = $("#inventoryBtn");
  const addItemBtn   = $("#addItemBtn");

  dashboardBtn?.addEventListener("click", () => showSection("dashboard"));
  inventoryBtn?.addEventListener("click", () => showSection("inventory"));
  addItemBtn?.addEventListener("click", () => showSection("addItem"));
}

// =======================================
// 📦 WAREHOUSES (API)
// =======================================
async function fetchWarehouses() {
  const res = await fetch(`${API_BASE}/warehouses`);
  const data = await res.json(); // [{id, name, created_at}]
  // normalizace
  state.warehousesByName = {};
  state.warehousesById = {};
  data.forEach(w => {
    const key = (w.name || "").toLowerCase();
    state.warehousesByName[key] = w.id;
    state.warehousesById[w.id] = key;
  });
  return data;
}

async function addWarehouse(name) {
  await fetch(`${API_BASE}/warehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
}

async function deleteWarehouse(id) {
  await fetch(`${API_BASE}/warehouses/${id}`, { method: "DELETE" });
}

// =======================================
// 🗂️ ITEMS (API)
// =======================================
async function fetchItems(warehouseId) {
  const res = await fetch(`${API_BASE}/items/${warehouseId}`);
  return await res.json(); // [{id, name, qty, category, warehouse_id, updated}]
}

// Přidání nebo navýšení položky
async function addItem(name, qty, category, warehouse_id) {
  try {
    // Načti aktuální data ze skladu
    const res = await fetch(`${API_BASE}/items/${warehouse_id}`);
    const data = await res.json();

    // Zkus najít položku se stejným názvem a kategorií
    const existing = data.find(
      i =>
        i.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        i.category.trim().toLowerCase() === category.trim().toLowerCase()
    );

    if (existing) {
      // Navýšení množství existující položky
      const newQty = existing.qty + qty;

      const updateRes = await fetch(`${API_BASE}/items/${existing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: newQty }),
      });

      if (updateRes.ok) {
        alert(`✅ Položka "${existing.name}" byla navýšena na ${newQty} ks`);
      } else {
        alert("❌ Chyba při aktualizaci položky!");
      }
    } else {
      // Vložení nové položky
      const insertRes = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, qty, category, warehouse_id }),
      });

      if (insertRes.ok) {
        alert(`🆕 Přidána nová položka "${name}"`);
      } else {
        alert("❌ Chyba při přidávání nové položky!");
      }
    }

    // Po akci obnov tabulku (ale jen přes render, ne reload)
    const newRes = await fetch(`${API_BASE}/items/${warehouse_id}`);
    const updatedData = await newRes.json();
    renderTable(updatedData);
  } catch (err) {
    console.error("❌ Chyba při přidávání položky:", err);
    alert("⚠️ Chyba při komunikaci se serverem!");
  }
}


async function updateQty(id, newQty) {
  // nedovol mínus hodnoty
  const qty = Math.max(0, Number(newQty) || 0);
  await fetch(`${API_BASE}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty })
  });
}


async function deleteItem(id) {
  await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
}

// =======================================
// 🏠 DASHBOARD – načtení reálných dat
// =======================================
function colorByAge(dateStrEl) {
  // obarvení datumu poslední úpravy (zelená do 3 dnů, jinak červená)
  const el = dateStrEl;
  if (!el) return;
  const t = el.textContent?.trim();
  if (!t || t === "–") { el.style.color = ""; return; }
  const d = new Date(t);
  const now = new Date();
  const diffDays = (now - d) / (1000 * 60 * 60 * 24);
  el.style.color = diffDays > 3 ? "var(--red)" : "var(--green)";
}

async function updateDashboardFor(nameKey, countElId, updatedElId, nameElId) {
  const wid = state.warehousesByName[nameKey];
  if (!wid) {
    // sklad neexistuje v DB – vynuluj
    $(countElId).textContent = "0";
    $(updatedElId).textContent = "–";
    colorByAge($(updatedElId));
    if (nameElId) $(nameElId).textContent = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
    return;
  }

  const items = await fetchItems(wid);
  // počet
  $(countElId).textContent = String(items.length);
  // poslední update = max(updated)
  if (items.length === 0) {
    $(updatedElId).textContent = "–";
  } else {
    const latest = items.reduce((acc, it) =>
      !acc || new Date(it.updated) > new Date(acc.updated) ? it : acc
    , null);
    const dt = new Date(latest.updated);
    $(updatedElId).textContent = dt.toISOString().split("T")[0]; // YYYY-MM-DD
  }
  colorByAge($(updatedElId));
  if (nameElId) $(nameElId).textContent = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
}

async function refreshDashboard() {
  // BootCamp řádek
  await updateDashboardFor(
    "bootcamp",
    "#bootcampCount",
    "#bootcampUpdate",
    "#bootcampName"
  );

  // Stromeček řádek
  await updateDashboardFor(
    "stromecek",
    "#stromecekCount",
    "#stromecekUpdate",
    "#stromecekName"
  );
}

// =======================================
// 📋 INVENTÁŘ – UI
// =======================================
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
        <button class="btn small highlight" onclick="addMore(${item.id}, ${item.qty}, ${item.warehouse_id})">➕➕</button>
        <button class="btn small danger" onclick="deleteItem(${item.id}, ${item.warehouse_id})">🗑️</button>
      </td>
    `;
    inventoryTable.appendChild(tr);
  });
}

  // delegace událostí pro akční tlačítka
  inventoryTable.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      const wid = Number(btn.dataset.wid);
      const qty = Number(btn.dataset.qty);

      try {
        if (action === "inc") {
          await updateQty(id, qty + 1);
        } else if (action === "dec") {
          await updateQty(id, qty - 1);
        } else if (action === "del") {
          if (confirm("Opravdu smazat položku?")) {
            await deleteItem(id);
          } else {
            return;
          }
        }
        await loadWarehouseIntoTable(wid); // refresh tabulky
        await refreshDashboard();          // a refresh dashboardu
      } catch (e) {
        console.error("Akce položky selhala:", e);
      }
    });
  });


async function loadWarehouseIntoTable(warehouseId) {
  state.currentWarehouseId = warehouseId;
  const data = await fetchItems(warehouseId);
  renderTable(data);
}

function bindInventorySection() {
  const warehouseView = $("#warehouseView");
  const backToSelector = $("#backToSelector");
  const title = $("#warehouseTitle");

  // Výběr skladů (fixní dvě tlačítka podle HTML)
  document.querySelectorAll(".warehouse-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const nameKey = btn.dataset.warehouse; // "bootcamp" | "stromecek"
      const wid = state.warehousesByName[nameKey];
      if (!wid) {
        alert(`Sklad "${nameKey}" zatím neexistuje v DB.`);
        return;
      }
      $(".warehouse-selector").classList.add("hidden");
      warehouseView.classList.remove("hidden");
      title.textContent = `Inventář – ${nameKey.charAt(0).toUpperCase() + nameKey.slice(1)}`;
      await loadWarehouseIntoTable(wid);
    });
  });

  // Zpět na výběr
  backToSelector?.addEventListener("click", () => {
    warehouseView.classList.add("hidden");
    $(".warehouse-selector").classList.remove("hidden");
    $("#inventoryTable").innerHTML = "";
    title.textContent = "";
  });
}

// =======================================
// ➕ Přidání položky (form)
// =======================================
function bindAddItemForm() {
  const addForm = $("#addForm");
  if (!addForm) return;

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = addForm.querySelectorAll("input, select");
    const [warehouseSel, nameInput, qtyInput, categoryInput] = inputs;

    const nameKey = warehouseSel.value; // "bootcamp" / "stromecek"
    const wid = state.warehousesByName[nameKey];

    if (!wid) {
      alert(`Sklad "${nameKey}" neexistuje v DB.`);
      return;
    }

    const name = nameInput.value.trim();
    const qty = parseInt(qtyInput.value, 10);
    const category = categoryInput.value.trim();

    if (!name || isNaN(qty)) return;

    await addItem(name, qty, category, wid);
    addForm.reset();

    // auto-refresh inventáře, pokud jsme v zobrazení daného skladu
    if (state.currentWarehouseId === wid) {
      await loadWarehouseIntoTable(wid);
    }
    await refreshDashboard();
  });
}


// přiložení nových věcí



// =======================================
// 🏗️ Správa skladů – formuláře
// =======================================
function bindWarehouseAdmin() {
  const addWarehouseForm = $("#addWarehouseForm");
  const deleteWarehouseForm = $("#deleteWarehouseForm");
  const deleteSelect = $("#deleteWarehouseSelect");

  async function refreshWarehouseSelect() {
    const list = await fetchWarehouses();
    if (deleteSelect) {
      deleteSelect.innerHTML = "";
      list.forEach(w => {
        const opt = document.createElement("option");
        opt.value = String(w.id);
        opt.textContent = w.name;
        deleteSelect.appendChild(opt);
      });
    }
    await refreshDashboard();
  }

  addWarehouseForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#warehouseName").value.trim();
    if (!name) return;
    await addWarehouse(name);
    addWarehouseForm.reset();
    await refreshWarehouseSelect();
  });

  deleteWarehouseForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = Number(deleteSelect.value);
    if (!id) return;
    if (!confirm("Opravdu chceš smazat tento sklad?")) return;
    await deleteWarehouse(id);
    // pokud byl smazán právě zobrazený sklad, vrať se na výběr
    if (state.currentWarehouseId === id) {
      $("#warehouseView").classList.add("hidden");
      $(".warehouse-selector").classList.remove("hidden");
      $("#inventoryTable").innerHTML = "";
      $("#warehouseTitle").textContent = "";
      state.currentWarehouseId = null;
    }
    await refreshWarehouseSelect();
  });

  // První načtení
  refreshWarehouseSelect();
}


// =======================================
// 🚀 START
// =======================================
window.addEventListener("DOMContentLoaded", async () => {
  bindNavigation();
  bindInventorySection();
  bindAddItemForm();
  bindWarehouseAdmin();

  // Načti sklady a hned naplň dashboard reálnými daty
  await fetchWarehouses();
  await refreshDashboard();

  console.log("%cWarehouse.js connected to Railway backend ✅", "color: lime; font-weight: bold;");
});
