// Authentication Context - SFA + MFA with OTP
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeKeys } from '../utils/cryptoUtils';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/auth';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingAuth, setPendingAuth] = useState(null);
    const [currentOTP, setCurrentOTP] = useState(null);
    const [otpExpiry, setOtpExpiry] = useState(null);

    // Initialize keys and check for existing session
    useEffect(() => {
        initializeKeys();
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    // Generate 6-digit OTP
    const generateOTP = () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 60000; // 60 seconds validity
        setCurrentOTP(otp);
        setOtpExpiry(expiry);
        return { otp, expiry };
    };

    // Get remaining OTP time
    const getOTPRemainingTime = () => {
        if (!otpExpiry) return 0;
        const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
        return remaining;
    };

    // Check if OTP is expired
    const isOTPExpired = () => {
        return !otpExpiry || Date.now() > otpExpiry;
    };

    // Regenerate OTP
    const regenerateOTP = () => {
        if (pendingAuth) {
            const { otp, expiry } = generateOTP();
            console.log('🔑 New OTP Generated:', otp);
            return { otp, expiry };
        }
        return null;
    };

    // Register new user
    const register = async (username, password, role) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return { success: true, message: 'Registration successful' };
        } catch (error) {
            throw error;
        }
    };

    // Login - Step 1: Verify password (SFA)
    const loginStep1 = async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid username or password');
            }

            // Password verified by backend, generate OTP for MFA
            const { otp } = generateOTP();
            setPendingAuth(data.user);

            // Display OTP (simulating email/SMS)
            console.log('🔑 OTP for MFA:', otp);

            return {
                success: true,
                message: 'Password verified. Please enter OTP.',
                requiresOTP: true,
                displayOTP: otp
            };
        } catch (error) {
            throw error;
        }
    };

    // Login - Step 2: Verify OTP (MFA)
    const loginStep2 = (enteredOTP) => {
        if (!pendingAuth) {
            throw new Error('No pending authentication');
        }

        if (isOTPExpired()) {
            throw new Error('OTP has expired. Please request a new one.');
        }

        if (enteredOTP !== currentOTP) {
            throw new Error('Invalid OTP');
        }

        // OTP verified, complete login
        const loggedInUser = {
            id: pendingAuth.id,
            username: pendingAuth.username,
            role: pendingAuth.role
        };

        setUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

        // Clear pending auth
        setPendingAuth(null);
        setCurrentOTP(null);
        setOtpExpiry(null);

        return { success: true, message: 'Login successful' };
    };

    // Logout
    const logout = () => {
        setUser(null);
        setPendingAuth(null);
        setCurrentOTP(null);
        setOtpExpiry(null);
        localStorage.removeItem('currentUser');
    };

    // Cancel pending authentication
    const cancelAuth = () => {
        setPendingAuth(null);
        setCurrentOTP(null);
        setOtpExpiry(null);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        pendingAuth,
        currentOTP,
        otpExpiry,
        register,
        loginStep1,
        loginStep2,
        logout,
        cancelAuth,
        regenerateOTP,
        getOTPRemainingTime,
        isOTPExpired
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
