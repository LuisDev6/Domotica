const axios = require('axios');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const BASE_URL = process.env.TUYA_BASE_URL;
const CLIENT_ID = process.env.TUYA_CLIENT_ID;
const CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET;

console.log({
  CLIENT_ID,
  CLIENT_SECRET,
  BASE_URL
});

// --- Hash SHA256 ---
function sha256(content) {
  if (!content) content = '';
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

// --- Firma Tuya ---
function signRequest({ method, path, body, accessToken = '' }) {
  const t = Date.now().toString();
  let bodyStr = '';

  if (method !== 'GET' && body) {
    bodyStr = JSON.stringify(body);
  }

  const contentHash = sha256(bodyStr);

  const stringToSign = [
    method.toUpperCase(),
    contentHash,
    '',
    path
  ].join('\n');

  const signStr = CLIENT_ID + accessToken + t + stringToSign;

  const sign = CryptoJS.HmacSHA256(signStr, CLIENT_SECRET)
    .toString(CryptoJS.enc.Hex)
    .toUpperCase();

  return { sign, t };
}

// --- TOKEN PERSISTENTE ---
let accessToken = null;
let tokenExpireTime = 0;

async function getToken() {
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken;
  }

  const path = '/v1.0/token?grant_type=1';
  const { sign, t } = signRequest({ method: 'GET', path });

  const res = await axios.get(`${BASE_URL}${path}`, {
    headers: {
      client_id: CLIENT_ID,
      sign,
      t,
      sign_method: 'HMAC-SHA256'
    }
  });

  if (!res.data.success) {
    throw new Error('Error obteniendo token');
  }

  accessToken = res.data.result.access_token;
  // Guardamos tiempo de expiración (10s de margen)
  tokenExpireTime = Date.now() + res.data.result.expire_time * 1000 - 10000;

  console.log('Access token:', accessToken, 'Expire at:', new Date(tokenExpireTime).toLocaleTimeString());

  return accessToken;
}

// --- REQUEST GENÉRICA ---
async function request({ method, path, body = null }) {
  const token = await getToken();
  const { sign, t } = signRequest({
    method,
    path,
    body,
    accessToken: token
  });

  const res = await axios({
    method,
    url: BASE_URL + path,
    data: body,
    headers: {
      client_id: CLIENT_ID,
      access_token: token,
      sign,
      t,
      sign_method: 'HMAC-SHA256',
      'Content-Type': 'application/json'
    }
  });

  return res.data;
}

module.exports = { request };