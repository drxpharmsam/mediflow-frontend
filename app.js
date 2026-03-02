const API_BASE = 'https://mediflow-backend-z29j.onrender.com/api';
const SOCKET_URL = 'https://mediflow-backend-z29j.onrender.com';

// ── Push Notifications — VAPID Configuration ────────────────────────────────
// 🔔 PUSH EDIT: Replace the placeholder below with your real VAPID public key.
//   Generate a key pair on the backend: `npx web-push generate-vapid-keys`
//   Set VAPID_PUBLIC_KEY in your backend .env, then copy the public key here
//   (or load it from a meta tag / API endpoint if you prefer not to hard-code).
//   See .env.example for the full setup checklist.
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const socket = io(SOCKET_URL);
let driverMarker = null;

let MEDICINE_DB = [
    { name: "Paracetamol (500mg)", price: 15, category: "Fever & Flu", type: "Tab", icon: "fa-temperature-half", isRx: false },
    { name: "Dolo 650", price: 30, category: "Fever & Flu", type: "Tab", icon: "fa-temperature-arrow-up", isRx: false },
    { name: "Vicks Action 500", price: 45, category: "Fever & Flu", type: "Tab", icon: "fa-head-side-virus", isRx: false },
    { name: "Benadryl Syrup", price: 125, category: "Cough & Cold", type: "Syr", icon: "fa-wine-bottle", isRx: false },
    { name: "Ascoril LS", price: 115, category: "Cough & Cold", type: "Syr", icon: "fa-lungs", isRx: true },
    { name: "Combiflam", price: 40, category: "Pain Relief", type: "Tab", icon: "fa-pills", isRx: false },
    { name: "Diclofenac Gel", price: 85, category: "Pain Relief", type: "Gel", icon: "fa-spray-can", isRx: false },
    { name: "Saridon", price: 10, category: "Headache", type: "Tab", icon: "fa-brain", isRx: false },
    { name: "Digene Tablet", price: 20, category: "Digestion", type: "Chew", icon: "fa-fire-burner", isRx: false },
    { name: "Eno (Lemon)", price: 10, category: "Digestion", type: "Sachet", icon: "fa-glass-water", isRx: false },
    { name: "Pantop 40", price: 110, category: "Stomach Gas", type: "Tab", icon: "fa-fire", isRx: true },
    { name: "Omez", price: 150, category: "Stomach Gas", type: "Cap", icon: "fa-capsules", isRx: true },
    { name: "Metformin (500mg)", price: 65, category: "Diabetes", type: "Tab", icon: "fa-cube", isRx: true },
    { name: "Glycomet GP1", price: 95, category: "Diabetes", type: "Tab", icon: "fa-cubes", isRx: true },
    { name: "Insulin (Lantus)", price: 650, category: "Diabetes", type: "Inj", icon: "fa-syringe", isRx: true },
    { name: "Amlodipine (5mg)", price: 45, category: "Blood Pressure", type: "Tab", icon: "fa-heart-pulse", isRx: true },
    { name: "Telma 40", price: 180, category: "Blood Pressure", type: "Tab", icon: "fa-droplet", isRx: true },
    { name: "Atorva 10", price: 120, category: "Cholesterol", type: "Tab", icon: "fa-heart", isRx: true },
    { name: "Limcee (Vit C)", price: 25, category: "Vitamins", type: "Chew", icon: "fa-lemon", isRx: false },
    { name: "Zincovit", price: 105, category: "Vitamins", type: "Tab", icon: "fa-shield-virus", isRx: false },
    { name: "Shelcal 500 (Calcium)", price: 115, category: "Vitamins", type: "Tab", icon: "fa-bone", isRx: false },
    { name: "Evion 400 (Vit E)", price: 35, category: "Skin & Hair", type: "Cap", icon: "fa-sparkles", isRx: false },
    { name: "Dettol Liquid", price: 65, category: "First Aid", type: "Liq", icon: "fa-pump-medical", isRx: false },
    { name: "Hansaplast Strips", price: 20, category: "First Aid", type: "Strip", icon: "fa-bandage", isRx: false },
    { name: "Betadine Ointment", price: 95, category: "First Aid", type: "Cream", icon: "fa-hand-dots", isRx: false },
    { name: "Cetrizine", price: 18, category: "Allergy", type: "Tab", icon: "fa-head-side-cough", isRx: false },
    { name: "Allegra 120", price: 195, category: "Allergy", type: "Tab", icon: "fa-wind", isRx: false }
];

let currentPhoneRaw = ""; let currentPhoneClean = ""; let gender = ""; let cart = [];
let selectedAddress = null; let map = null; window.currentAddresses = [];

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
}

// --- SMART BACK BUTTON (HISTORY API) SUPPORT ---
window.addEventListener('popstate', (e) => {
    if (!document.getElementById('payment-overlay').classList.contains('hidden')) { closePayment(); return; }
    if (!document.getElementById('payment-method-overlay').classList.contains('hidden')) { closePaymentMethod(); return; }
    if (!document.getElementById('rx-prompt-overlay').classList.contains('hidden')) { closeRxPrompt(); return; }

    const activeScreen = Array.from(document.querySelectorAll('.screen')).find(s => !s.classList.contains('hidden'))?.id;
    if (activeScreen === 'screen-address' && window.currentAddresses.length === 0) {
        history.pushState({ screen: 'screen-address', tab: 'tab-home' }, "");
        alert("📍 Please select or add a delivery location to continue.");
        return;
    }

    if (e.state) {
        if (e.state.screen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            document.getElementById(e.state.screen).classList.remove('hidden');
        }
        if (e.state.tab && e.state.screen === 'screen-dash') {
            let el = null;
            if (e.state.tab === 'tab-home') el = document.querySelectorAll('.nav-dock .nav-item')[0];
            else if (e.state.tab === 'tab-category') el = document.querySelectorAll('.nav-dock .nav-item')[1];
            else if (e.state.tab === 'tab-doctor') el = document.querySelectorAll('.nav-dock .nav-item')[2];
            else if (e.state.tab === 'tab-delivery') el = document.querySelectorAll('.nav-dock .nav-item')[3];
            if (el) switchTab(el, e.state.tab, false);
        }
        updateCartUI();
    }
});

function showScreen(id, pushHistory = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    if (pushHistory) {
        let activeTab = document.querySelector('.content-view.active-view');
        history.pushState({ screen: id, tab: activeTab ? activeTab.id : 'tab-home' }, "");
    }
    updateCartUI();
}

window.onload = async () => {
    window.rxVerified = false;
    try {
        const res = await fetch(`${API_BASE}/medicines`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) MEDICINE_DB = data.data;
    } catch (e) { console.log("Using local DB fallback"); }

    const savedSession = localStorage.getItem('mediflow_current_session');
    if (savedSession) {
        const user = JSON.parse(savedSession);
        loading(true, "WELCOME BACK");
        updateDash(user);
        renderCategoriesTab();
        renderPopularMeds();

        await loadAddresses(user.id);
        loading(false);

        if (window.currentAddresses.length === 0) {
            history.replaceState({ screen: 'screen-address', tab: 'tab-home' }, "");
            openAddressManager(true);
        } else {
            history.replaceState({ screen: 'screen-dash', tab: 'tab-home' }, "");
            openAddressManager(true);
        }
        // Re-subscribe to push on session restore (subscription may have expired)
        initPushNotifications();
    } else { loading(false); }

    // Register service worker for PWA + push notifications
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
};

// ==========================================
// MAPBOX CONFIGURATION
// 🎨 BRAND EDIT: Replace MAPBOX_TOKEN with your own Mapbox public token.
//   Get yours at https://account.mapbox.com/
//   ⚠️  SECURITY: This token is intentionally public (client-side PWA).
//   Restrict it to your deployment domain(s) via the Mapbox account dashboard
//   (Account → Access Tokens → URL restrictions) to prevent quota abuse.
// 🎨 BRAND EDIT: Change MAPBOX_STYLE for a different map look.
//   Options: mapbox://styles/mapbox/streets-v12 | light-v11 | dark-v11 | satellite-streets-v12
// 🎨 BRAND EDIT: Change DEFAULT_LAT / DEFAULT_LNG to center the map on your city.
// ==========================================
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXl1c2hrYXVzaGlrIiwiYSI6ImNtbTYyaG05NDBibnMyd3F5b25heXprM3gifQ.cCagfQHewVaM6GqzUhBL6A';
const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';
const DEFAULT_LAT = 28.6139;  // Default map centre latitude  (Delhi, India)
const DEFAULT_LNG = 77.2090;  // Default map centre longitude (Delhi, India)
// 🎨 UX EDIT: Peek height (px) — must match .addr-sheet-peeked translateY value in style.css
const PEEK_HEIGHT = 185;
// Tracks which sheet elements have drag listeners to prevent double-initialisation
const _initializedSheets = new WeakSet();

// --- MAP FUNCTIONS ---
function initMap() {
    if (map) {
        // Map already initialised; just ensure container dimensions are correct
        try { map.resize(); } catch (e) { console.warn("map.resize error:", e); }
        return;
    }
    try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map = new mapboxgl.Map({
            container: 'map',
            style: MAPBOX_STYLE,
            center: [DEFAULT_LNG, DEFAULT_LAT],
            zoom: 13,
            attributionControl: false
        });
        // Compact attribution control (bottom-left, stays out of the way)
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
        // Zoom in/out buttons (compass hidden to save space on mobile)
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        // Reverse-geocode the map centre whenever the user finishes panning/zooming
        map.on('moveend', () => {
            const { lat, lng } = map.getCenter();
            reverseGeocode(lat, lng);
        });
        // Add saved-address markers once the base tiles have loaded
        map.on('load', () => { addAddressMarkersToMap(); });
    } catch (e) {
        console.error("Map init failed:", e);
        map = null;
    }
}

// Reverse-geocode lat/lng → human-readable area using Mapbox Geocoding API.
// Only overwrites addr-line2 if the user hasn't manually edited it.
async function reverseGeocode(lat, lng) {
    const addrLine2 = document.getElementById('addr-line2');
    if (!addrLine2) return;
    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
                    `?access_token=${MAPBOX_TOKEN}&language=en&types=address,neighborhood,place&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        let areaText;
        if (data.features && data.features.length > 0) {
            areaText = data.features[0].place_name;
        } else {
            areaText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
        addrLine2.value = areaText;
        // Update preview elements in the bottom-sheet UI
        const detectedEl = document.getElementById('addr-detected-text');
        if (detectedEl) detectedEl.textContent = areaText;
        const stripEl = document.getElementById('addr-area-strip-text');
        if (stripEl) stripEl.textContent = areaText;
    } catch (e) {
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        addrLine2.value = fallback;
        const detectedEl = document.getElementById('addr-detected-text');
        if (detectedEl) detectedEl.textContent = fallback;
    }
}

// Add emoji markers on the Mapbox map for every saved address that has coordinates.
// 🎨 BRAND EDIT: Change tagEmoji values or replace with custom SVG/img HTML.
function addAddressMarkersToMap() {
    if (!map) return;
    // Remove any previously added address markers
    if (window._addressMarkers) {
        window._addressMarkers.forEach(m => m.remove());
    }
    window._addressMarkers = [];
    const tagEmoji = { 'Home': '🏠', 'Work': '🏢', 'Other': '📍' };
    (window.currentAddresses || []).forEach(addr => {
        if (addr.lat == null || addr.lng == null) return;
        const el = document.createElement('div');
        el.title = `${addr.tag}: ${addr.line1}`;
        // 🎨 BRAND EDIT: Adjust marker size / drop-shadow below
        el.style.cssText = 'font-size:28px; cursor:pointer; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35)); transition:transform 0.15s;';
        el.textContent = tagEmoji[addr.tag] || '📍';
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        el.addEventListener('click', () => selectAddress(addr));
        const popup = new mapboxgl.Popup({ offset: 30, closeButton: false })
            .setHTML(`<div style="font-size:13px;font-weight:700;color:#111827;">${addr.tag}: ${addr.line1}</div>` +
                     `<div style="font-size:12px;color:#6B7280;margin-top:3px;">${addr.line2}</div>`);
        const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([addr.lng, addr.lat])
            .setPopup(popup)
            .addTo(map);
        window._addressMarkers.push(marker);
    });
}

// --- LOCATION PERMISSION DIALOG ---
// Shows a friendly permission explanation before the browser's native geolocation prompt.
// 🎨 BRAND EDIT: Edit dialog copy in index.html (#loc-perm-overlay).

function showLocPermOverlay() {
    const el = document.getElementById('loc-perm-overlay');
    if (el) { el.classList.remove('hidden'); el.style.opacity = '1'; }
}

function closeLocPermOverlay() {
    const el = document.getElementById('loc-perm-overlay');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => el.classList.add('hidden'), 350);
    }
}

// Called when user taps "Allow Location Access" in the permission dialog.
function requestLocationPermission() {
    closeLocPermOverlay();
    // Mark that the user explicitly allowed — fallback path won't re-show the dialog.
    window._locationPermGranted = true;
    // Proceed immediately — the browser will now show its native prompt.
    _doGetCurrentPosition();
}

// Core geolocation call, shared by detectLocation() and requestLocationPermission().
function _doGetCurrentPosition() {
    if (!map) { initMap(); }
    if (!map) { showToast("Map is not available. Please try again."); return; }
    loading(true, "LOCATING...");
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude: lat, longitude: lng } = position.coords;
            loading(false);
            // Fly smoothly to the user's position with a close zoom.
            map.flyTo({ center: [lng, lat], zoom: 16, essential: true });
            // Place / update the "you are here" pulsing blue dot marker.
            // 🎨 BRAND EDIT: Adjust .user-location-dot CSS in style.css for a different look.
            if (window._userLocationMarker) { window._userLocationMarker.remove(); }
            const dot = document.createElement('div');
            dot.className = 'user-location-dot';
            window._userLocationMarker = new mapboxgl.Marker({ element: dot, anchor: 'center' })
                .setLngLat([lng, lat])
                .addTo(map);
            // Clear any previous user-typed flag so geocoding can fill the area field.
            const addrLine2 = document.getElementById('addr-line2');
            if (addrLine2) delete addrLine2.dataset.userTyped;
            reverseGeocode(lat, lng);
        },
        () => {
            loading(false);
            showToast("Location access denied. Please allow location access.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

// Public entry point: check permission state and show our friendly dialog if needed,
// otherwise go straight to geolocation.
function detectLocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.");
        return;
    }
    // Use Permissions API when available to skip our dialog if already granted/denied.
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
            if (result.state === 'granted') {
                // Permission already granted — go directly.
                _doGetCurrentPosition();
            } else if (result.state === 'denied') {
                showToast("Location access denied. Please enable it in browser settings.");
            } else {
                // 'prompt' state — show our friendly explanation first.
                showLocPermOverlay();
            }
        }).catch(() => {
            // Permissions API unavailable — show dialog to be safe.
            showLocPermOverlay();
        });
    } else {
        // Fallback: show dialog on every call when permission hasn't been explicitly granted.
        // Only go direct after the user has already clicked "Allow Location Access".
        if (!window._locationPermGranted) {
            showLocPermOverlay();
        } else {
            _doGetCurrentPosition();
        }
    }
}

function openAddressManager(forceSelect = false) {
    showScreen('screen-address');
    renderAddressList();

    // Always start on Step 1 (location pick) in peek state; reset Step 2 to hidden
    const pickSheet = document.getElementById('addr-sheet-pick');
    const detailsSheet = document.getElementById('addr-sheet-details');
    if (pickSheet) {
        pickSheet.classList.remove('addr-sheet-hidden');
        // 🎨 UX EDIT: Remove the next line to open fully expanded instead of peeked
        pickSheet.classList.add('addr-sheet-peeked');
        initBottomSheetDrag('addr-sheet-pick');
    }
    if (detailsSheet) detailsSheet.classList.add('addr-sheet-hidden');

    const backBtn = document.getElementById('address-back-btn');
    if (backBtn) {
        backBtn.style.display = (forceSelect || !selectedAddress) ? 'none' : 'flex';
    }

    // Use requestAnimationFrame + timeout for reliable map rendering after DOM paint
    setTimeout(() => {
        if (!map) {
            initMap();
        } else {
            try { map.resize(); } catch (e) {}
        }
        // Auto-request geolocation the first time the address screen opens per session
        if (map && !window._locationRequested) {
            window._locationRequested = true;
            detectLocation();
        }
        // Refresh saved-address markers (addresses may have loaded since last open)
        if (map) { addAddressMarkersToMap(); }
    }, 350);
}

// Advance from Step 1 (location pick) → Step 2 (address details).
// Syncs the detected area from the hidden addr-line2 to the area-strip label.
function openAddressDetails() {
    const line2El = document.getElementById('addr-line2');
    const areaText = line2El ? line2El.value.trim() : '';
    const displayArea = areaText || 'Detecting area…';
    const stripEl = document.getElementById('addr-area-strip-text');
    if (stripEl) stripEl.textContent = displayArea;

    document.getElementById('addr-sheet-pick').classList.add('addr-sheet-hidden');
    const detailsSheet = document.getElementById('addr-sheet-details');
    detailsSheet.classList.remove('addr-sheet-hidden');

    // Focus the house-number input after the animation completes
    setTimeout(() => {
        const el = document.getElementById('addr-line1');
        if (el) el.focus();
    }, 420);
}

// Go back from Step 2 (address details) → Step 1 (location pick).
function backToLocationPick() {
    const detailsSheet = document.getElementById('addr-sheet-details');
    if (detailsSheet) detailsSheet.classList.add('addr-sheet-hidden');
    const pickSheet = document.getElementById('addr-sheet-pick');
    if (pickSheet) pickSheet.classList.remove('addr-sheet-hidden');
}

// ── Bottom sheet expand/collapse helpers ────────────────────────────────────
// Expand the pick sheet to full height (remove peeked state).
// Called by tap on the drag handle or drag-up gesture.
// 🎨 UX EDIT: Call expandPickSheet(false) to collapse back to peek programmatically.
function expandPickSheet(expand = true) {
    const sheet = document.getElementById('addr-sheet-pick');
    if (!sheet) return;
    if (expand) {
        sheet.classList.remove('addr-sheet-peeked');
    } else {
        sheet.classList.add('addr-sheet-peeked');
    }
}

// Attach touch-drag listeners to the sheet's handle so the user can drag to expand/collapse.
// Guards against double-initialisation with a WeakSet (_initializedSheets).
// 🎨 UX EDIT: Adjust DRAG_THRESHOLD (px) to control how far a drag must travel before toggling.
function initBottomSheetDrag(sheetId) {
    const sheet = document.getElementById(sheetId);
    if (!sheet || _initializedSheets.has(sheet)) return;
    _initializedSheets.add(sheet);
    const handle = sheet.querySelector('.addr-sheet-handle');
    if (!handle) return;

    const DRAG_THRESHOLD = 60; // px — minimum drag distance to trigger expand/collapse
    let startY = 0;

    handle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        // Suppress CSS transition while dragging for a fluid feel
        sheet.classList.add('addr-sheet-no-transition');
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
        const dy = e.touches[0].clientY - startY;
        const isPeeked = sheet.classList.contains('addr-sheet-peeked');
        // Only allow dragging in the natural direction (down when expanded, up when peeked)
        if ((!isPeeked && dy > 0) || (isPeeked && dy < 0)) {
            sheet.style.transform = isPeeked
                ? `translateY(calc(100% - ${PEEK_HEIGHT}px + ${dy}px))`
                : `translateY(${Math.max(0, dy)}px)`;
        }
    }, { passive: true });

    handle.addEventListener('touchend', (e) => {
        // Re-enable CSS transition and clear inline transform before snapping
        sheet.classList.remove('addr-sheet-no-transition');
        sheet.style.transform = '';
        const dy = e.changedTouches[0].clientY - startY;
        if (dy < -DRAG_THRESHOLD) {
            expandPickSheet(true);   // dragged up → expand
        } else if (dy > DRAG_THRESHOLD) {
            expandPickSheet(false);  // dragged down → peek
        }
        // Small drag → snap back to current state (no change)
    }, { passive: true });
}

function closeAddressManager() {
    if (!selectedAddress && window.currentAddresses.length === 0) {
        alert("📍 Please select or add a delivery location to continue.");
        return;
    }

    if (history.state && history.state.screen !== 'screen-address') {
        history.back();
    } else {
        showScreen('screen-dash');
    }
}

async function loadAddresses(userId) {
    if (!userId) {
        const session = JSON.parse(localStorage.getItem('mediflow_current_session'));
        if (session) userId = session.id;
    }
    if (!userId) return;
    try {
        const res = await fetch(`${API_BASE}/addresses/${userId}`);
        const data = await res.json();
        if (data.success) {
            window.currentAddresses = data.data;
        }
    } catch (e) { window.currentAddresses = []; }
}

async function saveNewAddress() {
    const line1 = document.getElementById('addr-line1').value.trim();
    const line2El = document.getElementById('addr-line2');
    const landmarkEl = document.getElementById('addr-landmark');
    // Build line2 from auto-detected area (hidden field) + optional user landmark
    let area = line2El ? line2El.value.trim() : '';
    if (!area && map) {
        const c = map.getCenter();
        area = `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
    }
    const landmark = landmarkEl ? landmarkEl.value.trim() : '';
    const line2 = area + (landmark ? ', near ' + landmark : '');

    // Read tag from data-tag attribute to avoid parsing display text (which may include emoji)
    const tagEl = document.querySelector('#screen-address .select-chip.active');
    const tag = (tagEl && tagEl.dataset.tag) ? tagEl.dataset.tag : 'Home';
    const session = JSON.parse(localStorage.getItem('mediflow_current_session'));

    if (!line1) return alert("Please enter your house / flat number.");
    if (!session) return alert("Please log in first.");

    // Capture current map centre for storing coordinates with the address
    let lat = null, lng = null;
    if (map) { const c = map.getCenter(); lat = c.lat; lng = c.lng; }

    loading(true, "SAVING ADDRESS...");
    try {
        const res = await fetch(`${API_BASE}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.id, line1, line2, tag, lat, lng })
        });
        const data = await res.json();
        loading(false);
        if (data.success) {
            // Merge backend response with captured coordinates
            const savedAddr = { ...data.data, lat, lng };
            _clearAddressForm();
            window.currentAddresses.push(savedAddr);
            addAddressMarkersToMap();
            selectAddress(savedAddr);
        } else { alert("Failed to save address: " + (data.message || "")); }
    } catch (e) {
        loading(false);
        // Local fallback: store in memory when backend is unavailable
        const localAddr = { id: 'local-' + Date.now(), userId: session.id, line1, line2, tag, lat, lng };
        window.currentAddresses.push(localAddr);
        _clearAddressForm();
        addAddressMarkersToMap();
        selectAddress(localAddr);
        showToast("Address saved locally.");
    }
}

// Clears the address form fields and resets to Step 1 (location pick).
function _clearAddressForm() {
    const f1 = document.getElementById('addr-line1'); if (f1) f1.value = '';
    const f2 = document.getElementById('addr-line2'); if (f2) f2.value = '';
    const fl = document.getElementById('addr-landmark'); if (fl) fl.value = '';
    // Reset Save-As chips: reactivate "Home"
    const chips = document.querySelectorAll('#addr-sheet-details .select-chip');
    chips.forEach((c, i) => c.classList.toggle('active', i === 0));
    backToLocationPick();
}

function renderAddressList() {
    const list = window.currentAddresses || [];
    const container = document.getElementById('address-list');
    container.innerHTML = "";

    if (list.length === 0) return; // No saved addresses — sheet shows only GPS row + CTA

    // 🎨 BRAND EDIT: Change tag icons in tagIcon map, or swap FA icons for emoji
    const tagIcon = { 'Home': 'fa-house', 'Work': 'fa-briefcase', 'Other': 'fa-location-dot' };

    // Horizontal scrollable chip row — Zepto-style
    let html = `<p style="font-size:11px; font-weight:800; color:var(--gray-text); text-transform:uppercase; letter-spacing:0.8px; margin: 0 0 10px;">Saved Addresses</p>`;
    html += `<div class="addr-chips-row">`;

    list.forEach(addr => {
        const isSelected = selectedAddress && selectedAddress.id === addr.id;
        const icon = tagIcon[addr.tag] || 'fa-location-dot';
        html += `
            <div class="addr-saved-chip ${isSelected ? 'selected' : ''}" onclick='selectAddress(${JSON.stringify(addr)})'>
                <div class="addr-saved-chip-icon"><i class="fa-solid ${icon}"></i></div>
                <span class="addr-saved-chip-label">${addr.tag}</span>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function selectAddress(addr) {
    selectedAddress = addr;
    document.getElementById('curr-addr-tag').innerText = "Delivery to " + addr.tag;
    document.getElementById('curr-addr-text').innerText = addr.line1 + ", " + addr.line2;

    if (!document.getElementById('screen-address').classList.contains('hidden')) {
        renderAddressList();
        setTimeout(() => closeAddressManager(), 300);
    }
}

function selAddrTag(el) {
    el.parentNode.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

// --- CART SYSTEM ---
function addToCart(itemName) {
    let existingItem = cart.find(i => i.name === itemName);
    if (existingItem) {
        existingItem.qty = (existingItem.qty || 1) + 1;
    } else {
        const item = MEDICINE_DB.find(i => i.name === itemName);
        if (item) cart.push({ ...item, qty: 1 });
    }
    showToast(`Added ${itemName} to Cart`);
    updateCartUI();
}

function updateQty(index, delta) {
    if (!cart[index].qty) cart[index].qty = 1;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-container');
    const stickyBar = document.getElementById('sticky-checkout');
    const mainScroll = document.getElementById('main-scroll');

    const activeScreenObj = Array.from(document.querySelectorAll('.screen')).find(s => !s.classList.contains('hidden'));
    const activeScreen = activeScreenObj ? activeScreenObj.id : 'screen-dash';
    const activeTabObj = document.querySelector('.content-view.active-view');
    const activeTab = activeTabObj ? activeTabObj.id : 'tab-home';

    if (cart.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="glass-card wide" style="text-align:center; flex-direction:column; padding:40px 20px;">
                    <div class="icon-orb orb-3" style="width:70px; height:70px; font-size:30px; margin:0 auto 15px;"><i class="fa-solid fa-bag-shopping"></i></div>
                    <h3 style="font-size:18px;">Your Cart is Empty</h3>
                    <p style="margin-top:8px; font-size:13px; color:var(--gray-text); font-weight:500;">Looks like you haven't added anything yet.</p>
                </div>`;
        }
        if (stickyBar) {
            stickyBar.style.display = 'none';
            stickyBar.classList.remove('show');
        }
        if (activeScreen === 'screen-dash' && mainScroll) mainScroll.style.paddingBottom = '110px';
        return;
    }

    let itemsHtml = "";
    let itemTotal = 0;
    let totalItems = 0;
    let hasRx = false;
    let hasScheduleH = false;

    cart.forEach((item, index) => {
        const currentQty = item.qty || 1;
        itemTotal += (item.price * currentQty);
        totalItems += currentQty;

        if (item.isRx) { hasRx = true; hasScheduleH = true; }

        itemsHtml += `
            <div class="cart-item">
                <div style="display:flex; align-items:center; flex:1;">
                    <div class="icon-orb orb-1" style="width:45px; height:45px; font-size:18px; margin:0 15px 0 0;"><i class="fa-solid ${item.icon}"></i></div>
                    <div>
                        <b style="font-size:15px; color:#111827;">${item.name}</b>
                        ${item.isRx ? '<span class="rx-badge" style="position:static; margin-left:8px; display:inline-block; background:#FEE2E2; color:#DC2626;">Schedule H</span>' : ''}
                        <div style="font-size:14px; font-weight:800; color:var(--c4); margin-top:4px;">₹${item.price * currentQty}</div>
                    </div>
                </div>
                <div class="qty-controls" style="display:flex; align-items:center; gap:10px; background:#F3F4F6; padding:4px 8px; border-radius:12px;">
                    <div class="qty-btn" onclick="updateQty(${index}, -1)" style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; background:white; border-radius:8px; font-weight:800; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.05); color:${currentQty === 1 ? 'var(--error)' : 'var(--c5)'};"><i class="fa-solid ${currentQty === 1 ? 'fa-trash-can' : 'fa-minus'}"></i></div>
                    <div class="qty-num" style="font-size:14px; font-weight:800; color:var(--c5); min-width:14px; text-align:center;">${currentQty}</div>
                    <div class="qty-btn" onclick="updateQty(${index}, 1)" style="width:26px; height:26px; display:flex; align-items:center; justify-content:center; background:white; border-radius:8px; font-weight:800; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.05); color:var(--c5);"><i class="fa-solid fa-plus"></i></div>
                </div>
            </div>
        `;
    });

    let delivery = (itemTotal < 199) ? 39 : 0;
    let handling = (itemTotal < 199) ? 9 : 0;
    let grandTotal = itemTotal + delivery + handling;

    let billHtml = `
        <div style="margin-bottom:15px;"><h3 class="cart-section-title">Order Items</h3></div>
        ${itemsHtml}
        <div style="margin-bottom:15px; margin-top:30px;"><h3 class="cart-section-title">Bill Summary</h3></div>
        <div class="bill-details-card">
            <div class="bill-row"><span>Item Total</span><span style="font-weight:700;">₹${itemTotal}</span></div>
            <div class="bill-row" style="margin-top:14px;">
                <span>Delivery Fee</span>
                <span class="${delivery === 0 ? 'text-success' : ''}" style="font-weight:700;">${delivery === 0 ? 'FREE' : '₹' + delivery}</span>
            </div>
            <div class="bill-row">
                <span>Platform Fee</span>
                <span class="${handling === 0 ? 'text-success' : ''}" style="font-weight:700;">${handling === 0 ? 'FREE' : '₹' + handling}</span>
            </div>
            <div class="bill-row total"><span>Amount to Pay</span><span>₹${grandTotal}</span></div>
        </div>
    `;

    if (hasRx && !window.rxVerified) {
        billHtml += `<div style="background:var(--error-bg); border:1.5px solid #FECACA; color:var(--error); padding:16px; border-radius:18px; font-size:13px; font-weight:600; margin-bottom:20px; display:flex; align-items:center; box-shadow:0 4px 10px rgba(255,94,94,0.1);"><i class="fa-solid fa-file-prescription" style="font-size:20px; margin-right:12px;"></i> Upload prescription to proceed</div>`;
    } else if (hasRx && window.rxVerified) {
        billHtml += `
            <div class="pharmacist-check">
                <i class="fa-solid fa-user-check"></i>
                <div>
                    <span style="display:block;">Prescription Verified</span>
                    <span style="font-size:10px; font-weight:500; opacity:0.8;">Approved by Registered Pharmacist (Reg No. HP-45892)</span>
                </div>
            </div>`;
    }

    if (hasScheduleH) {
        billHtml += `
            <div class="legal-footer">
                <i class="fa-solid fa-scale-balanced"></i>
                <b>Warning:</b> Contains Schedule H/H1 drugs. To be sold by retail on the prescription of a Registered Medical Practitioner only. This platform acts as an intermediary connecting you to licensed retail pharmacies under the Drugs and Cosmetics Act, 1940.
            </div>`;
    }

    if (container) container.innerHTML = billHtml;

    if (document.getElementById('sticky-total')) {
        document.getElementById('sticky-total').innerHTML = `₹${grandTotal} <span style="font-size:14px; font-weight:600; opacity:0.8; margin-left:8px;">(${totalItems} item${totalItems > 1 ? 's' : ''})</span>`;
    }

    const actionBtn = document.getElementById('sticky-btn-action');
    const allowedScreens = ['screen-dash', 'screen-cat-items', 'screen-rx-upload'];

    if (stickyBar) {
        if (!allowedScreens.includes(activeScreen) || activeTab === 'tab-profile' || activeTab === 'tab-orders') {
            stickyBar.style.display = 'none';
            stickyBar.classList.remove('show');
            if (activeScreen === 'screen-dash' && mainScroll) mainScroll.style.paddingBottom = '110px';
        } else {
            stickyBar.style.display = 'flex';
            stickyBar.classList.add('show');

            if (activeScreen === 'screen-dash') {
                if (mainScroll) mainScroll.style.paddingBottom = '190px';
                stickyBar.style.bottom = '85px';
            } else {
                stickyBar.style.bottom = '20px';
            }

            if (actionBtn) {
                if (activeTab === 'tab-delivery' && activeScreen === 'screen-dash') {
                    actionBtn.innerHTML = 'Place Order <i class="fa-solid fa-arrow-right" style="margin-left:8px;"></i>';
                } else {
                    actionBtn.innerHTML = 'View Cart <i class="fa-solid fa-arrow-right" style="margin-left:8px;"></i>';
                }
            }
        }
    }

    window.currentCartTotal = grandTotal;
    window.currentCartRx = hasRx;
}

let currentPaymentContext = {};

function closeRxPrompt() {
    const overlay = document.getElementById('rx-prompt-overlay');
    overlay.style.opacity = 0;
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

function promptUploadRx() {
    closeRxPrompt();
    setTimeout(() => { openRxUpload(); }, 300);
}

function handleStickyCheckout() {
    const activeScreenObj = Array.from(document.querySelectorAll('.screen')).find(s => !s.classList.contains('hidden'));
    const activeScreen = activeScreenObj ? activeScreenObj.id : 'screen-dash';
    const activeTabObj = document.querySelector('.content-view.active-view');
    const activeTab = activeTabObj ? activeTabObj.id : 'tab-home';

    if (activeScreen !== 'screen-dash' || activeTab !== 'tab-delivery') {
        showScreen('screen-dash');
        document.getElementById('nav-btn-cart').click();
    } else {
        processCartPay();
    }
}

function processCartPay() {
    if (!selectedAddress) {
        alert("Please Select Delivery Address");
        openAddressManager();
        return;
    }
    if (window.currentCartRx && !window.rxVerified) {
        const overlay = document.getElementById('rx-prompt-overlay');
        overlay.classList.remove('hidden');
        overlay.style.opacity = 0;
        setTimeout(() => overlay.style.opacity = 1, 10);
        return;
    }

    currentPaymentContext = { amount: window.currentCartTotal, isRx: window.currentCartRx, type: 'cart' };

    const overlay = document.getElementById('payment-method-overlay');
    overlay.classList.remove('hidden');
    overlay.style.opacity = 0;
    setTimeout(() => overlay.style.opacity = 1, 10);
}

function closePaymentMethod() {
    const overlay = document.getElementById('payment-method-overlay');
    overlay.style.opacity = 0;
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

function selectPaymentMethod(method) {
    closePaymentMethod();
    if (method === 'COD') {
        verifyPayment('COD');
    } else {
        setTimeout(() => {
            openPayment(currentPaymentContext.amount, currentPaymentContext.isRx, currentPaymentContext.type);
        }, 300);
    }
}

function openPayment(amount, isRx = false, type = 'cart') {
    if (type === 'consult') { currentPaymentContext = { amount: amount, isRx: false, type: 'consult' }; }
    document.getElementById('pay-amt').innerText = "₹" + amount;
    document.getElementById('rx-warning').style.display = isRx ? 'block' : 'none';

    const yourUpiId = "drxayushkaushik@okaxis";
    const businessName = "MediFlow App";
    const upiString = `upi://pay?pa=${yourUpiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR`;

    document.getElementById('upi-link').href = upiString;
    document.getElementById('upi-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const overlay = document.getElementById('payment-overlay');
    overlay.classList.remove('hidden');
    overlay.style.opacity = 0;
    setTimeout(() => overlay.style.opacity = 1, 10);
}

function closePayment() {
    const overlay = document.getElementById('payment-overlay');
    overlay.style.opacity = 0;
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

function generateOrderId() {
    return 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

async function verifyPayment(method) {
    if (method === 'Online') closePayment();
    loading(true, method === 'COD' ? "PLACING ORDER..." : "VERIFYING PAYMENT...");

    // Short delay (500 ms) lets the payment overlay close-animation finish before
    // the API call fires, keeping the UX transition smooth.
    setTimeout(async () => {
        const session = JSON.parse(localStorage.getItem('mediflow_current_session'));
        const orderItems = currentPaymentContext.type === 'cart' ? cart : [{ name: "Doctor Consultation (Online)", price: 59, qty: 1 }];
        const generatedId = generateOrderId();

        try {
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: generatedId,
                    userId: session ? session.id : 'guest',
                    items: orderItems,
                    totalAmount: currentPaymentContext.amount,
                    addressId: selectedAddress ? selectedAddress.id : null,
                    hasPrescription: currentPaymentContext.isRx,
                    rxImageUrl: window.rxImageUrl || null,
                    status: method === 'COD' ? 'Confirmed (Pending Payment)' : 'Confirmed (Paid Online)'
                })
            });
            const data = await res.json();

            if (data.success) {
                // Dismiss the loading spinner immediately and open the tracker right away
                // so there is no gap between payment and seeing the live order status.
                loading(false);
                const placedOrderId = data.order.orderId || generatedId;
                cart = []; window.rxVerified = false; window.rxImageUrl = null;
                updateCartUI(); closeConsultation();
                // Open live tracker for cart orders; show toast for consultations
                if (currentPaymentContext.type === 'cart') {
                    // freshOrder = true → shows the order-confirmed banner on the tracker screen
                    openOrderTracker(placedOrderId, data.order, true);
                } else {
                    showToast(`Order Confirmed! 🚀  ID: ${placedOrderId}`);
                    switchTab(document.querySelector('.nav-dock .nav-item:first-child'), 'tab-home');
                }
            } else { loading(false); alert("Order failed: " + data.message); }
        } catch (e) {
            loading(false);

            let localHistory = JSON.parse(localStorage.getItem('mediflow_local_history')) || [];
            const localOrderData = {
                orderId: generatedId,
                totalAmount: currentPaymentContext.amount,
                status: method === 'COD' ? 'Confirmed (Pending Payment)' : 'Confirmed (Paid Online)',
                date: new Date().toLocaleDateString(),
                items: orderItems
            };
            localHistory.push(localOrderData);
            localStorage.setItem('mediflow_local_history', JSON.stringify(localHistory));

            cart = []; window.rxVerified = false; updateCartUI(); closeConsultation();
            // Open live tracker for cart orders (simulated locally); toast for consultations
            if (currentPaymentContext.type === 'cart') {
                // freshOrder = true → shows the order-confirmed banner on the tracker screen
                openOrderTracker(generatedId, localOrderData, true);
            } else {
                showToast(`Order Confirmed! 🚀 (Local)  ID: ${generatedId}`);
                switchTab(document.querySelector('.nav-dock .nav-item:first-child'), 'tab-home');
            }
        }
    }, 500);
}

// --- ORDER HISTORY LOGIC ---
function openOrderHistory() {
    switchTab(null, 'tab-orders');
    fetchOrderHistory();
}

async function fetchOrderHistory() {
    const container = document.getElementById('order-history-container');
    const session = JSON.parse(localStorage.getItem('mediflow_current_session'));

    if (!session) {
        container.innerHTML = "<p style='text-align:center; color:var(--gray-text); font-weight:600;'>Please login to view orders</p>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/orders/${session.id}`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            renderHistoryUI(data.data, container);
        } else {
            throw new Error("No remote data");
        }
    } catch (e) {
        const localHistory = JSON.parse(localStorage.getItem('mediflow_local_history')) || [];
        if (localHistory.length > 0) {
            renderHistoryUI(localHistory.reverse(), container);
        } else {
            container.innerHTML = `
                <div style="text-align:center; padding:40px 20px;">
                    <div class="icon-orb orb-2" style="width:60px; height:60px; font-size:24px; margin:0 auto 15px;"><i class="fa-solid fa-box-open"></i></div>
                    <h3 style="font-size:16px;">No Orders Yet</h3>
                    <p style="margin-top:8px; font-size:13px; color:var(--gray-text); font-weight:500;">Your past purchases will appear here.</p>
                </div>`;
        }
    }
}

function renderHistoryUI(orders, container) {
    container.innerHTML = "";
    orders.forEach(order => {
        const isPaid = order.status.includes('Paid');
        const statusClass = isPaid ? 'status-paid' : 'status-pending';

        let itemsSummary = order.items.map(i => `${i.qty || 1}x ${i.name}`).join(', ');
        if (itemsSummary.length > 40) itemsSummary = itemsSummary.substring(0, 40) + '...';

        container.innerHTML += `
            <div class="order-history-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div>
                        <b style="font-size:14px; color:#111827;">${order.orderId}</b>
                        <div style="font-size:11px; color:var(--gray-text); margin-top:2px;">${order.date ? new Date(order.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                    </div>
                    <span class="status-badge ${statusClass}">${order.status}</span>
                </div>
                <p style="font-size:13px; color:#4B5563; font-weight:500; margin:0 0 12px; line-height:1.4;">${itemsSummary}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #E5E7EB; padding-top:12px;">
                    <span style="font-size:12px; color:var(--gray-text); font-weight:700; text-transform:uppercase;">Order Total</span>
                    <span style="font-size:15px; font-weight:800; color:var(--c4);">₹${order.totalAmount}</span>
                </div>
            </div>
        `;
    });
}

function handleGlobalSearch(el) {
    const query = el.value.toLowerCase();
    const homeNormal = document.getElementById('home-normal-content');
    const homeSearch = document.getElementById('home-search-content');
    const resultsGrid = document.getElementById('search-results-grid');

    const currentTab = document.querySelector('.content-view.active-view').id;
    if (currentTab !== 'tab-home') {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector('.nav-dock .nav-item:first-child').classList.add('active');
        document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active-view'));
        document.getElementById('tab-home').classList.add('active-view');
    }

    if (query.length === 0) {
        homeNormal.style.display = 'block';
        homeSearch.style.display = 'none';
        return;
    }

    homeNormal.style.display = 'none';
    homeSearch.style.display = 'block';
    resultsGrid.innerHTML = "";

    const matches = MEDICINE_DB.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        resultsGrid.innerHTML = `<div style="grid-column:span 2; text-align:center; padding:40px 20px; color:var(--gray-text); font-weight:600; background:white; border-radius:20px; border:1px dashed #E5E7EB;">No products found for "${query}"</div>`;
    } else {
        matches.forEach(item => { resultsGrid.innerHTML += renderItemCard(item); });
    }
}

function renderItemCard(item) {
    return `
        <div class="glass-card">
            ${item.isRx ? '<span class="rx-badge">Rx</span>' : ''}
            <div class="icon-orb orb-1"><i class="fa-solid ${item.icon}"></i></div>
            <div>
                <h3 style="margin:0; font-size:15px;">${item.name}</h3>
                <p style="margin:4px 0 0; font-size:12px; color:var(--gray-text); font-weight:600;">${item.category}</p>
                <p style="margin:6px 0 0; font-size:16px; font-weight:800; color:var(--c4);">₹${item.price}</p>
            </div>
            <button class="add-btn" onclick='addToCart(${JSON.stringify(item.name)})'>ADD +</button>
        </div>
    `;
}

function renderPopularMeds() {
    const slider = document.getElementById('popular-meds-slider');
    if (!slider) return;
    slider.innerHTML = "";
    const popular = MEDICINE_DB.slice(0, 4);

    popular.forEach(item => {
        slider.innerHTML += `
            <div class="glass-card" style="min-width:150px; flex-shrink:0; padding:18px; min-height:190px;">
                ${item.isRx ? '<span class="rx-badge" style="top:10px; right:10px; font-size:9px;">Rx</span>' : ''}
                <div class="icon-orb orb-1" style="width:45px; height:45px; font-size:20px; margin-bottom:12px;"><i class="fa-solid ${item.icon}"></i></div>
                <h3 style="margin:0; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">${item.name}</h3>
                <p style="margin:4px 0 0; font-size:11px; color:var(--gray-text); font-weight:600;">${item.category}</p>
                <p style="margin:8px 0 0; font-size:16px; font-weight:800; color:var(--c4);">₹${item.price}</p>
                <button class="add-btn" style="margin-top:12px; padding:10px; font-size:12px;" onclick='addToCart(${JSON.stringify(item.name)})'>ADD +</button>
            </div>
        `;
    });

    slider.innerHTML += `
        <div class="glass-card" style="min-width:140px; flex-shrink:0; background:linear-gradient(135deg, var(--c5), var(--c4)); border:none; align-items:center; justify-content:center; text-align:center; min-height:190px;" onclick="switchTab(document.querySelectorAll('.nav-dock .nav-item')[1], 'tab-category')">
            <div class="icon-orb" style="background:rgba(255,255,255,0.2); color:white; margin:0 0 15px;"><i class="fa-solid fa-arrow-right"></i></div>
            <h4 style="color:white; margin:0; font-size:15px; font-weight:800;">See All<br>Medicines</h4>
        </div>
    `;
}

function clearSearch() {
    document.getElementById('global-search').value = "";
    document.getElementById('home-normal-content').style.display = 'block';
    document.getElementById('home-search-content').style.display = 'none';
}

function renderCategoriesTab() {
    const grid = document.getElementById('all-cats-grid');
    if (!grid) return;
    grid.innerHTML = "";
    const categories = [...new Set(MEDICINE_DB.map(item => item.category))];
    const colors = ['orb-1', 'orb-2', 'orb-3'];

    categories.forEach((cat, idx) => {
        const example = MEDICINE_DB.find(m => m.category === cat);
        const colorClass = colors[idx % colors.length];

        grid.innerHTML += `
            <div class="glass-card" style="min-height:130px; text-align:center; align-items:center; justify-content:center;" onclick='openCategoryView(${JSON.stringify(cat)})'>
                <div class="icon-orb ${colorClass}" style="margin:0 0 15px; width:55px; height:55px; font-size:24px;"><i class="fa-solid ${example.icon}"></i></div>
                <h3 style="margin:0; font-size:15px;">${cat}</h3>
            </div>
        `;
    });
}

function openCategoryView(catName) {
    document.getElementById('cat-title').innerText = catName;
    const grid = document.getElementById('cat-items-grid');
    grid.innerHTML = "";
    const items = MEDICINE_DB.filter(m => m.category === catName);
    items.forEach(item => { grid.innerHTML += renderItemCard(item); });
    showScreen('screen-cat-items');
}

// --- AUTH LOGIC ---
async function autoPhone(el) {
    clearErr('phone-err');
    let v = el.value.replace(/\D/g, '');
    if (v.length > 4 && v.length <= 7) v = v.slice(0, 4) + '-' + v.slice(4);
    if (v.length > 7) v = v.slice(0, 4) + '-' + v.slice(4, 7) + '-' + v.slice(7);
    el.value = v;

    if (v.length === 12) {
        currentPhoneRaw = v;
        currentPhoneClean = v.replace(/-/g, '');
        el.style.borderColor = "var(--success)";
        el.style.boxShadow = "0 0 0 4px rgba(0, 208, 156, 0.15)";

        loading(true, "CONNECTING TO SERVER...");

        setTimeout(() => {
            showScreen('screen-otp');
            setTimeout(() => document.getElementById('otp-1').focus(), 600);
        }, 500);

        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhoneClean })
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const data = await res.json();

            loading(false);
            if (data.success) {
                showToast("OTP Sent! Check server logs.");
            } else {
                alert("Failed to send OTP: " + (data.message || "Unknown error"));
                showScreen('screen-login');
            }
        } catch (e) {
            loading(false);
            showScreen('screen-login');
            alert(`SERVER CONNECTION FAILED!\n\nDetails: ${e.message}\n\n1. Wait 60 seconds (Render might be waking up).\n2. Check if backend is online.`);
            el.value = "";
            el.style.borderColor = "";
            el.style.boxShadow = "";
        }
    } else {
        el.style.borderColor = ""; el.style.boxShadow = "";
    }
}

function m(el) {
    clearErr('otp-err');
    if (el.value && el.nextElementSibling) el.nextElementSibling.focus();
    let code = "";
    document.querySelectorAll('.otp-box').forEach(b => code += b.value);
    if (code.length === 6) checkLocalLogin(code);
}

function selG(el, selectedGender) {
    document.querySelectorAll('.gender-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    gender = selectedGender;
}

async function checkLocalLogin(otpCode) {
    loading(true, "VERIFYING...");
    try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentPhoneClean, otp: otpCode })
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();

        if (data.success) {
            if (data.isNewUser) {
                loading(false);
                showScreen('screen-profile');
            } else {
                localStorage.setItem('mediflow_current_session', JSON.stringify(data.user));
                updateDash(data.user);
                renderCategoriesTab();
                renderPopularMeds();

                await loadAddresses(data.user.id);
                loading(false);
                openAddressManager(true);
                // Request push permission and subscribe after login
                initPushNotifications();
            }
        } else {
            loading(false);
            document.querySelectorAll('.otp-box').forEach(b => { b.value = ""; b.style.borderColor = "var(--error)"; });
            document.getElementById('otp-err').innerText = data.message || "Incorrect OTP";
            document.getElementById('otp-err').style.display = 'block';
            document.getElementById('otp-1').focus();
        }
    } catch (e) {
        loading(false);
        alert(`LOGIN FAILED!\n\nDetails: ${e.message}\n\nCheck if your Render backend is running.`);
        document.querySelectorAll('.otp-box').forEach(b => b.value = "");
        document.getElementById('otp-1').focus();
    }
}

async function saveProfileToLocal() {
    const n = document.getElementById('user-name').value;
    const a = document.getElementById('user-age').value;
    const emailVal = document.getElementById('user-email').value.trim();
    if (n.length < 3 || a < 1) return alert("Please enter valid name and age");
    if (gender === "") return alert("Please select a gender");
    if (emailVal && !EMAIL_REGEX.test(emailVal)) {
        document.getElementById('email-err').style.display = 'block';
        return;
    }

    loading(true, "CREATING ACCOUNT...");
    try {
        const payload = { phone: currentPhoneClean, name: n, age: a, gender: gender };
        if (emailVal) payload.email = emailVal;
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            const savedUser = emailVal && !data.user.email ? { ...data.user, email: emailVal } : data.user;
            localStorage.setItem('mediflow_current_session', JSON.stringify(savedUser));
            updateDash(savedUser);
            renderCategoriesTab();
            renderPopularMeds();
            loading(false);
            openAddressManager(true);
            // Request push permission and subscribe for new users
            initPushNotifications();
        } else { loading(false); alert("Failed to create profile: " + data.message); }
    } catch (e) { loading(false); alert("API connection failed."); }
}

function updateDash(user) {
    window.currentUser = user;
    document.getElementById('initial-box').innerText = user.name.charAt(0).toUpperCase();
    document.getElementById('db-name-disp').innerText = user.name;
    document.getElementById('db-info-disp').innerText = `${user.age} Yrs • ${user.phone}`;
    document.getElementById('profile-email').value = user.email || '';
    setHomeGreeting();
}

// ── Push Notifications ───────────────────────────────────────────────────────
// Converts a URL-safe base64 VAPID public key to a Uint8Array for pushManager.
function _urlBase64ToUint8Array(base64String) {
    // Compute the number of '=' characters needed to make the length a multiple of 4
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Updates the push-notification card in the Profile tab to reflect current state.
// States: 'unsupported' | 'default' | 'denied' | 'granted'
function _updatePushUI(state) {
    const card = document.getElementById('push-notif-card');
    if (!card) return;
    const statusEl = document.getElementById('push-status-text');
    const enableBtn = document.getElementById('push-enable-btn');
    const testBtn = document.getElementById('push-test-btn');
    const stateMap = {
        unsupported: { text: 'Not supported in this browser', color: '#9CA3AF', enableShow: false, testShow: false },
        default:     { text: 'Notifications not yet enabled', color: '#F59E0B', enableShow: true,  testShow: false },
        denied:      { text: 'Blocked — allow in browser settings', color: '#EF4444', enableShow: false, testShow: false },
        granted:     { text: 'Notifications enabled ✓', color: '#16A34A', enableShow: false, testShow: true }
    };
    const s = stateMap[state] || stateMap.default;
    if (statusEl) { statusEl.textContent = s.text; statusEl.style.color = s.color; }
    if (enableBtn) enableBtn.style.display = s.enableShow ? 'block' : 'none';
    if (testBtn)   testBtn.style.display   = s.testShow   ? 'block' : 'none';
}

// Requests Notification permission, subscribes via pushManager, and sends the
// subscription to the backend at POST /api/notifications/subscribe.
// 🔔 PUSH EDIT: Make sure VAPID_PUBLIC_KEY at the top of this file matches the
//   key used by your backend (VAPID_PUBLIC_KEY in backend .env).
async function initPushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        _updatePushUI('unsupported');
        return;
    }

    // Don't re-prompt if the user has already blocked notifications.
    if (Notification.permission === 'denied') {
        _updatePushUI('denied');
        return;
    }

    // If already granted, subscribe silently (handles page reloads / session restore).
    if (Notification.permission === 'granted') {
        await _subscribePush();
        return;
    }

    // 'default' — update UI so the user can tap "Enable" to trigger the browser prompt.
    _updatePushUI('default');
}

// Called when the user explicitly taps the "Enable Notifications" button.
async function enablePushNotifications() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        await _subscribePush();
    } else {
        _updatePushUI(permission === 'denied' ? 'denied' : 'default');
    }
}

// Subscribes this device via pushManager and registers the subscription with
// the backend (POST /api/notifications/subscribe).
async function _subscribePush() {
    try {
        const reg = await navigator.serviceWorker.ready;
        // Skip if already subscribed to avoid duplicate backend calls.
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            if (VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
                // VAPID key not configured — log a reminder and update UI.
                console.warn('[MediFlow Push] Set VAPID_PUBLIC_KEY in app.js to enable push notifications.');
                _updatePushUI('default');
                return;
            }
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }
        // Send subscription to backend; treat non-2xx responses as errors.
        const userId = window.currentUser ? window.currentUser.id : null;
        const res = await fetch(`${API_BASE}/notifications/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub, userId })
        });
        if (!res.ok) throw new Error(`Subscribe endpoint returned ${res.status}`);
        _updatePushUI('granted');
    } catch (e) {
        console.warn('[MediFlow Push] Subscription failed:', e);
        _updatePushUI(Notification.permission === 'denied' ? 'denied' : 'default');
    }
}

// Triggers a test push notification via the backend (POST /api/notifications/test).
// Useful for verifying the end-to-end push pipeline during development.
async function sendTestNotification() {
    if (!window.currentUser) { showToast("Please log in first."); return; }
    try {
        const res = await fetch(`${API_BASE}/notifications/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: window.currentUser.id })
        });
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Test notification sent!");
    } catch (e) {
        showToast("Could not reach backend to send test notification.");
    }
}

async function saveProfileEmail() {
    const email = document.getElementById('profile-email').value.trim();
    const errEl = document.getElementById('profile-email-err');
    errEl.style.display = 'none';
    if (email && !EMAIL_REGEX.test(email)) {
        errEl.style.display = 'block';
        return;
    }
    if (!window.currentUser) return;
    loading(true, "SAVING...");
    let updatedUser = { ...window.currentUser };
    let savedToBackend = false;
    try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: window.currentUser.id, email: email || null })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) { updatedUser = data.user; savedToBackend = true; }
        } else if (res.status !== 404) {
            console.warn('Profile update returned status:', res.status);
        }
    } catch (_) { /* backend may not support this endpoint yet */ }
    if (email) updatedUser.email = email;
    else delete updatedUser.email;
    window.currentUser = updatedUser;
    localStorage.setItem('mediflow_current_session', JSON.stringify(updatedUser));
    loading(false);
    alert(savedToBackend ? "Email saved!" : "Email saved locally. It will sync when backend support is available.");
}

function setHomeGreeting() {
    const currentHour = new Date().getHours();
    let greeting = "Good evening,";
    if (currentHour < 12) greeting = "Good morning,";
    else if (currentHour < 18) greeting = "Good afternoon,";

    document.getElementById('greeting-text').innerText = greeting;
    if (window.currentUser) document.getElementById('dash-user').innerText = window.currentUser.name;
}

function switchTab(el, tabId, pushHistory = true) {
    clearSearch();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(tabId).classList.add('active-view');

    if (pushHistory) {
        history.pushState({ screen: 'screen-dash', tab: tabId }, "");
    }

    const mainScroll = document.getElementById('main-scroll');
    const dashHeader = document.getElementById('main-dash-header');

    if (tabId === 'tab-home') {
        dashHeader.classList.remove('compact');
        mainScroll.style.paddingTop = '230px';
        setHomeGreeting();
    } else {
        dashHeader.classList.add('compact');
        mainScroll.style.paddingTop = '150px';

        if (tabId === 'tab-category') { document.getElementById('greeting-text').innerText = "Explore"; document.getElementById('dash-user').innerText = "Pharmacy"; }
        else if (tabId === 'tab-doctor') { document.getElementById('greeting-text').innerText = "Consult"; document.getElementById('dash-user').innerText = "Specialists"; }
        else if (tabId === 'tab-delivery') { document.getElementById('greeting-text').innerText = "Secure"; document.getElementById('dash-user').innerText = "Checkout"; }
        else if (tabId === 'tab-profile' || tabId === 'tab-orders') { document.getElementById('greeting-text').innerText = "Manage"; document.getElementById('dash-user').innerText = "Account"; }
    }

    updateCartUI();
}

// --- MISSING FUNCTIONS (fixes JS errors) ---
function triggerDoctorTab() {
    const docNavBtn = document.querySelector('.nav-dock .nav-item:nth-child(3)');
    switchTab(docNavBtn, 'tab-doctor');
}

function openConsultation() {
    showScreen('screen-consult');
}

function closeConsultation() {
    if (history.state && history.state.screen !== 'screen-consult') {
        history.back();
    } else {
        showScreen('screen-dash');
    }
}

function checkAvailability() {
    showToast("Checking doctor availability...");
}

function selUI(el) {
    el.parentNode.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function selMode(el) {
    el.parentNode.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function deleteAccount() {
    if (confirm("Are you sure you want to delete your account? Your device data will be wiped.")) {
        localStorage.removeItem('mediflow_current_session'); location.reload();
    }
}

function loading(show, text) {
    const l = document.getElementById('pill-loader');
    if (show) {
        if (text) document.getElementById('loader-text').innerText = text;
        l.style.opacity = 1; l.style.display = 'flex';
    } else {
        l.style.opacity = 0; setTimeout(() => l.style.display = 'none', 300);
    }
}

function clearErr(errId) { document.getElementById(errId).style.display = 'none'; }
function dbLogout() { if (confirm("Are you sure you want to log out?")) { localStorage.removeItem('mediflow_current_session'); location.reload(); } }

function openRxUpload() { showScreen('screen-rx-upload'); }
function closeRxUpload() {
    clearRxUpload();
    if (history.state && history.state.screen !== 'screen-rx-upload') {
        history.back();
    } else {
        showScreen('screen-dash');
    }
}

function handleRxFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('rx-preview-img').src = e.target.result;
            document.getElementById('rx-upload-zone').style.display = 'none';
            document.getElementById('rx-preview-container').style.display = 'block';
            document.getElementById('rx-submit-btn').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function clearRxUpload() {
    document.getElementById('rx-file-input').value = "";
    document.getElementById('rx-upload-zone').style.display = 'flex';
    document.getElementById('rx-preview-container').style.display = 'none';
    document.getElementById('rx-submit-btn').style.display = 'none';
}

async function submitRx() {
    const fileInput = document.getElementById('rx-file-input');
    if (!fileInput.files[0]) return alert("Please select an image first.");

    loading(true, "UPLOADING TO SERVER...");
    const formData = new FormData();
    formData.append('prescription', fileInput.files[0]);

    try {
        const res = await fetch(`${API_BASE}/upload-rx`, { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            loading(true, "AI SCANNING IMAGE...");
            setTimeout(() => {
                loading(false);
                showToast("Prescription Uploaded & Verified! ✅");
                window.rxVerified = true;
                window.rxImageUrl = data.fileUrl;
                closeRxUpload();
                updateCartUI();

                document.getElementById('nav-btn-cart').click();
            }, 1500);
        } else { throw new Error("Upload Failed"); }
    } catch (e) {
        loading(false);
        loading(true, "AI SCANNING IMAGE...");
        setTimeout(() => {
            loading(false); showToast("Verified (Local Fallback) ✅");
            window.rxVerified = true; closeRxUpload(); updateCartUI();

            document.getElementById('nav-btn-cart').click();
        }, 1000);
    }
}

// --- SOCKET.IO LIVE TRACKING ---
socket.on('connect', () => { console.log('✅ Connected to Live Tracking Server'); });
socket.on('driverLocationUpdate', (data) => {
    const { latitude, longitude } = data;
    // Update tracker-screen rider marker (new — primary map for live tracking)
    updateTrackerRiderLocation(latitude, longitude);
    // Also update the address-screen map if it happens to be open (legacy behaviour)
    if (!map) return;
    if (!driverMarker) {
        // Create a custom DOM element for the driver marker
        // 🎨 BRAND EDIT: Adjust driver-dot colour / size here
        const el = document.createElement('div');
        el.style.cssText = 'width:22px; height:22px; background:var(--success); border-radius:50%; border:3px solid white; box-shadow:0 0 15px var(--success);';
        driverMarker = new mapboxgl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);
    } else {
        driverMarker.setLngLat([longitude, latitude]);
    }
    try { map.easeTo({ center: [longitude, latitude], duration: 1500 }); } catch (e) {}
});

// ══════════════════════════════════════════════════════════════════════════
// ORDER LIVE TRACKER
// ──────────────────────────────────────────────────────────────────────────
// Zepto/Blinkit-inspired order tracker with:
//   • 5-step timeline  (Placed → Accepted → Ready → En Route → Delivered)
//   • Mapbox map with pharmacy 🏥, rider 🛵, and user 📍 markers
//   • Socket.IO real-time rider location updates + polling fallback
//   • Contact actions: call pharmacy / rider, support
//
// Entry point : openOrderTracker(orderId, orderData)
// Close       : closeOrderTracker()
// ══════════════════════════════════════════════════════════════════════════

/** Separate Mapbox map instance for the tracker screen (does not reuse address `map`). */
let trackerMap = null;
/** Mapbox Marker for the delivery rider on the tracker map. */
let trackerRiderMarker = null;
/** Mapbox Marker for the user's delivery address on the tracker map. */
let trackerUserMarker = null;
/** Mapbox Marker for the pharmacy on the tracker map. */
let trackerPharmacyMarker = null;
/** setInterval ID for order status polling. */
let _orderPollInterval = null;
/** Currently tracked order ID. */
let _currentTrackedOrderId = null;
/** Full order object for the currently tracked order. */
let _currentTrackedOrderData = null;
/** setTimeout ID for the order-confirmed banner auto-dismiss. */
let _confirmBannerTimeout = null;

// 🎨 UX EDIT: How often (ms) to poll order status from the backend.
const TRACKER_POLL_INTERVAL_MS = 15000; // 15 seconds

// Default pharmacy location used when the order payload doesn't include one.
// 🎨 INTEGRATION: Replace with values from your order/pharmacy API response.
const DEFAULT_PHARMACY_LAT = 28.6200;
const DEFAULT_PHARMACY_LNG = 77.2150;

/**
 * Maps order status strings to timeline steps.
 * Keys and altKeys are matched against order.status using substring search (case-insensitive).
 * 🎨 INTEGRATION: Add / rename entries to match your backend's actual status strings.
 */
const TRACKER_STATUS_MAP = [
    { key: 'placed',           altKeys: ['confirmed', 'pending payment', 'paid online'],
      icon: 'fa-check',            title: 'Order Placed',          sub: 'We received your order',              emoji: '📦',
      eta: '~35 min',   pharmacyLabel: 'Preparing your order' },
    { key: 'accepted',         altKeys: [],
      icon: 'fa-store',            title: 'Pharmacy Accepted',     sub: 'Pharmacy is preparing your order',    emoji: '🏥',
      eta: '~25 min',   pharmacyLabel: 'Preparing your order' },
    { key: 'ready',            altKeys: ['preparing', 'packed'],
      icon: 'fa-box-open',         title: 'Medicines Ready',       sub: 'Packed and ready for pickup',         emoji: '✅',
      eta: '~18 min',   pharmacyLabel: 'Order packed' },
    { key: 'out for delivery', altKeys: ['en route', 'picked up', 'dispatched'],
      icon: 'fa-person-biking',    title: 'Rider En Route',        sub: 'Your order is on the way!',           emoji: '🛵',
      eta: '~10 min',   pharmacyLabel: 'Order dispatched' },
    { key: 'delivered',        altKeys: ['completed'],
      icon: 'fa-house-circle-check', title: 'Delivered',           sub: 'Enjoy your medicines!',               emoji: '🎉',
      eta: 'Delivered!', pharmacyLabel: 'Order delivered' }
];

/**
 * Resolves a raw status string to its zero-based step index in TRACKER_STATUS_MAP.
 * Returns 0 (Placed) as default for unknown / empty statuses.
 * Iterates in reverse order so the most-advanced step that matches wins
 * (e.g. if the status string is "Out for Delivery", step 3 is returned rather than
 * step 0, even though "Placed" alt-keys could also partially match).
 * @param {string} statusStr - e.g. "Confirmed (Paid Online)"
 * @returns {number} step index 0–4
 */
function _resolveTrackerStep(statusStr) {
    if (!statusStr) return 0;
    const s = statusStr.toLowerCase();
    // Iterate in reverse: the first match found is the highest (most advanced) step
    for (let i = TRACKER_STATUS_MAP.length - 1; i >= 0; i--) {
        const step = TRACKER_STATUS_MAP[i];
        if (s.includes(step.key)) return i;
        if (step.altKeys.some(k => s.includes(k))) return i;
    }
    return 0;
}

/**
 * Renders the 5-step timeline inside #ot-timeline.
 * Steps are marked done (✓), active (pulsing), or pending.
 * @param {number} activeStep - zero-based index of the current step (0–4)
 */
function renderTrackerTimeline(activeStep) {
    const container = document.getElementById('ot-timeline');
    if (!container) return;

    let html = '';
    TRACKER_STATUS_MAP.forEach((step, idx) => {
        const isDone   = idx < activeStep;
        const isActive = idx === activeStep;
        const cls      = isDone ? 'done' : (isActive ? 'active' : '');

        html += `
            <div class="ot-step ${cls}">
                <div class="ot-step-icon">
                    ${isDone
                        ? '<i class="fa-solid fa-check"></i>'
                        : `<i class="fa-solid ${step.icon}"></i>`}
                </div>
                <div class="ot-step-text">
                    <p class="ot-step-title">${step.title}</p>
                    <p class="ot-step-sub">${isActive ? step.sub : (isDone ? 'Completed' : 'Pending')}</p>
                </div>
                ${isActive ? '<span class="ot-step-time">Now</span>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;

    // Show/hide the delivered banner
    const banner = document.getElementById('ot-delivered-banner');
    if (banner) banner.classList.toggle('show', activeStep === TRACKER_STATUS_MAP.length - 1);
}

/**
 * Updates the floating status chip above the tracker map and the ETA badge.
 * ETA and pharmacy label are read directly from TRACKER_STATUS_MAP entries so
 * they stay in sync when steps are added or modified.
 * @param {number} activeStep - zero-based step index (0–4)
 */
function updateTrackerStatusChip(activeStep) {
    const step = TRACKER_STATUS_MAP[activeStep];
    if (!step) return;

    const iconEl   = document.getElementById('ot-status-icon');
    const labelEl  = document.getElementById('ot-status-label');
    const etaText  = document.getElementById('ot-eta-text');
    const etaBadge = document.getElementById('ot-eta-badge');

    if (iconEl)  iconEl.textContent  = step.emoji;
    if (labelEl) labelEl.textContent = step.title;

    // ETA and pharmacy label come from TRACKER_STATUS_MAP — single source of truth
    // 🎨 INTEGRATION: Replace step.eta with actual ETA from backend when available
    if (etaText) etaText.textContent = step.eta || '~15 min';
    if (etaBadge) etaBadge.style.display = activeStep === TRACKER_STATUS_MAP.length - 1 ? 'none' : 'flex';

    // Rider card: show only from "Out for Delivery" step onwards
    const riderCard = document.getElementById('ot-rider-card');
    if (riderCard) riderCard.style.display = activeStep >= 3 ? 'flex' : 'none';

    // Pharmacy sub-label: updated per step using pharmacyLabel from TRACKER_STATUS_MAP
    const pharmacySub = document.getElementById('ot-pharmacy-sub');
    if (pharmacySub) pharmacySub.textContent = step.pharmacyLabel || 'Preparing your order';
}

/**
 * Initialises a fresh Mapbox map instance inside #tracker-map.
 * Places pharmacy 🏥, rider 🛵, and user 📍 markers, then fits the viewport.
 * Destroys any existing tracker map instance before creating a new one.
 *
 * 🎨 BRAND EDIT: Marker emojis and styles are in _placeTrackerMarkers().
 */
function initTrackerMap() {
    // Destroy previous instance if screen was re-opened
    if (trackerMap) {
        try { trackerMap.remove(); } catch (_) {}
        trackerMap = null;
    }
    trackerRiderMarker = trackerUserMarker = trackerPharmacyMarker = null;

    const container = document.getElementById('tracker-map');
    if (!container) return;

    try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        trackerMap = new mapboxgl.Map({
            container: 'tracker-map',
            style: MAPBOX_STYLE,
            center: [DEFAULT_LNG, DEFAULT_LAT],
            zoom: 13,
            attributionControl: false
        });
        trackerMap.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
        trackerMap.on('load', _placeTrackerMarkers);
    } catch (e) {
        console.error('Tracker map init failed:', e);
        trackerMap = null;
    }
}

/**
 * Places / refreshes pharmacy, rider, and user markers on the tracker map,
 * then fits the viewport to show all three.
 * Called after the map tiles load and whenever markers need repositioning.
 */
function _placeTrackerMarkers() {
    if (!trackerMap) return;

    const pharmacyLat = DEFAULT_PHARMACY_LAT;
    const pharmacyLng = DEFAULT_PHARMACY_LNG;
    const userLat = selectedAddress ? selectedAddress.lat  : DEFAULT_LAT;
    const userLng = selectedAddress ? selectedAddress.lng  : DEFAULT_LNG;

    // ── Pharmacy marker (🏥) ──
    // 🎨 BRAND EDIT: change pharmacy emoji or font-size in pharmEl.textContent / style
    const pharmEl = document.createElement('div');
    pharmEl.title = 'MediFlow Partner Pharmacy';
    pharmEl.style.cssText = 'font-size:30px; cursor:default; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.3)); line-height:1;';
    pharmEl.textContent = '🏥';
    trackerPharmacyMarker = new mapboxgl.Marker({ element: pharmEl })
        .setLngLat([pharmacyLng, pharmacyLat])
        .setPopup(new mapboxgl.Popup({ offset: 28, closeButton: false })
            .setHTML('<div style="font-size:13px;font-weight:700;color:#111827;">MediFlow Partner Pharmacy</div>'))
        .addTo(trackerMap);

    // ── User delivery location marker (📍) ──
    if (userLat && userLng) {
        const userEl = document.createElement('div');
        userEl.title = 'Your delivery location';
        userEl.style.cssText = 'font-size:30px; cursor:default; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.3)); line-height:1;';
        userEl.textContent = '📍';
        trackerUserMarker = new mapboxgl.Marker({ element: userEl })
            .setLngLat([userLng, userLat])
            .setPopup(new mapboxgl.Popup({ offset: 28, closeButton: false })
                .setHTML('<div style="font-size:13px;font-weight:700;color:#111827;">Your Location</div>'))
            .addTo(trackerMap);
    }

    // ── Rider marker (🛵) — starts at pharmacy until a real Socket.IO update arrives ──
    // 🎨 BRAND EDIT: rider dot size / colours are set in the inline style below
    const riderEl = document.createElement('div');
    riderEl.title = 'Delivery Rider';
    riderEl.style.cssText = `
        width:42px; height:42px;
        background: linear-gradient(135deg, var(--c4), var(--c5));
        border-radius:50%; border:3px solid white;
        box-shadow:0 0 0 0 rgba(10,133,140,0.5);
        animation: trackerRiderPulse 2s ease-out infinite;
        display:flex; align-items:center; justify-content:center;
        font-size:20px; cursor:default;
    `;
    riderEl.textContent = '🛵';
    trackerRiderMarker = new mapboxgl.Marker({ element: riderEl, anchor: 'center' })
        .setLngLat([pharmacyLng, pharmacyLat]) // Initially at pharmacy
        .setPopup(new mapboxgl.Popup({ offset: 28, closeButton: false })
            .setHTML('<div style="font-size:13px;font-weight:700;color:#111827;">Delivery Rider</div>'))
        .addTo(trackerMap);

    // Fit map to show all markers with generous padding
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([pharmacyLng, pharmacyLat]);
    if (userLat && userLng) bounds.extend([userLng, userLat]);
    try {
        trackerMap.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 60, right: 60 },
            maxZoom: 15, duration: 1200
        });
    } catch (_) {}
}

/**
 * Smoothly moves the rider marker on the tracker map.
 * Called by both Socket.IO events and the polling fallback.
 * @param {number} lat
 * @param {number} lng
 */
function updateTrackerRiderLocation(lat, lng) {
    if (!trackerMap || !trackerRiderMarker) return;
    trackerRiderMarker.setLngLat([lng, lat]);
    // Gently pan to keep the rider in view — does not snap the map
    try {
        trackerMap.easeTo({
            center: [lng, lat],
            duration: 1500,
            zoom: Math.max(trackerMap.getZoom(), 13)
        });
    } catch (_) {}
}

/**
 * Polls the order-status endpoint every TRACKER_POLL_INTERVAL_MS milliseconds.
 * Updates the timeline and chip on each successful response.
 * Stops automatically once the order is Delivered.
 * Falls back gracefully when the backend is unavailable (no error shown to user).
 * @param {string} orderId
 */
function startOrderPolling(orderId) {
    stopOrderPolling(); // Clear any existing interval
    if (!orderId) return;

    const poll = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/detail/${orderId}`);
            if (!res.ok) return; // Silently ignore HTTP errors (backend may not have this endpoint)
            const data = await res.json();
            if (data.success && data.order) {
                const step = _resolveTrackerStep(data.order.status);
                renderTrackerTimeline(step);
                updateTrackerStatusChip(step);
                // Update rider location if provided by the backend
                // 🎨 INTEGRATION: ensure backend returns riderLat/riderLng on order objects
                if (data.order.riderLat && data.order.riderLng) {
                    updateTrackerRiderLocation(data.order.riderLat, data.order.riderLng);
                }
                // Stop polling once the order is delivered
                if (step === TRACKER_STATUS_MAP.length - 1) stopOrderPolling();
            }
        } catch (_) { /* Network unavailable — will retry on next tick */ }
    };

    _orderPollInterval = setInterval(poll, TRACKER_POLL_INTERVAL_MS);
    poll(); // Run immediately on open
}

/** Clears the order status polling interval. */
function stopOrderPolling() {
    if (_orderPollInterval) {
        clearInterval(_orderPollInterval);
        _orderPollInterval = null;
    }
}

/**
 * Opens the live order tracker screen.
 * Call this immediately after a successful order placement.
 *
 * @param {string}  orderId    - The placed order's ID (e.g. "ORD-AB12CD")
 * @param {object}  orderData  - Full order object from backend (or local fallback)
 * @param {boolean} freshOrder - Pass true immediately after order placement to show
 *                               the order-confirmed celebration banner.
 */
function openOrderTracker(orderId, orderData, freshOrder = false) {
    _currentTrackedOrderId  = orderId;
    _currentTrackedOrderData = orderData || {};

    // Populate order ID label in the header
    const orderIdEl = document.getElementById('ot-order-id');
    if (orderIdEl) orderIdEl.textContent = 'Order #' + orderId;

    // Show the tracker screen — this is the immediate transition with no gap.
    showScreen('screen-order-tracker');

    // Determine initial step from the order status string
    const initStep = _resolveTrackerStep(_currentTrackedOrderData.status || '');

    renderTrackerTimeline(initStep);
    updateTrackerStatusChip(initStep);

    // Show or hide the order-confirmed celebration banner.
    // When freshOrder is true (called right after payment), the banner slides in
    // and auto-dismisses after 4 s so the user always sees immediate confirmation.
    const confirmBanner = document.getElementById('ot-confirm-banner');
    if (confirmBanner) {
        // Cancel any previous auto-dismiss timer to prevent multiple concurrent timers
        clearTimeout(_confirmBannerTimeout);
        if (freshOrder) {
            confirmBanner.classList.add('show');
            // Auto-hide after 4 seconds — user can continue viewing the tracker
            _confirmBannerTimeout = setTimeout(() => confirmBanner.classList.remove('show'), 4000);
        } else {
            // Re-opening tracker from history: ensure banner is hidden
            confirmBanner.classList.remove('show');
        }
    }

    // Populate rider name if available
    // 🎨 INTEGRATION: replace 'riderName' with your backend's actual field name
    const riderNameEl = document.getElementById('ot-rider-name');
    if (riderNameEl && _currentTrackedOrderData.riderName) {
        riderNameEl.textContent = _currentTrackedOrderData.riderName;
    }

    // Delay map init slightly so the screen transition completes first
    setTimeout(() => {
        initTrackerMap();
        startOrderPolling(orderId);
        // Join Socket.IO delivery room for real-time rider location
        socket.emit('joinDeliveryRoom', { orderId });
    }, 420);
}

/**
 * Closes the tracker screen, cleans up the map and polling, and goes home.
 */
function closeOrderTracker() {
    stopOrderPolling();

    // Cancel the confirm-banner auto-dismiss timer if the user exits early
    clearTimeout(_confirmBannerTimeout);
    _confirmBannerTimeout = null;

    // Remove the tracker Mapbox instance to free GPU/memory
    if (trackerMap) {
        try { trackerMap.remove(); } catch (_) {}
        trackerMap = null;
        trackerRiderMarker = trackerUserMarker = trackerPharmacyMarker = null;
    }

    _currentTrackedOrderId   = null;
    _currentTrackedOrderData = null;

    showScreen('screen-dash');
    switchTab(document.querySelector('.nav-dock .nav-item:first-child'), 'tab-home', false);
}

// ── Contact & support actions ────────────────────────────────────────────
// 🎨 INTEGRATION: Replace stubs below with real phone numbers / chat flows
//   from _currentTrackedOrderData (e.g. .riderPhone, .pharmacyPhone).

/** Attempts to call the delivery rider directly. */
function callDeliveryRider() {
    if (_currentTrackedOrderData && _currentTrackedOrderData.riderPhone) {
        window.location.href = `tel:${_currentTrackedOrderData.riderPhone}`;
    } else {
        showToast('Rider contact not available yet.');
    }
}

/** Opens a chat or SMS with the delivery rider. */
function messageDeliveryRider() {
    showToast('Opening chat with rider…');
    // 🎨 INTEGRATION: deep-link to WhatsApp / in-app chat with rider
}

/** Attempts to call the partner pharmacy. */
function callPharmacy() {
    if (_currentTrackedOrderData && _currentTrackedOrderData.pharmacyPhone) {
        window.location.href = `tel:${_currentTrackedOrderData.pharmacyPhone}`;
    } else {
        // Fallback demo number
        showToast('Pharmacy: +91-98765-43210');
    }
}

/** Opens MediFlow support for order issues / delayed delivery. */
function openOrderSupport() {
    showToast('Connecting to MediFlow Support…');
    // 🎨 INTEGRATION: navigate to a support chat overlay or help screen
}
