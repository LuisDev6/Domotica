const { request } = require('../config/tuyaClient');
require('dotenv').config();

const DEVICE_ID = process.env.TUYA_DEVICE_ID;

async function turnOn() {
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: { commands: [{ code: 'switch_led', value: true }] }
  });
}

async function turnOff() {
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: { commands: [{ code: 'switch_led', value: false }] }
  });
}

async function setBrightness(value) {
  const clamped = Math.max(10, Math.min(1000, value));
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: {
      commands: [
        { code: 'work_mode',       value: 'white'   },
        { code: 'bright_value_v2', value: clamped   }
      ]
    }
  });
}

async function setColorTemp(value) {
  const clamped = Math.max(0, Math.min(1000, value));
  return request({
    method: 'POST',
    path: `/v1.0/iot-03/devices/${DEVICE_ID}/commands`,
    body: {
      commands: [
        { code: 'work_mode',     value: 'white'  },
        { code: 'temp_value_v2', value: clamped  }
      ]
    }
  });
}

async function getLightStatus() {
  const res = await request({
    method: 'GET',
    path: `/v1.0/devices/${DEVICE_ID}/status`
  });

  console.log('RAW status response:', JSON.stringify(res, null, 2));

  if (!res.success || !Array.isArray(res.result)) {
    throw new Error(`Error obteniendo estado: ${res.msg || 'respuesta inválida'}`);
  }

  return res.result.reduce((acc, item) => {
    acc[item.code] = item.value;
    return acc;
  }, {});
}

module.exports = { turnOn, turnOff, setBrightness, setColorTemp, getLightStatus };