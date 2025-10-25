
const API_GET = "https://radav2-production.up.railway.app/freq";
const API_SET = "https://radav2-production.up.railway.app/set_freq";

const freqDisplay = document.getElementById("freqValue");
const historyLog = document.getElementById("historyLog");
const canvas = document.getElementById("frequencyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let phase = 0;
let lastFreq = null;

// ===============================
// 🎛️ GENERÁTOR
// ===============================
function randomFrequency() {
  return (Math.random() * (99 - 30) + 30).toFixed(2);
}

// ===============================
// 📡 FETCH FREKVENCE
// ===============================
async function fetchFrequency() {
  try {
    const res = await fetch(API_GET);
    const data = await res.json();
    if (data && data.frequency) {
      const val = parseFloat(data.frequency).toFixed(2);
      if (val !== lastFreq) {
        lastFreq = val;
        freqDisplay.textContent = `${val} MHz`;
        addHistory(`Frekvence: ${val} MHz`);
      }
    }
  } catch (err) {
    console.error("Chyba při načítání frekvence:", err);
  }
}

// ===============================
// 📡 NASTAV FREKVENCI
// ===============================
async function setFrequency(value) {
  try {
    await fetch(API_SET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequency: value })
    });
    freqDisplay.textContent = `${value} MHz`;
    addHistory(`Frekvence nastavena na ${value} MHz`);
  } catch (err) {
    console.error("❌ Chyba při odesílání frekvence:", err);
  }
}

// ===============================
// 🌊 SINUSOIDA
// ===============================
function drawFrequency() {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const amp = 35 + Math.sin(Date.now() / 800) * 5;
  const waveColor = ctx.createLinearGradient(0, 0, width, 0);
  waveColor.addColorStop(0, 'rgba(255, 50, 50, 0.2)');
  waveColor.addColorStop(0.5, 'rgba(255, 26, 26, 0.9)');
  waveColor.addColorStop(1, 'rgba(255, 50, 50, 0.2)');
  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    const y = height / 2 - 30 + Math.sin(x * 0.05 + phase) * amp;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = waveColor;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
  ctx.stroke();
  phase += 0.05;
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
// 🔘 OVLÁDACÍ TLAČÍTKA
// ===============================
document.getElementById("connectBtn").textContent = "🎲 Změnit";
document.getElementById("disconnectBtn").textContent = "⚙️ Nastavit";

document.getElementById("connectBtn").addEventListener("click", async () => {
  const randFreq = randomFrequency();
  addHistory(`Random frekvence: ${randFreq} MHz`);
  await setFrequency(randFreq);
});

document.getElementById("disconnectBtn").addEventListener("click", async () => {
  const customFreq = prompt("Zadej konkrétní frekvenci (např. 67.45):");
  if (customFreq) {
    addHistory(`Manuální frekvence: ${customFreq} MHz`);
    await setFrequency(customFreq);
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  addHistory("Systém restartován");
  setTimeout(() => {
    location.reload(); // 🔁 kompletní refresh stránky
  }, 500);
});


// ===============================
// 🔁 CYKLUS
// ===============================
setInterval(fetchFrequency, 3000);
fetchFrequency();
drawFrequency();
