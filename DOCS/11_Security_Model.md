# 11_Security_Model.md

# Security Model
## Real Time Vessel Tracking System / VesselTrack OS

**Document ID:** 11_Security_Model.md  
**Version:** 1.0  
**Status:** Draft for MVP Design  
**Derived From:**
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

---

## 1. Purpose

This document defines the security model for **Real Time Vessel Tracking System / VesselTrack OS**.

The system processes vessel position data, geofence events, alerts, operator activity, API credentials, map data, and operational monitoring information. Although AIS vessel data can be public in many contexts, the operational interpretation, restricted zones, alert rules, user activity, and customer-specific monitoring scope are sensitive and must be protected.

This document provides the security blueprint for:

1. Authentication.
2. Authorization.
3. Role-based access control.
4. API security.
5. WebSocket security.
6. Data protection.
7. Secrets management.
8. Audit logging.
9. Threat model.
10. Infrastructure security.
11. Secure development and deployment.
12. MVP and production hardening controls.

---

## 2. Security Principles

The security model follows these principles:

| Principle | Description |
|---|---|
| Least Privilege | Users and services receive only the permissions required for their work. |
| Defense in Depth | Security controls are layered across identity, API, database, network, application, and infrastructure. |
| Secure by Default | New users, APIs, services, and configurations should default to restricted access. |
| Zero Trust Mindset | Every request must be authenticated, authorized, validated, and logged. |
| Data Minimization | Store only the data required for operational and analytical purposes. |
| Auditability | Important activities must be traceable. |
| Resilience | Security design must support detection, recovery, and continuity. |
| Separation of Duties | Administrative, operator, analyst, and viewer roles should be separated. |
| Vendor Key Protection | AIS provider credentials and external integration tokens must never be exposed to frontend clients. |

---

## 3. Security Scope

### 3.1 In Scope

| Area | In Scope |
|---|---|
| Web Application | Dashboard, map, vessel detail, alert inbox, geofence editor, playback, analytics. |
| Backend API | REST API, ingestion API, admin API, export API. |
| WebSocket | Real-time vessel update, alert stream, geofence event stream. |
| Database | PostgreSQL, PostGIS, TimescaleDB tables. |
| Cache / Stream | Redis Streams or equivalent queue/cache. |
| External Integrations | AIS API provider, map provider, email, Telegram/WhatsApp gateway. |
| Identity | Users, roles, permissions, sessions, tokens. |
| Infrastructure | Docker, cloud runtime, network, logs, secrets. |
| DevSecOps | Secure coding, dependency scanning, CI/CD controls. |

### 3.2 Out of Scope for MVP

| Area | Status |
|---|---|
| Full SOC integration | Production phase. |
| SIEM integration | Optional hardening phase. |
| Hardware AIS receiver security | Future phase if local receiver is deployed. |
| Maritime regulatory certification | Future compliance assessment. |
| Advanced spoofing detection | Analytics phase. |
| Full multi-tenant isolation | Future SaaS phase unless required by customer. |

---

## 4. Security Reference Baseline

The system should align with these references:

| Reference | Usage |
|---|---|
| OWASP API Security Top 10 2023 | API risk baseline. |
| OWASP ASVS 5.0 | Application security verification baseline. |
| OWASP WebSocket Security Cheat Sheet | WebSocket-specific controls. |
| NIST Cybersecurity Framework 2.0 | Governance, risk, identify, protect, detect, respond, recover structure. |
| ISO/IEC 27001 | Future ISMS alignment. |
| CIS Docker / Kubernetes Benchmark | Future infrastructure hardening. |

---

## 5. Security Architecture Overview

```text
+--------------------------------------------------------------+
|                         User Browser                         |
|  - HTTPS only                                                |
|  - Secure session/JWT                                        |
|  - RBAC-driven UI                                            |
+------------------------------+-------------------------------+
                               |
                               | HTTPS / WSS
                               v
+--------------------------------------------------------------+
|                      API Gateway / Edge                      |
|  - TLS termination                                            |
|  - Rate limiting                                              |
|  - Request size limit                                         |
|  - WAF optional                                               |
|  - CORS policy                                                |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                       Backend Services                       |
|  Auth Service                                                 |
|  Vessel API                                                   |
|  Position API                                                 |
|  Geofence API                                                 |
|  Alert API                                                    |
|  WebSocket Gateway                                            |
|  Ingestion Service                                            |
|  Audit Logger                                                 |
+------------------------------+-------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
+---------------------+                       +---------------------+
| PostgreSQL/PostGIS  |                       | Redis / Stream       |
| TimescaleDB         |                       | Cache / Events       |
| Encrypted storage   |                       | TTL / ACL            |
+---------------------+                       +---------------------+
        |
        v
+--------------------------------------------------------------+
|                     External Providers                       |
|  AIS API Provider                                             |
|  Map Tile Provider                                            |
|  Email / Messaging Gateway                                    |
|  Monitoring / Logging                                         |
+--------------------------------------------------------------+
```

---

## 6. Trust Boundaries

| Boundary | Description | Main Risk | Required Control |
|---|---|---|---|
| Browser to API | User requests from frontend to backend. | Token theft, CSRF, XSS, unauthorized access. | HTTPS, secure token handling, CORS, CSP, RBAC. |
| Browser to WebSocket | Persistent real-time connection. | Unauthorized subscription, message flooding. | WSS, auth on connect, channel authorization, heartbeat, rate limit. |
| API to Database | Backend reads/writes operational data. | SQL injection, excessive privileges. | Parameterized queries, DB role separation, least privilege. |
| Backend to AIS Provider | External vessel data ingestion. | Key leakage, vendor outage, poisoned data. | Server-side keys, retry policy, validation, raw log quarantine. |
| Backend to Notification Gateway | Alert delivery. | Secret leakage, spam, data overexposure. | Token vault, template control, channel rate limit. |
| Admin User to Control Plane | Admin manages users/rules/settings. | Privilege abuse. | MFA, audit log, dual review for critical changes. |

---

## 7. Asset Classification

### 7.1 Asset Categories

| Asset | Classification | Example | Protection Requirement |
|---|---|---|---|
| User credentials | Confidential | Password hash, MFA secret. | Strong encryption/hash, restricted access. |
| Access tokens | Confidential | JWT, refresh token. | Short TTL, secure storage, revocation. |
| AIS provider API key | Secret | Vendor API token. | Secret manager only, never frontend. |
| Vessel latest position | Operational | Current vessel location. | Access controlled, integrity protected. |
| Vessel history | Operational Sensitive | Route history, playback data. | Retention policy, export control. |
| Geofence polygon | Sensitive | Restricted area boundary. | Role restricted, audit changes. |
| Alert rules | Sensitive | Rule conditions and escalation. | Role restricted, audit changes. |
| Alert event | Sensitive | Breach event, speed violation. | Role restricted, lifecycle audit. |
| Operator activity | Sensitive | Acknowledge, close, assign alert. | Immutable audit log. |
| Raw AIS message | Internal | Provider payload / raw NMEA. | Retention limit, access restricted. |
| System logs | Internal / Sensitive | Error logs, traces. | Mask secrets, access restricted. |

### 7.2 Data Sensitivity Levels

| Level | Description | Examples |
|---|---|---|
| Public | Safe to display publicly. | Generic vessel type classification, public basemap. |
| Internal | For authenticated internal users. | Vessel dashboard, KPI summary. |
| Operational Sensitive | Could reveal operational patterns. | Vessel history, geofence, alert timeline. |
| Confidential | Must be tightly restricted. | API keys, auth tokens, user credentials. |

---

## 8. Identity and Authentication

### 8.1 MVP Authentication Options

Recommended MVP approach:

```text
Email + password authentication
JWT access token
Refresh token rotation
Optional MFA for Admin
```

Production approach:

```text
SSO / OIDC integration
Mandatory MFA for Admin and Operator
Device/session management
Centralized identity provider
```

### 8.2 Authentication Requirements

| ID | Requirement | MVP | Production |
|---|---|---|---|
| AUTH-001 | All dashboard users must authenticate. | Yes | Yes |
| AUTH-002 | Passwords must be hashed using Argon2id or bcrypt. | Yes | Yes |
| AUTH-003 | Access token must be short-lived. | Yes | Yes |
| AUTH-004 | Refresh token must support rotation and revocation. | Yes | Yes |
| AUTH-005 | Admin users must use MFA. | Optional | Mandatory |
| AUTH-006 | Failed login attempts must be rate-limited. | Yes | Yes |
| AUTH-007 | Inactive sessions must expire automatically. | Yes | Yes |
| AUTH-008 | Password reset tokens must be one-time use and time-limited. | Yes | Yes |

### 8.3 Token Policy

| Token | Recommended TTL | Notes |
|---|---:|---|
| Access Token | 15 minutes | Used for API and WebSocket authorization. |
| Refresh Token | 7-30 days | Rotated on use. Stored securely. |
| Password Reset Token | 15-30 minutes | One-time use only. |
| API Service Token | 30-90 days | Rotated through secrets manager. |

### 8.4 Password Policy

| Control | Requirement |
|---|---|
| Minimum length | 12 characters recommended. |
| Complexity | Avoid rigid complexity rules; encourage passphrases. |
| Breach check | Optional MVP, recommended production. |
| Storage | Hash only, never plaintext. |
| Reset | Tokenized reset, audit logged. |
| Reuse | Prevent recent password reuse in production. |

---

## 9. Authorization and RBAC

### 9.1 Roles

| Role | Description |
|---|---|
| Super Admin | Full system administration. |
| Admin | Manage users, roles, system settings, geofences, alert rules. |
| Operator | Monitor vessels, acknowledge alerts, use playback, view geofence. |
| Analyst | View and analyze vessel history, export permitted datasets. |
| Viewer | Read-only access to dashboard and vessel data. |
| External Partner | Limited read-only access to specific area/vessel group. |
| Service Account | Machine-to-machine access for ingestion and integration. |

### 9.2 Permission Matrix

| Feature / Action | Super Admin | Admin | Operator | Analyst | Viewer | External Partner | Service Account |
|---|---:|---:|---:|---:|---:|---:|---:|
| View dashboard | Yes | Yes | Yes | Yes | Yes | Limited | No |
| View vessel latest position | Yes | Yes | Yes | Yes | Yes | Limited | No |
| View vessel history | Yes | Yes | Yes | Yes | Limited | Limited | No |
| Export vessel data | Yes | Yes | No | Yes | No | No | No |
| Create geofence | Yes | Yes | No | No | No | No | No |
| Edit geofence | Yes | Yes | No | No | No | No | No |
| Delete geofence | Yes | Yes | No | No | No | No | No |
| View alert | Yes | Yes | Yes | Yes | Limited | Limited | No |
| Acknowledge alert | Yes | Yes | Yes | No | No | No | No |
| Close alert | Yes | Yes | Yes | No | No | No | No |
| Create alert rule | Yes | Yes | No | No | No | No | No |
| Manage users | Yes | Yes | No | No | No | No | No |
| Manage provider keys | Yes | No | No | No | No | No | No |
| Ingest AIS data | No | No | No | No | No | No | Yes |
| Read audit log | Yes | Yes | No | No | No | No | No |

### 9.3 Authorization Rules

1. Authorization must be enforced in backend, not only frontend.
2. Every API endpoint must declare required permission.
3. Every WebSocket channel subscription must check user role and data scope.
4. External Partner users must be restricted by area, vessel group, or tenant boundary.
5. Service Accounts must not access dashboard APIs unless explicitly allowed.

---

## 10. Data Scope Control

### 10.1 Scope Dimensions

| Scope | Description |
|---|---|
| Area Scope | User can access only vessels inside assigned geofence/region. |
| Vessel Scope | User can access only selected MMSI/vessel group. |
| Organization Scope | User can access only organization-owned configuration. |
| Function Scope | User can perform only permitted actions. |
| Time Scope | User can view history only within allowed time window. |

### 10.2 Example Scope Policy

```json
{
  "user_id": "usr_123",
  "role": "external_partner",
  "scope": {
    "areas": ["gf_port_001"],
    "vessel_types": ["cargo", "tanker"],
    "history_days": 7,
    "export_allowed": false
  }
}
```

---

## 11. API Security Model

### 11.1 REST API Controls

| Control | Requirement |
|---|---|
| HTTPS only | All API endpoints must use TLS. |
| Authentication | Required except health check and public docs if enabled. |
| Authorization | Enforced per endpoint and per resource. |
| Input validation | Required for all path, query, and body parameters. |
| Output filtering | Response fields must follow role and scope. |
| Rate limiting | Required for login, search, export, ingestion, and alert APIs. |
| Idempotency | Required for ingestion and critical write operations. |
| Pagination | Required for list endpoints. |
| Request size limit | Required for all APIs. |
| Error handling | Generic external errors, detailed internal logs. |

### 11.2 API Attack Mitigation

| Threat | Control |
|---|---|
| Broken object-level authorization | Check ownership/scope on every object access. |
| Broken authentication | Short token TTL, refresh rotation, rate limit login. |
| Excessive data exposure | Use DTOs and field-level response filtering. |
| Mass assignment | Explicit allowlist for writable fields. |
| Injection | Parameterized queries and strict validation. |
| SSRF | No arbitrary URL fetch from user input. |
| Unsafe API consumption | Validate and normalize provider payloads before storing. |
| Rate abuse | Per-user/IP/service rate limits. |
| Export abuse | Permission check, size limit, audit log. |

### 11.3 Recommended Security Headers

| Header | Value / Policy |
|---|---|
| Strict-Transport-Security | Required in production. |
| Content-Security-Policy | Restrict scripts, images, frames, map tile domains. |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options / CSP frame-ancestors | Prevent clickjacking. |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | Disable unnecessary browser features. |

---

## 12. WebSocket Security Model

### 12.1 WebSocket Requirements

| ID | Requirement |
|---|---|
| WS-SEC-001 | Only `wss://` is allowed in production. |
| WS-SEC-002 | WebSocket connection must authenticate during handshake or immediately after connect. |
| WS-SEC-003 | Each subscription request must be authorized. |
| WS-SEC-004 | Client can subscribe only to allowed area, vessel group, or alert channel. |
| WS-SEC-005 | Server must validate message schema. |
| WS-SEC-006 | Server must rate-limit subscribe/unsubscribe and client messages. |
| WS-SEC-007 | Heartbeat/ping-pong must detect dead connections. |
| WS-SEC-008 | Token expiry must close or re-authenticate the connection. |
| WS-SEC-009 | Sensitive error details must not be sent to client. |
| WS-SEC-010 | Broadcast messages must be filtered by user scope. |

### 12.2 WebSocket Connection Flow

```text
Client opens WSS connection
        ↓
Server validates origin and TLS
        ↓
Client sends AUTH message or token in secure handshake
        ↓
Server validates token and role
        ↓
Client sends SUBSCRIBE message
        ↓
Server validates channel + data scope
        ↓
Server streams only authorized events
        ↓
Heartbeat + token expiry checks continue
```

### 12.3 Unauthorized Subscription Response

```json
{
  "type": "ERROR",
  "code": "FORBIDDEN_CHANNEL",
  "message": "You are not allowed to subscribe to this channel.",
  "correlation_id": "corr_20260621_001"
}
```

---

## 13. Ingestion Security

### 13.1 AIS Provider API Key Protection

| Control | Requirement |
|---|---|
| Server-side only | AIS API keys must never be exposed to browser/client. |
| Secret manager | Store provider keys in environment vault/secret manager. |
| Key rotation | Rotate keys at defined interval or on suspected leak. |
| Separate environments | Different keys for dev, staging, production. |
| Access restriction | Only ingestion service can read provider key. |
| Masking | Keys must be masked in logs and error messages. |

### 13.2 Ingestion Input Validation

| Field | Validation |
|---|---|
| MMSI | Numeric, valid length where applicable. |
| Latitude | -90 to +90. |
| Longitude | -180 to +180. |
| SOG | Non-negative, cap extreme unrealistic value. |
| COG | 0 to 360. |
| Heading | 0 to 360 or null/unknown value. |
| Timestamp | Valid ISO timestamp, not too far future. |
| Source | Must be registered provider/source. |
| Raw payload | Stored as JSONB/text with size limit. |

### 13.3 Poisoned Data Handling

Potential bad data should be quarantined or marked with quality flags.

Examples:

1. Invalid coordinate.
2. Sudden impossible position jump.
3. Timestamp older than accepted delay threshold.
4. Duplicate message.
5. Missing MMSI.
6. Unsupported vessel type.

Bad data should not break the real-time pipeline. It should be logged with quality flags and excluded from latest position when necessary.

---

## 14. Database Security

### 14.1 Database Access Roles

| DB Role | Usage | Permission |
|---|---|---|
| `app_readwrite` | Main backend service. | Read/write application tables. |
| `app_readonly` | Reporting/analytics read-only service. | Read only selected views. |
| `ingestion_writer` | Ingestion service. | Insert positions/raw messages, update latest position. |
| `migration_admin` | Migration pipeline only. | DDL migration. |
| `audit_writer` | Audit service. | Insert-only audit logs. |

### 14.2 Database Controls

| Control | Requirement |
|---|---|
| Network restriction | Database accessible only from backend private network. |
| TLS | Use TLS for database connections where supported. |
| Least privilege | Separate database users by function. |
| Parameterized queries | Required. No raw string concatenation. |
| Row-level filtering | Application-enforced for MVP; RLS optional production hardening. |
| Backup encryption | Required for production. |
| Audit log immutability | Append-only audit table or WORM storage in production. |
| Sensitive data masking | Mask user email/token/secrets in logs. |

### 14.3 Sensitive Tables

| Table | Sensitivity | Notes |
|---|---|---|
| `users` | Confidential | Contains identity metadata, not plaintext passwords. |
| `user_sessions` | Confidential | Token metadata only, no plaintext token. |
| `api_keys` | Confidential | Store hash/fingerprint, not plaintext key. |
| `geofences` | Operational Sensitive | Boundary may reveal restricted areas. |
| `geofence_rules` | Operational Sensitive | Rule logic should be protected. |
| `alerts` | Operational Sensitive | Contains incident context. |
| `audit_logs` | Sensitive | Contains user activity and security trail. |
| `vessel_positions` | Operational Sensitive | Movement history. |
| `raw_ais_messages` | Internal | Provider payload, retention-controlled. |

---

## 15. Data Protection and Privacy

### 15.1 Encryption

| Data State | Requirement |
|---|---|
| In transit | TLS 1.2+ minimum; TLS 1.3 preferred. |
| At rest | Database disk encryption in production. |
| Backup | Encrypted backup storage. |
| Secrets | Secret manager or encrypted environment variables. |
| Logs | No secrets or full tokens in logs. |

### 15.2 Data Retention

Recommended baseline:

| Data Type | MVP Retention | Production Recommendation |
|---|---:|---:|
| Latest vessel position | Current only | Current only |
| Vessel position history | 30-90 days | Configurable 90-365 days |
| Raw AIS payload | 7-30 days | Configurable, cost-driven |
| Alert records | 180 days | 1-3 years depending policy |
| Audit logs | 1 year | 3-7 years depending policy |
| Application logs | 14-30 days | 30-180 days |
| Security logs | 90 days | 1 year+ |
| Export files | 24 hours | 24-72 hours, auto-delete |

### 15.3 Export Controls

1. Export must require explicit permission.
2. Export action must be audit logged.
3. Export size must be limited.
4. Export should respect user data scope.
5. Export link should expire.
6. Sensitive columns should be excluded or masked when not needed.

---

## 16. Secrets Management

### 16.1 Secret Types

| Secret | Storage |
|---|---|
| AIS provider API key | Secret manager / vault. |
| Map provider token | Secret manager; frontend key restricted by domain if required. |
| Database password | Secret manager. |
| JWT signing key | Secret manager; rotation required. |
| Email provider credential | Secret manager. |
| Telegram/WhatsApp gateway token | Secret manager. |
| CI/CD deployment token | CI secret storage. |

### 16.2 Secret Handling Rules

1. Never commit secrets to Git.
2. Never expose provider API keys in frontend code.
3. Mask secrets in logs.
4. Rotate secrets periodically.
5. Revoke immediately after suspected leak.
6. Use separate secrets for dev, staging, and production.
7. Limit who can read production secrets.

---

## 17. Audit Logging Model

### 17.1 Audit Events

| Event Category | Examples |
|---|---|
| Authentication | Login success/failure, logout, password reset, MFA change. |
| Authorization | Forbidden access attempt, blocked export. |
| User Management | Create user, deactivate user, role change. |
| Geofence | Create, update, delete, activate/deactivate geofence. |
| Alert Rule | Create, update, delete, enable/disable rule. |
| Alert Lifecycle | Acknowledge, assign, close, escalate. |
| Data Export | Export requested, completed, downloaded, failed. |
| Provider Config | AIS source added, key rotated, source disabled. |
| System Config | Retention change, security setting change. |

### 17.2 Audit Log Schema

```json
{
  "audit_id": "aud_20260621_000001",
  "event_time": "2026-06-21T10:15:22Z",
  "actor_user_id": "usr_123",
  "actor_role": "operator",
  "action": "ALERT_ACKNOWLEDGED",
  "resource_type": "alert",
  "resource_id": "alt_456",
  "result": "success",
  "ip_address": "203.0.113.10",
  "user_agent": "Mozilla/5.0",
  "correlation_id": "corr_abc123",
  "metadata": {
    "alert_type": "GEOFENCE_ENTER",
    "mmsi": "525123456"
  }
}
```

### 17.3 Audit Requirements

1. Audit logs must be append-only at application level.
2. Audit logs must not contain passwords, raw tokens, or full secrets.
3. Audit logs must include correlation ID.
4. Audit logs must be searchable by actor, resource, action, and time.
5. Critical security events should generate admin notification in production.

---

## 18. Threat Model

### 18.1 Threat Actors

| Actor | Description |
|---|---|
| Anonymous Internet User | Attempts unauthorized API/dashboard access. |
| Authenticated Low-Privilege User | Attempts privilege escalation or data overreach. |
| Malicious Insider | Has legitimate access but abuses permissions. |
| External API Attacker | Targets public APIs or WebSocket endpoint. |
| Vendor/API Compromise | Provider feed sends bad data or key is leaked. |
| Bot / Scraper | Attempts mass scraping, brute force, or export abuse. |
| Supply Chain Attacker | Targets dependencies, CI/CD, container images. |

### 18.2 Key Threat Scenarios

| Threat | Impact | Likelihood | Control |
|---|---:|---:|---|
| Broken access control to vessel history | High | Medium | RBAC + scope check + audit. |
| Unauthorized geofence modification | High | Medium | Admin-only permission + audit + optional approval. |
| API key leakage | High | Medium | Secret manager + no frontend exposure + rotation. |
| WebSocket unauthorized subscription | High | Medium | Authenticated WSS + per-channel authorization. |
| Alert spam / flooding | Medium | Medium | Deduplication + cooldown + rate limit. |
| AIS data poisoning | Medium | Medium | Validation + quality score + quarantine. |
| XSS via vessel name/provider data | High | Medium | Output encoding + CSP + sanitization. |
| SQL injection | High | Low/Medium | Parameterized queries + ORM/query builder + validation. |
| Export data abuse | High | Medium | Export permission + size limit + audit + expiry. |
| Brute-force login | Medium | Medium | Rate limit + lockout + MFA for admin. |
| Supply chain vulnerability | High | Medium | Dependency scanning + pinned versions + SCA. |
| Accidental public dashboard exposure | High | Low/Medium | Auth required + secure deployment checks. |

---

## 19. Application Security Controls

### 19.1 Input Validation

All user input must be validated using explicit schemas.

Examples:

| Input | Rule |
|---|---|
| `mmsi` | Numeric string, length validation. |
| `bbox` | Four numeric coordinates, valid range, max area. |
| `from` / `to` timestamp | ISO 8601, valid range, max query period. |
| `geofence.geometry` | Valid GeoJSON polygon/multipolygon, max vertices. |
| `alert.severity` | Enum only. |
| `pagination.limit` | Max limit enforced. |
| `search` | Length limit, sanitized. |

### 19.2 Output Encoding

External data such as vessel name, callsign, destination, and raw provider values must be treated as untrusted.

Controls:

1. Encode output in frontend rendering.
2. Sanitize HTML if rich text is ever allowed.
3. Do not render raw provider text as HTML.
4. Apply CSP to reduce XSS impact.

### 19.3 File Export Security

1. Exports must be generated server-side.
2. Export file names must be sanitized.
3. Export links must expire.
4. Export payload must follow RBAC and scope.
5. Export events must be audit logged.

---

## 20. Frontend Security

### 20.1 Frontend Requirements

| Requirement | Description |
|---|---|
| No secrets in frontend | AIS provider keys and backend secrets must not be bundled. |
| Token handling | Prefer secure HTTP-only cookie for session where possible. |
| RBAC UI | Hide unavailable actions but do not rely on UI for enforcement. |
| CSP | Restrict script, style, image, and map tile sources. |
| XSS protection | Escape all user/provider-generated content. |
| Dependency hygiene | Keep frontend dependencies scanned and updated. |

### 20.2 Map Security

| Risk | Control |
|---|---|
| Map token abuse | Restrict token by domain/IP where provider supports it. |
| Sensitive geofence exposure | Apply RBAC before sending geofence data to frontend. |
| Excessive data retrieval by viewport manipulation | Enforce backend bbox, rate, and pagination limits. |
| Client performance attack | Limit max vessel markers per subscription and throttle updates. |

---

## 21. Infrastructure Security

### 21.1 MVP Deployment Controls

| Area | Control |
|---|---|
| Runtime | Dockerized services. |
| Network | Only API/Web app exposed publicly. DB private only. |
| TLS | HTTPS/WSS required. |
| Firewall | Restrict inbound ports. |
| Environment | Separate dev/staging/prod. |
| Secrets | Environment secret store, not repository. |
| Logs | Centralized application logs. |
| Backup | Daily encrypted database backup. |
| Monitoring | Health check and error alert. |

### 21.2 Production Hardening

| Area | Control |
|---|---|
| API Gateway | WAF, rate limiting, request validation. |
| Kubernetes/Container | Image scanning, non-root containers, read-only filesystem where possible. |
| Network | Private subnets, service-to-service access policy. |
| Database | HA, backup, PITR, encrypted disk, restricted roles. |
| Observability | Metrics, logs, traces, security event alerting. |
| CI/CD | Signed artifacts, protected branches, approval gates. |
| DR | Recovery time and recovery point objectives defined. |

---

## 22. Secure SDLC and DevSecOps

### 22.1 Development Controls

| Stage | Control |
|---|---|
| Design | Threat model and security review for new module. |
| Coding | Secure coding checklist. |
| Commit | Secret scanning. |
| Build | Dependency scanning and SAST. |
| Test | Security unit/integration tests. |
| Deploy | Approval gates for production. |
| Runtime | Monitoring and incident response. |

### 22.2 Required Automated Checks

| Check | MVP | Production |
|---|---:|---:|
| Linting | Yes | Yes |
| Unit tests | Yes | Yes |
| API contract tests | Yes | Yes |
| Dependency vulnerability scan | Yes | Yes |
| Secret scan | Yes | Yes |
| Container image scan | Recommended | Yes |
| SAST | Recommended | Yes |
| DAST | Optional | Recommended |
| Infrastructure-as-Code scan | Optional | Yes |

---

## 23. Security Monitoring

### 23.1 Metrics and Signals

| Metric | Purpose |
|---|---|
| Failed login count | Detect brute force. |
| Forbidden API attempts | Detect privilege probing. |
| Unauthorized WebSocket subscription | Detect channel abuse. |
| Export count by user | Detect data exfiltration. |
| Alert rule changes | Detect sensitive configuration change. |
| Provider ingestion error rate | Detect provider/API issue. |
| Data validation failure rate | Detect poisoned/bad data. |
| Rate limit hits | Detect abuse or misconfigured client. |
| Token refresh anomalies | Detect compromised session. |

### 23.2 Security Alert Examples

| Event | Severity | Action |
|---|---|---|
| 10 failed logins from same IP in 5 minutes | Medium | Rate-limit and notify admin. |
| Admin role assigned to user | High | Audit and notify Super Admin. |
| AIS provider key rotated | Medium | Audit and notify Admin. |
| Unauthorized geofence edit attempt | High | Block and notify Admin. |
| Export above threshold | Medium | Audit and optionally require approval. |
| WebSocket subscription denied repeatedly | Medium | Rate-limit client/session. |

---

## 24. Incident Response

### 24.1 Incident Categories

| Category | Example |
|---|---|
| Authentication Incident | Account takeover, brute force. |
| Authorization Incident | Unauthorized data access attempt. |
| Data Incident | Export abuse, sensitive data leak. |
| Provider Incident | AIS key compromised, provider feed anomaly. |
| Infrastructure Incident | Server compromise, suspicious network traffic. |
| Availability Incident | DDoS, API outage, WebSocket failure. |

### 24.2 Response Flow

```text
Detect
  ↓
Triage
  ↓
Contain
  ↓
Eradicate
  ↓
Recover
  ↓
Post-Incident Review
  ↓
Control Improvement
```

### 24.3 Minimum Incident Playbooks

1. Compromised user account.
2. Leaked AIS provider key.
3. Unauthorized data export.
4. Geofence/alert rule tampering.
5. API abuse / scraping.
6. Bad provider data injection.
7. Production database exposure risk.

---

## 25. Security Requirements by Module

### 25.1 Dashboard

| Requirement | Description |
|---|---|
| Login required | No dashboard access without authentication. |
| Role-based menu | UI menu follows user permission. |
| Scope-based map data | User receives only allowed vessels/geofences. |
| Secure realtime | WebSocket must enforce authorized subscription. |

### 25.2 Vessel Module

| Requirement | Description |
|---|---|
| Read access control | Vessel list/detail filtered by scope. |
| History access limit | Long history requires Analyst/Admin permission. |
| Export control | Export permission required. |

### 25.3 Geofence Module

| Requirement | Description |
|---|---|
| Admin-only mutation | Create/update/delete geofence restricted. |
| Geometry validation | Polygon must be valid and bounded. |
| Audit required | All geofence changes logged. |
| Optional approval | Production can require approval workflow. |

### 25.4 Alert Module

| Requirement | Description |
|---|---|
| Alert lifecycle audit | Acknowledge/assign/close/escalate logged. |
| Role-based action | Viewer cannot change alert status. |
| Notification control | Avoid alert spam through cooldown/dedup. |

### 25.5 Ingestion Module

| Requirement | Description |
|---|---|
| Service account only | Ingestion endpoints restricted. |
| Idempotency | Prevent duplicate inserts. |
| Provider validation | Validate source and payload. |
| Bad data handling | Mark/quarantine invalid data. |

---

## 26. Environment Security

### 26.1 Environment Separation

| Environment | Purpose | Data |
|---|---|---|
| Development | Local development. | Synthetic or masked data only. |
| Staging | UAT and integration tests. | Synthetic or limited test provider data. |
| Production | Live operation. | Real data, strict access. |

### 26.2 Environment Rules

1. Production data must not be copied into development without masking.
2. Production secrets must never be used in staging/development.
3. Debug mode must be disabled in production.
4. Test users must be disabled or removed before go-live.
5. Staging must use separate provider credentials.

---

## 27. MVP Security Checklist

| ID | Checklist Item | Status |
|---|---|---|
| SEC-MVP-001 | HTTPS/WSS enabled. | Required |
| SEC-MVP-002 | User authentication implemented. | Required |
| SEC-MVP-003 | RBAC for Admin, Operator, Analyst, Viewer. | Required |
| SEC-MVP-004 | Backend authorization on every endpoint. | Required |
| SEC-MVP-005 | WebSocket auth and channel authorization. | Required |
| SEC-MVP-006 | AIS provider key stored server-side only. | Required |
| SEC-MVP-007 | Input validation for API and ingestion payloads. | Required |
| SEC-MVP-008 | Parameterized database queries. | Required |
| SEC-MVP-009 | Audit logs for login, geofence, alert lifecycle, export. | Required |
| SEC-MVP-010 | Rate limit login, ingestion, search, export. | Required |
| SEC-MVP-011 | No secrets committed to repository. | Required |
| SEC-MVP-012 | Basic dependency scanning in CI. | Required |
| SEC-MVP-013 | Encrypted database backup. | Required |
| SEC-MVP-014 | Error messages do not expose stack traces. | Required |
| SEC-MVP-015 | Export requires permission and audit. | Required |

---

## 28. Production Hardening Backlog

| Priority | Item |
|---:|---|
| P1 | Mandatory MFA for Admin and Operator. |
| P1 | SSO/OIDC integration. |
| P1 | Centralized secret manager. |
| P1 | WAF/API Gateway. |
| P1 | SIEM/security log integration. |
| P1 | Container image scanning and signing. |
| P2 | Row-Level Security for multi-tenant deployment. |
| P2 | Approval workflow for critical geofence/rule changes. |
| P2 | Automated DAST security testing. |
| P2 | Data loss prevention for large exports. |
| P2 | Device/session management UI. |
| P3 | Hardware AIS receiver security model. |
| P3 | Advanced spoofing/anomaly security analytics. |
| P3 | External penetration test. |
| P3 | ISO 27001 control mapping. |

---

## 29. Security Acceptance Criteria

The system is acceptable for MVP release when:

1. All dashboard access requires authentication.
2. RBAC permissions are enforced by backend APIs.
3. WebSocket connections require authentication and channel authorization.
4. AIS provider credentials are not exposed to the frontend or repository.
5. All API inputs are validated.
6. SQL injection is mitigated through parameterized queries.
7. Geofence and alert rule changes are audit logged.
8. Alert lifecycle actions are audit logged.
9. Export action requires permission and is audit logged.
10. Login, search, export, and ingestion APIs have rate limiting.
11. Production deployment uses HTTPS/WSS.
12. Secrets are separated between environments.
13. Database backup is encrypted.
14. Application errors do not expose secrets or stack traces to users.
15. Dependency and secret scanning are active in CI/CD.

---

## 30. Open Questions

| ID | Question | Owner | Status |
|---|---|---|---|
| OQ-001 | Will the system be single-tenant or multi-tenant in the first production release? | Product Owner | Open |
| OQ-002 | Is SSO/OIDC required for the first customer? | Product Owner | Open |
| OQ-003 | What is the required audit log retention period? | Security / Legal | Open |
| OQ-004 | Are geofence boundaries considered confidential by all customers? | Product Owner | Open |
| OQ-005 | Should admin actions require maker-checker approval? | Product Owner | Open |
| OQ-006 | What notification channels are allowed for sensitive alerts? | Operations | Open |
| OQ-007 | Is external partner access required in MVP? | Product Owner | Open |
| OQ-008 | What is the maximum history period available for export? | Product Owner | Open |
| OQ-009 | Does the application need to comply with a specific local regulation or customer security standard? | Security / Legal | Open |

---

## 31. Appendix A: Example API Permission Declaration

```yaml
GET /api/v1/vessels:
  permission: vessel.read
  scope_required: true

GET /api/v1/vessels/{mmsi}/history:
  permission: vessel.history.read
  scope_required: true
  max_range_by_role:
    viewer: 24h
    operator: 7d
    analyst: 90d
    admin: 365d

POST /api/v1/geofences:
  permission: geofence.create
  roles:
    - admin
    - super_admin
  audit: true

POST /api/v1/alerts/{alert_id}/acknowledge:
  permission: alert.acknowledge
  roles:
    - operator
    - admin
    - super_admin
  audit: true
```

---

## 32. Appendix B: Example WebSocket Authorization Policy

```json
{
  "channel": "vessel.position",
  "required_permission": "vessel.read",
  "scope": {
    "bbox_required": true,
    "max_bbox_area_km2": 5000,
    "allowed_geofence_ids": ["gf_port_001", "gf_port_002"],
    "allowed_vessel_groups": ["cargo", "tanker"]
  },
  "rate_limit": {
    "subscribe_per_minute": 30,
    "messages_per_minute": 60
  }
}
```

---

## 33. Appendix C: Example Security Event Payload

```json
{
  "type": "SECURITY_EVENT",
  "event_id": "sec_20260621_000001",
  "event_time": "2026-06-21T10:15:22Z",
  "severity": "HIGH",
  "category": "AUTHORIZATION",
  "action": "UNAUTHORIZED_GEOFENCE_EDIT_ATTEMPT",
  "actor_user_id": "usr_789",
  "resource_type": "geofence",
  "resource_id": "gf_001",
  "result": "blocked",
  "ip_address": "203.0.113.10",
  "correlation_id": "corr_xyz123"
}
```

---

## 34. References

1. OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
2. OWASP WebSocket Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html
3. OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
4. NIST Cybersecurity Framework 2.0: https://www.nist.gov/cyberframework

---

## 35. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-06-21 | ChatGPT | Initial security model derived from PRD and architecture documents. |
