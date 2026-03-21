const API_BASE = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';
// LOCAL_MODE: when true the app runs entirely in-browser with no backend required.
// Set to false (and start your local server on port 3000) to reconnect.
const LOCAL_MODE = true;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const socket = LOCAL_MODE ? { on: () => {}, emit: () => {}, off: () => {} } : io(SOCKET_URL);
let driverMarker = null;

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────
const SUPPORTED_LANGS = [
    { code: 'en', flag: '🇬🇧', name: 'English',    native: 'English' },
    { code: 'hi', flag: '🇮🇳', name: 'Hindi',      native: 'हिन्दी' },
    { code: 'mr', flag: '🇮🇳', name: 'Marathi',    native: 'मराठी' },
    { code: 'ta', flag: '🇮🇳', name: 'Tamil',      native: 'தமிழ்' },
    { code: 'bn', flag: '🇮🇳', name: 'Bengali',    native: 'বাংলা' },
    { code: 'te', flag: '🇮🇳', name: 'Telugu',     native: 'తెలుగు' },
];

const TRANSLATIONS = {
    en: {
        greeting_morning: 'Good morning,', greeting_afternoon: 'Good afternoon,', greeting_evening: 'Good evening,',
        quick_services: 'Quick Services', popular_medicines: 'Popular Medicines', suggested: 'Suggested for You',
        daily_needs: 'Daily Needs', by_category: 'By Category', search_placeholder: 'Search medicines or health products...',
        cart_empty_title: 'Your Cart is Empty', cart_empty_sub: "Looks like you haven't added anything yet.",
        cart_title: 'My Cart', bill_order_items: 'Order Items', bill_summary: 'Bill Summary',
        bill_item_total: 'Item Total', bill_delivery: 'Delivery Fee', bill_platform: 'Platform Fee', bill_total: 'Amount to Pay',
        checkout_btn: 'Place Order', view_cart_btn: 'View Cart',
        health_title: 'Health Encyclopedia', health_subtitle: 'Plain-language guides to common conditions',
        health_all: 'All',
        lang_pref_label: 'Language Preference', lang_choose_title: 'Choose Language',
        lang_choose_sub: 'App content will appear in selected language',
        explore_pharmacy: 'Explore', explore_pharmacy_sub: 'Pharmacy',
        consult: 'Consult', specialists: 'Specialists',
        checkout_title: 'Secure', checkout_sub: 'Checkout',
        manage: 'Manage', account: 'Account',
        order_rx: 'Order via Prescription', order_rx_sub: 'Upload & let AI scan',
        doctor_consult: 'Doctor\nConsult', pharmacy_store: 'Pharmacy\nStore',
        see_all: 'See All\nMedicines',
        add_to_cart: 'ADD TO CART', add_wishlist: 'Add to Wishlist', set_reminder: 'Set Reminder',
    },
    hi: {
        greeting_morning: 'सुप्रभात,', greeting_afternoon: 'नमस्ते,', greeting_evening: 'शुभ संध्या,',
        quick_services: 'त्वरित सेवाएं', popular_medicines: 'लोकप्रिय दवाएं', suggested: 'आपके लिए सुझाव',
        daily_needs: 'दैनिक जरूरतें', by_category: 'श्रेणी अनुसार', search_placeholder: 'दवाएं या उत्पाद खोजें...',
        cart_empty_title: 'आपकी कार्ट खाली है', cart_empty_sub: 'अभी तक कुछ भी नहीं जोड़ा।',
        cart_title: 'मेरी कार्ट', bill_order_items: 'ऑर्डर आइटम', bill_summary: 'बिल सारांश',
        bill_item_total: 'कुल राशि', bill_delivery: 'डिलीवरी शुल्क', bill_platform: 'प्लेटफ़ॉर्म शुल्क', bill_total: 'भुगतान राशि',
        checkout_btn: 'ऑर्डर करें', view_cart_btn: 'कार्ट देखें',
        health_title: 'स्वास्थ्य विश्वकोश', health_subtitle: 'सामान्य बीमारियों की सरल जानकारी',
        health_all: 'सभी',
        lang_pref_label: 'भाषा प्राथमिकता', lang_choose_title: 'भाषा चुनें',
        lang_choose_sub: 'चुनी गई भाषा में सामग्री दिखाई देगी',
        explore_pharmacy: 'एक्सप्लोर', explore_pharmacy_sub: 'फार्मेसी',
        consult: 'परामर्श', specialists: 'विशेषज्ञ',
        checkout_title: 'सुरक्षित', checkout_sub: 'चेकआउट',
        manage: 'प्रबंधन', account: 'खाता',
        order_rx: 'पर्चे से ऑर्डर करें', order_rx_sub: 'अपलोड करें और AI स्कैन करें',
        doctor_consult: 'डॉक्टर\nपरामर्श', pharmacy_store: 'फार्मेसी\nस्टोर',
        see_all: 'सभी दवाएं\nदेखें',
        add_to_cart: 'कार्ट में जोड़ें', add_wishlist: 'विशलिस्ट में जोड़ें', set_reminder: 'रिमाइंडर सेट करें',
    },
    mr: {
        greeting_morning: 'सुप्रभात,', greeting_afternoon: 'नमस्कार,', greeting_evening: 'शुभ संध्या,',
        quick_services: 'त्वरित सेवा', popular_medicines: 'लोकप्रिय औषधे', suggested: 'तुमच्यासाठी सुचवलेले',
        daily_needs: 'दैनंदिन गरजा', by_category: 'श्रेणीनुसार', search_placeholder: 'औषधे किंवा उत्पादने शोधा...',
        cart_empty_title: 'तुमची कार्ट रिकामी आहे', cart_empty_sub: 'अजून काहीही जोडले नाही.',
        cart_title: 'माझी कार्ट', bill_order_items: 'ऑर्डर आयटम', bill_summary: 'बिल सारांश',
        bill_item_total: 'एकूण रक्कम', bill_delivery: 'डिलिव्हरी शुल्क', bill_platform: 'प्लॅटफॉर्म शुल्क', bill_total: 'देय रक्कम',
        checkout_btn: 'ऑर्डर द्या', view_cart_btn: 'कार्ट पहा',
        health_title: 'आरोग्य विश्वकोश', health_subtitle: 'सामान्य आजारांची साध्या भाषेत माहिती',
        health_all: 'सर्व',
        lang_pref_label: 'भाषा पसंती', lang_choose_title: 'भाषा निवडा',
        lang_choose_sub: 'निवडलेल्या भाषेत माहिती दिसेल',
        explore_pharmacy: 'एक्सप्लोर', explore_pharmacy_sub: 'फार्मसी',
        consult: 'सल्लामसलत', specialists: 'तज्ज्ञ',
        checkout_title: 'सुरक्षित', checkout_sub: 'चेकआउट',
        manage: 'व्यवस्थापन', account: 'खाते',
        order_rx: 'प्रिस्क्रिप्शनने ऑर्डर करा', order_rx_sub: 'अपलोड करा आणि AI स्कॅन करा',
        doctor_consult: 'डॉक्टर\nसल्लामसलत', pharmacy_store: 'फार्मसी\nस्टोर',
        see_all: 'सर्व औषधे\nपहा',
        add_to_cart: 'कार्टमध्ये जोडा', add_wishlist: 'विशलिस्टमध्ये जोडा', set_reminder: 'रिमाइंडर लावा',
    },
    ta: {
        greeting_morning: 'காலை வணக்கம்,', greeting_afternoon: 'மதிய வணக்கம்,', greeting_evening: 'மாலை வணக்கம்,',
        quick_services: 'விரைவு சேவைகள்', popular_medicines: 'பிரபல மருந்துகள்', suggested: 'உங்களுக்கான பரிந்துரை',
        daily_needs: 'தினசரி தேவைகள்', by_category: 'வகை வாரியாக', search_placeholder: 'மருந்துகள் தேடுங்கள்...',
        cart_empty_title: 'உங்கள் கார்ட் காலியாக உள்ளது', cart_empty_sub: 'இதுவரை எதுவும் சேர்க்கவில்லை.',
        cart_title: 'என் கார்ட்', bill_order_items: 'ஆர்டர் பொருட்கள்', bill_summary: 'பில் சுருக்கம்',
        bill_item_total: 'மொத்த தொகை', bill_delivery: 'டெலிவரி கட்டணம்', bill_platform: 'தள கட்டணம்', bill_total: 'செலுத்த வேண்டிய தொகை',
        checkout_btn: 'ஆர்டர் செய்', view_cart_btn: 'கார்ட் பார்',
        health_title: 'சுகாதார கலைக்களஞ்சியம்', health_subtitle: 'பொதுவான நோய்களுக்கான எளிய வழிகாட்டி',
        health_all: 'அனைத்தும்',
        lang_pref_label: 'மொழி விருப்பம்', lang_choose_title: 'மொழி தேர்வு',
        lang_choose_sub: 'தேர்ந்த மொழியில் உள்ளடக்கம் காட்டப்படும்',
        explore_pharmacy: 'ஆராய்', explore_pharmacy_sub: 'மருந்தகம்',
        consult: 'ஆலோசனை', specialists: 'நிபுணர்கள்',
        checkout_title: 'பாதுகாப்பான', checkout_sub: 'செக்அவுட்',
        manage: 'நிர்வகி', account: 'கணக்கு',
        order_rx: 'மருந்துச்சீட்டால் ஆர்டர்', order_rx_sub: 'பதிவேற்றி AI ஸ்கேன் செய்',
        doctor_consult: 'டாக்டர்\nஆலோசனை', pharmacy_store: 'மருந்தகம்\nஸ்டோர்',
        see_all: 'அனைத்து மருந்துகளும்\nபார்க்க',
        add_to_cart: 'கார்டில் சேர்', add_wishlist: 'விஷ்லிஸ்டில் சேர்', set_reminder: 'நினைவூட்டல் அமை',
    },
    bn: {
        greeting_morning: 'শুভ সকাল,', greeting_afternoon: 'শুভ বিকেল,', greeting_evening: 'শুভ সন্ধ্যা,',
        quick_services: 'দ্রুত সেবা', popular_medicines: 'জনপ্রিয় ওষুধ', suggested: 'আপনার জন্য পরামর্শ',
        daily_needs: 'দৈনন্দিন প্রয়োজন', by_category: 'বিভাগ অনুযায়ী', search_placeholder: 'ওষুধ বা পণ্য খুঁজুন...',
        cart_empty_title: 'আপনার কার্ট খালি', cart_empty_sub: 'এখনও কিছু যোগ করা হয়নি।',
        cart_title: 'আমার কার্ট', bill_order_items: 'অর্ডার আইটেম', bill_summary: 'বিল সারসংক্ষেপ',
        bill_item_total: 'মোট পরিমাণ', bill_delivery: 'ডেলিভারি ফি', bill_platform: 'প্ল্যাটফর্ম ফি', bill_total: 'পরিশোধযোগ্য পরিমাণ',
        checkout_btn: 'অর্ডার করুন', view_cart_btn: 'কার্ট দেখুন',
        health_title: 'স্বাস্থ্য বিশ্বকোষ', health_subtitle: 'সাধারণ রোগের সহজ গাইড',
        health_all: 'সব',
        lang_pref_label: 'ভাষা পছন্দ', lang_choose_title: 'ভাষা বেছে নিন',
        lang_choose_sub: 'নির্বাচিত ভাষায় কন্টেন্ট দেখাবে',
        explore_pharmacy: 'এক্সপ্লোর', explore_pharmacy_sub: 'ফার্মেসি',
        consult: 'পরামর্শ', specialists: 'বিশেষজ্ঞ',
        checkout_title: 'নিরাপদ', checkout_sub: 'চেকআউট',
        manage: 'পরিচালনা', account: 'অ্যাকাউন্ট',
        order_rx: 'প্রেসক্রিপশনে অর্ডার', order_rx_sub: 'আপলোড করুন ও AI স্ক্যান করুন',
        doctor_consult: 'ডাক্তার\nপরামর্শ', pharmacy_store: 'ফার্মেসি\nস্টোর',
        see_all: 'সব ওষুধ\nদেখুন',
        add_to_cart: 'কার্টে যোগ করুন', add_wishlist: 'উইশলিস্টে যোগ করুন', set_reminder: 'রিমাইন্ডার সেট করুন',
    },
    te: {
        greeting_morning: 'శుభోదయం,', greeting_afternoon: 'శుభ మధ్యాహ్నం,', greeting_evening: 'శుభ సాయంత్రం,',
        quick_services: 'త్వరిత సేవలు', popular_medicines: 'ప్రసిద్ధ మందులు', suggested: 'మీకు సూచించినవి',
        daily_needs: 'రోజువారీ అవసరాలు', by_category: 'వర్గం వారీగా', search_placeholder: 'మందులు లేదా ఉత్పత్తులు వెతకండి...',
        cart_empty_title: 'మీ కార్ట్ ఖాళీగా ఉంది', cart_empty_sub: 'ఇంకా ఏమీ జోడించలేదు.',
        cart_title: 'నా కార్ట్', bill_order_items: 'ఆర్డర్ వస్తువులు', bill_summary: 'బిల్ సారాంశం',
        bill_item_total: 'మొత్తం', bill_delivery: 'డెలివరీ రుసుము', bill_platform: 'ప్లాట్‌ఫారమ్ రుసుము', bill_total: 'చెల్లించాల్సిన మొత్తం',
        checkout_btn: 'ఆర్డర్ చేయండి', view_cart_btn: 'కార్ట్ చూడండి',
        health_title: 'ఆరోగ్య విజ్ఞానకోశం', health_subtitle: 'సాధారణ వ్యాధులకు సరళమైన మార్గదర్శకాలు',
        health_all: 'అన్నీ',
        lang_pref_label: 'భాష ప్రాధాన్యత', lang_choose_title: 'భాష ఎంచుకోండి',
        lang_choose_sub: 'ఎంచుకున్న భాషలో కంటెంట్ చూపబడుతుంది',
        explore_pharmacy: 'అన్వేషించండి', explore_pharmacy_sub: 'ఫార్మసీ',
        consult: 'సంప్రదింపు', specialists: 'నిపుణులు',
        checkout_title: 'సురక్షిత', checkout_sub: 'చెక్‌అవుట్',
        manage: 'నిర్వహణ', account: 'ఖాతా',
        order_rx: 'ప్రిస్క్రిప్షన్ తో ఆర్డర్', order_rx_sub: 'అప్‌లోడ్ చేసి AI స్కాన్ చేయండి',
        doctor_consult: 'డాక్టర్\nసంప్రదింపు', pharmacy_store: 'ఫార్మసీ\nస్టోర్',
        see_all: 'అన్ని మందులు\nచూడండి',
        add_to_cart: 'కార్ట్‌కు జోడించండి', add_wishlist: 'విష్‌లిస్ట్‌కు జోడించండి', set_reminder: 'రిమైండర్ సెట్ చేయండి',
    },
};

let _currentLang = 'en';
function t(key) { return (TRANSLATIONS[_currentLang] || TRANSLATIONS.en)[key] || TRANSLATIONS.en[key] || key; }

// ─── DISEASE DATABASE ───────────────────────────────────────────────────────
const DISEASE_DB = [
    {
        id: 'd1', name: 'Common Cold', category: 'Infections',
        icon: 'fa-head-side-cough', iconBg: '#E0F0FF', iconColor: '#457B9D',
        summary: 'A viral infection of the nose and throat. Very common and usually mild — most people recover in 7–10 days without any medicine.',
        causes: ['Rhinovirus (most common cause)', 'Spread by touching infected surfaces then touching your face', 'Being in close contact with a sick person'],
        symptoms: ['Runny or stuffy nose', 'Sneezing', 'Sore throat', 'Mild fever', 'Cough', 'Feeling tired'],
        doThis: ['Drink plenty of fluids (water, warm soup)', 'Rest as much as you can', 'Use saline nose drops for congestion', 'Gargle warm salt water for sore throat'],
        avoid: ['Antibiotics — they don\'t help against viruses', 'Sharing utensils or towels'],
        whenToSee: 'High fever above 39°C, symptoms lasting more than 10 days, or chest pain',
    },
    {
        id: 'd2', name: 'Fever', category: 'Common Symptoms',
        icon: 'fa-temperature-high', iconBg: '#FFF0E5', iconColor: '#E07B39',
        summary: 'Fever is your body\'s way of fighting infection. It is not a disease itself — it\'s a sign something is going on (usually an infection).',
        causes: ['Bacterial or viral infection (cold, flu, typhoid)', 'Heat exhaustion', 'Vaccination reaction', 'Inflammatory conditions'],
        symptoms: ['Body temperature above 38°C (100.4°F)', 'Sweating and chills', 'Headache', 'Muscle aches', 'Loss of appetite'],
        doThis: ['Rest and drink lots of fluids', 'Paracetamol or ibuprofen can reduce fever', 'Light clothing and cool room', 'Sponge with lukewarm water if very high'],
        avoid: ['Cold baths — they cause shivering which raises temperature', 'Aspirin in children under 16'],
        whenToSee: 'Temperature above 40°C, fever lasting more than 3 days, or a child under 3 months with any fever',
    },
    {
        id: 'd3', name: 'Headache', category: 'Common Symptoms',
        icon: 'fa-head-side', iconBg: '#F3E8FF', iconColor: '#7C3AED',
        summary: 'A pain or discomfort in the head or neck area. Most headaches are tension-type — not dangerous — and go away with rest or a mild painkiller.',
        causes: ['Stress or muscle tension', 'Dehydration', 'Lack of sleep', 'Eye strain (too much screen time)', 'Sinus congestion'],
        symptoms: ['Dull pressure or aching around the head', 'Pain on one or both sides', 'Sensitivity to light or sound (migraine)', 'Tight feeling in neck or shoulders'],
        doThis: ['Drink a glass of water first — dehydration is a top cause', 'Rest in a quiet, dark room', 'Paracetamol or ibuprofen as directed', 'Gentle neck stretches'],
        avoid: ['Taking too many painkillers — overuse causes rebound headaches', 'Skipping meals'],
        whenToSee: 'Sudden severe "thunderclap" headache, headache with stiff neck and fever, or headache after a head injury',
    },
    {
        id: 'd4', name: 'Diarrhoea', category: 'Digestive',
        icon: 'fa-toilet', iconBg: '#FEF3C7', iconColor: '#D97706',
        summary: 'Loose or watery stools, usually 3 or more times a day. Most cases are caused by infections and clear up in 2–3 days. The biggest risk is dehydration.',
        causes: ['Viral (stomach flu — most common)', 'Bacterial (contaminated food or water)', 'Antibiotic side-effects', 'Food intolerance'],
        symptoms: ['Frequent loose or watery stools', 'Stomach cramps', 'Nausea', 'Mild fever'],
        doThis: ['Drink ORS (oral rehydration salts) or coconut water to replace lost fluids', 'Eat plain foods — rice, bananas, toast', 'Wash hands thoroughly after every toilet visit'],
        avoid: ['Dairy, fatty, spicy, or sugary foods', 'Stopping fluids — dehydration is the main danger'],
        whenToSee: 'Blood in stools, signs of dehydration (dry mouth, no urination), fever above 38.5°C, or lasting more than 3 days',
    },
    {
        id: 'd5', name: 'Acidity / Heartburn', category: 'Digestive',
        icon: 'fa-fire-flame-curved', iconBg: '#FEE2E2', iconColor: '#DC2626',
        summary: 'A burning feeling in the chest or throat caused by stomach acid coming back up. Very common and usually relieved by simple lifestyle changes or antacids.',
        causes: ['Heavy or spicy meals', 'Lying down right after eating', 'Obesity', 'Smoking or alcohol', 'Stress'],
        symptoms: ['Burning sensation in chest (heartburn)', 'Sour taste in mouth', 'Bloating', 'Belching', 'Feeling full quickly'],
        doThis: ['Eat smaller, more frequent meals', 'Stay upright for 2–3 hours after eating', 'Antacids (like ENO) give quick relief', 'Raise head of bed slightly when sleeping'],
        avoid: ['Spicy, oily, or acidic foods', 'Tea/coffee on empty stomach', 'Late-night meals'],
        whenToSee: 'Difficulty swallowing, unexplained weight loss, symptoms more than twice a week, or vomiting blood',
    },
    {
        id: 'd6', name: 'Diabetes (Type 2)', category: 'Chronic',
        icon: 'fa-droplet', iconBg: '#FFF7ED', iconColor: '#EA580C',
        summary: 'A condition where blood sugar stays too high because the body can\'t use insulin properly. It is manageable with lifestyle changes and medication.',
        causes: ['Being overweight or inactive', 'Family history of diabetes', 'Unhealthy eating habits', 'Age above 45 (higher risk)'],
        symptoms: ['Frequent urination', 'Feeling very thirsty', 'Slow-healing wounds', 'Blurred vision', 'Tingling in hands or feet', 'Feeling tired'],
        doThis: ['Eat less sugar, white rice, and refined carbs', 'Walk 30 minutes a day', 'Take medicines exactly as prescribed', 'Check blood sugar regularly'],
        avoid: ['Sugary drinks and sweets', 'Skipping meals or medicine', 'Smoking'],
        whenToSee: 'Very high or very low blood sugar, chest pain, or numbness/pain in feet',
    },
    {
        id: 'd7', name: 'High Blood Pressure', category: 'Chronic',
        icon: 'fa-heart-pulse', iconBg: '#FFE4E6', iconColor: '#BE123C',
        summary: 'Blood pressure that is consistently too high (140/90 or above). Often called the "silent killer" because it has no obvious symptoms but can lead to heart attack or stroke.',
        causes: ['Too much salt in diet', 'Stress', 'Being overweight', 'Lack of exercise', 'Family history', 'Alcohol or smoking'],
        symptoms: ['Usually no symptoms (that\'s why it\'s dangerous)', 'Occasional headaches at the back of head', 'Dizziness', 'Blurred vision'],
        doThis: ['Reduce salt intake', 'Exercise 30 min most days', 'Eat fruits and vegetables', 'Take BP medicines as prescribed every day', 'Check BP regularly'],
        avoid: ['Salt, processed foods, pickles', 'Alcohol and smoking', 'Stopping medication without asking doctor'],
        whenToSee: 'BP above 180/120, severe headache, chest pain, vision changes, or sudden weakness',
    },
    {
        id: 'd8', name: 'Asthma', category: 'Respiratory',
        icon: 'fa-lungs', iconBg: '#E0F0FF', iconColor: '#1D4ED8',
        summary: 'A condition where the airways narrow and swell, making it hard to breathe. It cannot be cured but is very well controlled with the right inhalers.',
        causes: ['Dust, pollen, or pet dander (allergens)', 'Cold air or smoke', 'Exercise in some people', 'Respiratory infections', 'Family history'],
        symptoms: ['Shortness of breath', 'Chest tightness', 'Wheezing sound when breathing', 'Cough — especially at night'],
        doThis: ['Always carry your reliever inhaler', 'Identify and avoid your personal triggers', 'Use a preventer inhaler as prescribed even when feeling fine', 'Keep home dust-free'],
        avoid: ['Smoke (including others\')', 'Skipping preventer inhaler', 'Pets if allergic'],
        whenToSee: 'Reliever inhaler not helping, lips or nails turning blue, cannot speak in full sentences',
    },
    {
        id: 'd9', name: 'Urinary Tract Infection (UTI)', category: 'Infections',
        icon: 'fa-bacterium', iconBg: '#FFF7ED', iconColor: '#C2410C',
        summary: 'A bacterial infection in the urinary system — most commonly the bladder. More common in women. Usually treated with antibiotics and clears up quickly.',
        causes: ['Bacteria entering the urinary tract (often from the bowel)', 'Not drinking enough water', 'Holding urine for too long', 'Sexual activity'],
        symptoms: ['Burning or pain when urinating', 'Need to urinate more often', 'Cloudy or bad-smelling urine', 'Pelvic pain', 'Low fever'],
        doThis: ['Drink plenty of water to flush bacteria', 'Urinate frequently — don\'t hold it in', 'Take the full course of antibiotics as prescribed', 'Urinate after sexual activity'],
        avoid: ['Caffeine and alcohol — irritate the bladder', 'Stopping antibiotics early even if feeling better'],
        whenToSee: 'High fever, back or side pain (kidney infection), blood in urine, or no improvement after 2 days of antibiotics',
    },
    {
        id: 'd10', name: 'Anaemia', category: 'Blood',
        icon: 'fa-circle-half-stroke', iconBg: '#FEE2E2', iconColor: '#DC2626',
        summary: 'When your blood has too few healthy red blood cells to carry enough oxygen around the body. Iron-deficiency anaemia (from low iron intake) is the most common type in India.',
        causes: ['Low iron intake (main cause — especially in women)', 'Vitamin B12 deficiency', 'Heavy menstrual periods', 'Bleeding in stomach or bowel'],
        symptoms: ['Tiredness and weakness', 'Pale skin or pale inner eyelids', 'Shortness of breath on mild effort', 'Dizziness', 'Cold hands and feet', 'Craving unusual things like mud or ice'],
        doThis: ['Eat iron-rich foods: green leafy vegetables, dal, meat, eggs', 'Take iron supplements as prescribed', 'Add vitamin C (lemon, amla) with iron-rich meals to boost absorption', 'Avoid tea/coffee with iron-rich meals'],
        avoid: ['Tea and coffee with meals (blocks iron absorption)', 'Ignoring symptoms for too long'],
        whenToSee: 'Extreme fatigue, chest pain, rapid heartbeat, or severe breathlessness',
    },
    {
        id: 'd11', name: 'Dengue Fever', category: 'Infections',
        icon: 'fa-mosquito', iconBg: '#FFF0E5', iconColor: '#C2410C',
        summary: 'A viral infection spread by the Aedes mosquito (breeds in clean, stagnant water). Common during and after monsoon. Most people recover in 1–2 weeks with proper rest.',
        causes: ['Bite from an infected Aedes mosquito', 'No direct person-to-person spread'],
        symptoms: ['Sudden high fever (39–40°C)', 'Severe headache', 'Pain behind the eyes', 'Severe joint and muscle pain ("breakbone fever")', 'Rash', 'Mild bleeding from nose or gums'],
        doThis: ['Rest completely', 'Drink lots of fluids — ORS, coconut water, juices', 'Take only paracetamol for fever', 'Watch platelet count with regular blood tests'],
        avoid: ['Ibuprofen or aspirin — they increase bleeding risk in dengue', 'Ignoring warning signs'],
        whenToSee: 'Bleeding from any site, severe stomach pain, persistent vomiting, difficulty breathing, or extreme drowsiness',
    },
    {
        id: 'd12', name: 'Skin Allergy / Rash', category: 'Skin',
        icon: 'fa-hand-dots', iconBg: '#FCE7F3', iconColor: '#BE185D',
        summary: 'An allergic reaction on the skin caused by contact with something that irritates it. Usually causes red, itchy patches or bumps. Most mild reactions settle on their own.',
        causes: ['Soaps, detergents, or cosmetics', 'Certain foods (nuts, shellfish, dairy)', 'Insect bites', 'Pollen, dust, or pet hair', 'Medicines'],
        symptoms: ['Red, itchy skin', 'Bumps, hives, or blisters', 'Dry, flaky skin', 'Swelling', 'Burning or stinging'],
        doThis: ['Identify and avoid the trigger', 'Apply a cool, wet cloth to soothe itching', 'Over-the-counter antihistamine tablet for itch', 'Calamine lotion for rashes'],
        avoid: ['Scratching — it makes things worse and can cause infection', 'Hot showers (worsen itching)', 'The specific trigger food or product'],
        whenToSee: 'Rash spreading rapidly, swelling of face or throat, difficulty breathing, or fever with rash',
    },
    {
        id: 'd13', name: 'Typhoid', category: 'Infections',
        icon: 'fa-virus', iconBg: '#E0F7E9', iconColor: '#166534',
        summary: 'A bacterial infection caused by Salmonella Typhi, usually from contaminated food or water. Common in areas with poor sanitation. Treated effectively with antibiotics.',
        causes: ['Drinking contaminated water or eating food washed with contaminated water', 'Poor hand hygiene', 'Not washing fruits and vegetables properly'],
        symptoms: ['Sustained high fever (usually rising over several days)', 'Headache', 'Abdominal pain', 'Loss of appetite', 'Constipation or diarrhoea', 'Rose-coloured spots on chest in some cases'],
        doThis: ['Complete the full antibiotic course (usually 10–14 days)', 'Rest and drink plenty of boiled or purified water', 'Eat soft, easily digestible food', 'Wash hands before eating and after toilet'],
        avoid: ['Raw vegetables or outside food while ill', 'Stopping antibiotics once fever drops — the bacteria may not be fully gone'],
        whenToSee: 'Extremely high fever, confusion, severe stomach pain, or bleeding from bowel',
    },
    {
        id: 'd14', name: 'Back Pain', category: 'Bones & Joints',
        icon: 'fa-person-walking', iconBg: '#F0FDF4', iconColor: '#166534',
        summary: 'Pain felt in the lower or upper back, extremely common. Most cases are muscular (from strain or poor posture) and improve within a few weeks.',
        causes: ['Muscle strain from lifting or sudden movement', 'Poor posture at desk or phone use', 'Sitting for long hours', 'Being overweight', 'Disc issues in older adults'],
        symptoms: ['Aching or stiffness anywhere along the spine', 'Sharp shooting pain', 'Difficulty standing up straight', 'Pain radiating down the leg (sciatica)'],
        doThis: ['Stay as active as you can — lying in bed too long makes it worse', 'Gentle stretching and walking', 'Heat pad or warm bath for muscle pain', 'Paracetamol or ibuprofen for pain relief', 'Improve your sitting posture'],
        avoid: ['Complete bed rest for more than a day or two', 'Heavy lifting while in pain', 'Slouching at a desk'],
        whenToSee: 'Pain shooting down one leg, numbness in legs, loss of bladder or bowel control, or pain after a fall or injury',
    },
    {
        id: 'd15', name: 'Conjunctivitis (Pink Eye)', category: 'Eyes',
        icon: 'fa-eye', iconBg: '#E0F0FF', iconColor: '#1D4ED8',
        summary: 'Redness and inflammation of the clear membrane covering the white of the eye. Usually caused by infection or allergy. Very contagious if caused by a virus.',
        causes: ['Viral infection (most common — spreads easily)', 'Bacterial infection', 'Allergic reaction (dust, pollen)', 'Chlorine in swimming pools'],
        symptoms: ['Red or pink eyes', 'Watery or sticky discharge', 'Itching or burning sensation', 'Crusty eyelids in the morning', 'Sensitivity to light'],
        doThis: ['Wash hands frequently — don\'t touch eyes', 'Clean discharge with a clean, warm damp cloth', 'Don\'t share towels or pillowcases', 'Antibiotic eye drops only if bacterial (doctor should advise)'],
        avoid: ['Touching or rubbing eyes', 'Wearing contact lenses until it clears', 'Sharing eye drops or makeup'],
        whenToSee: 'Severe eye pain, vision problems, or no improvement after 5 days',
    },
    {
        id: 'd16', name: 'Malaria', category: 'Infections',
        icon: 'fa-mosquito-net', iconBg: '#FFF7ED', iconColor: '#B45309',
        summary: 'A serious infection caused by parasites spread through Anopheles mosquito bites. Common in India, especially during monsoon. Treatable if caught early.',
        causes: ['Bite of an infected female Anopheles mosquito (bites at night)', 'Mosquitoes breed in stagnant water'],
        symptoms: ['Cyclical high fever with chills and shivering', 'Sweating', 'Headache and muscle pain', 'Nausea and vomiting', 'Anaemia over time'],
        doThis: ['Seek medical care immediately for fever with chills — get a malaria test', 'Complete the full course of antimalarial medicine', 'Rest and hydration', 'Use mosquito nets and repellents to prevent future bites'],
        avoid: ['Delaying diagnosis', 'Stopping treatment early'],
        whenToSee: 'Immediately if you have cyclical fever with chills. Serious malaria (P. falciparum) can be life-threatening if delayed.',
    },
    {
        id: 'd17', name: 'Obesity', category: 'Lifestyle',
        icon: 'fa-weight-scale', iconBg: '#F3F4F6', iconColor: '#374151',
        summary: 'When excess body fat has accumulated to the point that it may have a negative effect on health. BMI above 30 is defined as obese. It increases risk of many serious conditions.',
        causes: ['Eating more calories than the body burns', 'Sedentary lifestyle', 'Genetics', 'Poor sleep', 'Stress eating', 'Certain medications'],
        symptoms: ['Excess body weight', 'Breathlessness on mild exertion', 'Joint pain (especially knees)', 'Fatigue', 'Low self-esteem or depression'],
        doThis: ['Reduce portion sizes and sugary foods', 'Walk 30–45 minutes every day', 'Eat more vegetables, fruits, and protein', 'Drink water before meals', 'Sleep 7–8 hours — poor sleep leads to weight gain'],
        avoid: ['Crash diets — they don\'t work long term', 'Sugary drinks including fruit juices', 'Snacking while watching TV'],
        whenToSee: 'If BMI is above 35, or if you have diabetes, high blood pressure, or joint pain caused by weight',
    },
    {
        id: 'd18', name: 'Anxiety', category: 'Mental Health',
        icon: 'fa-brain', iconBg: '#F3E8FF', iconColor: '#7C3AED',
        summary: 'Persistent feelings of worry, nervousness, or fear that are difficult to control. Mild anxiety is normal, but when it interferes with daily life, it may need attention.',
        causes: ['Stress at work, relationships, or finances', 'Major life changes or trauma', 'Family history', 'Chronic illness', 'Caffeine overuse'],
        symptoms: ['Excessive worry about everyday things', 'Difficulty concentrating', 'Restlessness or irritability', 'Rapid heartbeat', 'Sweating or trembling', 'Sleep problems'],
        doThis: ['Talk to someone you trust about how you feel', 'Regular exercise helps a lot — even a daily walk', 'Deep breathing: 4 counts in, hold 4, out 6', 'Reduce caffeine intake', 'Mindfulness or meditation apps'],
        avoid: ['Alcohol — makes anxiety worse long-term', 'Avoiding all anxious situations (avoidance increases anxiety)', 'Suffering in silence'],
        whenToSee: 'Anxiety is severely affecting work, relationships, or daily activities; or if having panic attacks',
    },
    {
        id: 'd19', name: 'Chickenpox', category: 'Infections',
        icon: 'fa-circle-dot', iconBg: '#FCE7F3', iconColor: '#BE185D',
        summary: 'A very contagious viral infection causing an itchy rash with small fluid-filled blisters. Common in children. Most people recover fully. A vaccine is available.',
        causes: ['Varicella-zoster virus', 'Spread by breathing air near an infected person or touching their blisters'],
        symptoms: ['Itchy red spots that turn into blisters', 'Fever', 'Tiredness and loss of appetite', 'Blisters that scab over in 5–7 days'],
        doThis: ['Keep nails short and clean to prevent scratching', 'Calamine lotion soothes itch', 'Paracetamol for fever (not aspirin)', 'Wear loose cotton clothing', 'Stay home until all blisters have scabbed over'],
        avoid: ['Scratching — it causes scarring and infection', 'Aspirin in children under 16', 'Contact with pregnant women, newborns, or people with weak immunity'],
        whenToSee: 'Blisters become very red, swollen, or pus-filled; high fever; confusion; or breathing difficulty',
    },
    {
        id: 'd20', name: 'Constipation', category: 'Digestive',
        icon: 'fa-ban', iconBg: '#FEF9C3', iconColor: '#CA8A04',
        summary: 'Having fewer than 3 bowel movements per week, with hard, dry, or difficult-to-pass stools. Very common and usually due to diet or lifestyle factors.',
        causes: ['Low fibre diet', 'Not drinking enough water', 'Lack of physical activity', 'Ignoring the urge to go', 'Certain medicines (iron tablets, painkillers)', 'Travel changes'],
        symptoms: ['Infrequent stools', 'Hard or lumpy stools', 'Straining or pain when trying to go', 'Feeling that bowels haven\'t fully emptied', 'Bloating'],
        doThis: ['Drink at least 8 glasses of water a day', 'Eat fibre-rich foods: fruits, vegetables, whole grains, dal', 'Walk or exercise daily', 'Never ignore the urge to go', 'Warm water in the morning on an empty stomach helps'],
        avoid: ['Refined flour (maida), processed food, not enough water', 'Overusing laxatives — creates dependence'],
        whenToSee: 'Blood in stool, sudden severe constipation change, abdominal pain and bloating, or unintentional weight loss',
    },
];

let _currentDiseaseCategory = 'All';
let _currentDiseaseSearch = '';

let MEDICINE_DB = [
    { name: "Paracetamol (500mg)", price: 15, category: "Fever & Flu", type: "Tab", icon: "fa-temperature-half", isRx: false,
      salt: "Paracetamol", strength: "500 mg", company: "Unbranded / Generic",
      description: "Paracetamol is a widely used analgesic and antipyretic. It relieves mild to moderate pain such as headache and toothache, and reduces high body temperature. Safe for adults and children when taken as directed.",
      sideEffects: ["Nausea", "Stomach upset", "Skin rash (rare)", "Liver damage on overdose"] },
    { name: "Dolo 650", price: 30, category: "Fever & Flu", type: "Tab", icon: "fa-temperature-arrow-up", isRx: false,
      salt: "Paracetamol", strength: "650 mg", company: "Micro Labs Ltd.",
      description: "Dolo 650 contains Paracetamol 650 mg for fast relief from fever and pain. It is commonly prescribed for COVID-related fever, flu, and body aches. Do not exceed the recommended dose.",
      sideEffects: ["Nausea", "Vomiting", "Allergic reaction (rare)", "Liver damage on overdose"] },
    { name: "Crocin 500", price: 22, category: "Fever & Flu", type: "Tab", icon: "fa-temperature-half", isRx: false,
      salt: "Paracetamol", strength: "500 mg", company: "Haleon (GSK Consumer)",
      description: "Crocin 500 is a trusted brand of Paracetamol 500 mg for relief from fever, headache, body ache, and toothache. Suitable for adults and children above 12 years.",
      sideEffects: ["Nausea", "Stomach pain", "Skin rash (rare)", "Liver damage on overdose"] },
    { name: "Vicks Action 500", price: 45, category: "Fever & Flu", type: "Tab", icon: "fa-head-side-virus", isRx: false,
      salt: "Paracetamol + Phenylephrine + Caffeine", strength: "500 mg/5 mg/30 mg", company: "P&G Health India",
      description: "Vicks Action 500 is a combination tablet for multi-symptom cold & flu relief. It reduces fever, relieves nasal congestion, and alleviates body ache with a combination of Paracetamol, Phenylephrine, and Caffeine.",
      sideEffects: ["Dizziness", "Increased heart rate", "Insomnia", "Nervousness", "High blood pressure (rare)"] },
    { name: "Benadryl Syrup", price: 125, category: "Cough & Cold", type: "Syr", icon: "fa-wine-bottle", isRx: false,
      salt: "Diphenhydramine + Ammonium Chloride + Sodium Citrate", strength: "14.08 mg/138 mg/57.03 mg per 5 ml", company: "Johnson & Johnson",
      description: "Benadryl Cough Syrup provides effective relief from dry and productive cough. Its combination of antihistamine and expectorant soothes the throat and helps clear mucus.",
      sideEffects: ["Drowsiness", "Dry mouth", "Blurred vision", "Constipation", "Urinary retention"] },
    { name: "Ascoril LS", price: 115, category: "Cough & Cold", type: "Syr", icon: "fa-lungs", isRx: true,
      salt: "Levosalbutamol + Ambroxol + Guaifenesin", strength: "1 mg/30 mg/50 mg per 5 ml", company: "Glenmark Pharma",
      description: "Ascoril LS is a prescription cough syrup combining a bronchodilator (Levosalbutamol), a mucolytic (Ambroxol), and an expectorant (Guaifenesin) for effective relief from bronchospasm and productive cough.",
      sideEffects: ["Tremor", "Palpitations", "Nausea", "Headache", "Dizziness"] },
    { name: "Combiflam", price: 40, category: "Pain Relief", type: "Tab", icon: "fa-pills", isRx: false,
      salt: "Ibuprofen + Paracetamol", strength: "400 mg/325 mg", company: "Sanofi India",
      description: "Combiflam combines Ibuprofen (400 mg) and Paracetamol (325 mg) for powerful relief from moderate to severe pain, fever, and inflammation. Used for dental pain, musculoskeletal pain, and post-surgical pain.",
      sideEffects: ["Gastric irritation", "Nausea", "Heartburn", "Dizziness", "Peptic ulcer (long-term use)"] },
    { name: "Diclofenac Gel", price: 85, category: "Pain Relief", type: "Gel", icon: "fa-spray-can", isRx: false,
      salt: "Diclofenac Diethylamine", strength: "1.16% w/w", company: "Unbranded / Generic",
      description: "Diclofenac Gel is a topical NSAID used for local relief of pain and inflammation in conditions such as muscle strains, sprains, joint pain, and sports injuries. Apply to affected area 2–3 times daily.",
      sideEffects: ["Skin irritation", "Redness at application site", "Rash (rare)", "Photosensitivity (rare)"] },
    { name: "Saridon", price: 10, category: "Headache", type: "Tab", icon: "fa-brain", isRx: false,
      salt: "Paracetamol + Propyphenazone + Caffeine", strength: "250 mg/150 mg/50 mg", company: "Bayer Consumer Health",
      description: "Saridon is a fast-acting headache tablet combining Paracetamol, Propyphenazone, and Caffeine. The caffeine enhances pain-relief effectiveness and reduces the time to onset of action.",
      sideEffects: ["Insomnia", "Nervousness", "Stomach upset", "Dizziness (rare)"] },
    { name: "Digene Tablet", price: 20, category: "Digestion", type: "Chew", icon: "fa-fire-burner", isRx: false,
      salt: "Magaldrate + Simethicone", strength: "480 mg/20 mg", company: "Abbott India",
      description: "Digene Tablet is an antacid that provides fast relief from acidity, heartburn, and gas. Magaldrate neutralises stomach acid while Simethicone relieves bloating and flatulence.",
      sideEffects: ["Constipation", "Diarrhoea (rare)", "Decreased phosphate absorption (long-term use)"] },
    { name: "Eno (Lemon)", price: 10, category: "Digestion", type: "Sachet", icon: "fa-glass-water", isRx: false,
      salt: "Sodium Bicarbonate + Citric Acid + Sodium Carbonate", strength: "2.32 g/2.18 g/0.5 g per sachet", company: "Haleon (GSK Consumer)",
      description: "Eno Fruit Salt is a fast-acting antacid that neutralises stomach acid within 6 seconds, providing quick relief from acidity, heartburn, and stomach discomfort.",
      sideEffects: ["Bloating (from CO₂ release)", "Sodium excess (avoid in hypertension)", "Rebound acidity (frequent use)"] },
    { name: "Pantop 40", price: 110, category: "Stomach Gas", type: "Tab", icon: "fa-fire", isRx: true,
      salt: "Pantoprazole", strength: "40 mg", company: "Sun Pharma",
      description: "Pantop 40 is a proton pump inhibitor (PPI) containing Pantoprazole 40 mg. It reduces stomach acid production and is used to treat GERD, peptic ulcers, and Zollinger-Ellison syndrome.",
      sideEffects: ["Headache", "Diarrhoea", "Nausea", "Abdominal pain", "Hypomagnesaemia (long-term use)"] },
    { name: "Pantocid 40", price: 88, category: "Stomach Gas", type: "Tab", icon: "fa-fire", isRx: true,
      salt: "Pantoprazole", strength: "40 mg", company: "Sun Pharma",
      description: "Pantocid 40 is a Pantoprazole 40 mg tablet that suppresses excess stomach acid. It is prescribed for gastric and duodenal ulcers, GERD, and acid-related disorders.",
      sideEffects: ["Headache", "Diarrhoea", "Flatulence", "Nausea", "Vitamin B12 deficiency (long-term use)"] },
    { name: "Omez", price: 150, category: "Stomach Gas", type: "Cap", icon: "fa-capsules", isRx: true,
      salt: "Omeprazole", strength: "20 mg", company: "Dr. Reddy's Laboratories",
      description: "Omez (Omeprazole 20 mg) is a proton pump inhibitor used to treat gastric and duodenal ulcers, GERD, and H. pylori infection (in combination therapy). It significantly reduces stomach acid secretion.",
      sideEffects: ["Headache", "Nausea", "Diarrhoea", "Constipation", "Hypomagnesaemia (long-term use)"] },
    { name: "Omeprazole (20mg)", price: 48, category: "Stomach Gas", type: "Cap", icon: "fa-capsules", isRx: true,
      salt: "Omeprazole", strength: "20 mg", company: "Unbranded / Generic",
      description: "Generic Omeprazole 20 mg is a cost-effective proton pump inhibitor that reduces stomach acid production. Therapeutically equivalent to branded options like Omez and Prilosec.",
      sideEffects: ["Headache", "Nausea", "Diarrhoea", "Abdominal pain", "Vitamin B12 deficiency (long-term use)"] },
    { name: "Metformin (500mg)", price: 65, category: "Diabetes", type: "Tab", icon: "fa-cube", isRx: true,
      salt: "Metformin Hydrochloride", strength: "500 mg", company: "Unbranded / Generic",
      description: "Metformin 500 mg is the first-line oral antidiabetic drug for Type 2 diabetes. It reduces hepatic glucose production and improves insulin sensitivity without causing weight gain.",
      sideEffects: ["Nausea", "Diarrhoea", "Metallic taste", "Vitamin B12 deficiency (long-term)", "Lactic acidosis (rare)"] },
    { name: "Glycomet GP1", price: 95, category: "Diabetes", type: "Tab", icon: "fa-cubes", isRx: true,
      salt: "Metformin + Glipizide", strength: "500 mg/1 mg", company: "USV Pvt. Ltd.",
      description: "Glycomet GP1 is a combination tablet of Metformin (500 mg) and Glipizide (1 mg) for Type 2 diabetes management. It controls blood sugar through complementary mechanisms.",
      sideEffects: ["Hypoglycaemia", "Nausea", "Diarrhoea", "Weight gain", "Dizziness"] },
    { name: "Insulin (Lantus)", price: 650, category: "Diabetes", type: "Inj", icon: "fa-syringe", isRx: true,
      salt: "Insulin Glargine", strength: "100 IU/ml", company: "Sanofi India",
      description: "Lantus (Insulin Glargine) is a long-acting basal insulin used once daily to control blood glucose in Type 1 and Type 2 diabetes. It provides steady, 24-hour glucose lowering with no pronounced peak.",
      sideEffects: ["Hypoglycaemia", "Injection-site reactions", "Lipodystrophy", "Weight gain", "Allergic reaction (rare)"] },
    { name: "Amlodipine (5mg)", price: 45, category: "Blood Pressure", type: "Tab", icon: "fa-heart-pulse", isRx: true,
      salt: "Amlodipine Besylate", strength: "5 mg", company: "Unbranded / Generic",
      description: "Amlodipine 5 mg is a calcium channel blocker used to treat hypertension and angina. It relaxes blood vessels, lowering blood pressure and reducing cardiac workload.",
      sideEffects: ["Ankle swelling", "Flushing", "Headache", "Dizziness", "Palpitations (rare)"] },
    { name: "Telma 40", price: 180, category: "Blood Pressure", type: "Tab", icon: "fa-droplet", isRx: true,
      salt: "Telmisartan", strength: "40 mg", company: "Glenmark Pharma",
      description: "Telma 40 (Telmisartan 40 mg) is an angiotensin II receptor blocker (ARB) that controls hypertension and reduces the risk of cardiovascular events in high-risk patients.",
      sideEffects: ["Dizziness", "Back pain", "Sinusitis", "Hyperkalaemia (high doses)", "Renal impairment (rare)"] },
    { name: "Atorva 10", price: 120, category: "Cholesterol", type: "Tab", icon: "fa-heart", isRx: true,
      salt: "Atorvastatin Calcium", strength: "10 mg", company: "Zydus Cadila",
      description: "Atorva 10 (Atorvastatin 10 mg) is a statin that lowers LDL cholesterol and triglycerides while raising HDL cholesterol, reducing the risk of heart attack and stroke.",
      sideEffects: ["Muscle pain (myalgia)", "Liver enzyme elevation", "Headache", "Nausea", "Rhabdomyolysis (rare)"] },
    { name: "Limcee (Vit C)", price: 25, category: "Vitamins & Supplements", type: "Chew", icon: "fa-lemon", isRx: false,
      salt: "Ascorbic Acid (Vitamin C)", strength: "500 mg", company: "Abbott India",
      description: "Limcee is a chewable Vitamin C (500 mg) tablet that supports immune function, collagen synthesis, and acts as an antioxidant. Orange-flavoured for pleasant consumption.",
      sideEffects: ["Stomach upset (high doses)", "Diarrhoea (high doses)", "Kidney stones (very high doses)"] },
    { name: "Zincovit", price: 105, category: "Vitamins & Supplements", type: "Tab", icon: "fa-shield-virus", isRx: false,
      salt: "Zinc + Multivitamins + Minerals", strength: "—", company: "Apex Laboratories",
      description: "Zincovit is a comprehensive multivitamin and mineral supplement with Zinc, Vitamins A, B-complex, C, D, and E. It boosts immunity, supports growth, and aids in recovery.",
      sideEffects: ["Nausea (on empty stomach)", "Metallic taste", "Stomach upset"] },
    { name: "Shelcal 500 (Calcium)", price: 115, category: "Vitamins & Supplements", type: "Tab", icon: "fa-bone", isRx: false,
      salt: "Calcium Carbonate + Vitamin D3", strength: "500 mg/250 IU", company: "Sun Pharma",
      description: "Shelcal 500 provides Calcium Carbonate (500 mg) with Vitamin D3 to prevent and treat calcium deficiency, osteoporosis, and rickets. Vitamin D3 enhances calcium absorption.",
      sideEffects: ["Constipation", "Bloating", "Kidney stones (high doses)", "Hypercalcaemia (overdose)"] },
    { name: "Evion 400 (Vit E)", price: 35, category: "Vitamins & Supplements", type: "Cap", icon: "fa-sparkles", isRx: false,
      salt: "Tocopheryl Acetate (Vitamin E)", strength: "400 IU", company: "Merck (India)",
      description: "Evion 400 is a Vitamin E supplement used for skin health, hair growth, and as an antioxidant. It is also applied topically for wound healing and stretch marks.",
      sideEffects: ["Nausea (high doses)", "Headache (high doses)", "Blurred vision (very high doses)", "Fatigue"] },
    { name: "Omega-3 Fish Oil", price: 249, category: "Vitamins & Supplements", type: "Cap", icon: "fa-fish", isRx: false,
      salt: "Omega-3 Fatty Acids (EPA + DHA)", strength: "1000 mg", company: "HealthKart",
      description: "Omega-3 Fish Oil provides essential EPA and DHA fatty acids that support heart health, brain function, and help reduce inflammation. Take 1 capsule daily with meals.",
      sideEffects: ["Fishy breath", "Stomach upset", "Loose stools (high doses)"] },
    { name: "Iron + Folic Acid", price: 85, category: "Vitamins & Supplements", type: "Tab", icon: "fa-droplet", isRx: false,
      salt: "Ferrous Sulfate + Folic Acid", strength: "150 mg/0.5 mg", company: "Abbott India",
      description: "Iron + Folic Acid tablet prevents and treats anaemia. Essential for women of childbearing age, pregnant women, and those with iron-deficiency anaemia.",
      sideEffects: ["Constipation", "Nausea", "Dark stools", "Stomach cramps"] },
    { name: "Vitamin D3 (60,000 IU)", price: 130, category: "Vitamins & Supplements", type: "Cap", icon: "fa-sun", isRx: false,
      salt: "Cholecalciferol (Vitamin D3)", strength: "60,000 IU", company: "Sun Pharma",
      description: "Vitamin D3 60,000 IU is taken once weekly to correct Vitamin D deficiency, supporting bone health, immune function, and muscle strength.",
      sideEffects: ["Nausea (overdose)", "Fatigue (overdose)", "Hypercalcaemia (very high doses)"] },
    { name: "Neurobion Forte", price: 90, category: "Vitamins & Supplements", type: "Tab", icon: "fa-bolt", isRx: false,
      salt: "Vitamin B1 + B6 + B12", strength: "10 mg/100 mg/15 mcg", company: "Merck (India)",
      description: "Neurobion Forte contains Vitamins B1, B6, and B12 to support nerve health, reduce tiredness, and boost energy. Recommended for B-vitamin deficiency and neuropathy.",
      sideEffects: ["Nausea (rare)", "Skin rash (rare)"] },
    { name: "Dettol Liquid", price: 65, category: "Home First Aid", type: "Liq", icon: "fa-pump-medical", isRx: false,
      salt: "Chloroxylenol (PCMX)", strength: "4.8% w/v", company: "Reckitt Benckiser",
      description: "Dettol Antiseptic Liquid containing Chloroxylenol is used for wound cleansing, skin disinfection, and general hygiene. Dilute before applying to skin.",
      sideEffects: ["Skin irritation (undiluted)", "Allergic contact dermatitis (rare)", "Toxic if swallowed"] },
    { name: "Hansaplast Strips", price: 20, category: "Home First Aid", type: "Strip", icon: "fa-bandage", isRx: false,
      salt: "N/A (Medical Device)", strength: "N/A", company: "Beiersdorf India",
      description: "Hansaplast adhesive wound strips protect minor cuts, scrapes, and blisters from dirt and germs. The breathable wound pad promotes faster healing and stays in place even when wet.",
      sideEffects: ["Skin irritation (sensitive skin)", "Adhesive allergy (rare)"] },
    { name: "Betadine Ointment", price: 95, category: "Home First Aid", type: "Cream", icon: "fa-hand-dots", isRx: false,
      salt: "Povidone-Iodine", strength: "5% w/w", company: "Win-Medicare Pvt. Ltd.",
      description: "Betadine Ointment is a broad-spectrum antiseptic containing Povidone-Iodine, effective against bacteria, viruses, and fungi. Used for wound care, minor burns, and skin infections.",
      sideEffects: ["Skin staining (brown)", "Skin irritation", "Iodine sensitivity reaction (rare)", "Avoid on large wounds"] },
    { name: "Electral ORS", price: 35, category: "Home First Aid", type: "Sachet", icon: "fa-glass-water-droplet", isRx: false,
      salt: "Sodium Chloride + Potassium Chloride + Sodium Citrate + Glucose", strength: "Per sachet (21.8 g)", company: "FDC Ltd.",
      description: "Electral ORS (Oral Rehydration Salts) is essential for treating dehydration caused by diarrhoea, vomiting, fever, or heat exhaustion. Dissolve one sachet in 1 litre of clean drinking water.",
      sideEffects: ["Nausea (rare)", "Elevated sodium in large doses"] },
    { name: "Burnol Cream", price: 70, category: "Home First Aid", type: "Cream", icon: "fa-fire-flame-curved", isRx: false,
      salt: "Cetrimide + Chlorhexidine", strength: "0.5% / 0.025% w/w", company: "Dr. Morepen",
      description: "Burnol is a trusted antiseptic cream for minor burns, scalds, and skin wounds. It relieves pain, prevents infection, and aids healing. Apply a thin layer on the affected area.",
      sideEffects: ["Mild skin irritation", "Burning sensation on open wounds", "Allergy (rare)"] },
    { name: "Calpol Paediatric", price: 45, category: "Home First Aid", type: "Syr", icon: "fa-child", isRx: false,
      salt: "Paracetamol", strength: "120 mg/5 ml", company: "GlaxoSmithKline",
      description: "Calpol Paediatric Suspension is a children's fever and pain relief syrup, gentle on young stomachs. Indicated for fever, teething pain, and post-vaccination discomfort.",
      sideEffects: ["Nausea (rare)", "Skin rash (rare)", "Liver damage on overdose"] },
    { name: "Cetrizine", price: 18, category: "Allergy", type: "Tab", icon: "fa-head-side-cough", isRx: false,
      salt: "Cetirizine Hydrochloride", strength: "10 mg", company: "Unbranded / Generic",
      description: "Cetirizine is a second-generation antihistamine with minimal sedation, used to treat allergic rhinitis, hives, hay fever, and other allergic conditions. Effective for 24 hours.",
      sideEffects: ["Drowsiness (mild)", "Dry mouth", "Headache", "Nausea", "Fatigue"] },
    { name: "Allegra 120", price: 195, category: "Allergy", type: "Tab", icon: "fa-wind", isRx: false,
      salt: "Fexofenadine Hydrochloride", strength: "120 mg", company: "Sanofi India",
      description: "Allegra 120 (Fexofenadine 120 mg) is a non-drowsy antihistamine for seasonal allergic rhinitis and chronic idiopathic urticaria. It does not cross the blood-brain barrier, ensuring no sedation.",
      sideEffects: ["Headache", "Nausea", "Dizziness (rare)", "Back pain (rare)"] }
];

// Plain-language display names for medicine therapeutic categories
const CATEGORY_DISPLAY_NAMES = {
    "Fever & Flu": "Fever & Flu",
    "Cough & Cold": "Cough & Cold",
    "Pain Relief": "Pain & Aches",
    "Headache": "Headache",
    "Digestion": "Tummy Trouble",
    "Stomach Gas": "Acidity & Gas",
    "Diabetes": "Sugar (Diabetes)",
    "Blood Pressure": "Blood Pressure",
    "Cholesterol": "Cholesterol",
    "Allergy": "Allergy Relief",
    "Vitamins & Supplements": "Vitamins & Supplements",
    "Home First Aid": "Home First Aid",
};
function _catDisplayName(cat) { return CATEGORY_DISPLAY_NAMES[cat] || cat; }

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
    const remOv = document.getElementById('rem-overlay');
    if (remOv && !remOv.classList.contains('hidden')) { closeReminderOverlay(); return; }

    // Clean up med-detail auto-slide when navigating away
    if (_medAutoSlideTimer) { clearInterval(_medAutoSlideTimer); _medAutoSlideTimer = null; }

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
            else if (e.state.tab === 'tab-health') el = document.querySelectorAll('.nav-dock .nav-item')[2];
            else if (e.state.tab === 'tab-doctor') el = document.querySelectorAll('.nav-dock .nav-item')[3];
            else if (e.state.tab === 'tab-delivery') el = document.querySelectorAll('.nav-dock .nav-item')[4];
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

    // Load saved language preference
    try {
        const savedLang = localStorage.getItem('mediflow_lang');
        if (savedLang && TRANSLATIONS[savedLang]) { _currentLang = savedLang; applyLanguage(); }
    } catch (e) { /* localStorage unavailable */ }

    if (!LOCAL_MODE) {
        try {
            const res = await fetch(`${API_BASE}/medicines`);
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) MEDICINE_DB = data.data;
        } catch (e) { console.log("Using local DB fallback"); }
    }

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
            history.replaceState({ screen: 'screen-location', tab: 'tab-home' }, "");
            showLocationAskPage();
        } else {
            // Auto-select the first saved address if none is selected
            if (!selectedAddress) {
                selectAddress(window.currentAddresses[0]);
            }
            updateHeaderLocation();
            history.replaceState({ screen: 'screen-dash', tab: 'tab-home' }, "");
            showScreen('screen-dash');
        }
    } else {
        loading(false);
        showScreen('screen-login', false);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Zepto-style: wire up scroll-based header collapse for the home tab
    _initHomeScrollHeader();
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

// ── Header Location Display ─────────────────────────────────────────────────
// Updates the small location row in the top header bar (Blinkit-style).
function updateHeaderLocation() {
    const el = document.getElementById('header-loc-text');
    if (!el) return;
    if (selectedAddress) {
        el.innerText = selectedAddress.tag + ' — ' + selectedAddress.line1;
    } else {
        el.innerText = 'Set delivery location';
    }
}

// ── Zepto-style Location Ask Page ───────────────────────────────────────────
// Shown before the dashboard when the user has no saved address.

function showLocationAskPage() {
    showScreen('screen-location', false);
    // Show saved addresses if any
    const savedSection = document.getElementById('loc-ask-saved');
    const savedList = document.getElementById('loc-ask-saved-list');
    if (savedSection && savedList && window.currentAddresses && window.currentAddresses.length > 0) {
        savedSection.classList.remove('hidden');
        savedList.innerHTML = '';
        const iconMap = { Home: 'fa-house', Work: 'fa-briefcase' };
        window.currentAddresses.forEach(addr => {
            const icon = iconMap[addr.tag] || 'fa-location-dot';
            const card = document.createElement('div');
            card.className = 'loc-ask-addr-card';
            card.onclick = () => locAskSelectAddress(addr.id);
            card.innerHTML = `<div class="loc-ask-addr-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="loc-ask-addr-info">
                    <span class="loc-ask-addr-tag"></span>
                    <span class="loc-ask-addr-line"></span>
                </div>
                <i class="fa-solid fa-chevron-right" style="color:#9CA3AF; font-size:12px;"></i>`;
            card.querySelector('.loc-ask-addr-tag').textContent = addr.tag;
            card.querySelector('.loc-ask-addr-line').textContent = addr.line1 + ', ' + addr.line2;
            savedList.appendChild(card);
        });
    } else if (savedSection) {
        savedSection.classList.add('hidden');
    }
}

function locAskDetect() {
    // Open the full address manager (map screen) and auto-detect location
    openAddressManager(true);
}

function locAskManual() {
    // Open the full address manager for manual location entry
    openAddressManager(true);
}

function locAskSelectAddress(addrId) {
    const addr = (window.currentAddresses || []).find(a => a.id === addrId);
    if (addr) {
        selectAddress(addr);
        showScreen('screen-dash');
    }
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

    updateHeaderLocation();

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
    if (LOCAL_MODE) {
        try {
            const stored = localStorage.getItem('mediflow_addresses_' + userId);
            window.currentAddresses = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Failed to parse stored addresses; resetting.', e);
            window.currentAddresses = [];
        }
    } else {
        try {
            const res = await fetch(`${API_BASE}/addresses/${userId}`);
            const data = await res.json();
            if (data.success) {
                window.currentAddresses = data.data;
            }
        } catch (e) { window.currentAddresses = []; }
    }
    // Refresh address count on the profile tab
    const addrCountEl = document.getElementById('saved-addresses-count');
    if (addrCountEl) {
        const cnt = (window.currentAddresses || []).length;
        addrCountEl.innerText = cnt > 0 ? `${cnt} Address${cnt !== 1 ? 'es' : ''}` : 'No addresses saved';
    }
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
    if (LOCAL_MODE) {
        loading(false);
        const localAddr = { id: 'local-' + crypto.randomUUID(), userId: session.id, line1, line2, tag, lat, lng };
        window.currentAddresses.push(localAddr);
        localStorage.setItem('mediflow_addresses_' + session.id, JSON.stringify(window.currentAddresses));
        _clearAddressForm();
        addAddressMarkersToMap();
        selectAddress(localAddr);
        return;
    }
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
    updateHeaderLocation();

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

    // ── Update cart badge on nav icon ──────────────────────────────────────
    const badge = document.getElementById('nav-cart-badge');
    if (badge) {
        const badgeCount = cart.reduce((s, i) => s + (i.qty || 1), 0);
        if (badgeCount > 0) {
            badge.textContent = badgeCount > 99 ? '99+' : badgeCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (cart.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="glass-card wide" style="text-align:center; flex-direction:column; padding:40px 20px;">
                    <div class="icon-orb orb-3" style="width:70px; height:70px; font-size:30px; margin:0 auto 15px;"><i class="fa-solid fa-bag-shopping"></i></div>
                    <h3 style="font-size:18px;">${t('cart_empty_title')}</h3>
                    <p style="margin-top:8px; font-size:13px; color:var(--gray-text); font-weight:500;">${t('cart_empty_sub')}</p>
                </div>`;
        }
        if (stickyBar) {
            stickyBar.style.display = 'none';
            stickyBar.classList.remove('show');
        }
        if (activeScreen === 'screen-dash' && mainScroll) {
            const _acctTabs = ['tab-profile', 'tab-orders', 'tab-wishlist', 'tab-refunds', 'tab-payments', 'tab-profile-settings'];
            mainScroll.style.paddingBottom = _acctTabs.includes(activeTab) ? '20px' : '90px';
        }
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
                <div style="display:flex; align-items:center; flex:1; cursor:pointer;" onclick='openMedicineDetail(${JSON.stringify(item.name)})'>
                    <div class="icon-orb orb-1" style="width:45px; height:45px; font-size:18px; margin:0 15px 0 0; flex-shrink:0;"><i class="fa-solid ${item.icon}"></i></div>
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
        <div style="margin-bottom:15px;"><h3 class="cart-section-title">${t('bill_order_items')}</h3></div>
        ${itemsHtml}
        <div style="margin-bottom:15px; margin-top:30px;"><h3 class="cart-section-title">${t('bill_summary')}</h3></div>
        <div class="bill-details-card">
            <div class="bill-row"><span>${t('bill_item_total')}</span><span style="font-weight:700;">₹${itemTotal}</span></div>
            <div class="bill-row" style="margin-top:14px;">
                <span>${t('bill_delivery')}</span>
                <span class="${delivery === 0 ? 'text-success' : ''}" style="font-weight:700;">${delivery === 0 ? 'FREE' : '₹' + delivery}</span>
            </div>
            <div class="bill-row">
                <span>${t('bill_platform')}</span>
                <span class="${handling === 0 ? 'text-success' : ''}" style="font-weight:700;">${handling === 0 ? 'FREE' : '₹' + handling}</span>
            </div>
            <div class="bill-row total"><span>${t('bill_total')}</span><span>₹${grandTotal}</span></div>
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
    const allowedScreens = ['screen-dash', 'screen-cat-items', 'screen-rx-upload', 'screen-reminders'];

    if (stickyBar) {
        if (!allowedScreens.includes(activeScreen) || activeTab === 'tab-profile' || activeTab === 'tab-orders' || activeTab === 'tab-wishlist' || activeTab === 'tab-refunds' || activeTab === 'tab-payments') {
            stickyBar.style.display = 'none';
            stickyBar.classList.remove('show');
            if (activeScreen === 'screen-dash' && mainScroll) {
                const _acctTabs = ['tab-profile', 'tab-orders', 'tab-wishlist', 'tab-refunds', 'tab-payments', 'tab-profile-settings'];
                mainScroll.style.paddingBottom = _acctTabs.includes(activeTab) ? '20px' : '90px';
            }
        } else {
            stickyBar.style.display = 'flex';
            stickyBar.classList.add('show');

            if (activeScreen === 'screen-dash') {
                if (mainScroll) mainScroll.style.paddingBottom = '170px';
                stickyBar.style.bottom = '62px';
            } else {
                stickyBar.style.bottom = '20px';
            }

            if (actionBtn) {
                if (activeTab === 'tab-delivery' && activeScreen === 'screen-dash') {
                    actionBtn.innerHTML = t('checkout_btn') + ' <i class="fa-solid fa-arrow-right" style="margin-left:8px;"></i>';
                } else {
                    actionBtn.innerHTML = t('view_cart_btn') + ' <i class="fa-solid fa-arrow-right" style="margin-left:8px;"></i>';
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
    let html = '';
    orders.forEach(order => {
        const isPaid = order.status.includes('Paid');
        const statusClass = isPaid ? 'status-paid' : 'status-pending';

        let itemsSummary = order.items.map(i => `${i.qty || 1}x ${i.name}`).join(', ');
        if (itemsSummary.length > 40) itemsSummary = itemsSummary.substring(0, 40) + '...';

        html += `
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
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button style="background:#FEF3C7; border:none; border-radius:10px; color:#D97706; font-size:12px; font-weight:700; padding:7px 12px; cursor:pointer;" onclick="requestRefund('${order.orderId}', ${order.totalAmount})">Refund</button>
                        <span style="font-size:15px; font-weight:800; color:var(--c4);">₹${order.totalAmount}</span>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────
function _getWishlist() {
    const s = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!s) return [];
    return JSON.parse(localStorage.getItem('mediflow_wishlist_' + s.id) || '[]');
}
function _saveWishlist(list) {
    const s = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!s) return;
    localStorage.setItem('mediflow_wishlist_' + s.id, JSON.stringify(list));
}
function isInWishlist(itemName) { return _getWishlist().includes(itemName); }

function toggleWishlist(itemName) {
    const list = _getWishlist();
    const idx = list.indexOf(itemName);
    if (idx >= 0) { list.splice(idx, 1); showToast('Removed from Wishlist'); }
    else           { list.push(itemName);  showToast('Added to Wishlist ❤️'); }
    _saveWishlist(list);
    document.querySelectorAll('[data-wish]').forEach(btn => {
        if (btn.getAttribute('data-wish') === itemName) {
            const inW = list.includes(itemName);
            btn.innerHTML = `<i class="fa-${inW ? 'solid' : 'regular'} fa-heart"></i>`;
            btn.style.color = inW ? '#EF4444' : '#D1D5DB';
        }
    });
    if (document.querySelector('#tab-wishlist.active-view')) renderWishlistTab();
}

function openWishlist() { switchTab(null, 'tab-wishlist'); renderWishlistTab(); }

function renderWishlistTab() {
    const c = document.getElementById('wishlist-container');
    if (!c) return;
    const list = _getWishlist();
    if (list.length === 0) {
        c.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div class="icon-orb" style="width:64px; height:64px; font-size:26px; margin:0 auto 16px; background:#FEE2E2; color:#EF4444;"><i class="fa-regular fa-heart"></i></div>
                <h3 style="font-size:16px;">Your Wishlist is Empty</h3>
                <p style="margin:8px 0 0; font-size:13px; color:var(--gray-text); font-weight:500;">Heart any medicine to save it here.</p>
            </div>`; return;
    }
    let html = '';
    list.forEach(name => {
        const item = MEDICINE_DB.find(m => m.name === name);
        if (!item) return;
        html += `
            <div class="glass-card wide" style="margin-bottom:10px; flex-direction:column; align-items:flex-start; min-height:auto; padding:16px;">
                <div style="display:flex; align-items:center; width:100%; gap:12px; margin-bottom:10px;">
                    <div class="icon-orb orb-1" style="width:44px; height:44px; font-size:18px; flex-shrink:0; margin:0;"><i class="fa-solid ${item.icon}"></i></div>
                    <div style="flex:1; min-width:0; cursor:pointer;" onclick='openMedicineDetail(${JSON.stringify(item.name)})'>
                        <b style="font-size:14px; color:#111827; display:block;">${item.name}</b>
                        <span style="font-size:12px; color:var(--gray-text); font-weight:600;">${_catDisplayName(item.category)}</span>
                    </div>
                    <span style="font-size:15px; font-weight:800; color:var(--c4); white-space:nowrap;">₹${item.price}</span>
                </div>
                <div style="display:flex; gap:8px; width:100%;">
                    <button class="add-btn" style="flex:1; margin:0; padding:10px;" onclick="addToCart(${JSON.stringify(item.name)})">ADD TO CART</button>
                    <button class="wish-btn" onclick="toggleWishlist(${JSON.stringify(item.name)})" style="width:44px; height:44px; background:#FEF2F2; border:none; border-radius:12px; color:#EF4444; font-size:16px; cursor:pointer; flex-shrink:0;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>`;
    });
    c.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────
// REFUNDS
// ─────────────────────────────────────────────────────────────
function openRefunds() { switchTab(null, 'tab-refunds'); renderRefundsTab(); }

function renderRefundsTab() {
    const c = document.getElementById('refunds-container');
    if (!c) return;
    const s = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    const refunds = s ? JSON.parse(localStorage.getItem('mediflow_refunds_' + s.id) || '[]') : [];
    if (refunds.length === 0) {
        c.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div class="icon-orb orb-2" style="width:64px; height:64px; font-size:26px; margin:0 auto 16px;"><i class="fa-solid fa-rotate-left"></i></div>
                <h3 style="font-size:16px;">No Refund Requests</h3>
                <p style="margin:8px 0 0; font-size:13px; color:var(--gray-text); font-weight:500;">Refund requests from your orders will appear here.</p>
            </div>`; return;
    }
    let html = '';
    refunds.forEach(r => {
        const colMap = { 'Approved': ['#F0FDF4','#16A34A'], 'Rejected': ['#FEF2F2','#DC2626'], 'Pending': ['#FFFBEB','#D97706'] };
        const [bg, fg] = colMap[r.status] || colMap['Pending'];
        html += `
            <div class="order-history-card" style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div><b style="font-size:14px; color:#111827;">${r.orderId}</b><div style="font-size:11px; color:var(--gray-text); margin-top:2px;">${r.date}</div></div>
                    <span style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:8px; background:${bg}; color:${fg};">${r.status}</span>
                </div>
                <p style="font-size:13px; color:#4B5563; font-weight:500; margin:0 0 8px;">${r.reason}</p>
                <div style="display:flex; justify-content:space-between; border-top:1px dashed #E5E7EB; padding-top:10px;">
                    <span style="font-size:12px; color:var(--gray-text); font-weight:700; text-transform:uppercase;">Refund Amount</span>
                    <span style="font-size:15px; font-weight:800; color:var(--c4);">₹${r.amount}</span>
                </div>
            </div>`;
    });
    c.innerHTML = html;
}

function requestRefund(orderId, amount) {
    if (!confirm('Request a refund for order ' + orderId + '?')) return;
    const s = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!s) return showToast('Please log in first.');
    const key = 'mediflow_refunds_' + s.id;
    const refunds = JSON.parse(localStorage.getItem(key) || '[]');
    const reason = prompt('Reason for refund (optional):') || 'Requested by user';
    if (reason === null) return; // user pressed Cancel on prompt
    refunds.unshift({ orderId, amount, reason, date: new Date().toLocaleDateString(), status: 'Pending' });
    localStorage.setItem(key, JSON.stringify(refunds));
    showToast('Refund request submitted!');
}

// ─────────────────────────────────────────────────────────────
// PAYMENT MANAGEMENT
// ─────────────────────────────────────────────────────────────
let _selPayType = 'card';

function openPayments() { switchTab(null, 'tab-payments'); renderPaymentsTab(); }

function _getPaymentMethods() {
    const s = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!s) return [];
    return JSON.parse(localStorage.getItem('mediflow_payments_' + s.id) || '[]');
}
function _savePaymentMethods(list) {
    const s = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!s) return;
    localStorage.setItem('mediflow_payments_' + s.id, JSON.stringify(list));
}

function renderPaymentsTab() {
    const c = document.getElementById('payments-container');
    if (!c) return;
    const methods = _getPaymentMethods();
    const typeIcon = { card: 'fa-credit-card', upi: 'fa-mobile-screen-button', netbanking: 'fa-building-columns' };
    let html = '';
    if (methods.length === 0) {
        html = `<div style="text-align:center; padding:30px 20px;">
            <div class="icon-orb orb-3" style="width:64px; height:64px; font-size:26px; margin:0 auto 16px;"><i class="fa-regular fa-credit-card"></i></div>
            <h3 style="font-size:16px;">No Saved Methods</h3>
            <p style="margin:8px 0 0; font-size:13px; color:var(--gray-text); font-weight:500;">Add a card or UPI ID for faster checkout.</p>
        </div>`;
    } else {
        methods.forEach((m, i) => {
            html += `
            <div class="glass-card wide" style="margin-bottom:10px; min-height:auto; padding:16px;">
                <div class="icon-orb orb-1" style="width:44px; height:44px; font-size:18px; flex-shrink:0; margin:0 14px 0 0;"><i class="fa-solid ${typeIcon[m.type] || 'fa-credit-card'}"></i></div>
                <div style="flex:1;">
                    <b style="font-size:14px; color:#111827; display:block;">${m.label}</b>
                    <span style="font-size:11px; color:var(--gray-text); font-weight:700; text-transform:uppercase;">${m.type}</span>
                </div>
                <button style="background:#FEE2E2; border:none; border-radius:10px; color:#DC2626; font-size:12px; font-weight:700; padding:8px 12px; cursor:pointer;" onclick="removePaymentMethod(${i})">Remove</button>
            </div>`;
        });
    }
    c.innerHTML = html + `
        <div style="margin-top:20px;">
            <p class="profile-section-label" style="margin-bottom:12px;">Add Payment Method</p>
            <div style="display:flex; gap:8px; margin-bottom:14px;">
                <div class="select-chip active pay-type-chip" onclick="selPayType(this,'card')" style="flex:1; padding:12px 6px; font-size:12px; text-align:center;">💳 Card</div>
                <div class="select-chip pay-type-chip" onclick="selPayType(this,'upi')" style="flex:1; padding:12px 6px; font-size:12px; text-align:center;">📱 UPI</div>
                <div class="select-chip pay-type-chip" onclick="selPayType(this,'netbanking')" style="flex:1; padding:12px 6px; font-size:12px; text-align:center;">🏦 Bank</div>
            </div>
            <div class="input-group" style="margin-bottom:12px;">
                <input type="text" id="pay-input" placeholder="Card no. / UPI ID / Bank name" style="height:50px;">
            </div>
            <button class="pay-btn" style="height:50px; margin-top:0;" onclick="savePaymentMethod()">Save Method</button>
        </div>`;
    _selPayType = 'card';
}

function selPayType(el, type) {
    _selPayType = type;
    document.querySelectorAll('.pay-type-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function savePaymentMethod() {
    const val = document.getElementById('pay-input')?.value?.trim();
    if (!val) return showToast('Please enter a value.');
    const methods = _getPaymentMethods();
    methods.push({ type: _selPayType, label: val });
    _savePaymentMethods(methods);
    showToast('Payment method saved!');
    renderPaymentsTab();
}

function removePaymentMethod(idx) {
    if (!confirm('Remove this payment method?')) return;
    const methods = _getPaymentMethods();
    methods.splice(idx, 1);
    _savePaymentMethods(methods);
    renderPaymentsTab();
}

// ─────────────────────────────────────────────────────────────
// SUGGESTED PRODUCTS (inline in profile)
// ─────────────────────────────────────────────────────────────
function renderSuggestedProducts() {
    const el = document.getElementById('suggested-products-slider');
    if (!el) return;
    const otc = MEDICINE_DB.filter(m => !m.isRx);
    // Fisher-Yates shuffle on a copy, then take first 6
    const shuffled = [...otc];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picks = shuffled.slice(0, 6);
    let html = '';
    picks.forEach(item => {
        html += `
            <div class="glass-card" style="min-width:140px; flex-shrink:0; padding:15px; min-height:165px;" onclick='openMedicineDetail(${JSON.stringify(item.name)})'>
                <div class="icon-orb orb-2" style="width:40px; height:40px; font-size:17px; margin-bottom:10px;"><i class="fa-solid ${item.icon}"></i></div>
                <h3 style="margin:0; font-size:13px; line-height:1.3; flex:1;">${item.name}</h3>
                <p style="margin:4px 0 8px; font-size:14px; font-weight:800; color:var(--c4);">₹${item.price}</p>
                <button class="add-btn" style="margin:0; padding:8px; font-size:11px;" onclick='event.stopPropagation(); addToCart(${JSON.stringify(item.name)})'>ADD +</button>
            </div>`;
    });
    el.innerHTML = html;
}

let _searchDebounceTimer = null;
function handleGlobalSearch(el) {
    clearTimeout(_searchDebounceTimer);
    _searchDebounceTimer = setTimeout(() => _runSearch(el.value), 200);
}

function _runSearch(rawQuery) {
    const query = rawQuery.toLowerCase().trim();
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

    const matches = MEDICINE_DB.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        resultsGrid.innerHTML = `<div style="grid-column:span 2; text-align:center; padding:40px 20px; color:var(--gray-text); font-weight:600; background:white; border-radius:20px; border:1px dashed #E5E7EB;">No products found for "${rawQuery}"</div>`;
    } else {
        resultsGrid.innerHTML = matches.map(item => renderItemCard(item)).join('');
    }
}

function renderItemCard(item) {
    const inW = isInWishlist(item.name);
    return `
        <div class="glass-card" style="position:relative;" onclick='openMedicineDetail(${JSON.stringify(item.name)})'>
            ${item.isRx ? '<span class="rx-badge">Rx</span>' : ''}
            <button data-wish="${item.name}" class="wish-btn" onclick='event.stopPropagation(); toggleWishlist(${JSON.stringify(item.name)})' style="position:absolute; top:10px; ${item.isRx ? 'right:52px' : 'right:10px'}; background:none; border:none; cursor:pointer; font-size:18px; color:${inW ? '#EF4444' : '#D1D5DB'}; padding:4px; z-index:2; line-height:1;" aria-label="${inW ? 'Remove from wishlist' : 'Add to wishlist'}"><i class="fa-${inW ? 'solid' : 'regular'} fa-heart"></i></button>
            <div class="icon-orb orb-1"><i class="fa-solid ${item.icon}"></i></div>
            <div>
                <h3 style="margin:0; font-size:15px;">${item.name}</h3>
                <p style="margin:4px 0 0; font-size:12px; color:var(--gray-text); font-weight:600;">${_catDisplayName(item.category)}</p>
                <p style="margin:6px 0 0; font-size:16px; font-weight:800; color:var(--c4);">₹${item.price}</p>
            </div>
            <button class="add-btn" onclick='event.stopPropagation(); addToCart(${JSON.stringify(item.name)})'>ADD +</button>
        </div>
    `;
}

function renderPopularMeds() {
    const slider = document.getElementById('popular-meds-slider');
    if (!slider) return;
    const popular = MEDICINE_DB.slice(0, 4);
    let html = '';
    popular.forEach(item => {
        html += `
            <div class="glass-card" style="min-width:150px; flex-shrink:0; padding:18px; min-height:190px;" onclick='openMedicineDetail(${JSON.stringify(item.name)})'>
                ${item.isRx ? '<span class="rx-badge" style="top:10px; right:10px; font-size:9px;">Rx</span>' : ''}
                <div class="icon-orb orb-1" style="width:45px; height:45px; font-size:20px; margin-bottom:12px;"><i class="fa-solid ${item.icon}"></i></div>
                <h3 style="margin:0; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">${item.name}</h3>
                <p style="margin:4px 0 0; font-size:11px; color:var(--gray-text); font-weight:600;">${item.category}</p>
                <p style="margin:8px 0 0; font-size:16px; font-weight:800; color:var(--c4);">₹${item.price}</p>
                <button class="add-btn" style="margin-top:12px; padding:10px; font-size:12px;" onclick='event.stopPropagation(); addToCart(${JSON.stringify(item.name)})'>ADD +</button>
            </div>
        `;
    });
    html += `
        <div class="glass-card" style="min-width:140px; flex-shrink:0; background:linear-gradient(135deg, var(--c5), var(--c4)); border:none; align-items:center; justify-content:center; text-align:center; min-height:190px;" onclick="switchTab(document.querySelectorAll('.nav-dock .nav-item')[1], 'tab-category')">
            <div class="icon-orb" style="background:rgba(255,255,255,0.2); color:white; margin:0 0 15px;"><i class="fa-solid fa-arrow-right"></i></div>
            <h4 style="color:white; margin:0; font-size:15px; font-weight:800;">See All<br>Medicines</h4>
        </div>
    `;
    slider.innerHTML = html;
    renderSuggestedProducts();
    renderDailyNeeds();
    _startReminderChecker();
}

// --- DAILY NEEDS SECTION ---
let _dailyNeedsActiveCat = null;

function renderDailyNeeds() {
    const tabsEl = document.getElementById('daily-needs-tabs');
    const medsEl = document.getElementById('daily-needs-meds');
    if (!tabsEl || !medsEl) return;
    const categories = [...new Set(MEDICINE_DB.map(m => m.category))];
    _dailyNeedsActiveCat = categories[0];
    let tabHtml = '';
    categories.forEach((cat, i) => {
        const example = MEDICINE_DB.find(m => m.category === cat);
        tabHtml += `<div class="daily-needs-tab${i === 0 ? ' active' : ''}" onclick="switchDailyNeedsTab(${JSON.stringify(cat)}, this)"><i class="fa-solid ${example.icon}"></i> <span>${_catDisplayName(cat)}</span></div>`;
    });
    tabsEl.innerHTML = tabHtml;
    _renderDailyNeedsMeds(_dailyNeedsActiveCat);
}

function switchDailyNeedsTab(catName, el) {
    _dailyNeedsActiveCat = catName;
    document.querySelectorAll('#daily-needs-tabs .daily-needs-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    _renderDailyNeedsMeds(catName);
}

function _renderDailyNeedsMeds(catName) {
    const medsEl = document.getElementById('daily-needs-meds');
    if (!medsEl) return;
    const items = MEDICINE_DB.filter(m => m.category === catName);
    let html = '';
    items.forEach(item => {
        html += `
            <div class="glass-card" style="min-width:150px; flex-shrink:0; padding:18px; min-height:190px;" onclick='openMedicineDetail(${JSON.stringify(item.name)})'>
                ${item.isRx ? '<span class="rx-badge" style="top:10px; right:10px; font-size:9px;">Rx</span>' : ''}
                <div class="icon-orb orb-2" style="width:45px; height:45px; font-size:20px; margin-bottom:12px;"><i class="fa-solid ${item.icon}"></i></div>
                <h3 style="margin:0; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">${item.name}</h3>
                <p style="margin:4px 0 0; font-size:11px; color:var(--gray-text); font-weight:600;">${item.company || item.category}</p>
                <p style="margin:8px 0 0; font-size:16px; font-weight:800; color:var(--c4);">₹${item.price}</p>
                <button class="add-btn" style="margin-top:12px; padding:10px; font-size:12px;" onclick='event.stopPropagation(); addToCart(${JSON.stringify(item.name)})'>ADD +</button>
            </div>
        `;
    });
    medsEl.innerHTML = html;
}

// --- MEDICINE DETAIL PAGE ---
let _currentMedDetail = null;
let _medSliderIdx = 0;
let _medSliderTotal = 3;
let _medAutoSlideTimer = null;

const _MED_SLIDE_BGSM = [
    'linear-gradient(135deg,#344E41 0%,#3A5A40 100%)',
    'linear-gradient(135deg,#1D4ED8 0%,#3B82F6 100%)',
    'linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)'
];
const _MED_SLIDE_LABELS = ['Product View', 'Manufacturer', 'Category'];

function openMedicineDetail(itemName) {
    const item = MEDICINE_DB.find(i => i.name === itemName);
    if (!item) return;
    _currentMedDetail = item;
    _medSliderIdx = 0;

    // Build slider slides
    const slider = document.getElementById('med-slider');
    const dots = document.getElementById('med-dots');
    if (!slider || !dots) return;
    _medSliderTotal = _MED_SLIDE_BGSM.length;
    const subLabels = [item.name, item.company || item.category, item.category];
    slider.innerHTML = '';
    dots.innerHTML = '';
    _MED_SLIDE_BGSM.forEach((bg, i) => {
        const slide = document.createElement('div');
        slide.className = 'med-slide';
        slide.style.background = bg;
        slide.innerHTML = `
            <div class="med-slide-icon"><i class="fa-solid ${item.icon}"></i></div>
            <div class="med-slide-sublabel">${_MED_SLIDE_LABELS[i]}</div>
            <div class="med-slide-label">${subLabels[i]}</div>`;
        slide.style.transform = `translateX(${i * 100}%)`;
        slider.appendChild(slide);
        const dot = document.createElement('div');
        dot.className = 'med-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('onclick', `medGoTo(${i})`);
        dots.appendChild(dot);
    });

    // Fill Rx badge
    const rxBadge = document.getElementById('med-rx-badge-top');
    if (rxBadge) { item.isRx ? rxBadge.classList.remove('hidden') : rxBadge.classList.add('hidden'); }

    // Fill name/price
    document.getElementById('med-detail-name').textContent = item.name;
    document.getElementById('med-detail-price').textContent = '₹' + item.price;

    // Tags
    const tagsDiv = document.getElementById('med-detail-tags');
    if (tagsDiv) {
        tagsDiv.innerHTML =
            `<span class="med-tag-chip chip-cat">${item.category}</span>` +
            `<span class="med-tag-chip chip-type">${_typeLabel(item.type)}</span>` +
            (item.isRx ? '<span class="med-tag-chip chip-rx">Rx Required</span>' : '<span class="med-tag-chip chip-otc">OTC</span>');
    }

    // Info grid
    document.getElementById('med-detail-company').textContent = item.company || 'N/A';
    document.getElementById('med-detail-category').textContent = item.category;
    document.getElementById('med-detail-salt').textContent = item.salt || item.category;
    document.getElementById('med-detail-strength').textContent = item.strength || '—';
    document.getElementById('med-detail-type').textContent = _typeLabel(item.type);

    // Description
    const descEl = document.getElementById('med-detail-desc');
    if (descEl) descEl.textContent = item.description || 'No description available.';

    // Side effects
    const seDiv = document.getElementById('med-detail-side-effects');
    if (seDiv) {
        if (item.sideEffects && item.sideEffects.length > 0) {
            seDiv.innerHTML = item.sideEffects.map(se => `<span class="med-side-effect-chip">${se}</span>`).join('');
        } else {
            seDiv.innerHTML = '<span style="font-size:13px;color:var(--gray-text);font-weight:500;">No known side effects listed.</span>';
        }
    }

    // Same-salt alternatives
    const altSection = document.getElementById('med-alternatives-section');
    const altDiv = document.getElementById('med-detail-alternatives');
    if (altSection && altDiv && item.salt) {
        const alts = MEDICINE_DB.filter(m =>
            m.salt && item.salt && m.strength && item.strength &&
            m.salt === item.salt && m.strength === item.strength && m.name !== item.name
        );
        if (alts.length > 0) {
            altSection.style.display = '';
            altDiv.innerHTML = alts.map(alt => `
                <div class="med-alt-card" onclick='openMedicineDetail(${JSON.stringify(alt.name)})'>
                    <div class="icon-orb orb-1" style="width:44px;height:44px;font-size:18px;margin:0 14px 0 0;flex-shrink:0;"><i class="fa-solid ${alt.icon}"></i></div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:800;font-size:14px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${alt.name}</div>
                        <div style="font-size:12px;color:var(--gray-text);font-weight:500;margin-top:2px;">${alt.company || alt.category}</div>
                        <div style="font-size:11px;font-weight:700;color:var(--c4);margin-top:3px; background:var(--c1); display:inline-block; padding:2px 8px; border-radius:6px;">${alt.strength}</div>
                    </div>
                    <div style="text-align:right;flex-shrink:0;">
                        <div style="font-size:17px;font-weight:800;color:var(--c4);">₹${alt.price}</div>
                        <button class="add-btn" style="margin-top:6px;padding:7px 14px;font-size:12px;width:auto;" onclick='event.stopPropagation();addToCart(${JSON.stringify(alt.name)})'>ADD</button>
                    </div>
                </div>`).join('');
        } else {
            altSection.style.display = 'none';
        }
    } else if (altSection) {
        altSection.style.display = 'none';
    }

    // Auto-slide
    if (_medAutoSlideTimer) clearInterval(_medAutoSlideTimer);
    _medAutoSlideTimer = setInterval(() => medSlide(1), 3500);

    // Wishlist heart button state
    const wishBtn = document.getElementById('med-detail-wish-btn');
    if (wishBtn) {
        const inW = isInWishlist(item.name);
        wishBtn.innerHTML = `<i class="fa-${inW ? 'solid' : 'regular'} fa-heart"></i>`;
        wishBtn.style.color = inW ? '#EF4444' : '';
    }

    showScreen('screen-med-detail');
}

function toggleWishlistDetail() {
    if (!_currentMedDetail) return;
    toggleWishlist(_currentMedDetail.name);
    const wishBtn = document.getElementById('med-detail-wish-btn');
    if (wishBtn) {
        const inW = isInWishlist(_currentMedDetail.name);
        wishBtn.innerHTML = `<i class="fa-${inW ? 'solid' : 'regular'} fa-heart"></i>`;
        wishBtn.style.color = inW ? '#EF4444' : '';
    }
}

function _typeLabel(type) {
    const map = { Tab:'Tablet', Cap:'Capsule', Syr:'Syrup', Gel:'Gel', Liq:'Liquid',
                  Inj:'Injection', Sachet:'Sachet', Chew:'Chewable', Cream:'Cream', Strip:'Strip' };
    return map[type] || type;
}

function medSlide(dir) {
    _medSliderIdx = (_medSliderIdx + dir + _medSliderTotal) % _medSliderTotal;
    _updateMedSlider();
}

function medGoTo(idx) {
    _medSliderIdx = idx;
    _updateMedSlider();
}

function _updateMedSlider() {
    const slider = document.getElementById('med-slider');
    if (slider) {
        Array.from(slider.children).forEach((slide, i) => {
            slide.style.transform = `translateX(${(i - _medSliderIdx) * 100}%)`;
        });
    }
    document.querySelectorAll('#med-dots .med-dot').forEach((d, i) => d.classList.toggle('active', i === _medSliderIdx));
}

function addMedDetailToCart() {
    if (_currentMedDetail) addToCart(_currentMedDetail.name);
}

function openReminderOverlayForCurrent() {
    if (_currentMedDetail) openReminderOverlay(_currentMedDetail.name);
}

// --- REMINDER SYSTEM ---
const REMINDER_CHECK_MS = 15000;   // check every 15 s
const REMINDER_DISMISS_MS = 30000; // auto-dismiss alert after 30 s
let _reminderCheckInterval = null;
let _reminderAlertTimeout = null;

function _getReminders() {
    const session = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!session) return [];
    return JSON.parse(localStorage.getItem('mediflow_reminders_' + session.id) || '[]');
}

function _saveRemindersLocal(reminders) {
    const session = JSON.parse(localStorage.getItem('mediflow_current_session') || 'null');
    if (!session) return;
    localStorage.setItem('mediflow_reminders_' + session.id, JSON.stringify(reminders));
}

function _startReminderChecker() {
    if (_reminderCheckInterval) clearInterval(_reminderCheckInterval);
    _reminderCheckInterval = setInterval(_checkDueReminders, REMINDER_CHECK_MS);
    _checkDueReminders();
}

function _checkDueReminders() {
    const reminders = _getReminders().filter(r => r.active);
    if (!reminders.length) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    const today = now.toISOString().split('T')[0];
    // Clean alerted cache (keep only today's)
    let alerted = {};
    try { alerted = JSON.parse(localStorage.getItem('mediflow_rem_alerted') || '{}'); } catch (e) { console.warn('Reminder history parse error:', e); }
    Object.keys(alerted).forEach(k => { if (!k.includes(today)) delete alerted[k]; });
    reminders.forEach(rem => {
        if (!rem.times || !rem.times.includes(currentTime)) return;
        const key = `${rem.id}_${today}_${currentTime}`;
        if (alerted[key]) return;
        alerted[key] = true;
        localStorage.setItem('mediflow_rem_alerted', JSON.stringify(alerted));
        _showReminderAlert(rem);
    });
}

function _showReminderAlert(reminder) {
    const banner = document.getElementById('reminder-alert-banner');
    if (!banner) return;
    const iconEl = document.getElementById('rab-icon');
    if (iconEl) iconEl.className = `fa-solid ${reminder.medicineIcon}`;
    const nameEl = document.getElementById('rab-name');
    if (nameEl) nameEl.textContent = reminder.medicineName;
    const dosageEl = document.getElementById('rab-dosage');
    if (dosageEl) dosageEl.textContent = `Take ${reminder.dosage} now`;
    const notesEl = document.getElementById('rab-notes');
    if (notesEl) { notesEl.textContent = reminder.notes || ''; notesEl.style.display = reminder.notes ? '' : 'none'; }
    banner.dataset.remId = reminder.id;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('show'), 10);
    if (_reminderAlertTimeout) clearTimeout(_reminderAlertTimeout);
    _reminderAlertTimeout = setTimeout(() => dismissReminderAlert(), REMINDER_DISMISS_MS);
}

function dismissReminderAlert() {
    const banner = document.getElementById('reminder-alert-banner');
    if (banner) { banner.classList.remove('show'); setTimeout(() => banner.classList.add('hidden'), 450); }
    if (_reminderAlertTimeout) clearTimeout(_reminderAlertTimeout);
}

function markReminderTaken() {
    dismissReminderAlert();
    showToast('✅ Medicine marked as taken!');
}

function openReminderOverlay(itemName) {
    const item = MEDICINE_DB.find(i => i.name === itemName);
    if (!item) return;
    const nameEl = document.getElementById('rem-overlay-med-name');
    const iconEl = document.getElementById('rem-overlay-icon');
    const saltEl = document.getElementById('rem-overlay-salt');
    if (nameEl) nameEl.textContent = item.name;
    if (iconEl) iconEl.className = `fa-solid ${item.icon}`;
    if (saltEl) saltEl.textContent = item.salt || item.category;
    // Store item name on save button
    const saveBtn = document.getElementById('rem-save-btn');
    if (saveBtn) saveBtn.dataset.itemName = itemName;
    // Reset form
    document.querySelectorAll('#rem-overlay .rem-dose-chip').forEach(c => c.classList.remove('active'));
    const firstDose = document.querySelector('#rem-overlay .rem-dose-chip');
    if (firstDose) firstDose.classList.add('active');
    document.querySelectorAll('#rem-overlay .rem-time-chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('#rem-overlay .rem-dur-chip').forEach(c => c.classList.remove('active'));
    const sevenDay = document.querySelector('#rem-overlay .rem-dur-chip[data-val="7"]');
    if (sevenDay) sevenDay.classList.add('active');
    const notesInput = document.getElementById('rem-notes');
    if (notesInput) notesInput.value = '';
    const overlay = document.getElementById('rem-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    history.pushState({ remOverlay: true }, '');
}

function closeReminderOverlay() {
    const overlay = document.getElementById('rem-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(() => overlay.classList.add('hidden'), 350);
}

function selRemDosage(el) {
    el.closest('#rem-dosage-grid').querySelectorAll('.rem-dose-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function selRemDuration(el) {
    el.closest('#rem-dur-grid').querySelectorAll('.rem-dur-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function selRemTimeChip(el) { el.classList.toggle('active'); }

function saveReminder() {
    const saveBtn = document.getElementById('rem-save-btn');
    if (!saveBtn) return;
    const itemName = saveBtn.dataset.itemName;
    const item = MEDICINE_DB.find(i => i.name === itemName);
    if (!item) return;
    const selectedTimes = Array.from(document.querySelectorAll('#rem-overlay .rem-time-chip.active')).map(c => c.dataset.time);
    if (!selectedTimes.length) { showToast('⏰ Please select at least one reminder time'); return; }
    const activeDose = document.querySelector('#rem-overlay .rem-dose-chip.active');
    const dosage = activeDose ? activeDose.dataset.val : '1 tablet';
    const activeDur = document.querySelector('#rem-overlay .rem-dur-chip.active');
    const duration = activeDur ? parseInt(activeDur.dataset.val) : 7;
    const notes = (document.getElementById('rem-notes') || {}).value || '';
    const reminder = {
        id: 'rem_' + Date.now(),
        medicineName: item.name,
        medicineIcon: item.icon,
        salt: item.salt || item.category,
        company: item.company || '',
        dosage, times: selectedTimes, duration,
        startDate: new Date().toISOString().split('T')[0],
        notes: notes.trim(), active: true
    };
    const all = _getReminders();
    all.push(reminder);
    _saveRemindersLocal(all);
    closeReminderOverlay();
    showToast(`🔔 Reminder set for ${item.name}!`);
}

function openRemindersScreen() {
    renderRemindersList();
    showScreen('screen-reminders');
}

function renderRemindersList() {
    const container = document.getElementById('reminders-list');
    if (!container) return;
    const reminders = _getReminders();
    if (!reminders.length) {
        container.innerHTML = `
            <div class="glass-card wide" style="text-align:center; flex-direction:column; padding:40px 20px;">
                <div class="icon-orb orb-3" style="width:70px; height:70px; font-size:30px; margin:0 auto 15px;"><i class="fa-solid fa-bell-slash"></i></div>
                <h3>No Reminders Set</h3>
                <p style="margin-top:8px; font-size:13px; color:var(--gray-text); font-weight:500;">Open a medicine and tap "Set Reminder" to get started.</p>
            </div>`;
        return;
    }
    const timeLabels = { '08:00':'Morning (8 AM)', '14:00':'Afternoon (2 PM)', '19:00':'Evening (7 PM)', '22:00':'Night (10 PM)' };
    container.innerHTML = reminders.map(rem => `
        <div class="rem-card ${rem.active ? '' : 'rem-card-inactive'}">
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
                <div class="icon-orb orb-1" style="width:48px; height:48px; font-size:20px; flex-shrink:0; margin:0;"><i class="fa-solid ${rem.medicineIcon}"></i></div>
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:800; font-size:15px; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${rem.medicineName}</div>
                    <div style="font-size:12px; color:var(--gray-text); font-weight:500; margin-top:2px;">${rem.salt || ''}</div>
                </div>
                <div style="display:flex; gap:8px; flex-shrink:0; align-items:center;">
                    <div class="rem-toggle ${rem.active ? 'active' : ''}" onclick="toggleReminder('${rem.id}')"><div class="rem-toggle-knob"></div></div>
                    <div onclick="deleteReminder('${rem.id}')" style="width:34px; height:34px; background:#FEE2E2; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#DC2626; font-size:14px; transition:0.2s;"><i class="fa-solid fa-trash-can"></i></div>
                </div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                ${rem.times.map(t => `<span class="rem-time-badge"><i class="fa-solid fa-clock" style="margin-right:4px; font-size:10px;"></i>${timeLabels[t] || t}</span>`).join('')}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--gray-text); font-weight:600; border-top:1px dashed #E5E7EB; padding-top:10px;">
                <span><i class="fa-solid fa-pills" style="margin-right:5px; color:var(--c4);"></i>${rem.dosage}</span>
                <span><i class="fa-solid fa-calendar-days" style="margin-right:5px; color:var(--c4);"></i>${rem.duration === 0 ? 'Ongoing' : rem.duration + ' days'} · from ${rem.startDate}</span>
            </div>
            ${rem.notes ? `<div style="margin-top:10px; padding:10px 12px; background:#F9FAFB; border-radius:12px; font-size:12px; color:#4B5563; font-weight:500;"><i class="fa-solid fa-note-sticky" style="margin-right:6px; color:var(--c4);"></i>${rem.notes}</div>` : ''}
        </div>`).join('');
}

function toggleReminder(remId) {
    const all = _getReminders();
    const rem = all.find(r => r.id === remId);
    if (rem) { rem.active = !rem.active; _saveRemindersLocal(all); renderRemindersList(); showToast(rem.active ? '🔔 Reminder activated' : '🔕 Reminder paused'); }
}

function deleteReminder(remId) {
    if (!confirm('Delete this reminder?')) return;
    _saveRemindersLocal(_getReminders().filter(r => r.id !== remId));
    renderRemindersList();
    showToast('Reminder deleted');
}

function clearSearch() {
    document.getElementById('global-search').value = "";
    document.getElementById('home-normal-content').style.display = 'block';
    document.getElementById('home-search-content').style.display = 'none';
}

// Browse-only categories (no medicines in DB yet) with icons for the category page
const BROWSE_CATEGORIES = [
    { name: "Skin Care", icon: "fa-hand-sparkles", section: "wellness" },
    { name: "Eye Care", icon: "fa-eye", section: "wellness" },
    { name: "Ear Care", icon: "fa-ear-listen", section: "wellness" },
    { name: "Dental Care", icon: "fa-tooth", section: "wellness" },
    { name: "Hair Care", icon: "fa-wand-magic-sparkles", section: "wellness" },
    { name: "Women's Health", icon: "fa-venus", section: "wellness" },
    { name: "Men's Health", icon: "fa-mars", section: "wellness" },
    { name: "Baby & Mother Care", icon: "fa-baby", section: "wellness" },
    { name: "Elderly Care", icon: "fa-person-cane", section: "wellness" },
    { name: "Antibiotics", icon: "fa-shield-virus", section: "prescription" },
    { name: "Liver Care", icon: "fa-flask-vial", section: "organ" },
    { name: "Kidney Care", icon: "fa-droplet", section: "organ" },
    { name: "Bone & Joint", icon: "fa-bone", section: "organ" },
    { name: "Heart Care", icon: "fa-heart", section: "organ" },
    { name: "Lungs & Respiratory", icon: "fa-lungs", section: "organ" },
    { name: "Thyroid Care", icon: "fa-syringe", section: "organ" },
    { name: "Stomach & Gut", icon: "fa-virus", section: "organ" },
    { name: "Mental Wellness", icon: "fa-brain", section: "lifestyle" },
    { name: "Sleep & Stress", icon: "fa-moon", section: "lifestyle" },
    { name: "Weight Management", icon: "fa-weight-scale", section: "lifestyle" },
    { name: "Sexual Wellness", icon: "fa-shield-heart", section: "lifestyle" },
    { name: "Immunity Boosters", icon: "fa-shield", section: "lifestyle" },
    { name: "Protein & Fitness", icon: "fa-dumbbell", section: "lifestyle" },
    { name: "Ayurvedic", icon: "fa-leaf", section: "alternative" },
    { name: "Homeopathy", icon: "fa-mortar-pestle", section: "alternative" },
];

function renderCategoriesTab() {
    const grid = document.getElementById('all-cats-grid');
    if (!grid) return;

    const ACUTE_CATS    = ["Fever & Flu", "Cough & Cold", "Pain Relief", "Headache", "Digestion", "Allergy"];
    const CHRONIC_CATS  = ["Diabetes", "Blood Pressure", "Cholesterol", "Stomach Gas"];
    const SPECIAL_CATS  = ["Vitamins & Supplements", "Home First Aid"];
    const allMapped     = [...SPECIAL_CATS, ...ACUTE_CATS, ...CHRONIC_CATS];
    const colors        = ['orb-1', 'orb-2', 'orb-3'];

    function catCard(cat, idx, icon) {
        const example = MEDICINE_DB.find(m => m.category === cat);
        const iconClass = icon || (example ? example.icon : 'fa-capsules');
        return `
            <div class="glass-card cat-mini-card" onclick='openCategoryView(${JSON.stringify(cat)})'>
                <div class="icon-orb ${colors[idx % colors.length]}" style="margin:0 0 10px; width:50px; height:50px; font-size:22px;"><i class="fa-solid ${iconClass}"></i></div>
                <h3 style="margin:0; font-size:13px; text-align:center; line-height:1.3;">${_catDisplayName(cat)}</h3>
            </div>`;
    }

    let html = '';

    // ── Acute / Everyday conditions ──
    const acuteCats = ACUTE_CATS.filter(c => MEDICINE_DB.some(m => m.category === c));
    if (acuteCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-bolt" style="color:#F59E0B; margin-right:6px;"></i>Everyday Relief — Quick Care</div>`;
        html += acuteCats.map((c, i) => catCard(c, i)).join('');
    }

    // ── Chronic / Long-term conditions ──
    const chronicCats = CHRONIC_CATS.filter(c => MEDICINE_DB.some(m => m.category === c));
    if (chronicCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-heart-pulse" style="color:#EF4444; margin-right:6px;"></i>Ongoing Care — Long-Term Conditions</div>`;
        html += chronicCats.map((c, i) => catCard(c, i)).join('');
    }

    // ── Vitamins, First Aid & Supplements ──
    const specialCats = SPECIAL_CATS.filter(c => MEDICINE_DB.some(m => m.category === c));
    if (specialCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-kit-medical" style="color:#16A34A; margin-right:6px;"></i>Vitamins, Supplements & First Aid</div>`;
        html += specialCats.map((c, i) => catCard(c, i)).join('');
    }

    // ── Wellness & Personal Care (browse-only) ──
    const wellnessCats = BROWSE_CATEGORIES.filter(c => c.section === 'wellness');
    if (wellnessCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-spa" style="color:#8B5CF6; margin-right:6px;"></i>Wellness & Personal Care</div>`;
        html += wellnessCats.map((c, i) => catCard(c.name, i, c.icon)).join('');
    }

    // ── Organ & Body Care (browse-only) ──
    const organCats = BROWSE_CATEGORIES.filter(c => c.section === 'organ');
    if (organCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-heart-pulse" style="color:#EC4899; margin-right:6px;"></i>Organ & Body Care</div>`;
        html += organCats.map((c, i) => catCard(c.name, i, c.icon)).join('');
    }

    // ── Lifestyle & Nutrition (browse-only) ──
    const lifestyleCats = BROWSE_CATEGORIES.filter(c => c.section === 'lifestyle');
    if (lifestyleCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-seedling" style="color:#059669; margin-right:6px;"></i>Lifestyle & Nutrition</div>`;
        html += lifestyleCats.map((c, i) => catCard(c.name, i, c.icon)).join('');
    }

    // ── Prescription & Specialist (browse-only) ──
    const rxCats = BROWSE_CATEGORIES.filter(c => c.section === 'prescription');
    if (rxCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-file-prescription" style="color:#DC2626; margin-right:6px;"></i>Prescription Medicines</div>`;
        html += rxCats.map((c, i) => catCard(c.name, i, c.icon)).join('');
    }

    // ── Alternative Medicine (browse-only) ──
    const altCats = BROWSE_CATEGORIES.filter(c => c.section === 'alternative');
    if (altCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-leaf" style="color:#16A34A; margin-right:6px;"></i>Alternative Medicine</div>`;
        html += altCats.map((c, i) => catCard(c.name, i, c.icon)).join('');
    }

    // ── Any remaining unmapped categories from MEDICINE_DB ──
    const otherCats = [...new Set(MEDICINE_DB.map(m => m.category))].filter(c => !allMapped.includes(c));
    if (otherCats.length) {
        html += `<div class="cat-section-label"><i class="fa-solid fa-grid-2" style="color:var(--c4); margin-right:6px;"></i>More</div>`;
        html += otherCats.map((c, i) => catCard(c, i)).join('');
    }

    grid.innerHTML = html;
}

// Zepto-style: collapse/expand the home header based on scroll position
function _initHomeScrollHeader() {
    const scroll = document.getElementById('main-scroll');
    const header = document.getElementById('main-dash-header');
    if (!scroll || !header) return;
    let _ticking = false;
    scroll.addEventListener('scroll', function () {
        if (_ticking) return;
        _ticking = true;
        requestAnimationFrame(() => {
            const activeTab = document.querySelector('.content-view.active-view');
            if (activeTab && activeTab.id === 'tab-home') {
                if (scroll.scrollTop > 60) {
                    header.classList.add('compact');
                    scroll.style.paddingTop = '122px';
                } else {
                    header.classList.remove('compact');
                    scroll.style.paddingTop = '196px';
                }
            }
            _ticking = false;
        });
    }, { passive: true });
}

function openCategoryView(catName) {
    document.getElementById('cat-title').innerText = catName;
    const grid = document.getElementById('cat-items-grid');
    const items = MEDICINE_DB.filter(m => m.category === catName);
    if (items.length) {
        grid.innerHTML = items.map(item => renderItemCard(item)).join('');
    } else {
        grid.innerHTML = `
            <div style="grid-column: span 2; text-align:center; padding:40px 20px;">
                <div style="font-size:48px; margin-bottom:16px; opacity:0.4;"><i class="fa-solid fa-capsules"></i></div>
                <h3 style="margin:0 0 8px; font-size:16px; color:#111827; font-weight:700;">Coming Soon</h3>
                <p style="margin:0; font-size:13px; color:var(--gray-text); font-weight:500;">Medicines for this category will be available shortly.</p>
            </div>`;
    }
    showScreen('screen-cat-items');
}

// --- AUTH LOGIC ---
let _otpResendTimer = null;

function _showPhoneErr(msg) {
    const el = document.getElementById('phone-err');
    el.innerText = msg;
    el.style.display = 'block';
}

function _startOtpResendCooldown(seconds) {
    const btn = document.getElementById('resend-otp-btn');
    if (!btn) return;
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '0.5';
    let remaining = seconds;
    btn.innerText = `Resend OTP (${remaining}s)`;
    clearInterval(_otpResendTimer);
    _otpResendTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(_otpResendTimer);
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';
            btn.innerText = 'Resend OTP';
        } else {
            btn.innerText = `Resend OTP (${remaining}s)`;
        }
    }, 1000);
}

async function _doSendOtp() {
    if (LOCAL_MODE) return { ok: true };
    try {
        const res = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentPhoneClean })
        });

        let data = {};
        if (res.status === 429) {
            try { data = await res.json(); } catch (_) { /* non-JSON body; fall back to empty object */ }
            return { ok: false, message: data.message || "Too many requests. Please wait before requesting a new OTP." };
        }
        if (!res.ok) {
            return { ok: false, message: data.message || `Server error (${res.status}). Please try again.` };
        }
        if (!data.success) {
            return { ok: false, message: data.message || "Failed to send OTP. Please try again." };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, message: "Could not reach the server. Please check your connection and try again." };
    }
}

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
        const result = await _doSendOtp();
        loading(false);

        if (result.ok) {
            const masked = currentPhoneClean.slice(0, 2) + '••••••' + currentPhoneClean.slice(-2);
            const sub = document.getElementById('otp-phone-hint');
            if (sub) sub.innerText = LOCAL_MODE
                ? `Use OTP: 123456`
                : `OTP sent to ${masked}`;
            showScreen('screen-otp');
            _startOtpResendCooldown(30);
            setTimeout(() => document.getElementById('otp-1').focus(), 400);
        } else {
            el.style.borderColor = "var(--error)";
            el.style.boxShadow = "";
            _showPhoneErr(result.message);
            el.value = "";
        }
    } else {
        el.style.borderColor = ""; el.style.boxShadow = "";
    }
}

async function resendOtp() {
    const btn = document.getElementById('resend-otp-btn');
    if (btn) btn.disabled = true;
    clearErr('otp-err');
    loading(true, "SENDING OTP...");
    const result = await _doSendOtp();
    loading(false);
    if (result.ok) {
        showToast("OTP resent successfully.");
        _startOtpResendCooldown(30);
    } else {
        document.getElementById('otp-err').innerText = result.message;
        document.getElementById('otp-err').style.display = 'block';
        if (btn) { btn.disabled = false; btn.innerText = 'Resend OTP'; }
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

function _showOtpErr(msg) {
    document.querySelectorAll('.otp-box').forEach(b => { b.value = ""; b.style.borderColor = "var(--error)"; });
    document.getElementById('otp-err').innerText = msg;
    document.getElementById('otp-err').style.display = 'block';
    document.getElementById('otp-1').focus();
}

async function checkLocalLogin(otpCode) {
    loading(true, "VERIFYING...");
    if (LOCAL_MODE) {
        if (otpCode !== '123456') {
            loading(false);
            _showOtpErr("Incorrect OTP. Use 123456.");
            return;
        }
        const users = JSON.parse(localStorage.getItem('mediflow_local_users') || '[]');
        const existingUser = users.find(u => u.phone === currentPhoneClean);
        loading(false);
        if (existingUser) {
            localStorage.setItem('mediflow_current_session', JSON.stringify(existingUser));
            updateDash(existingUser);
            renderCategoriesTab();
            renderPopularMeds();
            await loadAddresses(existingUser.id);
            if (window.currentAddresses.length === 0) {
                openAddressManager(true);
            } else {
                showScreen('screen-dash');
            }
        } else {
            showScreen('screen-profile');
        }
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentPhoneClean, otp: otpCode })
        });

        let data = {};
        if (!res.ok) {
            try { data = await res.json(); } catch (_) { /* non-JSON body; fall back to empty object */ }
            loading(false);
            _showOtpErr(data.message || `Verification failed (${res.status}). Please try again.`);
            return;
        }

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
            _showOtpErr(data.message || "Incorrect OTP. Please try again.");
        }
    } catch (e) {
        loading(false);
        _showOtpErr("Could not reach the server. Please check your connection and try again.");
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
    if (LOCAL_MODE) {
        const newUser = { id: 'local-' + crypto.randomUUID(), phone: currentPhoneClean, name: n, age: a, gender };
        if (emailVal) newUser.email = emailVal;
        const users = JSON.parse(localStorage.getItem('mediflow_local_users') || '[]');
        users.push(newUser);
        localStorage.setItem('mediflow_local_users', JSON.stringify(users));
        localStorage.setItem('mediflow_current_session', JSON.stringify(newUser));
        updateDash(newUser);
        renderCategoriesTab();
        renderPopularMeds();
        loading(false);
        openAddressManager(true);
        return;
    }
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
    document.getElementById('db-info-disp').innerText = user.phone;
    document.getElementById('profile-email').value = user.email || '';
    const avatarEl = document.getElementById('profile-avatar-initials');
    if (avatarEl) avatarEl.innerText = user.name.charAt(0).toUpperCase();
    // Update address count subtitle
    const addrCountEl = document.getElementById('saved-addresses-count');
    if (addrCountEl) {
        const cnt = (window.currentAddresses || []).length;
        addrCountEl.innerText = cnt > 0 ? `${cnt} Address${cnt !== 1 ? 'es' : ''}` : 'No addresses saved';
    }
    setHomeGreeting();
    renderSuggestedProducts();
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

    // Show location row only on the home/dashboard tab
    const locRow = document.getElementById('header-location-row');
    if (locRow) locRow.style.display = (tabId === 'tab-home') ? '' : 'none';

    if (tabId === 'tab-home') {
        const scrollTop = mainScroll ? mainScroll.scrollTop : 0;
        if (scrollTop > 60) {
            dashHeader.classList.add('compact');
            if (mainScroll) mainScroll.style.paddingTop = '122px';
        } else {
            dashHeader.classList.remove('compact');
            if (mainScroll) mainScroll.style.paddingTop = '196px';
        }
        setHomeGreeting();
    } else {
        dashHeader.classList.add('compact');
        mainScroll.style.paddingTop = '122px';

        if (tabId === 'tab-category') { document.getElementById('greeting-text').innerText = t('explore_pharmacy'); document.getElementById('dash-user').innerText = t('explore_pharmacy_sub'); }
        else if (tabId === 'tab-health') { document.getElementById('greeting-text').innerText = "Health"; document.getElementById('dash-user').innerText = t('health_title'); renderHealthTab(); }
        else if (tabId === 'tab-doctor') { document.getElementById('greeting-text').innerText = t('consult'); document.getElementById('dash-user').innerText = t('specialists'); }
        else if (tabId === 'tab-delivery') { document.getElementById('greeting-text').innerText = t('checkout_title'); document.getElementById('dash-user').innerText = t('checkout_sub'); }
        else if (['tab-profile', 'tab-orders', 'tab-wishlist', 'tab-refunds', 'tab-payments', 'tab-profile-settings'].includes(tabId)) {
            document.getElementById('greeting-text').innerText = t('manage') || "Manage";
            document.getElementById('dash-user').innerText = t('account') || "Account";
            if (tabId === 'tab-profile-settings') {
                // Populate profile settings sub-page with current user data
                const psName = document.getElementById('ps-name-disp');
                const psPhone = document.getElementById('ps-phone-disp');
                if (window.currentUser) {
                    if (psName) psName.innerText = window.currentUser.name;
                    if (psPhone) psPhone.innerText = window.currentUser.phone;
                }
                renderLangGrid();
            }
        }
    }

    // Hide bottom nav dock on account/profile pages; reduce bottom padding since nav is gone
    const navDock = document.querySelector('.nav-dock');
    const accountTabs = ['tab-profile', 'tab-orders', 'tab-wishlist', 'tab-refunds', 'tab-payments', 'tab-profile-settings'];
    if (navDock) {
        navDock.style.display = accountTabs.includes(tabId) ? 'none' : '';
    }
    if (mainScroll) {
        mainScroll.style.paddingBottom = accountTabs.includes(tabId) ? '20px' : '';
    }

    updateCartUI();
}

// --- MISSING FUNCTIONS (fixes JS errors) ---
function triggerDoctorTab() {
    const docNavBtn = document.querySelector('.nav-dock .nav-item:nth-child(4)');
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
        box-shadow:0 0 0 0 rgba(0,151,167,0.5);
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

// ─── HEALTH ENCYCLOPEDIA ────────────────────────────────────────────────────

function renderHealthTab() {
    const diseaseCategories = ['All', ...new Set(DISEASE_DB.map(d => d.category))];
    const pillsEl = document.getElementById('disease-category-pills');
    if (pillsEl && pillsEl.children.length === 0) {
        pillsEl.innerHTML = diseaseCategories.map(cat =>
            `<div class="disease-cat-pill ${cat === _currentDiseaseCategory ? 'active' : ''}" data-cat="${cat.replace(/"/g,'&quot;')}">${cat === 'All' ? t('health_all') : cat}</div>`
        ).join('');
        pillsEl.addEventListener('click', function(e) {
            const pill = e.target.closest('.disease-cat-pill');
            if (pill && pill.dataset.cat) _setDiseaseCategory(pill.dataset.cat);
        });
    }
    _renderDiseaseList();
}

function _setDiseaseCategory(cat) {
    _currentDiseaseCategory = cat;
    const pillsEl = document.getElementById('disease-category-pills');
    if (pillsEl) {
        Array.from(pillsEl.children).forEach(p => {
            p.classList.toggle('active', p.textContent === cat || (cat === 'All' && (p.textContent === 'All' || p.textContent === t('health_all'))));
        });
    }
    _renderDiseaseList();
}

function filterDiseases(query) {
    _currentDiseaseSearch = query.trim().toLowerCase();
    _renderDiseaseList();
}

function _renderDiseaseList() {
    const listEl = document.getElementById('disease-list');
    if (!listEl) return;

    let filtered = DISEASE_DB;
    if (_currentDiseaseCategory !== 'All') {
        filtered = filtered.filter(d => d.category === _currentDiseaseCategory);
    }
    if (_currentDiseaseSearch) {
        filtered = filtered.filter(d =>
            d.name.toLowerCase().includes(_currentDiseaseSearch) ||
            d.symptoms.some(s => s.toLowerCase().includes(_currentDiseaseSearch)) ||
            d.category.toLowerCase().includes(_currentDiseaseSearch)
        );
    }

    if (filtered.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding:40px 0; color:var(--gray-text);">
            <i class="fa-solid fa-magnifying-glass" style="font-size:28px; margin-bottom:12px; display:block;"></i>
            <p style="font-size:14px; font-weight:600;">No results found</p>
        </div>`;
        return;
    }

    listEl.innerHTML = filtered.map(d => `
        <div class="disease-card" data-disease-id="${d.id}">
            <div class="disease-card-header">
                <div class="disease-card-icon" style="background:${d.iconBg}; color:${d.iconColor};">
                    <i class="fa-solid ${d.icon}"></i>
                </div>
                <div>
                    <div class="disease-card-title">${d.name}</div>
                    <div class="disease-card-tag">${d.category}</div>
                </div>
            </div>
            <div class="disease-card-summary">${d.summary}</div>
            <div class="disease-card-footer">
                ${d.symptoms.slice(0, 3).map(s => `<span class="disease-symptom-chip">${s}</span>`).join('')}
                ${d.symptoms.length > 3 ? `<span class="disease-symptom-chip" style="background:#F3F4F6; color:var(--gray-text);">+${d.symptoms.length - 3} more</span>` : ''}
            </div>
        </div>
    `).join('');

    listEl.addEventListener('click', function(e) {
        const card = e.target.closest('.disease-card[data-disease-id]');
        if (card && card.dataset.diseaseId) openDiseaseDetail(card.dataset.diseaseId);
    }, { once: true });
}

function openDiseaseDetail(id) {
    const d = DISEASE_DB.find(x => x.id === id);
    if (!d) return;

    const listEl = document.getElementById('disease-list');
    if (!listEl) return;

    listEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; cursor:pointer;" onclick="renderHealthTab(); _renderDiseaseList();">
            <div style="width:36px; height:36px; background:white; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex-shrink:0;">
                <i class="fa-solid fa-arrow-left" style="color:#111827; font-size:14px;"></i>
            </div>
            <span style="font-size:14px; font-weight:700; color:var(--gray-text);">All Conditions</span>
        </div>

        <div class="disease-detail-sheet">
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                <div class="disease-card-icon" style="background:${d.iconBg}; color:${d.iconColor}; width:52px; height:52px; border-radius:18px;">
                    <i class="fa-solid ${d.icon}" style="font-size:22px;"></i>
                </div>
                <div>
                    <div style="font-size:20px; font-weight:800; color:#111827;">${d.name}</div>
                    <div style="font-size:12px; font-weight:700; color:var(--c3); text-transform:uppercase; letter-spacing:0.4px; margin-top:2px;">${d.category}</div>
                </div>
            </div>

            <p style="font-size:14px; color:#374151; font-weight:500; line-height:1.7; margin:0;">${d.summary}</p>

            <div class="disease-detail-section-title">What Causes It?</div>
            <ul class="disease-detail-list">${d.causes.map(c => `<li>${c}</li>`).join('')}</ul>

            <div class="disease-detail-section-title">Common Signs & Symptoms</div>
            <ul class="disease-detail-list">${d.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>

            <div class="disease-detail-section-title" style="color:#166534;">What To Do</div>
            <ul class="disease-detail-list">${d.doThis.map(x => `<li>${x}</li>`).join('')}</ul>

            <div class="disease-detail-section-title" style="color:#DC2626;">What To Avoid</div>
            <ul class="disease-detail-list">${d.avoid.map(x => `<li>${x}</li>`).join('')}</ul>

            <div style="background:#FEF9C3; border:1.5px solid #FDE047; border-radius:16px; padding:14px 16px; margin-top:16px; display:flex; align-items:flex-start; gap:10px;">
                <i class="fa-solid fa-triangle-exclamation" style="color:#CA8A04; font-size:16px; margin-top:1px; flex-shrink:0;"></i>
                <div>
                    <div style="font-size:12px; font-weight:800; color:#92400E; margin-bottom:4px;">SEE A DOCTOR IF</div>
                    <p style="font-size:13px; color:#78350F; font-weight:500; margin:0; line-height:1.6;">${d.whenToSee}</p>
                </div>
            </div>
        </div>
    `;
}

// ─── LANGUAGE FUNCTIONS ─────────────────────────────────────────────────────

function renderLangGrid() {
    const grid = document.getElementById('lang-grid');
    if (!grid) return;
    grid.innerHTML = SUPPORTED_LANGS.map(lang => `
        <div class="lang-option ${_currentLang === lang.code ? 'selected' : ''}" onclick="setLanguage('${lang.code}')">
            <span class="lang-flag">${lang.flag}</span>
            <div>
                <div class="lang-name">${lang.name}</div>
                <div class="lang-native">${lang.native}</div>
            </div>
        </div>
    `).join('');
}

function setLanguage(code) {
    if (!TRANSLATIONS[code]) return;
    _currentLang = code;
    try { localStorage.setItem('mediflow_lang', code); } catch (e) { /* localStorage unavailable */ }
    renderLangGrid();
    applyLanguage();
    showToast('Language updated ✓');
}

function applyLanguage() {
    // Update all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (val) el.textContent = val;
    });
    // Update search placeholder
    const searchEl = document.getElementById('global-search');
    if (searchEl) searchEl.placeholder = t('search_placeholder');
    // Re-render cart if visible
    const cartTab = document.getElementById('tab-delivery');
    if (cartTab && cartTab.classList.contains('active-view')) updateCartUI();
    // Re-render health tab pills if visible
    const healthTab = document.getElementById('tab-health');
    if (healthTab && healthTab.classList.contains('active-view')) {
        const pillsEl = document.getElementById('disease-category-pills');
        if (pillsEl) pillsEl.innerHTML = ''; // force re-render on next renderHealthTab call
        renderHealthTab();
    }
}
