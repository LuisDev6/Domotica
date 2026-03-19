document.addEventListener('DOMContentLoaded', () => {
  const btnOn = document.getElementById('btnOn');
  const btnOff = document.getElementById('btnOff');
  const sliderBrightness = document.getElementById('sliderBrightness');
  const sliderColorTemp = document.getElementById('sliderColorTemp');
  const statusText = document.getElementById('statusText');

  // 🔹 Función para obtener el estado de la lámpara
  async function fetchStatus() {
    try {
      const res = await fetch('http://localhost:3000/light/status');
      const data = await res.json();

      if (data.code || data.error) {
        console.error('fetchStatus: data.result no es válido', data);
        statusText.textContent = 'Error al obtener estado';
        return;
      }

      // Actualizar visual
      const isOn = data.switch_led;
      statusText.textContent = isOn ? 'Encendida' : 'Apagada';
      sliderBrightness.value = data.bright_value_v2 ?? 0;
      sliderColorTemp.value = data.temp_value_v2 ?? 1000;

    } catch (err) {
      console.error('Error fetchStatus:', err);
      statusText.textContent = 'Error al obtener estado';
    }
  }

  // 🔹 Función para enviar comando
  async function sendCommand(endpoint, body = null) {
    try {
      const res = await fetch(`http://localhost:3000/light/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      });

      const data = await res.json();
      console.log(`Respuesta ${endpoint}:`, data);

      // Actualizar estado después del comando
      fetchStatus();
    } catch (err) {
      console.error(`Error sendCommand ${endpoint}:`, err);
    }
  }

  // 🔹 Event listeners
  btnOn.addEventListener('click', () => sendCommand('on'));
  btnOff.addEventListener('click', () => sendCommand('off'));

  sliderBrightness.addEventListener('input', () => {
    sendCommand('brightness', { value: parseInt(sliderBrightness.value) });
  });

  sliderColorTemp.addEventListener('input', () => {
    sendCommand('colorTemp', { value: parseInt(sliderColorTemp.value) });
  });

  // 🔹 Inicializar estado al cargar
  fetchStatus();
});