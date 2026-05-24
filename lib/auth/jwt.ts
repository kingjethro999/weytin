const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long-for-security';

// Helper to encode to base64url
function base64url(str: string | ArrayBuffer): string {
  const buffer = typeof str === 'string' ? new TextEncoder().encode(str) : new Uint8Array(str);
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper to decode from base64url
function debase64url(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Generate a key from the secret
async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(payload: any, expiryInSeconds = 604800): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiryInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  const encodedSignature = base64url(signatureBuffer);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const key = await getCryptoKey();

    // Standard base64 decoding of the signature
    const binary = atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      signatureBytes[i] = binary.charCodeAt(i);
    }

    const dataToVerify = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataToVerify
    );

    if (!isValid) return null;

    const payload = JSON.parse(debase64url(encodedPayload));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (error) {
    return null;
  }
}
