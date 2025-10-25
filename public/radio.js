// =============== ⚙️ CONFIG LOAD ====================
let API_BASE = "";

async function loadConfig() {
  const res = await fetch("config.json");
  const data = await res.json();
  API_BASE = data.API_BASE;
}
await loadConfig();

// =============== 📡 FETCH & UPDATE =================
const freqDisplay = document.getElementById("freqValue");
const historyLog = document.getElementById("historyLog");
const codesTable = document.getElementById("codesTable").querySelector("tbody");

let lastFreq = null;

// 🔁 Načti nejnovější frekvenci
async function fetchLatestFrequency() {
  try {
    const res = await fetch(`${API_BASE}/frequencies/latest`);
    const data = await res.json();
    if (!data) return;

    if (data.frequency !== lastFreq) {
      lastFreq = data.frequency;
      freqDisplay.textContent = `${parseFloat(data.frequency).toFixed(2)} MHz`;
      addHistory(`Nová frekvence: ${data.frequency.toFixed(2)} MHz`);
    }
  } catch (err) {
    console.error("Chyba načítání frekvence:", err);
  }
}

// 🔁 Načti historii frekvencí
async function loadFrequencyHistory() {
  const res = await fetch(`${API_BASE}/frequencies/history`);
  const history = await res.json();
  historyLog.innerHTML = "";
  history.forEach(item => {
    const time = new Date(item.timestamp).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    const div = document.createElement("div");
    div.className = "history-entry";
    div.innerHTML = `<span class="timestamp">${time}</span> – ${item.frequency.toFixed(2)} MHz`;
    historyLog.appendChild(div);
  });
}

// 🔁 Načti kódy
async function loadCodes() {
  const res = await fetch(`${API_BASE}/codes`);
  const codes = await res.json();
  codesTable.innerHTML = "";
  codes.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.code}</td>
      <td>${c.description}</td>
      <td>
        <button onclick="editCode('${c.id}')">✎</button>
        <button onclick="deleteCode('${c.id}')">🗑</button>
      </td>
    `;
    codesTable.appendChild(tr);
  });
}

// 🧾 Přidej do historie
function addHistory(msg) {
  const div = document.createElement("div");
  div.className = "history-entry";
  const time = new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  div.innerHTML = `<span class="timestamp">${time}</span> – ${msg}`;
  historyLog.prepend(div);
  const entries = historyLog.querySelectorAll(".history-entry");
  if (entries.length > 15) entries[entries.length - 1].remove();
}

// 🧠 Ovládací tlačítka
document.getElementById("connectBtn").addEventListener("click", async () => {
  addHistory("Připojeno");
  await fetchLatestFrequency();
});
document.getElementById("disconnectBtn").addEventListener("click", () => addHistory("Odpojeno"));
document.getElementById("resetBtn").addEventListener("click", () => {
  lastFreq = null;
  freqDisplay.textContent = "–.– MHz";
  addHistory("Systém resetován");
});
document.getElementById("addCodeBtn").addEventListener("click", async () => {
  const code = prompt("Zadej nový kód (např. 10-7):");
  const desc = prompt("Popis:");
  if (!code) return;
  await fetch(`${API_BASE}/codes`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ code, description: desc || "" })
  });
  addHistory(`Přidán kód ${code}`);
  loadCodes();
});

// 🔄 Interval aktualizace
setInterval(fetchLatestFrequency, 3000);


const API_URL = "https://radav2-production.up.railway.app/freq"; // 🔴 tvoje API URL
const freqDisplay = document.getElementById("freqValue");
const historyLog = document.getElementById("historyLog");

async function fetchFrequency() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data && data.frequency) {
      freqDisplay.textContent = data.frequency + " MHz";
      addHistory(`Aktualizováno na ${data.frequency} MHz`);
    }
  } catch (err) {
    console.error("Chyba při načítání frekvence:", err);
  }
}

// přidá položku do historie
function addHistory(msg) {
  const entry = document.createElement('div');
  entry.className = 'history-entry';
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  entry.innerHTML = `<span class="timestamp">${time}</span> – ${msg}`;
  historyLog.prepend(entry);
  const entries = historyLog.querySelectorAll('.history-entry');
  if (entries.length > 15) entries[entries.length - 1].remove();
}

// načti frekvenci každé 2 sekundy
setInterval(fetchFrequency, 2000);
fetchFrequency();


// Inicializace
loadFrequencyHistory();
loadCodes();
