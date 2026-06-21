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

    db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO geofences (id, name, coordinates) VALUES (?, ?, ?)');
        for (const gf of geofences) {
            stmt.run(gf.id, gf.name, gf.coordinates);
        }
        stmt.finalize();
    });
}

module.exports = db;
