// Digital Signature Utilities using SHA-256 and RSA
import forge from 'node-forge';

// Create SHA-256 hash of data
export const createHash = (data) => {
    const md = forge.md.sha256.create();
    md.update(JSON.stringify(data));
    return md.digest().toHex();
};

// Sign data using RSA private key (hash + encrypt)
export const signData = (data, privateKeyPem) => {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const md = forge.md.sha256.create();
    md.update(JSON.stringify(data), 'utf8');

    const signature = privateKey.sign(md);
    return forge.util.encode64(signature);
};

// Verify signature using RSA public key
export const verifySignature = (data, signature, publicKeyPem) => {
    try {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const md = forge.md.sha256.create();
        md.update(JSON.stringify(data), 'utf8');

        const signatureBytes = forge.util.decode64(signature);
        return publicKey.verify(md.digest().bytes(), signatureBytes);
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
};

// Create signed message
export const createSignedMessage = (data, privateKeyPem) => {
    // We expect 'data' to already contain any necessary timestamps (e.g., bookedAt)
    // This ensures consistency between the signed object and what is stored/retrieved
    const hash = createHash(data);
    const signature = signData(data, privateKeyPem);

    return {
        data,
        hash,
        signature
    };
};

// Verify signed message
export const verifySignedMessage = (signedMessage, publicKeyPem) => {
    const { data, hash, signature } = signedMessage;

    // Verify hash if provided
    if (hash) {
        const computedHash = createHash(data);
        if (computedHash !== hash) {
            return { valid: false, reason: 'Hash mismatch - data may have been tampered' };
        }
    }

    // Verify signature
    const signatureValid = verifySignature(data, signature, publicKeyPem);
    if (!signatureValid) {
        return { valid: false, reason: 'Invalid signature - authenticity cannot be verified' };
    }

    return { valid: true, reason: 'Message integrity and authenticity verified' };
};
