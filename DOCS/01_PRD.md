# 01_PRD.md
# Product Requirements Document
# Real Time Vessel Tracking System

**Nama Sistem Contoh:** VesselTrack OS  
**Versi Dokumen:** v1.0  
**Tanggal:** 20 Juni 2026  
**Status:** Draft Awal  
**Pendekatan Pengembangan:** AIS API Provider → MVP → Geofence → Playback → Analytics → Hardening

---

## 1. Ringkasan Produk

**Real Time Vessel Tracking System** adalah aplikasi pemantauan kapal berbasis peta digital yang menampilkan posisi kapal secara real-time, menyimpan histori pergerakan, menyediakan detail kapal, mendeteksi pelanggaran geofence, dan memberikan alert kepada operator.

Sistem ini dirancang untuk memulai dari jalur paling praktis, yaitu menggunakan **AIS API Provider** sebagai sumber data awal. Dengan pendekatan ini, pengembangan dapat fokus pada validasi produk, dashboard, real-time tracking, dan kebutuhan operasional sebelum membangun infrastruktur AIS receiver sendiri.

Pada tahap awal, sistem akan difokuskan untuk area tertentu seperti pelabuhan, sungai, area labuh, jalur pelayaran, atau wilayah operasi perusahaan. Setelah MVP stabil, sistem dapat diperluas menjadi platform **Maritime Intelligence** dengan fitur analytics, playback historis, reporting, dan deteksi anomali.

---

## 2. Latar Belakang

Operasi maritim membutuhkan visibilitas yang cepat, akurat, dan mudah dipahami terhadap posisi dan aktivitas kapal. Tanpa sistem tracking yang terintegrasi, operator sering bergantung pada data manual, update terpisah, komunikasi radio, spreadsheet, atau dashboard vendor yang tidak sepenuhnya sesuai kebutuhan internal.

Permasalahan umum yang ingin diselesaikan:

1. Posisi kapal sulit dipantau secara real-time dalam satu dashboard.
2. Data historis pergerakan kapal tidak tersimpan rapi.
3. Sulit mengetahui kapal yang masuk/keluar area tertentu.
4. Alert operasional belum otomatis.
5. Analisis aktivitas kapal membutuhkan proses manual.
6. Integrasi dengan sistem internal belum tersedia.

Sistem ini hadir sebagai pusat kendali digital untuk memantau, menganalisis, dan mengelola data pergerakan kapal.

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis

1. Meningkatkan visibilitas operasional terhadap pergerakan kapal.
2. Mempercepat pengambilan keputusan operator.
3. Mengurangi ketergantungan pada pemantauan manual.
4. Menyediakan data historis untuk audit, analisis, dan reporting.
5. Menjadi fondasi pengembangan maritime intelligence platform.

### 3.2 Tujuan Teknis

1. Mengambil data kapal dari AIS API Provider.
2. Menampilkan posisi kapal di peta secara real-time.
3. Menyimpan data posisi historis kapal.
4. Menyediakan API backend untuk data kapal, histori, alert, dan geofence.
5. Menyediakan WebSocket untuk update posisi real-time.
6. Mendukung geofence dan rule-based alert.
7. Mendukung ekspor data ke CSV/GeoJSON pada fase lanjutan.

---

## 4. Ruang Lingkup Produk

### 4.1 Scope MVP

MVP akan mencakup fitur berikut:

1. Real-time vessel map.
2. Vessel detail panel.
3. Search kapal berdasarkan nama atau MMSI.
4. Data ingestion dari AIS API Provider.
5. Penyimpanan latest position.
6. Penyimpanan historical track.
7. Basic WebSocket update.
8. Filter kapal berdasarkan status atau tipe.
9. Basic alert feed.
10. Basic geofence display.

### 4.2 Scope Fase Lanjutan

Fase lanjutan akan mencakup:

1. Geofence editor.
2. Rule engine untuk alert.
3. Playback route historis.
4. Analytics dashboard.
5. Heatmap kepadatan kapal.
6. Idle/anchoring detection.
7. ETA estimation.
8. Notification gateway.
9. Export CSV/GeoJSON.
10. Integration API untuk sistem eksternal.

### 4.3 Di Luar Scope MVP

Fitur berikut tidak termasuk MVP awal:

1. Pembangunan AIS receiver fisik sendiri.
2. Deteksi collision risk tingkat lanjut.
3. Machine learning untuk anomaly detection.
4. Integrasi radar.
5. Integrasi satelit langsung.
6. Mobile app native.
7. Multi-tenant billing system.
8. Advanced dark vessel detection.

---

## 5. Target Pengguna

### 5.1 Operator

Pengguna utama yang memantau posisi kapal, melihat alert, mencari kapal, dan mengambil tindakan operasional.

Kebutuhan utama:

1. Melihat kapal di peta.
2. Mengetahui kapal mana yang aktif.
3. Melihat kapal yang melanggar area.
4. Melakukan pencarian cepat.
5. Melihat detail kapal.

### 5.2 Supervisor / Manager Operasi

Pengguna yang membutuhkan overview aktivitas dan laporan operasional.

Kebutuhan utama:

1. Melihat ringkasan jumlah kapal aktif.
2. Melihat alert harian.
3. Melihat performa area.
4. Mengunduh laporan.
5. Melakukan review historis.

### 5.3 Analyst

Pengguna yang menganalisis histori pergerakan, pola aktivitas, dan data kapal.

Kebutuhan utama:

1. Melihat track historis.
2. Melakukan playback rute.
3. Mengekspor data.
4. Menganalisis kepadatan kapal.
5. Meninjau pola kecepatan, idle, dan route deviation.

### 5.4 Administrator

Pengguna yang mengelola user, role, data source, geofence, dan konfigurasi sistem.

Kebutuhan utama:

1. Mengelola user.
2. Mengelola role dan permission.
3. Mengelola AIS provider setting.
4. Mengelola geofence.
5. Melihat audit log.

---

## 6. Persona Pengguna

### Persona 1: Operator Pelabuhan

**Nama:** Andi Pratama  
**Role:** Operator  
**Tujuan:** Memantau kapal yang masuk dan keluar area pelabuhan secara real-time.  
**Pain Point:** Terlambat mengetahui kapal yang masuk area terbatas.  
**Kebutuhan:** Dashboard sederhana, alert jelas, dan peta yang mudah dibaca.

### Persona 2: Supervisor Operasi

**Nama:** Rina Kusuma  
**Role:** Supervisor Operasi  
**Tujuan:** Melihat performa operasi harian dan memastikan tidak ada pelanggaran area.  
**Pain Point:** Laporan aktivitas kapal masih manual.  
**Kebutuhan:** KPI, summary alert, dan laporan harian.

### Persona 3: Maritime Analyst

**Nama:** Dimas Wicaksono  
**Role:** Analyst  
**Tujuan:** Menganalisis histori pergerakan kapal dan pola kepadatan.  
**Pain Point:** Data historis sulit diakses dan tidak terstruktur.  
**Kebutuhan:** Playback, export data, heatmap, dan filter waktu.

---

## 7. Use Case Utama

### UC-01: Melihat Kapal di Peta Real-Time

**Aktor:** Operator  
**Deskripsi:** Operator membuka dashboard dan melihat posisi kapal aktif di peta.

Alur:

1. Operator login.
2. Sistem membuka dashboard utama.
3. Sistem mengambil latest vessel position.
4. Sistem menampilkan marker kapal pada peta.
5. Sistem memperbarui posisi kapal melalui WebSocket.

Acceptance Criteria:

1. Kapal aktif muncul di peta.
2. Marker kapal memiliki arah/heading.
3. Posisi kapal diperbarui tanpa refresh halaman.
4. Kapal yang tidak update dalam batas waktu tertentu diberi status outdated/offline.

---

### UC-02: Melihat Detail Kapal

**Aktor:** Operator  
**Deskripsi:** Operator memilih kapal di peta untuk melihat informasi detail.

Alur:

1. Operator klik marker kapal.
2. Sistem membuka vessel detail panel.
3. Sistem menampilkan nama kapal, MMSI, status, SOG, COG, heading, ETA, dan last update.

Acceptance Criteria:

1. Detail kapal tampil dalam waktu kurang dari 2 detik.
2. Data detail sesuai latest position.
3. Panel dapat ditutup atau diganti ke kapal lain.

---

### UC-03: Mencari Kapal

**Aktor:** Operator / Analyst  
**Deskripsi:** Pengguna mencari kapal berdasarkan nama atau MMSI.

Alur:

1. Pengguna mengetik nama kapal atau MMSI.
2. Sistem menampilkan hasil pencarian.
3. Pengguna memilih kapal.
4. Peta melakukan zoom ke posisi kapal.

Acceptance Criteria:

1. Search mendukung partial text.
2. Search mendukung MMSI.
3. Peta berpindah ke lokasi kapal yang dipilih.

---

### UC-04: Melihat Histori Pergerakan Kapal

**Aktor:** Analyst  
**Deskripsi:** Analyst melihat rute historis kapal dalam rentang waktu tertentu.

Alur:

1. Analyst memilih kapal.
2. Analyst memilih rentang waktu.
3. Sistem mengambil data historical position.
4. Sistem menampilkan polyline rute kapal.

Acceptance Criteria:

1. Rute historis tampil di peta.
2. Titik posisi dapat difilter berdasarkan waktu.
3. Data dapat diekspor pada fase lanjutan.

---

### UC-05: Deteksi Kapal Masuk Geofence

**Aktor:** Sistem / Operator  
**Deskripsi:** Sistem mendeteksi kapal yang masuk area geofence.

Alur:

1. Data posisi kapal masuk.
2. Sistem mengecek apakah posisi kapal berada dalam polygon geofence.
3. Jika masuk area terlarang, sistem membuat event.
4. Alert muncul di dashboard.

Acceptance Criteria:

1. Sistem dapat mendeteksi enter geofence.
2. Sistem membuat event dengan timestamp.
3. Alert tampil pada alert feed.
4. Alert menyimpan MMSI, nama kapal, geofence ID, dan severity.

---

### UC-06: Playback Route

**Aktor:** Analyst / Supervisor  
**Deskripsi:** Pengguna memutar ulang pergerakan kapal pada periode tertentu.

Alur:

1. Pengguna memilih kapal.
2. Pengguna memilih rentang waktu.
3. Pengguna menekan tombol playback.
4. Sistem menampilkan animasi pergerakan kapal berdasarkan histori.

Acceptance Criteria:

1. Playback memiliki tombol play, pause, forward, dan timeline.
2. Playback menampilkan posisi kapal sesuai waktu.
3. Playback dapat dipercepat minimal 1x dan 2x pada fase lanjutan.

---

## 8. Kebutuhan Fungsional

### 8.1 Modul Data Source

FR-001: Sistem dapat menyimpan konfigurasi AIS API Provider.  
FR-002: Sistem dapat mengambil data kapal dari endpoint provider.  
FR-003: Sistem dapat melakukan polling berdasarkan interval tertentu.  
FR-004: Sistem dapat menyimpan raw response untuk audit/debugging.  
FR-005: Sistem dapat mencatat status koneksi provider.

### 8.2 Modul Vessel Registry

FR-006: Sistem dapat menyimpan data vessel master.  
FR-007: Sistem dapat memperbarui nama kapal, MMSI, IMO, callsign, tipe kapal, dimensi, dan flag jika data tersedia.  
FR-008: Sistem dapat mencari vessel berdasarkan MMSI, IMO, atau nama kapal.  
FR-009: Sistem dapat menampilkan detail vessel.

### 8.3 Modul Real-Time Tracking

FR-010: Sistem dapat menyimpan posisi terbaru setiap kapal.  
FR-011: Sistem dapat menyimpan histori posisi kapal.  
FR-012: Sistem dapat menampilkan marker kapal pada peta.  
FR-013: Sistem dapat memperbarui marker secara real-time.  
FR-014: Sistem dapat menampilkan heading kapal.  
FR-015: Sistem dapat membedakan status kapal berdasarkan warna marker.

### 8.4 Modul Map Dashboard

FR-016: Sistem menyediakan peta interaktif.  
FR-017: Sistem menyediakan zoom in/out.  
FR-018: Sistem menyediakan layer switcher.  
FR-019: Sistem menyediakan filter vessel type.  
FR-020: Sistem menyediakan search box kapal.  
FR-021: Sistem menyediakan panel detail kapal.

### 8.5 Modul Historical Track

FR-022: Sistem dapat mengambil histori posisi berdasarkan MMSI dan rentang waktu.  
FR-023: Sistem dapat menampilkan polyline rute kapal.  
FR-024: Sistem dapat menampilkan titik posisi historis.  
FR-025: Sistem dapat menampilkan waktu, speed, dan heading pada titik historis.

### 8.6 Modul Geofence

FR-026: Sistem dapat menyimpan data geofence polygon.  
FR-027: Sistem dapat menampilkan geofence pada peta.  
FR-028: Sistem dapat mengecek posisi kapal terhadap geofence.  
FR-029: Sistem dapat mendeteksi enter zone.  
FR-030: Sistem dapat mendeteksi exit zone pada fase lanjutan.  
FR-031: Sistem dapat mengelola severity geofence.

### 8.7 Modul Alert

FR-032: Sistem dapat membuat alert berdasarkan rule.  
FR-033: Sistem dapat menampilkan alert feed.  
FR-034: Sistem dapat menyimpan alert historis.  
FR-035: Sistem dapat mengubah status alert menjadi acknowledged.  
FR-036: Sistem dapat mengirim notifikasi pada fase lanjutan.

### 8.8 Modul Playback

FR-037: Sistem dapat memutar ulang rute kapal berdasarkan histori.  
FR-038: Sistem menyediakan kontrol play/pause.  
FR-039: Sistem menyediakan timeline slider.  
FR-040: Sistem dapat menampilkan timestamp selama playback.

### 8.9 Modul Analytics

FR-041: Sistem dapat menampilkan jumlah kapal aktif.  
FR-042: Sistem dapat menampilkan jumlah kapal di area pelabuhan.  
FR-043: Sistem dapat menampilkan jumlah alert hari ini.  
FR-044: Sistem dapat menampilkan average speed.  
FR-045: Sistem dapat menampilkan statistik per vessel type pada fase lanjutan.  
FR-046: Sistem dapat menampilkan heatmap pada fase lanjutan.

### 8.10 Modul User & Role

FR-047: Sistem menyediakan login.  
FR-048: Sistem menyediakan role Admin, Operator, Supervisor, Analyst, Viewer.  
FR-049: Sistem membatasi akses berdasarkan role.  
FR-050: Sistem menyimpan audit log aktivitas penting.

---

## 9. Kebutuhan Non-Fungsional

### 9.1 Performance

NFR-001: Dashboard awal terbuka dalam waktu maksimal 5 detik pada koneksi normal.  
NFR-002: Update posisi kapal diterima frontend maksimal 3 detik setelah data diproses backend untuk MVP.  
NFR-003: Search kapal memberikan hasil maksimal 2 detik.  
NFR-004: Sistem MVP mampu menangani minimal 1.000 kapal aktif dalam satu area monitoring.  
NFR-005: Sistem production ditargetkan mampu menangani 10.000+ kapal aktif dengan optimasi clustering dan viewport filtering.

### 9.2 Availability

NFR-006: Target availability MVP minimal 95%.  
NFR-007: Target availability production minimal 99%.  
NFR-008: Sistem harus dapat restart tanpa kehilangan konfigurasi utama.

### 9.3 Security

NFR-009: Semua endpoint membutuhkan autentikasi kecuali endpoint health check.  
NFR-010: Komunikasi API menggunakan HTTPS.  
NFR-011: WebSocket menggunakan secure connection.  
NFR-012: Password disimpan menggunakan hashing yang aman.  
NFR-013: API key provider tidak boleh terekspos ke frontend.  
NFR-014: Sistem memiliki audit log untuk login, perubahan geofence, perubahan rule, dan acknowledge alert.

### 9.4 Scalability

NFR-015: Arsitektur harus mendukung pemisahan ingestion service, API service, WebSocket service, dan alert service.  
NFR-016: Database posisi harus mendukung partisi/time-series storage.  
NFR-017: Sistem harus mendukung caching latest position.

### 9.5 Data Quality

NFR-018: Sistem harus melakukan validasi latitude dan longitude.  
NFR-019: Sistem harus menolak posisi dengan koordinat tidak valid.  
NFR-020: Sistem harus mendeteksi data duplikat berdasarkan MMSI dan timestamp.  
NFR-021: Sistem harus menandai posisi yang terlalu lama sebagai stale/outdated.

### 9.6 Maintainability

NFR-022: Kode backend dan frontend harus memiliki struktur modular.  
NFR-023: API contract didokumentasikan.  
NFR-024: Database schema menggunakan migration.  
NFR-025: Sistem memiliki logging yang cukup untuk debugging.

---

## 10. Data Requirement

### 10.1 Data Vessel

Minimal data:

| Field | Deskripsi | Wajib |
|---|---|---|
| mmsi | Maritime Mobile Service Identity | Ya |
| imo | IMO number | Tidak |
| name | Nama kapal | Tidak |
| callsign | Callsign kapal | Tidak |
| vessel_type | Tipe kapal | Tidak |
| flag | Bendera kapal | Tidak |
| length | Panjang kapal | Tidak |
| width | Lebar kapal | Tidak |

### 10.2 Data Position

Minimal data:

| Field | Deskripsi | Wajib |
|---|---|---|
| mmsi | ID kapal | Ya |
| timestamp | Waktu posisi | Ya |
| latitude | Latitude | Ya |
| longitude | Longitude | Ya |
| sog | Speed over ground | Tidak |
| cog | Course over ground | Tidak |
| heading | Heading kapal | Tidak |
| nav_status | Status navigasi | Tidak |
| source | Sumber data | Ya |

### 10.3 Data Geofence

| Field | Deskripsi | Wajib |
|---|---|---|
| id | ID geofence | Ya |
| name | Nama area | Ya |
| type | Jenis area | Ya |
| geometry | Polygon area | Ya |
| severity | Tingkat risiko | Ya |
| rule | Rule alert | Tidak |

### 10.4 Data Alert

| Field | Deskripsi | Wajib |
|---|---|---|
| id | ID alert | Ya |
| mmsi | Kapal terkait | Ya |
| event_type | Jenis alert | Ya |
| event_time | Waktu event | Ya |
| severity | Tingkat severity | Ya |
| message | Pesan alert | Ya |
| status | Open/Acknowledged/Closed | Ya |

---

## 11. Rancangan Arsitektur Produk

Arsitektur konseptual:

```text
AIS API Provider
      ↓
Ingestion Service
      ↓
Parser & Validator
      ↓
Event Stream / Queue
      ↓
PostgreSQL + PostGIS + TimescaleDB
      ↓
REST API + WebSocket Gateway
      ↓
Frontend Map Dashboard
      ↓
Alert + Geofence + Analytics
```

Komponen utama:

1. **Data Source Connector** untuk mengambil data dari AIS API Provider.
2. **AIS Parser & Normalizer** untuk menyamakan format data.
3. **Validation Engine** untuk memastikan data koordinat valid.
4. **Storage Layer** untuk latest position, historical track, geofence, dan alert.
5. **API Layer** untuk akses data.
6. **WebSocket Gateway** untuk update real-time.
7. **Dashboard UI** untuk peta, detail kapal, alert, dan analytics.
8. **Alert Engine** untuk rule geofence dan event operasional.

---

## 12. Rekomendasi Teknologi

### 12.1 MVP Stack

| Komponen | Rekomendasi |
|---|---|
| Frontend | Next.js + React |
| Map | MapLibre GL atau Leaflet |
| Backend | FastAPI atau NestJS |
| Database | PostgreSQL + PostGIS |
| Time-Series | TimescaleDB |
| Cache | Redis |
| Realtime | WebSocket |
| Deployment | Docker + VPS/Cloud Run |
| Source Data | AIS API Provider |

### 12.2 Production Stack

| Komponen | Rekomendasi |
|---|---|
| Frontend | Next.js + MapLibre / ArcGIS Maps SDK |
| Backend | Microservices FastAPI/NestJS |
| Stream | Kafka / Redpanda |
| Database | PostgreSQL + PostGIS + TimescaleDB |
| Cache | Redis |
| Object Storage | S3-compatible storage |
| Monitoring | Prometheus + Grafana |
| Logging | Loki / ELK |
| Deployment | Kubernetes / ECS / Cloud Run |

---

## 13. API Requirement Awal

### 13.1 Vessel API

```text
GET /api/v1/vessels
GET /api/v1/vessels/{mmsi}
GET /api/v1/vessels/{mmsi}/latest
GET /api/v1/vessels/{mmsi}/history?from=&to=
```

### 13.2 Position API

```text
GET /api/v1/positions/latest
GET /api/v1/positions/bbox?minLon=&minLat=&maxLon=&maxLat=
```

### 13.3 Geofence API

```text
GET /api/v1/geofences
POST /api/v1/geofences
GET /api/v1/geofences/{id}
PUT /api/v1/geofences/{id}
DELETE /api/v1/geofences/{id}
```

### 13.4 Alert API

```text
GET /api/v1/alerts
GET /api/v1/alerts/{id}
POST /api/v1/alerts/{id}/acknowledge
POST /api/v1/alerts/{id}/close
```

### 13.5 WebSocket Event

```text
WS /ws/vessels
WS /ws/alerts
```

Contoh event:

```json
{
  "type": "VESSEL_POSITION_UPDATE",
  "mmsi": "525123456",
  "lat": -6.1122,
  "lon": 106.8847,
  "sog": 12.4,
  "cog": 88.5,
  "heading": 90,
  "timestamp": "2026-06-20T10:15:22Z"
}
```

---

## 14. UI/UX Requirement

### 14.1 Dashboard Utama

Elemen wajib:

1. Sidebar menu.
2. Search kapal/MMSI.
3. Status realtime connection.
4. KPI cards.
5. Map utama.
6. Vessel marker.
7. Vessel detail panel.
8. Alert feed.
9. Geofence status.
10. Playback route panel.

### 14.2 Marker Kapal

Marker kapal harus menampilkan:

1. Posisi kapal.
2. Arah kapal.
3. Warna berdasarkan status.
4. Tooltip nama kapal dan speed.
5. Highlight untuk kapal yang dipilih.

### 14.3 Warna Status

| Status | Warna |
|---|---|
| Moving / Under Way | Biru/Hijau |
| In Port | Cyan |
| Idle / Anchored | Kuning |
| Alert | Merah |
| Outdated / Stale | Abu-abu |

### 14.4 Panel Detail Kapal

Field minimal:

1. Nama kapal.
2. MMSI.
3. Status.
4. SOG.
5. COG.
6. Heading.
7. ETA.
8. Last update.
9. Tombol Track.
10. Tombol Playback.
11. Tombol Set Alert.

---

## 15. Alert Rule Awal

### 15.1 Geofence Breach

Kondisi:

```text
Jika posisi kapal berada di dalam polygon area terbatas,
maka sistem membuat alert severity High.
```

### 15.2 AIS Silence

Kondisi:

```text
Jika kapal tidak memiliki update posisi lebih dari N menit,
maka sistem membuat alert AIS Silence.
```

Nilai awal:

```text
N = 15 menit untuk area padat
N = 30 menit untuk area umum
```

### 15.3 Speed Violation

Kondisi:

```text
Jika SOG kapal melebihi batas area,
maka sistem membuat alert Speed Violation.
```

### 15.4 Enter Port Area

Kondisi:

```text
Jika kapal masuk area pelabuhan,
sistem membuat event informasi.
```

---

## 16. Role dan Permission

| Role | Permission |
|---|---|
| Admin | Full access, manage users, data source, geofence, rule |
| Supervisor | View dashboard, view analytics, acknowledge/close alert |
| Operator | View dashboard, view vessel, acknowledge alert |
| Analyst | View history, playback, analytics, export |
| Viewer | Read-only dashboard |

---

## 17. Success Metrics

### 17.1 MVP Metrics

1. Dashboard dapat menampilkan minimal 1.000 kapal aktif.
2. Update posisi dapat diterima dashboard tanpa refresh.
3. Search kapal berhasil berdasarkan MMSI/nama.
4. Histori posisi tersimpan minimal 7 hari pada MVP.
5. Alert geofence dasar berhasil dibuat.
6. Operator dapat memahami status kapal tanpa pelatihan panjang.

### 17.2 Business Metrics

1. Waktu pencarian posisi kapal berkurang minimal 70%.
2. Pelanggaran area dapat diketahui kurang dari 1 menit setelah data diterima.
3. Laporan aktivitas kapal dapat dibuat lebih cepat dibanding proses manual.
4. Pengguna aktif harian mencapai target operasional.

---

## 18. MVP Acceptance Criteria

MVP dianggap selesai jika:

1. Sistem dapat login dengan role minimal Admin dan Operator.
2. Sistem dapat mengambil data dari AIS API Provider.
3. Sistem dapat menampilkan kapal pada peta.
4. Sistem dapat memperbarui posisi kapal secara real-time.
5. Sistem dapat menampilkan detail kapal.
6. Sistem dapat menyimpan historical position.
7. Sistem dapat menampilkan rute historis dasar.
8. Sistem dapat menampilkan geofence statis.
9. Sistem dapat membuat alert ketika kapal masuk geofence tertentu.
10. Sistem memiliki deployment environment yang dapat diuji oleh user.

---

## 19. Roadmap Pengembangan

### Fase 0: Discovery

Output:

1. Kebutuhan bisnis.
2. Area monitoring.
3. Pilihan AIS Provider.
4. Arsitektur awal.
5. Risk register awal.

### Fase 1: Prototype

Output:

1. Prototype ingestion AIS API.
2. Prototype database PostGIS.
3. Prototype map dashboard.
4. Wireframe UI.
5. API contract awal.

### Fase 2: MVP Tracking

Output:

1. Real-time map.
2. Vessel marker.
3. Vessel detail.
4. Search kapal.
5. Latest position.
6. Historical position.
7. WebSocket update.

### Fase 3: Geofence & Alert

Output:

1. Geofence display.
2. Geofence engine.
3. Alert rule.
4. Alert feed.
5. Acknowledge alert.

### Fase 4: Playback & Analytics

Output:

1. Playback route.
2. Timeline slider.
3. Basic analytics.
4. Export CSV/GeoJSON.
5. Heatmap awal.

### Fase 5: Hardening

Output:

1. Security hardening.
2. Performance tuning.
3. Monitoring.
4. Backup.
5. UAT.
6. Production deployment.

---

## 20. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| AIS API mahal | Biaya operasional tinggi | Batasi area dan refresh interval pada MVP |
| Latency data provider tinggi | Real-time terasa lambat | Pilih provider low-latency dan gunakan cache |
| Data duplikat | Marker kacau | Dedup berdasarkan MMSI + timestamp |
| Posisi kapal loncat | Rute tidak akurat | Validasi distance jump dan speed abnormal |
| Browser berat karena banyak marker | UI lambat | Clustering dan viewport filtering |
| Geofence false alert | Operator terganggu | Tambahkan debounce dan rule threshold |
| Vendor lock-in | Sulit pindah provider | Buat data source abstraction layer |
| Lisensi data tidak sesuai | Risiko legal | Review ToS provider sejak awal |
| Data historis membengkak | Biaya storage tinggi | Retention policy dan compression |

---

## 21. Asumsi

1. Data awal berasal dari AIS API Provider.
2. Area monitoring awal dibatasi pada wilayah tertentu.
3. MVP tidak membutuhkan receiver AIS fisik.
4. User awal terdiri dari Admin, Operator, Supervisor, Analyst, dan Viewer.
5. Sistem digunakan melalui desktop web browser.
6. Data posisi disimpan dalam format geospatial.
7. Peta menggunakan MapLibre, Leaflet, atau teknologi setara.

---

## 22. Dependensi

1. Akses AIS API Provider.
2. API key dan dokumentasi provider.
3. Base map provider.
4. Infrastruktur cloud/VPS.
5. Database PostgreSQL + PostGIS.
6. Keputusan area monitoring awal.
7. Daftar geofence awal.
8. Definisi role dan user awal.

---

## 23. Open Questions

1. Area monitoring awal akan difokuskan ke pelabuhan, sungai, offshore, atau wilayah nasional?
2. AIS provider mana yang akan digunakan untuk MVP?
3. Berapa interval update yang diinginkan: 5 detik, 10 detik, 30 detik, atau 1 menit?
4. Berapa lama histori posisi disimpan pada MVP?
5. Apakah notifikasi awal cukup di dashboard, atau perlu email/Telegram/WhatsApp?
6. Apakah sistem perlu integrasi dengan sistem internal lain?
7. Apakah dashboard hanya untuk internal atau juga untuk mitra eksternal?
8. Apakah perlu dukungan bahasa Indonesia dan Inggris?

---

## 24. Dokumen Turunan yang Dibutuhkan

Setelah PRD ini, dokumen berikut perlu dibuat:

1. `02_System_Architecture.md`
2. `03_Data_Source_Strategy.md`
3. `04_AIS_Data_Model.md`
4. `05_Database_ERD.md`
5. `06_API_Specification.md`
6. `07_Realtime_WebSocket_Spec.md`
7. `08_Geofence_Rule_Spec.md`
8. `09_Alerting_Spec.md`
9. `10_UI_UX_Wireframe.md`
10. `11_Security_Model.md`
11. `12_Deployment_Plan.md`
12. `13_Testing_Strategy.md`
13. `14_Roadmap.md`
14. `15_Risk_Register.md`

---

## 25. Kesimpulan

PRD ini menetapkan fondasi awal untuk pengembangan **Real Time Vessel Tracking System** dengan pendekatan paling praktis: menggunakan **AIS API Provider** terlebih dahulu untuk mempercepat validasi produk.

Fokus MVP adalah membuat dashboard peta real-time yang dapat menampilkan kapal, detail kapal, histori dasar, geofence sederhana, dan alert awal. Setelah MVP terbukti, sistem dapat dikembangkan menjadi platform maritime intelligence dengan analytics, playback, reporting, anomaly detection, dan integrasi operasional yang lebih luas.

