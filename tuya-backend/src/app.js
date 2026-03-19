const express = require('express');
const cors = require('cors');
const app = express();

const light = require('./controllers/lightController');

app.use(cors());
app.use(express.json());

// Endpoints
app.post('/light/on', light.on);
app.post('/light/off', light.off);
app.post('/light/brightness', light.brightness);
app.post('/light/colorTemp', light.colorTemp);
app.get('/light/status', light.status);

// Levantar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});