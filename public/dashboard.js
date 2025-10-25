// =======================
// DASHBOARD.JS (public/)
// =======================

// ⏰ živý čas v hlavičce
function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString('cs-CZ', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const dateEl = document.getElementById('datetime');
  if (dateEl) dateEl.textContent = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// 🌐 URL API
const API_URL = "https://radav2-production.up.railway.app/status?key=rrc_secret";

// 🔄 funkce pro načtení hráčů
async function loadPlayers() {
  try {
    const res = await fetch(API_URL);

    // pokud odpověď není OK, vyhoď chybu
    if (!res.ok) throw new Error(`Chybná odpověď serveru (${res.status})`);

    // načti text a zkus ho přetypovat na JSON
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn("⚠️ Odpověď není čistý JSON, pokouším se opravit...");
      data = JSON.parse(text.replace(/^[^{[]+/, "")); // odstraní prefix (např. Flask log)
    }

    // 🧮 počet hráčů
    const countEl = document.getElementById("player-count");
    if (countEl) countEl.textContent = `Aktuálně ve hře: ${data.count ?? 0}`;

    // 👥 výpis hráčů
    const list = document.getElementById("player-list");
    if (list) {
      if (Array.isArray(data.ingame) && data.ingame.length > 0) {
        list.innerHTML = data.ingame.map(u => `
          <li class="player-card">
            <div class="player-name"><strong>${u.tag ?? "Neznámý"}</strong></div>
            <div class="player-activity">🎮 ${u.activity ?? "Bez aktivity"}</div>
            <div class="player-time">🕒 ${u.lastActive ? new Date(u.lastActive).toLocaleTimeString() : "-"}</div>
          </li>
        `).join("");
      } else {
        list.innerHTML = "<li>❌ Nikdo není ve hře.</li>";
      }
    }

    // 🕓 čas poslední aktualizace
    const updateEl = document.getElementById("last-update");
    if (updateEl && data.lastUpdate) {
      updateEl.textContent = `Poslední aktualizace: ${new Date(data.lastUpdate).toLocaleTimeString()}`;
    }

  } catch (err) {
    console.error("❌ Chyba při načítání dat:", err);
    const countEl = document.getElementById("player-count");
    const list = document.getElementById("player-list");
    if (countEl) countEl.textContent = "❌ Chyba při načítání";
    if (list) list.innerHTML = "<li>Nelze získat data ze serveru.</li>";
  }
}

// 🔁 pravidelné aktualizace
setInterval(loadPlayers, 15000);
loadPlayers();
