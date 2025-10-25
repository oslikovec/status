// ===============================
// 🔗 API URL
// ===============================
const API_URL = "https://radav2-production.up.railway.app/freq";

// ===============================
// 📡 ELEMENTY
// ===============================
const freqDisplay = document.getElementById("freqValue");
const historyLog = document.getElementById("historyLog");
const codesTable = document.querySelector("#codesTable tbody");

let lastFreq = null;

// ===============================
// 📡 FREKVENCE
// ===============================
async function fetchFrequency() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!data || !data.frequency) return;

    const freqValue = parseFloat(data.frequency).toFixed(2);
    const displayText = `${freqValue} MHz`;

    if (displayText !== freqDisplay.textContent) {
      freqDisplay.textContent = displayText;
      addHistory(`Aktualizováno na ${displayText}`);
    }
  } catch (err) {
    console.error("❌ Chyba při načítání frekvence:", err);
  }
}

// ===============================
// 📜 HISTORIE
// ===============================
function addHistory(msg) {
  const entry = document.createElement("div");
  entry.className = "history-entry";
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  entry.innerHTML = `<span class="timestamp">${time}</span> – ${msg}`;
  historyLog.prepend(entry);

  // Udržuj max 15 záznamů
  const entries = historyLog.querySelectorAll(".history-entry");
  if (entries.length > 15) entries[entries.length - 1].remove();
}

// ===============================
// 🧾 KÓDY
// ===============================
async function loadCodes() {
  try {
    const res = await fetch("https://database-production-e5a6.up.railway.app/api/codes");
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
  } catch (err) {
    console.error("❌ Chyba při načítání kódů:", err);
  }
}

// ===============================
// 🧠 OVLÁDACÍ TLAČÍTKA
// ===============================
document.getElementById("connectBtn").addEventListener("click", async () => {
  addHistory("Připojeno");
  await fetchFrequency();
});

document.getElementById("disconnectBtn").addEventListener("click", () => {
  addHistory("Odpojeno");
});

document.getElementById("resetBtn").addEventListener("click", () => {
  freqDisplay.textContent = "–.– MHz";
  addHistory("Systém resetován");
});

document.getElementById("addCodeBtn").addEventListener("click", async () => {
  const code = prompt("Zadej nový kód (např. 10-7):");
  const desc = prompt("Popis:");
  if (!code) return;
  await fetch("https://database-production-e5a6.up.railway.app/api/codes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, description: desc || "" })
  });
  addHistory(`Přidán kód ${code}`);
  loadCodes();
});

// ===============================
// 🔄 INTERVAL AKTUALIZACE
// ===============================
setInterval(fetchFrequency, 2000);
fetchFrequency();
loadCodes();
