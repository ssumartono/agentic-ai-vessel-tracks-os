const turf = require('@turf/helpers');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;

module.exports = function startSimulator(db, wss) {
    console.log('Starting AIS Mock Data Simulator...');

    // Mock Vessels around Jakarta Bay
    const vessels = [
        { mmsi: '525000101', name: 'KMP JATRA I', type: 'Passenger', status: 'Underway', lat: -6.10, lon: 106.86, speed: 12, course: 45, dLat: 0.001, dLon: 0.001 },
        { mmsi: '525000102', name: 'MERATUS JAKARTA', type: 'Cargo', status: 'Underway', lat: -6.08, lon: 106.88, speed: 10, course: 180, dLat: -0.001, dLon: 0.0005 },
        { mmsi: '525000103', name: 'TB. ENTEBE 01', type: 'Tug', status: 'Underway', lat: -5.95, lon: 106.85, speed: 5, course: 270, dLat: 0, dLon: -0.0008 },
        { mmsi: '525000104', name: 'PERTAMINA GAS 1', type: 'Tanker', status: 'At Anchor', lat: -6.05, lon: 106.85, speed: 0.1, course: 10, dLat: 0.0001, dLon: -0.0001 },
        { mmsi: '525000105', name: 'KM. KELUD', type: 'Passenger', status: 'Underway', lat: -6.09, lon: 106.82, speed: 15, course: 90, dLat: 0.0005, dLon: 0.0015 },
    ];

    // Keep track of which geofence a vessel is currently inside to detect enter/exit events
    const vesselGeofenceStatus = {};

    // Insert vessels if they don't exist
    db.serialize(() => {
        const stmt = db.prepare('INSERT OR IGNORE INTO vessels (mmsi, name, type, status) VALUES (?, ?, ?, ?)');
        for (const v of vessels) {
            stmt.run(v.mmsi, v.name, v.type, v.status);
            vesselGeofenceStatus[v.mmsi] = new Set();
        }
        stmt.finalize();
    });

    let geofences = [];
    
    // Load geofences for collision detection
    function loadGeofences() {
        db.all('SELECT * FROM geofences', [], (err, rows) => {
            if (!err) {
                geofences = rows.map(r => ({
                    id: r.id,
                    name: r.name,
                    polygon: turf.polygon([[...JSON.parse(r.coordinates), JSON.parse(r.coordinates)[0]]]) // Turf needs closed polygon
                }));
            }
        });
    }

    loadGeofences();
    // Reload periodically in case they change
    setInterval(loadGeofences, 60000);

    function checkGeofences(mmsi, lat, lon) {
        if (!geofences.length) return;
        const pt = turf.point([lon, lat]); // Turf uses [lon, lat]

        for (const gf of geofences) {
            try {
                const isInside = booleanPointInPolygon(pt, gf.polygon);
                const currentlyInside = vesselGeofenceStatus[mmsi].has(gf.id);

                if (isInside && !currentlyInside) {
                    // Enter event
                    vesselGeofenceStatus[mmsi].add(gf.id);
                    createAlert(mmsi, gf.id, 'enter');
                } else if (!isInside && currentlyInside) {
                    // Exit event
                    vesselGeofenceStatus[mmsi].delete(gf.id);
                    createAlert(mmsi, gf.id, 'exit');
                }
            } catch (e) {
                // Ignore turf errors if polygon is invalid
            }
        }
    }

    function createAlert(mmsi, geofence_id, event_type) {
        db.run('INSERT INTO alerts (mmsi, geofence_id, event_type) VALUES (?, ?, ?)', [mmsi, geofence_id, event_type], function(err) {
            if (!err) {
                // Broadcast alert
                wss.broadcast({
                    type: 'ALERT',
                    payload: {
                        id: this.lastID,
                        mmsi,
                        geofence_id,
                        event_type,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });
    }

    // Simulate movement every 2 seconds
    setInterval(() => {
        db.serialize(() => {
            const stmt = db.prepare('INSERT INTO vessel_positions (mmsi, lat, lon, speed, course) VALUES (?, ?, ?, ?, ?)');
            
            vessels.forEach(v => {
                // Move vessel
                v.lat += v.dLat;
                v.lon += v.dLon;

                // Simple boundary bounce so they don't go too far
                if (v.lat > -6.0 || v.lat < -6.15) v.dLat *= -1;
                if (v.lon > 106.95 || v.lon < 106.8) v.dLon *= -1;

                // Random course variation
                v.course = (v.course + (Math.random() * 10 - 5)) % 360;
                
                stmt.run(v.mmsi, v.lat, v.lon, v.speed, v.course);

                // Check geofences
                checkGeofences(v.mmsi, v.lat, v.lon);

                // Broadcast update
                wss.broadcast({
                    type: 'VESSEL_UPDATE',
                    payload: {
                        mmsi: v.mmsi,
                        name: v.name,
                        vessel_type: v.type, // Map 'type' to 'vessel_type' for clarity if needed, or just type
                        type: v.type,
                        status: v.status,
                        lat: v.lat,
                        lon: v.lon,
                        speed: v.speed,
                        course: v.course,
                        timestamp: new Date().toISOString()
                    }
                });
            });
            stmt.finalize();
        });
    }, 2000);
};
