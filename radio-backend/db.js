const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
    // Authentication user table
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

    // Tracks table
    db.run(`CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE,
    originalname TEXT,
    size INTEGER,
    duration REAL DEFAULT 0,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // Playlists table
    db.run(`CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // Playlist to Track mapping (M:N)
    db.run(`CREATE TABLE IF NOT EXISTS playlist_tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER,
    track_id INTEGER,
    position INTEGER,
    FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
  )`);

    // Schedule mapping
    db.run(`CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    type TEXT, -- 'track' or 'playlist'
    item_id INTEGER, -- refers to tracks(id) or playlists(id)
    start_time INTEGER, -- Unix timestamp (milliseconds)
    end_time INTEGER, -- Unix timestamp (milliseconds)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
