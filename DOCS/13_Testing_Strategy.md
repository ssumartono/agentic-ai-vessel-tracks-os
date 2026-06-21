# 13 Testing Strategy

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Document Type:** Testing Strategy  
**Version:** 1.0  
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

---

## 1. Purpose

Dokumen ini mendefinisikan strategi pengujian untuk **Real Time Vessel Tracking System / VesselTrack OS**. Tujuannya adalah memastikan aplikasi dapat menerima data AIS, memproses posisi kapal, menampilkan tracking real-time, menyimpan histori, menjalankan geofence, menghasilkan alert, dan mendukung operasi monitoring dengan kualitas yang dapat dipercaya.

Strategi ini dirancang untuk fase **MVP** terlebih dahulu, tetapi tetap menyediakan jalur menuju hardening production.

---

## 2. Testing Objectives

Tujuan utama testing adalah:

1. Memastikan data AIS dari provider dapat diambil, divalidasi, dinormalisasi, dan disimpan dengan benar.
2. Memastikan posisi kapal tampil real-time pada dashboard peta.
3. Memastikan histori pergerakan kapal dapat ditampilkan dan diputar ulang.
4. Memastikan geofence rule menghasilkan event yang akurat.
5. Memastikan alert lifecycle berjalan dari `open`, `acknowledged`, sampai `resolved`.
6. Memastikan REST API dan WebSocket memenuhi kontrak yang telah ditentukan.
7. Memastikan sistem aman terhadap akses tidak sah.
8. Memastikan performa sistem cukup untuk target MVP.
9. Memastikan deployment dapat dilakukan, dipantau, dan di-rollback dengan aman.
10. Memastikan user operator dapat menggunakan aplikasi tanpa kebingungan besar.

---

## 3. Scope of Testing

### 3.1 In Scope

Testing mencakup:

- AIS API ingestion.
- Data normalization.
- Data validation.
- Database persistence.
- Latest vessel position update.
- Historical vessel position query.
- REST API.
- WebSocket real-time event.
- Frontend dashboard.
- Map rendering.
- Vessel marker movement.
- Vessel detail panel.
- Geofence management.
- Geofence rule evaluation.
- Alert generation.
- Alert notification simulation.
- Playback route.
- Authentication and authorization.
- Audit log.
- Observability.
- Deployment smoke test.
- Basic performance and load test.
- Security baseline test.

### 3.2 Out of Scope for MVP

Berikut belum menjadi prioritas MVP:

- Multi-provider AIS reconciliation tingkat lanjut.
- Machine learning anomaly detection.
- Collision risk prediction tingkat lanjut.
- Satellite AIS receiver ownership.
- Native mobile app.
- Full offline mode.
- Advanced route optimization.
- Full SOC-grade security testing.
- Formal penetration test oleh pihak ketiga.

---

## 4. Testing Principles

Prinsip pengujian:

1. **Test early, test often**  
   Pengujian dilakukan sejak modul kecil, bukan menunggu sistem jadi kapal besar baru diceburkan.

2. **Contract-first testing**  
   API, WebSocket, dan data payload diuji terhadap spesifikasi.

3. **Data quality is product quality**  
   Pada sistem tracking kapal, data buruk akan langsung terlihat sebagai marker nyasar, loncat, atau hilang.

4. **Geospatial correctness matters**  
   Query spasial, polygon geofence, dan koordinat harus diuji secara khusus.

5. **Realtime must degrade gracefully**  
   Jika WebSocket putus, aplikasi harus dapat reconnect dan menampilkan status yang jelas.

6. **Security is not final polish**  
   Authentication, authorization, audit, dan rate limit diuji sejak MVP.

7. **Operational readiness is part of testing**  
   Backup, rollback, health check, log, dan monitoring harus ikut diuji.

---

## 5. Test Levels

### 5.1 Unit Testing

Unit test memvalidasi fungsi kecil secara terisolasi.

Target coverage MVP:

| Area | Minimum Coverage |
|---|---:|
| Backend business logic | 70% |
| Geofence rule engine | 80% |
| AIS normalization | 80% |
| Alert lifecycle logic | 80% |
| Frontend utility/helper | 60% |

Contoh unit yang diuji:

- AIS payload mapper.
- Coordinate validator.
- Speed validator.
- Deduplication key generator.
- Haversine distance calculator.
- Bounding box helper.
- Geofence enter/exit detector.
- Alert severity mapper.
- Alert cooldown evaluator.
- RBAC permission checker.

---

### 5.2 Integration Testing

Integration test memvalidasi kerja antar-komponen.

Komponen utama:

- Ingestion service → database.
- API service → PostgreSQL/PostGIS.
- API service → Redis cache.
- WebSocket gateway → frontend client.
- Geofence engine → alert engine.
- Alert engine → notification adapter.
- Auth service → protected API endpoint.

Contoh skenario:

1. Data AIS masuk dari provider mock.
2. Sistem normalisasi payload.
3. Sistem menyimpan ke `vessel_positions`.
4. Sistem memperbarui `vessel_latest_positions`.
5. WebSocket mengirim `vessel.position.updated`.
6. Dashboard menerima update dan memperbarui marker.

---

### 5.3 End-to-End Testing

E2E test memvalidasi alur nyata dari sudut pandang user.

Prioritas E2E MVP:

1. Login sebagai operator.
2. Buka dashboard.
3. Lihat kapal aktif di peta.
4. Search kapal berdasarkan MMSI.
5. Klik marker kapal.
6. Lihat vessel detail.
7. Buka histori kapal.
8. Jalankan playback.
9. Buat geofence.
10. Trigger alert dari data simulasi.
11. Acknowledge alert.
12. Resolve alert.

Tools yang dapat digunakan:

- Playwright.
- Cypress.
- Postman/Newman untuk API workflow.
- k6 untuk load test API/WebSocket.

---

### 5.4 User Acceptance Testing

UAT dilakukan bersama calon operator, analyst, dan admin.

Fokus UAT:

- Apakah peta mudah dipahami?
- Apakah status kapal jelas?
- Apakah alert mudah ditindaklanjuti?
- Apakah geofence editor cukup intuitif?
- Apakah playback membantu investigasi?
- Apakah terminology sesuai konteks operasional maritime?

Output UAT:

- UAT scenario checklist.
- Issue log.
- User feedback summary.
- Go/no-go recommendation.

---

## 6. Test Types

## 6.1 Functional Testing

Functional testing memastikan fitur berjalan sesuai requirement.

### Test Area

| Module | Key Tests |
|---|---|
| Dashboard | KPI, map, search, filter, marker |
| Vessel Registry | list, detail, metadata, search |
| Realtime Tracking | live update, marker movement, last seen |
| History | query by MMSI/time range, route line |
| Playback | play, pause, timeline, speed |
| Geofence | create, edit, delete, polygon validation |
| Alert | create, acknowledge, resolve, filter |
| Admin | user, role, data source settings |
| Audit | action recorded, actor recorded |

---

## 6.2 API Testing

API test mengacu pada `06_API_Specification.md`.

### API Test Checklist

- Endpoint exists.
- Method sesuai spesifikasi.
- Request validation berjalan.
- Response envelope konsisten.
- Error model konsisten.
- Pagination berjalan.
- Filtering berjalan.
- Sorting berjalan.
- Authentication wajib untuk protected endpoint.
- RBAC membatasi akses sesuai role.
- Rate limit aktif untuk endpoint sensitif.
- Idempotency berjalan untuk ingestion bila diperlukan.

### Example API Test Matrix

| Endpoint | Test Scenario | Expected Result |
|---|---|---|
| `GET /v1/vessels` | valid token | 200 with vessel list |
| `GET /v1/vessels` | no token | 401 |
| `GET /v1/vessels/{mmsi}` | known MMSI | 200 with detail |
| `GET /v1/vessels/{mmsi}` | unknown MMSI | 404 |
| `GET /v1/vessels/{mmsi}/history` | valid time range | 200 with positions |
| `POST /v1/geofences` | admin role | 201 created |
| `POST /v1/geofences` | viewer role | 403 |
| `POST /v1/alerts/{id}/ack` | operator role | 200 acknowledged |
| `POST /v1/ingestion/ais` | valid API key | 202 accepted |
| `POST /v1/ingestion/ais` | invalid API key | 401 |

---

## 6.3 WebSocket Testing

WebSocket test mengacu pada `07_Realtime_WebSocket_Spec.md`.

### WebSocket Test Areas

- Connection establishment.
- Token authentication.
- Subscribe channel.
- Unsubscribe channel.
- Bbox filtering.
- Vessel MMSI filtering.
- Heartbeat ping/pong.
- Reconnect behavior.
- Duplicate event handling.
- Out-of-order event handling.
- Backpressure behavior.
- Server-side throttling.

### WebSocket Event Tests

| Event | Scenario | Expected Result |
|---|---|---|
| `vessel.position.updated` | new valid position | client receives update |
| `vessel.position.updated` | outside bbox | client does not receive update |
| `alert.created` | geofence violation | client receives alert event |
| `alert.updated` | alert acknowledged | client updates alert state |
| `geofence.event` | vessel enters polygon | event appears in stream |
| `system.heartbeat` | active session | heartbeat received periodically |

---

## 6.4 Data Quality Testing

Data quality adalah jantung sistem ini. Marker kapal yang salah bisa membuat operator mengejar bayangan.

### Validation Rules

| Rule | Test |
|---|---|
| Latitude range | reject if `< -90` or `> 90` |
| Longitude range | reject if `< -180` or `> 180` |
| MMSI presence | reject if missing for tracked vessel |
| Timestamp presence | reject if missing or invalid |
| Future timestamp | flag if too far ahead |
| Duplicate message | deduplicate by `source + mmsi + timestamp + lat + lon` |
| Speed impossible | flag if unrealistic jump |
| Position jump | flag if distance/time implies impossible speed |
| Null navigation status | allow but mark quality score lower |

### Data Quality Output

Each ingested message should be assigned:

```json
{
  "quality_score": 0.92,
  "quality_flags": ["VALID_COORDINATE", "VALID_TIMESTAMP", "VALID_MMSI"]
}
```

---

## 6.5 Geospatial Testing

Geospatial test memvalidasi PostGIS query, polygon, bbox, dan coordinate logic.

### Geospatial Test Cases

| Case | Input | Expected |
|---|---|---|
| Point inside polygon | vessel point in geofence | `inside = true` |
| Point outside polygon | vessel point outside geofence | `inside = false` |
| Point on boundary | point exactly on polygon boundary | consistent rule applied |
| Invalid polygon | self-intersecting polygon | rejected |
| Empty polygon | no coordinate | rejected |
| Large polygon | regional area | accepted if valid |
| Bbox query | visible map extent | only vessels in bbox returned |
| Route intersects geofence | track line crosses polygon | event detected if rule enabled |

### Boundary Policy

Untuk MVP, titik pada boundary geofence dianggap **inside** agar sistem tidak gagal menangkap pelanggaran di tepi area.

---

## 6.6 Geofence Rule Testing

Mengacu pada `08_Geofence_Rule_Spec.md`.

### Rule Test Matrix

| Rule | Scenario | Expected |
|---|---|---|
| Enter geofence | outside → inside | `geofence.entered` |
| Exit geofence | inside → outside | `geofence.exited` |
| Dwell time | inside > threshold | `geofence.dwell_exceeded` |
| Speed limit | speed > max inside zone | `speed.violation` |
| AIS silence | last update > threshold | `ais.silence` |
| Route deviation | vessel outside route corridor | `route.deviation` |
| Cooldown | repeat event within cooldown | no duplicate alert |
| Hysteresis | boundary jitter | no alert storm |

---

## 6.7 Alerting Testing

Mengacu pada `09_Alerting_Spec.md`.

### Alert Lifecycle Test

```text
created → open → acknowledged → in_progress → resolved → closed
```

### Alert Test Cases

| Scenario | Expected |
|---|---|
| Geofence violation creates alert | alert state `open` |
| Operator acknowledges alert | state becomes `acknowledged` |
| Operator resolves alert | state becomes `resolved` |
| Same violation within cooldown | no duplicate alert |
| Different severity event | alert severity updated if policy allows |
| Notification channel unavailable | retry and log failure |
| Alert assigned to user | assignee recorded |
| Alert commented | comment stored in audit trail |

---

## 6.8 Frontend Testing

Frontend testing mengacu pada `10_UI_UX_Wireframe.md`.

### UI Test Areas

- Layout consistency.
- Sidebar navigation.
- Search behavior.
- Map loading.
- Marker rendering.
- Marker clustering if enabled.
- Vessel detail drawer/panel.
- Alert panel.
- Geofence editor.
- Playback control.
- Loading state.
- Empty state.
- Error state.
- Permission-based UI state.

### Visual Regression

Untuk production readiness, gunakan screenshot comparison untuk halaman utama:

- Dashboard.
- Map view.
- Vessel detail.
- Geofence editor.
- Alert inbox.
- Playback screen.

---

## 6.9 Security Testing

Mengacu pada `11_Security_Model.md`.

### Security Test Checklist

| Area | Test |
|---|---|
| Authentication | invalid token rejected |
| Authorization | viewer cannot create geofence |
| Session | expired token rejected |
| API key | invalid ingestion key rejected |
| Rate limit | excessive request throttled |
| Input validation | malicious payload rejected |
| SQL injection | parameterized query verified |
| XSS | unsafe input escaped |
| CORS | restricted origin applied |
| WebSocket auth | unauthorized connection rejected |
| Audit log | sensitive action recorded |
| Secrets | no secret in repository/log |
| TLS | HTTPS/WSS required in non-local env |

### MVP Security Gate

Sebelum MVP release:

- No hardcoded secret.
- No public admin endpoint.
- No unauthenticated protected API.
- No direct database exposure.
- No WebSocket without token.
- No plaintext API key in frontend.
- Basic dependency scan passed.

---

## 6.10 Performance Testing

### MVP Performance Targets

| Metric | Target MVP |
|---|---:|
| Dashboard initial load | <= 3 seconds on normal broadband |
| API p95 response for vessel list | <= 500 ms |
| API p95 response for latest positions | <= 700 ms |
| WebSocket event delivery | <= 2 seconds after processed event |
| Map marker update | <= 1 second after received event |
| Ingestion processing latency | <= 5 seconds from provider poll to DB |
| Geofence evaluation | <= 2 seconds per batch cycle |
| Concurrent dashboard users | 25 users MVP |
| Active vessels visible | 1,000 vessels MVP target |

### Load Test Scenarios

1. 1,000 active vessels, update every 30 seconds.
2. 5,000 historical points query for one vessel.
3. 25 concurrent dashboard users.
4. 100 alerts in one hour.
5. 10 geofences active.
6. WebSocket reconnect storm from 25 clients.

---

## 6.11 Reliability Testing

Reliability tests ensure the system survives rough seas.

### Scenarios

| Failure | Expected Behavior |
|---|---|
| AIS provider timeout | retry and log error |
| AIS provider returns malformed data | reject or quarantine record |
| Database unavailable | ingestion pauses or queues safely |
| Redis unavailable | fallback/degraded mode documented |
| WebSocket disconnect | frontend reconnects automatically |
| Notification gateway fails | retry and mark delivery failed |
| High duplicate data | dedup prevents DB bloat |
| Server restart | services recover cleanly |

---

## 6.12 Deployment Testing

Mengacu pada `12_Deployment_Plan.md`.

### Deployment Test Types

- Build test.
- Container start test.
- Migration test.
- Health check test.
- Smoke test.
- Rollback test.
- Backup restore test.
- Environment variable validation.
- TLS certificate validation.
- Observability endpoint validation.

### Smoke Test After Deployment

Minimum smoke test:

1. Frontend loads.
2. Login works.
3. Dashboard opens.
4. Vessel list API returns data.
5. Latest position API returns data.
6. WebSocket connects.
7. Test vessel update appears on map.
8. Create test geofence.
9. Trigger test alert.
10. Log and metric visible.

---

## 7. Test Data Strategy

## 7.1 Types of Test Data

| Type | Description |
|---|---|
| Synthetic AIS data | Generated test vessel positions |
| Provider mock data | Recorded sample from AIS API provider |
| Edge case data | Invalid coordinate, future timestamp, duplicate |
| Geofence test data | Known polygon and known vessel points |
| Alert test data | Predefined event triggers |
| User test data | Admin, operator, analyst, viewer |

---

## 7.2 Synthetic Vessel Dataset

Minimum synthetic dataset:

| Dataset | Count |
|---|---:|
| Vessels | 100 |
| Active vessels | 50 |
| Historical positions | 50,000 |
| Geofences | 10 |
| Alerts | 200 |
| Users | 10 |

---

## 7.3 Test Vessel Profiles

| MMSI | Name | Type | Purpose |
|---|---|---|---|
| 525123456 | MV Musi Jaya | Cargo | normal tracking |
| 525987654 | MV Samudra Raya | Tanker | geofence violation |
| 525333222 | TB Bahari 02 | Tugboat | AIS silence |
| 525765432 | MV Sejahtera Abadi | Cargo | speed violation |
| 525888111 | KM Lautan Sejahtera | Passenger | port entry |

---

## 8. Test Environment Strategy

### 8.1 Environments

| Environment | Purpose | Data |
|---|---|---|
| Local | developer testing | synthetic only |
| Dev | integration testing | synthetic + provider mock |
| Staging | UAT and release candidate | masked/sample provider data |
| Production | live operation | live provider data |

### 8.2 Environment Rules

- Production data should not be copied to local without masking and approval.
- Secrets must use environment-specific secret storage.
- Test provider keys must be separated from production keys.
- Staging should mirror production as closely as possible for release testing.

---

## 9. Test Automation Strategy

### 9.1 Automation Pyramid

```text
             E2E Tests
          Integration Tests
       API + WebSocket Tests
    Unit Tests + Static Analysis
```

### 9.2 CI Pipeline Test Gates

On pull request:

1. Lint.
2. Type check.
3. Unit test.
4. API contract test.
5. Security dependency scan.
6. Container build.

On staging deployment:

1. Database migration test.
2. Integration test.
3. Smoke test.
4. E2E critical path.
5. Basic load test.

Before production release:

1. Full regression.
2. Security gate.
3. Backup verification.
4. Rollback verification.
5. UAT sign-off.

---

## 10. Defect Management

### 10.1 Severity

| Severity | Definition | Example |
|---|---|---|
| S1 Critical | system unusable or data loss | dashboard down, ingestion stops completely |
| S2 High | key business flow broken | geofence alert not created |
| S3 Medium | feature partially broken | filter incorrect in some cases |
| S4 Low | cosmetic/minor issue | label alignment issue |

### 10.2 Priority

| Priority | Meaning |
|---|---|
| P0 | must fix before release |
| P1 | fix in current sprint |
| P2 | fix soon |
| P3 | backlog |

### 10.3 Defect Fields

Each defect should include:

- Title.
- Module.
- Severity.
- Priority.
- Environment.
- Steps to reproduce.
- Expected result.
- Actual result.
- Screenshot/log if available.
- API request/response if relevant.
- Browser/device if frontend issue.
- Assignee.
- Status.

---

## 11. Traceability Matrix

| Requirement Area | Source Document | Test Type |
|---|---|---|
| Realtime map | PRD, UI/UX | E2E, WebSocket, Frontend |
| Vessel detail | PRD, API, UI/UX | API, E2E |
| AIS ingestion | Data Source, Data Model | Unit, Integration, Data Quality |
| Latest position | Data Model, ERD | Integration, API |
| Track history | PRD, ERD, API | API, E2E, Performance |
| Geofence | Geofence Spec, ERD | Unit, Integration, Geospatial |
| Alerting | Alerting Spec | Unit, Integration, E2E |
| Auth/RBAC | Security Model | Security, API |
| Deployment | Deployment Plan | Smoke, Rollback, Reliability |
| Observability | Architecture, Deployment | Operational Test |

---

## 12. Release Readiness Criteria

MVP release is considered ready if:

1. All P0 defects are closed.
2. No unresolved S1/S2 defect remains.
3. Critical E2E flow passes.
4. API contract tests pass.
5. WebSocket tests pass.
6. Geofence rule tests pass.
7. Alert lifecycle tests pass.
8. Security MVP gate passes.
9. Deployment smoke test passes.
10. Backup and rollback procedure tested.
11. UAT sign-off received.
12. Known limitations documented.

---

## 13. MVP Test Plan

### Sprint 1: Foundation

Test focus:

- Database schema migration.
- AIS canonical data model.
- Basic API health.
- Basic auth.

Exit criteria:

- Schema deployable.
- Test data seedable.
- Health endpoint works.
- Unit test baseline established.

---

### Sprint 2: AIS Ingestion

Test focus:

- AIS provider mock.
- Ingestion validation.
- Deduplication.
- Latest position upsert.

Exit criteria:

- Valid AIS data stored.
- Invalid AIS data rejected/quarantined.
- Latest position always reflects newest timestamp.

---

### Sprint 3: Realtime Dashboard

Test focus:

- Vessel list API.
- Latest position API.
- WebSocket update.
- Map marker rendering.
- Search and vessel detail.

Exit criteria:

- Operator can see moving vessels on map.
- Marker updates without page refresh.
- Vessel detail opens correctly.

---

### Sprint 4: History and Playback

Test focus:

- History query.
- Route line rendering.
- Playback controls.
- API performance for historical points.

Exit criteria:

- User can replay vessel movement for selected time range.
- Large history query remains within acceptable latency.

---

### Sprint 5: Geofence and Alert

Test focus:

- Geofence CRUD.
- Polygon validation.
- Enter/exit detection.
- Alert lifecycle.
- Alert WebSocket event.

Exit criteria:

- Test vessel entering geofence creates alert.
- Operator can acknowledge and resolve alert.

---

### Sprint 6: Stabilization

Test focus:

- Regression.
- Security baseline.
- Performance test.
- Deployment smoke test.
- UAT.

Exit criteria:

- MVP release criteria met.

---

## 14. Sample Test Cases

### TC-001: AIS Position Ingestion Success

**Given** a valid AIS position payload  
**When** ingestion service receives the payload  
**Then** system stores the position in `vessel_positions`  
**And** updates `vessel_latest_positions`  
**And** emits `vessel.position.updated` event.

---

### TC-002: Invalid Coordinate Rejected

**Given** AIS payload with latitude `120.0`  
**When** ingestion service validates payload  
**Then** payload is rejected  
**And** error is logged  
**And** no marker update is sent.

---

### TC-003: Vessel Marker Updates in Realtime

**Given** operator is subscribed to dashboard map  
**When** new vessel position arrives within map bbox  
**Then** marker moves to new coordinate  
**And** last update timestamp changes.

---

### TC-004: Geofence Enter Alert

**Given** vessel is outside geofence GF-01  
**When** new position places vessel inside GF-01  
**Then** system creates `geofence.entered` event  
**And** creates alert with configured severity  
**And** sends WebSocket alert event.

---

### TC-005: Alert Acknowledgement

**Given** alert is open  
**When** operator clicks acknowledge  
**Then** alert status becomes `acknowledged`  
**And** acknowledgement user and timestamp are recorded  
**And** audit log is created.

---

### TC-006: Viewer Cannot Create Geofence

**Given** user role is `Viewer`  
**When** user sends `POST /v1/geofences`  
**Then** API returns `403 Forbidden`.

---

### TC-007: WebSocket Reconnect

**Given** dashboard WebSocket is connected  
**When** network drops temporarily  
**Then** client shows reconnecting status  
**And** reconnects automatically  
**And** resubscribes to previous channels.

---

### TC-008: Playback Route

**Given** vessel has historical positions between 06:00 and 10:00 UTC  
**When** user starts playback  
**Then** system animates route according to timeline  
**And** user can pause, resume, and scrub timeline.

---

## 15. Tools Recommendation

| Testing Need | Recommended Tool |
|---|---|
| Unit test backend | Jest / Pytest |
| API test | Postman, Newman, REST Assured |
| E2E frontend | Playwright |
| WebSocket test | Playwright, k6, custom script |
| Load test | k6 |
| DB test | pgTAP, SQL test scripts |
| Geospatial validation | PostGIS SQL test fixtures |
| Security scan | OWASP ZAP, npm audit, pip-audit, Trivy |
| Container scan | Trivy / Grype |
| Visual regression | Playwright screenshot comparison |
| Test management | GitHub Issues, Jira, Linear, TestRail |

---

## 16. Observability During Testing

During integration, staging, and load test, monitor:

- API latency.
- WebSocket connection count.
- WebSocket message rate.
- Ingestion success/failure count.
- AIS provider error rate.
- Database CPU/memory.
- Query latency.
- PostGIS query performance.
- Redis memory.
- Alert generation count.
- Notification delivery failure.
- Frontend error count.

---

## 17. Test Reporting

Each test cycle should produce:

- Test execution summary.
- Passed/failed test count.
- Defect summary by severity.
- Unresolved defect list.
- Performance result.
- Security scan result.
- UAT feedback.
- Release recommendation.

Example release recommendation:

```text
Recommendation: GO WITH CONDITIONS
Reason:
- All P0 and S1 defects closed.
- One S3 UI issue remains and documented.
- Performance test passed for 1,000 active vessels.
- Security MVP gate passed.
```

---

## 18. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| AIS provider data unstable | test blocked | use recorded mock data |
| Geofence false positive | operator distrust | use boundary and hysteresis tests |
| WebSocket flaky | poor realtime UX | reconnect and heartbeat test |
| Performance drops with many markers | dashboard slow | clustering and bbox filtering tests |
| Inadequate test data | bugs hidden | synthetic data generator |
| Security testing delayed | release risk | run baseline scan in CI |
| UAT too late | rework | involve operator during sprint demo |
| DB migration failure | deployment outage | migration dry-run and rollback test |

---

## 19. Acceptance Criteria

Testing strategy is accepted when:

1. Test levels are defined.
2. Test types are defined.
3. MVP test scope is clear.
4. Test environment strategy is clear.
5. Test data strategy is clear.
6. Critical test cases are documented.
7. Release readiness criteria are documented.
8. Security testing baseline is included.
9. Performance testing baseline is included.
10. UAT process is included.
11. Defect management process is included.
12. Strategy aligns with PRD, architecture, API, WebSocket, geofence, alerting, security, and deployment documents.

---

## 20. Next Documents

Recommended next document:

- `14_Roadmap.md`
- `15_Risk_Register.md`

---

## 21. Summary

Testing untuk **Real Time Vessel Tracking System** tidak cukup hanya memastikan tombol bisa diklik. Sistem ini harus membuktikan bahwa data kapal yang masuk benar, posisi bergerak secara real-time, geofence tidak rabun, alert tidak berteriak palsu, dan deployment tidak karam saat rilis.

Dengan strategi ini, MVP dapat diuji secara terstruktur dari lapisan data, backend, WebSocket, frontend, geospatial, alerting, security, sampai kesiapan operasional.
