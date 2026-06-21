# 15_Risk_Register.md

# Risk Register
## Real Time Vessel Tracking System / VesselTrack OS

**Document Version:** 1.0  
**Date:** 2026-06-21  
**Status:** Draft for MVP Planning  
**Related Documents:**

- `01_PRD.md`
- `02_System_Architecture.md`
- `03_Data_Source_Strategy.md`
- `04_AIS_Data_Model.md`
- `05_Database_ERD.md`
- `06_API_Specification.md`
- `07_Realtime_WebSocket_Spec.md`
- `08_Geofence_Rule_Spec.md`
- `09_Alerting_Spec.md`
- `10_UI_UX_Wireframe.md`
- `11_Security_Model.md`
- `12_Deployment_Plan.md`
- `13_Testing_Strategy.md`
- `14_Roadmap.md`

---

## 1. Purpose

Dokumen ini mendefinisikan **risk register** untuk pengembangan **Real Time Vessel Tracking System / VesselTrack OS**.

Risk register digunakan untuk:

1. Mengidentifikasi risiko utama proyek sejak fase awal.
2. Memberikan rating kemungkinan dan dampak risiko.
3. Menetapkan mitigasi, contingency plan, owner, dan status.
4. Menjadi alat kontrol dalam project management, technical review, UAT, dan go-live decision.
5. Menyelaraskan risiko bisnis, teknis, data, keamanan, operasional, vendor, dan regulasi.

Dokumen ini adalah dokumen hidup. Risk register harus diperbarui setiap sprint, setiap perubahan arsitektur besar, setiap pergantian data provider, dan sebelum release production.

---

## 2. Risk Management Scope

Scope risiko mencakup:

| Area | Description |
|---|---|
| Product | Scope, fitur, UX, backlog, adoption |
| Data | AIS data quality, latency, coverage, schema, missing data |
| Vendor | AIS provider, map provider, cloud provider, API license |
| Technical | Architecture, database, WebSocket, geospatial engine, scalability |
| Security | Authentication, authorization, API key, data leakage, attack surface |
| Operations | Monitoring, alert fatigue, incident response, support model |
| Deployment | CI/CD, rollback, migration, environment parity |
| Performance | Map rendering, high-frequency update, database query load |
| Legal & Compliance | Data licensing, privacy, data retention, third-party usage terms |
| Cost | AIS API cost, cloud cost, storage growth, traffic volume |
| People | Skill gap, team capacity, knowledge transfer |
| Delivery | Timeline, dependency, acceptance criteria, UAT readiness |

---

## 3. Risk Rating Method

### 3.1 Probability Scale

| Score | Probability | Meaning |
|---:|---|---|
| 1 | Rare | Sangat kecil kemungkinan terjadi |
| 2 | Unlikely | Bisa terjadi, tetapi tidak umum |
| 3 | Possible | Mungkin terjadi dalam kondisi normal proyek |
| 4 | Likely | Cukup besar kemungkinan terjadi |
| 5 | Almost Certain | Hampir pasti terjadi bila tidak dikontrol |

### 3.2 Impact Scale

| Score | Impact | Meaning |
|---:|---|---|
| 1 | Low | Dampak kecil, mudah ditangani |
| 2 | Minor | Ada gangguan kecil terhadap delivery atau operasi |
| 3 | Moderate | Mengganggu timeline, kualitas, atau biaya |
| 4 | Major | Mengancam MVP, go-live, keamanan, atau kepercayaan pengguna |
| 5 | Critical | Menghentikan proyek, menyebabkan insiden besar, atau risiko legal serius |

### 3.3 Risk Score

```text
Risk Score = Probability x Impact
```

| Score Range | Rating | Priority |
|---:|---|---|
| 1-4 | Low | Monitor |
| 5-9 | Medium | Mitigate |
| 10-16 | High | Actively Manage |
| 17-25 | Critical | Immediate Executive Attention |

---

## 4. Risk Status

| Status | Meaning |
|---|---|
| Open | Risiko masih aktif dan belum selesai dimitigasi |
| Mitigating | Mitigasi sedang berjalan |
| Monitoring | Risiko dikontrol dan dipantau |
| Closed | Risiko sudah tidak relevan atau sudah selesai ditangani |
| Escalated | Risiko perlu keputusan sponsor/steering committee |

---

## 5. Risk Ownership Model

| Role | Responsibility |
|---|---|
| Product Owner | Scope, business priority, stakeholder acceptance |
| Project Manager | Risk register, timeline, dependency, escalation |
| Tech Lead | Architecture, code quality, scalability, design decision |
| Data Engineer | AIS ingestion, data quality, schema, provider integration |
| Backend Engineer | API, WebSocket, geofence, alert engine |
| Frontend Engineer | Dashboard, map UX, performance, interaction |
| DevOps Engineer | CI/CD, deployment, monitoring, backup, rollback |
| Security Lead | Auth, RBAC, secrets, audit, vulnerability management |
| QA Lead | Test strategy, regression, UAT, release readiness |
| Legal/Procurement | Vendor license, contract, compliance |
| Operations Lead | Monitoring, SOP, support, incident response |

---

## 6. Executive Risk Summary

### 6.1 Top Risks for MVP

| Rank | Risk ID | Risk | Rating | Primary Owner |
|---:|---|---|---|---|
| 1 | R-DATA-001 | AIS provider data latency or coverage tidak memenuhi kebutuhan real-time | High | Data Engineer |
| 2 | R-VENDOR-001 | Ketergantungan pada satu AIS API provider | High | Product Owner / Data Engineer |
| 3 | R-PERF-001 | Map dashboard lambat saat banyak vessel marker | High | Frontend Engineer |
| 4 | R-GEO-001 | False geofence alert karena noise AIS atau GPS jump | High | Backend Engineer / Data Engineer |
| 5 | R-SEC-001 | API key AIS provider bocor atau disalahgunakan | High | Security Lead |
| 6 | R-COST-001 | Biaya AIS API dan cloud meningkat karena polling dan histori data | High | Project Manager / DevOps |
| 7 | R-OPS-001 | Alert fatigue karena terlalu banyak notifikasi tidak relevan | High | Product Owner / Operations Lead |
| 8 | R-DEL-001 | Scope MVP melebar menjadi terlalu banyak fitur | High | Product Owner |

### 6.2 Immediate Controls Required Before MVP Build

1. Pilih satu area monitoring terbatas.
2. Tetapkan SLA minimum data provider.
3. Implementasikan data quality scoring sejak awal.
4. Terapkan bounding box filtering pada API dan WebSocket.
5. Gunakan role-based access control sejak MVP.
6. Buat cost limit dan monitoring API usage.
7. Terapkan alert cooldown dan deduplication.
8. Finalisasi acceptance criteria per modul sebelum sprint development.

---

## 7. Detailed Risk Register

## 7.1 Product & Scope Risks

| Field | Detail |
|---|---|
| Risk ID | R-PROD-001 |
| Risk Name | Scope MVP terlalu luas |
| Description | MVP berkembang terlalu banyak fitur seperti analytics lanjutan, multi-provider, AI anomaly detection, dan AIS receiver lokal sebelum real-time map stabil. |
| Category | Product / Delivery |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Banyak permintaan fitur tambahan masuk sebelum MVP selesai. |
| Impact Detail | Timeline molor, kualitas turun, tim kehilangan fokus, MVP gagal selesai. |
| Mitigation | Tetapkan MVP minimal: AIS API ingestion, realtime map, vessel detail, history, geofence sederhana, alert dasar. Gunakan backlog parking lot untuk fitur lanjutan. |
| Contingency | Freeze scope selama sprint berjalan. Tunda fitur non-MVP ke release berikutnya. |
| Owner | Product Owner |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-PROD-002 |
| Risk Name | Kebutuhan stakeholder tidak seragam |
| Description | Operator, manajemen, analyst, dan admin memiliki ekspektasi berbeda terhadap dashboard dan alert. |
| Category | Product / Stakeholder |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | Feedback UAT saling bertentangan. |
| Impact Detail | Rework UI/UX dan rule alert. |
| Mitigation | Definisikan persona dan prioritas use case dalam PRD. Lakukan demo per sprint. |
| Contingency | Gunakan role-specific dashboard di backlog. Prioritaskan operator untuk MVP. |
| Owner | Product Owner |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-PROD-003 |
| Risk Name | Acceptance criteria tidak jelas |
| Description | Fitur dianggap selesai oleh developer tetapi belum memenuhi kebutuhan operasional. |
| Category | Product / QA |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | UAT banyak reject karena definisi done tidak spesifik. |
| Impact Detail | Rework, delay, konflik antara tim bisnis dan teknis. |
| Mitigation | Gunakan acceptance criteria di setiap dokumen spesifikasi. Buat traceability matrix dari PRD ke test case. |
| Contingency | Re-baseline backlog dan jalankan UAT ulang untuk fitur prioritas. |
| Owner | QA Lead / Product Owner |
| Status | Open |

---

## 7.2 Data Source & AIS Risks

| Field | Detail |
|---|---|
| Risk ID | R-DATA-001 |
| Risk Name | Latency data AIS provider terlalu tinggi |
| Description | Data posisi kapal dari provider datang terlambat sehingga dashboard tidak terasa real-time. |
| Category | Data Source |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Delay rata-rata > 60 detik untuk area monitoring utama. |
| Impact Detail | Operator tidak percaya dashboard. Alert terlambat. Playback masih berguna, tetapi monitoring real-time melemah. |
| Mitigation | Uji provider sejak awal. Catat `source_timestamp`, `received_at`, dan `latency_seconds`. Pilih SLA minimal untuk MVP. |
| Contingency | Kurangi klaim menjadi near-real-time. Tambahkan provider kedua atau receiver lokal untuk area kritikal. |
| Owner | Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DATA-002 |
| Risk Name | Coverage AIS tidak lengkap |
| Description | Tidak semua kapal di area monitoring muncul karena gap terrestrial/satellite AIS atau data provider. |
| Category | Data Source |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Kapal fisik diketahui ada, tetapi tidak muncul di dashboard. |
| Impact Detail | Kepercayaan pengguna turun, analitik tidak lengkap, alert tidak jalan. |
| Mitigation | Definisikan coverage expectation. Buat status `out_of_coverage`, `ais_silence`, dan quality indicator. |
| Contingency | Tambahkan AIS receiver lokal atau provider alternatif untuk area prioritas. |
| Owner | Data Engineer / Product Owner |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DATA-003 |
| Risk Name | Data AIS duplikat |
| Description | Provider atau receiver mengirim posisi yang sama berkali-kali. |
| Category | Data Quality |
| Probability | 4 |
| Impact | 3 |
| Score | 12 |
| Rating | High |
| Trigger | Banyak record dengan MMSI, timestamp, latitude, longitude yang sama. |
| Impact Detail | Database membengkak, playback tidak halus, KPI bias. |
| Mitigation | Deduplication berdasarkan `mmsi`, `source_timestamp`, `lat`, `lon`, `source_provider`. Gunakan unique index atau idempotency key. |
| Contingency | Jalankan cleanup job dan compaction histori. |
| Owner | Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DATA-004 |
| Risk Name | Posisi kapal meloncat tidak realistis |
| Description | AIS position jump membuat kapal tampak berpindah ratusan kilometer dalam waktu singkat. |
| Category | Data Quality / Geospatial |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Speed implied dari dua titik melebihi batas wajar. |
| Impact Detail | Route playback rusak, geofence false positive, analitik rute salah. |
| Mitigation | Implementasikan validation rules: coordinate bounds, max speed, max distance jump, timestamp sanity. Tandai record dengan `quality_score`. |
| Contingency | Exclude low-quality points dari alert dan analytics. Simpan tetap sebagai raw/audit. |
| Owner | Data Engineer / Backend Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DATA-005 |
| Risk Name | Schema provider berubah |
| Description | AIS API provider mengubah field, format, atau endpoint sehingga ingestion gagal. |
| Category | Vendor / Data Integration |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Parser error meningkat setelah provider update. |
| Impact Detail | Data berhenti masuk, dashboard stale, alert tidak berjalan. |
| Mitigation | Gunakan provider adapter layer. Simpan raw payload. Buat contract test dan schema validation. |
| Contingency | Rollback adapter, fallback ke mock/provider kedua, aktifkan degraded mode. |
| Owner | Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DATA-006 |
| Risk Name | MMSI tidak unik atau identitas kapal tidak lengkap |
| Description | Data vessel master tidak lengkap, nama kapal kosong, atau MMSI reused/spoofed. |
| Category | Data Quality |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | Banyak vessel muncul sebagai unknown vessel. |
| Impact Detail | Search dan reporting tidak optimal. Operator sulit identifikasi kapal. |
| Mitigation | Gunakan enrichment table `vessels`; update dari provider saat static data tersedia. |
| Contingency | Tampilkan fallback: MMSI sebagai primary label. |
| Owner | Data Engineer |
| Status | Open |

---

## 7.3 Vendor & Licensing Risks

| Field | Detail |
|---|---|
| Risk ID | R-VENDOR-001 |
| Risk Name | Ketergantungan pada satu AIS provider |
| Description | MVP memakai satu AIS API provider sehingga outage, kenaikan harga, atau perubahan lisensi berdampak langsung. |
| Category | Vendor |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Provider downtime, API limit, price increase, atau kontrak berubah. |
| Impact Detail | Sistem kehilangan data utama. Biaya bisa melonjak. |
| Mitigation | Buat data source abstraction layer sejak awal. Hindari business logic menempel langsung ke format vendor. |
| Contingency | Siapkan evaluation provider kedua. Tambahkan AIS receiver lokal untuk area prioritas. |
| Owner | Product Owner / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-VENDOR-002 |
| Risk Name | Batas rate limit provider mengganggu real-time update |
| Description | Polling terlalu sering atau query area terlalu luas melampaui kuota API. |
| Category | Vendor / Cost |
| Probability | 4 |
| Impact | 3 |
| Score | 12 |
| Rating | High |
| Trigger | HTTP 429, quota exceeded, atau biaya usage meningkat. |
| Impact Detail | Data delay, biaya naik, ingestion throttled. |
| Mitigation | Gunakan bbox filtering, polling interval adaptif, caching, dan usage monitor. |
| Contingency | Kurangi refresh rate, batasi area, upgrade plan, atau gunakan provider alternatif. |
| Owner | Data Engineer / DevOps Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-VENDOR-003 |
| Risk Name | Lisensi data tidak memperbolehkan redistribusi |
| Description | Terms of service provider AIS atau map tile membatasi penyimpanan, redistribusi, atau penggunaan komersial. |
| Category | Legal / Vendor |
| Probability | 3 |
| Impact | 5 |
| Score | 15 |
| Rating | High |
| Trigger | Review legal menemukan pembatasan penggunaan data. |
| Impact Detail | Fitur export, sharing, atau commercial use harus dibatasi. |
| Mitigation | Legal/procurement review sebelum kontrak. Dokumentasikan allowed usage. |
| Contingency | Ganti provider atau ubah fitur agar comply. |
| Owner | Legal/Procurement |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-VENDOR-004 |
| Risk Name | Map tile provider cost atau restriction |
| Description | Penggunaan peta intensif menyebabkan biaya tile tinggi atau melanggar ketentuan. |
| Category | Vendor / Cost |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | Banyak pengguna membuka dashboard peta bersamaan. |
| Impact Detail | Biaya meningkat dan performa peta turun. |
| Mitigation | Gunakan MapLibre dengan provider tile yang jelas lisensinya. Cache tile bila diperbolehkan. |
| Contingency | Switch ke self-hosted tiles atau provider enterprise. |
| Owner | Frontend Engineer / DevOps Engineer |
| Status | Open |

---

## 7.4 Architecture & Technical Risks

| Field | Detail |
|---|---|
| Risk ID | R-TECH-001 |
| Risk Name | Arsitektur MVP terlalu kompleks |
| Description | Tim langsung membangun Kafka, Kubernetes, multi-provider, dan analytics berat sebelum kebutuhan MVP valid. |
| Category | Architecture |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Setup infra memakan waktu lebih besar daripada fitur pengguna. |
| Impact Detail | Delivery terlambat dan biaya development naik. |
| Mitigation | Gunakan arsitektur MVP sederhana: API provider, ingestion service, PostgreSQL/PostGIS/TimescaleDB, Redis, WebSocket, Next.js. |
| Contingency | De-scope komponen advanced ke production hardening. |
| Owner | Tech Lead |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-TECH-002 |
| Risk Name | Data model tidak siap untuk histori besar |
| Description | Tabel posisi kapal tumbuh cepat dan query history menjadi lambat. |
| Category | Database / Scalability |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Query history > 3 detik untuk rentang waktu umum. |
| Impact Detail | Playback lambat, database bengkak, biaya storage naik. |
| Mitigation | Gunakan TimescaleDB hypertable, index `mmsi + timestamp`, retention policy, compression, dan downsampling untuk analytics. |
| Contingency | Archive data lama ke object storage. Batasi query range. |
| Owner | Backend Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-TECH-003 |
| Risk Name | WebSocket gateway overload |
| Description | Terlalu banyak update vessel dikirim ke semua client tanpa filtering. |
| Category | Realtime / Scalability |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | CPU/memory WebSocket naik, browser lag, network egress tinggi. |
| Impact Detail | Dashboard tidak real-time dan tidak stabil. |
| Mitigation | Gunakan bbox subscription, vessel-specific subscription, throttling, delta update, heartbeat, dan backpressure. |
| Contingency | Kurangi update frequency, aktifkan server-side aggregation, scale horizontal gateway. |
| Owner | Backend Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-TECH-004 |
| Risk Name | Geospatial query lambat |
| Description | Query `ST_Contains`, `ST_Intersects`, atau bbox filtering lambat karena index tidak optimal. |
| Category | Database / Geospatial |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Geofence evaluation delay meningkat saat vessel aktif banyak. |
| Impact Detail | Alert terlambat dan database terbebani. |
| Mitigation | Gunakan GiST index, geometry SRID 4326, simplify polygon, prefilter bbox, dan batch evaluation. |
| Contingency | Cache geofence polygon di memory dan evaluasi di service layer. |
| Owner | Backend Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-TECH-005 |
| Risk Name | Tidak ada observability sejak awal |
| Description | Sistem sulit didiagnosis saat data tidak masuk, alert terlambat, atau WebSocket disconnect. |
| Category | Operations / Technical |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Incident terjadi tetapi root cause tidak jelas. |
| Impact Detail | Downtime lebih lama, debugging seperti mencari pelampung di malam berkabut. |
| Mitigation | Implementasikan structured logging, metrics, health check, tracing minimal, dan dashboard monitoring sejak MVP. |
| Contingency | Tambahkan emergency diagnostic endpoints dan log sampling. |
| Owner | DevOps Engineer / Tech Lead |
| Status | Open |

---

## 7.5 Geofence & Alert Risks

| Field | Detail |
|---|---|
| Risk ID | R-GEO-001 |
| Risk Name | False positive geofence alert |
| Description | Noise AIS, GPS jump, atau polygon boundary membuat kapal dianggap masuk/keluar area padahal tidak. |
| Category | Geofence / Alert |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Banyak alert enter/exit berulang di boundary. |
| Impact Detail | Operator kehilangan kepercayaan, alert fatigue. |
| Mitigation | Gunakan hysteresis, dwell threshold, quality score, boundary buffer, dan cooldown. |
| Contingency | Turunkan severity alert boundary sampai rule disesuaikan. |
| Owner | Backend Engineer / Operations Lead |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-GEO-002 |
| Risk Name | False negative geofence alert |
| Description | Kapal benar-benar masuk area, tetapi tidak terdeteksi karena data delay, missing point, atau polling interval terlalu panjang. |
| Category | Geofence / Alert |
| Probability | 3 |
| Impact | 5 |
| Score | 15 |
| Rating | High |
| Trigger | Event lapangan tidak muncul di alert panel. |
| Impact Detail | Risiko operasional serius, especially untuk area terlarang atau keselamatan. |
| Mitigation | Gunakan line crossing antara titik sebelumnya dan titik baru, bukan hanya point-in-polygon terbaru. |
| Contingency | Tambah receiver lokal/provider lebih cepat untuk area kritikal. |
| Owner | Backend Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-OPS-001 |
| Risk Name | Alert fatigue |
| Description | Terlalu banyak alert tidak prioritas muncul sehingga operator mengabaikan alert penting. |
| Category | Operations / Alerting |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Alert feed penuh event minor dan duplicate. |
| Impact Detail | Alert kritikal bisa terlewat. |
| Mitigation | Implementasikan severity, deduplication, cooldown, acknowledgement, mute/snooze, dan escalation policy. |
| Contingency | Batasi rule aktif pada MVP hanya rule paling penting. |
| Owner | Product Owner / Operations Lead |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-ALERT-002 |
| Risk Name | Notifikasi eksternal gagal terkirim |
| Description | Email, Telegram, atau WhatsApp gateway gagal sehingga alert tidak sampai ke operator. |
| Category | Alerting / Integration |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Delivery failure rate tinggi. |
| Impact Detail | Alert hanya muncul di dashboard, tidak menjangkau personel lapangan. |
| Mitigation | Gunakan retry, delivery status, fallback channel, dan alert audit. |
| Contingency | Aktifkan manual escalation SOP. |
| Owner | Backend Engineer / Operations Lead |
| Status | Open |

---

## 7.6 Frontend & UX Risks

| Field | Detail |
|---|---|
| Risk ID | R-PERF-001 |
| Risk Name | Map dashboard lambat saat marker banyak |
| Description | Banyak vessel marker, route trail, geofence polygon, dan WebSocket update membuat browser berat. |
| Category | Frontend / Performance |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | FPS turun, interaksi peta lag, memory browser tinggi. |
| Impact Detail | Operator sulit memantau kapal secara real-time. |
| Mitigation | Gunakan clustering, viewport filtering, marker virtualization, simplified geometry, dan update throttling. |
| Contingency | Batasi jumlah vessel default berdasarkan area dan zoom level. |
| Owner | Frontend Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-UX-001 |
| Risk Name | UI terlalu kompleks untuk operator |
| Description | Terlalu banyak panel, filter, dan data teknis membuat operator lambat mengambil keputusan. |
| Category | UX |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | UAT menunjukkan operator bingung mencari alert atau vessel detail. |
| Impact Detail | Adoption rendah dan perlu training tambahan. |
| Mitigation | Prioritaskan dashboard operasional: map, search, alert, vessel detail. Gunakan progressive disclosure. |
| Contingency | Buat mode simple/operator view. |
| Owner | Product Owner / Frontend Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-UX-002 |
| Risk Name | Status kapal tidak mudah dipahami |
| Description | Warna, ikon, dan label status tidak konsisten sehingga operator salah menafsirkan moving, idle, alert, stale, atau silence. |
| Category | UX / Safety |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | UAT menunjukkan interpretasi status berbeda antar pengguna. |
| Impact Detail | Keputusan operasional bisa salah. |
| Mitigation | Buat design system status, legend peta, tooltip, dan dokumentasi status. |
| Contingency | Simplify status ke 4 kategori MVP: Moving, Idle, Alert, Offline. |
| Owner | Frontend Engineer / Product Owner |
| Status | Open |

---

## 7.7 Security Risks

| Field | Detail |
|---|---|
| Risk ID | R-SEC-001 |
| Risk Name | AIS provider API key bocor |
| Description | API key provider disimpan di frontend, log, repository, atau environment tidak aman. |
| Category | Security / Vendor |
| Probability | 3 |
| Impact | 5 |
| Score | 15 |
| Rating | High |
| Trigger | API usage abnormal atau key ditemukan di repo/log. |
| Impact Detail | Biaya provider membengkak, data disalahgunakan, kontrak dilanggar. |
| Mitigation | Simpan key di secrets manager/env backend saja. Jangan expose ke frontend. Audit log dan rotate key. |
| Contingency | Revoke dan rotate key segera. Investigasi log dan akses. |
| Owner | Security Lead / DevOps Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-SEC-002 |
| Risk Name | Unauthorized access ke dashboard |
| Description | Pengguna tanpa otorisasi melihat lokasi kapal, alert, atau histori. |
| Category | Security / Access Control |
| Probability | 3 |
| Impact | 5 |
| Score | 15 |
| Rating | High |
| Trigger | Endpoint bisa diakses tanpa token valid atau role check tidak konsisten. |
| Impact Detail | Data operasional sensitif bocor. |
| Mitigation | Authentication wajib, RBAC, route guard frontend dan backend, token expiry, audit log. |
| Contingency | Disable account/session, audit access, patch endpoint. |
| Owner | Security Lead / Backend Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-SEC-003 |
| Risk Name | WebSocket tidak aman |
| Description | Client bisa subscribe area/vessel tanpa izin atau token expired tetap aktif. |
| Category | Security / Realtime |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | WebSocket connection tidak memvalidasi scope/role. |
| Impact Detail | Data real-time tersebar ke client tidak berwenang. |
| Mitigation | Validasi token saat connect dan subscribe. Terapkan scope check per channel/bbox. Disconnect token expired. |
| Contingency | Disable WebSocket sementara dan fallback polling REST. |
| Owner | Backend Engineer / Security Lead |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-SEC-004 |
| Risk Name | Injection pada API/filter/query |
| Description | Parameter search, bbox, mmsi, atau filter tidak divalidasi sehingga membuka risiko injection atau query abuse. |
| Category | Security / API |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Input tidak tervalidasi atau query raw SQL. |
| Impact Detail | Data leakage, database overload, exploit. |
| Mitigation | Validate DTO, parameterized query, rate limit, max bbox area, max date range. |
| Contingency | Patch endpoint, block IP/token abusive, rotate credentials jika perlu. |
| Owner | Backend Engineer / Security Lead |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-SEC-005 |
| Risk Name | Audit trail tidak lengkap |
| Description | Perubahan geofence, alert acknowledgement, login, export, dan admin action tidak terekam. |
| Category | Security / Governance |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | Tidak ada audit log untuk action kritikal. |
| Impact Detail | Sulit investigasi insiden dan accountability lemah. |
| Mitigation | Audit log wajib untuk action sensitif. Simpan actor, timestamp, action, resource, before/after bila relevan. |
| Contingency | Tambahkan audit pada modul prioritas dan lakukan retrospective. |
| Owner | Security Lead / Backend Engineer |
| Status | Open |

---

## 7.8 Deployment & Operations Risks

| Field | Detail |
|---|---|
| Risk ID | R-DEPLOY-001 |
| Risk Name | Environment dev/staging/production tidak konsisten |
| Description | Konfigurasi dan versi dependency berbeda antar environment sehingga bug muncul di production. |
| Category | Deployment |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Release staging sukses tetapi production gagal. |
| Impact Detail | Downtime atau rollback. |
| Mitigation | Dockerize service, gunakan IaC/compose, env template, dan version pinning. |
| Contingency | Rollback ke image sebelumnya. Freeze release sampai parity diperbaiki. |
| Owner | DevOps Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DEPLOY-002 |
| Risk Name | Database migration merusak data |
| Description | Perubahan schema menyebabkan data hilang, constraint error, atau downtime panjang. |
| Category | Deployment / Database |
| Probability | 3 |
| Impact | 5 |
| Score | 15 |
| Rating | High |
| Trigger | Migration gagal saat release. |
| Impact Detail | Data posisi/histori rusak, rollback sulit. |
| Mitigation | Migration versioned, backup sebelum migration, test migration di staging dengan data realistis. |
| Contingency | Restore backup dan rollback app version. |
| Owner | DevOps Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DEPLOY-003 |
| Risk Name | Tidak ada rollback plan |
| Description | Release gagal tetapi tim tidak punya cara cepat kembali ke versi stabil. |
| Category | Deployment |
| Probability | 2 |
| Impact | 5 |
| Score | 10 |
| Rating | High |
| Trigger | Production incident setelah deploy. |
| Impact Detail | Downtime lebih lama dan kepercayaan pengguna turun. |
| Mitigation | Setiap release wajib punya rollback plan, image tag, database backup, dan release note. |
| Contingency | Manual recovery sesuai runbook incident. |
| Owner | DevOps Engineer / Project Manager |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-OPS-002 |
| Risk Name | Monitoring tidak mencakup data pipeline |
| Description | Service terlihat hidup, tetapi data AIS tidak masuk atau stale. |
| Category | Operations / Data Pipeline |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Health check aplikasi hijau tetapi peta tidak update. |
| Impact Detail | False confidence. Operator melihat data basi. |
| Mitigation | Monitor freshness: `last_ingested_at`, `latest_position_age`, `provider_error_rate`, `queue_lag`. |
| Contingency | Alert ops saat data stale, tampilkan banner degraded mode di dashboard. |
| Owner | DevOps Engineer / Data Engineer |
| Status | Open |

---

## 7.9 Performance & Scalability Risks

| Field | Detail |
|---|---|
| Risk ID | R-PERF-002 |
| Risk Name | Query history/playback lambat |
| Description | Playback untuk kapal dengan data banyak menjadi lambat karena query range besar. |
| Category | Performance / Database |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Playback load > 5 detik untuk rentang 24 jam. |
| Impact Detail | Fitur histori sulit dipakai. |
| Mitigation | Index `mmsi,timestamp`, pagination/time slicing, simplify route, downsampling. |
| Contingency | Batasi maksimal range query MVP dan tambahkan async export. |
| Owner | Backend Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-PERF-003 |
| Risk Name | Storage growth tidak terkendali |
| Description | Posisi kapal real-time menghasilkan data time-series besar. |
| Category | Cost / Database |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Storage tumbuh > estimasi bulanan. |
| Impact Detail | Biaya meningkat dan backup melambat. |
| Mitigation | Retention policy, compression, raw archive, downsampled aggregate, capacity monitoring. |
| Contingency | Purge data non-prioritas sesuai policy dan archive ke object storage. |
| Owner | DevOps Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-PERF-004 |
| Risk Name | API tidak tahan concurrent users |
| Description | Banyak operator membuka dashboard bersamaan dan API list/latest vessel menjadi bottleneck. |
| Category | Performance / Backend |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | P95 API latency tinggi saat concurrent session meningkat. |
| Impact Detail | Dashboard lambat dan WebSocket reconnect meningkat. |
| Mitigation | Cache latest positions di Redis, pagination, bbox query, load test. |
| Contingency | Scale backend horizontal dan tambah CDN/static optimization. |
| Owner | Backend Engineer / DevOps Engineer |
| Status | Open |

---

## 7.10 Testing & Quality Risks

| Field | Detail |
|---|---|
| Risk ID | R-QA-001 |
| Risk Name | Test data tidak realistis |
| Description | Testing hanya memakai data kecil atau statis sehingga masalah latency, duplicate, jump, dan high-load tidak terlihat. |
| Category | QA / Data |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Production behavior berbeda jauh dari test environment. |
| Impact Detail | Bug muncul saat go-live. |
| Mitigation | Gunakan synthetic AIS stream, replay dataset, edge cases geofence, dan data volume realistis. |
| Contingency | Jalankan soak test dan hotfix berdasarkan production logs. |
| Owner | QA Lead / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-QA-002 |
| Risk Name | WebSocket tidak diuji untuk reconnect dan network instability |
| Description | Client gagal reconnect atau kehilangan subscription saat koneksi operator tidak stabil. |
| Category | QA / Realtime |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Dashboard berhenti update tanpa pesan error. |
| Impact Detail | Operator melihat data stale tanpa sadar. |
| Mitigation | Test reconnect, heartbeat timeout, resubscribe, stale data banner. |
| Contingency | Fallback REST polling untuk latest positions. |
| Owner | QA Lead / Frontend Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-QA-003 |
| Risk Name | Geofence rules tidak cukup diuji di boundary |
| Description | Rule enter/exit/dwell tidak diuji dengan data dekat garis polygon. |
| Category | QA / Geospatial |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Banyak alert salah di area boundary setelah UAT. |
| Impact Detail | Rework rule engine dan UX alert. |
| Mitigation | Buat test case boundary, crossing line, dwell, missing point, GPS jump. |
| Contingency | Disable rule yang tidak stabil sampai diperbaiki. |
| Owner | QA Lead / Backend Engineer |
| Status | Open |

---

## 7.11 Cost & Financial Risks

| Field | Detail |
|---|---|
| Risk ID | R-COST-001 |
| Risk Name | Biaya AIS API meningkat |
| Description | Polling frequency, area coverage, vessel count, atau historical query menyebabkan biaya provider melebihi anggaran. |
| Category | Cost / Vendor |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | API usage > 80% kuota bulanan atau tagihan naik signifikan. |
| Impact Detail | MVP menjadi mahal untuk dioperasikan. |
| Mitigation | Monitor usage, batasi bbox, atur polling interval, cache, dan budget alert. |
| Contingency | Kurangi refresh rate atau scope area. Negosiasi plan provider. |
| Owner | Project Manager / Product Owner |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-COST-002 |
| Risk Name | Biaya database/storage meningkat |
| Description | Posisi real-time, raw logs, dan audit log menghasilkan storage besar. |
| Category | Cost / Infrastructure |
| Probability | 4 |
| Impact | 3 |
| Score | 12 |
| Rating | High |
| Trigger | Storage tumbuh tanpa retention. |
| Impact Detail | Tagihan cloud naik dan backup makin berat. |
| Mitigation | Retention, compression, archive, aggregate tables, dan storage dashboard. |
| Contingency | Purge data sesuai kebijakan retensi. |
| Owner | DevOps Engineer / Data Engineer |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-COST-003 |
| Risk Name | Overengineering meningkatkan biaya awal |
| Description | Infrastruktur production-grade terlalu cepat diterapkan untuk MVP. |
| Category | Cost / Architecture |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | Banyak komponen cloud aktif tetapi user belum banyak. |
| Impact Detail | Burn rate naik sebelum value terbukti. |
| Mitigation | Gunakan staged architecture dan cost review per fase roadmap. |
| Contingency | Decommission komponen non-MVP. |
| Owner | Tech Lead / Project Manager |
| Status | Open |

---

## 7.12 Legal, Compliance & Governance Risks

| Field | Detail |
|---|---|
| Risk ID | R-LEGAL-001 |
| Risk Name | Pelanggaran terms of service data provider |
| Description | Data AIS disimpan, diekspor, atau dibagikan dengan cara yang tidak sesuai kontrak. |
| Category | Legal / Compliance |
| Probability | 3 |
| Impact | 5 |
| Score | 15 |
| Rating | High |
| Trigger | Fitur export/reporting memakai data provider tanpa izin redistribusi. |
| Impact Detail | Kontrak dihentikan, denda, atau risiko hukum. |
| Mitigation | Review ToS provider. Dokumentasikan allowed usage dan data retention. Batasi export jika perlu. |
| Contingency | Disable fitur yang melanggar dan pilih provider dengan lisensi sesuai. |
| Owner | Legal/Procurement / Product Owner |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-LEGAL-002 |
| Risk Name | Data operasional sensitif tidak diklasifikasikan |
| Description | Lokasi kapal, route, dan alert bisa dianggap sensitif tergantung konteks bisnis/operasional. |
| Category | Governance / Security |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Semua user bisa export atau melihat seluruh area. |
| Impact Detail | Kebocoran informasi operasional. |
| Mitigation | Data classification, RBAC, export permission, audit log. |
| Contingency | Batasi akses berdasarkan role dan area. |
| Owner | Security Lead / Product Owner |
| Status | Open |

---

## 7.13 People & Delivery Risks

| Field | Detail |
|---|---|
| Risk ID | R-PEOPLE-001 |
| Risk Name | Skill gap pada geospatial dan real-time system |
| Description | Tim belum familiar dengan PostGIS, TimescaleDB, WebSocket scaling, atau AIS domain. |
| Category | People / Capability |
| Probability | 3 |
| Impact | 4 |
| Score | 12 |
| Rating | High |
| Trigger | Banyak defect di geofence, query spasial, atau realtime update. |
| Impact Detail | Delivery lebih lambat dan kualitas teknis turun. |
| Mitigation | Buat technical spike, pairing, code review, dan dokumentasi ADR. |
| Contingency | Libatkan advisor GIS/backend untuk review arsitektur. |
| Owner | Tech Lead / Project Manager |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-PEOPLE-002 |
| Risk Name | Ketergantungan pada satu developer kunci |
| Description | Pengetahuan sistem hanya ada pada satu orang sehingga delivery rentan. |
| Category | People / Delivery |
| Probability | 3 |
| Impact | 3 |
| Score | 9 |
| Rating | Medium |
| Trigger | Developer kunci tidak tersedia dan task berhenti. |
| Impact Detail | Bottleneck dan delay. |
| Mitigation | Dokumentasi teknis, code review, pair programming, issue tracker. |
| Contingency | Reassign task dan lakukan knowledge transfer cepat. |
| Owner | Project Manager / Tech Lead |
| Status | Open |

---

| Field | Detail |
|---|---|
| Risk ID | R-DEL-001 |
| Risk Name | Timeline MVP tidak realistis |
| Description | Estimasi terlalu optimistis terhadap integrasi data provider, peta, WebSocket, geofence, dan testing. |
| Category | Delivery |
| Probability | 4 |
| Impact | 4 |
| Score | 16 |
| Rating | High |
| Trigger | Sprint pertama banyak carry-over task. |
| Impact Detail | Roadmap bergeser dan stakeholder kecewa. |
| Mitigation | Buat milestone kecil, buffer teknis, dan release incremental. |
| Contingency | Prioritaskan realtime map dan vessel detail, tunda analytics/playback advanced. |
| Owner | Project Manager |
| Status | Open |

---

## 8. Risk Heatmap

### 8.1 Heatmap Matrix

| Impact \ Probability | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost Certain |
|---|---|---|---|---|---|
| 5 Critical | Medium | High | High | Critical | Critical |
| 4 Major | Medium | Medium | High | High | Critical |
| 3 Moderate | Low | Medium | Medium | High | High |
| 2 Minor | Low | Low | Medium | Medium | High |
| 1 Low | Low | Low | Low | Medium | Medium |

### 8.2 Highest Priority Risks

| Risk ID | Score | Rating | Required Action |
|---|---:|---|---|
| R-DATA-001 | 16 | High | Provider latency test before MVP sprint |
| R-DATA-002 | 16 | High | Coverage validation and data freshness indicator |
| R-VENDOR-001 | 16 | High | Data source abstraction and second provider evaluation |
| R-TECH-002 | 16 | High | TimescaleDB hypertable and retention strategy |
| R-TECH-003 | 16 | High | WebSocket bbox filtering and throttling |
| R-GEO-001 | 16 | High | Hysteresis, cooldown, and quality score gate |
| R-OPS-001 | 16 | High | Alert severity, deduplication, and acknowledgement |
| R-PERF-001 | 16 | High | Map clustering and viewport filtering |
| R-PERF-003 | 16 | High | Storage retention and compression |
| R-QA-001 | 16 | High | Realistic AIS replay test data |
| R-COST-001 | 16 | High | API usage budget guardrail |
| R-DEL-001 | 16 | High | MVP scope control and milestone gate |

---

## 9. Risk Response Strategy

### 9.1 Avoid

Digunakan bila risiko terlalu besar dan fitur belum wajib untuk MVP.

Examples:

- Menunda AIS receiver lokal sampai kebutuhan coverage terbukti.
- Menunda AI anomaly detection sampai data historis cukup.
- Menunda multi-region deployment sampai user dan volume meningkat.

### 9.2 Mitigate

Digunakan untuk risiko yang perlu dikurangi tetapi tetap diterima sebagai bagian proyek.

Examples:

- Data latency dimitigasi dengan provider benchmark.
- False alert dimitigasi dengan cooldown dan quality score.
- WebSocket overload dimitigasi dengan bbox subscription.

### 9.3 Transfer

Digunakan bila risiko dapat dialihkan ke vendor atau kontrak.

Examples:

- SLA data provider.
- Cloud managed database.
- Managed monitoring service.

### 9.4 Accept

Digunakan bila risiko kecil atau biaya mitigasi lebih tinggi daripada dampak.

Examples:

- Beberapa vessel unknown pada MVP.
- Near-real-time, bukan absolute real-time, selama SLA dikomunikasikan.

---

## 10. Risk Monitoring Plan

### 10.1 Weekly Review

Risk register direview setiap minggu dengan agenda:

1. Risiko baru.
2. Risiko yang score-nya berubah.
3. Risiko high/critical yang belum punya mitigation owner.
4. Risiko yang perlu eskalasi.
5. Risiko yang bisa ditutup.

### 10.2 Sprint Review

Setiap sprint review harus mengecek:

| Area | Check |
|---|---|
| Data | Apakah ingestion stabil? |
| API | Apakah error rate terkendali? |
| WebSocket | Apakah reconnect dan heartbeat berjalan? |
| Geofence | Apakah false alert menurun? |
| Frontend | Apakah map tetap responsif? |
| Security | Apakah ada vulnerability baru? |
| Cost | Apakah API/cloud usage sesuai budget? |
| QA | Apakah test coverage cukup untuk release? |

### 10.3 Go-Live Risk Review

Sebelum go-live MVP, semua risiko berikut minimal harus berada pada status `Mitigating` atau `Monitoring`:

- R-DATA-001
- R-DATA-002
- R-VENDOR-001
- R-TECH-002
- R-TECH-003
- R-GEO-001
- R-OPS-001
- R-PERF-001
- R-SEC-001
- R-SEC-002
- R-DEPLOY-002
- R-QA-001
- R-COST-001

---

## 11. Risk Indicators and Metrics

### 11.1 Data Risk Metrics

| Metric | Target MVP | Risk Signal |
|---|---:|---|
| Provider API success rate | >= 98% | < 95% |
| Average ingestion latency | <= 60 seconds | > 120 seconds |
| Latest position freshness | <= 60 seconds for active area | > 180 seconds |
| Duplicate rate | <= 5% | > 15% |
| Invalid coordinate rate | <= 1% | > 5% |
| Low quality AIS point rate | <= 10% | > 25% |

### 11.2 System Risk Metrics

| Metric | Target MVP | Risk Signal |
|---|---:|---|
| REST API P95 latency | <= 500 ms for common queries | > 1.5 sec |
| WebSocket reconnect rate | Low/stable | Sudden spike |
| WebSocket message lag | <= 3 sec | > 10 sec |
| Map render FPS | Usable > 30 FPS | Persistent lag |
| Database CPU | < 70% average | > 85% sustained |
| Queue lag | < 30 sec | > 120 sec |

### 11.3 Alerting Risk Metrics

| Metric | Target MVP | Risk Signal |
|---|---:|---|
| Duplicate alert rate | <= 5% | > 15% |
| False positive rate | Tracked during UAT | Increasing trend |
| Alert acknowledgement time | Defined by operation SOP | SLA breached |
| Notification delivery rate | >= 95% | < 90% |

### 11.4 Security Risk Metrics

| Metric | Target MVP | Risk Signal |
|---|---:|---|
| Failed login spike | Monitored | Abnormal pattern |
| Unauthorized API attempts | Monitored | Repeated attempts |
| Secret exposure | 0 | Any finding |
| Critical vulnerability | 0 open at release | Any open critical |
| Audit coverage for critical action | 100% | Missing logs |

### 11.5 Cost Risk Metrics

| Metric | Target MVP | Risk Signal |
|---|---:|---|
| AIS API usage | < 80% quota | > 90% quota |
| Cloud monthly spend | Within budget | > 20% over budget |
| Storage growth | Within forecast | > 30% over forecast |
| Egress traffic | Within estimate | Sudden spike |

---

## 12. Go / No-Go Risk Criteria

### 12.1 Go Criteria

MVP boleh go-live bila:

1. Tidak ada open critical risk tanpa mitigation.
2. Semua high risk punya owner dan mitigation aktif.
3. Provider data sudah diuji pada area monitoring utama.
4. WebSocket reconnect, heartbeat, dan stale indicator sudah diuji.
5. Geofence rule minimal lulus test boundary dasar.
6. Alert deduplication dan cooldown aktif.
7. RBAC dasar aktif.
8. API key tidak terekspos ke frontend atau repository.
9. Backup dan rollback plan tersedia.
10. UAT operator untuk core flow lulus.

### 12.2 No-Go Criteria

MVP tidak boleh go-live bila:

1. Data AIS tidak stabil atau terlalu stale untuk area utama.
2. Dashboard tidak menunjukkan indikator data freshness.
3. Role unauthorized bisa mengakses data vessel/alert.
4. API provider key bocor atau tersimpan tidak aman.
5. Database migration belum dites.
6. Tidak ada backup sebelum release.
7. Alert kritikal tidak muncul di dashboard.
8. WebSocket disconnect tanpa recovery atau fallback.
9. Map tidak usable pada jumlah vessel target.
10. Tidak ada owner untuk operasi pasca go-live.

---

## 13. Risk Backlog

### 13.1 Must Resolve Before MVP Build

| Priority | Item |
|---:|---|
| P0 | Tentukan area monitoring MVP |
| P0 | Pilih dan uji AIS API provider |
| P0 | Definisikan SLA minimum data freshness |
| P0 | Buat data source adapter layer |
| P0 | Terapkan data quality scoring |
| P0 | Tetapkan MVP scope freeze |
| P0 | Siapkan secrets management |
| P0 | Siapkan PostGIS/TimescaleDB schema |

### 13.2 Must Resolve Before UAT

| Priority | Item |
|---:|---|
| P0 | Geofence boundary test |
| P0 | Alert deduplication dan cooldown |
| P0 | WebSocket reconnect test |
| P0 | Map performance with realistic vessel count |
| P0 | User role and permission test |
| P1 | Playback data range limit |
| P1 | Data freshness banner |
| P1 | Provider usage dashboard |

### 13.3 Must Resolve Before Production

| Priority | Item |
|---:|---|
| P0 | Backup and restore drill |
| P0 | Rollback drill |
| P0 | Vulnerability scan |
| P0 | Audit log verification |
| P0 | Incident response runbook |
| P0 | Monitoring dashboard |
| P1 | Multi-provider evaluation |
| P1 | Retention and archive policy |

---

## 14. Contingency Playbooks

## 14.1 AIS Provider Down

Trigger:

- API error rate > threshold.
- No data received for active area.
- Provider status indicates outage.

Actions:

1. Mark system status as degraded.
2. Show dashboard banner: `AIS data delayed or unavailable`.
3. Stop aggressive polling to avoid quota waste.
4. Notify operations and product owner.
5. Switch to fallback provider if available.
6. Keep latest known vessel positions visible with stale indicator.
7. Log incident and provider response time.

---

## 14.2 WebSocket Gateway Failure

Trigger:

- WebSocket connection failure spike.
- No realtime updates delivered.

Actions:

1. Client attempts reconnect with backoff.
2. Backend health check verifies gateway status.
3. Frontend fallback to REST polling every configured interval.
4. Show `Realtime connection degraded` banner.
5. Restart gateway if required.
6. Review gateway logs and message lag.

---

## 14.3 False Alert Spike

Trigger:

- Alert volume suddenly increases.
- Multiple duplicate alerts for same vessel/geofence.

Actions:

1. Enable emergency cooldown increase.
2. Temporarily lower severity for noisy rule.
3. Check recent AIS quality and GPS jumps.
4. Review geofence polygon boundary.
5. Disable specific rule only if operationally safe.
6. Open incident and root cause analysis.

---

## 14.4 Database Performance Degradation

Trigger:

- API P95 latency high.
- CPU/IO database high.
- Query timeout.

Actions:

1. Identify slow queries.
2. Check index usage.
3. Reduce maximum query range temporarily.
4. Enable caching for latest positions.
5. Pause non-critical analytics jobs.
6. Scale database or add read replica if required.

---

## 14.5 Security Incident

Trigger:

- Suspicious login.
- API key exposure.
- Unauthorized access.
- Vulnerability exploited.

Actions:

1. Revoke exposed secrets/tokens.
2. Disable affected account/API key.
3. Preserve logs.
4. Notify security lead and project owner.
5. Patch vulnerability.
6. Rotate credentials.
7. Perform post-incident review.

---

## 15. Residual Risk Acceptance

Beberapa risiko mungkin diterima pada MVP dengan catatan jelas:

| Risk | Residual Acceptance |
|---|---|
| Not all vessels appear | Diterima jika dashboard menampilkan coverage/freshness indicator |
| Near-real-time latency | Diterima bila latency SLA dikomunikasikan |
| Single provider MVP | Diterima bila adapter layer siap dan provider kedua dievaluasi |
| Basic analytics only | Diterima karena MVP fokus pada tracking dan alert |
| Limited export | Diterima sampai lisensi data jelas |
| No AIS receiver local | Diterima sampai kebutuhan coverage lokal terbukti |

---

## 16. Risk Governance

### 16.1 Review Cadence

| Activity | Frequency | Owner |
|---|---|---|
| Risk register review | Weekly | Project Manager |
| Technical risk review | Per sprint | Tech Lead |
| Security risk review | Per release | Security Lead |
| Vendor risk review | Monthly | Product Owner / Procurement |
| Cost risk review | Weekly during MVP | Project Manager / DevOps |
| Go-live risk review | Before release | Steering Committee |

### 16.2 Escalation Rule

Escalate risk bila:

1. Score >= 17.
2. Risiko high tidak punya owner.
3. Mitigation terlambat lebih dari satu sprint.
4. Risiko berdampak pada legal, security, atau go-live.
5. Ada potensi biaya melebihi budget > 20%.

---

## 17. Risk Register Template for Future Updates

Gunakan format berikut untuk menambah risiko baru:

```markdown
| Field | Detail |
|---|---|
| Risk ID | R-XXX-000 |
| Risk Name |  |
| Description |  |
| Category |  |
| Probability | 1-5 |
| Impact | 1-5 |
| Score | Probability x Impact |
| Rating | Low / Medium / High / Critical |
| Trigger |  |
| Impact Detail |  |
| Mitigation |  |
| Contingency |  |
| Owner |  |
| Status | Open / Mitigating / Monitoring / Closed / Escalated |
```

---

## 18. MVP Risk Checklist

### Product

- [ ] MVP scope sudah dibekukan.
- [ ] Persona utama sudah jelas.
- [ ] Acceptance criteria tiap fitur sudah tersedia.
- [ ] Backlog non-MVP sudah diparkir.

### Data

- [ ] Provider AIS sudah diuji.
- [ ] Latency dan coverage sudah dicatat.
- [ ] Data quality score tersedia.
- [ ] Deduplication tersedia.
- [ ] Raw payload disimpan untuk debugging.

### Backend

- [ ] API core tersedia.
- [ ] WebSocket subscribe/unsubscribe tersedia.
- [ ] Bbox filtering tersedia.
- [ ] Geofence rule dasar tersedia.
- [ ] Alert lifecycle tersedia.

### Frontend

- [ ] Map bisa menampilkan vessel real-time.
- [ ] Vessel detail tersedia.
- [ ] Alert panel tersedia.
- [ ] Stale data indicator tersedia.
- [ ] UI usable untuk operator.

### Security

- [ ] Login aktif.
- [ ] RBAC aktif.
- [ ] Secrets tidak terekspos.
- [ ] API rate limit aktif.
- [ ] Audit log untuk action penting aktif.

### Deployment

- [ ] Environment staging tersedia.
- [ ] Backup tersedia.
- [ ] Rollback plan tersedia.
- [ ] Monitoring dasar tersedia.
- [ ] Release checklist tersedia.

### Testing

- [ ] Unit test core logic tersedia.
- [ ] Integration test ingestion tersedia.
- [ ] API test tersedia.
- [ ] WebSocket test tersedia.
- [ ] Geofence boundary test tersedia.
- [ ] UAT operator selesai.

---

## 19. Conclusion

Risk terbesar untuk **Real Time Vessel Tracking System / VesselTrack OS** bukan hanya pada peta atau UI, tetapi pada tiga arus utama:

1. **Kualitas dan ketersediaan data AIS.**
2. **Kemampuan sistem menjaga real-time flow tanpa membanjiri browser, API, dan database.**
3. **Kepercayaan operator terhadap alert dan status kapal.**

MVP harus dibangun dengan pagar pembatas yang jelas:

- Mulai dari AIS API provider.
- Batasi area monitoring.
- Gunakan PostGIS/TimescaleDB.
- Terapkan WebSocket dengan bbox filtering.
- Gunakan data quality score.
- Hindari alert bising.
- Amankan API key dan akses pengguna.
- Pantau biaya sejak hari pertama.

Dengan risk register ini, proyek tidak hanya punya layar peta yang indah, tetapi juga radar manajemen risiko yang menyala sebelum badai datang.

---

## 20. Appendix: Risk ID Prefix

| Prefix | Category |
|---|---|
| R-PROD | Product / Scope |
| R-DATA | Data Source / Data Quality |
| R-VENDOR | Vendor / Licensing |
| R-TECH | Technical / Architecture |
| R-GEO | Geofence / Geospatial |
| R-ALERT | Alerting |
| R-UX | User Experience |
| R-PERF | Performance / Scalability |
| R-SEC | Security |
| R-DEPLOY | Deployment |
| R-OPS | Operations |
| R-QA | Testing / Quality |
| R-COST | Cost |
| R-LEGAL | Legal / Compliance |
| R-PEOPLE | People / Capability |
| R-DEL | Delivery |
