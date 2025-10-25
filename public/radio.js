
// ===============================
// 🎛️ NASTAVENÍ
// ===============================
const API_URL = "https://radav2-production.up.railway.app/freq"; // živé API z bota
const freqDisplay = document.getElementById("freqValue");
const historyLog = document.getElementById("historyLog");
const canvas = document.getElementById("frequencyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let phase = 0;
let amplitude = 40;
let lastFreq = null;

// ===============================
// 📡 NAČÍTÁNÍ FREKVENCE
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
      lastFreq = parseFloat(freqValue);
    }
  } catch (err) {
    console.error("❌ Chyba při načítání frekvence:", err);
  }
}

// ===============================
// 💡 SINUSOIDA – ANIMACE
// ===============================
function drawFrequency() {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  // Plynulý efekt amplitudy podle aktuální frekvence
  const freqFactor = (lastFreq ? lastFreq / 100 : 1);
  const amp = amplitude * (0.8 + Math.sin(Date.now() / 600) * 0.2);
  const waveColor = ctx.createLinearGradient(0, 0, width, 0);
  waveColor.addColorStop(0, "rgba(255, 50, 50, 0.2)");
  waveColor.addColorStop(0.5, "rgba(255, 26, 26, 0.9)");
  waveColor.addColorStop(1, "rgba(255, 50, 50, 0.2)");

  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    const y = height / 2 - 30 + Math.sin(x * freqFactor * 0.08 + phase) * amp;
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = waveColor;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(255, 0, 0, 0.7)";
  ctx.stroke();

  phase += 0.05 + (lastFreq ? lastFreq / 1000 : 0.05);
  requestAnimationFrame(drawFrequency);
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

  const entries = historyLog.querySelectorAll(".history-entry");
  if (entries.length > 15) entries[entries.length - 1].remove();
}

// ===============================
// 🧠 OVLÁDACÍ TLAČÍTKA
// ===============================
document.getElementById("connectBtn").addEventListener("click", async () => {
  addHistory("Připojeno");
  await fetchFrequency();
});
document.getElementById("disconnectBtn").addEventListener("click", () => addHistory("Odpojeno"));
document.getElementById("resetBtn").addEventListener("click", () => {
  freqDisplay.textContent = "–.– MHz";
  addHistory("Systém resetován");
});
document.getElementById("addCodeBtn").addEventListener("click", () => addHistory("Nový kód přidán"));

// ===============================
// 🔄 INTERVALY
// ===============================
setInterval(fetchFrequency, 2000);
fetchFrequency();
drawFrequency();

