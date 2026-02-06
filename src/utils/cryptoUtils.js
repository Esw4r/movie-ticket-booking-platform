// RSA Key Generation and Hybrid Encryption Utilities
import forge from 'node-forge';
import CryptoJS from 'crypto-js';

// Generate RSA key pair
export const generateKeyPair = () => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
  };
};

// Encrypt data with RSA public key
export const encryptWithPublicKey = (data, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return forge.util.encode64(encrypted);
};

// Decrypt data with RSA private key
export const decryptWithPrivateKey = (encryptedData, privateKeyPem) => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const decoded = forge.util.decode64(encryptedData);
  const decrypted = privateKey.decrypt(decoded, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return decrypted;
};

// Generate a random AES key
export const generateAESKey = () => {
  return CryptoJS.lib.WordArray.random(256 / 8).toString();
};

// AES Encryption
export const aesEncrypt = (data, key) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key);
  return encrypted.toString();
};

// AES Decryption
export const aesDecrypt = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Hybrid Encryption: Encrypt data with AES, encrypt AES key with RSA
export const hybridEncrypt = (data, publicKeyPem) => {
  const aesKey = generateAESKey();
  const encryptedData = aesEncrypt(data, aesKey);
  const encryptedKey = encryptWithPublicKey(aesKey, publicKeyPem);
  
  return {
    encryptedData,
    encryptedKey
  };
};

// Hybrid Decryption: Decrypt AES key with RSA, then decrypt data with AES
export const hybridDecrypt = (encryptedPayload, privateKeyPem) => {
  const aesKey = decryptWithPrivateKey(encryptedPayload.encryptedKey, privateKeyPem);
  const decryptedData = aesDecrypt(encryptedPayload.encryptedData, aesKey);
  
  return decryptedData;
};

// Store keys in localStorage (for demo purposes)
export const initializeKeys = () => {
  let keys = localStorage.getItem('systemKeys');
  if (!keys) {
    const keyPair = generateKeyPair();
    localStorage.setItem('systemKeys', JSON.stringify(keyPair));
    return keyPair;
  }
  return JSON.parse(keys);
};

export const getKeys = () => {
  const keys = localStorage.getItem('systemKeys');
  if (!keys) {
    return initializeKeys();
  }
  return JSON.parse(keys);
};
