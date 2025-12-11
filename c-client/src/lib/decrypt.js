import CryptoJS from "crypto-js";
import {
  base64ToUint8Array,
  bufferToBase64,
  arrayBufferToWordArray,
  wordArrayToBase64,
  // wordArrayToArrayBuffer, // we'll implement below
  importPublicKeyFromBase64,
} from './web-crypto-utils';
export async function base64ToWordArray(b64) {
  return CryptoJS.enc.Base64.parse(b64);
}
export async function wordArrayToArrayBuffer(wordArray) {
  const len = wordArray.sigBytes;
  const u8 = new Uint8Array(len);
  let offset = 0;
  const words = wordArray.words;
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    u8[offset++] = (word >>> 24) & 0xff; if (offset >= len) break;
    u8[offset++] = (word >>> 16) & 0xff; if (offset >= len) break;
    u8[offset++] = (word >>> 8) & 0xff; if (offset >= len) break;
    u8[offset++] = word & 0xff; if (offset >= len) break;
  }
  return u8.buffer;
}
// export async function arrayBufferToWordArray(ab) {
//   const u8 = new Uint8Array(ab);
//   const words = [];
//   for (let i = 0; i < u8.length; i += 4) {
//     words.push(
//       (u8[i] << 24) |
//       ((u8[i + 1] || 0) << 16) |
//       ((u8[i + 2] || 0) << 8) |
//       (u8[i + 3] || 0)
//     );
//   }
//   return CryptoJS.lib.WordArray.create(words, u8.length);
// }

// export async function decryptText(ciphertext, passphrase) {
//   try {
//     return CryptoJS.AES.decrypt(ciphertext, passphrase).toString(CryptoJS.enc.Utf8) || '';
//   } catch (e) { return ''; }
// }

// export async function decryptBase64FileToBlob(b64Cipher, passphrase, mimeType) {
//   const cipherWA = base64ToWordArray(b64Cipher);
//   const plainWA = CryptoJS.AES.decrypt({ ciphertext: cipherWA }, passphrase);
//   const ab = wordArrayToArrayBuffer(plainWA);
//   return new Blob([ab], { type: mimeType || 'application/octet-stream' });
// }


// export function wordArrayToArrayBuffer(wordArray) {
//   const len = wordArray.sigBytes;
//   const words = wordArray.words;
//   const ab = new ArrayBuffer(len);
//   const u8 = new Uint8Array(ab);
//   let idx = 0;
//   for (let i = 0; i < words.length; i++) {
//     const w = words[i];
//     u8[idx++] = (w >> 24) & 0xff;
//     if (idx >= len) break;
//     u8[idx++] = (w >> 16) & 0xff;
//     if (idx >= len) break;
//     u8[idx++] = (w >> 8) & 0xff;
//     if (idx >= len) break;
//     u8[idx++] = w & 0xff;
//     if (idx >= len) break;
//   }
//   return ab;
// }

// decrypt text (Ciphertext is CryptoJS string produced by CryptoJS.AES.encrypt)
export function decryptText(ciphertextString, passphrase) {
  const res = CryptoJS.AES.decrypt(ciphertextString, passphrase);
  const plaintext = res.toString(CryptoJS.enc.Utf8);
  return plaintext;
}

// decrypt a base64 ciphertext string (CryptoJS ciphertext encoded as base64) to a Blob
// expects ciphertextB64 produced by wordArrayToBase64(ciphertextWA) on encrypt side
export function decryptBase64FileToBlob(ciphertextB64, passphrase, mime = 'application/octet-stream') {
  // convert base64 -> CryptoJS WordArray
  const ciphertextWA = CryptoJS.enc.Base64.parse(ciphertextB64);
  const plainWA = CryptoJS.AES.decrypt({ ciphertext: ciphertextWA }, passphrase);
  const ab = wordArrayToArrayBuffer(plainWA);
  return new Blob([ab], { type: mime });
}

// helper to derive shared secret using WebCrypto ECDH given privateKey (pkcs8 ArrayBuffer or base64) and peer publicKey (base64 spki)
export async function deriveSharedSecretFromPrivatePkcs8(privatePkcs8ArrayBuffer, peerPublicKeyBase64) {
  // import private key (pkcs8)
  const priv = await crypto.subtle.importKey('pkcs8', privatePkcs8ArrayBuffer, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveBits']);
  const pub = await importPublicKeyFromBase64(peerPublicKeyBase64);
  // derive bits (we'll derive 521 bits rounded up to nearest byte; deriveBits requires bit length)
  const derived = await crypto.subtle.deriveBits({ name: 'ECDH', public: pub }, priv, 521); // returns ArrayBuffer
  // convert to hex string as original code did
  const u8 = new Uint8Array(derived);
  return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
}

// convenience: decrypt submission given stored privateKeyCipher (CryptoJS AES string encrypted with passphrase), salt/passphrase or server passphrase
// This mirrors your original flow: privateKeyCipher decrypted with provided passphrase -> yields pkcs8 base64 (or JSON array) -> derive shared secret with submission.publicKey
export async function decryptSubmissionGetPassphrase(privateKeyCipher, privateKeyPassphrase, submissionPublicKeyBase64) {
  // decrypt private key (returns utf8 string). May be JSON or raw base64 pkcs8.
  const privateKeyStr = CryptoJS.AES.decrypt(privateKeyCipher, privateKeyPassphrase).toString(CryptoJS.enc.Utf8);

  // try parse JSON array form -> convert to ArrayBuffer
  let privatePkcs8Buf;
  try {
    const parsed = JSON.parse(privateKeyStr);
    // expecting { data: [..] } or array of bytes
    const arr = Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed) ? parsed : null);
    if (!arr) throw new Error('Unexpected private key format');
    privatePkcs8Buf = new Uint8Array(arr).buffer;
  } catch (e) {
    // fallback: treat privateKeyStr as base64
    const u8 = base64ToUint8Array(privateKeyStr);
    privatePkcs8Buf = u8.buffer;
  }

  const sharedHex = await deriveSharedSecretFromPrivatePkcs8(privatePkcs8Buf, submissionPublicKeyBase64);
  return sharedHex;
}

export { arrayBufferToWordArray, wordArrayToBase64 };