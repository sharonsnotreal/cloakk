// Lightweight E2E helper using libsodium-wrappers
// - Encrypts arbitrary bytes with XChaCha20-Poly1305
// - Encrypts the content key for recipients with crypto_box_seal (sealed box)
// - Returns base64-encoded ciphertext + metadata
//
// Usage:
//  import { encryptBytesForRecipients } from '../lib/e2e';
//  const recipients = [serverPubKeyB64]; // X25519-compatible public keys
//  const enc = await encryptBytesForRecipients(plainUint8Array, recipients);
//  // enc: { ciphertext, nonce, enc_keys: [{ recipient_pub, encrypted_key }], alg, version }

import sodium from 'libsodium-wrappers';

const ALG = 'XChaCha20-Poly1305+SealedBox';
const VERSION = '1';

async function ready() {
  if (!sodium.ready) await sodium.ready;
  return sodium;
}

// plaintextBytes: Uint8Array (or ArrayBuffer)
async function encryptBytesForRecipients(plaintextBytes, recipientsPubKeysB64 = []) {
  const s = await ready();

  const plaintext = plaintextBytes instanceof Uint8Array ? plaintextBytes : new Uint8Array(plaintextBytes);

  // 1) random content key
  const contentKey = s.randombytes_buf(s.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);

  // 2) encrypt using XChaCha20-Poly1305 AEAD
  const nonce = s.randombytes_buf(s.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const ciphertext = s.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    null, // associated data (optional)
    null,
    nonce,
    contentKey
  );

  // 3) For each recipient, encrypt contentKey using crypto_box_seal (sealed box)
  // recipientsPubKeysB64: array of base64 encoded recipient public keys (Curve25519)
  const enc_keys = recipientsPubKeysB64.map((recipientPubB64) => {
    const recipientPub = s.from_base64(recipientPubB64);
    const sealed = s.crypto_box_seal(contentKey, recipientPub);
    return {
      recipient_pub: recipientPubB64,
      encrypted_key: s.to_base64(sealed)
    };
  });

  return {
    ciphertext: s.to_base64(ciphertext),
    nonce: s.to_base64(nonce),
    enc_keys,
    alg: ALG,
    version: VERSION
  };
}

// Helper to read File -> Uint8Array
async function fileToUint8Array(file) {
  return new Uint8Array(await file.arrayBuffer());
}

export { encryptBytesForRecipients, fileToUint8Array };