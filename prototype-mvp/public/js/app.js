// DOM Elements
const vesselTableBody = document.getElementById('vessel-table-body');
const fullVesselTableBody = document.getElementById('full-vessel-table-body');
const alertsListEl = document.getElementById('alerts-list');
const statTotalVessels = document.getElementById('stat-total-vessels');
const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');
const statLastUpdate = document.getElementById('stat-last-update');
const statLastUpdateDate = document.getElementById('stat-last-update-date');

// Detail View Elements
const detailVesselName = document.getElementById('detail-vessel-name');
const detailMmsi = document.getElementById('detail-mmsi');
const detailPosition = document.getElementById('detail-position');
const detailCourse = document.getElementById('detail-course');
const detailSpeed = document.getElementById('detail-speed');

// Map View Elements
const mapCoordinates = document.getElementById('map-coordinates');
const mapVesselPopup = document.getElementById('map-vessel-popup');
const closeMapPopup = document.getElementById('close-map-popup');
const popupViewDetails = document.getElementById('popup-view-details');
const toggleVessels = document.getElementById('toggle-vessels');
const toggleLabels = document.getElementById('toggle-labels');

// Navigation Elements
const navItems = document.querySelectorAll('.nav-item[data-target]');
const views = document.querySelectorAll('.content-wrapper');
const backToListBtn = document.getElementById('back-to-vessels-btn');
const tabItems = document.querySelectorAll('.tab-item');
const defaultTopbar = document.getElementById('default-topbar');
const mapTopbar = document.getElementById('map-topbar');
const historyTopbar = document.getElementById('history-topbar');

// State
let vesselsData = {};
let markers = {};
let currentDetailMmsi = null;
let currentPopupMmsi = null;

// Mock Full Map Data Layer State
let fullMapMarkers = [];
let fullMapTrackLines = [];
let mockVesselsList = [];

// Maps Initialization
const map = L.map('map', { center: [-6.09, 106.88], zoom: 11, attributionControl: false });
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

const miniMap = L.map('mini-map', { center: [1.3529, 103.8198], zoom: 10, zoomControl: true, attributionControl: false });
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(miniMap);
let miniMapMarker = null;
let miniMapTrackLine = null;
let mockTrackCoordinates = [];

const fullMap = L.map('full-screen-map', { center: [2.5, 110.0], zoom: 5, zoomControl: false, attributionControl: false });
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(fullMap);

const historyMap = L.map('history-map', { center: [9.0, 110.0], zoom: 5, zoomControl: false, attributionControl: false });
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(historyMap);

// Mouse coordinates on Full Map
fullMap.on('mousemove', (e) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(3);
    const lonDeg = Math.floor(Math.abs(lon));
    const lonMin = ((Math.abs(lon) - lonDeg) * 60).toFixed(3);
    mapCoordinates.textContent = `${String(latDeg).padStart(2,'0')}° ${latMin}' ${latDir}, ${String(lonDeg).padStart(3,'0')}° ${lonMin}' ${lonDir}`;
});

// --- Map Tools: Fullscreen & Measure ---
const btnFullscreen = document.getElementById('map-btn-fullscreen');
if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
        const mapEl = document.getElementById('map-view');
        if (!document.fullscreenElement) {
            mapEl.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    });
}

const btnMeasure = document.getElementById('map-btn-measure');
let measureControl = null;
let measureLayer = new L.FeatureGroup();
fullMap.addLayer(measureLayer);

if (btnMeasure) {
    btnMeasure.addEventListener('click', () => {
        if (measureControl) {
            measureControl.disable();
            measureControl = null;
            btnMeasure.classList.remove('active-tool');
            btnMeasure.style.background = '';
            btnMeasure.style.color = '';
            measureLayer.clearLayers();
        } else {
            if (L.Draw && L.Draw.Polyline) {
                measureControl = new L.Draw.Polyline(fullMap, {
                    shapeOptions: { color: '#f59e0b', weight: 3, dashArray: '5, 5' }
                });
                measureControl.enable();
                btnMeasure.classList.add('active-tool');
                btnMeasure.style.background = 'var(--primary-blue)';
                btnMeasure.style.color = 'white';
            }
        }
    });
}

fullMap.on(L.Draw.Event.CREATED, function (e) {
    if (e.layerType === 'polyline' && measureControl) {
        measureLayer.clearLayers();
        measureLayer.addLayer(e.layer);
        
        const latlngs = e.layer.getLatLngs();
        let distMeters = 0;
        for(let i=0; i<latlngs.length-1; i++){
            distMeters += latlngs[i].distanceTo(latlngs[i+1]);
        }
        const distNM = (distMeters / 1852).toFixed(2);
        
        e.layer.bindTooltip(`Distance: ${distNM} NM`, {permanent: true, direction: 'center', className: 'measure-tooltip'}).openTooltip();
        
        measureControl = null;
        btnMeasure.classList.remove('active-tool');
        btnMeasure.style.background = '';
        btnMeasure.style.color = '';
    }
});
// ---------------------------------------

// Flags mock dictionary
const flags = {
    'Singapore': 'https://flagcdn.com/w40/sg.png',
    'United Kingdom': 'https://flagcdn.com/w40/gb.png',
    'Liberia': 'https://flagcdn.com/w40/lr.png',
    'Norway': 'https://flagcdn.com/w40/no.png',
    'Denmark': 'https://flagcdn.com/w40/dk.png',
    'Japan': 'https://flagcdn.com/w40/jp.png',
    'Marshall Islands': 'https://flagcdn.com/w40/mh.png',
    'Australia': 'https://flagcdn.com/w40/au.png',
    'Indonesia': 'https://flagcdn.com/w40/id.png'
};

const vesselTypesMock = ['Cargo', 'Tanker', 'Passenger', 'Fishing'];

const API_BASE = 'http://localhost:3000/api';
const WS_URL = 'ws://localhost:3000';

// ==========================================
// HISTORY PLAYBACK STATE
// ==========================================
let historyData = [];
let isPlaying = false;
let playbackIndex = 0;
let playbackInterval;
let historyChartInstance = null;
let isHistoryInitialized = false;

// ==========================================
// GEOFENCES STATE
// ==========================================
let geofencesData = [];
let geofencePreviewMap = null;
let gfPolygonLayer = null;
let gfAnchorMarker = null;
let isGeofencesInitialized = false;

// ==========================================
// ALERTS STATE
// ==========================================
let alertsData = [];
let alertPreviewMap = null;
let alertPolygonLayer = null;
let alertVesselMarker = null;
let isAlertsInitialized = false;
let currentSelectedAlertId = null;

// ==========================================
// ANALYTICS STATE
// ==========================================
let isAnalyticsInitialized = false;
let analyticsHeatmap = null;
let vesselCountChart = null;
let vesselTypesChart = null;
let alertTrendChart = null;

const playBtn = document.getElementById('playback-play-btn');
const progressSlider = document.getElementById('playback-slider');
const playbackTimestamp = document.getElementById('playback-timestamp');
const playbackStatusPill = document.getElementById('playback-status-pill');
const playbackSpeedSelect = document.getElementById('playback-speed-select');

// Initialize
async function init() {
    setupLogin();
    setupAlertDrawer();
    setupVesselTabs();
    setupGeofenceEditor();
    startClock();
    setupNavigation();
    setupMapUIInteractions();
    renderStaticAlerts(); 
    await fetchGeofences();
    await fetchInitialVessels();
    generateMockMapData(); 
    setupWebSocket();
    renderVesselTable();
    renderFullVesselTable(); 

    // Setup search listeners
    const searchDashboard = document.getElementById('search-dashboard');
    if (searchDashboard) {
        searchDashboard.addEventListener('input', (e) => {
            renderFullVesselTable(e.target.value);
        });
    }

    const searchVessels = document.getElementById('search-vessels');
    if (searchVessels) {
        searchVessels.addEventListener('input', (e) => {
            renderVesselTable(e.target.value);
        });
    }
}

function setupLogin() {
    const loginForm = document.getElementById('login-form');
    const loginOverlay = document.getElementById('login-overlay');
    const mainApp = document.getElementById('main-app-container');
    const globalLoader = document.getElementById('global-loader');
    
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            loginOverlay.classList.add('view-hidden');
            globalLoader.classList.remove('view-hidden');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                
                if (response.ok) {
                    // Wait for permissions to be loaded before rendering
                    await loadPermissions();
                    
                    setTimeout(() => {
                        globalLoader.classList.add('view-hidden');
                        mainApp.classList.remove('view-hidden');
                        
                        applyRolePermissions(data.user.role);
                        
                        // Set display name in all topbars
                        document.querySelectorAll('.user-name').forEach(el => {
                            el.innerHTML = data.user.username + ' <i class="fa-solid fa-chevron-down" style="font-size: 10px; margin-left:4px;"></i>';
                        });
                        document.querySelectorAll('.user-role').forEach(el => {
                            el.innerHTML = data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1);
                        });

                        showToast('Welcome to VesselTrack', 'Secure connection established.');
                        
                        if(typeof map !== 'undefined' && map) map.invalidateSize();
                        if(typeof fullMap !== 'undefined' && fullMap) fullMap.invalidateSize();
                        if(typeof historyMap !== 'undefined' && historyMap) historyMap.invalidateSize();
                        if(typeof analyticsHeatmap !== 'undefined' && analyticsHeatmap) analyticsHeatmap.invalidateSize();
                        
                    }, 500); 
                } else {
                    globalLoader.classList.add('view-hidden');
                    loginOverlay.classList.remove('view-hidden');
                    alert('Login failed: ' + (data.error || 'Invalid credentials'));
                }
            } catch (error) {
                globalLoader.classList.add('view-hidden');
                loginOverlay.classList.remove('view-hidden');
                alert('Login error: ' + error.message);
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
            mainApp.classList.add('view-hidden');
            loginOverlay.classList.remove('view-hidden');
            showToast('Logged Out', 'You have been securely logged out.');
        });
    }
}

function applyRolePermissions(role) {
    // Mapping from permissions table modules to UI view targets
    const moduleTargetMap = {
        'Dashboard': 'dashboard-view',
        'Vessel Tracking': 'vessels-view',
        'Live Map': 'map-view',
        'Geofence Management': 'geofences-view',
        'Alert Acknowledgment': 'alerts-view',
        'History (Playback)': 'history-view',
        'Analytics Dashboard': 'analytics-view',
        'User Management': 'settings-view',
        'About': 'about-view'
    };

    // Which targets are allowed for the current role
    const allowedTargets = new Set();
    
    permissionsList.forEach(perm => {
        const target = moduleTargetMap[perm.module];
        if (target && perm[role]) {
            allowedTargets.add(target);
        }
    });

    // Hide/Show sidebar navigation based on role
    const sidebarItems = document.querySelectorAll('.sidebar-nav .nav-item');
    sidebarItems.forEach(item => {
        const targetView = item.getAttribute('data-target');
        
        if (allowedTargets.has(targetView)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    // Hide/Show About cards based on role
    const aboutCards = document.querySelectorAll('#about-view .card');
    aboutCards.forEach(card => {
        const targetView = card.getAttribute('data-about-target');
        
        if (allowedTargets.has(targetView)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    // Handle view fallback if current view is hidden
    const activeView = document.querySelector('.content-wrapper:not(.view-hidden)');
    const activeTargetId = activeView ? activeView.id : 'dashboard-view';
    
    const activeNavItem = document.querySelector(`.sidebar-nav .nav-item[data-target="${activeTargetId}"]`);
    if (activeNavItem && activeNavItem.style.display === 'none') {
        // Fallback to dashboard
        document.querySelector(`.sidebar-nav .nav-item[data-target="dashboard-view"]`).click();
    }
}

function showToast(title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-bell toast-icon" style="color: var(--accent-blue);"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fa-solid fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Navigation Logic
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if(!targetId) return; 

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            switchToView(targetId);
        });
    });

    if (backToListBtn) {
        backToListBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelector('.nav-item[data-target="vessels-view"]').classList.add('active');
            switchToView('vessels-view');
        });
    }
    
    const historyBack = document.getElementById('history-back-btn');
    if (historyBack) {
        historyBack.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelector('.nav-item[data-target="dashboard-view"]').classList.add('active');
            switchToView('dashboard-view');
        });
    }

    const trackOnMapBtn = document.getElementById('track-on-map-btn');
    if (trackOnMapBtn) {
        trackOnMapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            const mapNav = document.querySelector('.nav-item[data-target="map-view"]');
            if (mapNav) mapNav.classList.add('active');
            switchToView('map-view');
            
            if (currentDetailMmsi && vesselsData[currentDetailMmsi]) {
                const v = vesselsData[currentDetailMmsi];
                fullMap.setView([v.lat, v.lon], 14);
                showMapPopup(v, getVesselColor(v.type));
            }
        });
    }

    tabItems.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = tab.parentElement;
            parent.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Sidebar Collapse Logic
    const sidebar = document.getElementById('main-sidebar');
    const collapseTopBtn = document.getElementById('sidebar-collapse-btn');
    const collapseFooterBtn = document.getElementById('sidebar-collapse-footer-btn');

    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (collapseTopBtn) {
            collapseTopBtn.classList.toggle('fa-angles-left', !isCollapsed);
            collapseTopBtn.classList.toggle('fa-angles-right', isCollapsed);
        }
        
        if (collapseFooterBtn) {
            const icon = collapseFooterBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-arrow-left', !isCollapsed);
                icon.classList.toggle('fa-arrow-right', isCollapsed);
            }
        }

        // Trigger map resizes after transition
        setTimeout(() => {
            if (map) map.invalidateSize();
            if (fullMap) fullMap.invalidateSize();
            if (historyMap) historyMap.invalidateSize();
            if (geofencePreviewMap) geofencePreviewMap.invalidateSize();
            if (alertPreviewMap) alertPreviewMap.invalidateSize();
        }, 300);
    }

    if (collapseTopBtn) {
        collapseTopBtn.addEventListener('click', toggleSidebar);
    }
    
    if (collapseFooterBtn) {
        collapseFooterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    }
}

function switchToView(viewId) {
    views.forEach(view => {
        view.classList.remove('view-active');
        view.classList.add('view-hidden');
    });
    
    const allTopbars = document.querySelectorAll('.topbar');
    allTopbars.forEach(tb => tb.classList.add('view-hidden'));
    
    if (viewId === 'map-view') {
        if(mapTopbar) mapTopbar.classList.remove('view-hidden');
    } else if (viewId === 'history-view') {
        if(historyTopbar) historyTopbar.classList.remove('view-hidden');
    } else if (viewId === 'geofences-view') {
        const geofencesTopbar = document.getElementById('geofences-topbar');
        if(geofencesTopbar) geofencesTopbar.classList.remove('view-hidden');
    } else if (viewId === 'alerts-view') {
        const alertsTopbar = document.getElementById('alerts-topbar');
        if(alertsTopbar) alertsTopbar.classList.remove('view-hidden');
    } else if (viewId === 'analytics-view') {
        const analyticsTopbar = document.getElementById('analytics-topbar');
        if(analyticsTopbar) analyticsTopbar.classList.remove('view-hidden');
    } else if (viewId === 'settings-view') {
        // Settings doesn't use the standard topbar, it has its own clean header
        setTimeout(() => {
            if (typeof loadUsers === 'function') loadUsers();
        }, 100);
    } else {
        if(defaultTopbar) defaultTopbar.classList.remove('view-hidden');
    }

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('view-hidden');
        targetView.classList.add('view-active');
        
        if (viewId === 'dashboard-view') setTimeout(() => map.invalidateSize(), 100);
        if (viewId === 'vessel-detail-view') setTimeout(() => miniMap.invalidateSize(), 100);
        if (viewId === 'map-view') setTimeout(() => fullMap.invalidateSize(), 100);
        if (viewId === 'geofences-view') {
            setTimeout(() => {
                if(!isGeofencesInitialized) initGeofences();
                if(geofencePreviewMap) geofencePreviewMap.invalidateSize();
            }, 100);
        }
        if (viewId === 'alerts-view') {
            setTimeout(() => {
                if(!isAlertsInitialized) initAlerts();
                if(alertPreviewMap) alertPreviewMap.invalidateSize();
            }, 100);
        }
        if (viewId === 'analytics-view') {
            setTimeout(() => {
                if(!isAnalyticsInitialized) initAnalytics();
                if(analyticsHeatmap) analyticsHeatmap.invalidateSize();
            }, 100);
        }
        if (viewId === 'settings-view') {
            if(!isSettingsInitialized) initSettings();
        }
        if (viewId === 'history-view') {
            setTimeout(() => {
                historyMap.invalidateSize();
                if (!isHistoryInitialized) {
                    generateHistoryData();
                    setupHistoryMap();
                    setupHistoryChart();
                    setupPlaybackControls();
                    isHistoryInitialized = true;
                }
                if (historyData.length > 0) {
                    const latlngs = historyData.map(d => [d.lat, d.lon]);
                    historyMap.fitBounds(L.polyline(latlngs).getBounds(), { padding: [50, 50] });
                }
            }, 100);
        }
    }
}

// Clock
function startClock() {
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB'); 
        const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-GB', dateOptions); 
        
        clockTime.textContent = timeStr;
        clockDate.textContent = dateStr + ' (UTC +7)';
        statLastUpdate.textContent = timeStr;
        statLastUpdateDate.textContent = dateStr + ' (UTC +7)';
        document.getElementById('clock-time-map').textContent = timeStr;
        document.getElementById('clock-time-hist').textContent = timeStr;
    }, 1000);
}

// ==========================================
// MAP VIEW LOGIC
// ==========================================
function setupMapUIInteractions() {
    if(closeMapPopup) {
        closeMapPopup.addEventListener('click', () => {
            mapVesselPopup.style.display = 'none';
            currentPopupMmsi = null;
        });
    }

    if(popupViewDetails) {
        popupViewDetails.addEventListener('click', (e) => {
            e.preventDefault();
            mapVesselPopup.style.display = 'none';
            
            let v = mockVesselsList.find(mv => mv.mmsi === currentPopupMmsi);
            if (!v && vesselsData[currentPopupMmsi]) v = vesselsData[currentPopupMmsi];
            
            if (v) openVesselDetail(v.mmsi, !!vesselsData[v.mmsi], v); 
        });
    }

    if(toggleVessels) {
        toggleVessels.addEventListener('change', (e) => {
            const show = e.target.checked;
            fullMapMarkers.forEach(m => {
                if (show) fullMap.addLayer(m);
                else fullMap.removeLayer(m);
            });
            fullMapTrackLines.forEach(l => {
                if (show) fullMap.addLayer(l);
                else fullMap.removeLayer(l);
            });
        });
    }
}

function generateMockMapData() {
    for(let i=0; i<60; i++) {
        const lat = 1.15 + Math.random() * 0.15; // 1.15 to 1.30 (Singapore Strait)
        const lon = 103.6 + Math.random() * 0.6; // 103.6 to 104.2
        const course = Math.floor(Math.random() * 360);
        const type = vesselTypesMock[Math.floor(Math.random() * vesselTypesMock.length)];
        const speed = 5 + Math.random() * 15;
        const colorClass = getVesselColor(type);
        
        const mmsi = '999' + Math.floor(100000 + Math.random() * 900000);
        
        const vesselData = {
            mmsi: mmsi, name: `MOCK VESSEL ${i}`, type: type, speed: speed, course: course,
            lat: lat, lon: lon, imo: Math.floor(8000000 + Math.random() * 1000000),
            flag: Object.keys(flags)[Math.floor(Math.random() * Object.keys(flags).length)]
        };
        mockVesselsList.push(vesselData);

        const trackLen = 0.5 + Math.random() * 2;
        const backLat = lat - (Math.cos(course * Math.PI / 180) * trackLen);
        const backLon = lon - (Math.sin(course * Math.PI / 180) * trackLen);

        const trackLine = L.polyline([[backLat, backLon], [lat, lon]], { 
            color: getCssColor(colorClass), weight: 1, dashArray: '2, 4', opacity: 0.5
        }).addTo(fullMap);
        fullMapTrackLines.push(trackLine);

        const icon = getMiniMapIcon(course, colorClass);
        const marker = L.marker([lat, lon], { icon }).addTo(fullMap);
        
        marker.on('click', () => showMapPopup(vesselData, colorClass));
        fullMapMarkers.push(marker);
    }

    L.polygon([[18, 118], [21, 120], [21.5, 122], [18, 124], [16, 122]], { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.1, dashArray: '5,5'}).addTo(fullMap);
    L.polygon([[10, 110], [12, 112], [9, 114], [7, 112]], { color: '#3b82f6', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.1, dashArray: '5,5'}).addTo(fullMap);
    L.polygon([[4, 118], [6, 120], [6, 122], [3, 121]], { color: '#8b5cf6', weight: 2, fillColor: '#8b5cf6', fillOpacity: 0.1, dashArray: '5,5'}).addTo(fullMap);
    L.circle([3.1, 101.6], { radius: 100000, color: '#ef4444', weight: 1, fillColor: '#ef4444', fillOpacity: 0.2 }).addTo(fullMap);
    L.circle([-6.2, 106.8], { radius: 80000, color: '#ef4444', weight: 1, fillColor: '#ef4444', fillOpacity: 0.2 }).addTo(fullMap);
}

function showMapPopup(v, colorClass) {
    currentPopupMmsi = v.mmsi;
    document.getElementById('popup-vessel-icon').innerHTML = getSvgTriangle(colorClass);
    document.getElementById('popup-vessel-name').textContent = v.name;
    document.getElementById('popup-mmsi').textContent = v.mmsi;
    document.getElementById('popup-imo').textContent = v.imo || '-';
    document.getElementById('popup-type').textContent = v.type;
    document.getElementById('popup-cog').textContent = Math.round(v.course);
    document.getElementById('popup-sog').textContent = v.speed.toFixed(1);
    mapVesselPopup.style.display = 'flex';
}

function getCssColor(colorClass) {
    if (colorClass === 'green') return '#10b981';
    if (colorClass === 'red') return '#ef4444';
    if (colorClass === 'orange') return '#f59e0b';
    if (colorClass === 'purple') return '#8b5cf6';
    return '#3b82f6';
}

function getMiniMapIcon(course, colorClass = 'green') {
    const cssColor = getCssColor(colorClass);
    const htmlIcon = `
        <div style="transform: rotate(${course}deg); width: 24px; height: 24px; background: ${cssColor}; border-radius: 50%; display: flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: white; fill: white; width: 14px; height: 14px;">
                <path d="M12 2L20 22L12 18L4 22L12 2Z" />
            </svg>
        </div>
    `;
    return L.divIcon({ className: 'vessel-marker', html: htmlIcon, iconSize: [24, 24], iconAnchor: [12, 12] });
}


// ==========================================
// HISTORY PLAYBACK LOGIC
// ==========================================

function generateHistoryData() {
    historyData = [];
    const waypoints = [
        [-6.0, 106.8], [-5.0, 106.2], [-3.0, 106.5], [-1.0, 105.5], 
        [1.2, 104.4], [2.5, 104.6], [5.0, 105.8], [8.0, 108.5], 
        [11.0, 112.0], [13.5, 116.0], [14.5, 119.5]
    ];
    let currentTime = new Date("2025-06-20T00:00:00Z").getTime();
    const timeStep = 3600000; 

    let totalSegments = waypoints.length - 1;
    let pointsPerSegment = 50;

    for (let w = 0; w < totalSegments; w++) {
        let p1 = waypoints[w];
        let p2 = waypoints[w+1];
        
        let isAnchoring = (w === 4);

        for (let i = 0; i < pointsPerSegment; i++) {
            let frac = i / pointsPerSegment;
            let lat = p1[0] + (p2[0] - p1[0]) * frac;
            let lon = p1[1] + (p2[1] - p1[1]) * frac;
            
            let dLon = (p2[1] - p1[1]);
            let dLat = (p2[0] - p1[0]);
            let course = Math.atan2(dLon, dLat) * 180 / Math.PI;
            if (course < 0) course += 360;

            let speed = 15 + (Math.random() * 3 - 1.5);
            let wind = 10 + Math.random() * 8; 
            let windDir = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)];
            let status = 'green';

            if (isAnchoring && i > 10 && i < 40) {
                speed = Math.random() * 0.5;
                status = 'purple';
                lat = p1[0] + (p2[0] - p1[0]) * (10/pointsPerSegment) + (Math.random()-0.5)*0.005;
                lon = p1[1] + (p2[1] - p1[1]) * (10/pointsPerSegment) + (Math.random()-0.5)*0.005;
                course = Math.random() * 360;
            } else if (lat > 0.5 && lat < 2.0) {
                speed = 5 + Math.random() * 4;
                status = speed < 7 ? 'red' : 'orange';
            }

            historyData.push({
                lat: lat + (Math.random()-0.5)*0.01, 
                lon: lon + (Math.random()-0.5)*0.01, 
                speed: speed, 
                course: course,
                wind: wind,
                windDir: windDir,
                status: status, 
                timestamp: currentTime
            });
            currentTime += (isAnchoring && i > 10 && i < 40) ? timeStep * 2 : timeStep;
        }
    }
    progressSlider.max = historyData.length - 1;
}

function setupHistoryMap() {
    const latlngs = historyData.map(d => [d.lat, d.lon]);
    
    const heatData = historyData.map(d => {
        let intensity = 0.2;
        if (d.status === 'orange') intensity = 0.6;
        if (d.status === 'red') intensity = 1.0;
        return [d.lat, d.lon, intensity];
    });
    
    L.heatLayer(heatData, {
        radius: 35, blur: 25, maxZoom: 10,
        gradient: {0.4: 'green', 0.6: 'yellow', 1.0: 'red'}
    }).addTo(historyMap);

    L.polyline(latlngs, { color: '#10b981', weight: 2, dashArray: '5, 8' }).addTo(historyMap);

    historyData.forEach((d, i) => {
        if (i % 5 === 0) { 
            const iconHtml = `
                <div style="transform: rotate(${d.course}deg); width: 12px; height: 12px;">
                    <svg viewBox="0 0 24 24" fill="var(--status-${d.status})" stroke="white" stroke-width="2" style="width: 100%; height: 100%;">
                        <path d="M12 2L20 22L12 18L4 22L12 2Z" />
                    </svg>
                </div>
                <div class="dot ${d.status}" style="position:absolute; top:-5px; right:-5px; width:6px; height:6px; border:1px solid white;"></div>
            `;
            const icon = L.divIcon({ className: 'history-static-marker', html: iconHtml, iconSize: [12, 12], iconAnchor: [6, 6] });
            L.marker([d.lat, d.lon], { icon }).addTo(historyMap);
        }
    });

    const playIconHtml = `
        <div id="play-marker-rot" style="transform: rotate(45deg); width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items:center; justify-content:center; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">
            <svg viewBox="0 0 24 24" fill="var(--accent-blue)" stroke="none" style="width: 16px; height: 16px;">
                <path d="M12 2L20 22L12 18L4 22L12 2Z" />
            </svg>
        </div>
    `;
    const playIcon = L.divIcon({ className: 'playback-marker', html: playIconHtml, iconSize: [24, 24], iconAnchor: [12, 12] });
    playMarker = L.marker([historyData[0].lat, historyData[0].lon], { icon: playIcon, zIndexOffset: 1000 }).addTo(historyMap);

    // We will call fitBounds when the view becomes active instead.
}

function setupHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    const labels = historyData.map((d, i) => {
        const date = new Date(d.timestamp);
        if (i % 24 === 0) return `${date.getDate()} ${date.toLocaleString('en', {month:'short'})}`;
        if (i % 6 === 0) return `${String(date.getHours()).padStart(2,'0')}:00`;
        return '';
    });
    
    const fullDataPoints = historyData.map(d => d.speed);
    const activeDataPoints = historyData.map((d, i) => i <= playbackIndex ? d.speed : null);

    historyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Speed (kn)', 
                    data: activeDataPoints, 
                    borderColor: '#3b82f6',
                    borderWidth: 2, 
                    tension: 0.1, 
                    pointRadius: 0, 
                    pointHoverRadius: 4
                },
                {
                    label: 'Full Track', 
                    data: fullDataPoints, 
                    borderColor: '#e2e8f0', 
                    borderWidth: 1.5, 
                    borderDash: [5, 5],
                    tension: 0.1, 
                    pointRadius: 0, 
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function(context) { return context.parsed.y.toFixed(1) + ' kn'; } } }
            },
            scales: {
                y: { min: 0, max: 30, ticks: { stepSize: 10, color: '#64748b', font: {size: 10} }, border: {display: false}, grid: {color: '#f1f5f9'} },
                x: { ticks: { autoSkip: false, maxRotation: 0, color: '#64748b', font: {size: 10} }, grid: {display: false} }
            }
        }
    });

    // Tabs listener for chart metric switching
    let currentMetric = 'speed';
    const yAxisLabel = document.getElementById('chart-y-axis-label');
    
    document.querySelectorAll('.chart-card .tab-item').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.chart-card .tab-item').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentMetric = tab.getAttribute('data-chart-metric');
            
            let label = '';
            let yMin = 0;
            let yMax = 0;
            let unit = '';
            
            if (currentMetric === 'speed') {
                label = 'Speed (kn)';
                unit = ' kn';
                yMin = 0;
                yMax = 20;
                yAxisLabel.innerText = 'Speed (kn)';
            } else if (currentMetric === 'course') {
                label = 'Course (°)';
                unit = '°';
                yMin = 0;
                yMax = 360;
                yAxisLabel.innerText = 'Course (°)';
            } else if (currentMetric === 'wind') {
                label = 'Wind (kn)';
                unit = ' kn';
                yMin = 0;
                yMax = 40;
                yAxisLabel.innerText = 'Wind (kn)';
            } else if (currentMetric === 'position') {
                label = 'Latitude (°)';
                unit = '°';
                yMin = -10;
                yMax = 20;
                yAxisLabel.innerText = 'Latitude (°)';
            }
            
            const dataKey = currentMetric === 'position' ? 'lat' : currentMetric;
            const fullDataPoints = historyData.map(d => d[dataKey]);
            const activeDataPoints = historyData.map((d, i) => i <= playbackIndex ? d[dataKey] : null);
            
            historyChartInstance.data.datasets[0].label = label;
            historyChartInstance.data.datasets[1].label = 'Full Track';
            historyChartInstance.data.datasets[0].data = activeDataPoints;
            historyChartInstance.data.datasets[1].data = fullDataPoints;
            
            historyChartInstance.options.scales.y.min = yMin;
            historyChartInstance.options.scales.y.max = yMax;
            historyChartInstance.options.plugins.tooltip.callbacks.label = function(context) { 
                return context.parsed.y.toFixed(1) + unit; 
            };
            
            historyChartInstance.update();
        });
    });
}

function setupPlaybackControls() {
    playBtn.addEventListener('click', () => {
        if (isPlaying) pausePlayback();
        else startPlayback();
    });

    progressSlider.addEventListener('input', (e) => {
        playbackIndex = parseInt(e.target.value);
        updatePlaybackUI();
    });
    
    updatePlaybackUI();
}

function startPlayback() {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    playbackStatusPill.textContent = 'Playing';
    playbackStatusPill.style.backgroundColor = 'var(--accent-light-blue)';
    playbackStatusPill.style.color = 'var(--accent-blue)';
    
    if(playbackIndex >= historyData.length - 1) playbackIndex = 0; 
    
    const speedMultiplier = parseInt(playbackSpeedSelect.value);
    const intervalMs = 200 / speedMultiplier; 

    playbackInterval = setInterval(() => {
        if (playbackIndex < historyData.length - 1) {
            playbackIndex++;
            progressSlider.value = playbackIndex;
            updatePlaybackUI();
        } else {
            pausePlayback();
        }
    }, intervalMs);
}

function pausePlayback() {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    playbackStatusPill.textContent = 'Paused';
    playbackStatusPill.style.backgroundColor = '#f1f5f9';
    playbackStatusPill.style.color = 'var(--text-secondary)';
    clearInterval(playbackInterval);
}

function updatePlaybackUI() {
    const data = historyData[playbackIndex];
    if (!data) return;

    playMarker.setLatLng([data.lat, data.lon]);
    const rotEl = document.getElementById('play-marker-rot');
    if(rotEl) rotEl.style.transform = `rotate(${data.course}deg)`;

    const date = new Date(data.timestamp);
    const dStr = String(date.getDate()).padStart(2,'0') + '/' + String(date.getMonth()+1).padStart(2,'0') + '/' + date.getFullYear();
    const tStr = String(date.getHours()).padStart(2,'0') + ':' + String(date.getMinutes()).padStart(2,'0') + ':00';
    playbackTimestamp.textContent = `${dStr} ${tStr}`;    // Update Chart
    if (historyChartInstance) {
        const activeTab = document.querySelector('.chart-card .tab-item.active');
        const currentMetric = activeTab ? activeTab.getAttribute('data-chart-metric') : 'speed';
        const dataKey = currentMetric === 'position' ? 'lat' : currentMetric;
        historyChartInstance.data.datasets[0].data = historyData.map((d, i) => i <= playbackIndex ? d[dataKey] : null);
        historyChartInstance.update('none'); 
    }    
}

// ==========================================
// WEBSOCKET & DYNAMIC DATA
// ==========================================

async function fetchInitialVessels() {
    try {
        const res = await fetch(`${API_BASE}/vessels`);
        const data = await res.json();
        data.forEach(v => {
            if(v.lat && v.lon) {
                updateVesselData(v);
                
                const colorClass = getVesselColor(v.type);
                const icon = getMiniMapIcon(v.course, colorClass);
                const marker = L.marker([v.lat, v.lon], { icon }).addTo(fullMap);
                marker.on('click', () => showMapPopup(v, colorClass));
                fullMapMarkers.push(marker);
            }
        });
        statTotalVessels.textContent = (1248).toLocaleString(); 
    } catch (e) {
        console.error('Failed to fetch vessels', e);
    }
}

async function fetchGeofences() {
    try {
        const res = await fetch(`${API_BASE}/geofences`);
        const data = await res.json();
        data.forEach(gf => {
            L.polygon(gf.coordinates, { color: '#3b82f6', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.2, dashArray: '5, 5'}).addTo(map);
        });
        const dummyCoords = [[-6.02, 106.82], [-6.02, 106.86], [-6.05, 106.88], [-6.07, 106.85], [-6.05, 106.81]];
        L.polygon(dummyCoords, { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.2, dashArray: '5, 5' }).addTo(map);
    } catch (e) {}
}

function setupWebSocket() {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'VESSEL_UPDATE') {
            updateVesselData(message.payload);
            renderVesselTable();
            renderFullVesselTable(); 
            updateDetailViewLive(message.payload);
        }
    };
}

function updateVesselData(v) {
    vesselsData[v.mmsi] = v;
    let colorClass = getVesselColor(v.type);
    
    const htmlIcon = `
        <div style="transform: rotate(${v.course}deg); width: 20px; height: 20px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--status-${colorClass}); fill: var(--status-${colorClass});">
                <path d="M12 2L20 22L12 18L4 22L12 2Z" />
            </svg>
        </div>
    `;
    const icon = L.divIcon({ className: 'vessel-marker', html: htmlIcon, iconSize: [20, 20], iconAnchor: [10, 10] });

    if (markers[v.mmsi]) {
        markers[v.mmsi].setLatLng([v.lat, v.lon]);
        markers[v.mmsi].setIcon(icon);
    } else {
        const marker = L.marker([v.lat, v.lon], { icon }).addTo(map);
        markers[v.mmsi] = marker;
    }
}

function getVesselColor(type) {
    if (type === 'Passenger') return 'green';
    if (type === 'Cargo') return 'orange';
    if (type === 'Tanker') return 'purple';
    return 'blue';
}

function getSvgTriangle(colorClass) {
    return `<svg class="vessel-table-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--status-${colorClass}); fill: var(--status-${colorClass});"><path d="M12 2L20 22L12 18L4 22L12 2Z" /></svg>`;
}

function renderVesselTable(filterStr = '') {
    if(!vesselTableBody) return;
    vesselTableBody.innerHTML = '';
    
    let vessels = Object.values(vesselsData).slice(0, 15);
    if(filterStr) {
        vessels = Object.values(vesselsData).filter(v => v.name.toLowerCase().includes(filterStr.toLowerCase()) || v.mmsi.includes(filterStr)).slice(0, 15);
    }
    
    if(vessels.length === 0) {
        vesselTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state" style="padding: 20px;">
                        <i class="fa-solid fa-ship" style="font-size: 2rem;"></i>
                        <h3 style="font-size: 1rem;">No vessels match</h3>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    vessels.forEach(v => {
        const colorClass = getVesselColor(v.type);
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openVesselDetail(v.mmsi, true);
        tr.innerHTML = `
            <td>
                <div class="vessel-name-cell">
                    <span class="dot ${colorClass}"></span>
                    ${v.name}
                </div>
            </td>
            <td>${v.mmsi}</td>
            <td>${v.type || v.vessel_type}</td>
            <td>${v.speed ? v.speed.toFixed(1) : 0} kn</td>
            <td>${v.course ? Math.round(v.course) : 0}°</td>
            <td>Jakarta, Indonesia</td>
            <td class="time-ago">Just now</td>
        `;
        vesselTableBody.appendChild(tr);
    });
}

function renderFullVesselTable(filterStr = '') {
    if(!fullVesselTableBody) return;
    fullVesselTableBody.innerHTML = '';
    
    let vessels = Object.values(vesselsData);
    if(filterStr) {
        vessels = vessels.filter(v => v.name.toLowerCase().includes(filterStr.toLowerCase()) || v.mmsi.includes(filterStr));
    }
    
    if(vessels.length === 0) {
        fullVesselTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fa-solid fa-ship"></i>
                        <h3>No vessels found</h3>
                        <p>Adjust your search filters.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    vessels.forEach(v => {
        const colorClass = getVesselColor(v.type);
        const statusText = v.speed > 0.5 ? 'Under Way' : 'Idle';
        const statusColor = v.speed > 0.5 ? 'green-text' : 'orange-text';

        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openVesselDetail(v.mmsi, true);
        tr.innerHTML = `
            <td>
                <div class="vessel-name-cell">
                    <span class="dot ${colorClass}"></span>
                    ${v.name}
                </div>
            </td>
            <td>${v.mmsi}</td>
            <td>${v.type || v.vessel_type}</td>
            <td class="${statusColor}" style="font-weight: 500;">${statusText}</td>
            <td>${v.speed.toFixed(1)} kn</td>
            <td>${v.course.toFixed(1)}°</td>
            <td>${new Date(v.timestamp).toLocaleTimeString()}</td>
        `;
        fullVesselTableBody.appendChild(tr);
    });
}

function openVesselDetail(mmsi, isDynamic, staticData = null) {
    currentDetailMmsi = mmsi;
    
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('.nav-item[data-target="vessels-view"]').classList.add('active');
    
    switchToView('vessel-detail-view');

    mockTrackCoordinates = [];
    if (miniMapTrackLine) miniMap.removeLayer(miniMapTrackLine);
    if (miniMapMarker) miniMap.removeLayer(miniMapMarker);

    if (isDynamic) {
        const v = vesselsData[mmsi] || mockVesselsList.find(mv => mv.mmsi === mmsi);
        detailVesselName.textContent = v.name;
        detailMmsi.textContent = v.mmsi;
        detailPosition.innerHTML = `${Math.abs(v.lat).toFixed(4)}°${v.lat>=0?'N':'S'}<br>${Math.abs(v.lon).toFixed(4)}°${v.lon>=0?'E':'W'}`;
        detailCourse.textContent = `${Math.round(v.course)}°`;
        detailSpeed.textContent = `${v.speed.toFixed(1)} kn`;
        setupMiniMap(v.lat, v.lon, v.course, getVesselColor(v.type));
    } else {
        detailVesselName.textContent = staticData.name;
        detailMmsi.textContent = staticData.mmsi;
        detailPosition.innerHTML = `1.3529°N<br>103.8198°E`; 
        detailCourse.textContent = `${staticData.course}°`;
        detailSpeed.textContent = `${staticData.speed.toFixed(1)} kn`;
        setupMiniMap(1.25, 103.8, staticData.course === '-' ? 90 : parseInt(staticData.course), staticData.color);
    }
    
    populateVesselTabsData(isDynamic ? (vesselsData[mmsi] || mockVesselsList.find(mv => mv.mmsi === mmsi)) : staticData);
}

function setupMiniMap(lat, lon, course, colorClass = 'green') {
    miniMap.setView([lat, lon], 10);
    mockTrackCoordinates = [
        [lat - 0.05, lon - 0.05],
        [lat - 0.02, lon - 0.02],
        [lat, lon]
    ];
    miniMapTrackLine = L.polyline(mockTrackCoordinates, { color: getCssColor(colorClass), weight: 2 }).addTo(miniMap);
    const icon = getMiniMapIcon(course, colorClass);
    miniMapMarker = L.marker([lat, lon], { icon }).addTo(miniMap);
}

function populateVesselTabsData(vData) {
    if (!vData) return;
    
    // 1. History Tab
    const historyContainer = document.getElementById('vessel-history-container');
    if(historyContainer) {
        historyContainer.innerHTML = `
            <div style="border-left: 2px solid var(--border-color); padding-left: 16px; position: relative;">
                <div style="position: absolute; width: 10px; height: 10px; background: var(--primary-blue); border-radius: 50%; left: -6px; top: 0;"></div>
                <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">Current Position Update</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Just now</div>
                <div style="font-size: 13px; color: var(--text-secondary);">Course: ${vData.course}°, Speed: ${vData.speed} kn</div>
            </div>
            <div style="border-left: 2px solid var(--border-color); padding-left: 16px; position: relative;">
                <div style="position: absolute; width: 10px; height: 10px; background: var(--border-color); border-radius: 50%; left: -6px; top: 0;"></div>
                <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">Speed changed</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">15 mins ago</div>
            </div>
            <div style="border-left: 2px solid transparent; padding-left: 16px; position: relative;">
                <div style="position: absolute; width: 10px; height: 10px; background: var(--border-color); border-radius: 50%; left: -6px; top: 0;"></div>
                <div style="font-weight: 500; color: var(--text-primary); font-size: 14px;">Entered Area</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">1 hr ago</div>
            </div>
        `;
    }

    // 2. Alerts Tab
    const alertsContainer = document.getElementById('vessel-alerts-container');
    if (alertsContainer) {
        const vAlerts = alertsData.filter(a => String(a.mmsi) === String(vData.mmsi) || a.vessel === vData.name);
        
        if (vAlerts.length === 0) {
            alertsContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No active alerts for this vessel.</div>`;
        } else {
            alertsContainer.innerHTML = vAlerts.map(a => `
                <div class="alert-card ${a.unread ? 'unread' : ''}" style="cursor: pointer; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 8px;" onclick="openAlertDrawerById(${a.id})">
                    <div style="display: flex; justify-content: space-between;">
                        <span class="badge ${a.badgeClass}">${a.priority}</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">${a.timeAgo}</span>
                    </div>
                    <div style="font-weight: 600; color: var(--text-primary);">${a.type}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);"><i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${a.desc}</div>
                </div>
            `).join('');
        }
    }

    // 3. Geofences Tab
    const geofencesContainer = document.getElementById('vessel-geofences-container');
    if (geofencesContainer) {
        geofencesContainer.innerHTML = `
            <table class="data-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>Geofence</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-size: 13px;">14:32:15</td>
                        <td><span style="color: var(--status-red); font-weight: 500;">Entered</span></td>
                        <td style="font-size: 13px;">Restricted Area A</td>
                    </tr>
                    <tr>
                        <td style="font-size: 13px;">10:15:00</td>
                        <td><span style="color: var(--status-green); font-weight: 500;">Exited</span></td>
                        <td style="font-size: 13px;">Anchorage Area 1</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}

window.openAlertDrawerById = function(id) {
    const alert = alertsData.find(a => a.id === id);
    if(alert) openAlertDrawer(alert);
};

function updateDetailViewLive(v) {
    if (currentDetailMmsi !== String(v.mmsi)) return; 

    detailPosition.innerHTML = `${Math.abs(v.lat).toFixed(4)}°${v.lat>=0?'N':'S'}<br>${Math.abs(v.lon).toFixed(4)}°${v.lon>=0?'E':'W'}`;
    detailCourse.textContent = `${Math.round(v.course)}°`;
    detailSpeed.textContent = `${v.speed.toFixed(1)} kn`;

    if (miniMapMarker) {
        const newPos = [v.lat, v.lon];
        miniMapMarker.setLatLng(newPos);
        miniMapMarker.setIcon(getMiniMapIcon(v.course, getVesselColor(v.type)));
        miniMap.setView(newPos);
        
        mockTrackCoordinates.push(newPos);
        if(mockTrackCoordinates.length > 20) mockTrackCoordinates.shift(); 
        miniMapTrackLine.setLatLngs(mockTrackCoordinates);
    }
}

function renderStaticAlerts() {
    // Dummy alerts for dashboard
    const alerts = [
        { type: 'Geofence Breach', vessel: 'Unidentified Vessel in Restricted Zone', time: '14:31', icon: 'fa-circle-exclamation', color: 'red' },
        { type: 'Speed Alert', vessel: 'Speed Limit Exceeded (Zone B)', time: '14:21', icon: 'fa-gauge-high', color: 'orange' },
        { type: 'Connection Lost', vessel: 'AIS Signal Lost (MV SEASTAR 01)', time: '14:05', icon: 'fa-triangle-exclamation', color: 'red' }
    ];

    alertsListEl.innerHTML = '';
    alerts.forEach(alert => {
        const el = document.createElement('div');
        el.className = 'alert-item-ui';
        el.innerHTML = `
            <div class="alert-info">
                <i class="fa-solid ${alert.icon} alert-icon ${alert.color}"></i>
                <div class="alert-text">
                    <span class="alert-type">${alert.type}</span>
                    <span class="alert-desc">${alert.vessel}</span>
                </div>
            </div>
            <div class="alert-time ${alert.color}">${alert.time}</div>
        `;
        alertsListEl.appendChild(el);
    });
}

// ==========================================
// GEOFENCES LOGIC
// ==========================================

function setupGeofenceEditor() {
    const gfModal = document.getElementById('geofence-editor-modal');
    const openBtn = document.getElementById('new-gf-btn');
    const closeBtn = document.getElementById('close-gf-modal');
    const cancelBtn = document.getElementById('cancel-gf-modal');
    const saveBtn = document.getElementById('save-gf-modal');

    if(!gfModal || !openBtn) return;

    openBtn.addEventListener('click', () => {
        gfModal.classList.remove('view-hidden');
        if(!window.gfEditorMap) {
            window.gfEditorMap = L.map('gf-editor-map').setView([1.25, 103.9], 11);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(window.gfEditorMap);
            
            // Initialize Leaflet Draw
            var drawnItems = new L.FeatureGroup();
            window.gfEditorMap.addLayer(drawnItems);
            
            if (L.Control.Draw) {
                var drawControl = new L.Control.Draw({
                    edit: { featureGroup: drawnItems },
                    draw: { marker: false, polyline: false, circlemarker: false, rectangle: true, polygon: true, circle: true }
                });
                window.gfEditorMap.addControl(drawControl);
                
                window.gfEditorMap.on(L.Draw.Event.CREATED, function (event) {
                    var layer = event.layer;
                    drawnItems.addLayer(layer);
                    window.lastDrawnGeofenceLayer = layer;
                });
            }

            // Add a mock drawing layer (in water)
            const mockDraw = L.polygon([
                [1.24, 103.88], [1.26, 103.89], [1.25, 103.92], [1.23, 103.90]
            ], { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, dashArray: '5, 5' });
            drawnItems.addLayer(mockDraw);
            window.gfEditorMap.fitBounds(mockDraw.getBounds());
        }
        setTimeout(() => window.gfEditorMap.invalidateSize(), 300);
    });

    closeBtn.addEventListener('click', () => gfModal.classList.add('view-hidden'));
    cancelBtn.addEventListener('click', () => gfModal.classList.add('view-hidden'));
    saveBtn.addEventListener('click', () => {
        // Mock save
        gfModal.classList.add('view-hidden');
        alert('Geofence saved successfully (Mock)');
    });
}

function initGeofences() {
    geofencesData = [
        { id: 1, name: 'Gulfzone Reach', sub: 'MY-SEASTAR-01', type: 'Restricted Area', status: 'Active', statusClass: 'active', vessels: 2, breached: 1, lastUpdate: '2 min ago', area: '156.5 NM²', created: '15 May 2025', modified: '24 Jun 2025 08:45', author: 'Admin', desc: 'Restricted zone for offshore operations and safety compliance.', latlngs: [[1.20, 103.70], [1.25, 103.75], [1.20, 103.80], [1.15, 103.75]] },
        { id: 2, name: 'Anchorage Area 1', sub: 'Port of Batam', type: 'Anchorage Area', status: 'Active', statusClass: 'active', vessels: 4, breached: 0, lastUpdate: '5 min ago', area: '45.2 NM²', created: '10 Jan 2025', modified: '12 Jun 2025 10:00', author: 'Port Auth', desc: 'Designated anchorage for waiting vessels.', latlngs: [[1.17, 103.95], [1.22, 103.95], [1.22, 104.00], [1.17, 104.00]] },
        { id: 3, name: 'Speed Limit Zone A', sub: 'Malacca Strait', type: 'Speed Limit', status: 'Inactive', statusClass: 'inactive', vessels: 0, breached: 0, lastUpdate: '1 hr ago', area: '310.0 NM²', created: '01 Feb 2025', modified: '01 Mar 2025 14:20', author: 'System', desc: 'Max 12 knots speed limit zone.', latlngs: [[1.28, 103.65], [1.32, 103.70], [1.30, 103.75], [1.26, 103.70]] }
    ];

    const tbody = document.getElementById('gf-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    geofencesData.forEach((gf, idx) => {
        const tr = document.createElement('tr');
        if(idx === 0) tr.classList.add('active-row');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: var(--text-primary);">${gf.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${gf.sub}</div>
            </td>
            <td>${gf.type}</td>
            <td>
                <div style="display: flex; align-items: center;">
                    <span class="gf-status-dot ${gf.statusClass}"></span> ${gf.status}
                </div>
            </td>
            <td style="text-align: center;">${gf.vessels}</td>
            <td style="text-align: center; color: ${gf.breached > 0 ? 'var(--status-red)' : 'inherit'}; font-weight: ${gf.breached > 0 ? '600' : 'normal'};">${gf.breached}</td>
            <td>${gf.lastUpdate}</td>
            <td>
                <button class="ui-btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem; margin-right: 4px;"><i class="fa-solid fa-pen"></i></button>
                <button class="ui-btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            </td>
        `;
        tr.addEventListener('click', () => selectGeofence(gf, tr));
        tbody.appendChild(tr);
    });

    geofencePreviewMap = L.map('gf-preview-map', { zoomControl: false }).setView([1.25, 103.9], 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(geofencePreviewMap);
    L.control.zoom({ position: 'topright' }).addTo(geofencePreviewMap);

    selectGeofence(geofencesData[0], tbody.firstElementChild);

    // Modal Events
    const modal = document.getElementById('geofence-modal');
    document.getElementById('new-gf-btn').addEventListener('click', () => modal.classList.remove('view-hidden'));
    document.getElementById('close-gf-modal').addEventListener('click', () => modal.classList.add('view-hidden'));
    document.getElementById('cancel-gf-btn').addEventListener('click', (e) => { e.preventDefault(); modal.classList.add('view-hidden'); });
    document.getElementById('save-gf-btn').addEventListener('click', (e) => { 
        e.preventDefault(); 
        alert('Geofence saved successfully!'); 
        modal.classList.add('view-hidden'); 
    });

    isGeofencesInitialized = true;
}

function selectGeofence(gf, trElement) {
    document.querySelectorAll('.gf-table tr').forEach(tr => tr.classList.remove('active-row'));
    if(trElement) trElement.classList.add('active-row');

    if(gfPolygonLayer) geofencePreviewMap.removeLayer(gfPolygonLayer);
    if(gfAnchorMarker) geofencePreviewMap.removeLayer(gfAnchorMarker);
    
    gfPolygonLayer = L.polygon(gf.latlngs, {
        color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 2
    }).addTo(geofencePreviewMap);
    
    // Add anchor icon inside
    const bounds = gfPolygonLayer.getBounds();
    const center = bounds.getCenter();
    const anchorHtml = '<div style="color: #ef4444; font-size: 16px;"><i class="fa-solid fa-anchor"></i></div>';
    const anchorIcon = L.divIcon({ className: 'gf-anchor-icon', html: anchorHtml, iconSize: [16,16], iconAnchor: [8,8] });
    gfAnchorMarker = L.marker(center, {icon: anchorIcon}).addTo(geofencePreviewMap);

    geofencePreviewMap.fitBounds(bounds, { padding: [20, 20] });

    document.getElementById('gf-details-content').innerHTML = `
        <div class="gf-detail-row"><div class="gf-detail-label">Name</div><div class="gf-detail-value">${gf.name}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Type</div><div class="gf-detail-value" style="color: var(--status-red);">${gf.type}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Status</div><div class="gf-detail-value" style="color: var(--status-green);">${gf.status}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Vessels in Area</div><div class="gf-detail-value">${gf.vessels}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Breached (24h)</div><div class="gf-detail-value ${gf.breached > 0 ? 'breached' : ''}">${gf.breached}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Area</div><div class="gf-detail-value">${gf.area}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Created</div><div class="gf-detail-value">${gf.created}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Last Modified</div><div class="gf-detail-value">${gf.modified}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Created By</div><div class="gf-detail-value">${gf.author}</div></div>
        <div class="gf-detail-row" style="flex-direction: column; gap: 8px;"><div class="gf-detail-label">Description</div><div class="gf-detail-value" style="width: 100%; font-weight: 400; color: var(--text-secondary); line-height: 1.4;">${gf.desc}</div></div>
    `;
}

// ==========================================
// ALERTS LOGIC
// ==========================================
function initAlerts() {
    alertsData = [
        { id: 1, type: 'Geofence Breach', vessel: 'MV SEASTAR 01', mmsi: 'SG1234567', desc: 'Restricted Area A', time: '14:32:15', timeAgo: '2m ago', priority: 'Critical', unread: true, icon: 'fa-exclamation', iconClass: 'icon-critical', badgeClass: 'badge-critical', lat: 1.25, lon: 103.85, status: 'Active', duration: '2 minutes', gfName: 'Restricted Area A', resolved: false,
          polygon: [[1.24, 103.84], [1.26, 103.84], [1.26, 103.87], [1.24, 103.86]],
          history: [
            { time: '14:32:15', title: 'Alert Triggered', desc: 'Vessel entered Restricted Area A', author: '', color: 'red' },
            { time: '14:32:15', title: 'Acknowledged by Operator', desc: '', author: 'Operator', color: 'green' },
            { time: '14:33:02', title: 'Vessel exited geofence', desc: '', author: 'System', color: 'green' },
            { time: '14:33:10', title: 'Resolved', desc: '', author: 'Operator', color: 'green' }
          ]
        },
        { id: 2, type: 'Anchoring Alert', vessel: 'MV OCEANIC 34', mmsi: 'PA9876543', desc: 'Anchorage Area 1', time: '14:21:03', timeAgo: '13m ago', priority: 'Warning', unread: true, icon: 'fa-triangle-exclamation', iconClass: 'icon-warning', badgeClass: 'badge-warning', lat: 1.18, lon: 103.95, status: 'Active', duration: '13 minutes', gfName: 'Anchorage Area 1', resolved: false,
          polygon: [[1.17, 103.93], [1.19, 103.93], [1.19, 103.97], [1.17, 103.97]],
          history: [
            { time: '14:21:03', title: 'Alert Triggered', desc: 'Vessel dropped anchor outside designated zone', author: 'System', color: 'red' }
          ]
        },
        { id: 3, type: 'Speed Alert', vessel: 'MV FUTURE STAR', mmsi: 'ID4561237', desc: 'Speed > 15.0 kn', time: '14:05:42', timeAgo: '28m ago', priority: 'Info', unread: false, icon: 'fa-info', iconClass: 'icon-info', badgeClass: 'badge-info', lat: 1.28, lon: 103.75, status: 'Active', duration: '28 minutes', gfName: 'Speed Limit Zone', resolved: false,
          polygon: [[1.27, 103.73], [1.29, 103.73], [1.29, 103.77], [1.27, 103.77]],
          history: [
            { time: '14:05:42', title: 'Alert Triggered', desc: 'Vessel exceeded 15.0 kn limit', author: 'System', color: 'red' },
            { time: '14:10:00', title: 'Acknowledged by Operator', desc: '', author: 'Operator', color: 'green' }
          ]
        },
        { id: 4, type: 'AIS Silence', vessel: 'MV PACIFIC PEARL', mmsi: 'CN7891234', desc: 'No signal for 10+ min', time: '13:50:11', timeAgo: '43m ago', priority: 'Warning', unread: false, icon: 'fa-tower-broadcast', iconClass: 'icon-silence', badgeClass: 'badge-warning', lat: 1.15, lon: 103.65, status: 'Active', duration: '43 minutes', gfName: 'N/A', resolved: false,
          polygon: [[1.14, 103.64], [1.16, 103.64], [1.16, 103.66], [1.14, 103.66]],
          history: [
            { time: '13:50:11', title: 'Alert Triggered', desc: 'AIS signal lost', author: 'System', color: 'red' }
          ]
        }
    ];
    
    renderAlertsList();
    
    alertPreviewMap = L.map('alert-preview-map', { zoomControl: false }).setView([1.25, 103.9], 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(alertPreviewMap);
    L.control.zoom({ position: 'bottomright' }).addTo(alertPreviewMap);
    
    if(alertsData.length > 0) selectAlert(alertsData[0].id);

    // Button Events
    document.getElementById('btn-ack-alert').addEventListener('click', () => {
        if(!currentSelectedAlertId) return;
        const alert = alertsData.find(a => a.id === currentSelectedAlertId);
        if(alert && alert.unread) {
            alert.unread = false;
            alert.history.push({ time: new Date().toLocaleTimeString('en-US',{hour12:false}), title: 'Acknowledged by Operator', desc: '', author: 'Operator', color: 'green' });
            renderAlertsList();
            selectAlert(alert.id);
        }
    });

    document.getElementById('btn-resolve-alert').addEventListener('click', () => {
        if(!currentSelectedAlertId) return;
        const alert = alertsData.find(a => a.id === currentSelectedAlertId);
        if(alert) {
            alert.resolved = true;
            alert.unread = false;
            alert.status = 'Resolved';
            alert.history.push({ time: new Date().toLocaleTimeString('en-US',{hour12:false}), title: 'Resolved', desc: '', author: 'Operator', color: 'green' });
            renderAlertsList();
            // find next unresolved
            const nextAlert = alertsData.find(a => !a.resolved);
            if(nextAlert) selectAlert(nextAlert.id);
            else document.getElementById('alerts-detail-header').innerHTML = 'No active alerts';
        }
    });

    document.getElementById('mark-all-read-btn').addEventListener('click', () => {
        alertsData.forEach(a => a.unread = false);
        renderAlertsList();
        if(currentSelectedAlertId) selectAlert(currentSelectedAlertId);
    });
    
    isAlertsInitialized = true;
}

function renderAlertsList() {
    const container = document.getElementById('alerts-list-container');
    if(!container) return;
    container.innerHTML = '';
    alertsData.filter(a => !a.resolved).forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-card ${currentSelectedAlertId === alert.id ? 'active-card' : ''}`;
        div.innerHTML = `
            ${alert.unread ? '<div class="alert-unread-dot"></div>' : ''}
            <div class="alert-icon-box ${alert.iconClass}"><i class="fa-solid ${alert.icon}"></i></div>
            <div class="alert-card-content">
                <div class="alert-card-header">
                    <span class="alert-title">${alert.type}</span>
                    <span class="alert-time-text">${alert.time} (${alert.timeAgo})</span>
                </div>
                <div class="alert-vessel-name">${alert.vessel}</div>
                <div class="alert-desc">
                    <span>${alert.desc}</span>
                    <span class="alert-badge ${alert.badgeClass}">${alert.priority}</span>
                </div>
            </div>
        `;
        div.addEventListener('click', () => selectAlert(alert.id));
        container.appendChild(div);
    });
    // Update badge count
    const unreadCount = alertsData.filter(a => a.unread && !a.resolved).length;
    const badge = document.getElementById('alerts-top-badge');
    const sbBadge = document.getElementById('sidebar-alert-badge');
    if(badge) { badge.textContent = unreadCount; badge.style.display = unreadCount > 0 ? 'flex' : 'none'; }
    if(sbBadge) { sbBadge.textContent = unreadCount; sbBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none'; }
}

function selectAlert(id) {
    currentSelectedAlertId = id;
    renderAlertsList(); // updates active card class
    const alert = alertsData.find(a => a.id === id);
    if(!alert) return;

    // Update Details Header
    document.getElementById('alerts-detail-header').innerHTML = `
        <div style="display: flex; gap: 16px; align-items: center;">
            <div class="alerts-detail-header-icon ${alert.iconClass}"><i class="fa-solid ${alert.icon}"></i></div>
            <div>
                <h3 style="margin: 0; font-size: 1.1rem;">${alert.type}</h3>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">${alert.time} (${alert.timeAgo})</span>
            ${alert.unread ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--status-red);"></div>' : ''}
            <button style="background: none; border: none; cursor: pointer; color: var(--text-secondary);"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `;

    // Update Details Table
    document.getElementById('alerts-detail-table').innerHTML = `
        <div class="gf-detail-row"><div class="gf-detail-label">Vessel</div><div class="gf-detail-value">🇲🇨 ${alert.vessel} (${alert.mmsi})</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Geofence</div><div class="gf-detail-value">${alert.gfName}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Time</div><div class="gf-detail-value">27 Jun 2025 ${alert.time} (UTC+8)</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Position</div><div class="gf-detail-value">${alert.lat}° N, ${alert.lon}° E</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Status</div><div class="gf-detail-value"><span class="gf-status-dot active"></span> ${alert.status}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Duration</div><div class="gf-detail-value">${alert.duration}</div></div>
        <div class="gf-detail-row"><div class="gf-detail-label">Last Update</div><div class="gf-detail-value">27 Jun 2025 ${alert.time} (UTC+8)</div></div>
    `;

    // Update Map
    if(alertPolygonLayer) alertPreviewMap.removeLayer(alertPolygonLayer);
    if(alertVesselMarker) alertPreviewMap.removeLayer(alertVesselMarker);
    
    alertPolygonLayer = L.polygon(alert.polygon, {
        color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1.5
    }).addTo(alertPreviewMap);
    
    const vesselHtml = '<div style="color: #22c55e; font-size: 20px;"><i class="fa-solid fa-location-arrow" style="transform: rotate(45deg);"></i></div>';
    const vesselIcon = L.divIcon({ className: '', html: vesselHtml, iconSize: [20,20], iconAnchor: [10,10] });
    alertVesselMarker = L.marker([alert.lat, alert.lon], {icon: vesselIcon}).addTo(alertPreviewMap);

    alertPreviewMap.fitBounds(alertPolygonLayer.getBounds(), { padding: [30, 30] });

    // Update Timeline
    const timelineContainer = document.getElementById('alerts-timeline');
    timelineContainer.innerHTML = alert.history.map((h) => `
        <div class="timeline-item">
            <div class="timeline-time">${h.time}</div>
            <div class="timeline-marker">
                <div class="timeline-dot ${h.color === 'red' ? 'red' : ''}"></div>
                <div class="timeline-line"></div>
            </div>
            <div class="timeline-content">
                <div>
                    <div class="timeline-title">${h.title}</div>
                    ${h.desc ? '<div class="timeline-desc">' + h.desc + '</div>' : ''}
                </div>
                ${h.author ? '<div class="timeline-author">' + h.author + '</div>' : ''}
            </div>
        </div>
    `).join('');
}

function openAlertDrawer(alert) {
    const drawer = document.getElementById('alert-detail-drawer');
    if(!drawer) return;
    drawer.classList.remove('view-hidden');
    
    document.getElementById('alert-drawer-title').textContent = alert.type;
    document.getElementById('alert-drawer-icon').className = `fa-solid ${alert.icon} ${alert.iconClass}`;
    const badge = document.getElementById('alert-drawer-badge');
    badge.textContent = alert.priority;
    badge.className = `badge ${alert.badgeClass}`;
    
    document.getElementById('ad-vessel').textContent = alert.vessel;
    document.getElementById('ad-time').textContent = alert.time;
    document.getElementById('ad-duration').textContent = alert.duration;
    document.getElementById('ad-loc').textContent = `${alert.lat} N, ${alert.lon} E`;
    
    document.getElementById('alert-timeline').innerHTML = alert.history.map((h) => `
        <div style="margin-bottom:8px;">
            <div style="font-weight:600; color: ${h.color === 'red' ? '#ef4444' : '#10b981'};">${h.time} - ${h.title}</div>
            ${h.desc ? `<div style="font-size:12px;">${h.desc}</div>` : ''}
            ${h.author ? `<div style="font-size:11px; opacity:0.7;">By: ${h.author}</div>` : ''}
        </div>
    `).join('');
    
    // Setup Drawer Map (initialize once if needed, or just setView)
    if(!window.adMap) {
        window.adMap = L.map('alert-drawer-map', { zoomControl: false }).setView([alert.lat, alert.lon], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(window.adMap);
    } else {
        window.adMap.setView([alert.lat, alert.lon], 12);
    }
    
    // Clear previous layers
    if(window.adMapLayers) {
        window.adMapLayers.forEach(l => window.adMap.removeLayer(l));
    }
    window.adMapLayers = [];
    
    const poly = L.polygon(alert.polygon, { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1 }).addTo(window.adMap);
    const marker = L.marker([alert.lat, alert.lon]).addTo(window.adMap);
    window.adMapLayers.push(poly, marker);
    
    setTimeout(() => {
        window.adMap.invalidateSize();
        window.adMap.fitBounds(poly.getBounds().pad(0.5));
    }, 300);

    // Wire buttons
    const btnAck = document.getElementById('drawer-btn-ack');
    const btnRes = document.getElementById('drawer-btn-resolve');
    if(btnAck) {
        btnAck.onclick = () => {
            alert.history.push({ time: new Date().toLocaleTimeString('en-GB'), title: 'Acknowledged', author: 'Operator', color: 'green' });
            alert.unread = false;
            openAlertDrawer(alert); // re-render
            renderAlertsList(); // refresh main list if open
        };
    }
    if(btnRes) {
        btnRes.onclick = () => {
            alert.history.push({ time: new Date().toLocaleTimeString('en-GB'), title: 'Resolved', author: 'Operator', color: 'green' });
            alert.resolved = true;
            alert.status = 'Resolved';
            openAlertDrawer(alert); // re-render
            renderAlertsList(); // refresh main list if open
        };
    }
}

function setupAlertDrawer() {
    document.getElementById('close-alert-drawer')?.addEventListener('click', () => {
        document.getElementById('alert-detail-drawer').classList.add('view-hidden');
    });
}

function setupVesselTabs() {
    const tabs = document.querySelectorAll('.vessel-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTab = e.currentTarget;
            
            tabs.forEach(t => t.classList.remove('active'));
            currentTab.classList.add('active');
            
            document.querySelectorAll('.vessel-tab-content').forEach(c => c.classList.add('view-hidden'));
            const contentId = `vessel-tab-${currentTab.dataset.tab}`;
            const targetContent = document.getElementById(contentId);
            if(targetContent) targetContent.classList.remove('view-hidden');
        });
    });
}

// ==========================================
// ANALYTICS LOGIC
// ==========================================
function initAnalytics() {
    // 1. Heatmap (Leaflet)
    analyticsHeatmap = L.map('analytics-heatmap', { zoomControl: false }).setView([1.25, 103.9], 10);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(analyticsHeatmap);
    L.control.zoom({ position: 'topright' }).addTo(analyticsHeatmap);

    // Mock Heatmap Data (Singapore Strait region)
    const heatData = [
        [1.25, 103.9, 1.0], [1.22, 103.85, 0.9], [1.28, 103.95, 0.7], [1.18, 103.8, 0.8], [1.26, 104.0, 1.0],
        [1.20, 104.1, 0.9], [1.21, 103.75, 0.6], [1.16, 103.65, 0.4], [1.24, 103.82, 1.0], [1.27, 103.92, 0.8],
        [1.29, 104.05, 0.9], [1.19, 103.78, 0.7], [1.23, 103.98, 0.5]
    ];
    if(typeof L.heatLayer !== 'undefined') {
        L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
        }).addTo(analyticsHeatmap);
    }

    const commonOptions = {
        animation: { duration: 1500, easing: 'easeOutQuart' },
        responsive: true,
        maintainAspectRatio: false,
    };

    // 2. Vessel Count Over Time (Line Chart)
    const ctxCount = document.getElementById('vesselCountChart').getContext('2d');
    vesselCountChart = new Chart(ctxCount, {
        type: 'line',
        data: {
            labels: ['16 Jun', '17 Jun', '18 Jun', '19 Jun', '20 Jun', '21 Jun'],
            datasets: [{
                label: 'Total Vessels',
                data: [1100, 1580, 1420, 1080, 1500, 1260],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
            },
            scales: {
                y: { min: 0, max: 2000, grid: { borderDash: [4, 4], color: '#e2e8f0' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 3. Top Vessel Types (Doughnut Chart)
    const ctxTypes = document.getElementById('vesselTypesChart').getContext('2d');
    vesselTypesChart = new Chart(ctxTypes, {
        type: 'doughnut',
        data: {
            labels: ['Cargo', 'Tanker', 'Fishing', 'Tug', 'Others'],
            datasets: [{
                data: [40, 25, 15, 10, 10],
                backgroundColor: ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#94a3b8'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            ...commonOptions,
            cutout: '65%',
            plugins: { legend: { display: false }, tooltip: { enabled: true } }
        }
    });

    // 4. Alert Trend (Stacked Bar Chart)
    const ctxAlert = document.getElementById('alertTrendChart').getContext('2d');
    alertTrendChart = new Chart(ctxAlert, {
        type: 'bar',
        data: {
            labels: ['16 Jun', '17 Jun', '18 Jun', '19 Jun', '20 Jun', '21 Jun'],
            datasets: [
                { label: 'Critical', data: [12, 14, 12, 10, 12, 12], backgroundColor: '#ef4444', barPercentage: 0.5 },
                { label: 'Warning', data: [28, 35, 31, 26, 33, 30], backgroundColor: '#f59e0b', barPercentage: 0.5 },
                { label: 'Info', data: [21, 26, 22, 18, 24, 22], backgroundColor: '#3b82f6', barPercentage: 0.5 }
            ]
        },
        options: {
            ...commonOptions,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, min: 0, max: 100, grid: { borderDash: [4, 4], color: '#e2e8f0' } }
            }
        }
    });

    isAnalyticsInitialized = true;
}

// ==========================================
// SETTINGS LOGIC
// ==========================================
let isSettingsInitialized = false;

const dummyUsers = [
    { username: 'operator1', fullName: 'Operator One', email: 'operator1@company.com', role: 'Operator', status: 'Active', lastLogin: '24 Jun 2025 14:32' },
    { username: 'supervisor1', fullName: 'Supervisor One', email: 'supervisor1@company.com', role: 'Supervisor', status: 'Active', lastLogin: '24 Jun 2025 10:15' },
    { username: 'analyst1', fullName: 'Analyst One', email: 'analyst1@company.com', role: 'Analyst', status: 'Active', lastLogin: '23 Jun 2025 16:45' },
    { username: 'admin1', fullName: 'Admin One', email: 'admin1@company.com', role: 'Administrator', status: 'Active', lastLogin: '24 Jun 2025 09:30' },
    { username: 'viewer1', fullName: 'Viewer One', email: 'viewer1@company.com', role: 'Viewer', status: 'Active', lastLogin: '23 Jun 2025 11:20' },
    { username: 'operator2', fullName: 'Operator Two', email: 'operator2@company.com', role: 'Operator', status: 'Inactive', lastLogin: '18 Jun 2025 08:05' },
    { username: 'analyst2', fullName: 'Analyst Two', email: 'analyst2@company.com', role: 'Analyst', status: 'Active', lastLogin: '22 Jun 2025 13:50' },
    { username: 'operator3', fullName: 'Operator Three', email: 'operator3@company.com', role: 'Operator', status: 'Inactive', lastLogin: '15 Jun 2025 17:40' },
    { username: 'admin2', fullName: 'Administrator Two', email: 'admin2@company.com', role: 'Administrator', status: 'Active', lastLogin: '24 Jun 2025 08:20' },
    { username: 'viewer2', fullName: 'Viewer Two', email: 'viewer2@company.com', role: 'Viewer', status: 'Active', lastLogin: '21 Jun 2025 15:10' }
];

const dummyRoles = [
    { name: 'Administrator', desc: 'Full access to all system features and settings.', users: 2 },
    { name: 'Supervisor', desc: 'Can manage vessels, geofences, and alerts.', users: 3 },
    { name: 'Operator', desc: 'Can monitor vessels and acknowledge alerts.', users: 8 },
    { name: 'Analyst', desc: 'Access to analytics and history playback.', users: 2 },
    { name: 'Viewer', desc: 'Read-only access to dashboard and map.', users: 3 }
];

// Removed dummyPermissions

function initSettings() {
    renderUsersTable();
    renderRolesTable();
    loadPermissions();

    // Tab Logic
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.color = 'var(--text-secondary)';
            });
            const clicked = e.target;
            clicked.classList.add('active');
            clicked.style.color = 'var(--primary-blue)';

            document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.add('view-hidden'));
            document.getElementById(`settings-tab-${clicked.dataset.tab}`).classList.remove('view-hidden');
        });
    });


    // Global click for action dropdown
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('action-dropdown');
        if (e.target.closest('.btn-action-dots')) {
            const btn = e.target.closest('.btn-action-dots');
            const rect = btn.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            dropdown.style.left = `${rect.left + window.scrollX - 120}px`;
            dropdown.classList.remove('view-hidden');
        } else if (!e.target.closest('#action-dropdown') && !dropdown.classList.contains('view-hidden')) {
            dropdown.classList.add('view-hidden');
        }
    });

    isSettingsInitialized = true;
}


function renderRolesTable() {
    const tbody = document.getElementById('roles-table-body');
    tbody.innerHTML = dummyRoles.map(r => `
        <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.desc}</td>
            <td>${r.users} users</td>
            <td style="text-align: center;"><button class="btn-action-dots" style="background:none; border:none; cursor:pointer; color:var(--text-secondary);"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
        </tr>
    `).join('');
}

let permissionsList = [];
let isPermissionsEditMode = false;

async function loadPermissions() {
    try {
        const response = await fetch('/api/permissions');
        if (response.ok) {
            permissionsList = await response.json();
            renderPermissionsTable();
        }
    } catch (err) {
        console.error('Error loading permissions:', err);
    }
}

window.togglePermission = function(moduleName, role) {
    if (!isPermissionsEditMode) return;
    const perm = permissionsList.find(p => p.module === moduleName);
    if (perm) {
        perm[role] = !perm[role];
        renderPermissionsTable();
    }
};

function renderPermissionsTable() {
    const tbody = document.getElementById('permissions-table-body');
    const check = '<i class="fa-solid fa-check" style="color: var(--status-green);"></i>';
    const cross = '<i class="fa-solid fa-minus" style="color: #cbd5e1;"></i>';
    
    tbody.innerHTML = permissionsList.map(p => {
        const cellStyle = isPermissionsEditMode ? 'text-align: center; cursor: pointer; border: 1px dashed var(--border-color);' : 'text-align: center;';
        return `
        <tr>
            <td><strong>${p.module}</strong></td>
            <td style="${cellStyle}" onclick="togglePermission('${p.module}', 'admin')">${p.admin ? check : cross}</td>
            <td style="${cellStyle}" onclick="togglePermission('${p.module}', 'operator')">${p.operator ? check : cross}</td>
            <td style="${cellStyle}" onclick="togglePermission('${p.module}', 'supervisor')">${p.supervisor ? check : cross}</td>
            <td style="${cellStyle}" onclick="togglePermission('${p.module}', 'analyst')">${p.analyst ? check : cross}</td>
            <td style="${cellStyle}" onclick="togglePermission('${p.module}', 'viewer')">${p.viewer ? check : cross}</td>
        </tr>
    `}).join('');
}

// --- USER MANAGEMENT CRUD ---
let usersList = [];

async function loadUsers() {
    try {
        const res = await fetch('/api/users');
        usersList = await res.json();
        renderUsersTable();
    } catch (e) {
        console.error('Failed to load users:', e);
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    if (usersList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = usersList.map(u => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 16px 24px;">${u.id}</td>
            <td style="padding: 16px 24px;"><strong>${u.username}</strong></td>
            <td style="padding: 16px 24px;"><span class="badge ${u.role === 'admin' ? 'red-badge' : 'badge-default'}">${u.role.toUpperCase()}</span></td>
            <td style="padding: 16px 24px;">${u.created_by || '-'}</td>
            <td style="padding: 16px 24px;">${new Date(u.created_at).toLocaleString()}</td>
            <td style="padding: 16px 24px; text-align: center;">
                <button class="ui-btn btn-outline" style="padding: 4px 8px;" onclick="openEditUserModal(${u.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="ui-btn btn-outline" style="padding: 4px 8px; color: var(--status-red); border-color: var(--status-red);" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function initUserManagement() {
    const btnAddUser = document.getElementById('btn-add-user');
    const userModal = document.getElementById('user-modal');
    const closeUserModal = document.getElementById('close-user-modal');
    const cancelUserModal = document.getElementById('cancel-user-modal');
    const userForm = document.getElementById('user-form');
    
    if(btnAddUser) {
        btnAddUser.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Add User button clicked!");
            document.getElementById('user-modal-title').innerText = 'Add New User';
            document.getElementById('user-id').value = '';
            document.getElementById('user-username').value = '';
            document.getElementById('user-username').readOnly = false;
            document.getElementById('user-password').value = '';
            document.getElementById('user-password').required = true;
            document.getElementById('user-password-hint').style.display = 'none';
            document.getElementById('user-role').value = 'viewer';
            userModal.classList.remove('view-hidden');
        });
    }
    
    const closeModal = () => userModal.classList.add('view-hidden');
    if(closeUserModal) closeUserModal.addEventListener('click', closeModal);
    if(cancelUserModal) cancelUserModal.addEventListener('click', closeModal);

    // --- PERMISSIONS CRUD ---
    const btnEditPerms = document.getElementById('btn-edit-permissions');
    const btnSavePerms = document.getElementById('btn-save-permissions');
    
    if (btnEditPerms) {
        btnEditPerms.addEventListener('click', () => {
            isPermissionsEditMode = true;
            btnEditPerms.classList.add('view-hidden');
            btnSavePerms.classList.remove('view-hidden');
            renderPermissionsTable();
        });
    }

    if (btnSavePerms) {
        btnSavePerms.addEventListener('click', async () => {
            const updates = [];
            const roles = ['admin', 'operator', 'supervisor', 'analyst', 'viewer'];
            permissionsList.forEach(p => {
                roles.forEach(r => {
                    updates.push({ module: p.module, role: r, is_granted: p[r] });
                });
            });

            try {
                const response = await fetch('/api/permissions', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                if (response.ok) {
                    showToast('Success', 'Permissions updated successfully');
                    isPermissionsEditMode = false;
                    btnSavePerms.classList.add('view-hidden');
                    btnEditPerms.classList.remove('view-hidden');
                    renderPermissionsTable();
                } else {
                    alert('Error saving permissions');
                }
            } catch (err) {
                alert('Error saving permissions');
            }
        });
    }
    if(cancelUserModal) cancelUserModal.addEventListener('click', closeModal);
    
    if(userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('user-id').value;
            const username = document.getElementById('user-username').value;
            const password = document.getElementById('user-password').value;
            const role = document.getElementById('user-role').value;
            
            let currentUser = 'system';
            const userNameEl = document.querySelector('.user-name');
            if(userNameEl && !userNameEl.classList.contains('role-selector')) {
                currentUser = userNameEl.innerText;
            }
            
            try {
                if (id) {
                    // Update
                    await fetch('/api/users/' + id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role, password })
                    });
                    showToast('User Updated', 'User role updated successfully');
                } else {
                    // Create
                    await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password, role, created_by: currentUser })
                    });
                    showToast('User Created', 'New user added successfully');
                }
                closeModal();
                loadUsers();
            } catch (err) {
                alert('Error saving user: ' + err.message);
            }
        });
    }
}

window.openEditUserModal = function(id) {
    const user = usersList.find(u => u.id === id);
    if(!user) return;
    
    document.getElementById('user-modal-title').innerText = 'Edit User';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-username').readOnly = true;
    document.getElementById('user-password').value = '';
    document.getElementById('user-password').required = false;
    document.getElementById('user-password-hint').style.display = 'block';
    document.getElementById('user-role').value = user.role;
    
    document.getElementById('user-modal').classList.remove('view-hidden');
};

window.deleteUser = async function(id) {
    if(!confirm('Are you sure you want to delete this user?')) return;
    try {
        await fetch('/api/users/' + id, { method: 'DELETE' });
        showToast('User Deleted', 'User has been removed');
        loadUsers();
    } catch (err) {
        alert('Error deleting user');
    }
};

// Start
initUserManagement();
init();

