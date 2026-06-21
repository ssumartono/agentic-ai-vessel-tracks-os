# 17_Project_Management_Plan.md
# Project Management Plan

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product & Engineering Team  

---


## 1. Purpose

Dokumen ini menjelaskan rencana pengelolaan proyek **Real Time Vessel Tracking System / VesselTrack OS** dari tahap inisiasi sampai MVP production readiness. Dokumen ini menjadi kompas kerja tim agar pengembangan tidak berubah menjadi pelayaran tanpa peta, tanpa bintang, dan tanpa dermaga tujuan.

---

## 2. Project Overview

### 2.1 Product Summary

VesselTrack OS adalah aplikasi pemantauan kapal real-time berbasis AIS API Provider yang menyediakan:

1. Realtime vessel map.
2. Vessel registry dan detail kapal.
3. Historical track dan playback.
4. Geofence management.
5. Alert engine dan alert inbox.
6. Basic analytics.
7. Security, RBAC, audit, dan operational readiness.

### 2.2 Project Objective

Membangun MVP yang dapat digunakan oleh operator untuk memantau kapal di area tertentu secara real-time, mendeteksi kejadian geofence, dan mencatat alert operasional.

### 2.3 MVP Success Statement

MVP dianggap berhasil jika operator dapat:

1. Login ke sistem.
2. Melihat kapal aktif pada peta.
3. Mencari kapal berdasarkan nama atau MMSI.
4. Melihat posisi real-time yang update otomatis.
5. Membuat geofence.
6. Menerima alert saat kapal melanggar rule.
7. Acknowledge dan resolve alert.
8. Melihat histori atau playback dasar.
9. Mengakses dashboard dengan performa memadai.

---

## 3. Scope Management

### 3.1 In Scope for MVP

| Area | Scope |
|---|---|
| Data Source | AIS API Provider |
| Ingestion | Polling by area, raw log, retry |
| Data Processing | Normalize, validate, deduplicate |
| Database | PostgreSQL, PostGIS, TimescaleDB-compatible schema |
| Backend | REST API, WebSocket, geofence engine, alert engine |
| Frontend | Dashboard map, vessel list/detail, geofence editor, alert inbox |
| Security | Login, RBAC, audit log, API protection |
| Operations | Docker deployment, healthcheck, metrics, backup |
| Testing | Unit, integration, API, WebSocket, geofence, UAT |

### 3.2 Out of Scope for MVP

| Area | Deferred Capability |
|---|---|
| AIS Hardware | Local AIS receiver deployment |
| AI/ML | ETA prediction, dark vessel detection, anomaly model |
| Advanced Maritime Safety | Collision risk CPA/TCPA |
| Enterprise GIS | Full ArcGIS Enterprise integration |
| Mobile App | Native iOS/Android app |
| Multi-provider | Automatic AIS provider failover |
| Billing | Subscription and payment module |

### 3.3 Scope Control

Perubahan scope harus melalui:

1. Change request.
2. Impact assessment.
3. Product Owner approval.
4. Reprioritization of backlog.
5. Sprint impact communication.

Change request minimum mencakup:

```text
Change ID
Requested by
Description
Business reason
Affected modules
Impact on time/cost/scope/risk
Decision
Approval date
```

---

## 4. Delivery Methodology

### 4.1 Recommended Method

Gunakan **Agile Scrum-lite** dengan sprint 2 minggu.

Alasan:

1. Produk memiliki UI dan integrasi data yang perlu iterasi.
2. Risiko data AIS perlu divalidasi cepat.
3. Stakeholder perlu melihat peta dan alur kerja lebih awal.
4. Tim kecil dapat bergerak ringan tanpa ritual berat.

### 4.2 Delivery Cadence

| Activity | Frequency | Owner |
|---|---|---|
| Sprint Planning | Every 2 weeks | Scrum Master / Project Manager |
| Daily Standup | Daily, 15 minutes | Team |
| Backlog Refinement | Weekly | Product Owner + Tech Lead |
| Sprint Review | End of sprint | Product Owner |
| Sprint Retrospective | End of sprint | Team |
| Risk Review | Weekly | Project Manager |
| Architecture Review | Biweekly | Tech Lead |
| Security Review | Per release | Security/Tech Lead |
| UAT Review | Before release | Product Owner + Users |

---

## 5. Project Organization

### 5.1 Core Roles

| Role | Responsibility |
|---|---|
| Project Sponsor | Provides funding, strategic direction, final escalation |
| Product Owner | Owns product scope, prioritization, acceptance |
| Project Manager / Scrum Master | Manages plan, cadence, risks, dependencies |
| Solution Architect | Defines architecture and technical direction |
| Tech Lead | Leads implementation quality and code review |
| Backend Developer | Builds API, ingestion, rule engine |
| Frontend Developer | Builds dashboard UI and map interface |
| GIS/Data Engineer | Designs geospatial model and spatial queries |
| DevOps Engineer | Handles deployment, CI/CD, monitoring, backup |
| QA Engineer | Owns testing strategy and test execution |
| Security Reviewer | Reviews auth, API, WebSocket, infra controls |
| Business User / Operator | Validates workflow and UAT |

### 5.2 Minimum Small-Team Setup

Jika tim kecil, role dapat dirangkap:

| Person | Combined Role |
|---|---|
| Person A | Product Owner + Business Analyst |
| Person B | Tech Lead + Backend Developer |
| Person C | Frontend Developer + UI integrator |
| Person D | GIS/Data Engineer + DevOps |
| Person E | QA + UAT Coordinator |

---

## 6. RACI Matrix

| Deliverable | Sponsor | PO | PM | Architect | Tech Lead | Dev | QA | DevOps | User |
|---|---|---|---|---|---|---|---|---|---|
| PRD | A | R | C | C | C | I | I | I | C |
| Architecture | I | C | C | A/R | R | C | I | C | I |
| Backlog | I | A/R | R | C | C | C | C | I | C |
| Sprint Plan | I | A | R | C | R | C | C | C | I |
| Database Schema | I | C | I | A | R | R | C | C | I |
| API | I | C | I | C | A/R | R | C | I | I |
| UI/UX | I | A/R | C | I | C | R | C | I | C |
| Security Model | I | C | C | A/R | R | C | C | C | I |
| Deployment | I | I | C | C | C | C | C | A/R | I |
| Testing | I | C | C | I | C | C | A/R | C | C |
| UAT Sign-off | A | R | C | I | I | I | C | I | R |

Legend:

- R: Responsible
- A: Accountable
- C: Consulted
- I: Informed

---

## 7. Work Breakdown Structure

### 7.1 Phase 0: Initiation & Discovery

Deliverables:

1. Business objective.
2. Monitoring area definition.
3. AIS provider shortlist.
4. Stakeholder list.
5. MVP scope confirmation.
6. Initial risk register.

Exit Criteria:

1. MVP scope approved.
2. AIS API provider candidate selected.
3. Technical assumptions documented.

### 7.2 Phase 1: Foundation

Deliverables:

1. Repository setup.
2. Docker local environment.
3. Database baseline.
4. CI pipeline.
5. Dev/staging environment.

Exit Criteria:

1. Developer can run app locally.
2. Migration works.
3. CI passes.

### 7.3 Phase 2: Data & Backend Core

Deliverables:

1. AIS ingestion service.
2. AIS canonical model.
3. Raw data storage.
4. Vessel API.
5. Position API.
6. Latest position logic.

Exit Criteria:

1. Live or sample AIS data masuk ke database.
2. Latest position API returns valid vessel positions.
3. Data validation and deduplication work.

### 7.4 Phase 3: Realtime Dashboard

Deliverables:

1. Frontend shell.
2. Realtime map.
3. Marker rendering.
4. WebSocket gateway.
5. Vessel list/detail.

Exit Criteria:

1. Operator can see vessels on map.
2. Position updates without page refresh.
3. Vessel popup and detail are usable.

### 7.5 Phase 4: Geofence & Alert

Deliverables:

1. Geofence editor.
2. Rule engine.
3. Alert generation.
4. Alert inbox.
5. Alert acknowledge/resolve.
6. WebSocket alert event.

Exit Criteria:

1. Geofence can be created and activated.
2. Rule violation generates alert.
3. Operator can acknowledge and resolve alert.

### 7.6 Phase 5: Playback, Analytics & Hardening

Deliverables:

1. Vessel history view.
2. Playback control.
3. KPI cards.
4. Basic analytics.
5. Security hardening.
6. Performance tuning.
7. UAT.
8. Release runbook.

Exit Criteria:

1. UAT passed.
2. Critical and high defects closed.
3. Deployment plan validated.
4. Operations runbook ready.

---

## 8. Timeline Plan

### 8.1 MVP Timeline Estimate

| Phase | Duration | Cumulative |
|---|---:|---:|
| Phase 0: Discovery | 1 week | Week 1 |
| Phase 1: Foundation | 2 weeks | Week 3 |
| Phase 2: Data & Backend Core | 3 weeks | Week 6 |
| Phase 3: Realtime Dashboard | 3 weeks | Week 9 |
| Phase 4: Geofence & Alert | 3 weeks | Week 12 |
| Phase 5: Playback, Analytics & Hardening | 3 weeks | Week 15 |

Estimated MVP duration: **12 to 15 weeks** depending on team capacity and AIS provider readiness.

### 8.2 Sprint Plan Summary

| Sprint | Main Outcome |
|---|---|
| Sprint 0 | Project foundation |
| Sprint 1 | AIS ingestion and database baseline |
| Sprint 2 | Vessel API and latest position |
| Sprint 3 | Realtime map dashboard |
| Sprint 4 | Vessel detail and security |
| Sprint 5 | Geofence management |
| Sprint 6 | Alert engine and alert inbox |
| Sprint 7 | Playback, analytics, UAT hardening |

---

## 9. Milestone Plan

| Milestone | Target | Acceptance |
|---|---|---|
| M0: Project Kickoff | Week 1 | Scope, team, repo confirmed |
| M1: Technical Foundation Ready | Week 3 | Local + CI + DB ready |
| M2: AIS Data Flow Ready | Week 5 | AIS data stored and normalized |
| M3: Backend API Ready | Week 6 | Vessel APIs usable |
| M4: Realtime Map Ready | Week 9 | Map updates via WebSocket |
| M5: Geofence Ready | Week 11 | Geofence rule works |
| M6: Alerting Ready | Week 12 | Alert lifecycle works |
| M7: UAT Ready | Week 14 | Test cases and staging ready |
| M8: MVP Release Candidate | Week 15 | Go/no-go passed |

---

## 10. Communication Plan

| Audience | Channel | Frequency | Content |
|---|---|---|---|
| Sponsor | Steering update | Biweekly | Progress, risks, decision needed |
| Product Owner | Working session | Weekly | Backlog, acceptance, priorities |
| Delivery Team | Daily standup | Daily | Progress, blockers |
| Technical Team | Architecture sync | Biweekly | Design decisions, debt, risks |
| Users/Operators | Demo/UAT | Per sprint review / UAT | Feature walkthrough |
| Security/Infra | Review session | Per release | Security/deployment readiness |

### 10.1 Status Report Template

```markdown
# Weekly Status Report

## Summary
- Overall status: Green / Amber / Red
- Current sprint:
- Major achievement:
- Major risk:

## Progress
- Completed:
- In progress:
- Planned next:

## Risks & Issues
| ID | Risk/Issue | Severity | Owner | Action |

## Decisions Needed
| Decision | Needed By | Owner |

## Metrics
- Sprint burndown:
- Defects open:
- Test pass rate:
- Deployment status:
```

---

## 11. Risk Management

Risk management mengacu pada `15_Risk_Register.md`.

### 11.1 Weekly Risk Review

Agenda:

1. Review top 10 risks.
2. Update probability and impact.
3. Review mitigation progress.
4. Add newly discovered risks.
5. Escalate red risks.

### 11.2 Key Risks

| Risk | Mitigation |
|---|---|
| AIS provider latency/coverage poor | Use sample replay, provider SLA review, alternate provider plan |
| Browser slow with many markers | BBox filter, clustering, throttling |
| Geofence false alert | Hysteresis, cooldown, test scenarios |
| WebSocket overload | Channel filtering, throttling, backpressure |
| Scope creep | Change control and MoSCoW prioritization |
| Security gaps | Security review, RBAC, audit, secret management |

---

## 12. Quality Management

Quality strategy mengacu pada `13_Testing_Strategy.md`.

### 12.1 Quality Gates

| Gate | Criteria |
|---|---|
| Code Review Gate | No merge without review |
| CI Gate | Lint, test, build pass |
| API Gate | API tests pass |
| Security Gate | No critical secret/security issue |
| UAT Gate | P0 UAT scenarios pass |
| Release Gate | No critical/high open defects |

### 12.2 Defect Severity

| Severity | Meaning | SLA Target |
|---|---|---|
| Critical | System unusable / data loss / severe security issue | Fix before release |
| High | Major feature broken | Fix before release candidate |
| Medium | Workaround available | Fix before or after MVP depending priority |
| Low | Cosmetic/minor | Backlog |

---

## 13. Dependency Management

| Dependency | Owner | Risk | Mitigation |
|---|---|---|---|
| AIS API Provider | PO/Tech Lead | Credential, cost, coverage | Early vendor trial |
| Map tile provider | Frontend/DevOps | Cost/rate limit | Use MapLibre-compatible provider |
| Cloud/VPS | DevOps | Environment delay | Prepare Docker portable deployment |
| User availability for UAT | PM/PO | Delayed sign-off | Schedule UAT early |
| Security review | Tech Lead | Late findings | Review per sprint, not only at end |

---

## 14. Budget and Resource Considerations

### 14.1 Cost Categories

1. AIS API subscription.
2. Cloud infrastructure.
3. Map tile provider or GIS platform.
4. Developer tools and CI/CD.
5. Monitoring/logging tools.
6. Domain and SSL.
7. Backup storage.
8. Security review.

### 14.2 Cost Control

1. Start with limited monitoring area.
2. Use provider trial during discovery.
3. Store raw data with retention rules.
4. Use sampling for long history playback.
5. Avoid premature Kubernetes if MVP can run on Docker Compose or managed container.

---

## 15. Change Management

### 15.1 Change Request Categories

| Category | Example |
|---|---|
| Business Scope | Add mobile app |
| Data Source | Add second AIS provider |
| Security | Require SSO/OIDC |
| UI | Add custom analytics screen |
| Performance | Support 50,000 vessels |
| Operations | Multi-region deployment |

### 15.2 Change Approval Matrix

| Impact | Approval Required |
|---|---|
| Low | Product Owner |
| Medium | Product Owner + Tech Lead |
| High | Sponsor + Product Owner + Tech Lead |
| Critical | Steering Committee |

---

## 16. Documentation Management

Project documentation set:

| Document | Owner | Update Frequency |
|---|---|---|
| PRD | Product Owner | Major scope change |
| Architecture | Architect | Architecture change |
| Data Source Strategy | Tech Lead/Data Engineer | Provider change |
| Data Model/ERD | Backend/Data Engineer | Schema change |
| API Spec | Backend Lead | Endpoint change |
| WebSocket Spec | Backend Lead | Event contract change |
| Geofence Spec | Backend/GIS | Rule change |
| Alerting Spec | Backend/PO | Alert lifecycle change |
| UI/UX Wireframe | Frontend/Designer | UI change |
| Security Model | Security/Tech Lead | Security control change |
| Deployment Plan | DevOps | Environment/release change |
| Testing Strategy | QA | Test approach change |
| Roadmap | Product Owner | Monthly |
| Risk Register | PM | Weekly |
| Backlog | Product Owner | Every sprint |
| Runbook | DevOps | Every release |

---

## 17. Governance Model

### 17.1 Steering Review

Biweekly or monthly.

Agenda:

1. Progress vs roadmap.
2. Budget and resource review.
3. Major risks.
4. Scope decisions.
5. Release readiness.

### 17.2 Technical Governance

Architecture review board ringan:

1. Architect.
2. Tech Lead.
3. DevOps.
4. Security reviewer.
5. Data/GIS engineer.

Review decisions:

1. Data provider strategy.
2. Database design changes.
3. WebSocket scaling.
4. Security design.
5. Deployment model.

---

## 18. Release Management

Release model:

| Release | Content |
|---|---|
| Alpha | Internal technical demo with sample data |
| Beta | Staging demo with AIS provider data |
| UAT | User validation in staging |
| MVP RC | Release candidate |
| MVP Production | Controlled production launch |

### 18.1 Release Checklist

1. All P0 stories done.
2. API tests pass.
3. WebSocket tests pass.
4. Geofence tests pass.
5. Alert lifecycle tests pass.
6. Security basic checks pass.
7. Backup tested.
8. Monitoring active.
9. Runbook available.
10. UAT sign-off obtained.

---

## 19. Project KPIs

| KPI | Target MVP |
|---|---:|
| Sprint predictability | >= 75% committed story completed |
| Critical defects before release | 0 |
| High defects before release | 0 or accepted waiver |
| API p95 latency | <= 500 ms for common queries |
| WebSocket update delay | <= 5 seconds after processed event |
| Map initial load | <= 5 seconds for target area |
| UAT P0 pass rate | 100% |
| AIS ingestion uptime during UAT | >= 95% |

---

## 20. Acceptance Criteria for This Document

Dokumen ini diterima jika:

1. Project scope dan out-of-scope jelas.
2. Methodology, cadence, role, dan RACI tersedia.
3. Timeline dan milestone dapat digunakan sebagai baseline.
4. Risk, quality, communication, change, dan release management tercakup.
5. Dokumen dapat dipakai sebagai acuan pelaksanaan proyek MVP.
