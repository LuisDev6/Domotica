const { request } = require('../config/tuyaClient');
require('dotenv').config();

const DEVICE_ID = process.env.TUYA_DEVICE_ID;

// 🔹 Prender luz
async function turnOn() {
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: { commands: [{ code: 'switch_led', value: true }] }
  });
}

// 🔹 Apagar luz
async function turnOff() {
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: { commands: [{ code: 'switch_led', value: false }] }
  });
}

// 🔹 Cambiar brillo (0-1000)
async function setBrightness(value) {
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: { commands: [{ code: 'bright_value_v2', value }] }
  });
}

// 🔹 Cambiar temperatura de color (1000-10000)
async function setColorTemp(value) {
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: { commands: [{ code: 'temp_value_v2', value }] }
  });
}

// 🔹 Obtener estado de la lámpara
async function getLightStatus() {
  try {
    const res = await request({
      method: 'GET',
      path: `/v1.0/devices/${DEVICE_ID}/status`
    });

    if (!res.success || !Array.isArray(res.result)) {
      throw new Error('Respuesta inválida del dispositivo');
    }

    const status = res.result.reduce((acc, item) => {
      acc[item.code] = item.value;
      return acc;
    }, {});

    return status;
  } catch (error) {
    console.error('getLightStatus: respuesta inválida', error.response?.data || error);
    throw error;
  }
}

module.exports = {
  turnOn,
  turnOff,
  setBrightness,
  setColorTemp,
  getLightStatus
};