// dashboard.js
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
  document.getElementById('datetime').textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime();


const API_URL = "https://radav2-production.up.railway.app/status?key=rrc_secret";

async function loadPlayers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Chyba při načítání dat");
    const data = await res.json();

    // počet hráčů
    document.getElementById("player-count").textContent = 
      `Aktuálně ve hře: ${data.count}`;

    // výpis hráčů
    const list = document.getElementById("player-list");
    if (data.ingame && data.ingame.length > 0) {
      list.innerHTML = data.ingame.map(u => `
        <li>
          <strong>${u.tag}</strong><br>
          🎮 ${u.activity}<br>
          🕒 ${new Date(u.lastActive).toLocaleTimeString()}
        </li>
      `).join("");
    } else {
      list.innerHTML = "<li>❌ Nikdo není ve hře.</li>";
    }

    // čas poslední aktualizace
    document.getElementById("last-update").textContent =
      `Poslední aktualizace: ${new Date(data.lastUpdate).toLocaleTimeString()}`;

  } catch (err) {
    console.error(err);
    document.getElementById("player-count").textContent = "❌ Chyba při načítání";
    document.getElementById("player-list").innerHTML = "";
  }
}

setInterval(loadPlayers, 15000);
loadPlayers();

