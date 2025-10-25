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
