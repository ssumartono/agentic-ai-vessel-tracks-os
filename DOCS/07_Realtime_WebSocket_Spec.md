# 07_Realtime_WebSocket_Spec.md
# Realtime WebSocket Specification
# Real Time Vessel Tracking System

**Nama Sistem Contoh:** VesselTrack OS  
**Versi Dokumen:** v1.0  
**Tanggal:** 21 Juni 2026  
**Status:** Draft Awal  
**Diturnunkan dari:** `01_PRD.md`, `02_System_Architecture.md`, `03_Data_Source_Strategy.md`, `04_AIS_Data_Model.md`, `05_Database_ERD.md`, dan `06_API_Specification.md`  
**Pendekatan Pengembangan:** AIS API Provider → MVP Tracking → Geofence & Alert → Playback & Analytics → Hardening

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan spesifikasi **Realtime WebSocket API** untuk **Real Time Vessel Tracking System** atau **VesselTrack OS**.

WebSocket digunakan untuk mengirim update posisi kapal, status kapal, alert, geofence event, dan status sistem secara langsung ke dashboard tanpa perlu refresh manual. Untuk aplikasi tracking kapal, WebSocket adalah jalur nadi: kecil, cepat, terus berdetak, dan membawa perubahan posisi dari laut data ke layar operator.

REST API tetap digunakan untuk query historis, konfigurasi, geofence management, user management, dan reporting. WebSocket hanya digunakan untuk data yang berubah cepat dan membutuhkan tampilan real-time.

---

## 2. Tujuan Dokumen

Dokumen ini bertujuan untuk:

1. Menentukan kontrak WebSocket antara frontend dashboard dan backend realtime gateway.
2. Menstandarkan event name, channel, payload, dan message envelope.
3. Menentukan mekanisme subscribe, unsubscribe, heartbeat, reconnect, dan backpressure.
4. Menentukan filter real-time berbasis viewport map, bounding box, MMSI, geofence, dan severity alert.
5. Menjamin update peta dikirim sebagai delta, bukan full refresh.
6. Menjadi acuan implementasi frontend, backend, QA, dan observability.

---

## 3. Ruang Lingkup

### 3.1 Termasuk dalam MVP

1. WebSocket authentication.
2. Subscribe dan unsubscribe channel.
3. Real-time vessel position update.
4. Real-time vessel status update.
5. Real-time alert event.
6. Real-time geofence event.
7. Viewport/bounding box filtering.
8. Heartbeat ping/pong.
9. Reconnect strategy.
10. Basic error message.
11. Sequence number untuk ordering.
12. Rate limit dan throttling dasar.

### 3.2 Tidak Termasuk dalam MVP

1. Peer-to-peer communication antar client.
2. WebRTC.
3. Full event replay lewat WebSocket.
4. Binary protocol khusus.
5. Guaranteed delivery seperti message broker enterprise.
6. Offline sync kompleks.
7. Collision simulation real-time tingkat lanjut.

Fitur replay dan histori tetap dilakukan melalui REST API.

---

## 4. Prinsip Desain Realtime

1. **Delta Update**  
   Server hanya mengirim perubahan posisi/status, bukan seluruh dataset kapal.

2. **Viewport-Aware**  
   Dashboard hanya menerima kapal yang relevan dengan area peta aktif.

3. **Backpressure-Friendly**  
   Server dapat menurunkan frekuensi update jika client lambat atau terlalu banyak kapal dalam viewport.

4. **Stateless Subscription Intent**  
   Client dapat reconnect dan mengirim ulang subscription state.

5. **Event Envelope Konsisten**  
   Semua pesan memiliki struktur metadata yang sama.

6. **Idempotent Client Handling**  
   Client harus aman menerima event yang duplikat.

7. **Auth dan RBAC Tetap Berlaku**  
   Data yang dikirim mengikuti izin user.

8. **Observable by Design**  
   Semua koneksi, subscribe, error, dan disconnect dapat dimonitor.

---

## 5. WebSocket Endpoint

### 5.1 Development

```text
wss://dev.api.vesseltrack.local/ws/v1/realtime
```

### 5.2 Staging

```text
wss://staging.api.vesseltrack.id/ws/v1/realtime
```

### 5.3 Production

```text
wss://api.vesseltrack.id/ws/v1/realtime
```

---

## 6. Authentication

### 6.1 Metode Utama

Client mengirim JWT access token melalui query parameter atau header WebSocket handshake.

Rekomendasi MVP:

```text
wss://api.vesseltrack.id/ws/v1/realtime?token=<ACCESS_TOKEN>
```

Rekomendasi production:

```text
Authorization: Bearer <ACCESS_TOKEN>
```

Catatan: beberapa browser client lebih mudah menggunakan query parameter. Untuk production, token di query harus berumur pendek dan tidak dicatat mentah di log.

### 6.2 Validasi Token

Server wajib memvalidasi:

1. Token signature.
2. Expiration time.
3. User status aktif.
4. Organization/tenant scope.
5. Role dan permission.
6. Allowed area/geofence jika ada pembatasan area.

### 6.3 Permission Minimal

| Permission | Deskripsi |
|---|---|
| `realtime:connect` | Boleh membuka koneksi WebSocket |
| `realtime:vessel:read` | Boleh menerima update kapal |
| `realtime:alert:read` | Boleh menerima alert |
| `realtime:geofence:read` | Boleh menerima geofence event |
| `realtime:system:read` | Boleh menerima system status |

---

## 7. Koneksi Lifecycle

```text
Client membuka koneksi
        ↓
Server validasi token
        ↓
Server kirim CONNECTION_ACK
        ↓
Client subscribe channel
        ↓
Server kirim SUBSCRIBE_ACK
        ↓
Server mulai kirim event realtime
        ↓
Heartbeat ping/pong berjalan
        ↓
Client unsubscribe atau disconnect
```

---

## 8. Message Envelope

Semua pesan WebSocket menggunakan JSON envelope berikut:

```json
{
  "type": "VESSEL_POSITION_UPDATE",
  "event_id": "evt_01JZ8R4A2KB0S6XW9A9N0S1F3P",
  "correlation_id": "corr_01JZ8R4A2K8R4F5PZ1W2T9A0Q2",
  "sequence": 102934,
  "timestamp": "2026-06-21T01:15:22.512Z",
  "channel": "vessels.positions",
  "tenant_id": "tenant_default",
  "payload": {},
  "meta": {
    "source": "ais_provider",
    "schema_version": "1.0"
  }
}
```

### 8.1 Field Envelope

| Field | Tipe | Wajib | Deskripsi |
|---|---:|---:|---|
| `type` | string | Ya | Jenis event |
| `event_id` | string | Ya | ID unik event |
| `correlation_id` | string | Tidak | ID korelasi antar service |
| `sequence` | integer | Ya | Nomor urut per connection/channel |
| `timestamp` | ISO datetime | Ya | Waktu event dikirim server |
| `channel` | string | Ya | Channel asal event |
| `tenant_id` | string | Ya | Tenant/organization scope |
| `payload` | object | Ya | Isi event |
| `meta` | object | Tidak | Metadata tambahan |

---

## 9. Client Command Envelope

Pesan dari client ke server menggunakan format:

```json
{
  "action": "SUBSCRIBE",
  "request_id": "req_01JZ8R55SK4ZBX1WAZV8QFSXT5",
  "channel": "vessels.positions",
  "params": {},
  "timestamp": "2026-06-21T01:15:25.000Z"
}
```

### 9.1 Field Client Command

| Field | Tipe | Wajib | Deskripsi |
|---|---:|---:|---|
| `action` | string | Ya | `SUBSCRIBE`, `UNSUBSCRIBE`, `UPDATE_SUBSCRIPTION`, `PING`, `ACK` |
| `request_id` | string | Ya | ID unik dari client |
| `channel` | string | Tidak | Channel yang dituju |
| `params` | object | Tidak | Parameter filter |
| `timestamp` | ISO datetime | Tidak | Waktu pesan dari client |

---

## 10. Channel List

| Channel | Deskripsi | MVP |
|---|---|---:|
| `vessels.positions` | Update posisi kapal real-time | Ya |
| `vessels.status` | Update status kapal | Ya |
| `alerts.events` | Alert operasional | Ya |
| `geofences.events` | Event masuk/keluar geofence | Ya |
| `system.status` | Status koneksi/data source | Ya |
| `analytics.live` | Statistik live ringkas | Lanjutan |
| `operators.activity` | Aktivitas operator | Lanjutan |

---

## 11. Event Type List

| Event Type | Channel | Deskripsi |
|---|---|---|
| `CONNECTION_ACK` | system | Koneksi diterima |
| `CONNECTION_REJECTED` | system | Koneksi ditolak |
| `SUBSCRIBE_ACK` | system | Subscribe berhasil |
| `UNSUBSCRIBE_ACK` | system | Unsubscribe berhasil |
| `SUBSCRIPTION_UPDATED` | system | Filter subscription diperbarui |
| `ERROR` | system | Error umum |
| `PONG` | system | Balasan heartbeat |
| `VESSEL_POSITION_UPDATE` | vessels.positions | Posisi kapal berubah |
| `VESSEL_POSITION_BATCH` | vessels.positions | Batch posisi kapal |
| `VESSEL_STATUS_UPDATE` | vessels.status | Status kapal berubah |
| `VESSEL_OFFLINE` | vessels.status | Kapal dianggap tidak update |
| `ALERT_CREATED` | alerts.events | Alert baru |
| `ALERT_UPDATED` | alerts.events | Alert berubah status |
| `ALERT_RESOLVED` | alerts.events | Alert selesai |
| `GEOFENCE_ENTERED` | geofences.events | Kapal masuk geofence |
| `GEOFENCE_EXITED` | geofences.events | Kapal keluar geofence |
| `DATA_SOURCE_STATUS` | system.status | Status sumber data |

---

## 12. Connection ACK

### 12.1 Server Response

```json
{
  "type": "CONNECTION_ACK",
  "event_id": "evt_conn_001",
  "sequence": 1,
  "timestamp": "2026-06-21T01:15:22.512Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "connection_id": "ws_01JZ8R4A2K9K9RB7D2J6E9R9V0",
    "user_id": "usr_001",
    "role": "operator",
    "heartbeat_interval_seconds": 30,
    "max_subscriptions": 10,
    "server_time": "2026-06-21T01:15:22.512Z"
  },
  "meta": {
    "schema_version": "1.0"
  }
}
```

---

## 13. Subscribe Command

### 13.1 Subscribe Vessel Position by Bounding Box

```json
{
  "action": "SUBSCRIBE",
  "request_id": "req_sub_001",
  "channel": "vessels.positions",
  "params": {
    "bbox": {
      "min_lon": 104.6800,
      "min_lat": -3.0500,
      "max_lon": 104.9200,
      "max_lat": -2.8800
    },
    "update_mode": "delta",
    "min_interval_ms": 1000,
    "include": [
      "position",
      "navigation",
      "quality"
    ]
  },
  "timestamp": "2026-06-21T01:15:25.000Z"
}
```

### 13.2 Subscribe Specific Vessel by MMSI

```json
{
  "action": "SUBSCRIBE",
  "request_id": "req_sub_002",
  "channel": "vessels.positions",
  "params": {
    "mmsi": [
      "525123456",
      "525987654"
    ],
    "update_mode": "delta",
    "min_interval_ms": 500
  }
}
```

### 13.3 Subscribe Alerts

```json
{
  "action": "SUBSCRIBE",
  "request_id": "req_sub_003",
  "channel": "alerts.events",
  "params": {
    "severity": [
      "critical",
      "high",
      "medium"
    ],
    "status": [
      "open",
      "acknowledged"
    ],
    "area_ids": [
      "area_musi_river",
      "area_port_01"
    ]
  }
}
```

### 13.4 Subscribe Geofence Events

```json
{
  "action": "SUBSCRIBE",
  "request_id": "req_sub_004",
  "channel": "geofences.events",
  "params": {
    "geofence_ids": [
      "gf_001",
      "gf_002"
    ],
    "event_types": [
      "enter",
      "exit"
    ]
  }
}
```

---

## 14. Subscribe ACK

```json
{
  "type": "SUBSCRIBE_ACK",
  "event_id": "evt_sub_ack_001",
  "correlation_id": "req_sub_001",
  "sequence": 2,
  "timestamp": "2026-06-21T01:15:25.030Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "subscription_id": "sub_01JZ8R9CXJP64CQGE0H5MVQ8RK",
    "channel": "vessels.positions",
    "status": "active",
    "effective_params": {
      "bbox": {
        "min_lon": 104.68,
        "min_lat": -3.05,
        "max_lon": 104.92,
        "max_lat": -2.88
      },
      "update_mode": "delta",
      "min_interval_ms": 1000
    }
  },
  "meta": {
    "schema_version": "1.0"
  }
}
```

---

## 15. Update Subscription

Saat user menggeser atau zoom peta, frontend tidak membuka koneksi baru. Frontend cukup mengirim `UPDATE_SUBSCRIPTION`.

```json
{
  "action": "UPDATE_SUBSCRIPTION",
  "request_id": "req_update_sub_001",
  "channel": "vessels.positions",
  "params": {
    "subscription_id": "sub_01JZ8R9CXJP64CQGE0H5MVQ8RK",
    "bbox": {
      "min_lon": 104.7000,
      "min_lat": -3.0200,
      "max_lon": 104.9800,
      "max_lat": -2.8500
    },
    "zoom_level": 12
  }
}
```

Server response:

```json
{
  "type": "SUBSCRIPTION_UPDATED",
  "event_id": "evt_sub_updated_001",
  "correlation_id": "req_update_sub_001",
  "sequence": 15,
  "timestamp": "2026-06-21T01:16:10.010Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "subscription_id": "sub_01JZ8R9CXJP64CQGE0H5MVQ8RK",
    "status": "active"
  }
}
```

---

## 16. Unsubscribe Command

```json
{
  "action": "UNSUBSCRIBE",
  "request_id": "req_unsub_001",
  "channel": "vessels.positions",
  "params": {
    "subscription_id": "sub_01JZ8R9CXJP64CQGE0H5MVQ8RK"
  }
}
```

Server response:

```json
{
  "type": "UNSUBSCRIBE_ACK",
  "event_id": "evt_unsub_ack_001",
  "correlation_id": "req_unsub_001",
  "sequence": 20,
  "timestamp": "2026-06-21T01:17:00.000Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "subscription_id": "sub_01JZ8R9CXJP64CQGE0H5MVQ8RK",
    "status": "inactive"
  }
}
```

---

## 17. Vessel Position Update Event

### 17.1 Single Update

```json
{
  "type": "VESSEL_POSITION_UPDATE",
  "event_id": "evt_pos_01JZ8RDR9FQ4ZGX8VFVCRXMZ5H",
  "correlation_id": "corr_ingest_001",
  "sequence": 102934,
  "timestamp": "2026-06-21T01:18:22.512Z",
  "channel": "vessels.positions",
  "tenant_id": "tenant_default",
  "payload": {
    "mmsi": "525123456",
    "imo": "9876543",
    "vessel_name": "MV Musi Jaya",
    "vessel_type": "cargo",
    "position": {
      "lat": -2.9761,
      "lon": 104.7754,
      "geom_type": "Point",
      "srid": 4326
    },
    "navigation": {
      "sog": 12.4,
      "cog": 88.5,
      "heading": 90,
      "rot": null,
      "nav_status": "under_way"
    },
    "time": {
      "ais_timestamp": "2026-06-21T01:18:20.000Z",
      "received_at": "2026-06-21T01:18:21.700Z",
      "processed_at": "2026-06-21T01:18:22.100Z"
    },
    "quality": {
      "quality_score": 95,
      "is_valid": true,
      "is_duplicate": false,
      "is_position_jump": false,
      "source_latency_ms": 1700
    },
    "source": {
      "provider": "ais_api_provider",
      "source_type": "terrestrial_satellite_hybrid"
    }
  },
  "meta": {
    "schema_version": "1.0"
  }
}
```

### 17.2 Field Payload Position

| Field | Tipe | Deskripsi |
|---|---:|---|
| `mmsi` | string | Maritime Mobile Service Identity |
| `imo` | string/null | Nomor IMO jika tersedia |
| `vessel_name` | string/null | Nama kapal |
| `vessel_type` | string/null | Jenis kapal |
| `position.lat` | number | Latitude WGS84 |
| `position.lon` | number | Longitude WGS84 |
| `navigation.sog` | number/null | Speed over ground dalam knot |
| `navigation.cog` | number/null | Course over ground dalam derajat |
| `navigation.heading` | number/null | Heading dalam derajat |
| `navigation.nav_status` | string/null | Status navigasi |
| `quality.quality_score` | integer | Skor kualitas 0-100 |
| `quality.source_latency_ms` | integer/null | Latency data source |

---

## 18. Vessel Position Batch Event

Untuk viewport yang memuat banyak kapal, server dapat mengirim batch agar lebih efisien.

```json
{
  "type": "VESSEL_POSITION_BATCH",
  "event_id": "evt_batch_001",
  "sequence": 102950,
  "timestamp": "2026-06-21T01:18:30.000Z",
  "channel": "vessels.positions",
  "tenant_id": "tenant_default",
  "payload": {
    "count": 2,
    "items": [
      {
        "mmsi": "525123456",
        "vessel_name": "MV Musi Jaya",
        "lat": -2.9761,
        "lon": 104.7754,
        "sog": 12.4,
        "cog": 88.5,
        "heading": 90,
        "nav_status": "under_way",
        "ais_timestamp": "2026-06-21T01:18:20.000Z",
        "quality_score": 95
      },
      {
        "mmsi": "525987654",
        "vessel_name": "MV Samudra Raya",
        "lat": -2.9902,
        "lon": 104.8012,
        "sog": 8.1,
        "cog": 74.2,
        "heading": 76,
        "nav_status": "under_way",
        "ais_timestamp": "2026-06-21T01:18:21.000Z",
        "quality_score": 92
      }
    ]
  },
  "meta": {
    "schema_version": "1.0",
    "batch_window_ms": 1000
  }
}
```

---

## 19. Vessel Status Update Event

```json
{
  "type": "VESSEL_STATUS_UPDATE",
  "event_id": "evt_status_001",
  "sequence": 103001,
  "timestamp": "2026-06-21T01:20:00.000Z",
  "channel": "vessels.status",
  "tenant_id": "tenant_default",
  "payload": {
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya",
    "previous_status": "idle",
    "current_status": "moving",
    "reason": "sog_above_threshold",
    "sog": 3.2,
    "threshold": 1.0,
    "last_seen_at": "2026-06-21T01:19:59.000Z"
  }
}
```

### 19.1 Status Internal

| Status | Deskripsi |
|---|---|
| `moving` | Kapal bergerak |
| `idle` | Kapal lambat/diam sementara |
| `anchored` | Kapal labuh jangkar |
| `moored` | Kapal sandar |
| `offline` | Tidak ada update melebihi ambang batas |
| `unknown` | Status belum dapat ditentukan |
| `alert` | Kapal sedang terkait alert aktif |

---

## 20. Vessel Offline Event

```json
{
  "type": "VESSEL_OFFLINE",
  "event_id": "evt_offline_001",
  "sequence": 103020,
  "timestamp": "2026-06-21T01:25:00.000Z",
  "channel": "vessels.status",
  "tenant_id": "tenant_default",
  "payload": {
    "mmsi": "525333222",
    "vessel_name": "TB Bahari 02",
    "last_seen_at": "2026-06-21T01:09:30.000Z",
    "offline_after_minutes": 15,
    "reason": "ais_silence"
  }
}
```

---

## 21. Alert Event

### 21.1 Alert Created

```json
{
  "type": "ALERT_CREATED",
  "event_id": "evt_alert_001",
  "sequence": 103100,
  "timestamp": "2026-06-21T01:26:11.000Z",
  "channel": "alerts.events",
  "tenant_id": "tenant_default",
  "payload": {
    "alert_id": "alrt_01JZ8SXE89J7Y5YF3EYHF81V3M",
    "alert_type": "geofence_breach",
    "severity": "high",
    "status": "open",
    "title": "Kapal memasuki area terbatas",
    "message": "MV Musi Jaya memasuki GF-01 Area Terbatas.",
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya",
    "geofence_id": "gf_001",
    "geofence_name": "GF-01 Area Terbatas",
    "position": {
      "lat": -2.9761,
      "lon": 104.7754
    },
    "created_at": "2026-06-21T01:26:10.800Z"
  }
}
```

### 21.2 Alert Updated

```json
{
  "type": "ALERT_UPDATED",
  "event_id": "evt_alert_updated_001",
  "sequence": 103130,
  "timestamp": "2026-06-21T01:28:00.000Z",
  "channel": "alerts.events",
  "tenant_id": "tenant_default",
  "payload": {
    "alert_id": "alrt_01JZ8SXE89J7Y5YF3EYHF81V3M",
    "previous_status": "open",
    "current_status": "acknowledged",
    "acknowledged_by": "usr_001",
    "acknowledged_at": "2026-06-21T01:27:59.000Z"
  }
}
```

### 21.3 Alert Resolved

```json
{
  "type": "ALERT_RESOLVED",
  "event_id": "evt_alert_resolved_001",
  "sequence": 103180,
  "timestamp": "2026-06-21T01:35:00.000Z",
  "channel": "alerts.events",
  "tenant_id": "tenant_default",
  "payload": {
    "alert_id": "alrt_01JZ8SXE89J7Y5YF3EYHF81V3M",
    "previous_status": "acknowledged",
    "current_status": "resolved",
    "resolved_by": "usr_001",
    "resolved_at": "2026-06-21T01:34:58.000Z",
    "resolution_note": "Kapal telah keluar dari area terbatas."
  }
}
```

---

## 22. Geofence Event

### 22.1 Geofence Entered

```json
{
  "type": "GEOFENCE_ENTERED",
  "event_id": "evt_gf_enter_001",
  "sequence": 103090,
  "timestamp": "2026-06-21T01:26:10.000Z",
  "channel": "geofences.events",
  "tenant_id": "tenant_default",
  "payload": {
    "geofence_event_id": "gfe_01JZ8SWZ3S2P8GWX4H4Z6NTPYX",
    "geofence_id": "gf_001",
    "geofence_name": "GF-01 Area Terbatas",
    "event_type": "enter",
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya",
    "position": {
      "lat": -2.9761,
      "lon": 104.7754
    },
    "detected_at": "2026-06-21T01:26:09.700Z",
    "rule_triggered": true,
    "alert_id": "alrt_01JZ8SXE89J7Y5YF3EYHF81V3M"
  }
}
```

### 22.2 Geofence Exited

```json
{
  "type": "GEOFENCE_EXITED",
  "event_id": "evt_gf_exit_001",
  "sequence": 103500,
  "timestamp": "2026-06-21T01:42:00.000Z",
  "channel": "geofences.events",
  "tenant_id": "tenant_default",
  "payload": {
    "geofence_event_id": "gfe_01JZ8TZXVAW9W2V9MDRMSS39HR",
    "geofence_id": "gf_001",
    "geofence_name": "GF-01 Area Terbatas",
    "event_type": "exit",
    "mmsi": "525123456",
    "vessel_name": "MV Musi Jaya",
    "position": {
      "lat": -2.9812,
      "lon": 104.7902
    },
    "detected_at": "2026-06-21T01:41:59.400Z",
    "duration_inside_seconds": 954,
    "related_alert_id": "alrt_01JZ8SXE89J7Y5YF3EYHF81V3M"
  }
}
```

---

## 23. System Status Event

```json
{
  "type": "DATA_SOURCE_STATUS",
  "event_id": "evt_ds_001",
  "sequence": 104000,
  "timestamp": "2026-06-21T01:45:00.000Z",
  "channel": "system.status",
  "tenant_id": "tenant_default",
  "payload": {
    "source_id": "ais_provider_primary",
    "source_name": "Primary AIS Provider",
    "status": "healthy",
    "last_success_at": "2026-06-21T01:44:58.000Z",
    "latency_ms_p95": 2200,
    "messages_per_minute": 1830,
    "error_rate_percent": 0.1
  }
}
```

---

## 24. Heartbeat

### 24.1 Client Ping

```json
{
  "action": "PING",
  "request_id": "req_ping_001",
  "timestamp": "2026-06-21T01:30:00.000Z"
}
```

### 24.2 Server Pong

```json
{
  "type": "PONG",
  "event_id": "evt_pong_001",
  "correlation_id": "req_ping_001",
  "sequence": 1200,
  "timestamp": "2026-06-21T01:30:00.020Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "server_time": "2026-06-21T01:30:00.020Z"
  }
}
```

### 24.3 Heartbeat Rule

| Parameter | Nilai MVP |
|---|---:|
| Client ping interval | 30 detik |
| Server timeout | 90 detik |
| Max missed heartbeat | 3 kali |
| Action after timeout | Disconnect |

---

## 25. Error Handling

### 25.1 Error Envelope

```json
{
  "type": "ERROR",
  "event_id": "evt_error_001",
  "correlation_id": "req_sub_009",
  "sequence": 44,
  "timestamp": "2026-06-21T01:31:00.000Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "code": "INVALID_BBOX",
    "message": "Bounding box tidak valid.",
    "details": {
      "field": "params.bbox",
      "reason": "min_lon must be less than max_lon"
    },
    "retryable": false
  }
}
```

### 25.2 Error Code

| Code | Deskripsi | Retryable |
|---|---|---:|
| `AUTH_REQUIRED` | Token tidak tersedia | Tidak |
| `AUTH_INVALID` | Token tidak valid | Tidak |
| `AUTH_EXPIRED` | Token kedaluwarsa | Ya, setelah refresh token |
| `FORBIDDEN_CHANNEL` | Tidak punya akses channel | Tidak |
| `INVALID_CHANNEL` | Channel tidak dikenal | Tidak |
| `INVALID_BBOX` | Bounding box tidak valid | Tidak |
| `SUBSCRIPTION_LIMIT_EXCEEDED` | Terlalu banyak subscription | Tidak |
| `RATE_LIMITED` | Terlalu banyak command | Ya |
| `SERVER_BUSY` | Server sedang overload | Ya |
| `INTERNAL_ERROR` | Error internal server | Ya |

---

## 26. Reconnect Strategy

Frontend wajib menerapkan reconnect dengan exponential backoff.

### 26.1 Rekomendasi Backoff

| Attempt | Delay |
|---:|---:|
| 1 | 1 detik |
| 2 | 2 detik |
| 3 | 5 detik |
| 4 | 10 detik |
| 5+ | 30 detik |

Tambahkan jitter ±20% agar banyak client tidak reconnect serentak.

### 26.2 Reconnect Flow

```text
Disconnect terdeteksi
        ↓
Client tampilkan status Reconnecting
        ↓
Client refresh token jika perlu
        ↓
Client buka koneksi baru
        ↓
Server kirim CONNECTION_ACK
        ↓
Client kirim ulang subscription terakhir
        ↓
Client panggil REST API latest positions untuk resync snapshot
        ↓
Realtime delta dilanjutkan
```

### 26.3 Snapshot Resync

Setelah reconnect lebih dari 10 detik, client harus mengambil snapshot terbaru via REST:

```text
GET /api/v1/vessels/latest?bbox=...
```

Lalu WebSocket digunakan lagi untuk delta update.

---

## 27. Ordering, Sequence, dan Idempotency

### 27.1 Sequence

Server mengirim field `sequence` monotonik per koneksi/channel.

Client harus:

1. Menyimpan sequence terakhir per channel.
2. Mengabaikan event dengan sequence lebih kecil dari sequence terakhir jika event tidak relevan.
3. Meminta snapshot REST jika mendeteksi gap sequence besar.

### 27.2 Idempotency

Client harus menganggap event dapat berulang.

Dedup client dapat menggunakan:

```text
event_id
```

atau kombinasi:

```text
mmsi + ais_timestamp + lat + lon
```

---

## 28. Filtering Strategy

### 28.1 Bounding Box Filter

Digunakan untuk map viewport.

```json
{
  "bbox": {
    "min_lon": 104.68,
    "min_lat": -3.05,
    "max_lon": 104.92,
    "max_lat": -2.88
  }
}
```

### 28.2 MMSI Filter

Digunakan untuk tracking kapal tertentu.

```json
{
  "mmsi": ["525123456"]
}
```

### 28.3 Vessel Type Filter

```json
{
  "vessel_type": ["cargo", "tanker", "passenger"]
}
```

### 28.4 Minimum Speed Filter

```json
{
  "sog_min": 1.0
}
```

### 28.5 Alert Severity Filter

```json
{
  "severity": ["critical", "high"]
}
```

---

## 29. Throttling dan Update Frequency

### 29.1 Default MVP

| Channel | Default Frequency | Catatan |
|---|---:|---|
| `vessels.positions` | 1 detik | Dapat batch |
| `vessels.status` | event-driven | Saat status berubah |
| `alerts.events` | event-driven | Saat alert berubah |
| `geofences.events` | event-driven | Saat enter/exit |
| `system.status` | 30 detik | Health summary |

### 29.2 Min Interval

Client dapat meminta `min_interval_ms`, tetapi server berhak menyesuaikan.

Nilai minimum MVP:

```text
500 ms
```

Nilai normal operasi:

```text
1000 - 5000 ms
```

---

## 30. Backpressure Handling

Server dapat mengirim pesan berikut jika client terlalu lambat:

```json
{
  "type": "ERROR",
  "event_id": "evt_backpressure_001",
  "sequence": 2040,
  "timestamp": "2026-06-21T01:40:00.000Z",
  "channel": "system",
  "tenant_id": "tenant_default",
  "payload": {
    "code": "SERVER_BUSY",
    "message": "Update frequency diturunkan sementara karena beban tinggi.",
    "details": {
      "new_min_interval_ms": 3000
    },
    "retryable": true
  }
}
```

Strategi backpressure:

1. Batch update.
2. Drop intermediate position, kirim latest only.
3. Naikkan `min_interval_ms`.
4. Batasi jumlah vessel dalam viewport.
5. Disconnect client yang tidak membaca buffer.

---

## 31. Client State Management

Frontend disarankan menyimpan state berikut:

```text
connection_status
connection_id
active_subscriptions
last_sequence_by_channel
last_event_id_cache
latest_vessel_positions_by_mmsi
active_alerts_by_id
geofence_events_by_id
last_snapshot_sync_at
```

### 31.1 Marker Update Logic

```text
Jika event baru diterima:
  cek event_id duplikat
  cek mmsi
  cek timestamp lebih baru dari posisi terakhir
  update marker lat/lon
  update heading/cog/sog
  update status warna marker
  tambahkan route trail pendek jika tracking aktif
```

---

## 32. Frontend UI Behavior

### 32.1 Connection Status Chip

| Status | Warna | Kondisi |
|---|---|---|
| `Realtime` | Hijau | WebSocket connected dan heartbeat sehat |
| `Connecting` | Kuning | Sedang membuka koneksi |
| `Reconnecting` | Oranye | Koneksi putus, mencoba ulang |
| `Offline` | Merah | Koneksi gagal |
| `Degraded` | Ungu/abu | Data source lambat atau server throttling |

### 32.2 Map Marker Behavior

| Kondisi | Tampilan |
|---|---|
| Moving | Marker biru/hijau dengan heading arrow |
| Idle | Marker kuning |
| Alert | Marker merah berdenyut |
| Offline | Marker abu-abu |
| Selected | Marker dengan ring highlight |

### 32.3 Alert Feed Behavior

1. Alert baru muncul di atas.
2. Critical/high dapat memicu toast notification.
3. Operator dapat klik alert untuk zoom ke kapal/geofence.
4. Status alert berubah real-time jika di-acknowledge atau resolved.

---

## 33. Security Requirement

1. Semua koneksi wajib menggunakan `wss://`.
2. Token wajib divalidasi saat handshake.
3. Token expired harus memutus koneksi atau meminta reconnect setelah refresh.
4. Channel harus dicek terhadap permission user.
5. Area restriction harus diterapkan di server, bukan hanya frontend.
6. Rate limit command per connection.
7. Jangan log token mentah.
8. Jangan kirim data kapal di luar scope tenant/user.
9. Audit event untuk connect, disconnect, subscribe channel sensitif, dan error permission.

---

## 34. Rate Limit

### 34.1 Command Rate Limit

| Command | Limit MVP |
|---|---:|
| `SUBSCRIBE` | 10 per menit |
| `UNSUBSCRIBE` | 20 per menit |
| `UPDATE_SUBSCRIPTION` | 30 per menit |
| `PING` | 4 per menit |

### 34.2 Connection Limit

| Level | Limit MVP |
|---|---:|
| Per user | 5 koneksi aktif |
| Per tenant | 100 koneksi aktif |
| Subscription per connection | 10 subscription |
| MMSI tracked per subscription | 100 MMSI |

---

## 35. Observability

### 35.1 Metrics

| Metric | Deskripsi |
|---|---|
| `websocket_connections_active` | Jumlah koneksi aktif |
| `websocket_connections_total` | Total koneksi masuk |
| `websocket_connection_rejected_total` | Koneksi ditolak |
| `websocket_messages_sent_total` | Pesan dikirim |
| `websocket_messages_received_total` | Pesan diterima |
| `websocket_errors_total` | Error WebSocket |
| `websocket_subscription_active` | Subscription aktif |
| `websocket_event_latency_ms` | Latency event dari processed sampai sent |
| `websocket_buffer_size` | Ukuran buffer per connection |
| `websocket_disconnect_total` | Disconnect total |

### 35.2 Log Event

Log minimal:

1. Connection opened.
2. Connection closed.
3. Authentication failed.
4. Subscribe/unsubscribe.
5. Invalid command.
6. Rate limited.
7. Backpressure triggered.
8. Server error.

Contoh structured log:

```json
{
  "level": "info",
  "message": "websocket_subscription_created",
  "connection_id": "ws_01JZ8R4A2K9K9RB7D2J6E9R9V0",
  "user_id": "usr_001",
  "tenant_id": "tenant_default",
  "channel": "vessels.positions",
  "subscription_id": "sub_01JZ8R9CXJP64CQGE0H5MVQ8RK",
  "timestamp": "2026-06-21T01:15:25.030Z"
}
```

---

## 36. Deployment Architecture

### 36.1 MVP Deployment

```text
Frontend Dashboard
        ↓ WebSocket
Backend API + WebSocket Gateway
        ↓
Redis Pub/Sub / Redis Streams
        ↓
Ingestion Service
        ↓
PostgreSQL + PostGIS + TimescaleDB
```

### 36.2 Production Deployment

```text
Frontend Dashboard
        ↓
Load Balancer / API Gateway
        ↓
WebSocket Gateway Cluster
        ↓
Kafka / Redpanda / Redis Streams
        ↓
Realtime Processor / Alert Engine / Geofence Engine
        ↓
PostGIS + TimescaleDB + Redis Cache
```

### 36.3 Sticky Session

Untuk MVP, sticky session dapat digunakan jika WebSocket gateway menyimpan subscription in-memory.

Untuk production, subscription state sebaiknya disimpan di Redis agar gateway dapat diskalakan horizontal.

---

## 37. Pub/Sub Internal Mapping

| Internal Topic | WebSocket Channel |
|---|---|
| `vessel.position.cleaned` | `vessels.positions` |
| `vessel.status.changed` | `vessels.status` |
| `vessel.alert.created` | `alerts.events` |
| `vessel.alert.updated` | `alerts.events` |
| `vessel.geofence.event` | `geofences.events` |
| `system.datasource.status` | `system.status` |

---

## 38. Data Contract Compatibility

WebSocket payload harus kompatibel dengan:

1. `04_AIS_Data_Model.md` untuk canonical vessel position.
2. `05_Database_ERD.md` untuk entity dan field database.
3. `06_API_Specification.md` untuk DTO dan REST resource.

Jika field berubah, wajib menaikkan `schema_version`.

---

## 39. Versioning

### 39.1 Endpoint Version

```text
/ws/v1/realtime
```

### 39.2 Schema Version

```json
{
  "meta": {
    "schema_version": "1.0"
  }
}
```

### 39.3 Compatibility Rule

1. Penambahan field optional diperbolehkan dalam versi yang sama.
2. Penghapusan field wajib menaikkan major version.
3. Perubahan makna field wajib menaikkan major version.
4. Client harus mengabaikan field yang tidak dikenal.

---

## 40. Testing Strategy

### 40.1 Unit Test

1. Validasi message envelope.
2. Validasi command parser.
3. Validasi permission channel.
4. Validasi bbox filter.
5. Validasi sequence generator.
6. Validasi payload serializer.

### 40.2 Integration Test

1. Connect dengan token valid.
2. Connect dengan token invalid.
3. Subscribe channel valid.
4. Subscribe channel tanpa permission.
5. Update subscription bbox.
6. Terima vessel position update.
7. Terima alert event.
8. Terima geofence event.
9. Heartbeat ping/pong.
10. Disconnect dan reconnect.

### 40.3 Load Test

Skenario MVP:

| Skenario | Target |
|---|---:|
| Concurrent users | 100 |
| Vessels active in viewport | 1.000 |
| Position events per second | 500 |
| p95 delivery latency | < 2 detik |
| Disconnect abnormal | < 1% |

Skenario production awal:

| Skenario | Target |
|---|---:|
| Concurrent users | 1.000 |
| Vessels active | 50.000 |
| Position events per second | 5.000 |
| p95 delivery latency | < 3 detik |
| Horizontal scaling | Wajib |

---

## 41. Acceptance Criteria

MVP WebSocket dianggap selesai jika:

1. User dapat membuka koneksi WebSocket dengan token valid.
2. Token invalid ditolak dengan jelas.
3. Client dapat subscribe `vessels.positions` menggunakan bounding box.
4. Client menerima update posisi kapal tanpa refresh halaman.
5. Marker kapal di peta berubah sesuai event WebSocket.
6. Client dapat update bbox saat peta digeser/zoom.
7. Client dapat menerima alert baru secara real-time.
8. Client dapat menerima geofence enter/exit event.
9. Heartbeat ping/pong berjalan stabil.
10. Client dapat reconnect dan restore subscription.
11. Server menerapkan permission channel.
12. Server menerapkan rate limit command.
13. Event memiliki `event_id`, `sequence`, `timestamp`, `channel`, dan `payload`.
14. Latency p95 dari processed event ke frontend maksimal 2 detik untuk MVP.
15. WebSocket metrics tersedia di monitoring.

---

## 42. Open Questions

1. Provider AIS mana yang akan dipakai untuk MVP?
2. Berapa target jumlah kapal aktif pada area awal?
3. Apakah dashboard akan digunakan 24/7 oleh operator?
4. Apakah perlu multi-tenant sejak MVP?
5. Apakah ada pembatasan area berdasarkan user/role?
6. Apakah alert critical perlu suara/audio di frontend?
7. Apakah WebSocket gateway akan digabung dengan backend API atau dipisah sejak awal?
8. Apakah perlu MQTT untuk integrasi perangkat lapangan di fase berikutnya?
9. Apakah sistem harus mendukung kapal internal dengan GPS tracker non-AIS?
10. Apakah event real-time perlu disimpan ulang sebagai audit stream?

---

## 43. Rekomendasi Implementasi MVP

Untuk MVP, gunakan arsitektur ringkas berikut:

```text
Next.js Dashboard
        ↓ wss
NestJS / FastAPI WebSocket Gateway
        ↓
Redis Streams
        ↓
AIS Ingestion Service
        ↓
PostgreSQL + PostGIS + TimescaleDB
```

Prioritas implementasi:

1. WebSocket connect/auth.
2. Subscribe posisi kapal berdasarkan bbox.
3. Event `VESSEL_POSITION_UPDATE`.
4. Frontend marker update.
5. Heartbeat dan reconnect.
6. Alert event.
7. Geofence event.
8. Monitoring metrics.

Dengan spesifikasi ini, realtime layer VesselTrack OS dapat dibangun sebagai “radar digital” yang stabil: bukan sekadar peta bergerak, tetapi sistem komunikasi operasional yang tertib, terukur, dan siap berkembang.

---

## 44. Revision History

| Versi | Tanggal | Penulis | Perubahan |
|---|---|---|---|
| v1.0 | 21 Juni 2026 | AI Assistant | Draft awal Realtime WebSocket Specification |
