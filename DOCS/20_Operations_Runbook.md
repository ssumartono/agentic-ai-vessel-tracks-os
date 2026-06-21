# 20_Operations_Runbook.md
# Operations Runbook

**Project:** Real Time Vessel Tracking System / VesselTrack OS  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product & Engineering Team  

---


## 1. Purpose

Dokumen ini adalah runbook operasional untuk **Real Time Vessel Tracking System / VesselTrack OS**. Runbook ini digunakan oleh tim operasi, DevOps, support, dan technical owner untuk menjalankan, memantau, menangani insiden, backup, restore, dan melakukan rilis sistem.

Runbook adalah “buku jaga mercusuar”: ketika malam data gelap, alert berkedip, atau provider AIS mendadak bisu, tim tahu tombol mana yang harus ditekan dan siapa yang harus dihubungi.

---

## 2. System Overview

### 2.1 Core Components

| Component | Function |
|---|---|
| Frontend Web App | Dashboard map, vessel pages, alert UI |
| Backend API | REST API, auth, RBAC, business logic |
| WebSocket Gateway | Realtime vessel position and alert events |
| Ingestion Service | Fetch AIS data from provider |
| Processing Service | Normalize, validate, deduplicate AIS data |
| Geofence Engine | Evaluate vessel position against geofence rules |
| Alert Engine | Create and manage alerts |
| PostgreSQL/PostGIS | Core relational and geospatial database |
| TimescaleDB Extension | Time-series optimization for vessel positions |
| Redis | Cache, pub/sub, temporary state |
| Object/Raw Storage | Raw AIS logs and export files |
| Monitoring Stack | Metrics, logs, alerts |

### 2.2 Logical Data Flow

```text
AIS Provider
  -> Ingestion Service
  -> Raw AIS Storage
  -> Parser / Normalizer / Validator
  -> PostgreSQL + PostGIS + TimescaleDB
  -> Latest Position Cache
  -> REST API + WebSocket Gateway
  -> Dashboard / Alert Inbox
```

---

## 3. Environment Inventory

### 3.1 Environments

| Environment | Purpose | Users |
|---|---|---|
| Local | Developer machine | Developers |
| Dev | Integration testing | Engineering |
| Staging | UAT and release candidate | PO, QA, users |
| Production | Live operation | Operators, admins, analysts |

### 3.2 Environment Variables

| Variable | Description | Secret | Example |
|---|---|---|---|
| `APP_ENV` | Environment name | No | production |
| `DATABASE_URL` | PostgreSQL connection | Yes | postgres://... |
| `REDIS_URL` | Redis connection | Yes | redis://... |
| `AIS_PROVIDER_NAME` | Provider adapter | No | provider_a |
| `AIS_API_BASE_URL` | AIS provider endpoint | No | https://api.provider.com |
| `AIS_API_KEY` | AIS provider API key | Yes | hidden |
| `JWT_SECRET` | Token signing secret | Yes | hidden |
| `LOG_LEVEL` | Logging verbosity | No | info |
| `MAP_TILE_URL` | Map tile endpoint | No | https://... |
| `ALERT_EMAIL_FROM` | Alert sender email | No | no-reply@example.com |

Secret values must never be committed to source control.

---

## 4. Access and Responsibility

### 4.1 Operational Roles

| Role | Responsibility |
|---|---|
| On-call Engineer | First responder for incidents |
| DevOps Engineer | Infrastructure, deployment, backup, monitoring |
| Backend Engineer | API, ingestion, WebSocket, geofence, alert troubleshooting |
| Frontend Engineer | UI dashboard issues |
| Database Administrator | Database performance, backup/restore |
| Product Owner | Business impact decisions |
| Security Contact | Security incident handling |
| AIS Provider Contact | Vendor escalation |

### 4.2 Access Principles

1. Use least privilege.
2. Use named accounts, not shared accounts.
3. Production database write access is restricted.
4. Secrets are stored in secret manager or protected environment variables.
5. All admin actions must be auditable.

---

## 5. Routine Operations

### 5.1 Daily Health Check

Run every morning or shift start.

Checklist:

1. Open system dashboard.
2. Confirm frontend loads.
3. Confirm realtime status is healthy.
4. Confirm AIS provider last successful fetch is recent.
5. Confirm active vessels are visible.
6. Confirm no critical system alert.
7. Confirm database health.
8. Confirm disk usage below threshold.
9. Confirm backup completed.
10. Review error logs from last 24 hours.

Expected Status:

| Check | Healthy Condition |
|---|---|
| Frontend | Loads within target |
| Backend API | `/health` returns healthy |
| Database | Connection OK, low error rate |
| Redis | Connection OK |
| AIS Provider | Last fetch within configured interval |
| WebSocket | Active clients can connect |
| Ingestion | Messages processed continuously |
| Alerts | No unknown critical errors |

### 5.2 Weekly Operations Review

1. Review system uptime.
2. Review top API slow endpoints.
3. Review ingestion failure rate.
4. Review WebSocket disconnect rate.
5. Review database growth.
6. Review backup restore test status.
7. Review open incidents.
8. Review security/audit anomalies.
9. Review AIS provider cost/usage.

---

## 6. Health Endpoints

### 6.1 Backend Health

```text
GET /health
```

Expected response:

```json
{
  "status": "healthy",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "ais_provider": "healthy"
  },
  "timestamp": "2026-06-21T02:00:00Z"
}
```

### 6.2 Readiness

```text
GET /ready
```

Used by deployment/load balancer.

### 6.3 Liveness

```text
GET /live
```

Used to detect process-level failure.

---

## 7. Monitoring Metrics

### 7.1 Application Metrics

| Metric | Meaning | Warning | Critical |
|---|---|---:|---:|
| `api_request_latency_p95` | API p95 latency | > 800 ms | > 2000 ms |
| `api_error_rate` | API 5xx rate | > 2% | > 5% |
| `websocket_active_clients` | Active WS clients | Informational | Informational |
| `websocket_disconnect_rate` | Disconnect rate | > baseline x2 | > baseline x5 |
| `ingestion_messages_per_minute` | AIS processed rate | Drops 50% | Drops 90% |
| `ingestion_error_rate` | AIS fetch/process error | > 5% | > 20% |
| `alert_created_per_hour` | Alert volume | > baseline x3 | > baseline x10 |
| `db_connection_usage` | DB pool usage | > 80% | > 95% |
| `db_disk_usage` | DB disk usage | > 75% | > 90% |

### 7.2 Business Metrics

| Metric | Meaning |
|---|---|
| Active vessels | Number of vessels with recent valid position |
| Stale vessels | Vessels without update beyond threshold |
| Alerts today | Alert count by severity |
| Geofence violations | Violations by area |
| AIS provider freshness | Last successful fetch |

---

## 8. Log Locations and Search Patterns

### 8.1 Log Categories

| Log | Content |
|---|---|
| Application log | API requests, service errors |
| Ingestion log | Provider fetch, parse, validation, dedup |
| WebSocket log | Connection, subscription, disconnect |
| Alert log | Rule trigger, alert lifecycle |
| Audit log | User/admin actions |
| Database log | Query errors, slow queries |
| Deployment log | Build/deploy events |

### 8.2 Useful Search Patterns

```text
ERROR
WARN
provider_error
ingestion_failed
validation_failed
websocket_disconnect
alert_created
alert_suppressed
geofence_evaluation_failed
database_timeout
unauthorized
forbidden
```

---

## 9. Incident Severity

| Severity | Description | Response Target | Example |
|---|---|---:|---|
| SEV-1 | Production down or severe data loss/security issue | Immediate | Dashboard unavailable, DB down |
| SEV-2 | Major feature degraded | < 1 hour | AIS ingestion stopped, WebSocket down |
| SEV-3 | Partial degradation | < 4 hours | Export broken, some alerts delayed |
| SEV-4 | Minor issue | Next business day | UI cosmetic issue |

---

## 10. Incident Response Process

### 10.1 First Response

1. Acknowledge incident.
2. Identify severity.
3. Create incident record.
4. Assign incident commander if SEV-1/SEV-2.
5. Communicate initial status.
6. Start diagnosis using checklist.
7. Mitigate first, root cause later.

### 10.2 Incident Record Template

```markdown
# Incident Record

Incident ID:
Severity:
Start time:
Detected by:
Affected environment:
Affected users:
Affected components:

## Summary

## Timeline
- Time:

## Impact

## Actions Taken

## Root Cause

## Follow-up Items

## Status
Open / Mitigated / Resolved / Postmortem Complete
```

### 10.3 Communication Template

```text
Status: Investigating / Mitigating / Resolved
Impact: [brief impact]
Affected module: [module]
Current action: [what team is doing]
Next update: [time or milestone]
```

---

## 11. Troubleshooting Playbooks

## 11.1 Frontend Dashboard Not Loading

Symptoms:

1. Browser shows blank page.
2. Login works but dashboard fails.
3. Static assets fail.

Checklist:

1. Check frontend service status.
2. Check CDN/static asset availability if used.
3. Check browser console error.
4. Check backend API availability.
5. Check environment configuration for API base URL.
6. Roll back latest frontend deployment if issue started after release.

Common Causes:

| Cause | Action |
|---|---|
| Bad frontend build | Rollback deployment |
| API URL misconfigured | Fix environment variable and redeploy |
| Auth token issue | Check auth service and cookie/token config |
| Map tile blocked | Check map tile provider and CORS |

---

## 11.2 AIS Ingestion Stopped

Symptoms:

1. No new vessel positions.
2. Provider last fetch is stale.
3. Ingestion rate drops to zero.

Checklist:

1. Check ingestion service status.
2. Check AIS provider health endpoint/API response.
3. Check API key validity.
4. Check provider rate limit.
5. Check network connectivity.
6. Check ingestion logs for `provider_error`.
7. Restart ingestion service if safe.
8. Switch to mock/replay mode for demo/UAT if provider down.

Commands/Actions:

```text
Check logs: ingestion service logs
Check health: /health provider component
Check config: AIS_PROVIDER_NAME, AIS_API_BASE_URL
```

Escalate to AIS provider if:

1. API returns 401/403 despite valid key.
2. API returns repeated 5xx.
3. Data coverage disappears unexpectedly.
4. Rate limit changed without notice.

---

## 11.3 Vessel Markers Not Updating

Symptoms:

1. Map loads but markers static.
2. Last update timestamp does not change.
3. WebSocket disconnected.

Checklist:

1. Confirm AIS ingestion is running.
2. Confirm latest positions are updated in database.
3. Confirm WebSocket gateway is healthy.
4. Check browser WebSocket connection.
5. Check bbox subscription message.
6. Check Redis/pub-sub if used.
7. Check throttling/backpressure settings.

Likely Causes:

| Cause | Action |
|---|---|
| WebSocket auth failed | Refresh login/token, check auth logs |
| BBox filter too narrow | Reset map area or subscription |
| No new AIS data | Diagnose ingestion |
| Gateway disconnected | Restart gateway or scale instance |

---

## 11.4 Geofence Alert Not Generated

Symptoms:

1. Vessel enters geofence but no alert.
2. Geofence exists but rule not triggered.

Checklist:

1. Confirm geofence is active.
2. Confirm rule is active.
3. Confirm vessel position is valid.
4. Confirm geometry is valid polygon.
5. Check spatial query result manually.
6. Check cooldown/dedup suppression.
7. Check alert engine logs.
8. Check severity and rule configuration.

Common Causes:

| Cause | Action |
|---|---|
| Geofence inactive | Activate geofence |
| Rule disabled | Enable rule |
| Invalid polygon | Fix geometry |
| Position outside polygon due to projection/coordinate issue | Validate SRID 4326 |
| Alert suppressed by cooldown | Check suppression log |

---

## 11.5 Alert Storm

Symptoms:

1. Too many alerts in short time.
2. Operator overwhelmed.
3. Notification channel spam.

Checklist:

1. Identify alert type and source geofence.
2. Check recent geofence/rule changes.
3. Check deduplication and cooldown config.
4. Temporarily mute noisy rule if operationally approved.
5. Increase cooldown or threshold.
6. Review if AIS jitter caused boundary crossing.
7. Apply hysteresis/buffer if needed.

Immediate Mitigation:

1. Disable notification channel for noisy rule.
2. Keep dashboard alert visible but suppress external notifications.
3. Inform operators.
4. Open defect/tuning task.

---

## 11.6 Database Slow or Unavailable

Symptoms:

1. API latency high.
2. Timeout errors.
3. Ingestion backlog grows.
4. Dashboard slow.

Checklist:

1. Check database CPU/memory/disk.
2. Check active connections.
3. Check slow queries.
4. Check lock contention.
5. Check table/index bloat.
6. Check recent migration.
7. Check storage capacity.
8. Consider scaling or restarting only after impact assessment.

Mitigation:

| Problem | Action |
|---|---|
| Too many connections | Tune pool, restart leaking service |
| Slow geospatial query | Check GIST index and bbox prefilter |
| Disk almost full | Increase storage, archive raw logs |
| Migration issue | Rollback migration if possible |
| Large history query | Enforce time range and sampling |

---

## 11.7 WebSocket Connection Flood

Symptoms:

1. High active client count.
2. CPU spike on gateway.
3. Frequent disconnects.

Checklist:

1. Check active clients.
2. Check message rate.
3. Check subscription patterns.
4. Enable/adjust rate limit.
5. Scale WebSocket gateway horizontally if supported.
6. Check if clients reconnect too aggressively.

Mitigation:

1. Enforce heartbeat timeout.
2. Enforce max subscriptions per client.
3. Increase throttle interval.
4. Use bbox filtering.
5. Temporarily block abusive clients/IPs.

---

## 11.8 Login/Auth Failure

Symptoms:

1. Users cannot login.
2. Token invalid errors.
3. RBAC incorrect.

Checklist:

1. Check auth service/backend status.
2. Check JWT secret/config.
3. Check clock skew between servers.
4. Check database user table/identity provider.
5. Check recent deployment.
6. Check role mapping.

Mitigation:

1. Rollback auth-related deployment.
2. Restore previous secret/config if rotated incorrectly.
3. Create emergency admin only through approved secure procedure.
4. Log incident if unauthorized access suspected.

---

## 12. Deployment Runbook

### 12.1 Pre-Deployment Checklist

1. Release notes prepared.
2. Migration reviewed.
3. Backup completed.
4. CI pipeline green.
5. Security scan completed.
6. Staging smoke test passed.
7. Rollback plan confirmed.
8. Deployment window communicated.
9. On-call engineer assigned.
10. Monitoring dashboard open.

### 12.2 Deployment Steps

Generic flow:

```text
1. Freeze release branch.
2. Run CI pipeline.
3. Build container images.
4. Push images to registry.
5. Backup production database.
6. Apply database migrations.
7. Deploy backend.
8. Deploy ingestion service.
9. Deploy WebSocket gateway.
10. Deploy frontend.
11. Run smoke tests.
12. Monitor metrics and logs.
13. Announce completion.
```

### 12.3 Smoke Test

After deployment:

1. Login as test operator.
2. Open dashboard.
3. Confirm vessel markers appear.
4. Confirm latest position API responds.
5. Confirm WebSocket connects.
6. Confirm alert inbox loads.
7. Confirm geofence list loads.
8. Confirm health endpoint healthy.

### 12.4 Rollback Plan

Rollback if:

1. Dashboard unavailable.
2. API 5xx > critical threshold.
3. Database migration breaks core flow.
4. WebSocket cannot connect.
5. Critical security issue found.

Rollback steps:

```text
1. Announce rollback start.
2. Stop new deployment rollout.
3. Revert frontend to previous version.
4. Revert backend/websocket/ingestion image to previous version.
5. If migration is reversible, apply down migration.
6. If not reversible, restore from backup only after approval.
7. Run smoke test.
8. Announce rollback result.
```

---

## 13. Backup and Restore Runbook

### 13.1 Backup Policy

| Data | Frequency | Retention |
|---|---|---|
| PostgreSQL database | Daily | 30 days MVP baseline |
| Raw AIS logs | Daily/archive | Based on cost and legal policy |
| Application config | On change | Latest + history |
| Secrets | Managed by secret manager | Rotation policy |
| Export files | Based on retention policy | Configurable |

### 13.2 Backup Verification

Weekly:

1. Confirm backup files exist.
2. Confirm backup size is plausible.
3. Confirm backup completed successfully.
4. Perform restore drill at least monthly or before major release.

### 13.3 Restore Drill

Steps:

```text
1. Provision temporary restore database.
2. Restore latest backup.
3. Run schema validation.
4. Run sample queries.
5. Confirm vessel and alert records exist.
6. Document restore duration.
7. Destroy temporary environment if no longer needed.
```

### 13.4 RTO/RPO Targets

| Metric | MVP Target |
|---|---:|
| RTO | <= 4 hours |
| RPO | <= 24 hours |

For production-critical operations, targets should be tightened after MVP.

---

## 14. Data Retention and Archival

Recommended MVP policy:

| Data | Retention |
|---|---:|
| Vessel latest position | Current only |
| Vessel position history | 90-180 days depending storage |
| Raw AIS messages | 30-90 days depending cost/license |
| Alerts | 1 year |
| Audit logs | 1 year minimum |
| Export files | 7-30 days |

Archival considerations:

1. Use compression for old AIS data.
2. Use TimescaleDB retention/compression if available.
3. Archive raw logs to object storage.
4. Document vendor license restrictions.

---

## 15. Security Operations

### 15.1 Secret Rotation

Rotate:

1. AIS API keys.
2. JWT secrets.
3. Database passwords.
4. Redis passwords.
5. SMTP/webhook credentials.

Rotation steps:

```text
1. Create new secret.
2. Deploy service with dual-read if supported.
3. Validate service health.
4. Revoke old secret.
5. Confirm no service uses old secret.
6. Record rotation in audit/change log.
```

### 15.2 Suspicious Activity

Indicators:

1. Repeated failed login.
2. Unexpected admin action.
3. API access spike.
4. Export spike.
5. Unauthorized WebSocket attempts.
6. Secret exposure.

Actions:

1. Preserve logs.
2. Disable suspicious account/API key.
3. Notify security contact.
4. Rotate affected secrets.
5. Review audit logs.
6. Open incident if needed.

---

## 16. Operational Checklists

### 16.1 Shift Handover Checklist

```markdown
# Shift Handover

Date/Time:
Outgoing operator:
Incoming operator:

## System Status
- Dashboard:
- AIS Provider:
- Ingestion:
- WebSocket:
- Database:
- Alerts:

## Active Issues
| Issue | Severity | Owner | Next Action |

## Important Notes

## Pending Actions
```

### 16.2 Release Handover Checklist

1. Release version.
2. Features released.
3. Known issues.
4. Rollback version.
5. Migration notes.
6. Monitoring focus.
7. Support contact.

---

## 17. Common Commands Placeholder

Actual commands depend on deployment platform. Replace placeholders with real commands during implementation.

### Docker Compose Example

```bash
# Start local stack
docker compose up -d

# View logs
docker compose logs -f backend

docker compose logs -f ingestion

docker compose logs -f websocket

# Stop stack
docker compose down

# Run migrations
docker compose exec backend npm run migrate
```

### Database Example

```bash
# Connect to database
psql "$DATABASE_URL"

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check latest vessel position count
SELECT count(*) FROM vessel_latest_positions;

# Check newest position timestamp
SELECT max(position_timestamp) FROM vessel_positions;
```

---

## 18. Contact and Escalation Matrix

| Situation | Primary | Secondary | Escalation |
|---|---|---|---|
| Production down | On-call Engineer | DevOps | Project Sponsor |
| AIS provider issue | Backend/Data Engineer | PO | AIS Vendor Support |
| Database issue | DBA/DevOps | Tech Lead | Cloud Provider |
| Security incident | Security Contact | Tech Lead | Sponsor |
| User workflow issue | Support/PO | QA | Product Owner |
| Deployment issue | DevOps | Tech Lead | PM |

---

## 19. Known Limitations for MVP

1. AIS data depends on provider coverage and latency.
2. Local AIS receiver is not included in MVP.
3. Advanced anomaly detection is deferred.
4. Playback performance depends on sampling and time range.
5. Alert accuracy depends on geofence geometry and AIS data quality.
6. Multi-provider fallback is not included unless explicitly added.

---

## 20. Post-Incident Review

Run post-incident review for SEV-1 and SEV-2.

Template:

```markdown
# Post-Incident Review

Incident ID:
Date:
Severity:
Duration:
Facilitator:

## What Happened

## Impact

## Timeline

## Root Cause

## What Went Well

## What Went Wrong

## Action Items
| Action | Owner | Due Date | Priority |

## Prevention Plan
```

---

## 21. Operational Readiness Checklist

Before production launch:

1. Health endpoint active.
2. Monitoring dashboard active.
3. Alerting for system failures active.
4. Backup configured.
5. Restore drill completed.
6. Deployment rollback tested.
7. Secrets stored securely.
8. RBAC configured.
9. Audit logs enabled.
10. AIS provider credential validated.
11. Runbook reviewed by operations team.
12. UAT sign-off obtained.
13. Known limitations documented.
14. Support contacts available.

---

## 22. Acceptance Criteria for This Document

Dokumen ini diterima jika:

1. Komponen sistem dan alur operasi dijelaskan.
2. Health check, monitoring, backup, restore, deployment, rollback, dan incident response tersedia.
3. Troubleshooting playbook mencakup isu utama MVP.
4. Security operations dan escalation matrix tersedia.
5. Dokumen dapat digunakan oleh tim operasi saat staging dan production.
