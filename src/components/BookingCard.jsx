// Booking Card Component with QR Code
import { useState, useEffect } from 'react';
import { generateBookingQRCode } from '../utils/encodingUtils';
import { verifySignedMessage } from '../utils/signatureUtils';
import { getKeys } from '../utils/cryptoUtils';

const BookingCard = ({ booking, showVerification = false }) => {
    const [qrCode, setQrCode] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        const generateQR = async () => {
            if (booking.signature) {
                const qr = await generateBookingQRCode(booking.id, booking.signature);
                setQrCode(qr);
            }
        };
        generateQR();
    }, [booking]);

    const handleVerify = () => {
        if (booking.signedMessage) {
            const keys = getKeys();
            const result = verifySignedMessage(booking.signedMessage, keys.publicKey);
            setVerificationStatus(result);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={`booking-card ${verificationStatus?.valid === false ? 'tampered' : ''}`}>
            <div className="booking-header">
                <h3>🎫 Booking #{booking.id.slice(-8)}</h3>
                <span className={`booking-status ${booking.status}`}>
                    {booking.status}
                </span>
            </div>

            <div className="booking-details">
                <div className="booking-info">
                    <div className="info-row">
                        <span className="label">Movie:</span>
                        <span className="value">{booking.movieTitle}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(booking.showDate)}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Time:</span>
                        <span className="value">{booking.showTime}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Hall:</span>
                        <span className="value">{booking.hall}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Seats:</span>
                        <span className="value">{booking.seats.join(', ')}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Total:</span>
                        <span className="value price">₹{booking.totalAmount}</span>
                    </div>
                </div>

                {qrCode && (
                    <div className="booking-qr">
                        <img src={qrCode} alt="Booking QR Code" />
                        <p className="qr-label">Scan to verify</p>
                    </div>
                )}
            </div>

            {showVerification && (
                <div className="booking-verification">
                    <button onClick={handleVerify} className="btn-verify">
                        🔍 Verify Signature
                    </button>

                    {verificationStatus && (
                        <div className={`verification-result ${verificationStatus.valid ? 'valid' : 'invalid'}`}>
                            {verificationStatus.valid ? (
                                <>
                                    <span className="icon">✅</span>
                                    <span>Signature Valid - Booking is authentic</span>
                                </>
                            ) : (
                                <>
                                    <span className="icon">❌</span>
                                    <span>{verificationStatus.reason}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="booking-security-info">
                <details>
                    <summary>🔐 Security Details</summary>
                    <div className="security-details">
                        <p><strong>Encryption:</strong> Booking data encrypted with AES-256</p>
                        <p><strong>Key Exchange:</strong> AES key secured with RSA-2048</p>
                        <p><strong>Signature:</strong> SHA-256 hash signed with RSA private key</p>
                        <p><strong>QR Code:</strong> Contains booking ID + truncated signature</p>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default BookingCard;
