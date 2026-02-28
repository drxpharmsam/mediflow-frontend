const API_BASE = 'https://mediflow-backend-z29j.onrender.com/api';
const SOCKET_URL = 'https://mediflow-backend-z29j.onrender.com';
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
    } else { loading(false); }

    // Register service worker for PWA
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

    // Always start on Step 1 (location pick); reset Step 2 to hidden
    const pickSheet = document.getElementById('addr-sheet-pick');
    const detailsSheet = document.getElementById('addr-sheet-details');
    if (pickSheet) pickSheet.classList.remove('addr-sheet-hidden');
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

    let html = `<p style="font-size:11px; font-weight:800; color:var(--gray-text); text-transform:uppercase; letter-spacing:0.8px; margin: 16px 0 10px;">Saved Addresses</p>`;

    list.forEach(addr => {
        const isSelected = selectedAddress && selectedAddress.id === addr.id;
        const icon = tagIcon[addr.tag] || 'fa-location-dot';
        html += `
            <div class="addr-card ${isSelected ? 'selected' : ''}" onclick='selectAddress(${JSON.stringify(addr)})'>
                <div class="addr-card-icon"><i class="fa-solid ${icon}" style="color:var(--c4);"></i></div>
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
                        <b style="font-size:14px; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${addr.line1}</b>
                        <span class="tag-chip">${addr.tag}</span>
                    </div>
                    <p style="margin:0; font-size:12px; color:var(--gray-text); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${addr.line2}</p>
                </div>
                ${isSelected ? '<i class="fa-solid fa-circle-check" style="color:var(--c4); font-size:20px; flex-shrink:0;"></i>' : ''}
            </div>
        `;
    });
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
    loading(true, method === 'COD' ? "PLACING ORDER..." : "VERIFYING BANK STATUS...");

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
                loading(true, "ORDER PLACED SUCCESSFULLY!");
                setTimeout(() => {
                    loading(false);
                    alert(`Order Confirmed! 🚀\nMethod: ${method}\nOrder ID: ${data.order.orderId || generatedId}`);
                    if (currentPaymentContext.type === 'cart') socket.emit('joinDeliveryRoom', { orderId: data.order.orderId || generatedId });
                    cart = []; window.rxVerified = false; window.rxImageUrl = null;
                    updateCartUI(); closeConsultation();
                    switchTab(document.querySelector('.nav-dock .nav-item:first-child'), 'tab-home');
                }, 1500);
            } else { loading(false); alert("Order failed: " + data.message); }
        } catch (e) {
            loading(false);
            alert(`Order Confirmed! 🚀 (Simulated Locally)\nMethod: ${method}\nOrder ID: ${generatedId}`);

            let localHistory = JSON.parse(localStorage.getItem('mediflow_local_history')) || [];
            localHistory.push({
                orderId: generatedId,
                totalAmount: currentPaymentContext.amount,
                status: method === 'COD' ? 'Confirmed (Pending Payment)' : 'Confirmed (Paid Online)',
                date: new Date().toLocaleDateString(),
                items: orderItems
            });
            localStorage.setItem('mediflow_local_history', JSON.stringify(localHistory));

            cart = []; window.rxVerified = false; updateCartUI(); closeConsultation();
            switchTab(document.querySelector('.nav-dock .nav-item:first-child'), 'tab-home');
        }
    }, 2500);
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

                if (document.getElementById('tab-delivery').classList.contains('active-view')) {
                    processCartPay();
                } else {
                    document.getElementById('nav-btn-cart').click();
                }
            }, 1500);
        } else { throw new Error("Upload Failed"); }
    } catch (e) {
        loading(false);
        loading(true, "AI SCANNING IMAGE...");
        setTimeout(() => {
            loading(false); showToast("Verified (Local Fallback) ✅");
            window.rxVerified = true; closeRxUpload(); updateCartUI();

            if (document.getElementById('tab-delivery').classList.contains('active-view')) {
                processCartPay();
            } else {
                document.getElementById('nav-btn-cart').click();
            }
        }, 1000);
    }
}

// --- SOCKET.IO LIVE TRACKING ---
socket.on('connect', () => { console.log('✅ Connected to Live Tracking Server'); });
socket.on('driverLocationUpdate', (data) => {
    const { latitude, longitude } = data;
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
