const {
  turnOn,
  turnOff,
  setBrightness,
  setColorTemp,
  getLightStatus
} = require('../services/lightService');

// Encender luz
async function on(req, res) {
  try {
    const response = await turnOn();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Apagar luz
async function off(req, res) {
  try {
    const response = await turnOff();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Cambiar brillo
async function brightness(req, res) {
  try {
    const { value } = req.body;
    const response = await setBrightness(value);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Cambiar temperatura de color
async function colorTemp(req, res) {
  try {
    const { value } = req.body;
    const response = await setColorTemp(value);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener estado de la lámpara
async function status(req, res) {
  try {
    const data = await getLightStatus();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { on, off, brightness, colorTemp, status };