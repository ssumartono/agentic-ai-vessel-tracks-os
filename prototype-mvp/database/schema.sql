-- schema.sql

CREATE TABLE IF NOT EXISTS vessels (
    mmsi TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS vessel_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mmsi TEXT,
    lat REAL,
    lon REAL,
    speed REAL,
    course REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mmsi) REFERENCES vessels(mmsi)
);

CREATE TABLE IF NOT EXISTS geofences (
    id TEXT PRIMARY KEY,
    name TEXT,
    coordinates TEXT -- JSON array of [lat, lon] points representing a polygon
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mmsi TEXT,
    geofence_id TEXT,
    event_type TEXT, -- 'enter' or 'exit'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mmsi) REFERENCES vessels(mmsi),
    FOREIGN KEY (geofence_id) REFERENCES geofences(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    role TEXT NOT NULL,
    is_granted INTEGER DEFAULT 0,
    UNIQUE(module, role)
);

-- Index for querying positions quickly
CREATE INDEX IF NOT EXISTS idx_vessel_positions_mmsi ON vessel_positions(mmsi);
CREATE INDEX IF NOT EXISTS idx_vessel_positions_timestamp ON vessel_positions(timestamp DESC);
