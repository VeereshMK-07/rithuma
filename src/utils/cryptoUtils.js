// src/utils/cryptoUtils.js

const KEY_NAME = "rithuma_crypto_key";

/* ------------------ Key handling ------------------ */

async function getCryptoKey() {
  const stored = localStorage.getItem(KEY_NAME);

  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey(
      "raw",
      raw,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    );
  }

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const exported = await crypto.subtle.exportKey("raw", key);
  const encoded = btoa(
    String.fromCharCode(...new Uint8Array(exported))
  );

  localStorage.setItem(KEY_NAME, encoded);
  return key;
}

/* ------------------ Encrypt / Decrypt ------------------ */

export async function encryptData(data) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    iv: Array.from(iv),
    value: Array.from(new Uint8Array(encrypted)),
  };
}

export async function decryptData(payload) {
  const key = await getCryptoKey();

  const iv = new Uint8Array(payload.iv);
  const encrypted = new Uint8Array(payload.value);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}
