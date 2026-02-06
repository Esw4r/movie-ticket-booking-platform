// Login Page Component
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [displayOTP, setDisplayOTP] = useState('');

    const { loginStep1, loginStep2, cancelAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await loginStep1(username, password);
            if (result.requiresOTP) {
                setDisplayOTP(result.displayOTP);
                setShowOTPModal(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPVerify = (otp) => {
        try {
            const result = loginStep2(otp);
            if (result.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancelOTP = () => {
        setShowOTPModal(false);
        cancelAuth();
        setError('');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>🎬 CineSecure</h1>
                    <h2>Welcome Back</h2>
                    <p>Sign in to book your tickets</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>

                <div className="security-note">
                    <h4>🔐 Authentication Security</h4>
                    <ul>
                        <li>Password hashed with bcrypt + salt</li>
                        <li>Multi-factor authentication with OTP</li>
                        <li>Session stored securely</li>
                    </ul>
                </div>
            </div>

            {showOTPModal && (
                <OTPModal
                    displayOTP={displayOTP}
                    onVerify={handleOTPVerify}
                    onCancel={handleCancelOTP}
                />
            )}
        </div>
    );
};

export default Login;
