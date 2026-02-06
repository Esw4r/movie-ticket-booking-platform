// OTP Modal Component with Timer
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const OTPModal = ({ displayOTP, onVerify, onCancel }) => {
    const { getOTPRemainingTime, isOTPExpired, regenerateOTP, currentOTP } = useAuth();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [remainingTime, setRemainingTime] = useState(60);
    const [showOTP, setShowOTP] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            const time = getOTPRemainingTime();
            setRemainingTime(time);

            if (time === 0) {
                setShowOTP(false);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [getOTPRemainingTime]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        onVerify(otp);
    };

    const handleResendOTP = () => {
        const result = regenerateOTP();
        if (result) {
            setRemainingTime(60);
            setShowOTP(true);
            setError('');
            setOtp('');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal otp-modal">
                <div className="modal-header">
                    <h2>🔐 Two-Factor Authentication</h2>
                    <p>Enter the OTP to complete login</p>
                </div>

                <div className="otp-display-section">
                    <div className="otp-info">
                        <span className="otp-label">Your OTP Code:</span>
                        {showOTP && remainingTime > 0 ? (
                            <div className="otp-code-display">
                                <span className="otp-code">{currentOTP}</span>
                                <div className={`otp-timer ${remainingTime <= 10 ? 'expiring' : ''}`}>
                                    ⏱️ {formatTime(remainingTime)}
                                </div>
                            </div>
                        ) : (
                            <div className="otp-expired">
                                <span>OTP Expired</span>
                                <button
                                    type="button"
                                    className="btn-resend"
                                    onClick={handleResendOTP}
                                >
                                    🔄 Generate New OTP
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="otp-note">
                        <strong>Security Demo:</strong> In production, this OTP would be sent via email/SMS
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="otp-form">
                    <div className="form-group">
                        <label htmlFor="otp">Enter OTP</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            autoComplete="off"
                            className="otp-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={remainingTime === 0}
                        >
                            Verify OTP
                        </button>
                    </div>
                </form>

                <div className="security-info">
                    <h4>🔒 MFA Security</h4>
                    <ul>
                        <li><strong>Factor 1:</strong> Something you know (password)</li>
                        <li><strong>Factor 2:</strong> Something you have (OTP)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;
