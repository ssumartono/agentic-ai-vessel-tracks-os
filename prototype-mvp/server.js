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
