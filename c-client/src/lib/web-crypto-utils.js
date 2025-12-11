// src/lib/webcrypto-utils.js
import CryptoJS from 'crypto-js';

export function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

export function hexFromUint8(arr) {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function uint8FromHex(hex) {
  const u8 = new Uint8Array(hex.length / 2);
  for (let i = 0; i < u8.length; i++) u8[i] = parseInt(hex.substr(i * 2, 2), 16);
  return u8;
}

export async function pbkdf2Hex(password, saltHex, iterations = 25000, keylen = 64, hash = 'SHA-512') {
  const enc = new TextEncoder();
  const pwKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const salt = uint8FromHex(saltHex);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash },
    pwKey,
    keylen * 8
  );
  return hexFromUint8(new Uint8Array(derived));
}

export function randomBytes(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

// ECDH helpers (P-521)
export async function generateECDHKeyPair() {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-521' },
    true,
    ['deriveKey', 'deriveBits']
  );
}

export async function exportPublicKeyToBase64(publicKey) {
  const spki = await crypto.subtle.exportKey('spki', publicKey);
  return bufferToBase64(spki);
}

export async function exportPrivateKeyArrayBuffer(privateKey) {
  return crypto.subtle.exportKey('pkcs8', privateKey);
}

export async function importPublicKeyFromBase64(b64) {
  const u8 = base64ToUint8Array(b64);
  return crypto.subtle.importKey('spki', u8.buffer, { name: 'ECDH', namedCurve: 'P-521' }, true, []);
}

// CryptoJS interop and file reader
export function arrayBufferToWordArray(ab) {
  const u8 = new Uint8Array(ab);
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      (u8[i] << 24) |
      ((u8[i + 1] || 0) << 16) |
      ((u8[i + 2] || 0) << 8) |
      (u8[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

export function wordArrayToBase64(wordArray) {
  return CryptoJS.enc.Base64.stringify(wordArray);
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => { fr.abort(); reject(new Error('File read error')); };
    fr.onload = () => resolve(fr.result);
    fr.readAsArrayBuffer(file);
  });
}
