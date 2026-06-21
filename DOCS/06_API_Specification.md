# 06_API_Specification.md
# API Specification
# Real Time Vessel Tracking System

**Nama Sistem Contoh:** VesselTrack OS  
**Versi Dokumen:** v1.0  
**Tanggal:** 21 Juni 2026  
**Status:** Draft Awal  
**Diturnunkan dari:** `01_PRD.md`, `02_System_Architecture.md`, `03_Data_Source_Strategy.md`, `04_AIS_Data_Model.md`, dan `05_Database_ERD.md`  
**Pendekatan Pengembangan:** AIS API Provider → MVP Tracking → Geofence & Alert → Playback & Analytics → Hardening

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan spesifikasi API untuk **Real Time Vessel Tracking System** atau **VesselTrack OS**. API dirancang untuk menghubungkan frontend dashboard, ingestion service, geofence engine, alert engine, analytics, dan integrasi eksternal.

API dibagi menjadi dua kelompok utama:

1. **REST API** untuk operasi query, manajemen data, konfigurasi, geofence, alert, history, user, dan reporting.
2. **Realtime API** melalui WebSocket untuk update posisi kapal, alert, geofence event, dan status operasional secara langsung.

Dokumen ini menjadi acuan teknis untuk backend developer, frontend developer, QA, integrator, dan DevOps.

---

## 2. Tujuan Dokumen

Dokumen ini bertujuan untuk:

1. Menentukan kontrak API antara frontend dan backend.
2. Menentukan struktur endpoint, request, response, pagination, filter, dan error model.
3. Menstandarkan payload data kapal, posisi, geofence, alert, dan analytics.
4. Menjadi acuan implementasi OpenAPI/Swagger.
5. Menjadi dasar untuk dokumen lanjutan:
   - `07_Realtime_WebSocket_Spec.md`
   - `08_Geofence_Rule_Spec.md`
   - `09_Alerting_Spec.md`
   - `13_Testing_Strategy.md`

---

## 3. Prinsip Desain API

API VesselTrack OS menggunakan prinsip berikut:

1. **RESTful Resource-Oriented API**  
   Endpoint mengikuti pola resource seperti `/vessels`, `/positions`, `/geofences`, dan `/alerts`.

2. **Versioned API**  
   Semua endpoint MVP berada di prefix `/api/v1`.

3. **Consistent Response Envelope**  
   Semua response mengikuti struktur konsisten agar mudah dipakai frontend.

4. **Pagination by Default**  
   Endpoint list wajib mendukung pagination.

5. **Filter by Time and Geometry**  
   Data vessel tracking wajib mendukung filter waktu, bounding box, dan geofence.

6. **Auth First**  
   Semua endpoint operasional membutuhkan authentication, kecuali health check.

7. **Auditability**  
   Operasi create/update/delete dicatat ke audit log.

8. **Realtime by Delta**  
   Update peta dikirim dalam bentuk delta, bukan full refresh.

---

## 4. Base URL dan Versioning

### 4.1 Base URL Development

```text
https://dev.api.vesseltrack.local/api/v1
```

### 4.2 Base URL Production

```text
https://api.vesseltrack.example.com/api/v1
```

### 4.3 Versioning

Versi API ditempatkan pada path:

```text
/api/v1
```

Jika perubahan besar terjadi, gunakan:

```text
/api/v2
```

Perubahan minor dan backward-compatible cukup memakai field baru tanpa mengubah versi.

---

## 5. Authentication dan Authorization

### 5.1 Authentication Method

MVP menggunakan:

```text
Bearer JWT Token
```

Header:

```http
Authorization: Bearer <access_token>
```

Untuk machine-to-machine ingestion atau integrasi eksternal dapat menggunakan:

```http
X-API-Key: <api_key>
```

### 5.2 Role-Based Access Control

Role awal:

| Role | Deskripsi |
|---|---|
| `ADMIN` | Akses penuh sistem |
| `OPERATOR` | Monitoring, alert handling, geofence operational |
| `ANALYST` | History, analytics, export |
| `VIEWER` | Read-only dashboard |
| `INTEGRATION` | Ingestion/API integration |

### 5.3 Permission Matrix Ringkas

| Resource | ADMIN | OPERATOR | ANALYST | VIEWER | INTEGRATION |
|---|---:|---:|---:|---:|---:|
| Vessel read | Yes | Yes | Yes | Yes | Yes |
| Vessel update | Yes | Limited | No | No | Yes |
| Position ingest | Yes | No | No | No | Yes |
| Position read | Yes | Yes | Yes | Yes | Limited |
| Geofence create/update/delete | Yes | Yes | No | No | No |
| Alert acknowledge | Yes | Yes | No | No | No |
| Analytics | Yes | Yes | Yes | View | No |
| User management | Yes | No | No | No | No |

---

## 6. Common Headers

### 6.1 Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>
```

### 6.2 Response Headers

```http
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1718940000
```

---

## 7. Standard Response Envelope

### 7.1 Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "3e5a4d7a-1c6c-4d5e-a9b4-123456789abc",
    "timestamp": "2026-06-21T01:00:00Z"
  }
}
```

### 7.2 List Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_items": 1250,
    "total_pages": 25,
    "has_next": true
  },
  "meta": {
    "request_id": "3e5a4d7a-1c6c-4d5e-a9b4-123456789abc",
    "timestamp": "2026-06-21T01:00:00Z"
  }
}
```

### 7.3 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameter: bbox",
    "details": [
      {
        "field": "bbox",
        "issue": "Expected format: minLon,minLat,maxLon,maxLat"
      }
    ]
  },
  "meta": {
    "request_id": "3e5a4d7a-1c6c-4d5e-a9b4-123456789abc",
    "timestamp": "2026-06-21T01:00:00Z"
  }
}
```

---

## 8. HTTP Status Code

| Status | Makna |
|---:|---|
| 200 | OK |
| 201 | Created |
| 202 | Accepted |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 9. Error Code Standar

| Code | Deskripsi |
|---|---|
| `AUTH_REQUIRED` | Token tidak tersedia |
| `AUTH_INVALID` | Token tidak valid |
| `FORBIDDEN` | Role tidak memiliki akses |
| `VALIDATION_ERROR` | Payload atau query tidak valid |
| `RESOURCE_NOT_FOUND` | Resource tidak ditemukan |
| `DUPLICATE_RESOURCE` | Data duplikat |
| `RATE_LIMIT_EXCEEDED` | Melebihi batas request |
| `PROVIDER_ERROR` | Sumber data eksternal bermasalah |
| `GEOMETRY_INVALID` | Geometry/polygon tidak valid |
| `TIME_RANGE_INVALID` | Rentang waktu tidak valid |
| `INTERNAL_ERROR` | Error internal server |

---

## 10. Common Query Parameters

### 10.1 Pagination

| Parameter | Type | Default | Deskripsi |
|---|---|---:|---|
| `page` | integer | 1 | Nomor halaman |
| `page_size` | integer | 50 | Jumlah data per halaman, maksimum 500 |

Contoh:

```http
GET /api/v1/vessels?page=1&page_size=50
```

### 10.2 Sorting

| Parameter | Type | Contoh |
|---|---|---|
| `sort_by` | string | `name`, `last_seen_at`, `sog` |
| `sort_order` | string | `asc`, `desc` |

Contoh:

```http
GET /api/v1/vessels?sort_by=last_seen_at&sort_order=desc
```

### 10.3 Time Range

| Parameter | Type | Format |
|---|---|---|
| `from` | datetime | ISO 8601 UTC |
| `to` | datetime | ISO 8601 UTC |

Contoh:

```http
GET /api/v1/vessels/525123456/history?from=2026-06-21T00:00:00Z&to=2026-06-21T06:00:00Z
```

### 10.4 Bounding Box

Format:

```text
minLon,minLat,maxLon,maxLat
```

Contoh:

```http
GET /api/v1/vessels/latest?bbox=104.70,-3.05,104.90,-2.90
```

---

## 11. Data Type dan Format Standar

### 11.1 Coordinate

| Field | Type | Constraint |
|---|---|---|
| `lat` | number | -90 sampai 90 |
| `lon` | number | -180 sampai 180 |

### 11.2 Timestamp

Semua timestamp menggunakan UTC ISO 8601:

```text
2026-06-21T01:00:00Z
```

### 11.3 Vessel Identifier

| Field | Type | Deskripsi |
|---|---|---|
| `mmsi` | string | Maritime Mobile Service Identity |
| `imo` | string/null | International Maritime Organization number |
| `callsign` | string/null | Radio callsign |

### 11.4 Geometry

Untuk REST API, geometry menggunakan GeoJSON.

Contoh polygon:

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [104.7500, -2.9800],
      [104.8200, -2.9800],
      [104.8200, -3.0200],
      [104.7500, -3.0200],
      [104.7500, -2.9800]
    ]
  ]
}
```

---

# 12. API Endpoint Summary

## 12.1 Health & System

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/health` | Health check sederhana |
| GET | `/system/status` | Status komponen sistem |
| GET | `/system/metrics/summary` | Ringkasan metric operasional |

## 12.2 Authentication

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Profil user aktif |

## 12.3 Vessels

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/vessels` | Daftar kapal |
| GET | `/vessels/{mmsi}` | Detail kapal |
| PATCH | `/vessels/{mmsi}` | Update metadata kapal |
| GET | `/vessels/latest` | Latest position semua kapal |
| GET | `/vessels/{mmsi}/latest` | Latest position kapal tertentu |
| GET | `/vessels/{mmsi}/history` | Historical track kapal |
| GET | `/vessels/{mmsi}/events` | Event kapal |

## 12.4 Positions & Ingestion

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/ingestion/ais/positions` | Ingest posisi AIS canonical |
| POST | `/ingestion/ais/raw` | Ingest raw AIS/NMEA/provider payload |
| GET | `/positions` | Query posisi historis |
| GET | `/positions/latest` | Query latest position by bbox/filter |

## 12.5 Geofences

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/geofences` | Daftar geofence |
| POST | `/geofences` | Buat geofence |
| GET | `/geofences/{id}` | Detail geofence |
| PUT | `/geofences/{id}` | Update penuh geofence |
| PATCH | `/geofences/{id}` | Update sebagian geofence |
| DELETE | `/geofences/{id}` | Soft delete geofence |
| GET | `/geofences/{id}/events` | Event geofence |
| POST | `/geofences/validate` | Validasi GeoJSON polygon |

## 12.6 Alerts

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/alerts` | Daftar alert |
| GET | `/alerts/{id}` | Detail alert |
| POST | `/alerts/{id}/acknowledge` | Acknowledge alert |
| POST | `/alerts/{id}/resolve` | Resolve alert |
| POST | `/alerts/{id}/snooze` | Snooze alert |
| GET | `/alert-rules` | Daftar rule alert |
| POST | `/alert-rules` | Buat rule alert |
| PATCH | `/alert-rules/{id}` | Update rule alert |
| DELETE | `/alert-rules/{id}` | Nonaktifkan rule alert |

## 12.7 History & Playback

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/playback/vessels/{mmsi}` | Data playback kapal |
| GET | `/playback/area` | Playback semua kapal dalam area |
| GET | `/tracks/{track_id}` | Detail track tersimpan |

## 12.8 Analytics

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/analytics/summary` | Ringkasan operasional |
| GET | `/analytics/vessel-density` | Density/heatmap kapal |
| GET | `/analytics/idle-vessels` | Kapal idle/anchored |
| GET | `/analytics/port-activity` | Ringkasan aktivitas area/pelabuhan |
| GET | `/analytics/alerts` | Statistik alert |

## 12.9 Export

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/exports/vessel-history` | Export histori kapal |
| POST | `/exports/alerts` | Export alert |
| GET | `/exports/{job_id}` | Status export |
| GET | `/exports/{job_id}/download` | Download hasil export |

## 12.10 Users & Admin

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/users` | Daftar user |
| POST | `/users` | Buat user |
| GET | `/users/{id}` | Detail user |
| PATCH | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Nonaktifkan user |
| GET | `/roles` | Daftar role |
| GET | `/audit-logs` | Audit log |

---

# 13. Health & System API

## 13.1 Health Check

```http
GET /api/v1/health
```

### Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "vesseltrack-api",
    "version": "1.0.0",
    "timestamp": "2026-06-21T01:00:00Z"
  }
}
```

## 13.2 System Status

```http
GET /api/v1/system/status
```

### Response

```json
{
  "success": true,
  "data": {
    "api": "healthy",
    "database": "healthy",
    "redis": "healthy",
    "websocket": "healthy",
    "ingestion": "degraded",
    "ais_provider": "healthy",
    "last_ingestion_at": "2026-06-21T00:59:55Z"
  }
}
```

---

# 14. Authentication API

## 14.1 Login

```http
POST /api/v1/auth/login
```

### Request

```json
{
  "email": "operator@example.com",
  "password": "********"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "usr_001",
      "name": "Operator Pelabuhan",
      "email": "operator@example.com",
      "role": "OPERATOR"
    }
  }
}
```

## 14.2 Current User

```http
GET /api/v1/auth/me
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "name": "Operator Pelabuhan",
    "email": "operator@example.com",
    "role": "OPERATOR",
    "permissions": [
      "vessels:read",
      "positions:read",
      "geofences:write",
      "alerts:acknowledge"
    ]
  }
}
```

---

# 15. Vessel API

## 15.1 List Vessels

```http
GET /api/v1/vessels
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `q` | string | Search nama kapal, MMSI, IMO, callsign |
| `vessel_type` | string | Filter tipe kapal |
| `flag` | string | Filter negara bendera |
| `status` | string | Status operasional |
| `last_seen_from` | datetime | Filter last seen mulai |
| `last_seen_to` | datetime | Filter last seen sampai |
| `page` | integer | Nomor halaman |
| `page_size` | integer | Ukuran halaman |

### Example Request

```http
GET /api/v1/vessels?q=musi&page=1&page_size=20
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "mmsi": "525123456",
      "imo": "9876543",
      "name": "MV Musi Jaya",
      "callsign": "YBMC",
      "vessel_type": "Cargo",
      "flag": "ID",
      "length_m": 120.5,
      "width_m": 22.0,
      "last_seen_at": "2026-06-21T00:59:55Z",
      "latest_position": {
        "lat": -2.9761,
        "lon": 104.7754,
        "sog": 12.4,
        "cog": 88.5,
        "heading": 90,
        "nav_status": "UNDER_WAY"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false
  }
}
```

## 15.2 Get Vessel Detail

```http
GET /api/v1/vessels/{mmsi}
```

### Response

```json
{
  "success": true,
  "data": {
    "mmsi": "525123456",
    "imo": "9876543",
    "name": "MV Musi Jaya",
    "callsign": "YBMC",
    "vessel_type": "Cargo",
    "flag": "ID",
    "length_m": 120.5,
    "width_m": 22.0,
    "draught_m": 6.2,
    "destination": "Palembang",
    "eta": "2026-06-21T13:45:00Z",
    "source": "ais_provider_primary",
    "created_at": "2026-06-20T01:00:00Z",
    "updated_at": "2026-06-21T00:59:55Z"
  }
}
```

## 15.3 Update Vessel Metadata

```http
PATCH /api/v1/vessels/{mmsi}
```

### Request

```json
{
  "name": "MV Musi Jaya",
  "vessel_type": "Cargo",
  "flag": "ID",
  "notes": "Kapal prioritas monitoring area Musi"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "mmsi": "525123456",
    "updated": true,
    "updated_at": "2026-06-21T01:05:00Z"
  }
}
```

---

# 16. Position API

## 16.1 Latest Position All Vessels

```http
GET /api/v1/vessels/latest
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `bbox` | string | `minLon,minLat,maxLon,maxLat` |
| `vessel_type` | string | Filter tipe kapal |
| `status` | string | Status kapal |
| `min_sog` | number | Speed minimum |
| `max_sog` | number | Speed maksimum |
| `updated_within_minutes` | integer | Hanya kapal yang update dalam X menit |

### Example Request

```http
GET /api/v1/vessels/latest?bbox=104.70,-3.05,104.90,-2.90&updated_within_minutes=30
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "mmsi": "525123456",
      "name": "MV Musi Jaya",
      "vessel_type": "Cargo",
      "lat": -2.9761,
      "lon": 104.7754,
      "sog": 12.4,
      "cog": 88.5,
      "heading": 90,
      "nav_status": "UNDER_WAY",
      "position_accuracy": "HIGH",
      "quality_score": 0.98,
      "last_seen_at": "2026-06-21T00:59:55Z",
      "source": "ais_provider_primary"
    }
  ],
  "meta": {
    "count": 1,
    "bbox": "104.70,-3.05,104.90,-2.90"
  }
}
```

## 16.2 Get Latest Position by MMSI

```http
GET /api/v1/vessels/{mmsi}/latest
```

### Response

```json
{
  "success": true,
  "data": {
    "mmsi": "525123456",
    "name": "MV Musi Jaya",
    "lat": -2.9761,
    "lon": 104.7754,
    "sog": 12.4,
    "cog": 88.5,
    "heading": 90,
    "rot": null,
    "nav_status": "UNDER_WAY",
    "position_timestamp": "2026-06-21T00:59:55Z",
    "received_at": "2026-06-21T00:59:57Z",
    "age_seconds": 2,
    "quality_score": 0.98
  }
}
```

## 16.3 Vessel History

```http
GET /api/v1/vessels/{mmsi}/history
```

### Query Parameters

| Parameter | Type | Required | Deskripsi |
|---|---|---:|---|
| `from` | datetime | Yes | Waktu mulai UTC |
| `to` | datetime | Yes | Waktu akhir UTC |
| `interval` | string | No | `raw`, `1m`, `5m`, `15m`, `1h` |
| `simplify` | boolean | No | Simplify geometry untuk map |

### Example Request

```http
GET /api/v1/vessels/525123456/history?from=2026-06-21T00:00:00Z&to=2026-06-21T06:00:00Z&interval=1m
```

### Response

```json
{
  "success": true,
  "data": {
    "mmsi": "525123456",
    "name": "MV Musi Jaya",
    "from": "2026-06-21T00:00:00Z",
    "to": "2026-06-21T06:00:00Z",
    "interval": "1m",
    "positions": [
      {
        "timestamp": "2026-06-21T00:00:00Z",
        "lat": -2.9700,
        "lon": 104.7500,
        "sog": 10.2,
        "cog": 85.0,
        "heading": 86,
        "nav_status": "UNDER_WAY"
      },
      {
        "timestamp": "2026-06-21T00:01:00Z",
        "lat": -2.9704,
        "lon": 104.7512,
        "sog": 10.5,
        "cog": 86.0,
        "heading": 87,
        "nav_status": "UNDER_WAY"
      }
    ],
    "summary": {
      "point_count": 2,
      "distance_nm": 0.08,
      "avg_sog": 10.35,
      "max_sog": 10.5
    }
  }
}
```

---

# 17. Ingestion API

## 17.1 Ingest Canonical AIS Position

Endpoint ini digunakan oleh ingestion service internal setelah data provider dinormalisasi.

```http
POST /api/v1/ingestion/ais/positions
```

### Authorization

Role: `INTEGRATION` atau `ADMIN`

### Request

```json
{
  "source_id": "ais_provider_primary",
  "provider_message_id": "msg_abc_123",
  "mmsi": "525123456",
  "imo": "9876543",
  "name": "MV Musi Jaya",
  "callsign": "YBMC",
  "vessel_type": "Cargo",
  "flag": "ID",
  "lat": -2.9761,
  "lon": 104.7754,
  "sog": 12.4,
  "cog": 88.5,
  "heading": 90,
  "rot": null,
  "nav_status": "UNDER_WAY",
  "destination": "Palembang",
  "eta": "2026-06-21T13:45:00Z",
  "position_timestamp": "2026-06-21T00:59:55Z",
  "received_at": "2026-06-21T00:59:57Z",
  "raw_payload_ref": "s3://raw-ais/2026/06/21/msg_abc_123.json"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "ingestion_id": "ing_001",
    "mmsi": "525123456",
    "position_id": "pos_001",
    "deduplicated": false,
    "latest_position_updated": true,
    "quality_score": 0.98,
    "created_events": []
  }
}
```

## 17.2 Ingest Batch AIS Positions

```http
POST /api/v1/ingestion/ais/positions:batch
```

### Request

```json
{
  "source_id": "ais_provider_primary",
  "items": [
    {
      "provider_message_id": "msg_abc_123",
      "mmsi": "525123456",
      "lat": -2.9761,
      "lon": 104.7754,
      "sog": 12.4,
      "cog": 88.5,
      "heading": 90,
      "nav_status": "UNDER_WAY",
      "position_timestamp": "2026-06-21T00:59:55Z"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "accepted": 1,
    "rejected": 0,
    "duplicates": 0,
    "errors": []
  }
}
```

## 17.3 Ingest Raw AIS Payload

```http
POST /api/v1/ingestion/ais/raw
```

### Request

```json
{
  "source_id": "ais_provider_primary",
  "message_type": "provider_json",
  "received_at": "2026-06-21T00:59:57Z",
  "payload": {
    "raw": "provider-specific-payload"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "raw_message_id": "raw_001",
    "stored": true,
    "parse_status": "PENDING"
  }
}
```

---

# 18. Geofence API

## 18.1 List Geofences

```http
GET /api/v1/geofences
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `q` | string | Search nama geofence |
| `status` | string | `active`, `inactive` |
| `type` | string | `restricted_area`, `anchorage`, `port_area`, `custom` |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "gf_001",
      "name": "GF-01 Area Terbatas",
      "type": "restricted_area",
      "status": "active",
      "severity": "HIGH",
      "geometry_type": "Polygon",
      "created_at": "2026-06-20T01:00:00Z",
      "updated_at": "2026-06-21T01:00:00Z"
    }
  ]
}
```

## 18.2 Create Geofence

```http
POST /api/v1/geofences
```

### Request

```json
{
  "name": "GF-01 Area Terbatas",
  "description": "Area terbatas dekat alur pelabuhan",
  "type": "restricted_area",
  "status": "active",
  "severity": "HIGH",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [104.7500, -2.9800],
        [104.8200, -2.9800],
        [104.8200, -3.0200],
        [104.7500, -3.0200],
        [104.7500, -2.9800]
      ]
    ]
  },
  "rules": {
    "trigger_on_enter": true,
    "trigger_on_exit": true,
    "allowed_vessel_types": ["Patrol", "Pilot"],
    "min_duration_seconds": 0
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "gf_001",
    "name": "GF-01 Area Terbatas",
    "created": true,
    "created_at": "2026-06-21T01:10:00Z"
  }
}
```

## 18.3 Validate Geofence Geometry

```http
POST /api/v1/geofences/validate
```

### Request

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [104.7500, -2.9800],
        [104.8200, -2.9800],
        [104.8200, -3.0200],
        [104.7500, -3.0200],
        [104.7500, -2.9800]
      ]
    ]
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "valid": true,
    "area_sq_km": 34.52,
    "centroid": {
      "lat": -3.0000,
      "lon": 104.7850
    },
    "warnings": []
  }
}
```

## 18.4 Geofence Events

```http
GET /api/v1/geofences/{id}/events
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `from` | datetime | Waktu mulai |
| `to` | datetime | Waktu akhir |
| `event_type` | string | `ENTER`, `EXIT`, `DWELL` |
| `mmsi` | string | Filter kapal |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "gfe_001",
      "geofence_id": "gf_001",
      "geofence_name": "GF-01 Area Terbatas",
      "mmsi": "525123456",
      "vessel_name": "MV Musi Jaya",
      "event_type": "ENTER",
      "event_time": "2026-06-21T01:15:00Z",
      "lat": -2.9901,
      "lon": 104.7902,
      "severity": "HIGH"
    }
  ]
}
```

---

# 19. Alert API

## 19.1 List Alerts

```http
GET /api/v1/alerts
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `status` | string | `OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `SNOOZED` |
| `severity` | string | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `alert_type` | string | Jenis alert |
| `mmsi` | string | Filter kapal |
| `from` | datetime | Waktu mulai |
| `to` | datetime | Waktu akhir |

### Example Request

```http
GET /api/v1/alerts?status=OPEN&severity=HIGH&page=1&page_size=20
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "al_001",
      "alert_type": "GEOFENCE_ENTER",
      "severity": "HIGH",
      "status": "OPEN",
      "title": "Kapal memasuki area terbatas",
      "message": "MV Musi Jaya memasuki GF-01 Area Terbatas",
      "mmsi": "525123456",
      "vessel_name": "MV Musi Jaya",
      "geofence_id": "gf_001",
      "event_time": "2026-06-21T01:15:00Z",
      "created_at": "2026-06-21T01:15:01Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false
  }
}
```

## 19.2 Alert Detail

```http
GET /api/v1/alerts/{id}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "al_001",
    "alert_type": "GEOFENCE_ENTER",
    "severity": "HIGH",
    "status": "OPEN",
    "title": "Kapal memasuki area terbatas",
    "message": "MV Musi Jaya memasuki GF-01 Area Terbatas",
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya",
    "position": {
      "lat": -2.9901,
      "lon": 104.7902,
      "timestamp": "2026-06-21T01:15:00Z"
    },
    "related_resource": {
      "type": "geofence",
      "id": "gf_001",
      "name": "GF-01 Area Terbatas"
    },
    "timeline": [
      {
        "time": "2026-06-21T01:15:01Z",
        "action": "CREATED",
        "actor": "system"
      }
    ]
  }
}
```

## 19.3 Acknowledge Alert

```http
POST /api/v1/alerts/{id}/acknowledge
```

### Request

```json
{
  "note": "Operator sudah memeriksa pergerakan kapal."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "al_001",
    "status": "ACKNOWLEDGED",
    "acknowledged_by": "usr_001",
    "acknowledged_at": "2026-06-21T01:20:00Z"
  }
}
```

## 19.4 Resolve Alert

```http
POST /api/v1/alerts/{id}/resolve
```

### Request

```json
{
  "resolution_note": "Kapal sudah keluar dari area terbatas."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "al_001",
    "status": "RESOLVED",
    "resolved_by": "usr_001",
    "resolved_at": "2026-06-21T01:45:00Z"
  }
}
```

---

# 20. Alert Rule API

## 20.1 List Alert Rules

```http
GET /api/v1/alert-rules
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "rule_001",
      "name": "Restricted Area Entry",
      "rule_type": "GEOFENCE_ENTER",
      "enabled": true,
      "severity": "HIGH",
      "created_at": "2026-06-20T01:00:00Z"
    }
  ]
}
```

## 20.2 Create Alert Rule

```http
POST /api/v1/alert-rules
```

### Request

```json
{
  "name": "AIS Silence 15 Minutes",
  "rule_type": "AIS_SILENCE",
  "enabled": true,
  "severity": "MEDIUM",
  "condition": {
    "no_update_minutes": 15,
    "vessel_type": ["Cargo", "Tanker"]
  },
  "notification_channels": ["dashboard", "email"]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "rule_002",
    "created": true
  }
}
```

---

# 21. Playback API

## 21.1 Vessel Playback

```http
GET /api/v1/playback/vessels/{mmsi}
```

### Query Parameters

| Parameter | Type | Required | Deskripsi |
|---|---|---:|---|
| `from` | datetime | Yes | Waktu mulai |
| `to` | datetime | Yes | Waktu akhir |
| `speed` | string | No | `1x`, `2x`, `5x`, `10x` |
| `sample_rate` | string | No | `raw`, `10s`, `1m`, `5m` |

### Response

```json
{
  "success": true,
  "data": {
    "mmsi": "525123456",
    "name": "MV Musi Jaya",
    "from": "2026-06-21T00:00:00Z",
    "to": "2026-06-21T06:00:00Z",
    "track_geojson": {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [104.7500, -2.9700],
          [104.7754, -2.9761]
        ]
      },
      "properties": {
        "mmsi": "525123456",
        "name": "MV Musi Jaya"
      }
    },
    "frames": [
      {
        "t": "2026-06-21T00:00:00Z",
        "lat": -2.9700,
        "lon": 104.7500,
        "sog": 10.2,
        "cog": 85.0
      }
    ],
    "summary": {
      "duration_seconds": 21600,
      "distance_nm": 32.4,
      "avg_sog": 10.8,
      "max_sog": 14.2
    }
  }
}
```

## 21.2 Area Playback

```http
GET /api/v1/playback/area
```

### Query Parameters

| Parameter | Type | Required | Deskripsi |
|---|---|---:|---|
| `bbox` | string | Yes | Bounding box area |
| `from` | datetime | Yes | Waktu mulai |
| `to` | datetime | Yes | Waktu akhir |
| `vessel_type` | string | No | Filter tipe kapal |

### Response

```json
{
  "success": true,
  "data": {
    "bbox": "104.70,-3.05,104.90,-2.90",
    "from": "2026-06-21T00:00:00Z",
    "to": "2026-06-21T06:00:00Z",
    "vessels": [
      {
        "mmsi": "525123456",
        "name": "MV Musi Jaya",
        "frames": [
          {
            "t": "2026-06-21T00:00:00Z",
            "lat": -2.9700,
            "lon": 104.7500,
            "sog": 10.2,
            "cog": 85.0
          }
        ]
      }
    ]
  }
}
```

---

# 22. Analytics API

## 22.1 Analytics Summary

```http
GET /api/v1/analytics/summary
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `area_id` | string | Optional geofence/area |
| `from` | datetime | Waktu mulai |
| `to` | datetime | Waktu akhir |

### Response

```json
{
  "success": true,
  "data": {
    "active_vessels": 128,
    "in_port": 37,
    "alerts_today": 8,
    "avg_speed_kn": 11.6,
    "top_vessel_types": [
      {
        "vessel_type": "Cargo",
        "count": 54
      },
      {
        "vessel_type": "Tanker",
        "count": 22
      }
    ],
    "generated_at": "2026-06-21T01:00:00Z"
  }
}
```

## 22.2 Vessel Density

```http
GET /api/v1/analytics/vessel-density
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `bbox` | string | Area map |
| `from` | datetime | Waktu mulai |
| `to` | datetime | Waktu akhir |
| `grid_size_m` | integer | Ukuran grid meter |

### Response

```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [104.7754, -2.9761]
        },
        "properties": {
          "count": 24,
          "density_score": 0.82
        }
      }
    ]
  }
}
```

## 22.3 Idle Vessels

```http
GET /api/v1/analytics/idle-vessels
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `bbox` | string | Optional area |
| `min_idle_minutes` | integer | Default 30 |

### Response

```json
{
  "success": true,
  "data": [
    {
      "mmsi": "525333222",
      "name": "TB Bahari 02",
      "lat": -2.9850,
      "lon": 104.7600,
      "idle_minutes": 48,
      "last_sog": 0.2,
      "last_seen_at": "2026-06-21T00:59:00Z"
    }
  ]
}
```

---

# 23. Export API

## 23.1 Create Vessel History Export

```http
POST /api/v1/exports/vessel-history
```

### Request

```json
{
  "mmsi": "525123456",
  "from": "2026-06-21T00:00:00Z",
  "to": "2026-06-21T06:00:00Z",
  "format": "CSV",
  "fields": [
    "timestamp",
    "mmsi",
    "lat",
    "lon",
    "sog",
    "cog",
    "heading",
    "nav_status"
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "job_id": "exp_001",
    "status": "QUEUED",
    "created_at": "2026-06-21T01:30:00Z"
  }
}
```

## 23.2 Get Export Status

```http
GET /api/v1/exports/{job_id}
```

### Response

```json
{
  "success": true,
  "data": {
    "job_id": "exp_001",
    "status": "COMPLETED",
    "format": "CSV",
    "download_url": "/api/v1/exports/exp_001/download",
    "expires_at": "2026-06-22T01:30:00Z"
  }
}
```

---

# 24. User & Admin API

## 24.1 List Users

```http
GET /api/v1/users
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "usr_001",
      "name": "Operator Pelabuhan",
      "email": "operator@example.com",
      "role": "OPERATOR",
      "status": "active",
      "last_login_at": "2026-06-21T00:30:00Z"
    }
  ]
}
```

## 24.2 Create User

```http
POST /api/v1/users
```

### Request

```json
{
  "name": "Analis Operasional",
  "email": "analyst@example.com",
  "role": "ANALYST",
  "status": "active"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_002",
    "created": true
  }
}
```

## 24.3 Audit Logs

```http
GET /api/v1/audit-logs
```

### Query Parameters

| Parameter | Type | Deskripsi |
|---|---|---|
| `actor_id` | string | Filter user |
| `action` | string | Filter action |
| `resource_type` | string | Filter resource |
| `from` | datetime | Waktu mulai |
| `to` | datetime | Waktu akhir |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "aud_001",
      "actor_id": "usr_001",
      "actor_name": "Operator Pelabuhan",
      "action": "ALERT_ACKNOWLEDGE",
      "resource_type": "alert",
      "resource_id": "al_001",
      "ip_address": "10.10.10.10",
      "created_at": "2026-06-21T01:20:00Z"
    }
  ]
}
```

---

# 25. WebSocket Overview

Detail WebSocket akan dijabarkan pada dokumen `07_Realtime_WebSocket_Spec.md`. Ringkasan awal:

## 25.1 Endpoint

```text
wss://api.vesseltrack.example.com/ws/v1/realtime
```

## 25.2 Auth

Client mengirim token saat connect:

```json
{
  "type": "AUTH",
  "token": "jwt-access-token"
}
```

## 25.3 Subscribe Vessel Updates

```json
{
  "type": "SUBSCRIBE",
  "channel": "vessel.positions",
  "filters": {
    "bbox": "104.70,-3.05,104.90,-2.90",
    "vessel_type": ["Cargo", "Tanker"]
  }
}
```

## 25.4 Vessel Position Update Event

```json
{
  "type": "VESSEL_POSITION_UPDATE",
  "event_id": "evt_001",
  "timestamp": "2026-06-21T01:00:00Z",
  "data": {
    "mmsi": "525123456",
    "name": "MV Musi Jaya",
    "lat": -2.9761,
    "lon": 104.7754,
    "sog": 12.4,
    "cog": 88.5,
    "heading": 90,
    "nav_status": "UNDER_WAY",
    "last_seen_at": "2026-06-21T00:59:55Z"
  }
}
```

## 25.5 Alert Event

```json
{
  "type": "ALERT_CREATED",
  "event_id": "evt_002",
  "timestamp": "2026-06-21T01:15:01Z",
  "data": {
    "alert_id": "al_001",
    "severity": "HIGH",
    "alert_type": "GEOFENCE_ENTER",
    "title": "Kapal memasuki area terbatas",
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya"
  }
}
```

---

# 26. Rate Limiting

Rate limit awal:

| Client Type | Limit |
|---|---:|
| Dashboard user | 1.000 request / 15 menit |
| Integration API key | 10.000 request / 15 menit |
| Export API | 20 job / jam |
| Login API | 10 attempt / 15 menit |

Response jika rate limit terlampaui:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry later."
  }
}
```

---

# 27. Idempotency

Endpoint ingestion dan export mendukung idempotency.

Header:

```http
Idempotency-Key: 0b8d9c4d-1234-4e5f-9876-abcdef123456
```

Tujuan:

1. Menghindari duplicate ingestion.
2. Menghindari duplicate export job.
3. Aman saat retry dari client.

---

# 28. Filtering Berdasarkan Area Peta

Frontend map harus menggunakan `bbox` agar backend tidak mengirim semua kapal sekaligus.

Contoh:

```http
GET /api/v1/vessels/latest?bbox=104.70,-3.05,104.90,-2.90&updated_within_minutes=30
```

Backend harus:

1. Validasi bbox.
2. Batasi ukuran bbox maksimum.
3. Gunakan spatial index PostGIS.
4. Kembalikan kapal yang berada dalam viewport.
5. Mendukung clustering pada fase berikutnya.

---

# 29. Data Validation Rules

## 29.1 AIS Position Validation

| Field | Rule |
|---|---|
| `mmsi` | Required, numeric string 9 digit ideal |
| `lat` | Required, -90 sampai 90 |
| `lon` | Required, -180 sampai 180 |
| `sog` | 0 sampai 102.2 kn, nilai ekstrem diberi flag |
| `cog` | 0 sampai 360 |
| `heading` | 0 sampai 359 atau null |
| `position_timestamp` | Tidak boleh terlalu jauh di masa depan |

## 29.2 Time Range Validation

| Endpoint | Maksimum Rentang Default |
|---|---:|
| Vessel history raw | 24 jam |
| Vessel history sampled | 30 hari |
| Area playback | 6 jam untuk MVP |
| Analytics summary | 90 hari |

## 29.3 Geometry Validation

1. Polygon harus closed ring.
2. Polygon tidak boleh self-intersect.
3. Area maksimum harus dibatasi sesuai konfigurasi.
4. Coordinate order wajib `[lon, lat]`.

---

# 30. Security Requirements

1. Semua endpoint production wajib HTTPS.
2. JWT harus memiliki expiry pendek.
3. Refresh token harus dapat dicabut.
4. API key disimpan dalam bentuk hashed value.
5. Endpoint ingestion dibatasi IP allowlist untuk production.
6. Semua write operation dicatat ke audit log.
7. CORS hanya mengizinkan domain frontend resmi.
8. Error response tidak boleh membocorkan stack trace.
9. Export file harus memiliki signed URL dan expiry.
10. Request body size dibatasi.

---

# 31. Performance Requirements

| API | Target MVP |
|---|---:|
| `GET /vessels/latest` by bbox | p95 < 500 ms |
| `GET /vessels/{mmsi}/latest` | p95 < 200 ms |
| `GET /vessels/{mmsi}/history` 6 jam sampled | p95 < 2 s |
| `GET /alerts?status=OPEN` | p95 < 500 ms |
| `POST /ingestion/ais/positions` | p95 < 300 ms |
| WebSocket position delivery | < 3 detik dari ingestion |

---

# 32. Observability Requirements

Setiap endpoint harus mencatat:

1. `request_id`
2. method
3. path
4. status code
5. latency
6. user ID/API key ID
7. client IP
8. error code jika gagal

Metric utama:

1. API request per minute.
2. API error rate.
3. Latency p50/p95/p99.
4. Ingestion accepted/rejected count.
5. WebSocket connected clients.
6. Alert created/resolved count.
7. Database query latency.

---

# 33. OpenAPI/Swagger Requirement

Backend wajib menyediakan dokumentasi OpenAPI di:

```text
/api/docs
```

Dan JSON schema di:

```text
/api/v1/openapi.json
```

OpenAPI harus mencakup:

1. Endpoint.
2. Request schema.
3. Response schema.
4. Error response.
5. Auth scheme.
6. Example payload.
7. Required/optional fields.

---

# 34. API Testing Strategy

Testing minimal:

1. Unit test untuk service layer.
2. Integration test untuk endpoint utama.
3. Contract test berdasarkan OpenAPI.
4. Load test untuk `vessels/latest`.
5. Security test untuk auth dan role.
6. Validation test untuk geometry dan time range.
7. Ingestion duplicate test.
8. Regression test untuk alert flow.

Contoh acceptance test:

```gherkin
Given operator membuka dashboard map
When frontend memanggil GET /vessels/latest dengan bbox valid
Then API mengembalikan daftar kapal dalam area tersebut
And response time p95 kurang dari 500 ms
```

---

# 35. Backward Compatibility

Perubahan berikut dianggap backward-compatible:

1. Menambah field optional pada response.
2. Menambah endpoint baru.
3. Menambah enum baru jika frontend siap fallback.
4. Menambah filter optional.

Perubahan berikut membutuhkan versi baru:

1. Menghapus field response.
2. Mengubah tipe data field.
3. Mengubah struktur endpoint utama.
4. Mengubah behavior tanpa flag/versioning.

---

# 36. MVP API Prioritas Implementasi

## 36.1 Prioritas P0

Wajib untuk MVP pertama:

1. `POST /auth/login`
2. `GET /auth/me`
3. `GET /health`
4. `GET /system/status`
5. `GET /vessels`
6. `GET /vessels/{mmsi}`
7. `GET /vessels/latest`
8. `GET /vessels/{mmsi}/latest`
9. `GET /vessels/{mmsi}/history`
10. `POST /ingestion/ais/positions`
11. `POST /ingestion/ais/positions:batch`
12. `GET /geofences`
13. `POST /geofences`
14. `GET /alerts`
15. `POST /alerts/{id}/acknowledge`
16. WebSocket `vessel.positions`
17. WebSocket `alerts`

## 36.2 Prioritas P1

Setelah MVP map stabil:

1. `GET /playback/vessels/{mmsi}`
2. `GET /playback/area`
3. `POST /exports/vessel-history`
4. `GET /analytics/summary`
5. `GET /analytics/vessel-density`
6. `GET /analytics/idle-vessels`
7. `POST /alerts/{id}/resolve`
8. `GET /audit-logs`

## 36.3 Prioritas P2

Fase lanjutan:

1. Multi-provider source management.
2. Advanced analytics.
3. Public partner API.
4. Webhook outbound notification.
5. Clustering API.
6. Route deviation API.
7. Predictive ETA API.

---

# 37. Risiko API dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Endpoint latest position lambat | Map terasa berat | Bbox filter, PostGIS index, Redis cache |
| Payload history terlalu besar | Browser lambat | Sampling, pagination time-window, simplify geometry |
| Data provider berubah format | Ingestion rusak | Data source adapter + contract test |
| WebSocket overload | Dashboard delay | Channel filter, delta update, connection limit |
| Geofence polygon invalid | Alert salah | Geometry validation endpoint |
| Token bocor | Akses ilegal | Short-lived JWT, revoke token, audit log |
| Duplicate ingestion | Posisi ganda | Idempotency key + unique constraint |
| API tidak konsisten | Frontend lambat integrasi | OpenAPI wajib dan contract test |

---

# 38. Acceptance Criteria

Dokumen API dianggap siap jika:

1. Semua endpoint MVP P0 telah terdefinisi.
2. Request dan response utama memiliki contoh JSON.
3. Error model telah distandarkan.
4. Auth dan role requirement jelas.
5. Pagination, sorting, filter, bbox, dan time range terdefinisi.
6. Ingestion API mendukung canonical dan batch payload.
7. Geofence dan alert API mendukung flow operasional minimum.
8. Playback dan analytics API memiliki kontrak awal.
9. WebSocket sudah memiliki overview dan event dasar.
10. Dokumen dapat langsung dijadikan dasar implementasi OpenAPI/Swagger.

---

# 39. Open Questions

1. Provider AIS pertama yang akan digunakan apa?
2. Apakah sistem akan single tenant atau multi tenant sejak awal?
3. Apakah user login menggunakan email/password lokal atau SSO?
4. Apakah notifikasi WhatsApp resmi akan digunakan sejak MVP?
5. Berapa area monitoring pertama yang menjadi target MVP?
6. Berapa jumlah kapal aktif yang harus didukung pada MVP?
7. Apakah export wajib tersedia dalam CSV saja atau juga GeoJSON?
8. Apakah geofence akan dibuat manual di dashboard atau diimpor dari GeoJSON?
9. Apakah API akan dibuka untuk partner eksternal pada fase awal?
10. Apakah audit log wajib disimpan permanen atau mengikuti retention tertentu?

---

# 40. Lampiran A: Canonical Vessel Position DTO

```json
{
  "mmsi": "525123456",
  "imo": "9876543",
  "name": "MV Musi Jaya",
  "callsign": "YBMC",
  "vessel_type": "Cargo",
  "flag": "ID",
  "lat": -2.9761,
  "lon": 104.7754,
  "sog": 12.4,
  "cog": 88.5,
  "heading": 90,
  "rot": null,
  "nav_status": "UNDER_WAY",
  "destination": "Palembang",
  "eta": "2026-06-21T13:45:00Z",
  "position_timestamp": "2026-06-21T00:59:55Z",
  "received_at": "2026-06-21T00:59:57Z",
  "source_id": "ais_provider_primary",
  "quality_score": 0.98
}
```

---

# 41. Lampiran B: Enum Awal

## 41.1 Navigation Status

```text
UNDER_WAY
AT_ANCHOR
NOT_UNDER_COMMAND
RESTRICTED_MANEUVERABILITY
CONSTRAINED_BY_DRAUGHT
MOORED
AGROUND
ENGAGED_IN_FISHING
UNDER_WAY_SAILING
UNKNOWN
```

## 41.2 Alert Severity

```text
LOW
MEDIUM
HIGH
CRITICAL
```

## 41.3 Alert Status

```text
OPEN
ACKNOWLEDGED
RESOLVED
SNOOZED
CLOSED
```

## 41.4 Alert Type

```text
GEOFENCE_ENTER
GEOFENCE_EXIT
AIS_SILENCE
SPEED_VIOLATION
ROUTE_DEVIATION
POSITION_JUMP
IDLE_TOO_LONG
RESTRICTED_AREA_BREACH
SYSTEM_ERROR
```

## 41.5 Geofence Type

```text
PORT_AREA
ANCHORAGE
RESTRICTED_AREA
NAVIGATION_CHANNEL
CUSTOM
```

---

# 42. Catatan Implementasi

1. Untuk MVP, endpoint dapat dibangun menggunakan **FastAPI** atau **NestJS**.
2. Dokumentasi OpenAPI harus otomatis dihasilkan dari schema backend.
3. Gunakan DTO/schema validation ketat agar data AIS tidak menjadi kabut koordinat.
4. Gunakan Redis untuk cache latest position jika query PostGIS mulai berat.
5. Gunakan sampling untuk history agar peta playback tidak mengunyah browser seperti jangkar berkarat.
6. Pisahkan ingestion API dari public dashboard API jika volume data meningkat.
7. Endpoint geofence dan alert wajib diuji dengan data simulasi kapal.

---

**Akhir Dokumen**
