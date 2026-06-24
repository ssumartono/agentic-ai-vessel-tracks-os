const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- REST API ENDPOINTS ---

// Get all latest vessel positions
app.get('/api/vessels', (req, res) => {
    const query = `
        SELECT v.mmsi, v.name, v.type, v.status, 
               p.lat, p.lon, p.speed, p.course, p.timestamp
        FROM vessels v
        LEFT JOIN (
            SELECT mmsi, lat, lon, speed, course, timestamp
            FROM vessel_positions
            GROUP BY mmsi
            HAVING timestamp = MAX(timestamp)
        ) p ON v.mmsi = p.mmsi
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get vessel history track
app.get('/api/vessels/:mmsi/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const query = `
        SELECT lat, lon, speed, course, timestamp
        FROM vessel_positions
        WHERE mmsi = ?
        ORDER BY timestamp DESC
        LIMIT ?
    `;
    db.all(query, [req.params.mmsi, limit], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.reverse()); // Return in chronological order
    });
});

// Get geofences
app.get('/api/geofences', (req, res) => {
    db.all('SELECT * FROM geofences', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const geofences = rows.map(r => ({
            id: r.id,
            name: r.name,
            coordinates: JSON.parse(r.coordinates)
        }));
        res.json(geofences);
    });
});

// Get alerts
app.get('/api/alerts', (req, res) => {
    const query = `
        SELECT a.id, a.mmsi, a.geofence_id, a.event_type, a.timestamp, v.name as vessel_name
        FROM alerts a
        LEFT JOIN vessels v ON a.mmsi = v.mmsi
        ORDER BY a.timestamp DESC
        LIMIT 50
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- USER MANAGEMENT ENDPOINTS ---

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?`;
    // In a real app, use bcrypt.compare instead of matching plain/hashed text directly
    db.get(query, [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ message: 'Login successful', user: row });
    });
});

// Get all users
app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, role, created_by, created_at FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new user
app.post('/api/users', (req, res) => {
    const { username, password, role, created_by } = req.body;
    const query = `INSERT INTO users (username, password_hash, role, created_by) VALUES (?, ?, ?, ?)`;
    db.run(query, [username, password, role, created_by || 'system'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, username, role, created_by: created_by || 'system' });
    });
});

// Update user
app.put('/api/users/:id', (req, res) => {
    const { role, password } = req.body;
    
    if (password && password.trim() !== '') {
        const query = `UPDATE users SET role = ?, password_hash = ? WHERE id = ?`;
        db.run(query, [role, password, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated (with password)' });
        });
    } else {
        const query = `UPDATE users SET role = ? WHERE id = ?`;
        db.run(query, [role, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated' });
        });
    }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const query = `DELETE FROM users WHERE id = ?`;
    db.run(query, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

// Get permissions
app.get('/api/permissions', (req, res) => {
    db.all('SELECT module, role, is_granted FROM permissions', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const result = {};
        rows.forEach(r => {
            if (!result[r.module]) {
                result[r.module] = { module: r.module };
            }
            result[r.module][r.role] = r.is_granted === 1;
        });
        res.json(Object.values(result));
    });
});

// Update permissions (bulk)
app.put('/api/permissions', (req, res) => {
    const updates = req.body; // Expect array: [{module, role, is_granted}, ...]
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'Expected array of updates' });
    
    db.serialize(() => {
        const stmt = db.prepare('UPDATE permissions SET is_granted = ? WHERE module = ? AND role = ?');
        for (const u of updates) {
            stmt.run(u.is_granted ? 1 : 0, u.module, u.role);
        }
        stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Permissions updated successfully' });
        });
    });
});


// --- WEBSOCKET SERVER ---
// Broadcasts updates to all connected clients
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.on('close', () => console.log('Client disconnected'));
});

// Pass the wss to the simulator so it can broadcast
require('./simulator')(db, wss);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`VesselTrack OS MVP running on http://localhost:${PORT}`);
});
