# 08_Geofence_Rule_Spec.md

# Geofence Rule Specification
## Real Time Vessel Tracking System / VesselTrack OS

**Document Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product & Engineering Team  
**Related Documents:**

- `01_PRD.md`
- `02_System_Architecture.md`
- `03_Data_Source_Strategy.md`
- `04_AIS_Data_Model.md`
- `05_Database_ERD.md`
- `06_API_Specification.md`
- `07_Realtime_WebSocket_Spec.md`

---

## 1. Purpose

Dokumen ini menjelaskan spesifikasi **Geofence Rule Engine** untuk aplikasi **Real Time Vessel Tracking System**.

Geofence adalah batas area digital berbasis geometri spasial yang digunakan untuk memantau apakah kapal:

- Masuk ke area tertentu.
- Keluar dari area tertentu.
- Berdiam terlalu lama di area tertentu.
- Melanggar batas kecepatan di area tertentu.
- Hilang sinyal AIS dalam area tertentu.
- Menyimpang dari koridor rute.
- Berada di area terlarang atau area operasional khusus.

Dokumen ini menjadi acuan bagi backend engineer, GIS engineer, frontend engineer, QA, dan product owner dalam membangun modul geofence dan alert.

---

## 2. Scope

### 2.1 Included in MVP

MVP mencakup:

1. Membuat, membaca, mengubah, dan menghapus geofence.
2. Menyimpan geofence sebagai polygon atau multipolygon.
3. Menentukan apakah posisi kapal berada di dalam geofence.
4. Mendeteksi event:
   - `ENTER_GEOFENCE`
   - `EXIT_GEOFENCE`
   - `DWELL_TIME_EXCEEDED`
   - `SPEED_LIMIT_EXCEEDED`
   - `AIS_SILENCE_IN_ZONE`
5. Menampilkan geofence di map dashboard.
6. Menampilkan alert di alert panel.
7. Mengirim event melalui WebSocket.
8. Menyimpan event ke database.

### 2.2 Excluded from MVP

Fitur berikut ditunda setelah MVP:

1. Collision risk berbasis CPA/TCPA.
2. AI anomaly detection kompleks.
3. Route prediction.
4. Dark vessel detection lanjutan.
5. Multi-layer maritime risk scoring.
6. Integration dengan VTS resmi, radar, atau satelit non-AIS.
7. Automatic route corridor generation dari histori kapal.

---

## 3. Definitions

| Term | Definition |
|---|---|
| Geofence | Area digital berbasis polygon/multipolygon untuk memantau posisi kapal. |
| Rule | Aturan yang dievaluasi ketika data posisi kapal masuk. |
| Event | Catatan kejadian yang dihasilkan oleh rule engine. |
| Alert | Notifikasi operasional yang ditampilkan kepada user dari sebuah event. |
| Dwell Time | Durasi kapal berada di dalam geofence. |
| AIS Silence | Tidak ada update posisi AIS dalam periode tertentu. |
| SOG | Speed Over Ground, kecepatan kapal dalam knot. |
| COG | Course Over Ground, arah gerak kapal dalam derajat. |
| MMSI | Maritime Mobile Service Identity, identitas unik AIS kapal. |
| Hysteresis | Toleransi untuk mencegah alert berulang akibat kapal bergerak di tepi batas geofence. |

---

## 4. Design Principles

Geofence Rule Engine harus mengikuti prinsip berikut:

1. **Near real-time**  
   Event harus diproses segera setelah posisi kapal diterima.

2. **Low noise**  
   Sistem harus menghindari alert berulang yang tidak berguna.

3. **Traceable**  
   Setiap event harus bisa ditelusuri ke posisi kapal, rule, dan geofence yang memicunya.

4. **Configurable**  
   Operator dapat mengatur threshold per geofence.

5. **Scalable**  
   Engine harus mampu menangani banyak kapal dan banyak geofence.

6. **Auditable**  
   Perubahan geofence dan rule harus dicatat.

---

## 5. Geofence Types

### 5.1 Restricted Area

Area yang tidak boleh dimasuki kapal tertentu.

Example:

- Area militer.
- Area konstruksi lepas pantai.
- Area dangkal berbahaya.
- Area keamanan pelabuhan.

Primary rules:

- `ENTER_GEOFENCE`
- `DWELL_TIME_EXCEEDED`
- `AIS_SILENCE_IN_ZONE`

---

### 5.2 Port Area

Area operasional pelabuhan.

Primary rules:

- `ENTER_GEOFENCE`
- `EXIT_GEOFENCE`
- `DWELL_TIME_EXCEEDED`

---

### 5.3 Anchorage Area

Area labuh jangkar.

Primary rules:

- `ENTER_GEOFENCE`
- `DWELL_TIME_EXCEEDED`
- `SPEED_LIMIT_EXCEEDED`

---

### 5.4 Route Corridor

Koridor perjalanan kapal.

Primary rules:

- `ROUTE_DEVIATION`
- `EXIT_GEOFENCE`

MVP dapat menyimpan route corridor sebagai polygon memanjang. Versi lanjutan dapat memakai polyline dengan buffer dinamis.

---

### 5.5 Speed Control Zone

Area dengan batas kecepatan tertentu.

Primary rules:

- `SPEED_LIMIT_EXCEEDED`

---

### 5.6 Monitoring Area

Area pantauan umum tanpa pelanggaran langsung.

Primary rules:

- `ENTER_GEOFENCE`
- `EXIT_GEOFENCE`
- `VESSEL_COUNT_UPDATED`

---

## 6. Rule Types

### 6.1 ENTER_GEOFENCE

Triggered ketika kapal berpindah dari luar geofence ke dalam geofence.

#### Condition

```text
previous_state.inside_geofence = false
current_state.inside_geofence = true
```

#### Required Data

- MMSI
- Current vessel position
- Geofence geometry
- Previous vessel geofence state

#### Output Event

```json
{
  "event_type": "ENTER_GEOFENCE",
  "mmsi": "525123456",
  "geofence_id": "gf_001",
  "event_time": "2026-06-21T03:15:22Z",
  "severity": "medium",
  "message": "MV Musi Jaya entered GF-01 Area Terbatas"
}
```

---

### 6.2 EXIT_GEOFENCE

Triggered ketika kapal berpindah dari dalam geofence ke luar geofence.

#### Condition

```text
previous_state.inside_geofence = true
current_state.inside_geofence = false
```

#### Output Event

```json
{
  "event_type": "EXIT_GEOFENCE",
  "mmsi": "525123456",
  "geofence_id": "gf_001",
  "event_time": "2026-06-21T03:30:01Z",
  "severity": "low",
  "message": "MV Musi Jaya exited GF-01 Area Terbatas"
}
```

---

### 6.3 DWELL_TIME_EXCEEDED

Triggered ketika kapal berada di dalam geofence lebih lama dari threshold.

#### Condition

```text
current_state.inside_geofence = true
current_time - geofence_entry_time >= dwell_threshold_minutes
```

#### Example Threshold

| Geofence Type | Default Threshold |
|---|---:|
| Restricted Area | 5 minutes |
| Port Area | 240 minutes |
| Anchorage Area | 720 minutes |
| Monitoring Area | configurable |

#### Output Event

```json
{
  "event_type": "DWELL_TIME_EXCEEDED",
  "mmsi": "525123456",
  "geofence_id": "gf_002",
  "event_time": "2026-06-21T04:00:00Z",
  "severity": "high",
  "dwell_minutes": 45,
  "threshold_minutes": 30,
  "message": "MV Musi Jaya exceeded dwell time in GF-02 Anchorage Area"
}
```

---

### 6.4 SPEED_LIMIT_EXCEEDED

Triggered ketika kapal berada di dalam geofence dan SOG melebihi batas.

#### Condition

```text
current_state.inside_geofence = true
current_position.sog > geofence_rule.max_speed_knots
```

#### Recommended Noise Filter

Agar tidak terlalu cerewet seperti camar lapar, rule ini sebaiknya membutuhkan minimal `N` pelanggaran berturut-turut.

Example:

```text
speed_violation_confirm_count >= 2
```

#### Output Event

```json
{
  "event_type": "SPEED_LIMIT_EXCEEDED",
  "mmsi": "525123456",
  "geofence_id": "gf_003",
  "event_time": "2026-06-21T03:18:10Z",
  "severity": "medium",
  "actual_speed_knots": 14.8,
  "max_speed_knots": 10.0,
  "message": "MV Musi Jaya exceeded speed limit in GF-03 Speed Control Zone"
}
```

---

### 6.5 AIS_SILENCE_IN_ZONE

Triggered ketika kapal terakhir terlihat di dalam geofence dan tidak ada update AIS lebih lama dari threshold.

#### Condition

```text
last_known_state.inside_geofence = true
current_time - last_seen_at >= ais_silence_threshold_minutes
```

#### Default Threshold

| Context | Threshold |
|---|---:|
| Restricted Area | 10 minutes |
| Port Area | 15 minutes |
| Open Sea Monitoring Area | 30 minutes |

#### Output Event

```json
{
  "event_type": "AIS_SILENCE_IN_ZONE",
  "mmsi": "525123456",
  "geofence_id": "gf_001",
  "event_time": "2026-06-21T03:45:00Z",
  "severity": "high",
  "last_seen_at": "2026-06-21T03:30:00Z",
  "silence_minutes": 15,
  "message": "MV Musi Jaya has no AIS update inside GF-01 Area Terbatas"
}
```

---

### 6.6 ROUTE_DEVIATION

Triggered ketika kapal keluar dari corridor yang ditentukan.

#### MVP Approach

Route corridor disimpan sebagai polygon geofence.

#### Condition

```text
assigned_route_corridor exists
current_position outside assigned_route_corridor
```

#### Output Event

```json
{
  "event_type": "ROUTE_DEVIATION",
  "mmsi": "525123456",
  "route_id": "route_001",
  "event_time": "2026-06-21T04:12:00Z",
  "severity": "high",
  "message": "MV Musi Jaya deviated from assigned route corridor"
}
```

---

## 7. Geofence Data Model

### 7.1 geofences

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key. |
| code | varchar | Yes | Human-friendly code, e.g. `GF-01`. |
| name | varchar | Yes | Geofence name. |
| type | enum | Yes | Geofence type. |
| description | text | No | Optional description. |
| geom | geometry(MultiPolygon, 4326) | Yes | Geofence geometry. |
| status | enum | Yes | `active`, `inactive`, `draft`, `archived`. |
| priority | integer | No | Priority for display and evaluation. |
| created_by | UUID | Yes | User who created geofence. |
| updated_by | UUID | No | Last user who updated geofence. |
| created_at | timestamptz | Yes | Created timestamp. |
| updated_at | timestamptz | Yes | Updated timestamp. |

---

### 7.2 geofence_rules

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key. |
| geofence_id | UUID | Yes | FK to `geofences`. |
| rule_type | enum | Yes | Type of rule. |
| enabled | boolean | Yes | Whether rule is active. |
| severity | enum | Yes | Default severity. |
| parameters | jsonb | Yes | Rule-specific parameters. |
| cooldown_seconds | integer | Yes | Minimum interval before same alert repeated. |
| created_at | timestamptz | Yes | Created timestamp. |
| updated_at | timestamptz | Yes | Updated timestamp. |

Example `parameters` for speed rule:

```json
{
  "max_speed_knots": 10,
  "confirm_count": 2
}
```

Example `parameters` for dwell rule:

```json
{
  "dwell_threshold_minutes": 30
}
```

Example `parameters` for AIS silence rule:

```json
{
  "silence_threshold_minutes": 15
}
```

---

### 7.3 vessel_geofence_states

Table ini menyimpan status terakhir kapal terhadap sebuah geofence.

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key. |
| mmsi | varchar | Yes | Vessel MMSI. |
| geofence_id | UUID | Yes | FK to geofence. |
| inside | boolean | Yes | Whether vessel is currently inside geofence. |
| entered_at | timestamptz | No | Last entry time. |
| exited_at | timestamptz | No | Last exit time. |
| last_position_id | UUID | No | Last processed vessel position. |
| last_evaluated_at | timestamptz | Yes | Last rule evaluation time. |
| dwell_alert_sent_at | timestamptz | No | Last dwell alert timestamp. |
| speed_alert_sent_at | timestamptz | No | Last speed alert timestamp. |
| ais_silence_alert_sent_at | timestamptz | No | Last AIS silence alert timestamp. |

Recommended unique key:

```sql
UNIQUE (mmsi, geofence_id)
```

---

### 7.4 geofence_events

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key. |
| event_type | enum | Yes | Event type. |
| mmsi | varchar | Yes | Vessel MMSI. |
| vessel_id | UUID | No | FK to vessel if available. |
| geofence_id | UUID | No | FK to geofence. |
| rule_id | UUID | No | FK to geofence rule. |
| position_id | UUID | No | FK to vessel position. |
| event_time | timestamptz | Yes | Event timestamp. |
| severity | enum | Yes | `info`, `low`, `medium`, `high`, `critical`. |
| status | enum | Yes | `new`, `acknowledged`, `resolved`, `suppressed`. |
| payload | jsonb | Yes | Event details. |
| message | text | Yes | Human-readable message. |
| created_at | timestamptz | Yes | Created timestamp. |

---

## 8. Rule Evaluation Flow

### 8.1 Position-Based Evaluation

Setiap kali posisi AIS baru masuk:

```text
1. Receive vessel position.
2. Validate position quality.
3. Find active geofences intersecting current point.
4. Compare current inside/outside state with previous state.
5. Evaluate enter/exit rules.
6. Evaluate speed rule if inside geofence.
7. Update vessel_geofence_states.
8. Generate event if rule condition is met.
9. Store event.
10. Publish WebSocket event.
11. Trigger notification if required.
```

---

### 8.2 Scheduled Evaluation

Beberapa rule perlu dievaluasi secara periodik, bukan hanya ketika posisi baru masuk.

Scheduled rules:

- `DWELL_TIME_EXCEEDED`
- `AIS_SILENCE_IN_ZONE`

Recommended interval:

```text
Every 1 minute for MVP
Every 30 seconds for production-critical area
```

---

## 9. Geospatial Logic

### 9.1 Point-in-Polygon Check

Gunakan PostGIS:

```sql
SELECT g.id, g.code, g.name
FROM geofences g
WHERE g.status = 'active'
  AND ST_Contains(
    g.geom,
    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
  );
```

Alternative yang aman untuk boundary:

```sql
SELECT g.id, g.code, g.name
FROM geofences g
WHERE g.status = 'active'
  AND ST_Covers(
    g.geom,
    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
  );
```

Recommendation:

- Gunakan `ST_Covers` untuk menganggap titik di boundary sebagai inside.
- Gunakan `ST_Contains` jika boundary tidak dianggap inside.

Untuk MVP, gunakan `ST_Covers`.

---

### 9.2 Bounding Box Optimization

Sebelum melakukan polygon check penuh:

```sql
SELECT g.id
FROM geofences g
WHERE g.status = 'active'
  AND g.geom && ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
  AND ST_Covers(g.geom, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326));
```

Index yang dibutuhkan:

```sql
CREATE INDEX idx_geofences_geom
ON geofences
USING GIST (geom);
```

---

### 9.3 Hysteresis Buffer

Masalah umum: kapal di pinggir polygon dapat menghasilkan enter-exit-enter-exit berulang.

Solusi:

1. Gunakan cooldown.
2. Gunakan buffer tolerance.
3. Butuh konfirmasi beberapa posisi berturut-turut.

MVP recommendation:

```text
Enter confirmation: 1 valid point inside
Exit confirmation: 2 consecutive valid points outside
Default cooldown: 300 seconds
```

Production recommendation:

```text
Enter confirmation: configurable
Exit confirmation: configurable
Boundary buffer: 20-50 meters depending area type
```

---

## 10. Severity Model

| Severity | Meaning | Example |
|---|---|---|
| info | Informational event. | Vessel entered monitoring area. |
| low | Low operational importance. | Vessel exited port area. |
| medium | Needs attention. | Speed exceeded. |
| high | Needs prompt action. | Restricted area breach. |
| critical | Safety/security critical. | AIS silence in restricted area. |

Default severity mapping:

| Rule Type | Default Severity |
|---|---|
| ENTER_GEOFENCE for monitoring area | info |
| EXIT_GEOFENCE for monitoring area | info |
| ENTER_GEOFENCE for restricted area | high |
| DWELL_TIME_EXCEEDED | medium/high based on zone |
| SPEED_LIMIT_EXCEEDED | medium |
| AIS_SILENCE_IN_ZONE | high |
| ROUTE_DEVIATION | high |

---

## 11. Cooldown and Deduplication

### 11.1 Cooldown

Cooldown mencegah event yang sama dikirim terlalu sering.

Default:

| Rule Type | Cooldown |
|---|---:|
| ENTER_GEOFENCE | 300 seconds |
| EXIT_GEOFENCE | 300 seconds |
| DWELL_TIME_EXCEEDED | 900 seconds |
| SPEED_LIMIT_EXCEEDED | 300 seconds |
| AIS_SILENCE_IN_ZONE | 900 seconds |
| ROUTE_DEVIATION | 600 seconds |

### 11.2 Deduplication Key

Recommended deduplication key:

```text
{mmsi}:{geofence_id}:{rule_type}:{time_bucket}
```

Example:

```text
525123456:gf_001:SPEED_LIMIT_EXCEEDED:202606210315
```

---

## 12. Event Payload Standards

### 12.1 Common Event Envelope

```json
{
  "event_id": "evt_01HX...",
  "event_type": "ENTER_GEOFENCE",
  "severity": "high",
  "status": "new",
  "event_time": "2026-06-21T03:15:22Z",
  "mmsi": "525123456",
  "vessel": {
    "name": "MV Musi Jaya",
    "imo": "9876543",
    "vessel_type": "Cargo"
  },
  "geofence": {
    "id": "gf_001",
    "code": "GF-01",
    "name": "Area Terbatas",
    "type": "restricted_area"
  },
  "position": {
    "lat": -6.1052,
    "lon": 106.8841,
    "sog": 12.4,
    "cog": 88.5,
    "heading": 90
  },
  "message": "MV Musi Jaya entered GF-01 Area Terbatas"
}
```

### 12.2 WebSocket Event

```json
{
  "type": "GEOFENCE_EVENT",
  "version": "1.0",
  "timestamp": "2026-06-21T03:15:22Z",
  "data": {
    "event_id": "evt_01HX...",
    "event_type": "ENTER_GEOFENCE",
    "severity": "high",
    "mmsi": "525123456",
    "geofence_id": "gf_001",
    "message": "MV Musi Jaya entered GF-01 Area Terbatas"
  }
}
```

---

## 13. API Requirements

### 13.1 Create Geofence

```http
POST /api/v1/geofences
```

Request:

```json
{
  "code": "GF-01",
  "name": "Area Terbatas",
  "type": "restricted_area",
  "description": "Restricted operational zone",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [106.8801, -6.1021],
        [106.8901, -6.1021],
        [106.8901, -6.1101],
        [106.8801, -6.1101],
        [106.8801, -6.1021]
      ]
    ]
  },
  "rules": [
    {
      "rule_type": "ENTER_GEOFENCE",
      "enabled": true,
      "severity": "high",
      "cooldown_seconds": 300,
      "parameters": {}
    },
    {
      "rule_type": "AIS_SILENCE_IN_ZONE",
      "enabled": true,
      "severity": "high",
      "cooldown_seconds": 900,
      "parameters": {
        "silence_threshold_minutes": 15
      }
    }
  ]
}
```

---

### 13.2 Update Geofence Rule

```http
PATCH /api/v1/geofences/{geofence_id}/rules/{rule_id}
```

Request:

```json
{
  "enabled": true,
  "severity": "medium",
  "cooldown_seconds": 300,
  "parameters": {
    "max_speed_knots": 10,
    "confirm_count": 2
  }
}
```

---

### 13.3 List Geofence Events

```http
GET /api/v1/geofence-events?severity=high&status=new&from=2026-06-21T00:00:00Z&to=2026-06-21T23:59:59Z
```

---

## 14. Frontend Requirements

### 14.1 Geofence Map Layer

Frontend harus dapat:

1. Menampilkan polygon geofence di peta.
2. Memberikan warna berdasarkan tipe atau severity.
3. Menampilkan label geofence.
4. Menampilkan popup detail geofence.
5. Toggle show/hide geofence layer.
6. Highlight geofence ketika alert dipilih.

### 14.2 Geofence Editor

MVP editor minimal:

1. Draw polygon.
2. Edit vertex.
3. Delete polygon.
4. Set name, code, type.
5. Configure rules.
6. Save draft.
7. Activate geofence.

### 14.3 Alert Interaction

Ketika user klik alert:

1. Map zoom ke geofence.
2. Vessel marker di-highlight.
3. Detail vessel muncul.
4. Event detail panel terbuka.

---

## 15. Notification Rules

Tidak semua event harus menjadi external notification.

### 15.1 Dashboard Only

- Informational enter/exit.
- Monitoring area count update.

### 15.2 Dashboard + Email

- Restricted area breach.
- Route deviation.
- Dwell time exceeded high severity.

### 15.3 Dashboard + Instant Messaging Gateway

- Critical restricted area breach.
- AIS silence in restricted area.
- Repeated speed violation.

Notification channel harus configurable per rule.

---

## 16. Audit Requirements

Setiap perubahan geofence dan rule harus dicatat.

Audit fields:

- actor_user_id
- action
- object_type
- object_id
- before_value
- after_value
- timestamp
- ip_address

Actions:

- `GEOFENCE_CREATED`
- `GEOFENCE_UPDATED`
- `GEOFENCE_DELETED`
- `GEOFENCE_ACTIVATED`
- `GEOFENCE_DEACTIVATED`
- `RULE_CREATED`
- `RULE_UPDATED`
- `RULE_DISABLED`
- `RULE_ENABLED`

---

## 17. Performance Requirements

### 17.1 MVP Targets

| Metric | Target |
|---|---:|
| Geofence evaluation latency | <= 2 seconds per incoming position batch |
| WebSocket event publish latency | <= 2 seconds after event creation |
| Active geofences | 100 |
| Active vessels | 1,000 |
| Position ingestion rate | 10-50 updates/second |

### 17.2 Production Targets

| Metric | Target |
|---|---:|
| Geofence evaluation latency | <= 1 second |
| Active geofences | 1,000+ |
| Active vessels | 10,000+ |
| Position ingestion rate | 500+ updates/second |

---

## 18. Error Handling

### 18.1 Invalid Geometry

If polygon is invalid:

```json
{
  "error": {
    "code": "INVALID_GEOFENCE_GEOMETRY",
    "message": "Geofence geometry is invalid or self-intersecting."
  }
}
```

Validation requirements:

1. Geometry must be valid GeoJSON.
2. Polygon must be closed.
3. Polygon must not self-intersect.
4. Geometry must be within valid lat/lon range.
5. Area must not be zero.

### 18.2 Rule Parameter Error

```json
{
  "error": {
    "code": "INVALID_RULE_PARAMETER",
    "message": "max_speed_knots must be greater than 0."
  }
}
```

---

## 19. Testing Strategy

### 19.1 Unit Tests

Test cases:

1. Point inside polygon.
2. Point outside polygon.
3. Point on boundary.
4. Enter event generated.
5. Exit event generated.
6. Dwell threshold exceeded.
7. Speed threshold exceeded.
8. AIS silence triggered.
9. Cooldown prevents duplicate alert.
10. Invalid geometry rejected.

### 19.2 Integration Tests

1. Ingest vessel position inside geofence.
2. Store vessel state.
3. Generate event.
4. Store event.
5. Publish WebSocket event.
6. Display alert on frontend.

### 19.3 Scenario Tests

#### Scenario A: Restricted Area Breach

```text
Given active restricted geofence GF-01
And vessel is outside GF-01
When vessel position enters GF-01
Then ENTER_GEOFENCE event is created
And alert severity is high
And dashboard receives WebSocket event
```

#### Scenario B: Speed Violation

```text
Given active speed control geofence GF-03 with max_speed_knots = 10
And vessel is inside GF-03
When vessel sends two consecutive positions with SOG > 10
Then SPEED_LIMIT_EXCEEDED event is created
```

#### Scenario C: AIS Silence

```text
Given vessel last known position is inside GF-01
And no update is received for 15 minutes
When scheduled evaluator runs
Then AIS_SILENCE_IN_ZONE event is created
```

---

## 20. Acceptance Criteria

### 20.1 Functional Acceptance Criteria

1. User can create a polygon geofence from dashboard.
2. User can configure at least enter, exit, dwell, speed, and AIS silence rules.
3. System can detect vessel entering a geofence.
4. System can detect vessel exiting a geofence.
5. System can detect dwell time exceeded.
6. System can detect speed limit exceeded.
7. System can detect AIS silence inside a geofence.
8. System stores all geofence events in database.
9. System publishes geofence events via WebSocket.
10. Dashboard displays geofence alert within target latency.

### 20.2 Technical Acceptance Criteria

1. Geofence geometry is stored as PostGIS geometry with SRID 4326.
2. Geofence spatial index is available.
3. Rule configuration is stored in database.
4. Event payload follows standard event envelope.
5. Cooldown prevents duplicate event spam.
6. Boundary behavior is documented and tested.
7. Audit log exists for geofence and rule changes.

---

## 21. Open Questions

| Question | Owner | Status |
|---|---|---|
| Apakah boundary point dianggap inside atau outside? | Product + GIS | Proposed: inside using `ST_Covers`. |
| Default geofence untuk MVP area mana? | Product | Open |
| Apakah notification WhatsApp akan digunakan di MVP? | Product | Open |
| Apakah route corridor termasuk MVP atau fase 2? | Product | Proposed: fase 2. |
| Berapa latency maksimum yang diterima operator? | Product + Ops | Open |
| Apakah semua vessel type dipantau atau hanya vessel tertentu? | Product | Open |

---

## 22. Implementation Backlog

### 22.1 Backend

- Create geofence table.
- Create geofence rules table.
- Create geofence events table.
- Create vessel geofence state table.
- Implement point-in-polygon service.
- Implement enter/exit evaluator.
- Implement dwell evaluator.
- Implement speed evaluator.
- Implement AIS silence evaluator.
- Implement cooldown and deduplication.
- Publish WebSocket event.

### 22.2 Frontend

- Display geofence layer.
- Create geofence editor.
- Create rule configuration form.
- Display geofence alert feed.
- Link alert to map and vessel detail.
- Add layer toggle.

### 22.3 QA

- Prepare synthetic vessel tracks.
- Test boundary cases.
- Test enter/exit detection.
- Test alert cooldown.
- Test WebSocket delivery.
- Test frontend geofence drawing.

---

## 23. Recommended MVP Default Configuration

```json
{
  "boundary_behavior": "inside",
  "default_enter_confirmation_count": 1,
  "default_exit_confirmation_count": 2,
  "default_cooldown_seconds": 300,
  "default_dwell_threshold_minutes": 30,
  "default_speed_limit_knots": 10,
  "default_ais_silence_threshold_minutes": 15,
  "default_geofence_status": "draft"
}
```

---

## 24. Summary

Geofence Rule Engine adalah jantung operasional untuk mengubah peta kapal menjadi sistem pemantauan aktif.

Untuk MVP, fokus utama adalah:

1. Geofence polygon.
2. Enter/exit detection.
3. Dwell time.
4. Speed violation.
5. AIS silence.
6. Alert dashboard.
7. WebSocket event.
8. Audit trail.

Dengan desain ini, **Real Time Vessel Tracking System** tidak hanya menampilkan kapal di peta, tetapi juga menjadi sistem penjaga wilayah laut digital yang siap diperluas menjadi maritime intelligence platform.
