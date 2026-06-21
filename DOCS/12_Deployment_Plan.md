# 12 Deployment Plan

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Document Version:** 1.0  
**Status:** Draft  
**Derived From:** `01_PRD.md`, `02_System_Architecture.md`, `03_Data_Source_Strategy.md`, `04_AIS_Data_Model.md`, `05_Database_ERD.md`, `06_API_Specification.md`, `07_Realtime_WebSocket_Spec.md`, `08_Geofence_Rule_Spec.md`, `09_Alerting_Spec.md`, `10_UI_UX_Wireframe.md`, `11_Security_Model.md`  
**Primary Deployment Strategy:** Cloud-first MVP using containerized services, managed database where possible, and progressive hardening toward production.

---

## 1. Purpose

Dokumen ini mendefinisikan rencana deployment untuk **Real Time Vessel Tracking System**, mencakup strategi environment, infrastruktur, containerization, CI/CD, database deployment, security control, observability, backup, rollback, dan langkah cutover dari development ke production.

Deployment plan ini dirancang agar sistem dapat dimulai secara sederhana untuk MVP, tetapi tetap memiliki jalur pertumbuhan menuju arsitektur production yang lebih kuat, aman, dan scalable.

---

## 2. Deployment Goals

Tujuan deployment adalah:

1. Menyediakan environment yang stabil untuk pengembangan, pengujian, dan demo MVP.
2. Memastikan backend, frontend, database, WebSocket, dan ingestion service dapat dijalankan secara konsisten.
3. Mendukung update aplikasi secara aman melalui CI/CD.
4. Menyediakan observability untuk memantau latency, error, koneksi WebSocket, ingestion rate, dan alert delivery.
5. Menyediakan backup dan rollback agar sistem dapat dipulihkan jika terjadi kegagalan.
6. Menyiapkan jalur transisi dari MVP menuju production-grade deployment.

---

## 3. Deployment Principles

Deployment mengikuti prinsip berikut:

| Prinsip | Penjelasan |
|---|---|
| Container-first | Semua service utama dijalankan sebagai container Docker. |
| Environment parity | Development, staging, dan production memiliki struktur yang mirip. |
| Secure by default | Secret tidak disimpan di repository, TLS aktif, akses database dibatasi. |
| Observable | Semua service memiliki log, metric, dan health check. |
| Reversible | Deployment harus bisa di-rollback. |
| Incremental scaling | MVP sederhana dulu, production scale setelah kebutuhan terbukti. |
| Data safety | Database backup dan migration control wajib tersedia. |

---

## 4. Target Deployment Architecture

### 4.1 MVP Deployment Architecture

Untuk MVP, deployment dapat menggunakan satu VPS/cloud VM atau managed container platform.

```text
User Browser
    |
    | HTTPS / WSS
    v
Reverse Proxy / Load Balancer
    |
    +--> Frontend Web App
    |
    +--> Backend API Service
    |
    +--> WebSocket Gateway
    |
    +--> Ingestion Worker
    |
    +--> Geofence & Alert Worker
    |
    +--> Redis
    |
    +--> PostgreSQL + PostGIS + TimescaleDB
```

### 4.2 Production Deployment Architecture

Untuk production, sistem dapat dipisah menjadi beberapa node/service.

```text
Internet / Internal Network
        |
        v
WAF / Load Balancer
        |
        +--------------------+
        |                    |
        v                    v
Frontend App          API Gateway / Backend
                             |
                             +--> Auth Service
                             +--> Vessel Service
                             +--> Position Service
                             +--> Geofence Service
                             +--> Alert Service
                             +--> WebSocket Gateway
                             +--> Ingestion Service
                             +--> Worker Pool
                             |
                             +--> Redis / Message Broker
                             +--> PostgreSQL + PostGIS + TimescaleDB
                             +--> Object Storage / Raw Logs
                             +--> Monitoring Stack
```

---

## 5. Environment Strategy

### 5.1 Environment List

| Environment | Purpose | Data Type | Access |
|---|---|---|---|
| Local | Developer testing | Dummy / sandbox | Developer |
| Development | Integrasi awal | Dummy / limited API | Dev team |
| Staging | UAT, demo, pre-prod validation | Masked / controlled | Dev, QA, PO |
| Production | Operasional real | Live AIS / real users | Authorized users only |

### 5.2 Environment Naming

```text
vesseltrack-local
vesseltrack-dev
vesseltrack-staging
vesseltrack-prod
```

### 5.3 Environment Variables

Contoh environment variable utama:

```env
APP_ENV=staging
APP_NAME=VesselTrack OS
API_BASE_URL=https://api-staging.vesseltrack.local
FRONTEND_URL=https://staging.vesseltrack.local
DATABASE_URL=postgresql://user:password@db:5432/vesseltrack
REDIS_URL=redis://redis:6379
JWT_SECRET=change_me
JWT_ISSUER=vesseltrack
AIS_PROVIDER_NAME=datalastic_or_selected_provider
AIS_PROVIDER_API_KEY=secret
AIS_PROVIDER_BASE_URL=https://provider.example.com
WEBSOCKET_ALLOWED_ORIGINS=https://staging.vesseltrack.local
LOG_LEVEL=info
SENTRY_DSN=
OBJECT_STORAGE_BUCKET=vesseltrack-raw-logs
```

Secret wajib dikelola melalui secret manager atau mekanisme secret milik platform deployment.

---

## 6. Service Inventory

### 6.1 Core Services

| Service | Description | Deployment Unit |
|---|---|---|
| Frontend Web App | Dashboard, map, vessel detail, alert UI | Container / static hosting |
| Backend API | REST API untuk vessel, geofence, alert, analytics | Container |
| WebSocket Gateway | Realtime vessel update dan alert push | Container |
| Ingestion Worker | Pull/push AIS API provider dan normalisasi data | Container worker |
| Geofence Worker | Evaluasi posisi terhadap geofence | Container worker |
| Alert Worker | Deduplication, lifecycle, notification dispatch | Container worker |
| PostgreSQL + PostGIS + TimescaleDB | Primary database | Managed DB / container for MVP |
| Redis | Cache, pub/sub, rate limit, short-lived state | Managed Redis / container |
| Object Storage | Raw AIS log archive, export files | S3-compatible storage |
| Monitoring Stack | Metrics, logs, dashboards | Managed / self-hosted |

### 6.2 MVP Service Grouping

Untuk MVP, service dapat digabung agar lebih ringan:

| MVP Unit | Contains |
|---|---|
| `frontend` | Next.js frontend |
| `api` | REST API + WebSocket gateway |
| `worker` | Ingestion + geofence + alert worker |
| `db` | PostgreSQL + PostGIS + TimescaleDB |
| `redis` | Cache + pub/sub |
| `reverse-proxy` | TLS termination + routing |

---

## 7. Recommended Technology Stack

### 7.1 MVP Stack

| Layer | Recommended Tool |
|---|---|
| Frontend | Next.js + MapLibre GL |
| Backend | NestJS or FastAPI |
| Realtime | WebSocket |
| Database | PostgreSQL + PostGIS + TimescaleDB |
| Cache / PubSub | Redis |
| Container | Docker |
| Reverse Proxy | Nginx / Caddy / Traefik |
| CI/CD | GitHub Actions / GitLab CI |
| Hosting | VPS, Cloud VM, Cloud Run, ECS, or similar |
| Monitoring | Prometheus + Grafana or managed equivalent |
| Logs | Loki / ELK / cloud logging |

### 7.2 Production Stack Options

| Layer | Option A | Option B |
|---|---|---|
| Compute | Kubernetes | Managed Container Platform |
| Database | Managed PostgreSQL + extensions | Self-managed PostgreSQL cluster |
| Queue | Redis Streams | Kafka / Redpanda |
| Object Storage | S3-compatible | Cloud provider object storage |
| Secrets | Cloud Secret Manager | Vault |
| Observability | Grafana stack | Cloud-native monitoring |

---

## 8. Network and Domain Plan

### 8.1 Domain Structure

```text
app.vesseltrack.example.com        Frontend production
api.vesseltrack.example.com        REST API production
ws.vesseltrack.example.com         WebSocket production
staging.vesseltrack.example.com    Frontend staging
api-staging.vesseltrack.example.com API staging
```

### 8.2 Protocol

| Traffic | Protocol |
|---|---|
| Browser to frontend | HTTPS |
| Browser to backend | HTTPS |
| Browser to WebSocket | WSS |
| Backend to database | TLS where supported |
| Backend to AIS provider | HTTPS |
| Internal service communication | Private network |

### 8.3 Firewall Rules

| Port | Purpose | Exposure |
|---|---|---|
| 80 | HTTP redirect to HTTPS | Public |
| 443 | HTTPS / WSS | Public |
| 5432 | PostgreSQL | Private only |
| 6379 | Redis | Private only |
| 9090 | Prometheus | Private / VPN only |
| 3000/8000 | App internal ports | Private only |

---

## 9. Containerization Plan

### 9.1 Docker Images

| Image | Description |
|---|---|
| `vesseltrack/frontend` | Web dashboard |
| `vesseltrack/api` | Backend REST API and WebSocket |
| `vesseltrack/worker` | Ingestion, geofence, alert worker |
| `vesseltrack/migration` | Database migration runner |

### 9.2 Image Tagging Convention

```text
vesseltrack/api:dev-latest
vesseltrack/api:staging-2026.06.21.001
vesseltrack/api:prod-1.0.0
vesseltrack/api:sha-<git_commit_hash>
```

### 9.3 Docker Compose for MVP

Contoh struktur minimal:

```yaml
version: "3.9"

services:
  reverse-proxy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/Caddyfile:/etc/caddy/Caddyfile
    depends_on:
      - frontend
      - api

  frontend:
    image: vesseltrack/frontend:latest
    environment:
      NEXT_PUBLIC_API_BASE_URL: https://api.example.com
      NEXT_PUBLIC_WS_URL: wss://ws.example.com/realtime

  api:
    image: vesseltrack/api:latest
    environment:
      APP_ENV: staging
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
      - redis

  worker:
    image: vesseltrack/worker:latest
    environment:
      APP_ENV: staging
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      AIS_PROVIDER_API_KEY: ${AIS_PROVIDER_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: timescale/timescaledb-ha:pg16
    environment:
      POSTGRES_DB: vesseltrack
      POSTGRES_USER: vesseltrack
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:
```

Catatan: untuk production, database sebaiknya menggunakan managed service atau node terpisah dengan backup dan monitoring yang matang.

---

## 10. Database Deployment Plan

### 10.1 Required Extensions

Database harus mengaktifkan extension berikut:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 10.2 Migration Strategy

Semua perubahan schema harus melalui migration tool.

Rekomendasi:

| Backend | Migration Tool |
|---|---|
| NestJS + Prisma | Prisma Migrate |
| NestJS + TypeORM | TypeORM Migration |
| FastAPI + SQLAlchemy | Alembic |
| Raw SQL | Flyway / Liquibase |

### 10.3 Migration Rules

1. Migration wajib versioned.
2. Tidak boleh mengubah production schema secara manual.
3. Migration harus diuji di staging.
4. Destructive migration wajib memiliki backup dan rollback plan.
5. Index besar harus dibuat secara hati-hati, idealnya menggunakan `CONCURRENTLY` jika diperlukan.

### 10.4 Initial Migration Order

```text
001_enable_extensions.sql
002_create_users_roles_permissions.sql
003_create_vessels.sql
004_create_vessel_positions.sql
005_create_vessel_latest_positions.sql
006_create_raw_ais_messages.sql
007_create_geofences.sql
008_create_geofence_rules.sql
009_create_geofence_events.sql
010_create_alerts.sql
011_create_notification_deliveries.sql
012_create_audit_logs.sql
013_create_indexes.sql
014_create_timescale_hypertables.sql
```

### 10.5 Database Backup

| Environment | Backup Frequency | Retention |
|---|---:|---:|
| Development | Optional / manual | 3 days |
| Staging | Daily | 7 days |
| Production | Daily full + PITR where possible | 30–90 days |

---

## 11. CI/CD Plan

### 11.1 Pipeline Overview

```text
Developer Commit
    |
    v
Code Repository
    |
    v
CI Pipeline
    |-- Lint
    |-- Unit Test
    |-- Security Scan
    |-- Build Docker Image
    |-- Push Image Registry
    |
    v
Deploy to Development
    |
    v
Deploy to Staging
    |-- Migration Dry Run
    |-- Integration Test
    |-- Smoke Test
    |
    v
Manual Approval
    |
    v
Deploy to Production
    |-- Migration
    |-- Rolling / Blue-Green Deployment
    |-- Health Check
    |-- Post-deploy Verification
```

### 11.2 Branching Strategy

```text
main        Production-ready branch
staging     Pre-production branch
develop     Development integration branch
feature/*   Feature work
hotfix/*    Emergency fix
```

### 11.3 Build Checks

| Check | Frontend | Backend | Worker |
|---|---|---|---|
| Lint | Required | Required | Required |
| Unit Test | Required | Required | Required |
| Type Check | Required | Required | Required |
| Dependency Scan | Required | Required | Required |
| Docker Build | Required | Required | Required |
| Smoke Test | Required | Required | Required |

### 11.4 Deployment Approval

| Environment | Approval |
|---|---|
| Development | Automatic |
| Staging | Automatic or team approval |
| Production | Manual approval required |

---

## 12. Release Strategy

### 12.1 MVP Release Type

Untuk MVP, gunakan **rolling deployment sederhana**.

Langkah:

1. Build image baru.
2. Push image ke registry.
3. Deploy ke staging.
4. Jalankan migration.
5. Jalankan smoke test.
6. Deploy ke production.
7. Monitor error dan latency.

### 12.2 Production Release Type

Untuk production matang, gunakan **blue-green deployment** atau **canary deployment**.

| Strategy | Use Case |
|---|---|
| Rolling | MVP, traffic kecil |
| Blue-Green | Production dengan kebutuhan rollback cepat |
| Canary | Traffic besar, risiko release tinggi |

### 12.3 Release Naming

```text
v0.1.0-mvp-tracking
v0.2.0-geofence-alert
v0.3.0-playback-history
v0.4.0-analytics
v1.0.0-production-ready
```

---

## 13. Configuration Management

### 13.1 Config Categories

| Category | Example | Storage |
|---|---|---|
| Public frontend config | API URL, map style URL | Build/runtime env |
| Application config | polling interval, bbox filter | Env / config table |
| Secret config | JWT secret, AIS API key | Secret manager |
| Operational config | log level, feature flags | Env / admin setting |
| Business rules | geofence rule, alert cooldown | Database |

### 13.2 Feature Flags

Recommended feature flags:

```text
FEATURE_GEOFENCE=true
FEATURE_ALERT_NOTIFICATION=true
FEATURE_PLAYBACK=true
FEATURE_ANALYTICS=false
FEATURE_EXPORT=true
FEATURE_PROVIDER_FAILOVER=false
```

---

## 14. Security Deployment Controls

### 14.1 MVP Security Controls

Minimum controls:

1. HTTPS/WSS mandatory.
2. JWT-based authentication.
3. RBAC enforcement.
4. API rate limit.
5. Secure CORS allowlist.
6. Database private access only.
7. Redis private access only.
8. AIS provider key stored as secret.
9. Audit log for sensitive operations.
10. Daily backup for staging and production.

### 14.2 Production Security Controls

Additional controls:

1. WAF.
2. Network segmentation.
3. Secret manager.
4. Vulnerability scanning.
5. Container image scanning.
6. SAST/DAST in CI/CD.
7. Centralized audit log.
8. MFA for admin users.
9. Least privilege database account.
10. Incident response procedure.

### 14.3 TLS Plan

| Component | TLS Required |
|---|---|
| Frontend | Yes |
| API | Yes |
| WebSocket | Yes, WSS |
| AIS provider API | Yes |
| Database | Recommended |
| Internal service traffic | Recommended for production |

---

## 15. Observability Plan

### 15.1 Metrics

Metrics utama:

| Metric | Description |
|---|---|
| `api_request_count` | Jumlah request API |
| `api_request_latency_ms` | Latency API |
| `api_error_rate` | Error rate API |
| `ws_active_connections` | Jumlah koneksi WebSocket aktif |
| `ws_messages_sent_total` | Jumlah pesan WebSocket terkirim |
| `ingestion_records_total` | Jumlah data AIS yang diterima |
| `ingestion_lag_seconds` | Selisih waktu data provider vs sistem |
| `position_deduplicated_total` | Jumlah posisi duplikat yang dibuang |
| `geofence_evaluation_latency_ms` | Waktu evaluasi geofence |
| `alerts_created_total` | Jumlah alert dibuat |
| `notification_delivery_success_rate` | Keberhasilan pengiriman notifikasi |
| `database_query_latency_ms` | Latency query database |
| `redis_pubsub_lag_ms` | Lag Redis pub/sub |

### 15.2 Logs

Semua service harus menghasilkan structured logs.

Contoh log:

```json
{
  "timestamp": "2026-06-21T10:15:22Z",
  "level": "info",
  "service": "ingestion-worker",
  "event": "ais_position_ingested",
  "mmsi": "525123456",
  "provider": "ais_provider_1",
  "latency_ms": 320,
  "trace_id": "trc_abc123"
}
```

### 15.3 Dashboards

Dashboard observability minimal:

1. API health dashboard.
2. WebSocket active connection dashboard.
3. AIS ingestion dashboard.
4. Database health dashboard.
5. Geofence and alert dashboard.
6. Error and incident dashboard.

### 15.4 Alerting for System Health

Operational alert examples:

| Alert | Threshold |
|---|---|
| API error rate high | > 5% for 5 minutes |
| API latency high | p95 > 1 second for 5 minutes |
| WebSocket disconnected spike | > 30% drop in active clients |
| AIS ingestion stopped | No data for 5 minutes |
| Database CPU high | > 80% for 10 minutes |
| Disk usage high | > 80% |
| Redis unavailable | Any outage |
| Backup failed | Any failed scheduled backup |

---

## 16. Backup and Recovery Plan

### 16.1 Backup Scope

| Component | Backup Required |
|---|---|
| PostgreSQL database | Yes |
| Raw AIS logs | Yes |
| Uploaded/exported files | Yes |
| Application images | Stored in registry |
| Configuration | Git + secret manager |
| Redis | Optional for MVP, recommended if persistent queue used |

### 16.2 Recovery Objectives

| Environment | RPO | RTO |
|---|---:|---:|
| MVP Production | 24 hours | 4–8 hours |
| Mature Production | 15–60 minutes | 1–2 hours |

### 16.3 Restore Test

Restore test harus dilakukan minimal:

```text
MVP: 1x sebelum go-live
Production: 1x per quarter
```

Restore test checklist:

1. Restore database backup ke environment terpisah.
2. Verifikasi tabel utama.
3. Verifikasi extension PostGIS/TimescaleDB.
4. Verifikasi sample vessel history.
5. Verifikasi latest position.
6. Verifikasi login dan dashboard.
7. Catat durasi restore.

---

## 17. Rollback Plan

### 17.1 Application Rollback

Langkah rollback aplikasi:

1. Identifikasi release bermasalah.
2. Stop deployment baru.
3. Revert image tag ke versi sebelumnya.
4. Restart service.
5. Jalankan smoke test.
6. Monitor log dan metric.

### 17.2 Database Rollback

Database rollback lebih sensitif.

Aturan:

1. Avoid destructive migration.
2. Gunakan backward-compatible migration.
3. Jika migration gagal sebelum commit, rollback otomatis.
4. Jika migration sudah mengubah data production, gunakan restore atau compensating migration.
5. Backup wajib dilakukan sebelum migration besar.

### 17.3 Rollback Decision Matrix

| Issue | Action |
|---|---|
| Frontend broken | Rollback frontend image |
| API error spike | Rollback API image |
| Worker ingestion failure | Rollback worker image |
| Migration failure before production traffic | Rollback migration |
| Data corruption | Stop writes, restore backup, incident process |
| WebSocket unstable | Rollback gateway or disable realtime feature flag |

---

## 18. Smoke Test Plan

### 18.1 Post-Deployment Smoke Test

Setiap deployment harus menjalankan smoke test:

| Test | Expected Result |
|---|---|
| `GET /health` | 200 OK |
| `GET /ready` | 200 OK |
| Login test | Token returned |
| `GET /vessels/latest` | Returns data or valid empty state |
| WebSocket connect | Connection accepted |
| WebSocket subscribe | Subscription acknowledged |
| Ingestion worker health | Running |
| Database migration status | Latest migration applied |
| Redis connection | OK |
| Frontend load | Main dashboard visible |

### 18.2 Sample Health Endpoints

```http
GET /health
GET /ready
GET /metrics
```

Example response:

```json
{
  "status": "ok",
  "service": "vesseltrack-api",
  "version": "0.2.0",
  "timestamp": "2026-06-21T10:15:22Z",
  "dependencies": {
    "database": "ok",
    "redis": "ok",
    "ais_provider": "ok"
  }
}
```

---

## 19. Deployment Steps

### 19.1 Local Deployment

```text
1. Clone repository.
2. Copy `.env.example` to `.env`.
3. Fill local database and Redis config.
4. Run Docker Compose.
5. Run database migration.
6. Seed sample vessels and geofences.
7. Open frontend dashboard.
8. Verify map and mock AIS data.
```

Example commands:

```bash
cp .env.example .env
docker compose up -d
npm run migrate
npm run seed
```

### 19.2 Development Deployment

```text
1. Merge feature branch to develop.
2. CI builds Docker images.
3. Images pushed to registry with dev tag.
4. Deploy to dev environment.
5. Run migration.
6. Run smoke test.
7. Notify development channel.
```

### 19.3 Staging Deployment

```text
1. Merge develop to staging.
2. CI builds staging images.
3. Run full test suite.
4. Deploy to staging.
5. Run database migration.
6. Run integration test.
7. Execute UAT checklist.
8. Product owner approves release.
```

### 19.4 Production Deployment

```text
1. Create release tag.
2. Confirm backup completed.
3. Confirm staging passed.
4. Freeze schema changes.
5. Deploy production image.
6. Run migration if required.
7. Run smoke test.
8. Monitor 30–60 minutes after deployment.
9. Announce release completion.
```

---

## 20. Cutover Plan

### 20.1 MVP Cutover

MVP cutover dilakukan setelah staging UAT berhasil.

Checklist:

```text
[ ] Domain production configured
[ ] TLS certificate active
[ ] Production database created
[ ] PostGIS and TimescaleDB enabled
[ ] Initial migration applied
[ ] Admin user created
[ ] AIS provider API key configured
[ ] Area monitoring configured
[ ] Initial geofence configured
[ ] Backup job active
[ ] Health dashboard active
[ ] Operational alert active
[ ] Smoke test passed
[ ] User access validated
```

### 20.2 Production Readiness Review

Sebelum production:

| Area | Required |
|---|---|
| Functional UAT | Passed |
| Security baseline | Passed |
| Load test basic | Passed |
| Backup restore test | Passed |
| Monitoring dashboard | Available |
| Incident contact | Defined |
| Rollback plan | Ready |
| Release notes | Approved |

---

## 21. Scaling Plan

### 21.1 Scaling Trigger

| Trigger | Action |
|---|---|
| WebSocket clients > 500 | Scale WebSocket gateway horizontally |
| Ingestion lag > 30 seconds | Add worker replicas |
| API p95 latency > 1s | Scale API service |
| Database CPU > 80% | Optimize queries / scale DB |
| Position inserts > 1,000/sec | Partition tuning / batch insert |
| Redis memory > 70% | Increase Redis memory / tune retention |

### 21.2 Horizontal Scaling

Stateless services that can scale horizontally:

```text
frontend
api
websocket-gateway
ingestion-worker
geofence-worker
alert-worker
```

Stateful components requiring special care:

```text
postgresql
redis
object-storage
```

### 21.3 WebSocket Scaling Notes

Jika WebSocket gateway diskalakan horizontal:

1. Gunakan Redis pub/sub atau message broker untuk broadcast antar instance.
2. Gunakan sticky session jika diperlukan.
3. Simpan subscription state di Redis atau memory dengan fallback.
4. Gunakan bbox filtering agar payload tidak membanjiri client.

---

## 22. Performance Deployment Considerations

### 22.1 Database Performance

1. Gunakan index pada `mmsi`, `timestamp`, dan `geom`.
2. Gunakan TimescaleDB hypertable untuk `vessel_positions`.
3. Gunakan compression untuk histori lama.
4. Gunakan retention policy untuk raw data jika biaya storage perlu dikendalikan.
5. Gunakan materialized view atau continuous aggregate untuk analytics.

### 22.2 Map Performance

1. Frontend hanya subscribe vessel dalam viewport/bbox.
2. Gunakan marker clustering jika jumlah kapal besar.
3. Gunakan update delta, bukan full refresh.
4. Batasi refresh visual menjadi interval stabil, misalnya 1–3 detik.
5. Jangan render route history lengkap secara default.

### 22.3 Ingestion Performance

1. Batch insert posisi AIS.
2. Deduplicate sebelum insert.
3. Separate raw storage dan cleaned storage.
4. Gunakan retry queue.
5. Monitor provider latency dan rate limit.

---

## 23. Data Retention Deployment Policy

Initial recommendation:

| Data | MVP Retention | Production Retention |
|---|---:|---:|
| Latest vessel position | Current only | Current only |
| Vessel position history | 90 days | 6–24 months |
| Raw AIS message | 30 days | 90–180 days |
| Alert history | 180 days | 1–3 years |
| Audit log | 1 year | 3–7 years depending policy |
| Export files | 7–30 days | Configurable |
| Application logs | 14–30 days | 30–90 days |

---

## 24. Disaster Recovery Plan

### 24.1 Incident Levels

| Level | Description | Response |
|---|---|---|
| SEV-1 | Production down / data corruption | Immediate incident response |
| SEV-2 | Major function unavailable | Fix or rollback same day |
| SEV-3 | Partial degradation | Planned fix |
| SEV-4 | Minor issue | Backlog |

### 24.2 DR Scenarios

| Scenario | Recovery Action |
|---|---|
| App container crash | Auto restart / redeploy |
| Database unavailable | Failover or restore backup |
| AIS provider outage | Retry, fallback, degraded mode |
| Redis outage | Restart Redis, fallback polling where possible |
| Bad deployment | Rollback image |
| Corrupted data | Stop writes, restore backup, investigate |
| Domain/TLS issue | Renew cert, switch DNS, bypass if internal |

### 24.3 Degraded Mode

Jika AIS provider gagal:

1. Tampilkan status `Provider Degraded`.
2. Gunakan latest known position.
3. Tandai vessel sebagai stale jika melewati threshold.
4. Jangan membuat alert palsu berlebihan.
5. Catat outage di operational log.

---

## 25. Access and Operations Model

### 25.1 Production Access

| Role | Access |
|---|---|
| Developer | No direct DB access by default |
| DevOps | Infrastructure and deployment access |
| DBA/Data Engineer | Controlled DB access |
| Security Admin | Audit and security config |
| Operator | Application only |
| Viewer | Read-only dashboard |

### 25.2 Access Rules

1. MFA untuk admin dan DevOps.
2. SSH access dibatasi dengan key dan IP allowlist.
3. Database access melalui VPN/bastion jika diperlukan.
4. Production secrets tidak boleh dibuka di local environment.
5. Semua production access harus tercatat.

---

## 26. Release Checklist

### 26.1 Pre-Release Checklist

```text
[ ] All tests passed
[ ] Security scan passed
[ ] Docker images built successfully
[ ] Migration reviewed
[ ] Backup completed
[ ] Release notes prepared
[ ] Rollback image available
[ ] Monitoring dashboard checked
[ ] Staging smoke test passed
[ ] Product owner approval obtained
```

### 26.2 Post-Release Checklist

```text
[ ] Frontend dashboard loads
[ ] Login works
[ ] Vessel latest position visible
[ ] WebSocket updates received
[ ] Ingestion worker running
[ ] Geofence worker running
[ ] Alert creation tested
[ ] API latency normal
[ ] Error rate normal
[ ] Database CPU/memory normal
[ ] No critical logs detected
[ ] Release announced
```

---

## 27. MVP Deployment Timeline

Indicative timeline:

| Week | Activity | Output |
|---:|---|---|
| 1 | Setup repository, Docker, local compose | Local dev environment |
| 2 | Setup database, migration, seed data | DB baseline |
| 3 | Deploy dev environment | Dev deployment |
| 4 | Deploy staging environment | Staging dashboard |
| 5 | Add CI/CD and smoke tests | Automated deployment |
| 6 | Production MVP cutover | MVP live |

---

## 28. Production Hardening Backlog

Recommended backlog after MVP:

```text
[ ] Move PostgreSQL to managed database
[ ] Enable PITR backup
[ ] Add WAF
[ ] Add centralized secret manager
[ ] Add container image vulnerability scanning
[ ] Add SAST/DAST pipeline
[ ] Add horizontal WebSocket scaling
[ ] Add Redis HA
[ ] Add provider failover
[ ] Add object storage lifecycle policy
[ ] Add load testing suite
[ ] Add backup restore automation
[ ] Add incident management runbook
[ ] Add blue-green deployment
[ ] Add infrastructure as code
```

---

## 29. Infrastructure as Code Plan

For repeatable deployment, use IaC after MVP.

Recommended options:

| Tool | Use Case |
|---|---|
| Terraform | Cloud infrastructure provisioning |
| Ansible | VM/server configuration |
| Helm | Kubernetes application packaging |
| Docker Compose | MVP/simple deployment |

IaC target resources:

```text
network
firewall
load balancer
compute/container service
database
redis
object storage
secret manager
monitoring
DNS records
TLS certificates
```

---

## 30. Acceptance Criteria

Deployment plan dianggap siap jika:

1. Local deployment dapat dijalankan menggunakan Docker Compose.
2. Staging environment tersedia dan bisa diakses oleh tim.
3. Production deployment flow terdokumentasi.
4. CI/CD minimal dapat build, test, dan deploy ke staging.
5. Database migration dapat dijalankan otomatis dan versioned.
6. Health check endpoint tersedia.
7. HTTPS dan WSS aktif di staging/production.
8. Secret tidak disimpan dalam repository.
9. Backup database aktif untuk staging/production.
10. Rollback plan terdokumentasi dan dapat diuji.
11. Monitoring dashboard minimum tersedia.
12. Smoke test berjalan setelah deployment.

---

## 31. Open Questions

| Question | Owner | Status |
|---|---|---|
| Cloud provider apa yang akan dipakai untuk MVP? | Product/Tech Lead | Open |
| Apakah database akan managed atau self-hosted pada MVP? | Tech Lead | Open |
| AIS provider final yang dipilih siapa? | Product Owner | Open |
| Apakah WebSocket dipisah dari API sejak MVP? | Architect | Open |
| Domain production yang digunakan apa? | Product Owner | Open |
| Apakah ada kebutuhan deployment on-premise? | Product Owner | Open |
| SLA production awal berapa? | Product Owner | Open |
| Retention data final berapa bulan/tahun? | Product Owner/Data Owner | Open |

---

## 32. Summary

`12_Deployment_Plan.md` mendefinisikan cara membawa **Real Time Vessel Tracking System** dari kode menjadi sistem yang hidup dan bisa dioperasikan. Untuk MVP, pendekatan paling efisien adalah containerized deployment dengan Docker, PostgreSQL + PostGIS + TimescaleDB, Redis, reverse proxy TLS, dan CI/CD sederhana.

Setelah MVP terbukti, sistem dapat dinaikkan kelasnya melalui managed database, horizontal scaling, observability matang, backup PITR, WAF, secret manager, dan deployment strategy seperti blue-green atau canary.

Dokumen ini menjadi dasar bagi tim DevOps, backend, frontend, QA, dan product owner untuk mengeksekusi deployment secara terukur, aman, dan dapat dipulihkan jika terjadi gangguan.
