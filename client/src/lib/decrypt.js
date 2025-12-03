import CryptoJS from "crypto-js";

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
export async function arrayBufferToWordArray(ab) {
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

export async function decryptText(ciphertext, passphrase) {
  try {
    return CryptoJS.AES.decrypt(ciphertext, passphrase).toString(CryptoJS.enc.Utf8) || '';
  } catch (e) { return ''; }
}

export async function decryptBase64FileToBlob(b64Cipher, passphrase, mimeType) {
  const cipherWA = base64ToWordArray(b64Cipher);
  const plainWA = CryptoJS.AES.decrypt({ ciphertext: cipherWA }, passphrase);
  const ab = wordArrayToArrayBuffer(plainWA);
  return new Blob([ab], { type: mimeType || 'application/octet-stream' });
}
