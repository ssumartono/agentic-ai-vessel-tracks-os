# 14_Roadmap.md

# Product Roadmap
## Real Time Vessel Tracking System / VesselTrack OS

**Document Version:** 1.0  
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
- `08_Geofence_Rule_Spec.md`
- `09_Alerting_Spec.md`
- `10_UI_UX_Wireframe.md`
- `11_Security_Model.md`
- `12_Deployment_Plan.md`
- `13_Testing_Strategy.md`

---

## 1. Purpose

Dokumen ini mendefinisikan roadmap pengembangan **Real Time Vessel Tracking System / VesselTrack OS** dari fase awal sampai menjadi platform maritime intelligence yang lebih matang.

Roadmap ini menjadi acuan untuk:

1. Menentukan urutan pengembangan fitur.
2. Menyelaraskan product, engineering, GIS, data, security, dan operations.
3. Mengelola dependency antar modul.
4. Menentukan milestone dan acceptance criteria tiap fase.
5. Mengurangi risiko scope creep.
6. Menjaga jalur terbaik yang sudah disepakati: **AIS API Provider first, MVP tracking first, lalu geofence, alert, playback, analytics, dan hardening**.

---

## 2. Product Vision

**VesselTrack OS** adalah platform monitoring kapal real-time berbasis AIS yang memungkinkan operator memantau posisi kapal, histori pergerakan, area geofence, alert operasional, dan analitik lalu lintas perairan melalui dashboard peta yang mudah digunakan.

Visi jangka panjang:

> Menjadi platform maritime intelligence modular yang dapat dipakai untuk monitoring pelabuhan, sungai, perairan industri, armada internal, dan analitik pergerakan kapal.

---

## 3. Roadmap Principles

Roadmap ini memakai prinsip berikut:

1. **Validate early**  
   Validasi nilai produk melalui MVP sederhana sebelum menambah kompleksitas.

2. **AIS API first**  
   Untuk fase awal, gunakan AIS API Provider agar tim fokus membangun aplikasi, bukan infrastruktur radio/receiver.

3. **Map first experience**  
   Pengalaman utama pengguna adalah peta real-time. Semua fitur awal harus mendukung peta sebagai pusat operasi.

4. **Geospatial correctness**  
   Akurasi koordinat, geofence, dan histori pergerakan lebih penting daripada banyak fitur kosmetik.

5. **Security by design**  
   Autentikasi, RBAC, audit, API key management, dan data protection masuk sejak MVP.

6. **Operational readiness**  
   Sistem tracking bukan aplikasi statis. Monitoring, logging, backup, dan recovery harus tersedia sebelum pilot operasional.

7. **Modular evolution**  
   Modul ingestion, tracking, geofence, alert, playback, analytics, dan reporting harus bisa berkembang tanpa membongkar arsitektur utama.

---

## 4. Roadmap Overview

Roadmap dibagi menjadi 6 fase utama.

| Phase | Name | Main Objective | Indicative Duration |
|---|---|---|---:|
| 0 | Discovery & Foundation | Validasi kebutuhan, area, data source, dan arsitektur | 1-2 minggu |
| 1 | MVP Real-Time Tracking | Peta kapal real-time, data AIS, vessel detail, histori dasar | 4-6 minggu |
| 2 | Geofence & Alert | Rule geofence, alert lifecycle, notification, audit | 3-4 minggu |
| 3 | Playback & Operational Reporting | Replay rute, export, laporan operasional dasar | 3-5 minggu |
| 4 | Analytics & Intelligence | Density map, idle analysis, anomaly, ETA awal | 4-6 minggu |
| 5 | Hardening & Production Scale | Security, performance, observability, DR, scale-out | 3-5 minggu |

Total estimasi sampai production-ready awal: **18-28 minggu**, tergantung ukuran tim, ketersediaan data provider, dan kompleksitas area monitoring.

---

## 5. Phase 0 - Discovery & Foundation

### 5.1 Objective

Mendefinisikan kebutuhan produk, ruang lingkup area monitoring, strategi sumber data, arsitektur awal, dan rencana kerja MVP.

### 5.2 Key Questions

1. Area monitoring awal di mana?
2. Apakah fokus pada pelabuhan, sungai, anchorage, perairan industri, atau armada internal?
3. Berapa jumlah kapal aktif yang perlu dimonitor?
4. Apakah data AIS global diperlukan atau cukup area lokal?
5. Provider AIS mana yang paling sesuai?
6. Siapa pengguna utama sistem?
7. Alert apa yang paling penting untuk operasional?
8. Apa batas latency yang dapat diterima?
9. Apakah sistem hanya monitoring atau juga compliance/reporting?
10. Apakah ada kebutuhan integrasi dengan sistem eksternal?

### 5.3 Scope

#### In Scope

- Finalisasi PRD.
- Finalisasi arsitektur sistem.
- Evaluasi AIS API Provider.
- Definisi area monitoring awal.
- Definisi persona dan user journey.
- Definisi data model awal.
- Definisi UI/UX wireframe awal.
- Definisi security baseline.
- Definisi testing strategy.
- Estimasi biaya awal.

#### Out of Scope

- Development fitur penuh.
- Integrasi receiver AIS fisik.
- Machine learning.
- Integrasi multi-provider.
- Production scale-out.

### 5.4 Deliverables

| Deliverable | Description | Owner |
|---|---|---|
| Product Requirement | PRD final | Product Owner |
| Architecture Baseline | System architecture final | Solution Architect |
| Data Source Assessment | Shortlist provider AIS | Data Engineer |
| UI Wireframe | Dashboard dan key screen | UI/UX Designer |
| MVP Backlog | Epics, stories, priorities | Product Owner |
| Technical Plan | Stack, repo, environment, CI/CD | Engineering Lead |
| Risk Register | Risiko awal dan mitigasi | Project Lead |

### 5.5 Acceptance Criteria

Phase 0 dianggap selesai jika:

- PRD disetujui.
- Arsitektur MVP disetujui.
- AIS API Provider kandidat sudah dipilih minimal 1 primary dan 1 backup.
- Area monitoring awal sudah ditentukan.
- MVP backlog sudah diprioritaskan.
- UI wireframe utama sudah tersedia.
- Database model awal sudah siap.
- Security baseline sudah didefinisikan.
- Estimasi timeline dan resource sudah disepakati.

### 5.6 Go / No-Go Criteria

| Criteria | Go | No-Go |
|---|---|---|
| Data source | Provider tersedia dan bisa diuji | Tidak ada akses data |
| Area scope | Area jelas dan terbatas | Area terlalu luas/tidak jelas |
| MVP scope | Fitur minimum disepakati | Scope terus melebar |
| Team | Resource inti tersedia | Tidak ada backend/frontend/GIS support |
| Budget | Biaya provider dan infra awal disetujui | Biaya belum jelas |

---

## 6. Phase 1 - MVP Real-Time Tracking

### 6.1 Objective

Membangun kemampuan inti: mengambil data AIS dari provider, menyimpan data posisi, menampilkan kapal di peta real-time, menampilkan detail kapal, dan menyediakan histori dasar.

Ini adalah fase “kapal pertama bergerak di layar”.

### 6.2 Main Capabilities

1. User login.
2. Dashboard map.
3. AIS API ingestion.
4. Vessel registry.
5. Latest vessel position.
6. Real-time update via WebSocket.
7. Vessel detail panel.
8. Basic vessel search.
9. Basic position history.
10. Basic operational health monitoring.

### 6.3 Epics

#### Epic 1.1 - Project Foundation

User stories:

- Sebagai developer, saya ingin repository frontend dan backend siap agar pengembangan terstruktur.
- Sebagai developer, saya ingin Docker Compose environment tersedia agar local setup mudah.
- Sebagai QA, saya ingin test environment tersedia agar fitur dapat diuji konsisten.

Deliverables:

- Monorepo atau multi-repo setup.
- Frontend scaffold.
- Backend scaffold.
- Database migration scaffold.
- Docker Compose.
- Basic CI pipeline.
- Environment variable template.

#### Epic 1.2 - Authentication & RBAC Basic

User stories:

- Sebagai pengguna, saya ingin login agar dapat mengakses dashboard.
- Sebagai admin, saya ingin role user dibedakan agar akses dapat dikontrol.

Deliverables:

- Login API.
- JWT/session handling.
- Role: Admin, Operator, Viewer.
- Protected frontend route.
- Basic audit login.

#### Epic 1.3 - AIS Ingestion MVP

User stories:

- Sebagai sistem, saya ingin mengambil data dari AIS API Provider agar posisi kapal selalu diperbarui.
- Sebagai operator, saya ingin data kapal yang ditampilkan valid agar tidak salah mengambil keputusan.

Deliverables:

- AIS provider connector.
- Polling job.
- Provider response mapping.
- Canonical AIS payload.
- Basic validation.
- Deduplication by MMSI + timestamp.
- Raw response logging.
- Ingestion health metric.

#### Epic 1.4 - Database Core

User stories:

- Sebagai sistem, saya ingin menyimpan kapal dan posisi agar histori dapat dianalisis.
- Sebagai operator, saya ingin melihat posisi terakhir kapal agar dashboard akurat.

Deliverables:

- `vessels` table.
- `vessel_positions` table.
- `vessel_latest_positions` table.
- PostGIS extension.
- TimescaleDB hypertable if available.
- Indexing baseline.
- Latest position upsert.

#### Epic 1.5 - Real-Time Map Dashboard

User stories:

- Sebagai operator, saya ingin melihat kapal di peta agar dapat memantau pergerakan real-time.
- Sebagai operator, saya ingin klik kapal agar dapat melihat detailnya.
- Sebagai operator, saya ingin mencari kapal berdasarkan MMSI atau nama.

Deliverables:

- Map UI.
- Vessel marker.
- Heading arrow.
- Marker status color.
- Vessel detail side panel.
- Search box.
- Filter basic.
- Last update indicator.

#### Epic 1.6 - WebSocket Real-Time Update

User stories:

- Sebagai operator, saya ingin marker kapal bergerak tanpa refresh manual.
- Sebagai sistem, saya ingin mengirim update hanya untuk area yang terlihat agar efisien.

Deliverables:

- WebSocket endpoint.
- Subscribe/unsubscribe channel.
- BBox filtering basic.
- Position update event.
- Heartbeat.
- Reconnect handling.

#### Epic 1.7 - Basic History

User stories:

- Sebagai operator, saya ingin melihat histori posisi kapal dalam periode tertentu.
- Sebagai analyst, saya ingin melihat track line agar rute kapal mudah dipahami.

Deliverables:

- Position history API.
- Track line on map.
- Time range selector basic.
- Limit and pagination.

### 6.4 MVP Definition of Done

Phase 1 selesai jika:

- Minimal satu AIS API Provider berhasil terintegrasi.
- Kapal tampil di peta berdasarkan area monitoring.
- Marker diperbarui secara real-time tanpa refresh manual.
- Detail kapal tampil saat marker diklik.
- Histori dasar dapat ditampilkan sebagai track line.
- User login dan role dasar tersedia.
- Sistem memiliki logging dan health endpoint.
- Basic test pass.
- Demo end-to-end dapat dilakukan.

### 6.5 MVP Success Metrics

| Metric | Target MVP |
|---|---:|
| Position ingestion success rate | >= 95% |
| Duplicate rate after processing | <= 2% |
| Map update latency from internal process | <= 5 detik |
| API p95 response time for latest vessels | <= 1 detik |
| WebSocket reconnect success | >= 95% |
| Dashboard usable with active vessels | 100-500 vessels awal |
| Critical bug after demo | 0 |

---

## 7. Phase 2 - Geofence & Alert

### 7.1 Objective

Menambahkan pagar digital dan sistem alert operasional agar dashboard bukan hanya melihat kapal, tetapi juga memberi sinyal ketika ada kondisi penting.

### 7.2 Main Capabilities

1. Create/edit/delete geofence.
2. Visualize polygon/circle/line corridor on map.
3. Enter/exit geofence detection.
4. Dwell time rule.
5. Speed violation rule.
6. AIS silence rule.
7. Alert inbox.
8. Alert detail.
9. Acknowledge and resolve alert.
10. Real-time alert WebSocket event.
11. Notification channel basic.

### 7.3 Epics

#### Epic 2.1 - Geofence Management

Deliverables:

- Geofence list.
- Geofence create/edit/delete API.
- Polygon drawing UI.
- Circle drawing UI if needed.
- Geofence metadata.
- Active/inactive status.
- Rule assignment.

#### Epic 2.2 - Geofence Rule Engine

Deliverables:

- Spatial containment check.
- Enter event.
- Exit event.
- Dwell rule.
- Hysteresis/cooldown.
- Severity mapping.
- Event log.

#### Epic 2.3 - Alert Lifecycle

Deliverables:

- Alert generation.
- Alert inbox.
- Alert detail.
- Status: open, acknowledged, resolved, suppressed.
- Assignment basic.
- Comment/note basic.
- Audit trail.

#### Epic 2.4 - Notification Channel MVP

Deliverables:

- Email notification.
- Optional Telegram/WhatsApp gateway placeholder.
- Notification template.
- Retry logic basic.
- Notification log.

### 7.4 Acceptance Criteria

- Operator dapat membuat geofence dari UI.
- Sistem mendeteksi kapal masuk/keluar geofence.
- Alert muncul di dashboard secara real-time.
- Alert dapat di-acknowledge dan resolve.
- Dwell time dan AIS silence minimal tersedia sebagai rule.
- Semua alert penting tercatat di audit log.
- False duplicate alert dikendalikan dengan cooldown.

### 7.5 Success Metrics

| Metric | Target |
|---|---:|
| Geofence detection accuracy on test data | >= 98% |
| Alert generation latency | <= 10 detik |
| Duplicate alert rate | <= 5% |
| Alert lifecycle API p95 | <= 1 detik |
| Notification delivery success | >= 95% |

---

## 8. Phase 3 - Playback & Operational Reporting

### 8.1 Objective

Memberikan kemampuan replay histori pergerakan kapal dan laporan operasional dasar untuk investigasi, evaluasi, dan pelaporan.

### 8.2 Main Capabilities

1. Historical playback.
2. Timeline slider.
3. Route track visualization.
4. Event overlay on route.
5. Export CSV.
6. Export GeoJSON.
7. Daily vessel movement report.
8. Port/area activity summary.
9. Alert summary report.
10. Basic scheduled report optional.

### 8.3 Epics

#### Epic 3.1 - Playback Engine

Deliverables:

- Playback API.
- Playback route simplification.
- Timeline slider UI.
- Play/pause/speed control.
- Time marker.
- Selected vessel replay.

#### Epic 3.2 - Historical Query Optimization

Deliverables:

- Time-series query tuning.
- Spatial/time index optimization.
- Pagination/cursor.
- Downsampling for long track.
- Retention policy implementation.

#### Epic 3.3 - Export

Deliverables:

- CSV export.
- GeoJSON export.
- Export status API.
- File download.
- Export audit log.

#### Epic 3.4 - Operational Reports

Deliverables:

- Vessel movement summary.
- Area entry/exit report.
- Alert summary.
- Idle/anchoring duration basic.
- Daily report view.

### 8.4 Acceptance Criteria

- User dapat memilih kapal dan rentang waktu.
- Sistem dapat memutar ulang pergerakan kapal di peta.
- Event geofence/alert dapat muncul pada timeline atau overlay.
- Data dapat diekspor CSV dan GeoJSON.
- Laporan harian dasar dapat dihasilkan.
- Query histori tetap responsif pada data MVP.

### 8.5 Success Metrics

| Metric | Target |
|---|---:|
| Playback route load p95 for 24h vessel data | <= 3 detik |
| CSV export success | >= 98% |
| GeoJSON export valid | 100% on test cases |
| Report generation for daily area summary | <= 10 detik |

---

## 9. Phase 4 - Analytics & Intelligence

### 9.1 Objective

Mengembangkan sistem dari tracking operasional menjadi platform analitik awal yang membantu memahami pola pergerakan, kepadatan, anomali, dan efisiensi aktivitas kapal.

### 9.2 Main Capabilities

1. Vessel activity dashboard.
2. Traffic density heatmap.
3. Idle and anchoring analytics.
4. Speed pattern analytics.
5. Route deviation analysis.
6. Basic ETA estimation.
7. Dark period / AIS silence analytics.
8. Top vessels by activity.
9. Area utilization analytics.
10. Anomaly candidate list.

### 9.3 Epics

#### Epic 4.1 - Analytics Data Mart

Deliverables:

- Aggregated vessel activity tables.
- Continuous aggregates if using TimescaleDB.
- Daily/hourly summary.
- Area-based aggregation.
- Alert summary aggregation.

#### Epic 4.2 - Density Map

Deliverables:

- Heatmap layer.
- Time filter.
- Vessel type filter.
- Area filter.
- Density tile optimization if needed.

#### Epic 4.3 - Operational Analytics

Deliverables:

- Idle duration.
- Anchoring candidate.
- Speed distribution.
- Average transit speed.
- Port call duration basic.

#### Epic 4.4 - Intelligence Starter

Deliverables:

- AIS silence summary.
- Speed anomaly candidate.
- Position jump candidate.
- Route deviation candidate.
- Basic ETA rule-based.

### 9.4 Acceptance Criteria

- Dashboard analytics menampilkan agregasi data minimal harian.
- Heatmap dapat difilter berdasarkan waktu dan tipe kapal.
- Sistem dapat menghitung idle/anchoring duration dasar.
- Sistem dapat menampilkan kandidat anomali, bukan otomatis memberi vonis final.
- Analytics tidak mengganggu performa dashboard real-time.

### 9.5 Success Metrics

| Metric | Target |
|---|---:|
| Analytics dashboard load p95 | <= 5 detik |
| Daily aggregation job success | >= 98% |
| Heatmap rendering acceptable for MVP area | <= 5 detik |
| False positive anomaly labeling | Reviewed manually, baseline established |

---

## 10. Phase 5 - Hardening & Production Scale

### 10.1 Objective

Menyiapkan sistem untuk penggunaan production yang stabil, aman, terpantau, dan dapat diskalakan.

### 10.2 Main Capabilities

1. Production-grade deployment.
2. Automated CI/CD.
3. Security hardening.
4. Secrets management.
5. Backup and restore.
6. Disaster recovery plan.
7. Observability dashboard.
8. Performance tuning.
9. Load test.
10. Data retention automation.
11. Runbook operations.
12. Incident response.

### 10.3 Epics

#### Epic 5.1 - Infrastructure Hardening

Deliverables:

- Production deployment architecture.
- Network segmentation.
- TLS everywhere.
- WAF/reverse proxy.
- Managed database or HA database.
- Secure object storage.
- Infrastructure as Code optional.

#### Epic 5.2 - Security Hardening

Deliverables:

- RBAC finalization.
- API rate limiting.
- WebSocket origin validation.
- Audit log review.
- Secrets vault.
- Dependency scanning.
- Container scanning.
- Security test report.

#### Epic 5.3 - Observability

Deliverables:

- Application logs.
- Metrics dashboard.
- Alert for ingestion failure.
- Alert for WebSocket failure.
- Alert for DB pressure.
- Trace correlation ID.
- Synthetic monitoring.

#### Epic 5.4 - Performance & Scalability

Deliverables:

- Load test scenario.
- WebSocket concurrency test.
- Database index tuning.
- Query optimization.
- Cache strategy.
- BBox filtering optimization.
- Marker rendering optimization.

#### Epic 5.5 - Backup, DR, and Operations

Deliverables:

- Backup schedule.
- Restore drill.
- RPO/RTO definition.
- Runbook.
- Incident playbook.
- Release checklist.
- Rollback procedure.

### 10.4 Acceptance Criteria

- Production environment berjalan stabil.
- Backup dan restore berhasil diuji.
- Security baseline terpenuhi.
- Observability dashboard tersedia.
- Load test memenuhi target minimum.
- Rollback bisa dilakukan.
- Runbook operasional tersedia.
- UAT production readiness disetujui.

### 10.5 Success Metrics

| Metric | Target Production Initial |
|---|---:|
| System uptime target | >= 99.5% |
| API p95 latest vessels | <= 1 detik |
| API p95 history query 24h | <= 3 detik |
| WebSocket update latency internal | <= 5 detik |
| Ingestion success | >= 98% |
| Backup success | 100% scheduled |
| Restore drill | Passed |
| Critical vulnerabilities | 0 open |

---

## 11. Cross-Phase Dependency Map

| Dependency | Required By | Notes |
|---|---|---|
| AIS API Provider | Phase 1 | Harus tersedia sebelum ingestion MVP |
| Canonical AIS Model | Phase 1 | Dasar semua pipeline data |
| PostGIS Database | Phase 1 | Wajib untuk geospatial query |
| WebSocket Spec | Phase 1 | Wajib untuk realtime dashboard |
| Geofence Data Model | Phase 2 | Bergantung pada PostGIS geometry |
| Alert Lifecycle | Phase 2 | Bergantung pada geofence/event engine |
| Historical Data Retention | Phase 3 | Bergantung pada TimescaleDB/indexing |
| Playback API | Phase 3 | Bergantung pada histori posisi yang bersih |
| Aggregation Jobs | Phase 4 | Bergantung pada data historis cukup |
| Observability | Phase 5 | Sebaiknya dimulai sejak Phase 1, matang di Phase 5 |
| Security Model | Semua fase | Minimum sejak awal, hardening di akhir |

---

## 12. Release Plan

### 12.1 Release Naming

| Release | Description |
|---|---|
| v0.1 | Technical prototype |
| v0.2 | Internal MVP map |
| v0.3 | MVP tracking demo |
| v0.4 | Geofence and alert beta |
| v0.5 | Playback and report beta |
| v0.6 | Analytics alpha |
| v1.0 | Production initial release |

### 12.2 Release Scope

#### v0.1 - Technical Prototype

Scope:

- Basic frontend shell.
- Backend health endpoint.
- Database connection.
- Static map render.
- Mock vessel marker.

Exit criteria:

- Local environment works.
- Demo marker appears on map.

#### v0.2 - Internal MVP Map

Scope:

- Real AIS API connector sandbox.
- Vessel latest position API.
- Real map marker.
- Basic vessel detail.

Exit criteria:

- Real vessel data appears in dashboard.

#### v0.3 - MVP Tracking Demo

Scope:

- WebSocket update.
- Search.
- Filter.
- Basic track history.
- Login.

Exit criteria:

- End-to-end demo stable.

#### v0.4 - Geofence and Alert Beta

Scope:

- Geofence editor.
- Enter/exit rule.
- Alert inbox.
- Acknowledge/resolve.
- Email notification.

Exit criteria:

- Geofence alert works on test route.

#### v0.5 - Playback and Report Beta

Scope:

- Playback timeline.
- Route replay.
- CSV/GeoJSON export.
- Daily movement report.

Exit criteria:

- User can investigate vessel movement from history.

#### v0.6 - Analytics Alpha

Scope:

- Heatmap.
- Idle analysis.
- Alert summary.
- Vessel activity dashboard.

Exit criteria:

- Analytics useful for operational insight.

#### v1.0 - Production Initial Release

Scope:

- Security hardening.
- Observability.
- Backup/restore.
- Performance tuning.
- UAT sign-off.
- Deployment runbook.

Exit criteria:

- Production readiness accepted.

---

## 13. Product Backlog by Priority

### 13.1 Must Have

- User login.
- RBAC basic.
- AIS API ingestion.
- Vessel registry.
- Latest position.
- Real-time map.
- Vessel marker.
- Vessel detail.
- WebSocket position update.
- Basic history.
- Health endpoint.
- Basic logging.
- Geofence create/edit.
- Enter/exit alert.
- Alert inbox.
- Alert acknowledge/resolve.

### 13.2 Should Have

- Dwell time alert.
- AIS silence alert.
- Speed violation alert.
- Notification email.
- Track playback.
- CSV export.
- GeoJSON export.
- Alert audit trail.
- Dashboard KPI.
- Map filter by vessel type.
- BBox filtering.
- Data quality score.

### 13.3 Could Have

- Telegram/WhatsApp gateway.
- Multi-provider AIS.
- Local AIS receiver integration.
- Vessel photo/thumbnail.
- Route deviation.
- Port call analytics.
- Density heatmap.
- ETA estimation.
- Custom report builder.

### 13.4 Won't Have in MVP

- Full machine learning anomaly detection.
- Collision avoidance decision support.
- Global fleet commercial intelligence.
- Complex billing/multi-tenant SaaS.
- Native mobile app.
- Full AIS receiver hardware management.
- Satellite AIS direct procurement platform.

---

## 14. Milestone Timeline

Indicative timeline assuming small focused team.

| Week | Milestone | Key Output |
|---:|---|---|
| 1 | Discovery started | Area, user, data source candidate |
| 2 | Discovery complete | PRD, architecture, backlog approved |
| 3 | Project foundation | Repo, Docker, DB, frontend shell |
| 4 | AIS ingestion prototype | Real/mock AIS data stored |
| 5 | Map MVP | Vessels visible on map |
| 6 | Vessel detail & latest position | Search and detail panel |
| 7 | WebSocket update | Marker updates real-time |
| 8 | Basic history | Track line by time range |
| 9 | MVP demo hardening | Bugfix, test, demo pack |
| 10 | Geofence editor | Create/edit geofence |
| 11 | Geofence rules | Enter/exit/dwell event |
| 12 | Alert lifecycle | Inbox, ack, resolve |
| 13 | Notification | Email/notification log |
| 14 | Playback | Timeline replay |
| 15 | Export/report | CSV/GeoJSON, daily summary |
| 16 | Analytics starter | KPI, alert summary |
| 17 | Heatmap/idle analysis | Density and idle basic |
| 18 | Security hardening | RBAC, audit, scanning |
| 19 | Observability | Metrics, logs, alerts |
| 20 | UAT & production readiness | Go-live decision |

---

## 15. Team and Responsibility Roadmap

### 15.1 MVP Core Team

| Role | Responsibility |
|---|---|
| Product Owner | Scope, priority, acceptance criteria |
| Solution Architect | Architecture, integration design, technical governance |
| Backend Developer | API, ingestion, WebSocket, business logic |
| Frontend Developer | Dashboard, map, UI state, WebSocket client |
| GIS/Data Engineer | PostGIS, geofence, spatial query, data quality |
| DevOps Engineer | Environment, CI/CD, deployment, observability |
| QA Engineer | Test strategy, test cases, regression, UAT support |
| Security Reviewer | Security model, threat review, checklist |

### 15.2 RACI Summary

| Workstream | PO | Architect | Backend | Frontend | GIS/Data | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|---|
| PRD | A | C | C | C | C | I | C | I |
| Architecture | C | A | C | C | C | C | I | C |
| Data source | A | C | R | I | R | I | I | C |
| Database | I | C | R | I | A/R | C | C | C |
| API | C | C | A/R | C | C | I | C | C |
| Frontend | C | I | C | A/R | C | I | C | I |
| Geofence | C | C | R | C | A/R | I | C | C |
| Alerting | A | C | R | C | C | I | C | C |
| Deployment | I | C | C | C | I | A/R | C | C |
| Testing | C | C | C | C | C | I | A/R | C |
| Security | C | C | C | C | C | C | C | A/R |

Legend:

- A = Accountable
- R = Responsible
- C = Consulted
- I = Informed

---

## 16. Technical Evolution Roadmap

### 16.1 MVP Architecture

```text
AIS API Provider
      ↓
Ingestion Service
      ↓
PostgreSQL + PostGIS + TimescaleDB
      ↓
Backend API + WebSocket
      ↓
Frontend Map Dashboard
```

### 16.2 Production Architecture

```text
AIS API Provider / Local AIS Receiver / GPS Tracker
      ↓
Provider Adapter Layer
      ↓
Queue / Event Stream
      ↓
Parser + Validation + Rule Engine
      ↓
PostGIS + TimescaleDB + Redis + Object Storage
      ↓
API Gateway + Backend Services + WebSocket Gateway
      ↓
Map Dashboard + Alert Center + Analytics
      ↓
Notification + Export + Reporting
```

### 16.3 Future Architecture Enhancements

| Enhancement | Trigger |
|---|---|
| Kafka/Redpanda event streaming | Data volume grows beyond simple polling pipeline |
| Redis cache expansion | Latest vessel and geofence query load increases |
| Vector tile service | Marker/heatmap scale becomes heavy |
| Multi-provider source abstraction | Need provider redundancy or wider coverage |
| Local AIS receiver | Need low-latency local coverage |
| ML pipeline | Sufficient historical data collected |
| Multi-tenant architecture | Product becomes SaaS |

---

## 17. Data Roadmap

### 17.1 Data Foundation

- Canonical AIS event.
- Vessel master.
- Latest position.
- Historical position.
- Raw provider payload.
- Data quality flags.

### 17.2 Data Operational Layer

- Geofence event.
- Alert event.
- Notification log.
- User action audit.
- Export history.

### 17.3 Data Analytics Layer

- Hourly vessel activity.
- Daily vessel activity.
- Area density aggregate.
- Idle duration aggregate.
- Alert summary aggregate.
- AIS silence summary.

### 17.4 Data Intelligence Layer

- Route pattern baseline.
- ETA model dataset.
- Anomaly candidate dataset.
- Vessel behavior profile.
- Port call pattern.

---

## 18. UX Roadmap

### 18.1 MVP UX

- Map dashboard.
- Vessel marker.
- Vessel detail side panel.
- Search.
- Filter.
- Simple history.
- Login.

### 18.2 Operational UX

- Geofence editor.
- Alert inbox.
- Alert detail.
- Acknowledge/resolve workflow.
- Playback timeline.
- Export.

### 18.3 Intelligence UX

- Analytics dashboard.
- Heatmap layer.
- Anomaly candidate panel.
- Report builder.
- Role-based dashboard.

### 18.4 Enterprise UX

- Admin console.
- Data source management.
- User and role management.
- Notification policy management.
- Audit viewer.
- System health page.

---

## 19. Risk-Based Roadmap Controls

| Risk | Phase Most Affected | Control |
|---|---|---|
| AIS provider latency too high | Phase 1 | Provider benchmark before build completion |
| Provider license limitation | Phase 0-1 | Legal/commercial review early |
| Geofence false positives | Phase 2 | Hysteresis, cooldown, QA route scenarios |
| Browser performance issue | Phase 1-4 | Marker clustering, BBox filtering, map optimization |
| Database growth | Phase 3-5 | Retention, partitioning, TimescaleDB compression |
| Alert fatigue | Phase 2 | Severity, cooldown, suppression, notification policy |
| Security gap | All | Security checklist every release |
| Operational failure unnoticed | Phase 1-5 | Health checks, metrics, ingestion alerts |
| Scope creep | All | Roadmap governance and backlog triage |

---

## 20. Roadmap Governance

### 20.1 Cadence

| Meeting | Frequency | Purpose |
|---|---|---|
| Product backlog review | Weekly | Prioritize stories and scope |
| Engineering sync | 2-3x weekly | Track technical progress/blocker |
| Demo review | Biweekly | Show working software |
| Risk review | Biweekly | Update risk and mitigation |
| Security review | Per release | Validate security controls |
| Release readiness | Before release | Go/no-go decision |

### 20.2 Change Control

Setiap perubahan roadmap harus mencatat:

1. Request description.
2. Business justification.
3. Impact to scope.
4. Impact to timeline.
5. Impact to cost.
6. Technical dependency.
7. Risk assessment.
8. Decision: approve, defer, reject.

### 20.3 Prioritization Method

Gunakan kombinasi:

- Business value.
- Operational urgency.
- Technical dependency.
- Risk reduction.
- User impact.
- Delivery effort.

Recommended scoring:

```text
Priority Score = Business Value + Risk Reduction + User Impact - Delivery Complexity
```

---

## 21. Acceptance Criteria by Roadmap Level

### 21.1 MVP Acceptance

MVP diterima jika:

- Kapal tampil di peta dari data AIS provider.
- Data posisi tersimpan.
- WebSocket update berjalan.
- Vessel detail dapat dibuka.
- Histori dasar dapat dilihat.
- Login dan role dasar tersedia.
- Sistem dapat didemo end-to-end.

### 21.2 Operational Beta Acceptance

Operational beta diterima jika:

- Geofence dapat dibuat dan diedit.
- Enter/exit/dwell alert berjalan.
- Alert dapat di-acknowledge dan resolve.
- Notification minimal email tersedia.
- Playback rute tersedia.
- Export tersedia.
- UAT operator selesai.

### 21.3 Production Initial Acceptance

Production initial diterima jika:

- Security checklist lulus.
- Load test lulus.
- Backup/restore lulus.
- Observability dashboard tersedia.
- Runbook tersedia.
- Incident response basic tersedia.
- Critical bug = 0.
- Stakeholder sign-off.

---

## 22. KPI Roadmap

### 22.1 Product KPI

| KPI | MVP | Beta | Production Initial |
|---|---:|---:|---:|
| Active vessels monitored | 100-500 | 500-2,000 | 2,000+ |
| Area monitored | 1 area | 2-5 areas | Multi-area |
| User roles | 3 | 4 | 5+ |
| Main workflows completed | Tracking | Tracking + Alert | Tracking + Alert + Report |

### 22.2 Technical KPI

| KPI | MVP | Beta | Production Initial |
|---|---:|---:|---:|
| Ingestion success | >= 95% | >= 97% | >= 98% |
| Map update latency | <= 5 sec | <= 5 sec | <= 3-5 sec |
| API p95 | <= 1 sec | <= 1 sec | <= 1 sec |
| WebSocket reconnect | >= 95% | >= 97% | >= 98% |
| Uptime target | Best effort | >= 99% | >= 99.5% |

### 22.3 Operational KPI

| KPI | MVP | Beta | Production Initial |
|---|---:|---:|---:|
| Alert duplicate rate | N/A | <= 5% | <= 3% |
| Alert acknowledgement tracking | N/A | Available | Audited |
| Report generation | N/A | Basic | Scheduled/optimized |
| Backup success | Manual | Scheduled | Monitored |

---

## 23. Future Product Expansion

### 23.1 Local AIS Receiver Integration

Potential scope:

- Receiver registration.
- Receiver health monitoring.
- NMEA AIVDM parser.
- Source priority handling.
- Coverage quality map.

Trigger:

- Need lower latency in local area.
- Need redundancy from commercial AIS provider.
- Need independent data ownership.

### 23.2 Multi-Provider Data Strategy

Potential scope:

- Provider abstraction.
- Provider fallback.
- Conflict resolution.
- Provider quality score.
- Cost-based source routing.

Trigger:

- Single provider coverage insufficient.
- SLA requirement increases.
- Commercial dependency risk becomes high.

### 23.3 Fleet Management Extension

Potential scope:

- Internal fleet profile.
- Voyage plan.
- ETA monitoring.
- Fuel/operation data integration.
- Maintenance integration.

Trigger:

- Customer owns or manages vessel fleet.

### 23.4 Maritime Intelligence Extension

Potential scope:

- Behavior anomaly.
- Route prediction.
- ETA prediction.
- Suspicious activity detection.
- Dark vessel indicator.
- Port congestion forecast.

Trigger:

- Sufficient historical data.
- Business need for intelligence beyond tracking.

### 23.5 Mobile Companion App

Potential scope:

- Alert notification.
- Vessel search.
- Map view.
- Acknowledge alert.
- Field operator workflow.

Trigger:

- Operators need mobile response.
- Alert acknowledgement required outside control room.

---

## 24. Recommended Next Documents

Setelah `14_Roadmap.md`, dokumen berikut yang perlu dibuat:

1. `15_Risk_Register.md`
2. `16_Backlog_Epics_User_Stories.md`
3. `17_Project_Management_Plan.md`
4. `18_Development_Sprint_Plan.md`
5. `19_UAT_Test_Cases.md`
6. `20_Operations_Runbook.md`

---

## 25. Summary

Roadmap **Real Time Vessel Tracking System / VesselTrack OS** harus bergerak bertahap dan terkendali:

```text
Discovery
  → MVP Real-Time Tracking
    → Geofence & Alert
      → Playback & Reporting
        → Analytics & Intelligence
          → Production Hardening
```

Strategi terbaik tetap:

1. Mulai dari **AIS API Provider**.
2. Bangun **MVP peta real-time**.
3. Tambahkan **geofence dan alert**.
4. Tambahkan **playback dan reporting**.
5. Kembangkan menjadi **analytics dan maritime intelligence**.
6. Keraskan sistem untuk **production scale**.

Dengan roadmap ini, tim dapat membangun produk dari “peta kapal hidup” menjadi **platform operasi maritim yang bisa dipercaya** tanpa tenggelam oleh kompleksitas terlalu dini.

