# 19_UAT_Test_Cases.md
# User Acceptance Test Cases

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product & Engineering Team  

---


## 1. Purpose

Dokumen ini berisi skenario **User Acceptance Test (UAT)** untuk memvalidasi MVP **Real Time Vessel Tracking System / VesselTrack OS** dari perspektif pengguna bisnis, operator, analyst, dan admin.

UAT memastikan aplikasi bukan hanya “berjalan di laptop developer”, tetapi benar-benar bisa dipakai di ruang operasi, saat peta bergerak, alert berbunyi, dan operator perlu keputusan cepat.

---

## 2. UAT Objectives

UAT bertujuan memvalidasi bahwa user dapat:

1. Login sesuai role.
2. Melihat dashboard peta real-time.
3. Mencari dan melihat detail kapal.
4. Menerima update posisi kapal secara real-time.
5. Membuat dan mengaktifkan geofence.
6. Menerima alert dari rule geofence.
7. Acknowledge dan resolve alert.
8. Melihat histori dan playback rute kapal.
9. Melihat KPI dasar.
10. Mengekspor data sesuai permission.
11. Menggunakan sistem dengan performa yang dapat diterima.

---

## 3. UAT Scope

### 3.1 In Scope

| Module | Included |
|---|---|
| Authentication | Login/logout, role access |
| Dashboard | KPI, map, panels |
| Realtime Map | Marker, popup, update |
| Vessel | List, search, detail |
| Geofence | Create, edit, activate, deactivate |
| Alert | Generate, inbox, acknowledge, resolve |
| History | Track history and playback |
| Analytics | Basic KPI |
| Export | CSV/GeoJSON if implemented |
| Audit | Key action tracking |

### 3.2 Out of Scope for MVP UAT

1. Native mobile application.
2. AIS receiver hardware.
3. Advanced AI/ML prediction.
4. Multi-region deployment.
5. Billing/subscription.
6. Advanced collision risk.

---

## 4. UAT Roles

| Role | Test Focus |
|---|---|
| Admin | User access, geofence config, system settings |
| Operator | Realtime monitoring, alert response |
| Analyst | Vessel detail, history, playback, export |
| Viewer | Read-only access |
| Product Owner | End-to-end workflow acceptance |

---

## 5. UAT Environment

| Item | Requirement |
|---|---|
| Environment | Staging |
| Data source | AIS provider sandbox/live limited area or mock replay |
| Browser | Chrome/Edge latest stable |
| Test users | Admin, Operator, Analyst, Viewer |
| Test area | Defined monitoring area, e.g. port/coastal bounding box |
| Test vessels | At least 10 sample vessels with MMSI |
| Geofence | At least 2 test geofence areas |
| Alert scenario | At least 1 simulated vessel crossing geofence |

---

## 6. Test Data

### 6.1 Test Users

| User | Role | Expected Access |
|---|---|---|
| admin.uat@example.com | Admin | Full access |
| operator.uat@example.com | Operator | Monitor, acknowledge/resolve alerts |
| analyst.uat@example.com | Analyst | History, playback, export |
| viewer.uat@example.com | Viewer | Read-only dashboard and vessel detail |

### 6.2 Test Vessels

| Vessel Name | MMSI | Scenario |
|---|---|---|
| MV Musi Jaya | 525123456 | Selected vessel detail and playback |
| MV Samudra Raya | 525987654 | Geofence violation |
| TB Bahari 02 | 525333222 | AIS silence scenario |
| KM Lautan Sejahtera | 525888111 | Normal moving vessel |
| KMP Nusantara | 525444555 | Speed rule scenario |

---

## 7. UAT Pass/Fail Criteria

### 7.1 Test Case Status

| Status | Meaning |
|---|---|
| Pass | Actual result matches expected result |
| Fail | Expected result not met |
| Blocked | Cannot execute due to dependency or environment issue |
| Not Run | Not executed yet |
| Waived | Accepted with known limitation |

### 7.2 MVP Acceptance Threshold

| Criterion | Target |
|---|---:|
| P0 test cases pass | 100% |
| P1 test cases pass | >= 90% |
| Critical defects | 0 |
| High defects | 0 or approved waiver |
| Medium defects | Documented and prioritized |
| Operator end-to-end flow | Pass |

---

## 8. UAT Test Cases

## 8.1 Authentication and Access Control

### UAT-001: Login as Admin

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Admin |
| Precondition | Admin user exists |
| Steps | 1. Open application URL. 2. Enter admin credential. 3. Click login. |
| Expected Result | User successfully logs in and sees dashboard. Admin menu/settings visible. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-002: Login as Operator

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | Operator user exists |
| Steps | 1. Login as operator. 2. Open dashboard. |
| Expected Result | Operator can see dashboard, vessels, map, alerts, but cannot access restricted admin-only settings. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-003: Viewer Read-Only Restriction

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Viewer |
| Precondition | Viewer user exists |
| Steps | 1. Login as viewer. 2. Open geofence page. 3. Try to create/edit geofence. |
| Expected Result | Viewer cannot create/edit geofence. UI hides or disables create/edit actions. Direct API call is rejected. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-004: Logout

| Field | Description |
|---|---|
| Priority | P1 |
| Role | All |
| Precondition | User is logged in |
| Steps | 1. Click profile menu. 2. Click logout. |
| Expected Result | User is logged out and redirected to login page. Protected page cannot be accessed without login. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.2 Dashboard and Realtime Map

### UAT-010: Open Dashboard

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | User logged in, AIS data available |
| Steps | 1. Open Dashboard. |
| Expected Result | Dashboard loads with KPI cards, realtime map, vessel markers, alert panel, and status indicator. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-011: Vessel Markers Displayed on Map

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | At least 10 latest vessel positions available |
| Steps | 1. Open Dashboard. 2. Observe map. |
| Expected Result | Vessel markers appear in correct monitoring area. Marker direction/heading appears when available. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-012: Realtime Position Update

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | WebSocket service running. Simulated/live vessel movement available. |
| Steps | 1. Open Dashboard. 2. Select a vessel. 3. Wait for new position event or trigger simulation. |
| Expected Result | Marker position updates without page refresh. Last update timestamp changes. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-013: Map Pan and Zoom

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Operator |
| Precondition | Dashboard loaded |
| Steps | 1. Zoom in. 2. Zoom out. 3. Pan map to different area. |
| Expected Result | Map remains responsive. Markers are shown according to visible area/filter. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-014: Vessel Marker Popup

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | Vessel marker visible |
| Steps | 1. Click a vessel marker. |
| Expected Result | Popup displays vessel name, MMSI, speed, heading/course, status, and last update. Detail/action button available. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.3 Vessel Search, List, and Detail

### UAT-020: Search Vessel by MMSI

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator/Analyst |
| Precondition | Vessel `525123456` exists |
| Steps | 1. Enter `525123456` in search box. 2. Submit search. |
| Expected Result | Vessel MV Musi Jaya appears in search result or map focus. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-021: Search Vessel by Name

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator/Analyst |
| Precondition | Vessel name exists |
| Steps | 1. Search `Musi`. |
| Expected Result | Matching vessel list appears. User can select vessel. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-022: Open Vessel Detail

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator/Analyst |
| Precondition | Vessel exists |
| Steps | 1. Open vessel detail page. |
| Expected Result | Detail page displays identity, latest position, SOG, COG, heading, nav status, last update, and recent alerts. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-023: Vessel List Filter

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Operator |
| Precondition | Multiple vessel types/statuses exist |
| Steps | 1. Open vessel list. 2. Filter by vessel type/status. |
| Expected Result | List updates according to selected filter. Reset restores full list. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.4 Geofence Management

### UAT-030: Create Polygon Geofence

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Admin/Operator if allowed |
| Precondition | User has geofence create permission |
| Steps | 1. Open Geofences. 2. Click Create. 3. Draw polygon on map. 4. Enter name `GF-UAT-01 Restricted Area`. 5. Save. |
| Expected Result | Geofence is saved, listed, and visible on map. Geometry is valid. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-031: Configure Enter Rule

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Admin |
| Precondition | Geofence exists |
| Steps | 1. Open geofence detail. 2. Enable enter rule. 3. Set severity High. 4. Save. |
| Expected Result | Rule is saved and active. System uses rule for future vessel entry detection. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-032: Configure Dwell Rule

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Admin |
| Precondition | Geofence exists |
| Steps | 1. Enable dwell rule. 2. Set threshold 10 minutes. 3. Save. |
| Expected Result | Dwell rule saved with configured threshold and severity. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-033: Edit Geofence

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Admin |
| Precondition | Geofence exists |
| Steps | 1. Open existing geofence. 2. Edit name or geometry. 3. Save. |
| Expected Result | Changes saved. Audit log created. Updated geofence appears on map. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-034: Deactivate Geofence

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Admin |
| Precondition | Active geofence exists |
| Steps | 1. Open geofence. 2. Deactivate. |
| Expected Result | Geofence no longer generates new alerts. Existing historical alerts remain. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.5 Alerting

### UAT-040: Generate Geofence Enter Alert

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | Active geofence with enter rule. Simulated vessel will enter polygon. |
| Steps | 1. Open dashboard. 2. Trigger or wait vessel crossing into geofence. |
| Expected Result | Alert is generated, appears in alert feed, and marker/panel indicates alert state. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-041: Receive Alert in Realtime

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | WebSocket active |
| Steps | 1. Keep dashboard open. 2. Trigger alert. |
| Expected Result | Alert appears without page refresh. Sound/toast/panel indicator appears if implemented. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-042: Acknowledge Alert

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | Active alert exists |
| Steps | 1. Open alert detail. 2. Click Acknowledge. |
| Expected Result | Alert status changes to Acknowledged. Actor and timestamp are recorded. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-043: Resolve Alert

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | Acknowledged alert exists |
| Steps | 1. Open alert detail. 2. Enter resolution note. 3. Click Resolve. |
| Expected Result | Alert status changes to Resolved. Resolution note and audit log are recorded. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-044: Alert Deduplication/Cooldown

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Operator/Admin |
| Precondition | Same vessel remains in violating condition |
| Steps | 1. Trigger same alert condition repeatedly within cooldown period. |
| Expected Result | System does not create excessive duplicate alerts. Existing alert is updated or suppressed according to rule. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.6 Vessel History and Playback

### UAT-050: View Vessel Track History

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Analyst |
| Precondition | Vessel has historical positions |
| Steps | 1. Open vessel detail. 2. Select time range. 3. Click Show Track. |
| Expected Result | Map displays vessel route polyline with start and end markers. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-051: Playback Vessel Route

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Analyst |
| Precondition | Vessel history exists |
| Steps | 1. Open Playback. 2. Choose vessel and time range. 3. Click Play. 4. Pause. 5. Change speed. |
| Expected Result | Marker moves according to timeline. Play/pause/speed controls work. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-052: Playback with Alert Timeline

| Field | Description |
|---|---|
| Priority | P2 |
| Role | Analyst |
| Precondition | Vessel has historical alert in selected time range |
| Steps | 1. Open playback. 2. Select time range containing alert. |
| Expected Result | Alert marker/timeline indicator appears if feature included in MVP. Otherwise documented as deferred. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.7 Analytics and Reporting

### UAT-060: View KPI Cards

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Manager/Operator |
| Precondition | Dashboard data available |
| Steps | 1. Open dashboard. |
| Expected Result | KPI cards display active vessels, in port, alerts today, and average speed. Values are plausible and refreshed. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-061: Export Vessel History CSV

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Analyst |
| Precondition | Export permission enabled |
| Steps | 1. Open vessel history. 2. Select time range. 3. Click Export CSV. |
| Expected Result | CSV file downloads with expected columns and data range. Export audit log created. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-062: Export GeoJSON

| Field | Description |
|---|---|
| Priority | P2 |
| Role | Analyst |
| Precondition | GeoJSON export implemented |
| Steps | 1. Open vessel history. 2. Click Export GeoJSON. |
| Expected Result | GeoJSON file downloads and can be opened in GIS tool/map viewer. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.8 System Status and Operations

### UAT-070: Provider Status Visible

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Admin/Operator |
| Precondition | Provider health status implemented |
| Steps | 1. Open dashboard/admin status. |
| Expected Result | AIS provider status shows healthy/degraded/down and last successful fetch time. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-071: Application Health

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Admin/DevOps |
| Precondition | Health endpoint available |
| Steps | 1. Access system health page or endpoint. |
| Expected Result | System reports health of backend, database, Redis, and AIS provider. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-072: Graceful Data Delay Indicator

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Operator |
| Precondition | Simulate AIS delay/no update |
| Steps | 1. Stop or delay AIS update. 2. Observe dashboard. |
| Expected Result | System shows stale/offline indicator instead of silently showing outdated data as fresh. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 8.9 Performance and Usability

### UAT-080: Dashboard Load Performance

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | At least target number of vessel markers available |
| Steps | 1. Open dashboard from fresh browser session. |
| Expected Result | Dashboard loads within agreed target, e.g. <= 5 seconds for MVP test area. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-081: Map Responsiveness

| Field | Description |
|---|---|
| Priority | P1 |
| Role | Operator |
| Precondition | Dashboard loaded |
| Steps | 1. Pan and zoom map repeatedly. 2. Click markers. |
| Expected Result | Map remains usable and does not freeze under MVP test load. |
| Actual Result |  |
| Status |  |
| Notes |  |

### UAT-082: Alert Usability

| Field | Description |
|---|---|
| Priority | P0 |
| Role | Operator |
| Precondition | Active alert exists |
| Steps | 1. Open alert feed. 2. Identify highest severity alert. 3. Open detail. |
| Expected Result | Operator can quickly distinguish severity, vessel, location, and action needed. |
| Actual Result |  |
| Status |  |
| Notes |  |

---

## 9. End-to-End UAT Scenarios

### E2E-001: Realtime Monitoring and Alert Response

Priority: P0

Steps:

1. Login as Operator.
2. Open Dashboard.
3. Search `MV Samudra Raya`.
4. Confirm vessel marker appears on map.
5. Trigger vessel entry into restricted geofence.
6. Confirm alert appears in real-time.
7. Open alert detail.
8. Acknowledge alert.
9. Resolve alert with note.

Expected Result:

1. Vessel monitoring works.
2. Geofence alert is generated.
3. Alert appears without page refresh.
4. Operator can acknowledge and resolve.
5. Audit trail is created.

Status: Pending

---

### E2E-002: Admin Creates Geofence and Operator Receives Alert

Priority: P0

Steps:

1. Login as Admin.
2. Create geofence `GF-UAT-01`.
3. Enable enter rule with High severity.
4. Logout.
5. Login as Operator.
6. Trigger vessel crossing into `GF-UAT-01`.
7. Confirm alert in dashboard and alert inbox.

Expected Result:

1. Admin can configure geofence.
2. Operator can receive operational alert.
3. Rule enforcement works end-to-end.

Status: Pending

---

### E2E-003: Analyst Reviews Historical Vessel Movement

Priority: P1

Steps:

1. Login as Analyst.
2. Search `MV Musi Jaya`.
3. Open vessel detail.
4. Select historical time range.
5. Display route.
6. Play route playback.
7. Export CSV if available.

Expected Result:

1. Analyst can review past route.
2. Playback works.
3. Export works according to permission.

Status: Pending

---

## 10. Defect Logging Template

```markdown
# UAT Defect

Defect ID:
Reported by:
Date:
Test Case ID:
Severity: Critical / High / Medium / Low
Module:
Environment:

## Summary

## Steps to Reproduce
1.
2.
3.

## Expected Result

## Actual Result

## Screenshot / Evidence

## Business Impact

## Assigned To

## Status
Open / In Progress / Fixed / Retest / Closed / Deferred
```

---

## 11. UAT Sign-Off Template

```markdown
# UAT Sign-Off

Project: Real Time Vessel Tracking System / VesselTrack OS
Release: MVP
Environment: Staging
UAT Period:

## Summary
- Total test cases:
- Passed:
- Failed:
- Blocked:
- Waived:

## Open Defects
| Defect ID | Severity | Status | Decision |

## Business Decision
[ ] Approved for MVP release
[ ] Approved with waiver
[ ] Not approved

## Sign-Off
Product Owner:
Name:
Signature:
Date:

Business User Representative:
Name:
Signature:
Date:

Project Manager:
Name:
Signature:
Date:
```

---

## 12. UAT Exit Criteria

UAT selesai jika:

1. Semua P0 test case dieksekusi.
2. Semua P0 test case pass.
3. Critical defect = 0.
4. High defect = 0 atau ada waiver resmi.
5. End-to-end monitoring and alert scenario pass.
6. UAT sign-off diperoleh.
7. Known limitations terdokumentasi.

---

## 13. Acceptance Criteria for This Document

Dokumen ini diterima jika:

1. Test case mencakup modul MVP utama.
2. Setiap test case memiliki steps dan expected result.
3. End-to-end scenarios tersedia.
4. Defect and sign-off templates tersedia.
5. UAT exit criteria jelas.
