import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './database.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, role],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    success: true,
                    message: 'Registration successful',
                    userId: this.lastID
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'Invalid username or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

        // In a real app, generate JWT here
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    });
});

// --- Movie Routes ---

// Get all movies
app.get('/api/movies', (req, res) => {
    db.all("SELECT * FROM movies", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add movie (Admin only - simplified check)
app.post('/api/movies', (req, res) => {
    const { title, director, year, genre, description, poster, rating, duration } = req.body;
    const sql = "INSERT INTO movies (title, director, year, genre, description, poster, rating, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const params = [title, director, year, genre, description, poster, rating, duration];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            id: this.lastID,
            title, director, year, genre, description, poster, rating, duration
        });
    });
});

// Update movie
app.put('/api/movies/:id', (req, res) => {
    const { title, director, year, genre, description, poster, rating, duration } = req.body;
    const sql = `UPDATE movies SET 
    title = ?, director = ?, year = ?, genre = ?, description = ?, poster = ?, rating = ?, duration = ?
    WHERE id = ?`;
    const params = [title, director, year, genre, description, poster, rating, duration, req.params.id];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie updated', changes: this.changes });
    });
});

// Delete movie
app.delete('/api/movies/:id', (req, res) => {
    db.run("DELETE FROM movies WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie deleted', changes: this.changes });
    });
});

// --- Booking Routes ---

// Create a new booking
app.post('/api/bookings', (req, res) => {
    console.log('Received booking request:', req.body);

    const {
        booking_id, user_id, username, movie_id, movie_title,
        show_date, show_time, hall, seats, total_amount,
        encrypted_payment, signature, qr_code, status
    } = req.body;

    const sql = `INSERT INTO bookings 
        (booking_id, user_id, username, movie_id, movie_title, show_date, show_time, hall, seats, total_amount, encrypted_payment, signature, qr_code, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        booking_id, user_id, username, movie_id, movie_title,
        show_date, show_time, hall, JSON.stringify(seats), total_amount,
        encrypted_payment ? JSON.stringify(encrypted_payment) : null,
        signature || null,
        qr_code || null,
        status || 'confirmed'
    ];

    console.log('SQL params:', params);

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Booking saved successfully, ID:', this.lastID);
        res.json({
            success: true,
            id: this.lastID,
            booking_id
        });
    });
});

// Get all bookings (Admin/Staff)
app.get('/api/bookings', (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON fields
        const bookings = rows.map(row => ({
            ...row,
            seats: JSON.parse(row.seats || '[]'),
            encrypted_payment: row.encrypted_payment ? JSON.parse(row.encrypted_payment) : null
        }));
        res.json(bookings);
    });
});

// Get bookings for a specific user
app.get('/api/bookings/user/:userId', (req, res) => {
    db.all("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON fields
        const bookings = rows.map(row => ({
            ...row,
            seats: JSON.parse(row.seats || '[]'),
            encrypted_payment: row.encrypted_payment ? JSON.parse(row.encrypted_payment) : null
        }));
        res.json(bookings);
    });
});

// Get a single booking by booking_id
app.get('/api/bookings/:bookingId', (req, res) => {
    db.get("SELECT * FROM bookings WHERE booking_id = ?", [req.params.bookingId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Booking not found' });
        res.json({
            ...row,
            seats: JSON.parse(row.seats || '[]'),
            encrypted_payment: row.encrypted_payment ? JSON.parse(row.encrypted_payment) : null
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
