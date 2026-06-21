# 10_UI_UX_Wireframe.md

# UI/UX Wireframe Specification
## Real Time Vessel Tracking System / VesselTrack OS

**Document Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-21  
**Owner:** Product, UX, and Engineering Team  
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

---

## 1. Purpose

Dokumen ini mendefinisikan spesifikasi UI/UX dan wireframe awal untuk **Real Time Vessel Tracking System**, dengan nama sistem contoh **VesselTrack OS**.

Tujuan dokumen ini adalah menjadi acuan bersama untuk product owner, UX designer, frontend developer, backend developer, QA, dan stakeholder operasional dalam membangun aplikasi tracking kapal real-time yang mudah dipahami, cepat digunakan, dan aman untuk operasi harian.

Sistem harus menampilkan posisi kapal secara real-time, detail kapal, histori pergerakan, geofence, alert, playback, dan analytics dasar dalam satu pengalaman kerja yang rapi. UI harus terasa seperti ruang kendali maritim, bukan sekadar peta dengan titik bergerak.

---

## 2. Design Goals

### 2.1 Primary Goals

1. Operator dapat melihat posisi kapal aktif secara real-time.
2. Operator dapat memahami status kapal hanya dalam beberapa detik.
3. Operator dapat menemukan kapal berdasarkan nama, MMSI, IMO, call sign, atau area.
4. Operator dapat menerima dan menindaklanjuti alert dengan jelas.
5. Analyst dapat membuka histori pergerakan kapal dan melakukan playback.
6. Admin dapat mengelola geofence, user, role, dan data source.
7. UI tetap ringan meskipun jumlah kapal bertambah.
8. Sistem mudah dikembangkan menjadi analytics dan maritime intelligence platform.

### 2.2 UX Principles

1. **Map first, action second**  
   Peta adalah pusat operasi. Semua panel harus mendukung pemahaman peta.

2. **Realtime clarity**  
   Status koneksi, waktu update terakhir, dan usia data harus selalu terlihat.

3. **Progressive disclosure**  
   Informasi utama ditampilkan dulu. Detail teknis muncul ketika kapal, alert, atau geofence dipilih.

4. **Low cognitive load**  
   Warna, ikon, label, dan status harus konsisten. Operator tidak boleh menebak arti visual.

5. **Operational safety**  
   Alert kritikal harus lebih menonjol dari informasi biasa.

6. **Fast filtering**  
   Pencarian, filter area, filter tipe kapal, dan filter status harus mudah digunakan.

7. **Audit-aware interaction**  
   Aksi penting seperti acknowledge alert, resolve alert, dan edit geofence harus tercatat.

---

## 3. Target Users

| Persona | Description | Main Tasks |
|---|---|---|
| Operator | Pengguna harian di control room atau operasi lapangan | Melihat posisi kapal, menerima alert, mencari kapal, memantau area |
| Supervisor | Pengawas operasi | Melihat ringkasan, memvalidasi alert, memantau SLA, memberi arahan |
| Analyst | Pengguna analitik | Playback route, ekspor data, melihat pola pergerakan, membuat laporan |
| Admin | Pengelola sistem | Mengelola user, role, data source, geofence, dan konfigurasi sistem |
| External Viewer | Pihak terbatas yang hanya melihat data tertentu | Melihat peta dan vessel tertentu sesuai izin |

---

## 4. Information Architecture

```text
VesselTrack OS
├── Dashboard
│   ├── Realtime Map
│   ├── KPI Summary
│   ├── Selected Vessel Panel
│   ├── Alert Feed
│   └── Geofence Status
├── Vessels
│   ├── Vessel List
│   ├── Vessel Detail
│   ├── Latest Position
│   └── Vessel History
├── Map
│   ├── Fullscreen Map
│   ├── Layers
│   ├── Filters
│   ├── Vessel Clustering
│   └── Map Tools
├── Geofences
│   ├── Geofence List
│   ├── Geofence Editor
│   ├── Rule Configuration
│   └── Geofence Events
├── Alerts
│   ├── Alert Inbox
│   ├── Alert Detail
│   ├── Acknowledge
│   ├── Resolve
│   └── Notification Log
├── History
│   ├── Vessel Track Search
│   ├── Playback Timeline
│   ├── Route Detail
│   └── Export
├── Analytics
│   ├── Vessel Activity
│   ├── Density Map
│   ├── Idle/Anchoring Report
│   └── Alert Trend
└── Settings
    ├── Users & Roles
    ├── Data Sources
    ├── Notification Channels
    ├── System Preferences
    └── Audit Logs
```

---

## 5. Global Layout

### 5.1 Desktop Layout

Target utama MVP adalah desktop web dashboard.

```text
+--------------------------------------------------------------------------------+
| Top Bar: Search | Realtime Status | Time | Notification | User Profile          |
+-------------------+------------------------------------------------------------+
| Sidebar           | Main Content Area                                          |
|                   |                                                            |
| Dashboard         | Page Header                                                 |
| Vessels           | KPI / Toolbar / Filter                                      |
| Map               |                                                            |
| Geofences         | Main Panel                                                  |
| Alerts            |                                                            |
| History           | Secondary Panel / Right Drawer                              |
| Analytics         |                                                            |
| Settings          | Bottom Panel / Table / Timeline                             |
+-------------------+------------------------------------------------------------+
```

### 5.2 Layout Guidelines

| Area | Purpose | Notes |
|---|---|---|
| Sidebar | Navigasi utama | Dapat collapse untuk memperluas peta |
| Top Bar | Search global, status sistem, user menu | Harus selalu terlihat |
| Main Content | Peta, tabel, analytics, editor | Responsive terhadap sidebar collapse |
| Right Drawer | Detail kapal, detail alert, detail geofence | Muncul saat item dipilih |
| Bottom Panel | Alert feed, playback timeline, logs | Dapat collapse |

---

## 6. Visual Design Direction

### 6.1 Theme

Tema visual: **Maritime Operations Control Room**.

Karakter visual:

- Bersih.
- Modern.
- Gelap terang seimbang.
- Berbasis peta.
- Warna laut dan navigasi.
- Tidak terlalu dekoratif.
- Fokus pada keterbacaan.

### 6.2 Color Tokens

| Token | Usage | Example |
|---|---|---|
| Navy 900 | Sidebar, top bar, primary background | `#0B1F33` |
| Navy 700 | Header panel, selected menu | `#123B5D` |
| Ocean 500 | Primary action, realtime state | `#0EA5E9` |
| Cyan 400 | Highlight, map accent | `#22D3EE` |
| Green 500 | Normal, active, under way | `#22C55E` |
| Yellow 500 | Warning, idle, watch | `#EAB308` |
| Orange 500 | Medium severity | `#F97316` |
| Red 500 | Critical alert | `#EF4444` |
| Slate 100 | Card background light | `#F1F5F9` |
| Slate 700 | Secondary text | `#334155` |

### 6.3 Status Colors

| Status | Color | Meaning |
|---|---|---|
| Moving / Under Way | Green | Kapal aktif bergerak normal |
| Idle / Stopped | Yellow | Kapal diam atau hampir diam |
| Anchored | Blue | Kapal labuh |
| Alert | Red | Ada pelanggaran atau kondisi kritikal |
| AIS Silence | Orange | Data tidak update melebihi threshold |
| Offline / Unknown | Gray | Tidak ada status valid |

### 6.4 Typography

| Usage | Recommendation |
|---|---|
| Font family | Inter, Roboto, Noto Sans, atau system sans-serif |
| Page title | 24px to 32px, semibold |
| Section title | 16px to 20px, semibold |
| Body text | 13px to 15px |
| Table text | 12px to 14px |
| Map label | 11px to 13px |
| KPI value | 24px to 36px |

---

## 7. Navigation

### 7.1 Sidebar Menu

```text
+---------------------+
| VesselTrack OS      |
+---------------------+
| Dashboard           |
| Vessels             |
| Map                 |
| Geofences           |
| Alerts              |
| History             |
| Analytics           |
| Settings            |
+---------------------+
| Collapse            |
+---------------------+
```

### 7.2 Sidebar Behavior

| State | Behavior |
|---|---|
| Expanded | Menampilkan ikon dan label |
| Collapsed | Hanya ikon, tooltip saat hover |
| Active menu | Highlight biru dengan indikator kiri |
| Alert menu | Badge jumlah alert terbuka |
| Mobile/tablet | Drawer overlay, bukan sidebar permanen |

---

## 8. Global Top Bar

### 8.1 Top Bar Components

```text
+------------------------------------------------------------------------------+
| Search: Cari kapal / MMSI / IMO | Realtime ● | Last Sync | Bell | Profile   |
+------------------------------------------------------------------------------+
```

### 8.2 Search Behavior

Search global harus mendukung:

1. Vessel name.
2. MMSI.
3. IMO.
4. Call sign.
5. Geofence name.
6. Alert ID.

Contoh placeholder:

```text
Cari kapal / MMSI / IMO / area
```

### 8.3 Realtime Status Indicator

| State | UI | Meaning |
|---|---|---|
| Connected | Green dot + `Realtime` | WebSocket aktif |
| Reconnecting | Yellow dot + `Reconnecting` | Koneksi sedang dipulihkan |
| Disconnected | Red dot + `Offline` | Tidak menerima update |
| Delayed | Orange dot + `Delayed` | Data terbaru melewati threshold latency |

---

## 9. Dashboard Wireframe

Dashboard adalah layar utama setelah login.

### 9.1 Dashboard Structure

```text
+------------------------------------------------------------------------------------------------+
| Top Bar                                                                                        |
+--------------------+---------------------------------------------------------------------------+
| Sidebar            | Dashboard                                                                 |
|                    | +----------------+ +-------------+ +--------------+ +----------------+  |
|                    | | Active Vessels | | In Port     | | Alerts Today | | Avg Speed      |  |
|                    | +----------------+ +-------------+ +--------------+ +----------------+  |
|                    |                                                                           |
|                    | +-------------------------------------------------------+ +-------------+ |
|                    | |                                                       | | Vessel      | |
|                    | |                  Realtime Map                         | | Detail      | |
|                    | |                                                       | | Panel       | |
|                    | +-------------------------------------------------------+ +-------------+ |
|                    |                                                                           |
|                    | +---------------------------+ +---------------------+ +---------------+ |
|                    | | Alert Feed                | | Geofence Status     | | Playback      | |
|                    | +---------------------------+ +---------------------+ +---------------+ |
+--------------------+---------------------------------------------------------------------------+
```

### 9.2 KPI Cards

| Card | Metric | Behavior |
|---|---|---|
| Active Vessels | Jumlah kapal aktif di area | Click membuka list vessel aktif |
| In Port | Kapal di area pelabuhan | Click filter map ke port area |
| Alerts Today | Jumlah alert hari ini | Click membuka alert inbox |
| Avg Speed | Rata-rata speed kapal aktif | Click membuka analytics speed |

### 9.3 Map Panel

Map panel harus mendukung:

1. Vessel marker.
2. Marker heading.
3. Route trail pendek.
4. Geofence polygon.
5. Map layer switcher.
6. Zoom control.
7. Fullscreen mode.
8. Bbox-based data loading.
9. Selected vessel highlight.
10. Vessel popup.

### 9.4 Right Vessel Detail Panel

```text
+----------------------------------+
| MV Musi Jaya                 ★   |
| MMSI 525123456                   |
| Status: Under Way                |
|                                  |
| SOG       12.4 kn                |
| COG       88.5°                  |
| Heading   90°                    |
| ETA       13:45                  |
| Last Update 10:15:22 UTC         |
|                                  |
| [Track] [Playback] [Set Alert]   |
+----------------------------------+
```

### 9.5 Bottom Panels

| Panel | Content | Interaction |
|---|---|---|
| Alert Feed | Alert terbaru | Click membuka alert detail |
| Geofence Status | Status area | Click zoom ke area |
| Playback Route | Timeline singkat | Play, pause, speed, jump time |

---

## 10. Realtime Map Wireframe

### 10.1 Full Map View

```text
+------------------------------------------------------------------------------------------------+
| Top Bar                                                                                        |
+--------------------+---------------------------------------------------------------------------+
| Sidebar            | Map Toolbar: Layer | Filter | Geofence | Measure | Fullscreen              |
|                    +---------------------------------------------------------------------------+
|                    |                                                                           |
|                    |                            FULLSCREEN MAP                                 |
|                    |                                                                           |
|                    |   Ship markers, heading arrows, route trails, geofence polygons            |
|                    |                                                                           |
|                    | +-------------------+                                                     |
|                    | | Floating Filters  |                                                     |
|                    | | Vessel Type       |                                                     |
|                    | | Status            |                                                     |
|                    | | Speed Range       |                                                     |
|                    | +-------------------+                                                     |
|                    |                                                                           |
|                    |                                        +-------------------------------+  |
|                    |                                        | Selected Vessel / Alert Panel   |  |
|                    |                                        +-------------------------------+  |
+--------------------+---------------------------------------------------------------------------+
```

### 10.2 Map Toolbar

| Tool | Function |
|---|---|
| Layer | Pilih basemap dan overlay |
| Filter | Filter kapal dan status |
| Geofence | Toggle geofence display |
| Measure | Ukur jarak di peta |
| Center | Kembali ke area operasi |
| Fullscreen | Memperbesar map |

### 10.3 Vessel Marker Design

| Vessel State | Marker Shape | Color |
|---|---|---|
| Moving | Ship icon with heading arrow | Green or blue |
| Idle | Ship icon with small pause indicator | Yellow |
| Alert | Ship icon with red ring pulse | Red |
| Selected | Larger marker with blue glow | Cyan/Blue |
| AIS Silence | Dimmed ship icon with orange outline | Orange |
| Unknown | Gray ship icon | Gray |

### 10.4 Marker Popup

```text
+------------------------------+
| MV Musi Jaya                 |
| MMSI: 525123456              |
| Status: Under Way            |
| Speed: 12.4 kn               |
| Last Seen: 10:15:22 UTC      |
|                              |
| [Detail] [Playback]          |
+------------------------------+
```

---

## 11. Vessel List Wireframe

### 11.1 Vessel List Page

```text
+--------------------------------------------------------------------------------+
| Vessels                                                                        |
| Search | Type Filter | Status Filter | Source Filter | Export                 |
+--------------------------------------------------------------------------------+
| Name             | MMSI      | Type     | Status     | SOG | Last Seen | Action |
| MV Musi Jaya     | 525123456 | Cargo    | Under Way  |12.4 | 10:15:22  | Detail |
| TB Bahari 02     | 525333222 | Tug      | Idle       | 0.2 | 10:14:59  | Detail |
| KM Lautan Raya   | 525888111 | Passenger| Anchored   | 0.0 | 10:12:05  | Detail |
+--------------------------------------------------------------------------------+
```

### 11.2 Vessel Detail Page

```text
+--------------------------------------------------------------------------------+
| MV Musi Jaya | MMSI 525123456 | Status Under Way                            |
+--------------------------------------------------------------------------------+
| Summary Card            | Latest Position Map                              |
| Identity                |                                                   |
| Dimensions              |                                                   |
| Current Navigation      |                                                   |
+--------------------------------------------------------------------------------+
| Tabs: Overview | Track History | Alerts | Geofence Events | Raw AIS              |
+--------------------------------------------------------------------------------+
```

### 11.3 Vessel Detail Tabs

| Tab | Content |
|---|---|
| Overview | Identitas kapal, posisi terakhir, status navigasi |
| Track History | Riwayat posisi dalam tabel dan peta |
| Alerts | Alert terkait kapal tersebut |
| Geofence Events | Event masuk/keluar area |
| Raw AIS | Raw source payload dan decoded payload |

---

## 12. Geofence Wireframe

### 12.1 Geofence List

```text
+--------------------------------------------------------------------------------+
| Geofences                                      [Create Geofence]                |
+--------------------------------------------------------------------------------+
| Name              | Type        | Status | Rules | Active Alerts | Action       |
| GF-01 Area Terbatas| Restricted | Active | 4     | 1             | Edit / View  |
| GF-02 Anchorage   | Anchorage   | Active | 2     | 0             | Edit / View  |
+--------------------------------------------------------------------------------+
```

### 12.2 Geofence Editor

```text
+------------------------------------------------------------------------------------------------+
| Geofence Editor                                                                                |
+------------------------------------------------------------------------------------------------+
| Left Panel                         | Map Canvas                                                   |
| Name                               |                                                              |
| Type                               |  Draw polygon / edit points / import GeoJSON                 |
| Description                        |                                                              |
| Active toggle                      |                                                              |
|                                    |                                                              |
| Rules                              |                                                              |
| [x] Enter Alert                    |                                                              |
| [x] Exit Alert                     |                                                              |
| [x] Speed Limit                    |                                                              |
| [x] Dwell Time                     |                                                              |
|                                    |                                                              |
| [Save] [Cancel]                    |                                                              |
+------------------------------------------------------------------------------------------------+
```

### 12.3 Geofence Rule Form

| Field | Type | Example |
|---|---|---|
| Rule Type | Select | Enter, Exit, Dwell, Speed Limit |
| Severity | Select | Info, Warning, High, Critical |
| Vessel Type Filter | Multi-select | Cargo, Tanker, Tug |
| Speed Threshold | Number | 10 knots |
| Dwell Threshold | Duration | 30 minutes |
| Cooldown | Duration | 10 minutes |
| Notification Channel | Multi-select | Dashboard, Email, Telegram |
| Active | Toggle | On/Off |

---

## 13. Alert Wireframe

### 13.1 Alert Inbox

```text
+--------------------------------------------------------------------------------+
| Alerts                                                                         |
| Status: Open | Severity | Type | Time Range | Vessel | Search                 |
+--------------------------------------------------------------------------------+
| Severity | Time      | Type       | Vessel        | Message        | Status |
| Critical | 10:12:05  | Geofence   | MV Musi Jaya  | Enter GF-01    | Open   |
| High     | 09:47:18  | Speed      | MV Samudra    | Speed > limit  | Acked  |
| Medium   | 08:33:54  | AIS Silence| TB Bahari 02  | No update      | Open   |
+--------------------------------------------------------------------------------+
```

### 13.2 Alert Detail Drawer

```text
+-----------------------------------------+
| Alert Detail                            |
| CRITICAL                                |
| Geofence Breach                         |
|                                         |
| Vessel: MV Musi Jaya                    |
| MMSI: 525123456                         |
| Area: GF-01 Area Terbatas               |
| Time: 2026-06-21 10:12:05 UTC           |
| Status: Open                            |
|                                         |
| Map Snapshot                            |
| Timeline                                |
| Notes                                   |
|                                         |
| [Acknowledge] [Resolve] [Create Note]   |
+-----------------------------------------+
```

### 13.3 Alert Lifecycle UI

| State | Badge | Available Actions |
|---|---|---|
| Open | Red/Orange | Acknowledge, Assign, View Map |
| Acknowledged | Blue | Resolve, Add Note, Escalate |
| Resolved | Green | Reopen, View Audit |
| Suppressed | Gray | View Audit |

---

## 14. History and Playback Wireframe

### 14.1 History Search

```text
+--------------------------------------------------------------------------------+
| History                                                                         |
| Vessel Search | Date From | Date To | [Load Track]                              |
+--------------------------------------------------------------------------------+
| Left: Track Summary                       | Right: Map Playback                  |
| Distance                                  |                                    |
| Avg Speed                                 |                                    |
| Stop Count                                |                                    |
| Alert Count                               |                                    |
+--------------------------------------------------------------------------------+
| Timeline: 06:00 ---- 07:30 ---- 09:00 ---- 10:15                               |
| [<<] [Play/Pause] [>>] Speed: 1x 2x 4x                                           |
+--------------------------------------------------------------------------------+
```

### 14.2 Playback Features

1. Select vessel.
2. Select time range.
3. Load route polyline.
4. Play/pause animation.
5. Change playback speed.
6. Jump to timestamp.
7. Show speed along route.
8. Show alert markers on route.
9. Export route as CSV or GeoJSON.

---

## 15. Analytics Wireframe

### 15.1 Analytics Dashboard

```text
+--------------------------------------------------------------------------------+
| Analytics                                                                       |
| Date Range | Area | Vessel Type | Export                                      |
+--------------------------------------------------------------------------------+
| KPI: Total Movements | Avg Speed | Idle Time | Alert Count                         |
+--------------------------------------------------------------------------------+
| Vessel Density Heatmap                    | Alert Trend Chart                    |
+--------------------------------------------------------------------------------+
| Top Active Vessels                        | Idle / Anchoring Report              |
+--------------------------------------------------------------------------------+
```

### 15.2 MVP Analytics Widgets

| Widget | Description |
|---|---|
| Vessel Activity | Jumlah kapal aktif per jam/hari |
| Density Map | Heatmap lokasi pergerakan kapal |
| Idle Time | Kapal diam lebih dari threshold |
| Alert Trend | Alert berdasarkan tipe dan severity |
| Top Vessels | Kapal dengan pergerakan terbanyak |

---

## 16. Settings Wireframe

### 16.1 Settings Modules

```text
Settings
├── Users & Roles
├── Data Sources
├── Notification Channels
├── Map Preferences
├── Alert Preferences
├── System Health
└── Audit Logs
```

### 16.2 User Management

```text
+--------------------------------------------------------------------------------+
| Users & Roles                                                  [Invite User]    |
+--------------------------------------------------------------------------------+
| Name          | Email              | Role       | Status | Last Login | Action  |
| Andi Operator | andi@example.com   | Operator   | Active | Today      | Edit    |
| Sari Analyst  | sari@example.com   | Analyst    | Active | Yesterday  | Edit    |
+--------------------------------------------------------------------------------+
```

### 16.3 Data Source Management

```text
+--------------------------------------------------------------------------------+
| Data Sources                                                   [Add Source]     |
+--------------------------------------------------------------------------------+
| Name          | Type      | Status    | Latency | Last Sync | Action           |
| AIS Provider  | AIS API   | Connected | 3s      | 10:15:22  | Test / Edit      |
| Local Receiver| AIS RX    | Disabled  | N/A     | N/A       | Configure        |
+--------------------------------------------------------------------------------+
```

---

## 17. Core Component Library

### 17.1 Components

| Component | Description |
|---|---|
| AppShell | Sidebar + top bar + content layout |
| MapCanvas | Main interactive map |
| VesselMarker | Ship marker with heading and status |
| VesselPopup | Compact vessel info on map |
| VesselDetailPanel | Detailed selected vessel drawer |
| AlertBadge | Severity/status badge |
| AlertFeed | Realtime alert list |
| GeofenceLayer | Polygon overlay on map |
| GeofenceEditor | Draw/edit/import polygon |
| KPI Card | Summary metric card |
| DataTable | Sortable, filterable data table |
| TimelineSlider | Playback timeline |
| RealtimeStatusChip | WebSocket and latency indicator |
| EmptyState | No data state |
| ErrorState | Error state with retry |
| LoadingSkeleton | Loading placeholder |

### 17.2 Button Types

| Button | Usage |
|---|---|
| Primary | Main action such as Save, Track, Create |
| Secondary | Supporting action such as Playback |
| Danger | Resolve critical action such as Delete |
| Ghost | Toolbar action |
| Icon | Map controls and table actions |

---

## 18. UI State Specification

### 18.1 Loading State

| Screen | Loading Behavior |
|---|---|
| Dashboard | Skeleton KPI cards, map spinner, alert feed skeleton |
| Map | Show map immediately, load markers progressively |
| Vessel List | Table skeleton rows |
| Alert Inbox | Table skeleton rows |
| Playback | Disabled controls until route loaded |

### 18.2 Empty State

| Scenario | Message |
|---|---|
| No vessels | `Belum ada kapal aktif di area ini.` |
| No alerts | `Tidak ada alert terbuka.` |
| No geofence | `Belum ada geofence. Buat area monitoring pertama.` |
| No history | `Tidak ada histori pergerakan untuk rentang waktu ini.` |

### 18.3 Error State

| Scenario | Message | Action |
|---|---|---|
| API error | `Data gagal dimuat.` | Retry |
| WebSocket disconnected | `Koneksi realtime terputus.` | Reconnect |
| Map layer error | `Layer peta gagal dimuat.` | Switch basemap |
| Permission denied | `Anda tidak memiliki akses ke fitur ini.` | Back to dashboard |

---

## 19. Interaction Flows

### 19.1 Monitor Vessel Flow

```text
Open Dashboard
    ↓
View realtime map
    ↓
Click vessel marker
    ↓
Open vessel detail panel
    ↓
Choose Track / Playback / Set Alert
```

### 19.2 Respond Alert Flow

```text
Alert appears in feed
    ↓
Operator clicks alert
    ↓
Alert detail drawer opens
    ↓
Operator reviews map snapshot and event timeline
    ↓
Operator clicks Acknowledge
    ↓
System records user, timestamp, and note
    ↓
Operator resolves or escalates
```

### 19.3 Create Geofence Flow

```text
Open Geofences
    ↓
Click Create Geofence
    ↓
Draw polygon on map
    ↓
Fill name, type, and rules
    ↓
Validate geometry
    ↓
Save
    ↓
System activates geofence and rule engine
```

### 19.4 Playback Route Flow

```text
Open History
    ↓
Search vessel
    ↓
Select date range
    ↓
Load route
    ↓
Play route animation
    ↓
Review alerts along track
    ↓
Export if needed
```

---

## 20. Responsive Behavior

### 20.1 Breakpoints

| Breakpoint | Width | Behavior |
|---|---:|---|
| Desktop Large | ≥ 1440px | Full sidebar, map, right panel, bottom panels visible |
| Desktop | 1024px to 1439px | Full sidebar, right panel collapsible |
| Tablet | 768px to 1023px | Sidebar drawer, right panel overlay |
| Mobile | < 768px | Limited viewer mode, map first, tables simplified |

### 20.2 MVP Responsive Priority

MVP diprioritaskan untuk desktop. Tablet dan mobile hanya perlu mendukung view dasar:

1. Login.
2. Realtime map.
3. Vessel detail.
4. Alert list.
5. Alert detail.

---

## 21. Accessibility Requirements

1. Minimum contrast ratio harus cukup untuk text utama.
2. Semua button harus punya label atau aria-label.
3. Map controls harus dapat digunakan dengan keyboard sejauh memungkinkan.
4. Alert tidak boleh hanya mengandalkan warna. Gunakan ikon dan label severity.
5. Tabel harus memiliki header yang jelas.
6. Focus state harus terlihat.
7. Font size minimum untuk data operasional adalah 12px.
8. Komponen utama harus tetap terbaca di layar control room.

---

## 22. Data Display Rules

### 22.1 Time Format

Default display:

```text
2026-06-21 10:15:22 UTC
```

Opsional user preference:

```text
2026-06-21 17:15:22 WIB
```

### 22.2 Coordinate Format

Default:

```text
Lat: -2.976100
Lon: 104.775400
```

Optional display:

```text
2°58'33.96"S, 104°46'31.44"E
```

### 22.3 Speed Format

Default:

```text
12.4 kn
```

### 22.4 Data Freshness Label

| Age | Label | Color |
|---:|---|---|
| 0 to 30 seconds | Live | Green |
| 31 seconds to 5 minutes | Recent | Blue |
| 5 to 15 minutes | Delayed | Yellow |
| > 15 minutes | AIS Silence | Orange/Red |

---

## 23. Map Layer Requirements

### 23.1 Required Layers

| Layer | Description |
|---|---|
| Base Map | Peta dasar jalan, pantai, laut |
| Vessel Layer | Marker kapal aktif |
| Track Layer | Trail pergerakan singkat atau playback |
| Geofence Layer | Polygon area monitoring |
| Alert Layer | Marker alert di peta |
| Port/Area Layer | Area pelabuhan atau area operasi |

### 23.2 Optional Layers

1. Satellite basemap.
2. Bathymetry layer.
3. Weather layer.
4. Traffic density heatmap.
5. Port infrastructure layer.
6. Navigation route layer.

---

## 24. Permission-Based UI

| Feature | Admin | Supervisor | Operator | Analyst | Viewer |
|---|---:|---:|---:|---:|---:|
| View dashboard | Yes | Yes | Yes | Yes | Yes |
| View vessel detail | Yes | Yes | Yes | Yes | Limited |
| Acknowledge alert | Yes | Yes | Yes | No | No |
| Resolve alert | Yes | Yes | Limited | No | No |
| Create geofence | Yes | Yes | No | No | No |
| Edit geofence | Yes | Yes | No | No | No |
| Export data | Yes | Yes | No | Yes | No |
| Manage users | Yes | No | No | No | No |
| Manage data source | Yes | No | No | No | No |

---

## 25. Notification UX

### 25.1 In-App Notification

Notification muncul di:

1. Alert feed.
2. Toast notification.
3. Alert badge on sidebar.
4. Map marker pulse.
5. Browser notification if enabled.

### 25.2 Toast Rules

| Severity | Toast Behavior |
|---|---|
| Info | Auto dismiss after 5 seconds |
| Warning | Auto dismiss after 10 seconds |
| High | Sticky until user clicks |
| Critical | Sticky, sound optional, requires acknowledge |

### 25.3 Sound

Sound notifikasi bersifat optional dan harus bisa dimatikan per user.

---

## 26. Wireframe Acceptance Criteria

### 26.1 Dashboard

1. User dapat melihat peta real-time setelah login.
2. User dapat melihat KPI utama.
3. User dapat memilih kapal dari marker.
4. Detail kapal muncul dalam panel kanan.
5. Alert terbaru muncul di bottom panel.
6. Status koneksi real-time terlihat di top bar.

### 26.2 Map

1. User dapat zoom, pan, dan reset view.
2. User dapat melihat geofence aktif.
3. User dapat membedakan status kapal dari marker.
4. User dapat membuka popup kapal.
5. Map tidak freeze saat data marker bertambah.

### 26.3 Vessel

1. User dapat mencari kapal berdasarkan nama atau MMSI.
2. User dapat membuka detail kapal.
3. User dapat melihat posisi terakhir.
4. User dapat melihat histori kapal.

### 26.4 Geofence

1. User berwenang dapat membuat geofence.
2. User dapat menggambar polygon.
3. Sistem memvalidasi geometry.
4. User dapat menambahkan rule dasar.
5. Geofence yang aktif tampil di peta.

### 26.5 Alerts

1. Alert terbuka tampil di inbox.
2. Alert dapat difilter berdasarkan severity dan status.
3. Operator dapat acknowledge alert.
4. Supervisor dapat resolve alert.
5. Semua aksi tersimpan di audit trail.

### 26.6 Playback

1. User dapat memilih kapal dan rentang waktu.
2. Sistem menampilkan route historis.
3. User dapat play, pause, dan ubah speed.
4. User dapat melihat alert di sepanjang route.

---

## 27. Frontend Implementation Notes

### 27.1 Recommended Stack

| Layer | Recommendation |
|---|---|
| Framework | Next.js / React |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI or custom design system |
| Map | MapLibre GL, Leaflet, OpenLayers, or ArcGIS Maps SDK |
| State | Zustand, Redux Toolkit, or React Query |
| API Client | OpenAPI generated client or Axios wrapper |
| WebSocket | Native WebSocket or Socket.IO depending backend |
| Charts | Recharts, ECharts, or lightweight chart library |

### 27.2 Frontend Folder Suggestion

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── map/
│   ├── vessel/
│   ├── alert/
│   ├── geofence/
│   ├── playback/
│   └── ui/
├── features/
│   ├── dashboard/
│   ├── vessels/
│   ├── alerts/
│   ├── geofences/
│   ├── history/
│   └── analytics/
├── hooks/
├── services/
├── stores/
├── types/
└── utils/
```

---

## 28. MVP Screen List

### 28.1 Required for MVP

| Screen | Priority |
|---|---|
| Login | P0 |
| Dashboard | P0 |
| Full Map | P0 |
| Vessel List | P0 |
| Vessel Detail | P0 |
| Alert Inbox | P0 |
| Alert Detail | P0 |
| Geofence List | P1 |
| Geofence Editor | P1 |
| History Playback | P1 |
| Settings Basic | P1 |

### 28.2 Post-MVP Screens

| Screen | Priority |
|---|---|
| Advanced Analytics | P2 |
| Notification Channel Config | P2 |
| Audit Log Viewer | P2 |
| Data Source Health Dashboard | P2 |
| Multi-provider Data Comparison | P3 |
| Route Prediction | P3 |
| Dark Vessel Detection | P3 |

---

## 29. Open UX Questions

1. Apakah default time zone akan menggunakan UTC atau WIB?
2. Apakah user membutuhkan dark mode sejak MVP?
3. Apakah peta perlu memakai base map lokal, MapLibre, OpenStreetMap, atau ArcGIS?
4. Apakah operator membutuhkan sound alert di control room?
5. Apakah dashboard perlu mendukung multi-monitor?
6. Apakah geofence editor harus mendukung import GeoJSON sejak MVP?
7. Apakah viewer eksternal boleh melihat semua kapal atau hanya kapal tertentu?
8. Apakah playback harus mendukung export video atau cukup CSV/GeoJSON?
9. Apakah alert harus memiliki assignment ke user tertentu?
10. Apakah aplikasi harus bilingual Indonesia/English?

---

## 30. UX Backlog

### 30.1 MVP Backlog

1. Finalisasi dashboard layout.
2. Buat design tokens.
3. Buat vessel marker component.
4. Buat map interaction prototype.
5. Buat alert feed component.
6. Buat vessel detail drawer.
7. Buat geofence editor wireframe.
8. Buat playback timeline component.
9. Buat loading, empty, and error states.
10. Buat role-based navigation behavior.

### 30.2 Enhancement Backlog

1. Dark mode.
2. Multi-monitor dashboard mode.
3. Configurable dashboard widgets.
4. Advanced layer management.
5. Heatmap visualization.
6. Route comparison.
7. Vessel behavior timeline.
8. Alert investigation workspace.
9. Mobile field-view mode.
10. User preference profiles.

---

## 31. Definition of Done

Dokumen UI/UX wireframe dianggap selesai untuk tahap MVP jika:

1. Semua layar P0 memiliki wireframe dan deskripsi fungsi.
2. Navigation structure disetujui.
3. Dashboard layout disetujui.
4. Map behavior disetujui.
5. Vessel detail dan alert detail disetujui.
6. Geofence editor memiliki alur dasar.
7. Playback memiliki timeline interaction.
8. State loading, empty, dan error sudah didefinisikan.
9. Permission-based UI sudah disepakati.
10. Frontend team dapat mulai membuat prototype berdasarkan dokumen ini.

---

## 32. Summary

`10_UI_UX_Wireframe.md` menjadi acuan visual dan interaksi awal untuk **Real Time Vessel Tracking System / VesselTrack OS**.

Fokus utama MVP adalah:

1. Dashboard peta real-time.
2. Detail kapal.
3. Alert operasional.
4. Geofence management.
5. Playback histori.
6. UI yang jelas, cepat, dan aman untuk operasi.

Dokumen ini menjadi jembatan antara PRD, arsitektur, API specification, WebSocket specification, geofence rule specification, dan alerting specification agar pengembangan frontend tidak berlayar tanpa kompas.
