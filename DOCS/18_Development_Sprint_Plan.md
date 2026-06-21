# 18_Development_Sprint_Plan.md
# Development Sprint Plan

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product & Engineering Team  

---


## 1. Purpose

Dokumen ini menjabarkan rencana sprint pengembangan **Real Time Vessel Tracking System / VesselTrack OS**. Rencana ini mengubah backlog menjadi urutan pekerjaan 2-mingguan yang dapat dieksekusi tim engineering.

Sprint plan ini selaras dengan:

1. `16_Backlog_Epics_User_Stories.md`
2. `17_Project_Management_Plan.md`
3. `14_Roadmap.md`
4. `13_Testing_Strategy.md`
5. `12_Deployment_Plan.md`

---

## 2. Sprint Assumptions

| Item | Assumption |
|---|---|
| Sprint length | 2 weeks |
| Team size | 3-5 core contributors |
| Delivery model | Scrum-lite |
| Deployment target | Dev and staging first |
| Data source | AIS API Provider or mock provider until credential ready |
| MVP duration | 8 sprints including Sprint 0 |
| Main stack | Next.js, Backend API, PostgreSQL/PostGIS, Redis, WebSocket, Docker |

---

## 3. Team Capacity Model

### 3.1 Suggested Capacity

| Role | Capacity per Sprint |
|---|---:|
| Backend Developer | 15-20 points |
| Frontend Developer | 15-20 points |
| GIS/Data Engineer | 8-13 points |
| DevOps | 5-8 points |
| QA | 8-13 points |

For small team, assume total velocity:

```text
Sprint 0: 20-25 points
Sprint 1 onward: 30-40 points
```

### 3.2 Capacity Reserve

Setiap sprint harus menyisakan:

1. 15% untuk bug fixing.
2. 10% untuk technical debt.
3. 5% untuk support deployment/staging.

---

## 4. Sprint Ceremonies

| Ceremony | Duration | Purpose |
|---|---:|---|
| Sprint Planning | 1.5-2 hours | Select sprint backlog |
| Daily Standup | 15 minutes | Sync progress/blockers |
| Backlog Refinement | 1 hour weekly | Prepare next sprint |
| Sprint Review | 1 hour | Demo increment |
| Retrospective | 45 minutes | Improve process |
| Technical Design Sync | 45 minutes weekly | Resolve architecture questions |
| Bug Triage | 30 minutes as needed | Prioritize defects |

---

## 5. Sprint 0: Foundation & Project Bootstrap

### Goal

Membuat fondasi teknis agar semua pengembang dapat mulai bekerja dengan stabil.

### Target Outcome

1. Repository siap.
2. Local environment dapat dijalankan.
3. Database baseline siap.
4. CI basic berjalan.
5. Dokumentasi developer awal tersedia.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-001 | Repository Structure | 3 | Tech Lead |
| US-002 | Local Development with Docker Compose | 5 | DevOps/Backend |
| US-003 | CI Pipeline | 5 | DevOps |
| EN-001 | Define coding standard | 2 | Tech Lead |
| EN-002 | Prepare mock AIS sample data | 3 | Data Engineer |
| EN-003 | Setup issue board and labels | 1 | PM |
| EN-004 | Setup basic frontend shell | 3 | Frontend |
| EN-005 | Setup backend skeleton | 3 | Backend |

Estimated Points: 25

### Engineering Tasks

#### Backend

1. Create backend project structure.
2. Add health endpoint placeholder.
3. Add configuration module.
4. Add logging module.

#### Frontend

1. Create Next.js project shell.
2. Add base layout.
3. Add routing skeleton.
4. Add design tokens.

#### Database

1. Add PostgreSQL/PostGIS container.
2. Create migration folder.
3. Prepare initial schema placeholder.

#### DevOps

1. Add Docker Compose.
2. Add CI workflow.
3. Add lint and build commands.

### Acceptance Criteria

1. `docker compose up` starts local stack.
2. Frontend loads default page.
3. Backend health endpoint responds.
4. CI executes lint/build.
5. README explains local setup.

### Demo

Show local app running from clean clone.

---

## 6. Sprint 1: AIS Ingestion & Database Baseline

### Goal

Membangun alur pertama dari AIS data source ke database.

### Target Outcome

1. AIS provider/mock provider dapat dipanggil.
2. Raw AIS response disimpan.
3. Canonical payload terbentuk.
4. Core database schema tersedia.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-010 | Configure AIS Provider Credential | 3 | Backend/DevOps |
| US-011 | AIS Polling by Area | 8 | Backend |
| US-020 | Normalize AIS Payload | 8 | Backend/Data |
| US-021 | Validate AIS Position | 5 | Backend/Data |
| US-030 | Create Core Database Schema | 8 | Data/Backend |
| QA-001 | Test data validation cases | 3 | QA |

Estimated Points: 35

### Engineering Tasks

1. Implement AIS provider adapter interface.
2. Implement mock provider adapter.
3. Implement real provider adapter behind config.
4. Implement polling service.
5. Store raw response in `raw_ais_messages`.
6. Normalize to canonical AIS object.
7. Validate lat/lon/timestamp/speed.
8. Add migration for core tables.
9. Add basic ingestion logs.

### Acceptance Criteria

1. Polling service runs on configured interval.
2. Raw data stored with provider name and timestamp.
3. Valid AIS payload passes validation.
4. Invalid AIS payload rejected with reason.
5. Database migration applies successfully.

### Demo

Show mock/live AIS data entering raw and normalized tables.

### Risks

| Risk | Mitigation |
|---|---|
| AIS credential not ready | Use mock provider and sample replay |
| Provider schema differs | Adapter abstraction |
| Bad data quality | Validation rules and rejected log |

---

## 7. Sprint 2: Vessel API & Latest Position

### Goal

Menyediakan API dasar untuk daftar kapal, detail kapal, dan latest position.

### Target Outcome

1. Vessel data dapat dibuat/di-update dari AIS.
2. Latest position tersedia.
3. REST API awal dapat dikonsumsi frontend.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-022 | Deduplicate AIS Message | 5 | Backend |
| US-031 | Latest Position Upsert | 5 | Backend/Data |
| US-040 | Vessel List API | 5 | Backend |
| US-041 | Vessel Detail API | 3 | Backend |
| US-130 | Application Health Endpoint | 2 | Backend/DevOps |
| QA-002 | API tests for vessel endpoints | 5 | QA |
| FE-001 | Basic vessel list integration | 5 | Frontend |

Estimated Points: 30

### Engineering Tasks

1. Implement deduplication key.
2. Implement latest position upsert.
3. Implement vessel auto-upsert by MMSI.
4. Create `GET /api/v1/vessels`.
5. Create `GET /api/v1/vessels/{mmsi}`.
6. Create `GET /api/v1/vessels/latest` with bbox filter.
7. Add API pagination and response envelope.
8. Add health endpoint with database check.

### Acceptance Criteria

1. Duplicate AIS message is not inserted twice.
2. Latest position only updates with newer timestamp.
3. Vessel list API supports search and pagination.
4. Vessel detail API returns latest position.
5. Health endpoint returns healthy/degraded.

### Demo

Show API response in Swagger/Postman and basic frontend list.

---

## 8. Sprint 3: Realtime Map Dashboard

### Goal

Membangun dashboard peta real-time dengan WebSocket update.

### Target Outcome

1. Map dashboard muncul.
2. Vessel marker tampil.
3. Marker bergerak/update melalui WebSocket.
4. BBox subscription tersedia.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-050 | WebSocket Connect and Authenticate | 5 | Backend |
| US-051 | Subscribe Vessel Positions by BBox | 8 | Backend |
| US-060 | Display Vessel Markers on Map | 8 | Frontend |
| US-061 | Vessel Marker Popup | 3 | Frontend |
| QA-003 | WebSocket event tests | 5 | QA |
| UX-001 | Map state loading/error/empty | 3 | Frontend |

Estimated Points: 32

### Engineering Tasks

#### Backend

1. Implement WebSocket gateway.
2. Implement auth handshake placeholder or JWT validation.
3. Implement subscribe/unsubscribe by bbox.
4. Push position update event.
5. Implement heartbeat.
6. Implement throttling basic.

#### Frontend

1. Add MapLibre/Leaflet map component.
2. Load initial latest positions.
3. Render vessel markers.
4. Connect to WebSocket.
5. Update marker position from event.
6. Add marker popup.
7. Add map controls.

### Acceptance Criteria

1. Operator sees vessels on map after page load.
2. Map updates without refresh.
3. WebSocket reconnects after network interruption.
4. BBox updates when user pans/zooms.
5. Marker popup displays vessel summary.

### Demo

Show simulated vessel movement updating on the map.

---

## 9. Sprint 4: Vessel Detail, Auth, RBAC & Audit

### Goal

Membuat akses sistem aman dan vessel detail siap digunakan.

### Target Outcome

1. Login tersedia.
2. Role-based access basic tersedia.
3. Vessel detail page tersedia.
4. Audit log untuk aksi penting mulai tercatat.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-070 | Vessel List Page | 5 | Frontend |
| US-071 | Vessel Detail Page | 5 | Frontend |
| US-120 | User Login | 5 | Backend/Frontend |
| US-121 | Role-Based Access Control | 5 | Backend |
| US-122 | Audit Log | 5 | Backend |
| QA-004 | Auth and RBAC test | 5 | QA |

Estimated Points: 30

### Engineering Tasks

1. Implement login endpoint or identity provider integration.
2. Implement JWT/session validation.
3. Implement RBAC middleware.
4. Add protected routes frontend.
5. Build vessel detail page.
6. Build vessel list page.
7. Add audit log table and service.
8. Log login, geofence change, alert action, export action.

### Acceptance Criteria

1. User cannot access dashboard without login.
2. Viewer cannot create/edit geofence.
3. Operator can view and acknowledge alert.
4. Admin can manage geofence.
5. Vessel detail shows current and recent movement data.
6. Audit log records protected actions.

### Demo

Show login as Admin vs Viewer and different UI permissions.

---

## 10. Sprint 5: Geofence Management

### Goal

Menyediakan pembuatan geofence dan konfigurasi rule.

### Target Outcome

1. User dapat membuat polygon geofence.
2. Rule geofence dapat dikonfigurasi.
3. Backend menyimpan geometry dan rule.
4. Geofence muncul di map dashboard.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-080 | Create Polygon Geofence | 8 | Frontend/Backend |
| US-081 | Configure Geofence Rule | 8 | Backend/Frontend |
| US-082 | Geofence Status Panel | 5 | Frontend |
| BE-001 | Geofence spatial query service | 5 | Backend/GIS |
| QA-005 | Geofence CRUD and geometry tests | 5 | QA |

Estimated Points: 31

### Engineering Tasks

1. Create geofence API CRUD.
2. Validate polygon geometry.
3. Add geofence editor UI.
4. Add polygon draw/edit/delete.
5. Add rule form for enter/exit/dwell/speed.
6. Add map overlay for active geofences.
7. Add geofence status panel.
8. Add PostGIS query helper.

### Acceptance Criteria

1. Admin can create polygon geofence.
2. Admin can edit and deactivate geofence.
3. Invalid polygon is rejected.
4. Active geofence appears on map.
5. Rule config is persisted.

### Demo

Create a geofence area on map and show it active.

---

## 11. Sprint 6: Alert Engine & Alert Inbox

### Goal

Mendeteksi pelanggaran rule dan mengelola alert lifecycle.

### Target Outcome

1. Geofence rule menghasilkan alert.
2. Alert muncul real-time.
3. Operator dapat acknowledge dan resolve alert.
4. Deduplication dan cooldown tersedia.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-052 | Realtime Alert Event | 5 | Backend |
| US-090 | Generate Geofence Alert | 8 | Backend/GIS |
| US-091 | Alert Inbox | 5 | Frontend |
| US-092 | Acknowledge and Resolve Alert | 5 | Backend/Frontend |
| BE-002 | Alert deduplication and cooldown | 5 | Backend |
| QA-006 | Alert lifecycle tests | 5 | QA |

Estimated Points: 33

### Engineering Tasks

1. Implement geofence rule evaluator.
2. Implement enter/exit detection.
3. Implement dwell/speed rule if scoped.
4. Create alert table operations.
5. Implement alert deduplication.
6. Implement cooldown.
7. Push alert event via WebSocket.
8. Build alert inbox UI.
9. Build alert detail UI.
10. Implement acknowledge/resolve API.

### Acceptance Criteria

1. Vessel entering restricted geofence creates alert.
2. Same condition does not spam duplicate alerts.
3. Alert appears in alert inbox and WebSocket.
4. Operator can acknowledge alert.
5. Operator can resolve alert with notes.
6. Audit log records alert actions.

### Demo

Move/replay vessel into geofence and show alert lifecycle.

---

## 12. Sprint 7: Playback, Analytics, UAT & Release Hardening

### Goal

Menyelesaikan fitur pendukung MVP dan mempersiapkan UAT/release candidate.

### Target Outcome

1. Vessel history API siap.
2. Playback dasar tersedia.
3. KPI dashboard tersedia.
4. UAT test case dieksekusi.
5. Monitoring, backup, dan runbook siap.

### Sprint Backlog

| Story ID | Story | Points | Owner |
|---|---|---:|---|
| US-042 | Vessel History API | 5 | Backend |
| US-100 | Display Track History | 8 | Frontend |
| US-101 | Playback Route | 8 | Frontend |
| US-110 | Dashboard KPI | 5 | Backend/Frontend |
| US-131 | Metrics Dashboard | 5 | DevOps/Backend |
| US-140 | Automated API Test Suite | 5 | QA |
| US-141 | UAT Scenario Pack | 3 | QA/PO |
| OPS-001 | Backup and restore drill | 5 | DevOps |
| OPS-002 | Production readiness checklist | 3 | PM/DevOps |

Estimated Points: 47

If capacity is limited, split Sprint 7 into Sprint 7A and Sprint 7B.

### Engineering Tasks

1. Implement history API with time range.
2. Implement sampled route query.
3. Build route polyline display.
4. Build playback controls.
5. Add KPI cards.
6. Add monitoring dashboard.
7. Add API automated tests.
8. Prepare UAT pack.
9. Run backup and restore test.
10. Close P0/P1 defects.

### Acceptance Criteria

1. User can view historical route for selected vessel.
2. User can play/pause route playback.
3. KPI cards show active vessels, alerts today, in-port, average speed.
4. UAT test pack available.
5. No critical/high defect remains open unless explicitly waived.
6. Deployment and operations runbook are ready.

### Demo

Show complete MVP flow: login, realtime map, geofence alert, alert resolve, playback.

---

## 13. Cross-Sprint Technical Enablers

| Enabler ID | Description | Target Sprint |
|---|---|---|
| EN-API-DOC | Swagger/OpenAPI documentation | Sprint 2 onward |
| EN-SEED | Demo data generator | Sprint 1 onward |
| EN-LOG | Structured logging | Sprint 1 onward |
| EN-METRIC | Metrics instrumentation | Sprint 3 onward |
| EN-SEC | Security headers and basic hardening | Sprint 4 onward |
| EN-PERF | Map performance tuning | Sprint 3 onward |
| EN-OBS | Dashboard and alerting for system health | Sprint 7 |

---

## 14. Testing Plan by Sprint

| Sprint | Testing Focus |
|---|---|
| Sprint 0 | Build, lint, local run |
| Sprint 1 | Ingestion validation, database migration |
| Sprint 2 | REST API, latest position, dedup |
| Sprint 3 | WebSocket, map update, reconnect |
| Sprint 4 | Auth, RBAC, audit |
| Sprint 5 | Geofence CRUD, spatial validation |
| Sprint 6 | Alert generation, lifecycle, cooldown |
| Sprint 7 | Playback, KPI, regression, UAT |

---

## 15. Definition of Done per Sprint

A sprint backlog item is done when:

1. Code is merged to main/develop branch.
2. Code review completed.
3. Relevant tests pass.
4. API/WebSocket contract updated if changed.
5. UI checked against wireframe.
6. No critical/high defect introduced.
7. Feature deployed to staging.
8. Product Owner accepts the story.

---

## 16. Release Candidate Plan

### RC Preparation Checklist

1. All P0 stories complete.
2. UAT environment stable.
3. AIS provider integration validated.
4. Test data and live data scenario available.
5. Backup configured.
6. Monitoring active.
7. Runbook ready.
8. Security checklist completed.
9. Known issues documented.
10. Go/no-go review scheduled.

### RC Exit Criteria

1. UAT P0 pass rate 100%.
2. Critical defects: 0.
3. High defects: 0 or approved waiver.
4. API p95 acceptable.
5. WebSocket stable during demo window.
6. Operator can complete end-to-end workflow.

---

## 17. Sprint Board Columns

Recommended board columns:

```text
Backlog
Ready
In Progress
Code Review
QA / Testing
UAT Review
Done
Blocked
```

Recommended labels:

```text
frontend
backend
database
gis
websocket
ingestion
security
devops
qa
bug
technical-debt
p0
p1
p2
blocked
```

---

## 18. Sprint Reporting Template

```markdown
# Sprint Report

## Sprint Goal

## Completed Stories
| Story | Points | Notes |

## Not Completed
| Story | Reason | Next Action |

## Demo Summary

## Defects
| Severity | Count | Notes |

## Risks / Blockers

## Velocity
- Planned points:
- Completed points:
- Carry-over:

## Next Sprint Focus
```

---

## 19. Dependency and Blocker Rules

1. Blocker older than 2 working days must be escalated.
2. AIS provider blocker triggers mock provider fallback.
3. Database schema blocker triggers architecture review.
4. UI dependency blocker uses static mock data temporarily.
5. Security blocker can stop release candidate.

---

## 20. Acceptance Criteria for This Document

Dokumen ini diterima jika:

1. Sprint 0 sampai Sprint 7 memiliki goal, backlog, tasks, dan acceptance criteria.
2. Sprint plan selaras dengan backlog dan roadmap.
3. Testing focus per sprint tersedia.
4. Release candidate criteria tersedia.
5. Dokumen dapat langsung digunakan sebagai acuan delivery harian.
