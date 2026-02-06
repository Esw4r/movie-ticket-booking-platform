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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
