// Password Hashing Utilities using bcrypt
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Hash password with auto-generated salt
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

// Verify password against stored hash
export const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generate salt (for demonstration purposes)
export const generateSalt = async () => {
    return await bcrypt.genSalt(SALT_ROUNDS);
};

// Hash with specific salt (for demonstration purposes)
export const hashWithSalt = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};
