import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const verboseSqlite = sqlite3.verbose();

const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Movies Table
        db.run(`CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      director TEXT,
      year INTEGER,
      genre TEXT,
      description TEXT,
      poster TEXT,
      rating TEXT,
      duration INTEGER
    )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE,
      user_id INTEGER,
      username TEXT,
      movie_id INTEGER,
      movie_title TEXT,
      show_date TEXT,
      show_time TEXT,
      hall TEXT,
      seats TEXT,
      total_amount REAL,
      status TEXT DEFAULT 'confirmed',
      encrypted_payment TEXT,
      signature TEXT,
      qr_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (movie_id) REFERENCES movies(id)
    )`);

        // Seed Movies if empty
        db.get("SELECT count(*) as count FROM movies", [], (err, row) => {
            if (err) return console.error(err.message);
            if (row.count === 0) {
                console.log('Seeding movies...');
                const movies = [
                    {
                        title: "There Will Be Blood",
                        director: "Paul Thomas Anderson",
                        year: 2007,
                        genre: "Drama",
                        description: "A story of family, religion, hatred, oil and madness, focusing on a turn-of-the-century prospector in the early days of the business.",
                        poster: "https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_.jpg",
                        rating: "R",
                        duration: 158
                    },
                    {
                        title: "The Darjeeling Limited",
                        director: "Wes Anderson",
                        year: 2007,
                        genre: "Adventure, Comedy, Drama",
                        description: "A year after their father's funeral, three brothers travel across India by train in an attempt to bond with each other.",
                        poster: "https://m.media-amazon.com/images/M/MV5BODkzMjhjYTQtYmQyOS00NmZlLTg3Y2UtYjkzMDRjODQ2ZTE4XkFtZTcwMTQ3NTMxMw@@._V1_.jpg",
                        rating: "R",
                        duration: 91
                    },
                    {
                        title: "Apocalypse Now",
                        director: "Francis Ford Coppola",
                        year: 1979,
                        genre: "Drama, Mystery, War",
                        description: "A U.S. Army officer serving in Vietnam is tasked with assassinating a renegade Special Forces Colonel who sees himself as a god.",
                        poster: "https://m.media-amazon.com/images/M/MV5BMDdhODg0MjYtODI3MC00ZWQ5LWE2NjItYjJkZGFiYjMmMDlhXkFtZTgwODQxMTkyMTE@._V1_.jpg",
                        rating: "R",
                        duration: 147
                    }
                ];

                const insert = db.prepare("INSERT INTO movies (title, director, year, genre, description, poster, rating, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                movies.forEach(movie => {
                    insert.run(movie.title, movie.director, movie.year, movie.genre, movie.description, movie.poster, movie.rating, movie.duration);
                });
                insert.finalize();
            }
        });

        // Seed Admin User if empty
        db.get("SELECT count(*) as count FROM users WHERE role = 'Admin'", [], async (err, row) => {
            if (err) return console.error(err.message);
            if (row.count === 0) {
                console.log('Seeding admin user...');
                const hashedPassword = await bcrypt.hash('Admin@123', 10);
                db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', hashedPassword, 'Admin']);
                const staffPassword = await bcrypt.hash('Staff@123', 10);
                db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['staff', staffPassword, 'Staff']);
            }
        });
    });
}

export default db;
