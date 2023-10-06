import crypto from 'crypto'
import { EncryptionAlgorithms } from '../types/encryption-algos';

type EncryptResponse = {
  iv: string,
  encryptedData: string
}

/**
 * Encrypts `text` using an initialization vector and a key
 * @param text secret to encrypt
 * @param key encryption key
 * @param encryptAlg Optional, defaults to AES
 * @returns EncryptResponse { iv: string, encryptedData: string }
 */
export function encrypt(
  text: string, 
  key: string, 
  encryptAlg: EncryptionAlgorithms = EncryptionAlgorithms.AES
): EncryptResponse  {
  const iv = crypto.randomBytes(16);
  const keyHash = crypto.createHash('sha256').update(key).digest('base64').slice(0, 32);
  const cipher = crypto.createCipheriv(encryptAlg, Buffer.from(keyHash), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

/**
 * Decrypts `encryptedData` using an initialization vector and a key
 * @param encryptedData string
 * @param iv initialization vector 
 * @param key encryption key 
 * @returns string
 */
export function decrypt(
  encryptedData: string, 
  iv: string, 
  key: string, 
  encryptAlg: EncryptionAlgorithms = EncryptionAlgorithms.AES
): string {
  try {
    const encryptedText = Buffer.from(encryptedData, 'hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('base64').slice(0, 32);
    const decipher = crypto.createDecipheriv(encryptAlg, Buffer.from(keyHash), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return null
  }
}