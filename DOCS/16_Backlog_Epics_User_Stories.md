# 16_Backlog_Epics_User_Stories.md
# Backlog, Epics, and User Stories

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product & Engineering Team  

---


## 1. Purpose

Dokumen ini mendefinisikan backlog produk untuk **Real Time Vessel Tracking System / VesselTrack OS**. Backlog ini diturunkan dari PRD, arsitektur sistem, model data AIS, ERD, API specification, WebSocket specification, geofence rule specification, alerting specification, UI/UX wireframe, security model, deployment plan, testing strategy, roadmap, dan risk register.

Tujuan utama backlog adalah menyediakan daftar kerja yang dapat langsung diterjemahkan menjadi issue di Jira, GitHub Projects, GitLab Issues, Linear, ClickUp, atau Trello.

---

## 2. Product Goal

Membangun platform pemantauan kapal real-time berbasis AIS API Provider untuk MVP, dengan kemampuan:

1. Menampilkan kapal di peta secara real-time.
2. Menyimpan dan menampilkan detail kapal.
3. Menyimpan histori pergerakan kapal.
4. Mendeteksi geofence enter, exit, dwell, speed, dan AIS silence.
5. Menghasilkan alert dan notifikasi.
6. Menyediakan playback rute.
7. Menyediakan analytics dasar.
8. Menyediakan fondasi keamanan, audit, dan operasional.

---

## 3. Backlog Structure

Backlog dikelompokkan dalam hirarki berikut:

```text
Theme
  Epic
    Feature
      User Story
        Task
          Sub-task
```

Contoh:

```text
Theme: Realtime Vessel Monitoring
  Epic: Realtime Map Dashboard
    Feature: Vessel Marker Rendering
      Story: Operator melihat kapal bergerak di peta
        Task: Implement WebSocket subscription
        Task: Render marker by MMSI
```

---

## 4. Priority Model

Prioritas menggunakan skala MoSCoW:

| Priority | Meaning | Description |
|---|---|---|
| Must Have | P0 | Wajib untuk MVP |
| Should Have | P1 | Penting, dapat masuk MVP jika kapasitas cukup |
| Could Have | P2 | Bagus untuk fase berikutnya |
| Won't Have Now | P3 | Ditunda |

---

## 5. Estimation Model

Estimasi menggunakan story point Fibonacci:

| Point | Meaning |
|---:|---|
| 1 | Sangat kecil |
| 2 | Kecil |
| 3 | Sedang |
| 5 | Cukup kompleks |
| 8 | Kompleks |
| 13 | Perlu dipecah |

Rule:

1. Story dengan point 13 harus dipecah.
2. Story P0 harus memiliki acceptance criteria jelas.
3. Story yang menyentuh security, database, atau ingestion harus memiliki test case.

---

## 6. Definition of Ready

User story siap dikerjakan jika:

1. Memiliki user value yang jelas.
2. Memiliki acceptance criteria.
3. Memiliki prioritas.
4. Memiliki dependency yang diketahui.
5. Memiliki desain UI/API jika diperlukan.
6. Data model sudah jelas jika menyimpan data.
7. Tidak ada blocker bisnis utama.

---

## 7. Definition of Done

Story dianggap selesai jika:

1. Kode selesai dan sudah di-review.
2. Unit test atau integration test tersedia sesuai kebutuhan.
3. API terdokumentasi jika ada endpoint baru.
4. UI sudah sesuai wireframe atau disetujui Product Owner.
5. Security basic check lulus.
6. Tidak ada critical/high bug terbuka.
7. Sudah deploy ke environment staging.
8. Acceptance criteria terpenuhi.

---

## 8. Themes and Epics Summary

| Theme | Epic ID | Epic | Priority | MVP |
|---|---|---|---|---|
| Foundation | E-01 | Project Setup & Engineering Foundation | P0 | Yes |
| Data | E-02 | AIS Data Source Integration | P0 | Yes |
| Data | E-03 | AIS Parsing, Validation & Normalization | P0 | Yes |
| Database | E-04 | Geospatial Database & Time-Series Storage | P0 | Yes |
| Backend | E-05 | Core REST API | P0 | Yes |
| Realtime | E-06 | WebSocket Realtime Gateway | P0 | Yes |
| Frontend | E-07 | Realtime Map Dashboard | P0 | Yes |
| Frontend | E-08 | Vessel List & Vessel Detail | P0 | Yes |
| Geofence | E-09 | Geofence Management | P0 | Yes |
| Alert | E-10 | Alert Engine & Alert Inbox | P0 | Yes |
| History | E-11 | Vessel History & Playback | P1 | Yes |
| Analytics | E-12 | Basic Analytics & Reporting | P1 | Partial |
| Security | E-13 | Authentication, RBAC & Audit | P0 | Yes |
| Operations | E-14 | Observability, Deployment & Runbook | P0 | Yes |
| Quality | E-15 | Testing, UAT & Release Readiness | P0 | Yes |
| Future | E-16 | Advanced Maritime Intelligence | P2 | No |

---

## 9. Epic E-01: Project Setup & Engineering Foundation

### Objective

Membangun fondasi teknis agar tim dapat bekerja konsisten, terukur, dan mudah dideploy.

### User Stories

#### US-001: Repository Structure

**As a** developer,  
**I want** repository project memiliki struktur yang jelas,  
**so that** pengembangan frontend, backend, ingestion, dan infrastructure tidak bercampur seperti jaring nelayan kusut.

Priority: P0  
Estimate: 3  

Acceptance Criteria:

1. Repository memiliki folder `frontend`, `backend`, `ingestion`, `infra`, `docs`, dan `scripts`.
2. README tersedia dengan cara menjalankan local development.
3. Environment variable template tersedia dalam `.env.example`.
4. Branching strategy terdokumentasi.

Tasks:

- Create repository structure.
- Add README.
- Add `.env.example`.
- Add contribution guideline.

#### US-002: Local Development with Docker Compose

**As a** developer,  
**I want** menjalankan sistem lokal dengan satu perintah,  
**so that** setup environment cepat dan konsisten.

Priority: P0  
Estimate: 5  

Acceptance Criteria:

1. `docker compose up` menjalankan PostgreSQL, PostGIS, TimescaleDB, Redis, backend, dan frontend.
2. Healthcheck tersedia untuk setiap service.
3. Database migration dapat dijalankan.
4. Seed data demo tersedia.

#### US-003: CI Pipeline

**As a** engineering lead,  
**I want** pipeline CI berjalan otomatis,  
**so that** bug dasar tidak lolos ke staging.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Pipeline menjalankan lint.
2. Pipeline menjalankan unit test.
3. Pipeline menjalankan build frontend dan backend.
4. Pipeline gagal jika test gagal.

---

## 10. Epic E-02: AIS Data Source Integration

### Objective

Mengintegrasikan AIS API Provider sebagai sumber data utama MVP.

### User Stories

#### US-010: Configure AIS Provider Credential

**As an** admin,  
**I want** menyimpan konfigurasi AIS provider secara aman,  
**so that** ingestion service dapat mengambil data tanpa mengekspos API key.

Priority: P0  
Estimate: 3

Acceptance Criteria:

1. API key disimpan sebagai secret/environment variable.
2. API key tidak pernah muncul di log.
3. Konfigurasi provider dapat diganti per environment.
4. Sistem menolak startup jika credential wajib tidak tersedia.

#### US-011: AIS Polling by Area

**As a** system,  
**I want** mengambil data kapal berdasarkan area monitoring,  
**so that** hanya data relevan yang diproses.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Ingestion dapat melakukan polling menggunakan bounding box atau area parameter.
2. Interval polling dapat dikonfigurasi.
3. Response provider disimpan sebagai raw log.
4. Error provider dicatat dan tidak membuat service crash.
5. Retry policy tersedia.

#### US-012: AIS Provider Health Monitoring

**As an** operator,  
**I want** mengetahui status koneksi AIS provider,  
**so that** saya bisa membedakan masalah data dengan masalah aplikasi.

Priority: P1  
Estimate: 5

Acceptance Criteria:

1. Status provider menampilkan healthy, degraded, atau down.
2. Last successful fetch tercatat.
3. Error rate provider tersedia.
4. Dashboard admin menampilkan status provider.

---

## 11. Epic E-03: AIS Parsing, Validation & Normalization

### Objective

Mengubah data AIS dari provider menjadi canonical payload internal.

### User Stories

#### US-020: Normalize AIS Payload

**As a** backend service,  
**I want** menormalisasi data AIS dari provider ke canonical schema,  
**so that** komponen internal tidak bergantung pada format vendor.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Field minimum `mmsi`, `lat`, `lon`, `timestamp`, `source` tersedia.
2. Field navigasi `sog`, `cog`, `heading`, dan `nav_status` dipetakan jika tersedia.
3. Payload invalid masuk ke rejected log.
4. Mapping provider terdokumentasi.

#### US-021: Validate AIS Position

**As a** system,  
**I want** memvalidasi koordinat kapal,  
**so that** marker tidak melompat ke gurun atau pusat kota.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Latitude harus antara -90 dan 90.
2. Longitude harus antara -180 dan 180.
3. Timestamp tidak boleh terlalu jauh di masa depan.
4. Position jump abnormal diberi quality flag.
5. Invalid position tidak dikirim ke frontend real-time.

#### US-022: Deduplicate AIS Message

**As a** system,  
**I want** menghapus duplikasi data posisi,  
**so that** database dan WebSocket tidak penuh gema sinyal yang sama.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Dedup berdasarkan `mmsi + timestamp + lat + lon + source`.
2. Duplikat tidak masuk ke `vessel_positions`.
3. Counter duplicate tersedia di metrics.

---

## 12. Epic E-04: Geospatial Database & Time-Series Storage

### Objective

Menyediakan penyimpanan relasional, geospasial, dan time-series.

### User Stories

#### US-030: Create Core Database Schema

**As a** developer,  
**I want** database schema inti tersedia,  
**so that** data vessel, posisi, geofence, dan alert dapat disimpan.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Tabel `vessels`, `vessel_positions`, `vessel_latest_positions`, `raw_ais_messages`, `geofences`, `geofence_rules`, `alerts`, dan `audit_logs` tersedia.
2. PostGIS extension aktif.
3. TimescaleDB hypertable dibuat untuk `vessel_positions` jika extension tersedia.
4. Migration dapat dijalankan ulang dengan aman.

#### US-031: Latest Position Upsert

**As a** system,  
**I want** menyimpan posisi terakhir setiap kapal,  
**so that** dashboard dapat memuat peta dengan cepat.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Setiap posisi valid meng-update `vessel_latest_positions`.
2. Update hanya terjadi jika timestamp baru lebih mutakhir.
3. Query latest position untuk area map responsif.

---

## 13. Epic E-05: Core REST API

### Objective

Menyediakan API backend untuk frontend, admin, dan integrasi internal.

### User Stories

#### US-040: Vessel List API

**As an** operator,  
**I want** melihat daftar kapal,  
**so that** saya dapat mencari dan memilih kapal yang perlu dipantau.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Endpoint `GET /api/v1/vessels` tersedia.
2. Mendukung search by name, MMSI, IMO.
3. Mendukung pagination.
4. Mendukung filter vessel type dan status.

#### US-041: Vessel Detail API

**As an** operator,  
**I want** melihat detail kapal,  
**so that** saya memahami identitas dan status terkini kapal.

Priority: P0  
Estimate: 3

Acceptance Criteria:

1. Endpoint `GET /api/v1/vessels/{mmsi}` tersedia.
2. Response mencakup identity, dimension, latest position, dan status.
3. Jika MMSI tidak ditemukan, API mengembalikan 404 standar.

#### US-042: Vessel History API

**As an** analyst,  
**I want** mengambil histori posisi kapal,  
**so that** saya dapat menganalisis rute dan playback.

Priority: P1  
Estimate: 5

Acceptance Criteria:

1. Endpoint `GET /api/v1/vessels/{mmsi}/positions` tersedia.
2. Query mendukung `from`, `to`, dan sampling interval.
3. Response berurutan berdasarkan timestamp.
4. Query besar dibatasi.

---

## 14. Epic E-06: WebSocket Realtime Gateway

### Objective

Menyediakan update posisi dan alert secara real-time ke frontend.

### User Stories

#### US-050: WebSocket Connect and Authenticate

**As a** frontend client,  
**I want** terkoneksi ke WebSocket secara aman,  
**so that** saya dapat menerima data real-time sesuai izin.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Endpoint `wss://.../ws/v1/realtime` tersedia.
2. Client harus mengirim token valid.
3. Koneksi invalid ditolak.
4. Heartbeat ping/pong tersedia.

#### US-051: Subscribe Vessel Positions by BBox

**As an** operator,  
**I want** hanya menerima update kapal di area peta yang sedang saya lihat,  
**so that** dashboard tetap ringan.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Client dapat subscribe dengan `bbox`.
2. Server hanya mengirim update dalam bbox.
3. Client dapat update bbox saat peta digeser.
4. Throttling update tersedia.

#### US-052: Realtime Alert Event

**As an** operator,  
**I want** menerima alert baru secara real-time,  
**so that** saya dapat merespons kejadian penting.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Alert baru dikirim melalui channel `alerts`.
2. Payload mengikuti `07_Realtime_WebSocket_Spec.md`.
3. Alert muncul di frontend tanpa refresh halaman.

---

## 15. Epic E-07: Realtime Map Dashboard

### Objective

Menyediakan tampilan peta sebagai pusat operasi utama.

### User Stories

#### US-060: Display Vessel Markers on Map

**As an** operator,  
**I want** melihat kapal di peta,  
**so that** saya memahami situasi perairan secara cepat.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Peta menampilkan marker kapal dari latest position API.
2. Marker memiliki arah heading jika data tersedia.
3. Warna marker mengikuti status.
4. Marker update saat menerima WebSocket event.

#### US-061: Vessel Marker Popup

**As an** operator,  
**I want** klik marker kapal untuk melihat ringkasan,  
**so that** saya tidak perlu berpindah halaman untuk informasi dasar.

Priority: P0  
Estimate: 3

Acceptance Criteria:

1. Popup menampilkan nama kapal, MMSI, speed, heading, dan last update.
2. Popup memiliki tombol `Detail`, `Track`, dan `Set Alert`.
3. Popup tetap terbaca di peta gelap dan terang.

#### US-062: Map Filter Panel

**As an** operator,  
**I want** memfilter kapal berdasarkan tipe dan status,  
**so that** saya dapat fokus pada kapal relevan.

Priority: P1  
Estimate: 5

Acceptance Criteria:

1. Filter vessel type tersedia.
2. Filter status moving, idle, anchored, alert, offline tersedia.
3. Jumlah marker berubah sesuai filter.
4. Filter state dapat di-reset.

---

## 16. Epic E-08: Vessel List & Vessel Detail

### Objective

Menyediakan modul eksplorasi dan inspeksi kapal.

### User Stories

#### US-070: Vessel List Page

**As an** operator,  
**I want** membuka daftar kapal aktif,  
**so that** saya dapat mencari kapal tanpa menggunakan peta.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Daftar kapal menampilkan MMSI, name, type, status, SOG, last update.
2. Search dan filter tersedia.
3. Klik row membuka vessel detail.

#### US-071: Vessel Detail Page

**As an** analyst,  
**I want** melihat detail lengkap kapal,  
**so that** saya dapat melakukan investigasi ringan.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Menampilkan identity, current position, navigation data, status, dan recent alerts.
2. Menampilkan mini route history.
3. Menyediakan tombol playback.

---

## 17. Epic E-09: Geofence Management

### Objective

Menyediakan pembuatan dan pengelolaan geofence.

### User Stories

#### US-080: Create Polygon Geofence

**As an** admin/operator,  
**I want** menggambar polygon geofence di peta,  
**so that** sistem dapat memantau area tertentu.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. User dapat menggambar polygon di peta.
2. User dapat memberi nama geofence.
3. Geometry disimpan sebagai polygon valid.
4. Geofence muncul di map dashboard.

#### US-081: Configure Geofence Rule

**As an** admin,  
**I want** mengatur rule geofence,  
**so that** alert hanya muncul sesuai kebutuhan operasi.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Rule enter/exit tersedia.
2. Rule dwell time tersedia.
3. Rule speed limit tersedia.
4. Severity dapat dikonfigurasi.
5. Cooldown dapat dikonfigurasi.

#### US-082: Geofence Status Panel

**As an** operator,  
**I want** melihat status geofence,  
**so that** saya tahu area mana yang aman atau bermasalah.

Priority: P1  
Estimate: 5

Acceptance Criteria:

1. Panel menampilkan daftar geofence aktif.
2. Menampilkan jumlah kapal di dalam area.
3. Menampilkan jumlah alert aktif per geofence.

---

## 18. Epic E-10: Alert Engine & Alert Inbox

### Objective

Menghasilkan, mengelola, dan menyelesaikan alert operasional.

### User Stories

#### US-090: Generate Geofence Alert

**As a** system,  
**I want** membuat alert saat rule geofence terpenuhi,  
**so that** operator dapat mengambil tindakan.

Priority: P0  
Estimate: 8

Acceptance Criteria:

1. Alert dibuat untuk enter/exit/dwell/speed sesuai rule.
2. Alert memiliki severity.
3. Alert memiliki source event dan vessel reference.
4. Alert dikirim ke WebSocket.

#### US-091: Alert Inbox

**As an** operator,  
**I want** melihat daftar alert,  
**so that** saya dapat memprioritaskan tindakan.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Alert inbox menampilkan waktu, vessel, type, severity, status.
2. Alert dapat difilter berdasarkan severity, status, dan geofence.
3. Alert detail dapat dibuka.

#### US-092: Acknowledge and Resolve Alert

**As an** operator,  
**I want** acknowledge dan resolve alert,  
**so that** status penanganan tercatat.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Operator dapat acknowledge alert.
2. Operator dapat resolve alert dengan catatan.
3. Audit log tercatat.
4. Resolved alert tidak muncul sebagai active alert.

---

## 19. Epic E-11: Vessel History & Playback

### Objective

Memutar ulang perjalanan kapal dari histori posisi.

### User Stories

#### US-100: Display Track History

**As an** analyst,  
**I want** melihat rute historis kapal,  
**so that** saya dapat memahami pola perjalanan.

Priority: P1  
Estimate: 8

Acceptance Criteria:

1. User memilih vessel dan time range.
2. Sistem menampilkan polyline rute.
3. Titik awal dan akhir dibedakan.
4. Data dapat disampling agar peta tetap ringan.

#### US-101: Playback Route

**As an** analyst,  
**I want** memutar ulang pergerakan kapal,  
**so that** saya dapat melihat urutan kejadian.

Priority: P1  
Estimate: 8

Acceptance Criteria:

1. Playback memiliki play, pause, speed, dan timeline slider.
2. Marker bergerak mengikuti timestamp.
3. Alert historis dapat ditampilkan pada timeline.

---

## 20. Epic E-12: Basic Analytics & Reporting

### Objective

Menyediakan insight dasar untuk operasi dan laporan.

### User Stories

#### US-110: Dashboard KPI

**As a** manager,  
**I want** melihat KPI utama,  
**so that** saya memahami kondisi operasi secara cepat.

Priority: P1  
Estimate: 5

Acceptance Criteria:

1. Menampilkan active vessels.
2. Menampilkan vessels in port.
3. Menampilkan alerts today.
4. Menampilkan average speed.

#### US-111: Export Vessel History

**As an** analyst,  
**I want** mengekspor histori kapal,  
**so that** data dapat dianalisis di luar sistem.

Priority: P1  
Estimate: 5

Acceptance Criteria:

1. Export CSV tersedia.
2. Export GeoJSON tersedia.
3. Export dibatasi oleh permission.
4. Audit export tercatat.

---

## 21. Epic E-13: Authentication, RBAC & Audit

### Objective

Mengamankan akses sistem sesuai peran.

### User Stories

#### US-120: User Login

**As a** user,  
**I want** login secara aman,  
**so that** hanya user berwenang yang dapat mengakses sistem.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Login menggunakan email/password atau OIDC jika tersedia.
2. Session/token memiliki expiry.
3. Login gagal dicatat.
4. Password tidak pernah disimpan dalam plain text.

#### US-121: Role-Based Access Control

**As an** admin,  
**I want** mengatur role user,  
**so that** akses sesuai tanggung jawab.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Role Admin, Operator, Analyst, Viewer tersedia.
2. Endpoint dilindungi permission.
3. UI menyembunyikan aksi yang tidak berizin.

#### US-122: Audit Log

**As an** auditor/admin,  
**I want** melihat audit log,  
**so that** aktivitas penting dapat ditelusuri.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Login, create/update/delete geofence, acknowledge/resolve alert, export, dan admin action dicatat.
2. Audit log menyimpan actor, action, entity, timestamp, dan metadata.
3. Audit log read-only untuk user biasa.

---

## 22. Epic E-14: Observability, Deployment & Runbook

### Objective

Menjamin sistem bisa dipantau, dideploy, dan dioperasikan.

### User Stories

#### US-130: Application Health Endpoint

**As a** DevOps engineer,  
**I want** health endpoint,  
**so that** load balancer dan monitoring mengetahui status aplikasi.

Priority: P0  
Estimate: 2

Acceptance Criteria:

1. Endpoint `/health` tersedia.
2. Mengecek database, Redis, dan provider status.
3. Mengembalikan healthy/degraded/down.

#### US-131: Metrics Dashboard

**As an** operator teknis,  
**I want** melihat metrics sistem,  
**so that** masalah dapat dideteksi dini.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Metrics ingestion rate tersedia.
2. Metrics WebSocket clients tersedia.
3. Metrics API latency tersedia.
4. Metrics alert count tersedia.

#### US-132: Backup and Restore Test

**As a** system owner,  
**I want** backup database dapat diuji restore,  
**so that** data tidak menjadi harta karun yang terkunci di peti rusak.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Backup harian tersedia.
2. Restore diuji di staging.
3. RTO/RPO terdokumentasi.

---

## 23. Epic E-15: Testing, UAT & Release Readiness

### Objective

Menjamin MVP siap diuji user dan dirilis.

### User Stories

#### US-140: Automated API Test Suite

**As a** QA engineer,  
**I want** API test suite,  
**so that** regression dapat ditemukan sebelum rilis.

Priority: P0  
Estimate: 5

Acceptance Criteria:

1. Test untuk vessel API tersedia.
2. Test untuk geofence API tersedia.
3. Test untuk alert API tersedia.
4. Test berjalan di CI.

#### US-141: UAT Scenario Pack

**As a** Product Owner,  
**I want** skenario UAT lengkap,  
**so that** user dapat memvalidasi MVP berdasarkan proses kerja nyata.

Priority: P0  
Estimate: 3

Acceptance Criteria:

1. UAT test case tersedia.
2. UAT memiliki expected result.
3. Defect severity dan sign-off form tersedia.

---

## 24. Epic E-16: Advanced Maritime Intelligence

### Objective

Menjadi backlog pasca-MVP untuk kemampuan analitik dan intelijen maritim.

### Candidate Stories

| Story ID | Story | Priority | Notes |
|---|---|---|---|
| US-150 | Route deviation detection | P2 | Butuh baseline route |
| US-151 | ETA prediction | P2 | Butuh histori cukup |
| US-152 | Dark vessel detection | P2 | Butuh multi-source data |
| US-153 | Collision risk scoring | P2 | Butuh rule CPA/TCPA |
| US-154 | Density heatmap | P2 | Bisa masuk analytics fase 2 |
| US-155 | Multi-provider AIS fallback | P2 | Untuk reliability produksi |
| US-156 | AIS receiver local integration | P2 | Setelah MVP stabil |

---

## 25. MVP Release Backlog

### MVP Must-Have Stories

| ID | Story | Epic | Priority | Points |
|---|---|---|---|---:|
| US-001 | Repository Structure | E-01 | P0 | 3 |
| US-002 | Local Docker Compose | E-01 | P0 | 5 |
| US-003 | CI Pipeline | E-01 | P0 | 5 |
| US-010 | Configure AIS Provider Credential | E-02 | P0 | 3 |
| US-011 | AIS Polling by Area | E-02 | P0 | 8 |
| US-020 | Normalize AIS Payload | E-03 | P0 | 8 |
| US-021 | Validate AIS Position | E-03 | P0 | 5 |
| US-022 | Deduplicate AIS Message | E-03 | P0 | 5 |
| US-030 | Core Database Schema | E-04 | P0 | 8 |
| US-031 | Latest Position Upsert | E-04 | P0 | 5 |
| US-040 | Vessel List API | E-05 | P0 | 5 |
| US-041 | Vessel Detail API | E-05 | P0 | 3 |
| US-050 | WebSocket Connect/Auth | E-06 | P0 | 5 |
| US-051 | Subscribe by BBox | E-06 | P0 | 8 |
| US-052 | Realtime Alert Event | E-06 | P0 | 5 |
| US-060 | Display Vessel Markers | E-07 | P0 | 8 |
| US-061 | Vessel Marker Popup | E-07 | P0 | 3 |
| US-070 | Vessel List Page | E-08 | P0 | 5 |
| US-071 | Vessel Detail Page | E-08 | P0 | 5 |
| US-080 | Create Polygon Geofence | E-09 | P0 | 8 |
| US-081 | Configure Geofence Rule | E-09 | P0 | 8 |
| US-090 | Generate Geofence Alert | E-10 | P0 | 8 |
| US-091 | Alert Inbox | E-10 | P0 | 5 |
| US-092 | Acknowledge/Resolve Alert | E-10 | P0 | 5 |
| US-120 | User Login | E-13 | P0 | 5 |
| US-121 | RBAC | E-13 | P0 | 5 |
| US-122 | Audit Log | E-13 | P0 | 5 |
| US-130 | Health Endpoint | E-14 | P0 | 2 |
| US-131 | Metrics Dashboard | E-14 | P0 | 5 |
| US-140 | Automated API Test Suite | E-15 | P0 | 5 |
| US-141 | UAT Scenario Pack | E-15 | P0 | 3 |

Estimated MVP P0 Points: 168

---

## 26. Suggested Sprint Grouping

| Sprint | Focus | Candidate Stories |
|---|---|---|
| Sprint 0 | Foundation | US-001, US-002, US-003 |
| Sprint 1 | Database & AIS ingestion | US-010, US-011, US-020, US-021, US-030 |
| Sprint 2 | Vessel API & latest position | US-022, US-031, US-040, US-041, US-130 |
| Sprint 3 | Realtime map | US-050, US-051, US-060, US-061 |
| Sprint 4 | Vessel pages & security | US-070, US-071, US-120, US-121, US-122 |
| Sprint 5 | Geofence | US-080, US-081, US-082 |
| Sprint 6 | Alerting | US-052, US-090, US-091, US-092 |
| Sprint 7 | History, playback, UAT hardening | US-042, US-100, US-101, US-131, US-140, US-141 |

---

## 27. Backlog Refinement Rules

1. Refinement dilakukan minimal sekali per sprint.
2. Story P0 harus memiliki acceptance criteria lengkap.
3. Story yang terlalu besar dipecah menjadi story lebih kecil.
4. Dependency technical spike harus dibuat sebagai enabler story.
5. Bug critical mengalahkan feature P1/P2.
6. Setiap sprint harus memiliki kapasitas untuk bug fixing dan technical debt.

---

## 28. Traceability to Documents

| Area | Related Document |
|---|---|
| Product goals | 01_PRD.md |
| Architecture | 02_System_Architecture.md |
| Data source | 03_Data_Source_Strategy.md |
| Data model | 04_AIS_Data_Model.md |
| Database | 05_Database_ERD.md |
| API | 06_API_Specification.md |
| WebSocket | 07_Realtime_WebSocket_Spec.md |
| Geofence | 08_Geofence_Rule_Spec.md |
| Alerting | 09_Alerting_Spec.md |
| UI/UX | 10_UI_UX_Wireframe.md |
| Security | 11_Security_Model.md |
| Deployment | 12_Deployment_Plan.md |
| Testing | 13_Testing_Strategy.md |
| Roadmap | 14_Roadmap.md |
| Risk | 15_Risk_Register.md |

---

## 29. Acceptance Criteria for This Document

Dokumen ini diterima jika:

1. Semua epic MVP tercakup.
2. Story P0 memiliki acceptance criteria.
3. Prioritas dan estimasi awal tersedia.
4. Backlog dapat langsung diimpor ke project management tool.
5. Traceability ke dokumen desain tersedia.
