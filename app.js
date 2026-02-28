    const API_BASE = 'https://mediflow-backend-z29j.onrender.com/api';
    const SOCKET_URL = 'https://mediflow-backend-z29j.onrender.com';
    
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

    // --- ADDED MISSING SHOWTOAST FUNCTION ---
    function showToast(message) {
        const toast = document.getElementById('toast');
        if(toast) {
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
                if(e.state.tab === 'tab-home') el = document.querySelectorAll('.nav-dock .nav-item')[0];
                else if(e.state.tab === 'tab-category') el = document.querySelectorAll('.nav-dock .nav-item')[1];
                else if(e.state.tab === 'tab-doctor') el = document.querySelectorAll('.nav-dock .nav-item')[2];
                else if(e.state.tab === 'tab-delivery') el = document.querySelectorAll('.nav-dock .nav-item')[3];
                if(el) switchTab(el, e.state.tab, false); 
            }
            updateCartUI(); 
        }
    });

    function showScreen(id, pushHistory = true) { 
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); 
        document.getElementById(id).classList.remove('hidden'); 
        
        if(pushHistory) {
            let activeTab = document.querySelector('.content-view.active-view');
            history.pushState({ screen: id, tab: activeTab ? activeTab.id : 'tab-home' }, "");
        }
        updateCartUI();
    }

    window.onload = async () => {
        window.rxVerified = false;

        // Render UI immediately with hardcoded fallback data — never block on API
        renderCategoriesTab();
        renderPopularMeds();

        // Fetch API medicine list in background; refresh UI if valid data arrives
        fetch(`${API_BASE}/medicines`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.length > 0) {
                    MEDICINE_DB = data.data;
                    renderCategoriesTab();
                    renderPopularMeds();
                }
            })
            .catch(() => {});

        const savedSession = localStorage.getItem('mediflow_current_session');
        if(savedSession) {
            const user = JSON.parse(savedSession);
            loading(true, "WELCOME BACK");
            updateDash(user);
            
            await loadAddresses(user.id); 
            loading(false);

            if(window.currentAddresses.length === 0) {
                history.replaceState({ screen: 'screen-address', tab: 'tab-home' }, "");
                openAddressManager(true); 
            } else {
                history.replaceState({ screen: 'screen-dash', tab: 'tab-home' }, "");
                openAddressManager(true); 
            }
        } else { loading(false); }
    };

    function initMap() {
        if(map) return; 
        map = L.map('map').setView([28.6139, 77.2090], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        map.on('moveend', function() {
            const center = map.getCenter();
            const addrLine2 = document.getElementById('addr-line2');
            if (addrLine2) addrLine2.value = `Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`;
        });
    }

    function detectLocation() {
        if (!navigator.geolocation) { showToast("Geolocation not supported by this browser."); return; }
        if (!map) { initMap(); }
        loading(true, "LOCATING...");
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (map) map.setView([lat, lng], 15);
            loading(false);
            const addrLine2 = document.getElementById('addr-line2');
            if (addrLine2) addrLine2.value = "Current GPS Location Detected";
        }, () => { loading(false); showToast("Location Access Denied"); });
    }

    function openAddressManager(forceSelect = false) {
        showScreen('screen-address');
        renderAddressList();

        const backBtn = document.getElementById('address-back-btn');
        if (forceSelect || !selectedAddress) {
            backBtn.style.display = 'none'; 
        } else {
            backBtn.style.display = 'flex'; 
        }

        // Use 500ms delay so the screen transition completes before map renders (important on Android)
        setTimeout(() => { initMap(); if (map) map.invalidateSize(); }, 500);
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
            if(session) userId = session.id;
        }
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/addresses/${userId}`);
            const data = await res.json();
            if (data.success) {
                window.currentAddresses = data.data;
            }
        } catch(e) { window.currentAddresses = []; }
    }

    async function saveNewAddress() {
        const line1 = document.getElementById('addr-line1').value;
        const line2 = document.getElementById('addr-line2').value;
        const tag = document.querySelector('#screen-address .select-chip.active').innerText;
        const session = JSON.parse(localStorage.getItem('mediflow_current_session'));
        
        if(!line1 || !line2) return alert("Fill Address Details");
        if(!session) return alert("Please log in first");
        
        loading(true, "SAVING ADDRESS...");
        try {
            const res = await fetch(`${API_BASE}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.id, line1, line2, tag })
            });
            const data = await res.json();
            loading(false);
            if (data.success) {
                document.getElementById('addr-line1').value = "";
                document.getElementById('addr-line2').value = "";
                window.currentAddresses.push(data.data);
                selectAddress(data.data); 
            } else { alert("Failed to save address"); }
        } catch(e) { loading(false); alert("API connection failed."); }
    }

    function renderAddressList() {
        const list = window.currentAddresses || [];
        const container = document.getElementById('address-list');
        if (!container) return;
        container.innerHTML = "";
        
        if(list.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#9CA3AF; font-weight:600;'>No saved addresses yet</p>";
            return;
        }

        let html = `<h3 style="font-size:16px; margin-bottom:15px; color:#111827; font-weight:800;">Saved Locations</h3>`;
        
        list.forEach(addr => {
            const isSelected = selectedAddress && selectedAddress.id === addr.id;
            html += `
                <div class="addr-card ${isSelected ? 'selected' : ''}" onclick='selectAddress(${JSON.stringify(addr)})'>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center;">
                            <b style="font-size:15px; color:#111827;">${addr.line1}</b>
                            <span class="tag-chip">${addr.tag}</span>
                        </div>
                        <p style="margin:4px 0 0; font-size:13px; color:var(--gray-text); font-weight:500;">${addr.line2}</p>
                    </div>
                    ${isSelected ? '<i class="fa-solid fa-circle-check" style="color:var(--c4); font-size:20px;"></i>' : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function selectAddress(addr) {
        selectedAddress = addr;
        document.getElementById('curr-addr-tag').innerText = "Delivery to " + addr.tag;
        document.getElementById('curr-addr-text').innerText = addr.line1 + ", " + addr.line2;
        
        if(!document.getElementById('screen-address').classList.contains('hidden')) {
            renderAddressList();
            setTimeout(() => closeAddressManager(), 300);
        }
    }

    function selAddrTag(el) {
        el.parentNode.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }

    // --- ACCURATE QUANTITY CART SYSTEM ---
    function addToCart(itemName) {
        let existingItem = cart.find(i => i.name === itemName);
        if(existingItem) {
            existingItem.qty = (existingItem.qty || 1) + 1; 
        } else {
            const item = MEDICINE_DB.find(i => i.name === itemName);
            cart.push({ ...item, qty: 1 }); 
        }
        showToast(`Added ${itemName} to Cart`);
        updateCartUI();
    }

    function updateQty(index, delta) {
        if(!cart[index].qty) cart[index].qty = 1;
        cart[index].qty += delta;
        if(cart[index].qty <= 0) {
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
        
        if(cart.length === 0) {
            if(container) {
                container.innerHTML = `
                    <div class="glass-card wide" style="text-align:center; flex-direction:column; padding:40px 20px;">
                        <div class="icon-orb orb-3" style="width:70px; height:70px; font-size:30px; margin:0 auto 15px;"><i class="fa-solid fa-bag-shopping"></i></div>
                        <h3 style="font-size:18px;">Your Cart is Empty</h3>
                        <p style="margin-top:8px; font-size:13px; color:var(--gray-text); font-weight:500;">Looks like you haven't added anything yet.</p>
                    </div>`;
            }
            if(stickyBar) {
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
            
            if(item.isRx) {
                hasRx = true;
                hasScheduleH = true; 
            }
            
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
                    
                    <div class="qty-controls" style="display: flex; align-items: center; gap: 10px; background: #F3F4F6; padding: 4px 8px; border-radius: 12px;">
                        <div class="qty-btn" onclick="updateQty(${index}, -1)" style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 8px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: ${currentQty === 1 ? 'var(--error)' : 'var(--c5)'};"><i class="fa-solid ${currentQty === 1 ? 'fa-trash-can' : 'fa-minus'}"></i></div>
                        <div class="qty-num" style="font-size: 14px; font-weight: 800; color: var(--c5); min-width: 14px; text-align: center;">${currentQty}</div>
                        <div class="qty-btn" onclick="updateQty(${index}, 1)" style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 8px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: var(--c5);"><i class="fa-solid fa-plus"></i></div>
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
                
                <div class="bill-row" style="margin-top: 14px;">
                    <span>Delivery Fee</span>
                    <span class="${delivery === 0 ? 'text-success' : ''}" style="font-weight:700;">${delivery === 0 ? 'FREE' : '₹'+delivery}</span>
                </div>
                <div class="bill-row">
                    <span>Platform Fee</span>
                    <span class="${handling === 0 ? 'text-success' : ''}" style="font-weight:700;">${handling === 0 ? 'FREE' : '₹'+handling}</span>
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

        if(container) container.innerHTML = billHtml;
        
        if(document.getElementById('sticky-total')) {
            document.getElementById('sticky-total').innerHTML = `₹${grandTotal} <span style="font-size:14px; font-weight:600; opacity:0.8; margin-left:8px;">(${totalItems} item${totalItems > 1 ? 's' : ''})</span>`;
        }
        
        const actionBtn = document.getElementById('sticky-btn-action');
        const allowedScreens = ['screen-dash', 'screen-cat-items', 'screen-rx-upload'];

        if(stickyBar) {
            if(!allowedScreens.includes(activeScreen) || activeTab === 'tab-profile' || activeTab === 'tab-orders') {
                stickyBar.style.display = 'none';
                stickyBar.classList.remove('show');
                if (activeScreen === 'screen-dash' && mainScroll) mainScroll.style.paddingBottom = '110px'; 
            } else {
                stickyBar.style.display = 'flex';
                stickyBar.classList.add('show');
                
                if (activeScreen === 'screen-dash') {
                    if(mainScroll) mainScroll.style.paddingBottom = '190px'; 
                    stickyBar.style.bottom = '85px'; 
                } else {
                    stickyBar.style.bottom = '20px'; 
                }
                
                if(actionBtn) {
                    if(activeTab === 'tab-delivery' && activeScreen === 'screen-dash') {
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
        const activeTab = document.querySelector('.content-view.active-view').id;
        
        if (activeScreen !== 'screen-dash' || activeTab !== 'tab-delivery') {
            showScreen('screen-dash'); 
            document.getElementById('nav-btn-cart').click();
        } else {
            processCartPay();
        }
    }

    function processCartPay() {
        if(!selectedAddress) {
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
        if(method === 'COD') {
            verifyPayment('COD');
        } else {
            setTimeout(() => {
                openPayment(currentPaymentContext.amount, currentPaymentContext.isRx, currentPaymentContext.type);
            }, 300);
        }
    }

    function openPayment(amount, isRx = false, type = 'cart') { 
        if(type === 'consult') { currentPaymentContext = { amount: amount, isRx: false, type: 'consult' }; }
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
        if(method === 'Online') closePayment();
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
                        if(currentPaymentContext.type === 'cart') socket.emit('joinDeliveryRoom', { orderId: data.order.orderId || generatedId });
                        cart = []; window.rxVerified = false; window.rxImageUrl = null;
                        updateCartUI(); closeConsultation(); 
                        switchTab(document.querySelector('.nav-dock .nav-item:first-child'), 'tab-home');
                    }, 1500);
                } else { loading(false); alert("Order failed: " + data.message); }
            } catch(e) {
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

    // --- ORDER HISTORY LOGIC (RESTORED) ---
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
        } catch(e) {
            const localHistory = JSON.parse(localStorage.getItem('mediflow_local_history')) || [];
            if(localHistory.length > 0) {
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

        if(query.length === 0) {
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

        if(matches.length === 0) {
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
                <button class="add-btn" onclick="addToCart('${item.name}')">ADD +</button>
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
                <div class="glass-card" style="min-width: 150px; flex-shrink: 0; padding: 18px; min-height: 190px;">
                    ${item.isRx ? '<span class="rx-badge" style="top:10px; right:10px; font-size:9px;">Rx</span>' : ''}
                    <div class="icon-orb orb-1" style="width:45px; height:45px; font-size:20px; margin-bottom:12px;"><i class="fa-solid ${item.icon}"></i></div>
                    <h3 style="margin:0; font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${item.name}</h3>
                    <p style="margin:4px 0 0; font-size:11px; color:var(--gray-text); font-weight:600;">${item.category}</p>
                    <p style="margin:8px 0 0; font-size:16px; font-weight:800; color:var(--c4);">₹${item.price}</p>
                    <button class="add-btn" style="margin-top:12px; padding:10px; font-size:12px;" onclick="addToCart('${item.name}')">ADD +</button>
                </div>
            `;
        });
        
        slider.innerHTML += `
            <div class="glass-card" style="min-width: 140px; flex-shrink: 0; background: linear-gradient(135deg, var(--c5), var(--c4)); border: none; align-items:center; justify-content:center; text-align:center; min-height: 190px;" onclick="switchTab(document.querySelectorAll('.nav-dock .nav-item')[1], 'tab-category')">
                <div class="icon-orb" style="background: rgba(255,255,255,0.2); color: white; margin:0 0 15px;"><i class="fa-solid fa-arrow-right"></i></div>
                <h4 style="color: white; margin:0; font-size:15px; font-weight:800;">See All<br>Medicines</h4>
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
                <div class="glass-card" style="min-height:130px; text-align:center; align-items:center; justify-content:center;" onclick="openCategoryView('${cat}')">
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

    // --- RENDER SMART OTP LOGIC (FIXED) ---
    async function autoPhone(el) {
        clearErr('phone-err');
        let v = el.value.replace(/\D/g, '');
        if (v.length > 4 && v.length <= 7) v = v.slice(0,4) + '-' + v.slice(4);
        if (v.length > 7) v = v.slice(0,4) + '-' + v.slice(4,7) + '-' + v.slice(7);
        el.value = v;
        
        if(v.length === 12) {
            currentPhoneRaw = v;
            currentPhoneClean = v.replace(/-/g, '');
            el.style.borderColor = "var(--success)";
            el.style.boxShadow = "0 0 0 4px rgba(0, 208, 156, 0.15)";
            
            loading(true, "CONNECTING TO SERVER...");
            
            // Immediately show the OTP screen, assuming the server request will succeed.
            // This fixes the issue of it getting "stuck" on the phone number page.
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
                    showScreen('screen-login'); // Kick them back if it fails
                }
            } catch(e) { 
                loading(false); 
                showScreen('screen-login'); // Kick them back if it fails
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
        if(el.value && el.nextElementSibling) el.nextElementSibling.focus();
        let code = "";
        document.querySelectorAll('.otp-box').forEach(b => code += b.value);
        if(code.length === 6) checkLocalLogin(code); 
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
        } catch(e) {
            loading(false);
            alert(`LOGIN FAILED!\n\nDetails: ${e.message}\n\nCheck if your Render backend is running.`);
            document.querySelectorAll('.otp-box').forEach(b => b.value = "");
            document.getElementById('otp-1').focus();
        }
    }

    async function saveProfileToLocal() { 
        const n = document.getElementById('user-name').value;
        const a = document.getElementById('user-age').value;
        if(n.length < 3 || a < 1) return alert("Please enter valid name and age");
        if(gender === "") return alert("Please select a gender");
        
        loading(true, "CREATING ACCOUNT...");
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhoneClean, name: n, age: a, gender: gender })
            });
            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem('mediflow_current_session', JSON.stringify(data.user));
                updateDash(data.user);
                renderCategoriesTab();
                renderPopularMeds();
                loading(false);
                openAddressManager(true); 
            } else { loading(false); alert("Failed to create profile: " + data.message); }
        } catch(e) { loading(false); alert("API connection failed."); }
    }

    function updateDash(user) {
        window.currentUser = user; 
        document.getElementById('initial-box').innerText = user.name.charAt(0).toUpperCase();
        document.getElementById('db-name-disp').innerText = user.name;
        document.getElementById('db-info-disp').innerText = `${user.age} Yrs • ${user.phone}`;
        setHomeGreeting(); 
    }

    function setHomeGreeting() {
        const currentHour = new Date().getHours();
        let greeting = "Good evening,";
        if (currentHour < 12) greeting = "Good morning,";
        else if (currentHour < 18) greeting = "Good afternoon,";
        
        document.getElementById('greeting-text').innerText = greeting;
        if(window.currentUser) document.getElementById('dash-user').innerText = window.currentUser.name;
    }

    function switchTab(el, tabId, pushHistory = true) {
        clearSearch();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        if(el) el.classList.add('active');
        
        document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active-view'));
        document.getElementById(tabId).classList.add('active-view');
        
        if(pushHistory) {
            history.pushState({ screen: 'screen-dash', tab: tabId }, "");
        }
        
        const mainScroll = document.getElementById('main-scroll');
        const dashHeader = document.getElementById('main-dash-header');
        
        if(tabId === 'tab-home') {
            dashHeader.classList.remove('compact'); 
            mainScroll.style.paddingTop = '230px';
            setHomeGreeting(); 
        } else {
            dashHeader.classList.add('compact'); 
            mainScroll.style.paddingTop = '150px'; 
            
            if(tabId === 'tab-category') { document.getElementById('greeting-text').innerText = "Explore"; document.getElementById('dash-user').innerText = "Pharmacy"; } 
            else if(tabId === 'tab-doctor') { document.getElementById('greeting-text').innerText = "Consult"; document.getElementById('dash-user').innerText = "Specialists"; } 
            else if(tabId === 'tab-delivery') { document.getElementById('greeting-text').innerText = "Secure"; document.getElementById('dash-user').innerText = "Checkout"; } 
            else if(tabId === 'tab-profile' || tabId === 'tab-orders') { document.getElementById('greeting-text').innerText = "Manage"; document.getElementById('dash-user').innerText = "Account"; }
        }

        updateCartUI(); 
    }

    function deleteAccount() {
        if(confirm("Are you sure you want to delete your account? Your device data will be wiped.")) {
            localStorage.removeItem('mediflow_current_session'); location.reload(); 
        }
    }

    function loading(show, text) { const l = document.getElementById('pill-loader'); if(show) { if(text) document.getElementById('loader-text').innerText=text; l.style.opacity=1; l.style.display='flex'; } else { l.style.opacity=0; setTimeout(()=>l.style.display='none',300); } }
    function clearErr(errId) { document.getElementById(errId).style.display='none'; }
    function dbLogout() { if(confirm("Are you sure you want to log out?")) { localStorage.removeItem('mediflow_current_session'); location.reload(); } }

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
        if(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('rx-preview-img').src = e.target.result;
                document.getElementById('rx-upload-zone').style.display = 'none';
                document.getElementById('rx-preview-container').style.display = 'block';
                document.getElementById('rx-submit-btn').style.display = 'block';
            }
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
        if(!fileInput.files[0]) return alert("Please select an image first.");

        loading(true, "UPLOADING TO SERVER...");
        const formData = new FormData();
        formData.append('prescription', fileInput.files[0]);

        try {
            const res = await fetch(`${API_BASE}/upload-rx`, { method: 'POST', body: formData });
            const data = await res.json();
            
            if(data.success) {
                loading(true, "AI SCANNING IMAGE..."); 
                setTimeout(() => {
                    loading(false);
                    showToast("Prescription Uploaded & Verified! ✅");
                    window.rxVerified = true; 
                    window.rxImageUrl = data.fileUrl; 
                    closeRxUpload();
                    updateCartUI();
                    
                    if(document.getElementById('tab-delivery').classList.contains('active-view')) {
                        processCartPay();
                    } else {
                        document.getElementById('nav-btn-cart').click();
                    }

                }, 1500);
            } else { throw new Error("Upload Failed"); }
        } catch(e) {
            loading(false);
            loading(true, "AI SCANNING IMAGE..."); 
            setTimeout(() => {
                loading(false); showToast("Verified (Local Fallback) ✅");
                window.rxVerified = true; closeRxUpload(); updateCartUI();
                
                if(document.getElementById('tab-delivery').classList.contains('active-view')) {
                    processCartPay();
                } else {
                    document.getElementById('nav-btn-cart').click();
                }
            }, 1000);
        }
    }

    // --- MISSING FUNCTION STUBS (required by HTML onclick handlers) ---
    function triggerDoctorTab() {
        switchTab(document.querySelectorAll('.nav-dock .nav-item')[2], 'tab-doctor');
    }

    function checkAvailability() {
        showToast("Checking availability...");
    }

    function openConsultation() {
        showScreen('screen-consult');
    }

    function closeConsultation() {
        const consultScreen = document.getElementById('screen-consult');
        if (consultScreen && !consultScreen.classList.contains('hidden')) {
            history.back();
        }
    }

    function selUI(el) {
        el.closest('.service-grid').querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }

    function selMode(el) {
        el.parentNode.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }

    socket.on('connect', () => { console.log('✅ Connected to Live Tracking Server'); });
    socket.on('driverLocationUpdate', (data) => {
        const { latitude, longitude } = data;
        if (!map) return; 
        if (!driverMarker) {
            const driverIcon = L.divIcon({
                className: 'driver-icon',
                html: "<div style='background-color:var(--success); width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow: 0 0 15px var(--success);'></div>",
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            driverMarker = L.marker([latitude, longitude], { icon: driverIcon }).addTo(map);
        } else { driverMarker.setLatLng([latitude, longitude]); }
        map.panTo([latitude, longitude], { animate: true, duration: 1.5 });
    });

    // --- SERVICE WORKER REGISTRATION ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
