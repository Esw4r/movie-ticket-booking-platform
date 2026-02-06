// Encoding Utilities - Base64 and QR Code
import QRCode from 'qrcode';

// Base64 Encoding
export const encodeBase64 = (data) => {
    if (typeof data === 'object') {
        return btoa(JSON.stringify(data));
    }
    return btoa(data);
};

// Base64 Decoding
export const decodeBase64 = (encodedData) => {
    try {
        const decoded = atob(encodedData);
        try {
            return JSON.parse(decoded);
        } catch {
            return decoded;
        }
    } catch (error) {
        console.error('Base64 decoding failed:', error);
        return null;
    }
};

// Generate QR Code as Data URL
export const generateQRCode = async (data) => {
    try {
        const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
        const qrDataUrl = await QRCode.toDataURL(dataString, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        return qrDataUrl;
    } catch (error) {
        console.error('QR Code generation failed:', error);
        return null;
    }
};

// Generate QR Code with booking info and signature
export const generateBookingQRCode = async (bookingId, signature) => {
    const qrData = {
        bookingId,
        signature: signature.substring(0, 50) + '...', // Truncate for QR size
        verifyAt: window.location.origin
    };
    return await generateQRCode(qrData);
};
