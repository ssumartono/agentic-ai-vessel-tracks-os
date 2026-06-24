const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'vessel_tracking.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Initialize schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error executing schema', err.message);
            } else {
                console.log('Database schema initialized.');
                seedData();
            }
        });
    }
});

function seedData() {
    // Seed some initial geofences
    const geofences = [
        {
            id: 'GEOFENCE_01',
            name: 'Jakarta Port Zone',
            // Example coordinates for a polygon in Jakarta
            coordinates: JSON.stringify([
                [-6.09, 106.85],
                [-6.09, 106.91],
                [-6.12, 106.91],
                [-6.12, 106.85]
            ])
        }
    ];

    // Seed dummy users
    const users = [
        { username: 'admin', password_hash: '@adm1n', role: 'admin', created_by: 'system' },
        { username: 'operator', password_hash: 'hashed_operator123', role: 'operator', created_by: 'admin' },
        { username: 'viewer', password_hash: 'hashed_viewer123', role: 'viewer', created_by: 'admin' }
    ];

    db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO geofences (id, name, coordinates) VALUES (?, ?, ?)');
        for (const gf of geofences) {
            stmt.run(gf.id, gf.name, gf.coordinates);
        }
        stmt.finalize();

        const userStmt = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role, created_by) VALUES (?, ?, ?, ?)');
        for (const u of users) {
            userStmt.run(u.username, u.password_hash, u.role, u.created_by);
        }
        userStmt.finalize();

        // Seed dummy permissions
        const dummyPermissions = [
            { module: 'Vessel Tracking', role: 'admin', is_granted: 1 },
            { module: 'Vessel Tracking', role: 'operator', is_granted: 1 },
            { module: 'Vessel Tracking', role: 'supervisor', is_granted: 1 },
            { module: 'Vessel Tracking', role: 'analyst', is_granted: 1 },
            { module: 'Vessel Tracking', role: 'viewer', is_granted: 1 },
            
            { module: 'Geofence Management', role: 'admin', is_granted: 1 },
            { module: 'Geofence Management', role: 'operator', is_granted: 0 },
            { module: 'Geofence Management', role: 'supervisor', is_granted: 1 },
            { module: 'Geofence Management', role: 'analyst', is_granted: 0 },
            { module: 'Geofence Management', role: 'viewer', is_granted: 0 },
            
            { module: 'Alert Acknowledgment', role: 'admin', is_granted: 1 },
            { module: 'Alert Acknowledgment', role: 'operator', is_granted: 1 },
            { module: 'Alert Acknowledgment', role: 'supervisor', is_granted: 1 },
            { module: 'Alert Acknowledgment', role: 'analyst', is_granted: 0 },
            { module: 'Alert Acknowledgment', role: 'viewer', is_granted: 0 },
            
            { module: 'Analytics Dashboard', role: 'admin', is_granted: 1 },
            { module: 'Analytics Dashboard', role: 'operator', is_granted: 0 },
            { module: 'Analytics Dashboard', role: 'supervisor', is_granted: 1 },
            { module: 'Analytics Dashboard', role: 'analyst', is_granted: 1 },
            { module: 'Analytics Dashboard', role: 'viewer', is_granted: 0 },
            
            { module: 'User Management', role: 'admin', is_granted: 1 },
            { module: 'User Management', role: 'operator', is_granted: 0 },
            { module: 'User Management', role: 'supervisor', is_granted: 0 },
            { module: 'User Management', role: 'analyst', is_granted: 0 },
            { module: 'User Management', role: 'viewer', is_granted: 0 },
            
            { module: 'Dashboard', role: 'admin', is_granted: 1 },
            { module: 'Dashboard', role: 'operator', is_granted: 1 },
            { module: 'Dashboard', role: 'supervisor', is_granted: 1 },
            { module: 'Dashboard', role: 'analyst', is_granted: 1 },
            { module: 'Dashboard', role: 'viewer', is_granted: 1 },
            
            { module: 'Live Map', role: 'admin', is_granted: 1 },
            { module: 'Live Map', role: 'operator', is_granted: 1 },
            { module: 'Live Map', role: 'supervisor', is_granted: 1 },
            { module: 'Live Map', role: 'analyst', is_granted: 1 },
            { module: 'Live Map', role: 'viewer', is_granted: 1 },
            
            { module: 'History (Playback)', role: 'admin', is_granted: 1 },
            { module: 'History (Playback)', role: 'operator', is_granted: 1 },
            { module: 'History (Playback)', role: 'supervisor', is_granted: 1 },
            { module: 'History (Playback)', role: 'analyst', is_granted: 1 },
            { module: 'History (Playback)', role: 'viewer', is_granted: 0 },
            
            { module: 'About', role: 'admin', is_granted: 1 },
            { module: 'About', role: 'operator', is_granted: 1 },
            { module: 'About', role: 'supervisor', is_granted: 1 },
            { module: 'About', role: 'analyst', is_granted: 1 },
            { module: 'About', role: 'viewer', is_granted: 1 }
        ];

        const permStmt = db.prepare('INSERT OR IGNORE INTO permissions (module, role, is_granted) VALUES (?, ?, ?)');
        for (const p of dummyPermissions) {
            permStmt.run(p.module, p.role, p.is_granted);
        }
        permStmt.finalize();
    });
}

module.exports = db;
