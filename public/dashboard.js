// =======================
// DASHBOARD.JS (public/)
// =======================

// ⏰ živý čas
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
  const el = document.getElementById('datetime');
  if (el) el.textContent = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// 🌐 URL API
const API_URL = "https://radav2-production.up.railway.app/status?key=rrc_secret";

// 🔄 Načítání hráčů
async function loadPlayers() {
  try {
    const res = await fetch(API_URL);
    const raw = await res.text();

    // najdi čistý JSON mezi složenými závorkami
    const jsonMatch = raw.match(/{[\s\S]*}/);
    if (!jsonMatch) throw new Error("Nelze najít JSON v odpovědi");

    const clean = jsonMatch[0].trim();
    const data = JSON.parse(clean);

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
    const upd = document.getElementById("last-update");
    if (upd && data.lastUpdate) {
      upd.textContent = `Poslední aktualizace: ${new Date(data.lastUpdate).toLocaleTimeString()}`;
    }

  } catch (err) {
    console.error("❌ Chyba při načítání dat:", err);
    const countEl = document.getElementById("player-count");
    const list = document.getElementById("player-list");
    if (countEl) countEl.textContent = "❌ Chyba při načítání";
    if (list) list.innerHTML = "<li>Nelze načíst data ze serveru.</li>";
  }
}

// ⏱️ Obnova každých 15 s
setInterval(loadPlayers, 15000);
loadPlayers();
