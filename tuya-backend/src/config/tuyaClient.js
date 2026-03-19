const axios = require('axios');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
require('dotenv').config();

const BASE_URL = process.env.TUYA_BASE_URL;
const CLIENT_ID = process.env.TUYA_CLIENT_ID;
const CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET;

function sha256(content) {
  if (!content) content = '';
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

function buildSign({ method, path, body, accessToken = '', nonce = '', t }) {
  let bodyStr = '';
  if (method !== 'GET' && body) {
    bodyStr = JSON.stringify(body);
  }
  const contentHash = sha256(bodyStr);
  const stringToSign = [method.toUpperCase(), contentHash, '', path].join('\n');

  const signStr = nonce
    ? CLIENT_ID + accessToken + t + nonce + stringToSign
    : CLIENT_ID + accessToken + t + stringToSign;

  return CryptoJS.HmacSHA256(signStr, CLIENT_SECRET)
    .toString(CryptoJS.enc.Hex)
    .toUpperCase();
}

// --- Caché del token ---
let cachedToken = null;
let tokenExpireTime = 0;

async function getToken() {
  // Si el token es válido, reutilizarlo
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  const path = '/v1.0/token?grant_type=1';
  const t = Date.now().toString();
  const sign = buildSign({ method: 'GET', path, t });

  const res = await axios.get(`${BASE_URL}${path}`, {
    headers: { client_id: CLIENT_ID, sign, t, sign_method: 'HMAC-SHA256' }
  });

  if (!res.data.success) throw new Error(`Error obteniendo token: ${JSON.stringify(res.data)}`);

  cachedToken = res.data.result.access_token;
  // 10 segundos de margen antes del vencimiento real
  tokenExpireTime = Date.now() + res.data.result.expire_time * 1000 - 10000;

  return cachedToken;
}

async function request({ method, path, body = null }) {
  const token = await getToken();
  const t = Date.now().toString();

  let sign, headers;

  if (method === 'GET') {
    const nonce = crypto.randomUUID();
    sign = buildSign({ method, path, t, accessToken: token, nonce });
    headers = {
      client_id: CLIENT_ID,
      access_token: token,
      sign, t, nonce,
      sign_method: 'HMAC-SHA256'
    };
  } else {
    sign = buildSign({ method, path, body, t, accessToken: token });
    headers = {
      client_id: CLIENT_ID,
      access_token: token,
      sign, t,
      sign_method: 'HMAC-SHA256',
      'Content-Type': 'application/json'
    };
  }

  const res = await axios({ method, url: BASE_URL + path, data: body, headers });
  return res.data;
}

module.exports = { request };