import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

export function encryptTotpSecret(secret: string, key: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    'aes-256-gcm',
    createHmac('sha256', key).update('totp').digest(),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}
export function decryptTotpSecret(value: string, key: string) {
  const [iv, tag, data] = value.split('.');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    createHmac('sha256', key).update('totp').digest(),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
function base32Decode(value: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of value.toUpperCase().replace(/=+$/, '')) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error('Invalid TOTP secret');
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8)
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
export function verifyTotp(
  secret: string,
  code: string,
  timestamp = Date.now(),
) {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(timestamp / 30000);
  return [-1, 0, 1].some((offset) => {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter + offset));
    const digest = createHmac('sha1', base32Decode(secret))
      .update(buffer)
      .digest();
    const position = digest[digest.length - 1] & 15;
    const value = (digest.readUInt32BE(position) & 0x7fffffff) % 1000000;
    const expected = String(value).padStart(6, '0');
    return timingSafeEqual(Buffer.from(expected), Buffer.from(code));
  });
}
