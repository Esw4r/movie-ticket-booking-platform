// Register Page Component
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoles, policyDescriptions } from '../utils/accessControl';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Customer');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const roles = getRoles();

    const getPasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score <= 1) return { text: 'Weak', color: '#ff4757', width: '20%' };
        if (score <= 2) return { text: 'Fair', color: '#ffa502', width: '40%' };
        if (score <= 3) return { text: 'Good', color: '#2ed573', width: '60%' };
        if (score <= 4) return { text: 'Strong', color: '#1e90ff', width: '80%' };
        return { text: 'Very Strong', color: '#7bed9f', width: '100%' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(username, password, role);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container register-container">
                <div className="auth-header">
                    <h1>🎬 CineSecure</h1>
                    <h2>Create Account</h2>
                    <p>Join us for a secure movie experience</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
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
                            placeholder="Create a strong password"
                            required
                        />
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: passwordStrength.width,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    ></div>
                                </div>
                                <span style={{ color: passwordStrength.color }}>
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Select Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        {role && policyDescriptions[role] && (
                            <div className="role-description">
                                <strong>{policyDescriptions[role].title}</strong>
                                <p>{policyDescriptions[role].description}</p>
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>

                <div className="security-note">
                    <h4>🔐 Password Security</h4>
                    <ul>
                        <li>Password is hashed using bcrypt</li>
                        <li>Unique salt for each password</li>
                        <li>Original password never stored</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Register;
