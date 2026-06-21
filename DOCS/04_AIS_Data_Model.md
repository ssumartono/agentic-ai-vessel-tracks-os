# 04_AIS_Data_Model.md
# AIS Data Model
# Real Time Vessel Tracking System

**Nama Sistem Contoh:** VesselTrack OS  
**Versi Dokumen:** v1.0  
**Tanggal:** 21 Juni 2026  
**Status:** Draft Awal  
**Diturnunkan dari:** `01_PRD.md`, `02_System_Architecture.md`, dan `03_Data_Source_Strategy.md`  
**Pendekatan Pengembangan:** AIS API Provider → MVP Tracking → Geofence & Alert → Playback & Analytics → Hardening

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan **AIS Data Model** untuk **Real Time Vessel Tracking System**. Model data ini menjadi fondasi untuk ingestion, normalisasi, penyimpanan, query geospasial, histori pergerakan, latest position, geofence, alert, playback, analytics, dan integrasi API.

Pada tahap MVP, sistem akan menerima data dari **AIS API Provider**, lalu menormalisasinya ke dalam format internal standar. Karena setiap provider dapat memiliki struktur data berbeda, model data harus bersifat **provider-agnostic**. Semua data eksternal harus melewati proses mapping, validation, enrichment, dan quality scoring sebelum digunakan oleh aplikasi.

Model data ini dirancang dengan prinsip:

1. **Raw data tetap disimpan** untuk audit dan debugging.
2. **Clean data digunakan aplikasi** untuk tracking, peta, alert, dan analytics.
3. **Latest position dipisahkan dari history** agar dashboard real-time tetap cepat.
4. **Historical position disimpan sebagai time-series** agar playback dan analitik rute efisien.
5. **Geometry/PostGIS menjadi first-class field** untuk query area, bbox, geofence, dan jarak.
6. **Data quality dan source metadata disimpan eksplisit** agar sistem bisa menilai apakah data real-time, delayed, stale, invalid, atau suspicious.

---

## 2. Tujuan Dokumen

Dokumen ini bertujuan untuk:

1. Menentukan canonical data model untuk data AIS internal.
2. Menjelaskan entitas utama yang dibutuhkan sistem.
3. Menentukan struktur tabel database awal.
4. Menentukan standar field untuk vessel, position, raw message, latest position, geofence event, dan alert.
5. Menentukan rule validasi data AIS.
6. Menentukan strategi deduplikasi dan quality scoring.
7. Menentukan indexing dan partitioning untuk PostGIS/TimescaleDB.
8. Menjadi acuan untuk dokumen berikutnya:
   - `05_Database_ERD.md`
   - `06_API_Specification.md`
   - `07_Realtime_WebSocket_Spec.md`
   - `08_Geofence_Rule_Spec.md`
   - `09_Alerting_Spec.md`
   - `13_Testing_Strategy.md`

---

## 3. Konsep Dasar AIS dalam Sistem

AIS atau **Automatic Identification System** adalah sumber data utama untuk posisi dan identitas kapal. Pada konteks VesselTrack OS, AIS diperlakukan sebagai **event stream**: setiap update posisi kapal adalah event baru yang memiliki waktu, lokasi, identitas kapal, dan metadata kualitas.

Dalam aplikasi ini, data AIS dibagi menjadi dua kelompok besar:

| Kelompok Data | Penjelasan | Contoh |
|---|---|---|
| Static Vessel Data | Data identitas kapal yang relatif jarang berubah | MMSI, IMO, nama kapal, callsign, tipe kapal, dimensi |
| Dynamic Position Data | Data posisi/pergerakan yang sering berubah | latitude, longitude, SOG, COG, heading, navigation status, timestamp |

---

## 4. Prinsip Desain Data Model

| Prinsip | Penjelasan |
|---|---|
| Provider-Agnostic | Model internal tidak mengikuti satu provider tertentu. Provider apa pun harus dipetakan ke schema internal. |
| Raw + Clean Separation | Raw response disimpan terpisah dari data bersih. Ini penting untuk audit, replay, dan debugging. |
| Latest + History Separation | Latest position dipakai dashboard cepat, historical position dipakai playback dan analytics. |
| Geospatial Native | Field lokasi wajib memiliki representasi `geometry(Point, 4326)` atau `geography(Point, 4326)`. |
| Time-Series Ready | Posisi kapal disimpan dengan timestamp sebagai dimensi utama. |
| Quality-Aware | Setiap posisi memiliki quality flag, latency, source, dan validation status. |
| Idempotent Ingestion | Data yang sama tidak boleh membuat duplikasi posisi berulang. |
| Extensible | Siap menambah receiver lokal, GPS tracker, weather, route plan, dan port call data. |

---

## 5. High-Level Entity Model

Entitas utama untuk MVP:

```text
vessels
  └── vessel_positions
        ├── vessel_latest_positions
        ├── vessel_position_raw_messages
        ├── vessel_position_quality_checks
        └── vessel_events

geofences
  └── geofence_events
        └── alerts

providers
  └── provider_ingestion_runs
```

### 5.1 Entity Relationship Ringkas

```text
Provider 1 ─── * Raw Message
Provider 1 ─── * Ingestion Run

Vessel 1 ─── * Vessel Position
Vessel 1 ─── 1 Latest Position
Vessel 1 ─── * Vessel Event

Vessel Position 1 ─── * Quality Check
Vessel Position 1 ─── * Geofence Event

Geofence 1 ─── * Geofence Event
Geofence Event 1 ─── 0..1 Alert
```

---

## 6. Canonical AIS Position Payload

Semua provider harus dinormalisasi ke format internal berikut sebelum masuk ke storage/application layer.

```json
{
  "source": {
    "provider_code": "AIS_PROVIDER_A",
    "source_type": "ais_api",
    "provider_message_id": "optional-provider-message-id",
    "received_at": "2026-06-21T03:15:20Z"
  },
  "vessel": {
    "mmsi": "525123456",
    "imo": "9876543",
    "name": "MV Musi Jaya",
    "callsign": "YB1234",
    "vessel_type": "cargo",
    "flag": "ID",
    "length_m": 120.5,
    "width_m": 22.0
  },
  "position": {
    "position_time": "2026-06-21T03:15:12Z",
    "latitude": -6.0951,
    "longitude": 106.8856,
    "sog_knots": 12.4,
    "cog_degrees": 88.5,
    "heading_degrees": 90,
    "rot_degrees_per_min": null,
    "nav_status": "under_way_using_engine",
    "accuracy": "high",
    "raim_flag": null
  },
  "voyage": {
    "destination": "TANJUNG PRIOK",
    "eta": "2026-06-21T13:45:00Z",
    "draught_m": 6.8
  },
  "quality": {
    "validation_status": "valid",
    "quality_score": 95,
    "latency_seconds": 8,
    "is_duplicate": false,
    "is_stale": false,
    "is_suspicious": false
  }
}
```

---

## 7. Data Domain

### 7.1 Vessel Identity Domain

Menyimpan identitas kapal.

| Field | Wajib MVP | Penjelasan |
|---|---:|---|
| `mmsi` | Ya | Maritime Mobile Service Identity, identifier utama untuk tracking. |
| `imo` | Tidak | IMO number, jika tersedia. |
| `name` | Ya | Nama kapal. Jika kosong, tampilkan `Unknown Vessel {mmsi}`. |
| `callsign` | Tidak | Callsign kapal. |
| `vessel_type` | Ya | Tipe kapal hasil mapping provider. |
| `flag` | Tidak | Negara bendera kapal. |
| `length_m` | Tidak | Panjang kapal dalam meter. |
| `width_m` | Tidak | Lebar kapal dalam meter. |
| `source_provider` | Ya | Provider terakhir yang memperbarui data vessel. |
| `created_at` | Ya | Waktu record dibuat. |
| `updated_at` | Ya | Waktu record diperbarui. |

### 7.2 Position Domain

Menyimpan data posisi dinamis.

| Field | Wajib MVP | Penjelasan |
|---|---:|---|
| `mmsi` | Ya | Relasi ke vessel. |
| `position_time` | Ya | Waktu posisi dari provider/AIS. |
| `received_at` | Ya | Waktu data diterima sistem. |
| `latitude` | Ya | Latitude WGS84. |
| `longitude` | Ya | Longitude WGS84. |
| `geom` | Ya | Point geometry PostGIS. |
| `sog_knots` | Ya | Speed Over Ground dalam knot. |
| `cog_degrees` | Ya | Course Over Ground dalam derajat. |
| `heading_degrees` | Tidak | Heading kapal dalam derajat. |
| `nav_status` | Tidak | Navigation status. |
| `source_provider` | Ya | Provider sumber posisi. |
| `quality_score` | Ya | Skor kualitas 0-100. |
| `validation_status` | Ya | `valid`, `warning`, `invalid`. |
| `created_at` | Ya | Waktu insert ke database. |

### 7.3 Voyage Domain

Menyimpan informasi perjalanan bila tersedia.

| Field | Wajib MVP | Penjelasan |
|---|---:|---|
| `destination` | Tidak | Tujuan kapal. |
| `eta` | Tidak | Estimated Time of Arrival. |
| `draught_m` | Tidak | Draft kapal dalam meter. |
| `last_updated_at` | Tidak | Waktu data voyage diperbarui. |

### 7.4 Source Metadata Domain

Menyimpan metadata sumber data.

| Field | Wajib MVP | Penjelasan |
|---|---:|---|
| `provider_code` | Ya | Kode provider internal. |
| `source_type` | Ya | `ais_api`, `ais_receiver`, `gps_iot`, `manual`. |
| `provider_message_id` | Tidak | ID message dari provider jika ada. |
| `provider_received_at` | Tidak | Waktu provider menerima data. |
| `system_received_at` | Ya | Waktu sistem menerima data. |
| `raw_payload_hash` | Ya | Hash untuk deduplikasi raw response. |

---

## 8. Enumerasi Standar

### 8.1 Source Type

| Value | Penjelasan |
|---|---|
| `ais_api` | Data dari AIS API Provider. |
| `ais_receiver` | Data dari receiver AIS lokal. |
| `gps_iot` | Data dari GPS/IoT tracker. |
| `manual` | Data input manual/admin. |
| `simulator` | Data simulasi untuk testing/demo. |

### 8.2 Vessel Type Normalized

| Value | Penjelasan |
|---|---|
| `cargo` | Kapal kargo. |
| `tanker` | Kapal tanker. |
| `passenger` | Kapal penumpang. |
| `tug` | Tugboat. |
| `fishing` | Kapal ikan. |
| `pilot` | Kapal pandu. |
| `pleasure` | Kapal rekreasi. |
| `high_speed` | Kapal cepat. |
| `law_enforcement` | Kapal patroli/penegak hukum. |
| `sar` | Search and rescue. |
| `military` | Kapal militer. |
| `unknown` | Tidak diketahui. |

### 8.3 Navigation Status Normalized

| Value | Penjelasan |
|---|---|
| `under_way_using_engine` | Berlayar menggunakan mesin. |
| `at_anchor` | Berlabuh jangkar. |
| `not_under_command` | Tidak dapat dikendalikan. |
| `restricted_manoeuvrability` | Kemampuan manuver terbatas. |
| `constrained_by_draught` | Terbatas draft. |
| `moored` | Tambat. |
| `aground` | Kandas. |
| `engaged_in_fishing` | Sedang menangkap ikan. |
| `under_way_sailing` | Berlayar dengan layar. |
| `reserved` | Reserved. |
| `unknown` | Tidak diketahui. |

### 8.4 Position Status

| Value | Penjelasan |
|---|---|
| `realtime` | Data masih segar sesuai SLA latency. |
| `delayed` | Data terlambat tetapi masih dapat digunakan. |
| `stale` | Data terlalu lama, tampilkan sebagai posisi terakhir. |
| `offline` | Tidak ada update melewati ambang batas offline. |
| `invalid` | Data gagal validasi. |
| `suspicious` | Data lolos sebagian tetapi mencurigakan. |

### 8.5 Validation Status

| Value | Penjelasan |
|---|---|
| `valid` | Data lolos validasi utama. |
| `warning` | Data masih dapat dipakai tetapi memiliki catatan kualitas. |
| `invalid` | Data tidak boleh dipakai untuk dashboard/analytics utama. |

---

## 9. Skema Database MVP

> Catatan: DDL berikut adalah rancangan awal. Final DDL akan dirinci pada `05_Database_ERD.md`.

### 9.1 Table: `data_providers`

```sql
CREATE TABLE data_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(64) NOT NULL UNIQUE,
    provider_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(32) NOT NULL,
    base_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    rate_limit_per_minute INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 9.2 Table: `vessels`

```sql
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mmsi VARCHAR(16) NOT NULL UNIQUE,
    imo VARCHAR(16),
    name VARCHAR(255),
    callsign VARCHAR(64),
    vessel_type VARCHAR(64) NOT NULL DEFAULT 'unknown',
    vessel_type_raw VARCHAR(128),
    flag VARCHAR(8),
    length_m NUMERIC(8,2),
    width_m NUMERIC(8,2),
    source_provider VARCHAR(64),
    first_seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_vessels_mmsi_not_empty CHECK (length(trim(mmsi)) > 0)
);

CREATE INDEX idx_vessels_name ON vessels USING gin (to_tsvector('simple', coalesce(name, '')));
CREATE INDEX idx_vessels_vessel_type ON vessels (vessel_type);
CREATE INDEX idx_vessels_last_seen_at ON vessels (last_seen_at DESC);
```

### 9.3 Table: `vessel_position_raw_messages`

```sql
CREATE TABLE vessel_position_raw_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES data_providers(id),
    provider_code VARCHAR(64) NOT NULL,
    provider_message_id VARCHAR(255),
    mmsi VARCHAR(16),
    raw_payload JSONB NOT NULL,
    raw_payload_hash CHAR(64) NOT NULL,
    provider_received_at TIMESTAMPTZ,
    system_received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    parse_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    parse_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_raw_payload_hash UNIQUE (raw_payload_hash)
);

CREATE INDEX idx_raw_messages_mmsi ON vessel_position_raw_messages (mmsi);
CREATE INDEX idx_raw_messages_received_at ON vessel_position_raw_messages (system_received_at DESC);
CREATE INDEX idx_raw_messages_payload_gin ON vessel_position_raw_messages USING gin (raw_payload);
```

### 9.4 Table: `vessel_positions`

```sql
CREATE TABLE vessel_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID REFERENCES vessels(id),
    mmsi VARCHAR(16) NOT NULL,
    position_time TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    sog_knots NUMERIC(8,3),
    cog_degrees NUMERIC(8,3),
    heading_degrees NUMERIC(8,3),
    rot_degrees_per_min NUMERIC(10,4),
    nav_status VARCHAR(64) DEFAULT 'unknown',
    nav_status_raw VARCHAR(128),
    accuracy VARCHAR(32),
    raim_flag BOOLEAN,
    destination VARCHAR(255),
    eta TIMESTAMPTZ,
    draught_m NUMERIC(6,2),
    source_provider VARCHAR(64) NOT NULL,
    source_type VARCHAR(32) NOT NULL DEFAULT 'ais_api',
    raw_message_id UUID REFERENCES vessel_position_raw_messages(id),
    validation_status VARCHAR(32) NOT NULL DEFAULT 'valid',
    quality_score INTEGER NOT NULL DEFAULT 100,
    latency_seconds INTEGER,
    is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    is_stale BOOLEAN NOT NULL DEFAULT FALSE,
    is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_position_lat CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_position_lon CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_position_quality_score CHECK (quality_score BETWEEN 0 AND 100),
    CONSTRAINT chk_position_sog CHECK (sog_knots IS NULL OR sog_knots >= 0),
    CONSTRAINT chk_position_cog CHECK (cog_degrees IS NULL OR cog_degrees >= 0 AND cog_degrees <= 360),
    CONSTRAINT chk_position_heading CHECK (heading_degrees IS NULL OR heading_degrees >= 0 AND heading_degrees <= 360)
);

CREATE INDEX idx_vessel_positions_mmsi_time ON vessel_positions (mmsi, position_time DESC);
CREATE INDEX idx_vessel_positions_time ON vessel_positions (position_time DESC);
CREATE INDEX idx_vessel_positions_geom ON vessel_positions USING gist (geom);
CREATE INDEX idx_vessel_positions_source ON vessel_positions (source_provider, source_type);
CREATE UNIQUE INDEX uq_vessel_position_dedupe
    ON vessel_positions (mmsi, position_time, latitude, longitude, source_provider);
```

### 9.5 TimescaleDB Hypertable Recommendation

Jika menggunakan TimescaleDB:

```sql
SELECT create_hypertable('vessel_positions', 'position_time', if_not_exists => TRUE);
```

Rekomendasi chunk interval awal:

| Skala Data | Chunk Interval |
|---|---|
| MVP kecil | 1 hari |
| Area pelabuhan padat | 6-12 jam |
| Multi-area / high frequency | 1-6 jam |

### 9.6 Table: `vessel_latest_positions`

```sql
CREATE TABLE vessel_latest_positions (
    mmsi VARCHAR(16) PRIMARY KEY,
    vessel_id UUID REFERENCES vessels(id),
    position_id UUID REFERENCES vessel_positions(id),
    position_time TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    sog_knots NUMERIC(8,3),
    cog_degrees NUMERIC(8,3),
    heading_degrees NUMERIC(8,3),
    nav_status VARCHAR(64),
    position_status VARCHAR(32) NOT NULL DEFAULT 'realtime',
    source_provider VARCHAR(64) NOT NULL,
    quality_score INTEGER NOT NULL DEFAULT 100,
    last_seen_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_latest_positions_geom ON vessel_latest_positions USING gist (geom);
CREATE INDEX idx_latest_positions_status ON vessel_latest_positions (position_status);
CREATE INDEX idx_latest_positions_last_seen ON vessel_latest_positions (last_seen_at DESC);
```

### 9.7 Table: `vessel_position_quality_checks`

```sql
CREATE TABLE vessel_position_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID REFERENCES vessel_positions(id),
    mmsi VARCHAR(16) NOT NULL,
    check_name VARCHAR(128) NOT NULL,
    check_status VARCHAR(32) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'info',
    score_impact INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    check_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quality_checks_position ON vessel_position_quality_checks (position_id);
CREATE INDEX idx_quality_checks_mmsi_time ON vessel_position_quality_checks (mmsi, created_at DESC);
CREATE INDEX idx_quality_checks_status ON vessel_position_quality_checks (check_status, severity);
```

### 9.8 Table: `vessel_events`

```sql
CREATE TABLE vessel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mmsi VARCHAR(16) NOT NULL,
    vessel_id UUID REFERENCES vessels(id),
    position_id UUID REFERENCES vessel_positions(id),
    event_type VARCHAR(64) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    event_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vessel_events_mmsi_time ON vessel_events (mmsi, event_time DESC);
CREATE INDEX idx_vessel_events_type_time ON vessel_events (event_type, event_time DESC);
CREATE INDEX idx_vessel_events_severity ON vessel_events (severity);
```

---

## 10. Geospatial Model Pendukung

Walaupun geofence akan dirinci pada dokumen `08_Geofence_Rule_Spec.md`, AIS data model perlu mendefinisikan hubungan posisi dengan area.

### 10.1 Table: `geofences`

```sql
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    geofence_type VARCHAR(64) NOT NULL DEFAULT 'general',
    geom geometry(Polygon, 4326) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    severity_default VARCHAR(32) NOT NULL DEFAULT 'warning',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_geofences_geom ON geofences USING gist (geom);
CREATE INDEX idx_geofences_active ON geofences (is_active);
```

### 10.2 Table: `geofence_events`

```sql
CREATE TABLE geofence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geofence_id UUID REFERENCES geofences(id),
    mmsi VARCHAR(16) NOT NULL,
    vessel_id UUID REFERENCES vessels(id),
    position_id UUID REFERENCES vessel_positions(id),
    event_type VARCHAR(64) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'warning',
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_geofence_events_geofence_time ON geofence_events (geofence_id, event_time DESC);
CREATE INDEX idx_geofence_events_mmsi_time ON geofence_events (mmsi, event_time DESC);
CREATE INDEX idx_geofence_events_type_time ON geofence_events (event_type, event_time DESC);
```

---

## 11. Validation Rules

### 11.1 Mandatory Field Validation

| Rule | Kondisi Invalid |
|---|---|
| MMSI wajib ada | `mmsi` kosong/null. |
| Timestamp wajib ada | `position_time` kosong/null. |
| Latitude valid | Latitude bukan angka atau di luar -90 sampai 90. |
| Longitude valid | Longitude bukan angka atau di luar -180 sampai 180. |
| Source provider wajib ada | `source_provider` kosong/null. |

### 11.2 Range Validation

| Field | Range Valid | Status Jika Gagal |
|---|---:|---|
| `latitude` | -90 sampai 90 | invalid |
| `longitude` | -180 sampai 180 | invalid |
| `sog_knots` | >= 0 | warning/invalid tergantung nilai |
| `cog_degrees` | 0 sampai 360 | warning |
| `heading_degrees` | 0 sampai 360 | warning |
| `quality_score` | 0 sampai 100 | invalid |

### 11.3 Timestamp Validation

| Kondisi | Status |
|---|---|
| `position_time` di masa depan lebih dari 5 menit | warning/suspicious |
| `position_time` lebih lama dari batas stale | stale |
| `received_at` lebih awal dari `position_time` secara tidak wajar | warning |
| latency terlalu tinggi | delayed/stale |

Batas awal yang direkomendasikan:

| Parameter | Nilai MVP |
|---|---:|
| Realtime threshold | <= 60 detik |
| Delayed threshold | > 60 detik sampai 10 menit |
| Stale threshold | > 10 menit sampai 60 menit |
| Offline threshold | > 60 menit |

### 11.4 Movement Validation

Validasi pergerakan membandingkan posisi baru dengan posisi sebelumnya.

| Check | Penjelasan | Status |
|---|---|---|
| Position jump | Perpindahan terlalu jauh dalam waktu pendek. | suspicious |
| Unrealistic speed | Kecepatan hasil hitung dari jarak/waktu terlalu tinggi. | suspicious |
| Duplicate point | Posisi sama dengan timestamp sama. | duplicate |
| Zero movement long duration | Kapal diam terlalu lama, tergantung nav status. | info/warning |
| Heading mismatch | Heading sangat berbeda dengan COG secara ekstrem. | warning |

Formula sederhana:

```text
computed_speed_knots = distance_nm(previous_position, current_position) / time_hours
```

Jika `computed_speed_knots` jauh lebih besar dari `sog_knots` atau melewati batas tipe kapal, beri flag `is_suspicious = true`.

---

## 12. Deduplication Strategy

### 12.1 Raw Payload Deduplication

Raw response dicegah duplikat dengan:

```text
raw_payload_hash = SHA256(provider_code + normalized_raw_payload)
```

Jika hash sudah ada, raw message tidak perlu disimpan ulang.

### 12.2 Clean Position Deduplication

Clean position dianggap duplikat jika kombinasi berikut sama:

```text
mmsi + position_time + latitude + longitude + source_provider
```

Untuk provider yang sering mengirim data sama dengan timestamp berbeda sangat dekat, gunakan toleransi opsional:

```text
mmsi sama
latitude/lon sama atau jarak < 5 meter
selisih position_time < 5 detik
source_provider sama
```

### 12.3 Latest Position Update Rule

`vessel_latest_positions` hanya diperbarui jika:

1. Data baru valid atau warning tetapi masih usable.
2. `position_time` lebih baru daripada latest position saat ini.
3. Data tidak ditandai sebagai duplicate.
4. Data tidak invalid.

Jika data lebih lama tetapi memiliki kualitas lebih baik, data tetap masuk history, tetapi tidak mengubah latest position.

---

## 13. Quality Scoring

Quality score awal menggunakan skala 0-100.

| Kondisi | Pengurangan Skor |
|---|---:|
| Missing vessel name | -5 |
| Missing heading | -3 |
| Missing SOG | -10 |
| Timestamp delayed | -10 |
| Timestamp stale | -30 |
| Position jump suspicious | -40 |
| Invalid nav status mapping | -5 |
| Duplicate | -100 untuk pemakaian aplikasi, tetap bisa dicatat sebagai duplicate |
| Provider low confidence | -10 sampai -30 |

Interpretasi:

| Score | Kategori | Penggunaan |
|---:|---|---|
| 90-100 | Excellent | Dipakai penuh. |
| 75-89 | Good | Dipakai dashboard dan analytics. |
| 50-74 | Warning | Dipakai dashboard dengan indikator kualitas. |
| 1-49 | Poor | Jangan dipakai untuk alert kritikal. |
| 0 | Invalid/Duplicate | Jangan dipakai untuk latest position. |

---

## 14. Mapping dari Provider ke Model Internal

### 14.1 Contoh Mapping Provider JSON

| Provider Field | Internal Field | Transformasi |
|---|---|---|
| `mmsi` | `vessel.mmsi` | Cast ke string. |
| `imo` | `vessel.imo` | Cast ke string jika tersedia. |
| `ship_name` / `name` | `vessel.name` | Trim, uppercase/lowercase normalization opsional. |
| `ship_type` | `vessel.vessel_type_raw` | Simpan raw, lalu mapping ke normalized type. |
| `lat` | `position.latitude` | Cast double. |
| `lon` / `lng` | `position.longitude` | Cast double. |
| `speed` / `sog` | `position.sog_knots` | Pastikan satuan knot. |
| `course` / `cog` | `position.cog_degrees` | Derajat 0-360. |
| `heading` | `position.heading_degrees` | Derajat 0-360. |
| `timestamp` / `last_position` | `position.position_time` | Convert ke UTC. |
| `destination` | `voyage.destination` | Trim text. |
| `eta` | `voyage.eta` | Convert ke UTC jika tersedia. |

### 14.2 Provider-Specific Adapter

Setiap provider memiliki adapter:

```text
ProviderAdapter
  ├── fetch(area_filter, since)
  ├── parse(raw_payload)
  ├── normalize(parsed_payload)
  ├── validate(normalized_payload)
  └── emit(canonical_payload)
```

Output adapter harus selalu mengikuti canonical AIS payload.

---

## 15. Geospatial Representation

### 15.1 Coordinate System

Sistem menggunakan:

```text
EPSG:4326 / WGS84
```

Field lokasi disimpan sebagai:

```sql
geom geometry(Point, 4326)
```

Pembuatan geometry:

```sql
ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
```

Catatan penting: `ST_MakePoint` menggunakan urutan `(longitude, latitude)`, bukan `(latitude, longitude)`.

### 15.2 Query Kapal dalam Viewport Peta

```sql
SELECT *
FROM vessel_latest_positions
WHERE ST_Intersects(
    geom,
    ST_MakeEnvelope(:min_lon, :min_lat, :max_lon, :max_lat, 4326)
);
```

### 15.3 Query Kapal dalam Geofence

```sql
SELECT vlp.*
FROM vessel_latest_positions vlp
JOIN geofences g
  ON ST_Contains(g.geom, vlp.geom)
WHERE g.code = :geofence_code
  AND g.is_active = TRUE;
```

### 15.4 Query Track History

```sql
SELECT
    mmsi,
    position_time,
    latitude,
    longitude,
    sog_knots,
    cog_degrees,
    heading_degrees
FROM vessel_positions
WHERE mmsi = :mmsi
  AND position_time BETWEEN :start_time AND :end_time
ORDER BY position_time ASC;
```

---

## 16. Latest Position Materialization

Dashboard real-time tidak boleh selalu membaca historical table besar. Sistem perlu tabel khusus latest position.

### 16.1 Update Flow

```text
New valid position
  ↓
Insert into vessel_positions
  ↓
Compare with vessel_latest_positions
  ↓
If newer and usable:
    upsert vessel_latest_positions
  ↓
Emit WebSocket event
```

### 16.2 Upsert Example

```sql
INSERT INTO vessel_latest_positions (
    mmsi,
    vessel_id,
    position_id,
    position_time,
    received_at,
    latitude,
    longitude,
    geom,
    sog_knots,
    cog_degrees,
    heading_degrees,
    nav_status,
    position_status,
    source_provider,
    quality_score,
    last_seen_at,
    updated_at
)
VALUES (...)
ON CONFLICT (mmsi)
DO UPDATE SET
    position_id = EXCLUDED.position_id,
    position_time = EXCLUDED.position_time,
    received_at = EXCLUDED.received_at,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    geom = EXCLUDED.geom,
    sog_knots = EXCLUDED.sog_knots,
    cog_degrees = EXCLUDED.cog_degrees,
    heading_degrees = EXCLUDED.heading_degrees,
    nav_status = EXCLUDED.nav_status,
    position_status = EXCLUDED.position_status,
    source_provider = EXCLUDED.source_provider,
    quality_score = EXCLUDED.quality_score,
    last_seen_at = EXCLUDED.last_seen_at,
    updated_at = now()
WHERE vessel_latest_positions.position_time < EXCLUDED.position_time;
```

---

## 17. WebSocket Event Model

AIS data model harus mendukung event untuk frontend.

### 17.1 Vessel Position Update

```json
{
  "event_type": "vessel.position.updated",
  "event_time": "2026-06-21T03:15:20Z",
  "data": {
    "mmsi": "525123456",
    "name": "MV Musi Jaya",
    "vessel_type": "cargo",
    "position_time": "2026-06-21T03:15:12Z",
    "lat": -6.0951,
    "lon": 106.8856,
    "sog_knots": 12.4,
    "cog_degrees": 88.5,
    "heading_degrees": 90,
    "nav_status": "under_way_using_engine",
    "position_status": "realtime",
    "quality_score": 95
  }
}
```

### 17.2 Vessel Status Changed

```json
{
  "event_type": "vessel.status.changed",
  "event_time": "2026-06-21T03:25:00Z",
  "data": {
    "mmsi": "525123456",
    "previous_status": "realtime",
    "current_status": "stale",
    "reason": "No update received for more than 10 minutes"
  }
}
```

### 17.3 Geofence Event

```json
{
  "event_type": "geofence.entered",
  "event_time": "2026-06-21T03:18:33Z",
  "data": {
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya",
    "geofence_code": "GF-01",
    "geofence_name": "Area Terbatas",
    "severity": "warning",
    "lat": -6.0912,
    "lon": 106.8811
  }
}
```

---

## 18. API DTO Model Awal

### 18.1 Vessel List DTO

```json
{
  "mmsi": "525123456",
  "imo": "9876543",
  "name": "MV Musi Jaya",
  "vessel_type": "cargo",
  "flag": "ID",
  "status": "realtime",
  "last_position": {
    "lat": -6.0951,
    "lon": 106.8856,
    "position_time": "2026-06-21T03:15:12Z",
    "sog_knots": 12.4,
    "cog_degrees": 88.5,
    "heading_degrees": 90
  }
}
```

### 18.2 Vessel Detail DTO

```json
{
  "mmsi": "525123456",
  "imo": "9876543",
  "name": "MV Musi Jaya",
  "callsign": "YB1234",
  "vessel_type": "cargo",
  "flag": "ID",
  "length_m": 120.5,
  "width_m": 22.0,
  "latest_position": {
    "lat": -6.0951,
    "lon": 106.8856,
    "position_time": "2026-06-21T03:15:12Z",
    "received_at": "2026-06-21T03:15:20Z",
    "sog_knots": 12.4,
    "cog_degrees": 88.5,
    "heading_degrees": 90,
    "nav_status": "under_way_using_engine",
    "position_status": "realtime",
    "quality_score": 95
  },
  "voyage": {
    "destination": "TANJUNG PRIOK",
    "eta": "2026-06-21T13:45:00Z",
    "draught_m": 6.8
  }
}
```

### 18.3 Track History DTO

```json
{
  "mmsi": "525123456",
  "start_time": "2026-06-21T00:00:00Z",
  "end_time": "2026-06-21T04:00:00Z",
  "points": [
    {
      "time": "2026-06-21T03:00:00Z",
      "lat": -6.1001,
      "lon": 106.8712,
      "sog_knots": 8.5,
      "cog_degrees": 77.2,
      "heading_degrees": 80
    }
  ]
}
```

---

## 19. Data Retention Strategy

| Data | Retention MVP | Retention Production | Catatan |
|---|---:|---:|---|
| Raw payload | 30-90 hari | 90-365 hari | Bisa dipindah ke object storage. |
| Clean vessel positions | 6-12 bulan | 1-5 tahun | Tergantung biaya dan kebutuhan audit. |
| Latest position | Selalu terbaru | Selalu terbaru | Satu record per MMSI. |
| Quality checks | 30-90 hari | 6-12 bulan | Untuk debugging dan audit. |
| Events/alerts | 6-12 bulan | 1-5 tahun | Penting untuk audit operasional. |

---

## 20. Partitioning, Indexing, dan Performance

### 20.1 Index Utama

| Query | Index |
|---|---|
| Cari kapal berdasarkan MMSI | `vessels(mmsi)` dan `vessel_latest_positions(mmsi)` |
| Tampilkan kapal dalam viewport | GiST index pada `vessel_latest_positions.geom` |
| Track history kapal | `vessel_positions(mmsi, position_time DESC)` |
| Query time range | Timescale hypertable pada `position_time` |
| Query geofence | GiST index pada `geofences.geom` dan `vessel_latest_positions.geom` |
| Alert feed | `vessel_events(event_type, event_time DESC)` |

### 20.2 Performance Target MVP

| Operasi | Target |
|---|---:|
| Load latest vessels pada viewport | < 1 detik untuk area MVP |
| Insert posisi baru | < 100 ms per record batch kecil |
| WebSocket emit setelah insert valid | < 2 detik dari data diterima |
| Query history 1 kapal 24 jam | < 2 detik |
| Geofence check per position | < 200 ms pada jumlah geofence MVP |

---

## 21. Data Privacy dan Security

Walaupun data AIS sebagian dapat bersumber dari layanan publik/komersial, sistem tetap harus mengelola keamanan data dengan serius.

### 21.1 Security Controls

1. API key provider tidak boleh disimpan di frontend.
2. Raw payload dapat mengandung data vendor, sehingga akses dibatasi untuk admin/developer.
3. Data export harus mengikuti role dan audit trail.
4. Semua mutation data manual harus tercatat di audit log.
5. Provider credential disimpan di secret manager atau environment variable terenkripsi.
6. WebSocket hanya boleh diakses user terautentikasi.

### 21.2 Field Sensitivity

| Field | Sensitivitas | Catatan |
|---|---|---|
| MMSI | Medium | Identifier kapal. |
| Vessel name | Low-Medium | Dapat menjadi sensitif untuk operasi tertentu. |
| Real-time position | High Operational | Batasi akses berdasarkan role. |
| Raw payload | High Technical/Contractual | Bisa terkait lisensi vendor. |
| Provider API key | Critical | Jangan pernah masuk database plain text. |

---

## 22. Data Lifecycle

```text
Fetch / Receive Data
  ↓
Store Raw Payload
  ↓
Parse Provider Payload
  ↓
Normalize to Canonical Payload
  ↓
Validate Mandatory + Range + Movement
  ↓
Score Data Quality
  ↓
Upsert Vessel Registry
  ↓
Insert Historical Position
  ↓
Update Latest Position
  ↓
Check Geofence Rules
  ↓
Create Events / Alerts
  ↓
Emit WebSocket Update
```

---

## 23. Error Handling

| Error | Handling |
|---|---|
| Provider response invalid JSON | Simpan ingestion error, jangan masuk clean table. |
| MMSI kosong | Raw tetap disimpan, clean position rejected. |
| Koordinat invalid | Raw tetap disimpan, clean position rejected. |
| Timestamp kosong | Gunakan provider received time hanya jika disetujui rule; jika tidak, reject. |
| Duplicate raw payload | Abaikan insert raw baru, log sebagai duplicate. |
| Duplicate clean position | Tandai duplicate, tidak update latest. |
| Geofence check gagal | Position tetap disimpan, geofence error masuk log. |
| DB insert gagal | Retry dengan backoff; jika gagal, kirim ke dead-letter queue pada production. |

---

## 24. Testing Data Model

### 24.1 Unit Test

1. Mapping provider field ke canonical payload.
2. Validasi MMSI kosong.
3. Validasi lat/lon out of range.
4. Validasi COG/heading out of range.
5. Deduplication hash.
6. Quality score calculation.
7. Position status calculation.
8. Vessel type mapping.
9. Nav status mapping.

### 24.2 Integration Test

1. Insert raw payload → parse → clean position.
2. Insert position valid → latest position ter-update.
3. Insert posisi lama → latest tidak berubah.
4. Insert duplicate → tidak update latest.
5. Insert posisi dalam geofence → geofence event tercipta.
6. Query viewport map mengembalikan kapal yang benar.
7. Query track history mengembalikan urutan waktu benar.

### 24.3 Sample Test Dataset

Minimal dataset untuk development:

| Dataset | Jumlah |
|---|---:|
| Vessel registry sample | 20 kapal |
| Position history sample | 1.000 titik |
| Raw payload sample | 1.000 payload |
| Geofence sample | 5 polygon |
| Alert event sample | 20 event |

---

## 25. Open Questions

1. AIS provider mana yang akan digunakan untuk MVP?
2. Apakah provider menyediakan `provider_message_id` unik?
3. Berapa latency SLA yang realistis dari provider?
4. Apakah area monitoring hanya pelabuhan tertentu atau multi-area?
5. Berapa retention data historis yang dibutuhkan secara bisnis?
6. Apakah perlu menyimpan raw AIS NMEA jika kelak receiver lokal digunakan?
7. Apakah data kapal internal perlu menjadi master dibanding data provider?
8. Apakah ada kebutuhan membatasi akses posisi real-time berdasarkan area/role?
9. Apakah export data boleh membawa raw provider fields atau hanya normalized fields?
10. Apakah vessel registry perlu integrasi dengan sistem aset internal?

---

## 26. Acceptance Criteria

Dokumen AIS Data Model dianggap siap dipakai jika:

1. Seluruh data dari AIS API Provider dapat dipetakan ke canonical payload.
2. Struktur `vessels`, `vessel_positions`, dan `vessel_latest_positions` cukup untuk MVP map dan detail kapal.
3. Data historis dapat digunakan untuk playback route.
4. Field geometri dapat digunakan untuk query viewport dan geofence.
5. Sistem dapat membedakan raw payload, clean position, latest position, dan event.
6. Validation rules, deduplication rules, dan quality scoring telah didefinisikan.
7. Model mendukung WebSocket event dan REST API DTO awal.
8. Model siap diturunkan menjadi ERD dan DDL final pada `05_Database_ERD.md`.

---

## 27. Appendix: Rekomendasi Naming Convention

### 27.1 Table Naming

Gunakan plural snake_case:

```text
vessels
vessel_positions
vessel_latest_positions
vessel_events
geofences
geofence_events
```

### 27.2 Column Naming

Gunakan snake_case dan satuan eksplisit:

```text
sog_knots
cog_degrees
heading_degrees
length_m
width_m
draught_m
latency_seconds
```

### 27.3 Timestamp Naming

| Nama | Arti |
|---|---|
| `position_time` | Waktu posisi asli dari AIS/provider. |
| `received_at` | Waktu data diterima sistem. |
| `created_at` | Waktu record dibuat di database. |
| `updated_at` | Waktu record diperbarui. |
| `last_seen_at` | Waktu terakhir kapal terlihat valid. |

---

## 28. Appendix: Minimal Field untuk MVP

Jika ingin memulai sangat ramping, field minimum yang wajib ada:

### 28.1 Vessel

```text
mmsi
name
vessel_type
created_at
updated_at
```

### 28.2 Position

```text
mmsi
position_time
received_at
latitude
longitude
geom
sog_knots
cog_degrees
heading_degrees
source_provider
validation_status
quality_score
```

### 28.3 Latest Position

```text
mmsi
position_time
latitude
longitude
geom
sog_knots
cog_degrees
heading_degrees
position_status
last_seen_at
```

### 28.4 Raw Message

```text
provider_code
raw_payload
raw_payload_hash
system_received_at
parse_status
```

---

## 29. Next Step

Setelah dokumen ini, dokumen berikutnya yang perlu dibuat adalah:

```text
05_Database_ERD.md
```

Dokumen tersebut akan menurunkan AIS data model ini menjadi ERD final, relationship detail, constraint final, index final, migration plan, dan database deployment strategy.
