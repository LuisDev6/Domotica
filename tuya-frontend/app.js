const API_URL = 'http://localhost:3000';

const statusDiv = document.getElementById('status');
const toggleBtn = document.getElementById('toggleBtn');

let isOn = false;

// ---------------- GET STATUS ----------------
async function fetchStatus() {
  try {
    const res = await fetch(`${API_URL}/light/status`);
    const data = await res.json();

    isOn = data.on;

    updateUI();
  } catch (err) {
    console.error('Error obteniendo estado:', err);
  }
}

// ---------------- TOGGLE ----------------
async function toggleLight() {
  try {
    const endpoint = isOn ? '/light/off' : '/light/on';

    await fetch(`${API_URL}${endpoint}`, {
      method: 'POST'
    });

    // actualizar estado después del cambio
    await fetchStatus();
  } catch (err) {
    console.error('Error cambiando estado:', err);
  }
}

// ---------------- UI ----------------
function updateUI() {
  if (isOn) {
    statusDiv.textContent = 'Encendida';
    statusDiv.classList.remove('off');
    statusDiv.classList.add('on');
    toggleBtn.textContent = 'Apagar';
  } else {
    statusDiv.textContent = 'Apagada';
    statusDiv.classList.remove('on');
    statusDiv.classList.add('off');
    toggleBtn.textContent = 'Encender';
  }
}

// ---------------- EVENT ----------------
toggleBtn.addEventListener('click', toggleLight);

// ---------------- INIT ----------------
fetchStatus();

// opcional: refrescar cada 5s
setInterval(fetchStatus, 5000);