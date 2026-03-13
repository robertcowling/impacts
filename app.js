/**
 * Impact Intelligence Platform - Frontend Logic
 */

// --- Configuration & Constants ---
// --- Configuration & Constants ---
const BASEMAPS = {
    "Voyager": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    })
};



const CATEGORIES = {
    roads: { label: 'Roads', color: '#0284c7', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16M4 14h16M12 2v20"/></svg>' },
    railways: { label: 'Railways', color: '#6366f1', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M7 7h10M7 12h10M7 17h10"/></svg>' },
    social: { label: 'Social (Twitter)', color: '#06b6d4', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>' },
    news: { label: 'News', color: '#f472b6', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/></svg>' },
    energy: { label: 'Energy', color: '#eab308', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
    water: { label: 'Water', color: '#3b82f6', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
    proxy: { label: 'Proxy', color: '#64748b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/><path d="m17 7-5-5-5 5M17 17l-5 5-5-5"/></svg>' }
};

const SEVERITIES = {
    minimal: { label: 'Minimal', color: '#4ade80' },
    minor: { label: 'Minor', color: '#facc15' },
    significant: { label: 'Significant', color: '#fb923c' },
    severe: { label: 'Severe', color: '#f87171' }
};
// --- Assessment Justification Engine ---
function generateAssessment(category, severity, source) {
    const sourceReliability = {
        'National Highways': { score: 95, label: 'Official Feed' },
        'Railway Marketplace': { score: 90, label: 'Official Feed' },
        'BBC News': { score: 88, label: 'Verified Media' },
        'Twitter': { score: 55, label: 'Social / Unverified' },
        'Operational Feed': { score: 85, label: 'Operational' },
        'Met Office Digital': { score: 98, label: 'Official Gov' }
    };

    const srcInfo = sourceReliability[source] || { score: 60, label: 'Unknown' };
    const corroboration = Math.random() > 0.4;
    const corrobScore = corroboration ? 20 : 0;
    const isProxy = source === 'Met Office Digital';
    const proxyPenalty = isProxy ? -10 : 0;

    const confidence = Math.min(100, Math.max(30, srcInfo.score + corrobScore + proxyPenalty + Math.floor(Math.random() * 10 - 5)));

    const justifications = {
        roads: {
            minimal: 'Localised road disruption with no significant impact on strategic routes. Traffic management in place.',
            minor: 'Road disruption reported on A-roads. Motorway disruption always classified as at least Minor per Impact Framework.',
            significant: 'Motorway or multiple strategic route closures detected. Duration and diversion length indicate Significant impact.',
            severe: 'Major motorway network failure. Multiple closures with stranded motorists. Exceeds Significant threshold per framework.'
        },
        railways: {
            minimal: 'Minor train delays reported. No cancellations or route closures.',
            minor: 'Service cancellations on branch lines. Limited impact on mainline services.',
            significant: 'Mainline service disruption affecting multiple TOCs. Signal failures or line blockages.',
            severe: 'Network-wide disruption. Multiple mainline closures. Sustained cancellations exceeding 6 hours.'
        },
        social: {
            minimal: 'Low volume of social signals. No corroborating official sources.',
            minor: 'Moderate social signal volume with some corroboration from local accounts.',
            significant: 'High volume social signals with photo/video evidence. Multiple corroborating posts.',
            severe: 'Viral social signal with widespread photo evidence of severe conditions.'
        },
        news: {
            minimal: 'Brief mention in regional media. No sustained coverage.',
            minor: 'Regional news coverage with on-scene reporting.',
            significant: 'National media coverage. Multiple outlets reporting disruption.',
            severe: 'Leading national news story. Live coverage of major disruption.'
        },
        energy: {
            minimal: 'Isolated power fluctuations. No customer impact reported.',
            minor: 'Localised power outages affecting individual properties.',
            significant: 'Substation-level failure. Thousands of customers without power.',
            severe: 'Widespread grid failure across multiple distribution zones.'
        },
        water: {
            minimal: 'Low-level river rises within normal range.',
            minor: 'River levels at flood alert thresholds. Localised surface water.',
            significant: 'Flood warnings issued. Properties at risk of inundation.',
            severe: 'Severe flood warnings. Danger to life from deep/fast-flowing water.'
        },
        proxy: {
            minimal: 'Website traffic within normal seasonal range.',
            minor: 'Elevated platform traffic suggesting public concern.',
            significant: 'Significant surge correlating with active warnings.',
            severe: 'Extreme traffic spike. Platform under load. Indicates widespread public alarm.'
        }
    };

    let confLabel = 'Very Low';
    let confColor = '#64748b';
    if (confidence >= 80) { confLabel = 'High'; confColor = '#16a34a'; }
    else if (confidence >= 60) { confLabel = 'Medium'; confColor = '#d97706'; }
    else if (confidence >= 40) { confLabel = 'Low'; confColor = '#ea580c'; }

    return {
        confidence,
        confidenceLabel: confLabel,
        confidenceColor: confColor,
        sourceType: srcInfo.label,
        sourceScore: srcInfo.score,
        sourceLabel: srcInfo.score >= 90 ? 'Very High' : (srcInfo.score >= 70 ? 'High' : (srcInfo.score >= 50 ? 'Moderate' : 'Low')),
        corroborated: corroboration,
        isProxy,
        justification: (justifications[category] && justifications[category][severity]) || 'Assessment pending LLM analysis against Impact Framework.'
    };
}

function generateSummaryAssessment(name, severity, count) {
    const weights = { minimal: 45, minor: 62, significant: 84, severe: 92 };
    const baseConf = weights[severity] || 50;
    const finalConf = Math.min(100, baseConf + (count > 5 ? 5 : 0));
    
    let confLabel = 'Very Low';
    let confColor = '#64748b';
    if (finalConf >= 80) { confLabel = 'High'; confColor = '#16a34a'; }
    else if (finalConf >= 60) { confLabel = 'Medium'; confColor = '#d97706'; }
    else if (finalConf >= 40) { confLabel = 'Low'; confColor = '#ea580c'; }

    return {
        confidence: finalConf,
        confidenceLabel: confLabel,
        confidenceColor: confColor,
        sourceLabel: finalConf >= 80 ? 'High' : 'Moderate',
        justification: `Aggregate LLM analysis of ${count} evidence signals within ${name} confirms a sustained ${severity} impact level. High correlation between transport disruption and social indicators noted.`
    };
}


// --- Mock Data Engine ---
function generateMockImpacts() {
    const impacts = [];
    const now = new Date();
    
    // Centers of activity for mock data
    const hubs = [
        { lat: 52.4862, lng: -1.8904, name: 'Birmingham' },
        { lat: 53.4808, lng: -2.2426, name: 'Manchester' },
        { lat: 51.5074, lng: -0.1278, name: 'London' },
        { lat: 54.9783, lng: -1.6178, name: 'Newcastle' }
    ];

    // Weighted types: lots of social
    const weightedTypes = [
        'roads', 'roads', 
        'railways', 
        'social', 'social', 'social', 'social', 'social',
        'news', 'news',
        'energy', 
        'water'
    ];
    const sevs = ['minimal', 'minor', 'significant', 'severe'];

    for (let i = 0; i < 70; i++) {
        const hub = hubs[Math.floor(Math.random() * hubs.length)];
        const category = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
        const severity = sevs[Math.floor(Math.random() * sevs.length)];
        
        // Random offset from hub (reduced range to stay within land more reliably)
        const lat = hub.lat + (Math.random() - 0.5) * 1.5;
        const lng = hub.lng + (Math.random() - 0.5) * 1.2;

        // Random time within the last 48 hours
        const hoursAgo = Math.random() * 48;
        const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

        // Perform actual spatial lookup
        let regionLabel = findGeoAttribute([lng, lat], State.rawRegions) || "UK Region";
        let countyMatch = findGeoAttribute([lng, lat], State.rawCounties);
        let countyLabel = countyMatch || "Local Authority";

        const assessment = generateAssessment(category, severity, 
            category === 'social' ? 'Twitter' : 
            (category === 'news' ? 'BBC News' : 
            (category === 'roads' ? 'National Highways' : 
            (category === 'railways' ? 'Railway Marketplace' : 'Operational Feed'))));

        impacts.push({
            id: `ev-${i}`,
            lat,
            lng,
            category,
            severity,
            timestamp,
            title: getMockTitle(category),
            locationName: `${regionLabel} | ${countyLabel}`,
            evidence: getMockEvidence(category),
            source: category === 'social' ? 'Twitter' : 
                   (category === 'news' ? 'BBC News' : 
                   (category === 'roads' ? 'National Highways' : 
                   (category === 'railways' ? 'Railway Marketplace' : 'Operational Feed'))),
            sourceUrl: category === 'social' ? 'https://twitter.com' : 
                      (category === 'news' ? 'https://bbc.co.uk/news' : '#'),
            photo: getMockPhoto(category),
            assessment
        });
    }

    // Add Proxy Impact: Met Office Website Hits (One per day)
    const proxyLevels = ['minimal', 'minor', 'significant', 'severe'];
    // Today's proxy
    const todayProxyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    const todayHits = 1.5 + Math.random() * 1.5;
    impacts.push({
        id: 'proxy-today',
        lat: 54.5, lng: -2.0, // Geographic center of GB
        category: 'proxy',
        severity: proxyLevels[Math.floor(Math.random() * 4)],
        timestamp: todayProxyTime,
        title: 'Met Office Website Hits',
        locationName: 'United Kingdom | National',
        evidence: `National surge in public traffic. Real-time analytics show ${todayHits.toFixed(1)}M hits in last hour. Highly correlated with worsening weather context.`,
        source: 'Met Office Digital',
        sourceUrl: 'https://www.metoffice.gov.uk',
        isNational: true,
        assessment: generateAssessment('proxy', proxyLevels[Math.floor(Math.random() * 4)], 'Met Office Digital')
    });

    // Yesterday's proxy
    const yesterdayProxyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 15, 0, 0);
    impacts.push({
        id: 'proxy-yesterday',
        lat: 54.5, lng: -2.0,
        category: 'proxy',
        severity: 'significant',
        timestamp: yesterdayProxyTime,
        title: 'Met Office Website Hits',
        locationName: 'United Kingdom | National',
        evidence: `Sustained high traffic during yellow and amber warning periods. Total daily volume reached 4.2M hits.`,
        source: 'Met Office Digital',
        sourceUrl: 'https://www.metoffice.gov.uk',
        isNational: true,
        assessment: generateAssessment('proxy', 'significant', 'Met Office Digital')
    });

    return impacts;
}

/**
 * Point in Polygon Helper (Ray Casting)
 */
function isPointInPolygon(point, polygon) {
    const [lng, lat] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) &&
            (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function findGeoAttribute(point, geojson) {
    if (!geojson || !geojson.features) return null;
    for (const feature of geojson.features) {
        if (!feature.geometry) continue;
        const type = feature.geometry.type;
        const coords = feature.geometry.coordinates;
        let isInside = false;
        if (type === 'Polygon') {
            if (isPointInPolygon(point, coords[0])) isInside = true;
        } else if (type === 'MultiPolygon') {
            for (const poly of coords) {
                if (isPointInPolygon(point, poly[0])) {
                    isInside = true;
                    break;
                }
            }
        }
        if (isInside) {
            const p = feature.properties;
            return p.rgn19nm || p.rgn24nm || p.name || p.NAME || p.Region || p.REGION || p.ctry19nm || p.ctry24nm || null;
        }
    }
    return null;
}

function getMockPhoto(cat) {
    // 50% chance of no photo to ensure some cards collapse gracefully
    if (Math.random() < 0.5) return null;

    const photos = {
        roads: [
            'https://images.unsplash.com/photo-1545129139-1beb780cf337?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800'
        ],
        railways: [
            'https://images.unsplash.com/photo-1474487056233-0226ea79FD44?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1550982460-bc3689f41748?auto=format&fit=crop&q=80&w=800'
        ],
        social: [
            'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1621516744837-142279201103?auto=format&fit=crop&q=80&w=800'
        ],
        news: [
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1585829365234-781f7553f06e?auto=format&fit=crop&q=80&w=800'
        ],
        energy: [
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1626082896492-766af4eb6501?auto=format&fit=crop&q=80&w=800'
        ],
        water: [
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=800'
        ]
    };
    const list = photos[cat];
    return list[Math.floor(Math.random() * list.length)];
}

function getMockTitle(cat) {
    const roads = ['A1(M)', 'M6', 'M25', 'A14', 'A303', 'M1', 'M4', 'A42'];
    const statuses = ['Road Closure', 'Lane Closure', 'Surface Flooding', 'Severe Congestion'];
    
    const stations = ['Drax Power Station', 'Ratcliffe-on-Soar', 'Hinkley Point', 'Heysham', 'Torness', 'Pembroke'];
    const energyAlerts = ['Grid Stability Alert', 'Substation Failure', 'Partial Blackout risk', 'Frequency Drop'];

    const titles = {
        roads: () => `${roads[Math.floor(Math.random()*roads.length)]}: ${statuses[Math.floor(Math.random()*statuses.length)]}`,
        railways: () => ['Signal Failure: West Coast', 'Track Flooding near Leeds', 'Tree on Line: East Coast', 'Network Rail Speed Restriction'][Math.floor(Math.random()*4)],
        social: () => ['Post: Flood water rising fast', 'Alert: Bridge overtopped', 'Images: Local road collapsed', 'Twitter: Sandbags deployed'][Math.floor(Math.random()*4)],
        news: () => ['Storm disruption peaks across region', 'Met Office issues red warnings', 'Major infrastructure under pressure', 'Emergency response teams deployed'][Math.floor(Math.random()*4)],
        energy: () => `${stations[Math.floor(Math.random()*stations.length)]}: ${energyAlerts[Math.floor(Math.random()*energyAlerts.length)]}`,
        water: () => ['Treatment Plant Threshold Exceeded', 'Burst Water Main: Low Pressure', 'Sewer Overload in Urban Area', 'Reservoir Spillway Operational'][Math.floor(Math.random()*4)]
    };
    
    const res = titles[cat];
    return typeof res === 'function' ? res() : res;
}

function getMockEvidence(cat) {
    const texts = {
        roads: 'Social media reports indicate 30cm of standing water. National Highways confirming closure of northbound lanes.',
        railways: 'Network Rail reports signal failure due to water ingress in cable duct. Delays of up to 45 mins expected.',
        social: 'Twitter user @WeatherAlert identifies localized flooding at primary school entrance. Footage uploaded.',
        news: 'Local news outlet reports emergency services on site. "We\'ve never seen the water rise this fast," says resident.',
        energy: 'Automated sensor alert: Level 1 threshold exceeded at regional substation. Cooling systems operational.',
        water: 'High pressure alarm triggered at downstream filtration unit. System bypass activated to prevent surge damage.'
    };
    return texts[cat];
}

/// --- App State ---
const State = {
    map: null,
    regions: null,
    counties: null,
    regionNames: [],
    countyNames: [],
    impacts: [],
    markers: [],
    windowStart: 42, 
    windowEnd: 48,
    lastWindowDuration: 6,
    activeCategories: new Set(['roads', 'railways', 'social', 'news', 'energy', 'water', 'proxy']),
    activeSeverities: new Set(['minimal', 'minor', 'significant', 'severe']),
    showSeverity: false,
    selectedImpact: null,
    isPlaying: false,
    isDraggingWindow: false,
    dragStartX: 0,
    dragStartLow: 0,
    spatialMode: null, // 'region', 'county' or null
    // Storage for spatial lookup
    rawRegions: null,
    rawCounties: null
};

// --- Initialization ---
async function init() {
    State.map = L.map('map', { center: [52.8, -1.5], zoom: 7, zoomControl: false });
    
    // Basemaps
    BASEMAPS["Voyager"].addTo(State.map);
    
    // Fetch and Load GeoJSONs
    try {
        const [regionsRes, countiesRes] = await Promise.all([
            fetch('uk-regions.geojson').then(r => r.json()),
            fetch('uk-counties.geojson').then(r => r.json())
        ]);

        State.rawRegions = regionsRes;
        State.rawCounties = countiesRes;

        State.regions = L.geoJSON(regionsRes, {
            style: { color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 }
        });

        State.counties = L.geoJSON(countiesRes, {
            style: { color: '#94a3b8', weight: 1, opacity: 0.4, fillOpacity: 0 }
        });

        // Store names for mock generation
        State.regionNames = regionsRes.features.map(f => f.properties.name || f.properties.NAME || f.properties.Region || "UK Region");
        State.countyNames = countiesRes.features.map(f => f.properties.name || f.properties.NAME || f.properties.County || "County");

        // Add layers
        State.regions.addTo(State.map);
        
        // Manual layer toggles (from custom overlay html)
        setupMapOverlays();
    } catch (err) {
        console.error("Error loading GeoJSON layers:", err);
    }

    L.control.zoom({ position: 'topright' }).addTo(State.map);

    // Dynamic Mock Data after GeoJSON is loaded
    State.impacts = generateMockImpacts();
    
    renderTimelineTicks();
    setupEvents();
    
    syncDualSlider();
    renderImpacts();
    updateStats();
}

function renderTimelineTicks() {
    const labelsCont = document.getElementById('timeline-tick-labels');
    labelsCont.innerHTML = '';
    const now = new Date();
    
    // Create ticks for 48 hours
    for (let i = 0; i <= 48; i++) {
        const hoursAgo = 48 - i;
        const tickDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        const hrs = tickDate.getHours();

        let type = '';
        if (hrs === 0) type = 'major';
        else if (hrs === 12) type = 'moderate';
        else type = 'minor'; 

        const tick = document.createElement('div');
        tick.className = `tick ${type}`;
        tick.style.left = (i / 48 * 100) + '%';
        
        const line = document.createElement('div');
        line.className = `tick-line ${type}`;
        tick.appendChild(line);
        
        // Labels
        if (type !== 'minor') {
            const label = document.createElement('div');
            label.className = `tick-label ${type}`; // Add type class to label for specific styling
            
            if (type === 'major') {
                label.innerText = tickDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
            } else {
                label.innerText = '12:00';
            }
            tick.appendChild(label);
        }

        labelsCont.appendChild(tick);
    }
}

function setupEvents() {
    const sliderLow = document.getElementById('timeline-low');
    const sliderHigh = document.getElementById('timeline-high');

    // RHS is Primary - Moves window in tandem
    sliderHigh.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const duration = State.windowEnd - State.windowStart;
        
        State.windowEnd = val;
        State.windowStart = Math.max(0, val - duration);
        
        syncDualSlider();
        renderImpacts();
        updateStats();
    });

    // LHS sets duration or window start
    sliderLow.addEventListener('input', (e) => {
        let newLow = parseFloat(e.target.value);
        
        if (newLow > State.windowEnd - 0.5) {
            newLow = State.windowEnd - 0.5;
            sliderLow.value = newLow;
        }

        State.windowStart = newLow;
        State.lastWindowDuration = State.windowEnd - newLow;
        
        document.getElementById('view-period-select').value = 'custom';
        syncDualSlider();
        renderImpacts();
        updateStats();
    });

    // Spatial Mode Toggles
    const regionCheck = document.getElementById('spatial-checkbox');
    const countyCheck = document.getElementById('county-checkbox');

    regionCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'region';
            countyCheck.checked = false;
            // Clean up other layer
            State.counties.removeFrom(State.map);
            State.regions.addTo(State.map);
        } else {
            State.spatialMode = null;
            State.regions.setStyle({ color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 });
        }
        renderImpacts();
    });

    countyCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'county';
            regionCheck.checked = false;
            // Ensure counties are visible
            State.regions.removeFrom(State.map);
            State.counties.addTo(State.map);
        } else {
            State.spatialMode = null;
            State.counties.setStyle({ color: '#94a3b8', weight: 1, opacity: 0.4, fillOpacity: 0 });
            State.counties.removeFrom(State.map);
            State.regions.addTo(State.map);
        }
        renderImpacts();
    });

    // View Period Dropdown
    document.getElementById('view-period-select').addEventListener('change', (e) => {
        const val = e.target.value;
        const now = new Date();
        
        let newStart = 42;
        let newEnd = 48;

        if (val === "6") { newStart = 42; newEnd = 48; }
        else if (val === "12") { newStart = 36; newEnd = 48; }
        else if (val === "24") { newStart = 24; newEnd = 48; }
        else if (val === "today") {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const hoursAgo = (now - todayStart) / (1000 * 60 * 60);
            newStart = Math.max(0, 48 - hoursAgo);
            newEnd = 48;
        }
        else if (val === "yesterday") {
            const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // Start of today
            const hoursAgoStart = (now - yesterdayStart) / (1000 * 60 * 60);
            const hoursAgoEnd = (now - yesterdayEnd) / (1000 * 60 * 60);
            newStart = Math.max(0, 48 - hoursAgoStart);
            newEnd = Math.min(48, 48 - hoursAgoEnd);
        }

        State.windowStart = newStart;
        State.windowEnd = newEnd;
        State.lastWindowDuration = newEnd - newStart;
        
        syncDualSlider();
        renderImpacts();
        updateStats();
    });

    // Category Filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent double trigger from label/input
            const category = chip.dataset.category;
            if (State.activeCategories.has(category)) {
                State.activeCategories.delete(category);
                chip.classList.remove('active');
            } else {
                State.activeCategories.add(category);
                chip.classList.add('active');
            }
            renderImpacts();
            updateStats();
        });
    });

    // Severity Filters
    document.querySelectorAll('.severity-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault();
            const severity = chip.dataset.severity;
            if (State.activeSeverities.has(severity)) {
                State.activeSeverities.delete(severity);
                chip.classList.remove('active');
            } else {
                State.activeSeverities.add(severity);
                chip.classList.add('active');
            }
            renderImpacts();
            updateStats();
        });
    });

    // Date Picker Logic
    const datePicker = document.getElementById('timeline-date-picker');
    const todayStr = new Date().toISOString().split('T')[0];
    datePicker.value = todayStr;
    datePicker.max = todayStr;

    datePicker.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const now = new Date();
        const diffMs = now - selectedDate;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 0 || diffHours > 48) {
            alert("Please select a date within the last 48 hours for timeline synchronization.");
            datePicker.value = now.toISOString().split('T')[0];
            return;
        }

        // Jump timeline to start of that day
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const hoursAgo = (now - dayStart) / (1000 * 60 * 60);
        
        State.windowStart = Math.max(0, 48 - hoursAgo);
        State.windowEnd = Math.min(48, State.windowStart + State.lastWindowDuration);
        
        syncDualSlider();
        renderImpacts();
        updateStats();
    });

    // document.getElementById('close-sidebar').addEventListener('click', hideSidebar);

    document.getElementById('play-pause-btn').addEventListener('click', function() {
        State.isPlaying = !State.isPlaying;
        this.innerHTML = State.isPlaying ? 
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' : 
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        if (State.isPlaying) animateTimeline();
    });

    // Window Grab/Drag Logic
    const grabHandle = document.getElementById('timeline-grab');
    const sliderWrapper = document.querySelector('.slider-wrapper');

    grabHandle.addEventListener('mousedown', (e) => {
        State.isDraggingWindow = true;
        State.dragStartX = e.clientX;
        State.dragStartLow = State.windowStart;
        document.body.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!State.isDraggingWindow) return;

        const rect = sliderWrapper.getBoundingClientRect();
        const deltaX = e.clientX - State.dragStartX;
        const deltaHours = (deltaX / rect.width) * 48;

        let newLow = State.dragStartLow + deltaHours;
        const duration = State.windowEnd - State.windowStart;

        // Clamp
        if (newLow < 0) newLow = 0;
        if (newLow + duration > 48) newLow = 48 - duration;

        State.windowStart = newLow;
        State.windowEnd = newLow + duration;

        document.getElementById('view-period-select').value = 'custom';
        syncDualSlider();
        renderImpacts();
        updateStats();
    });

    window.addEventListener('mouseup', () => {
        if (State.isDraggingWindow) {
            State.isDraggingWindow = false;
            document.body.style.cursor = 'default';
        }
    });

    // User Menu & Config Modal Logic
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const configModal = document.getElementById('config-modal');
    const openConfigBtn = document.getElementById('open-config-btn');
    const closeConfigBtn = document.getElementById('close-config-btn');

    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    window.addEventListener('click', () => {
        userDropdown.classList.remove('active');
    });

    openConfigBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        configModal.classList.add('active');
        userDropdown.classList.remove('active');
    });

    closeConfigBtn.addEventListener('click', () => {
        configModal.classList.remove('active');
    });

    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) configModal.classList.remove('active');
    });

    // Modal Tabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
}

function syncDualSlider() {
    const sliderLow = document.getElementById('timeline-low');
    const sliderHigh = document.getElementById('timeline-high');
    const rangeSelected = document.querySelector('.range-selected');
    const viewSelect = document.getElementById('view-period-select');
    
    sliderLow.value = State.windowStart;
    sliderHigh.value = State.windowEnd;

    const lowPercent = (State.windowStart / 48) * 100;
    const highPercent = (State.windowEnd / 48) * 100;
    
    rangeSelected.style.left = lowPercent + '%';
    rangeSelected.style.width = (highPercent - lowPercent) + '%';

    // Update view select if it matches a preset
    const duration = State.windowEnd - State.windowStart;
    if (State.windowEnd === 48) {
        if (Math.abs(duration - 6) < 0.1 && viewSelect.value !== '6') viewSelect.value = '6';
        else if (Math.abs(duration - 12) < 0.1 && viewSelect.value !== '12') viewSelect.value = '12';
        else if (Math.abs(duration - 24) < 0.1 && viewSelect.value !== '24') viewSelect.value = '24';
    }

    const now = new Date();
    const startDate = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);

    const format = (d) => {
        const dateStr = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = d.getHours().toString().padStart(2, '0') + ':00';
        return `${dateStr}, ${timeStr}`;
    };
    document.getElementById('window-start-time').innerText = format(startDate);
    document.getElementById('window-end-time').innerText = format(endDate);

    // Update Date Picker to match end time
    const dp = document.getElementById('timeline-date-picker');
    const ds = endDate.toISOString().split('T')[0];
    if (dp.value !== ds) dp.value = ds;
}

function renderImpacts() {
    State.markers.forEach(m => State.map.removeLayer(m));
    State.markers = [];

    const now = new Date();
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);

    const filtered = State.impacts.filter(imp => {
        return imp.timestamp >= startCutoff && 
               imp.timestamp <= endCutoff && 
               State.activeCategories.has(imp.category) &&
               State.activeSeverities.has(imp.severity);
    });

    // Proxy markers handling (don't show national proxies as markers)
    const filteredForMarkers = filtered.filter(imp => !imp.isNational);

    filteredForMarkers.forEach(imp => {
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-inner ${imp.category} ${imp.severity}">${CATEGORIES[imp.category].icon}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
        const marker = L.marker([imp.lat, imp.lng], { icon: markerIcon }).on('click', () => showImpactDetails(imp)).addTo(State.map);
        State.markers.push(marker);
    });

    if (State.spatialMode === 'region') {
        updateSpatialSummary(filteredForMarkers, State.regions, State.rawRegions, 'severity');
    } else if (State.spatialMode === 'county') {
        updateSpatialSummary(filteredForMarkers, State.counties, State.rawCounties, 'blue');
    }
    
    renderFeed(filtered);
}

function updateSpatialSummary(filtered, leafletLayer, rawJson, ramp) {
    if (!rawJson) return;

    const severityWeight = { minimal: 1, minor: 2, significant: 3, severe: 4 };
    
    // Unified professional blue ramp for both regions and counties
    const colors = {
        minimal: '#93c5fd',     // Blue 300
        minor: '#3b82f6',       // Blue 500
        significant: '#1d4ed8', // Blue 700
        severe: '#1e3a8a'       // Blue 900
    };

    leafletLayer.eachLayer(layer => {
        const regionBounds = layer.getBounds();
        const regionFeat = layer.feature;
        
        let maxSev = 0;
        let maxLabel = null;

        filtered.forEach(imp => {
            if (regionBounds.contains([imp.lat, imp.lng])) {
                const geom = regionFeat.geometry;
                let isInside = false;
                if (geom.type === 'Polygon') {
                    isInside = isPointInPolygon([imp.lng, imp.lat], geom.coordinates[0]);
                } else if (geom.type === 'MultiPolygon') {
                    for (const poly of geom.coordinates) {
                        if (isPointInPolygon([imp.lng, imp.lat], poly[0])) { isInside = true; break; }
                    }
                }

                if (isInside) {
                    const weight = severityWeight[imp.severity] || 0;
                    if (weight > maxSev) {
                        maxSev = weight;
                        maxLabel = imp.severity;
                    }
                }
            }
        });

        if (maxLabel) {
            layer.setStyle({
                fillColor: colors[maxLabel],
                fillOpacity: 0.5,
                color: colors[maxLabel],
                weight: 2
            });
        } else {
            layer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0,
                color: '#334155',
                weight: 1
            });
        }
    });
}

function setupMapOverlays() {
    document.getElementById('toggle-regions').addEventListener('change', (e) => {
        if (e.target.checked) State.regions.addTo(State.map);
        else State.regions.removeFrom(State.map);
    });
    document.getElementById('toggle-counties').addEventListener('change', (e) => {
        if (e.target.checked) State.counties.addTo(State.map);
        else State.counties.removeFrom(State.map);
    });
}

function renderFeed(filtered) {
    const feedCont = document.getElementById('feed-container');
    const feedCount = document.getElementById('feed-count');
    
    if (State.spatialMode === 'region') {
        renderRegionalSummary(filtered);
        return;
    } else if (State.spatialMode === 'county') {
        renderCountySummary(filtered);
        return;
    }

    const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    feedCount.innerText = sorted.length;
    feedCont.innerHTML = '';

    sorted.forEach(imp => {
        const card = document.createElement('div');
        card.id = `card-${imp.id}`;
        card.className = 'feed-card' + (State.selectedImpact?.id === imp.id ? ' active' : '');
        
        const timeStr = imp.timestamp.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });

        const photoHtml = imp.photo ? `<div class="feed-card-photo" style="background-image: url('${imp.photo}')"></div>` : '';

        card.innerHTML = `
            ${photoHtml}
            <div class="feed-card-body">
                <div class="feed-card-header-row">
                    <div class="feed-card-meta">
                        <span class="feed-card-tag" style="background: ${CATEGORIES[imp.category].color}20; color: ${CATEGORIES[imp.category].color}">
                            ${CATEGORIES[imp.category].label}
                        </span>
                        <span class="feed-card-time">${timeStr}</span>
                    </div>
                    <a href="${imp.sourceUrl}" class="source-link" target="_blank" onclick="event.stopPropagation()">
                        ${imp.source}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                </div>
                <h4 class="feed-card-title">${imp.title}</h4>
                <div class="feed-card-content-wrap">
                    <p class="feed-card-evidence">${imp.evidence}</p>
                </div>
                <div class="feed-card-footer">
                    <div class="sev-label-box">
                        <span class="sev-dot-small" style="background: ${SEVERITIES[imp.severity].color}"></span>
                        <span style="color: ${SEVERITIES[imp.severity].color}">${SEVERITIES[imp.severity].label}</span>
                        <button class="assessment-info-btn" data-impact-id="${imp.id}" onclick="event.stopPropagation(); showAssessmentModal('${imp.id}')" title="View assessment justification">i</button>
                    </div>
                    <span class="loc-pill">${imp.locationName}</span>
                </div>
                ${imp.assessment ? `
                <div class="confidence-row">
                    <span class="confidence-label">Confidence</span>
                    <div class="confidence-bar-bg">
                        <div class="confidence-bar-fill" style="width: ${imp.assessment.confidence}%; background: ${imp.assessment.confidenceColor}"></div>
                    </div>
                    <span class="confidence-value">${imp.assessment.confidenceLabel}</span>
                </div>` : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            selectImpact(imp);
        });

        feedCont.appendChild(card);
    });
}

function renderRegionalSummary(filtered) {
    const feedCont = document.getElementById('feed-container');
    feedCont.innerHTML = '';

    // Aggregate by Region
    const regions = {};
    filtered.forEach(imp => {
        const region = imp.locationName.split('|')[0].trim();
        if (!regions[region]) {
            regions[region] = { count: 0, severe: 0, sources: new Set(), severity: 'minimal' };
        }
        regions[region].count++;
        if (imp.severity === 'severe') regions[region].severe++;
        regions[region].sources.add(imp.source);
        
        const weights = { minimal: 1, minor: 2, significant: 3, severe: 4 };
        if (weights[imp.severity] > weights[regions[region].severity]) {
            regions[region].severity = imp.severity;
        }
    });

    Object.keys(regions).sort((a,b) => regions[b].count - regions[a].count).forEach(r => {
        const data = regions[r];
        const summaryId = `summary-reg-${r.replace(/\s+/g, '-')}`;
        const assessment = generateSummaryAssessment(r, data.severity, data.count);
        
        // Store assessment in State temporarily for modal lookup (hacky but works for demo)
        State.impacts.push({
            id: summaryId,
            category: 'proxy',
            severity: data.severity,
            source: 'LLM Aggregate',
            assessment: {
                ...assessment,
                sourceType: 'Spatial Analysis',
                sourceScore: 90,
                corroborated: true,
                isProxy: false
            }
        });

        const card = document.createElement('div');
        card.className = 'region-summary-card';
        card.style.borderLeft = `4px solid ${SEVERITIES[data.severity].color}`;
        
        card.innerHTML = `
            <div class="summary-header">
                <h4>${r}</h4>
                <div class="summary-stats">
                    <span class="count">${data.count} signals</span>
                    <div class="sev-label-box">
                        <span class="sev-dot-small" style="background: ${SEVERITIES[data.severity].color}"></span>
                        <span style="color: ${SEVERITIES[data.severity].color}">${SEVERITIES[data.severity].label}</span>
                        <button class="assessment-info-btn" onclick="event.stopPropagation(); showAssessmentModal('${summaryId}')">i</button>
                    </div>
                </div>
            </div>
            <div class="summary-sources">
                <span class="src-label">Sources:</span>
                ${Array.from(data.sources).map(s => `<span class="src-pill">${s}</span>`).join('')}
            </div>
            <div class="confidence-row">
                <span class="confidence-label">Confidence</span>
                <div class="confidence-bar-bg">
                    <div class="confidence-bar-fill" style="width: ${assessment.confidence}%; background: ${assessment.confidenceColor}"></div>
                </div>
                <span class="confidence-value">${assessment.confidenceLabel}</span>
            </div>
            <div class="summary-footer">
                <button class="view-btn">Focus Region</button>
            </div>
        `;
        
        card.addEventListener('click', () => {
             const firstImp = filtered.find(i => i.locationName.includes(r));
             if (firstImp) State.map.panTo([firstImp.lat, firstImp.lng]);
        });
        
        feedCont.appendChild(card);
    });
}

function renderCountySummary(filtered) {
    const feedCont = document.getElementById('feed-container');
    feedCont.innerHTML = '';

    // Aggregate by County
    const counties = {};
    filtered.forEach(imp => {
        const parts = imp.locationName.split('|');
        const county = (parts[1] || parts[0]).trim();
        if (!counties[county]) {
            counties[county] = { count: 0, severe: 0, sources: new Set(), severity: 'minimal' };
        }
        counties[county].count++;
        if (imp.severity === 'severe') counties[county].severe++;
        counties[county].sources.add(imp.source);
        
        const weights = { minimal: 1, minor: 2, significant: 3, severe: 4 };
        if (weights[imp.severity] > weights[counties[county].severity]) {
            counties[county].severity = imp.severity;
        }
    });

    Object.keys(counties).sort((a,b) => counties[b].count - counties[a].count).forEach(c => {
        const data = counties[c];
        const summaryId = `summary-cty-${c.replace(/\s+/g, '-')}`;
        const assessment = generateSummaryAssessment(c, data.severity, data.count);

        State.impacts.push({
            id: summaryId,
            category: 'proxy',
            severity: data.severity,
            source: 'LLM Aggregate',
            assessment: {
                ...assessment,
                sourceType: 'Spatial Analysis',
                sourceScore: 85,
                corroborated: true,
                isProxy: false
            }
        });

        const card = document.createElement('div');
        card.className = 'region-summary-card'; // Reuse style
        card.style.borderLeft = `4px solid ${SEVERITIES[data.severity].color}`;
        
        card.innerHTML = `
            <div class="summary-header">
                <h4>${c}</h4>
                <div class="summary-stats">
                    <span class="count">${data.count} signals</span>
                    <div class="sev-label-box">
                        <span class="sev-dot-small" style="background: ${SEVERITIES[data.severity].color}"></span>
                        <span style="color: ${SEVERITIES[data.severity].color}">${SEVERITIES[data.severity].label}</span>
                        <button class="assessment-info-btn" onclick="event.stopPropagation(); showAssessmentModal('${summaryId}')">i</button>
                    </div>
                </div>
            </div>
            <div class="summary-sources">
                <span class="src-label">Sources:</span>
                ${Array.from(data.sources).map(s => `<span class="src-pill">${s}</span>`).join('')}
            </div>
            <div class="confidence-row">
                <span class="confidence-label">Confidence</span>
                <div class="confidence-bar-bg">
                    <div class="confidence-bar-fill" style="width: ${assessment.confidence}%; background: ${assessment.confidenceColor}"></div>
                </div>
                <span class="confidence-value">${assessment.confidenceLabel}</span>
            </div>
            <div class="summary-footer">
                <button class="view-btn">Focus County</button>
            </div>
        `;
        
        card.addEventListener('click', () => {
             const firstImp = filtered.find(i => i.locationName.includes(c));
             if (firstImp) State.map.panTo([firstImp.lat, firstImp.lng]);
        });
        
        feedCont.appendChild(card);
    });
}

function selectImpact(imp, isRerender = true) {
    State.selectedImpact = imp;

    // Skip map pan for national impacts
    if (!imp.isNational) {
        State.map.panTo([imp.lat, imp.lng]);
    }
    
    // Highlight marker
    State.markers.forEach(m => {
        const icon = m.getElement();
        if (icon) {
            // Check coordinates match
            const pos = m.getLatLng();
            if (Math.abs(pos.lat - imp.lat) < 0.0001 && Math.abs(pos.lng - imp.lng) < 0.0001) {
                icon.classList.add('marker-highlight');
            } else {
                icon.classList.remove('marker-highlight');
            }
        }
    });

    if (isRerender) {
        // Refresh feed to show active card
        const now = new Date();
        const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
        const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);
        
        const filtered = State.impacts.filter(imp => {
            return imp.timestamp >= startCutoff && 
                   imp.timestamp <= endCutoff && 
                   State.activeCategories.has(imp.category) &&
                   State.activeSeverities.has(imp.severity);
        });
        renderFeed(filtered);

        // Scroll into view in RHS feed
        setTimeout(() => {
            const cardElement = document.getElementById(`card-${imp.id}`);
            if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

function showImpactDetails(imp) {
    selectImpact(imp);
}

function hideSidebar() {
    // Sidebar removed, this is now a no-op or close select
    State.selectedImpact = null;
    renderImpacts();
}

function updateStats() {
    const now = new Date();
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);
    
    const inWindow = State.impacts.filter(i => i.timestamp >= startCutoff && i.timestamp <= endCutoff);

    document.getElementById('total-count').innerText = inWindow.length;
}



function animateTimeline() {
    if (!State.isPlaying) return;
    
    const sliderLow = document.getElementById('timeline-low');
    const sliderHigh = document.getElementById('timeline-high');
    const windowSize = State.windowEnd - State.windowStart;
    
    let newStart = State.windowStart + 0.5;
    let newEnd = State.windowEnd + 0.5;
    
    if (newEnd > 48) {
        newEnd = windowSize;
        newStart = 0;
    }
    
    sliderLow.value = newStart;
    sliderHigh.value = newEnd;
    State.windowStart = newStart;
    State.windowEnd = newEnd;
    
    syncDualSlider();
    renderImpacts();
    updateStats();
    
    setTimeout(animateTimeline, 400);
}

// --- Assessment Modal ---
function showAssessmentModal(impactId) {
    const imp = State.impacts.find(i => i.id === impactId);
    if (!imp || !imp.assessment) return;

    const modal = document.getElementById('assessment-modal');
    const body = document.getElementById('assessment-modal-body');
    const a = imp.assessment;

    body.innerHTML = `
        <div class="justification-section">
            <h5>Severity Classification</h5>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                <span class="sev-dot-small" style="background:${SEVERITIES[imp.severity].color};width:12px;height:12px"></span>
                <strong style="color:${SEVERITIES[imp.severity].color};font-size:1rem">${SEVERITIES[imp.severity].label}</strong>
                <span style="font-size:0.75rem;color:var(--text-secondary)">${CATEGORIES[imp.category].label} impact</span>
            </div>
            <p class="justification-text">${a.justification}</p>
        </div>
        <div class="justification-section">
            <h5>Confidence Assessment</h5>
            <div class="confidence-detail-grid">
                <div class="confidence-factor">
                    <div class="cf-label">Source Reliability</div>
                    <div class="cf-value">${a.sourceLabel || 'Moderate'}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${a.sourceType}</div>
                </div>
                <div class="confidence-factor">
                    <div class="cf-label">Corroboration</div>
                    <div class="cf-value">${a.corroborated ? 'Yes' : 'No'}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${a.corroborated ? 'Confirmed by neighbouring signals' : 'No corroborating sources found'}</div>
                </div>
                <div class="confidence-factor">
                    <div class="cf-label">Signal Type</div>
                    <div class="cf-value">${a.isProxy ? 'Proxy' : 'Direct'}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${a.isProxy ? 'Indirect indicator (penalty applied)' : 'Direct observation or report'}</div>
                </div>
                <div class="confidence-factor">
                    <div class="cf-label">Overall Confidence</div>
                    <div class="cf-value" style="color:${a.confidenceColor}">${a.confidenceLabel}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">Categorical assessment</div>
                </div>
            </div>
        </div>
        <div class="justification-section">
            <h5>Assessment Basis</h5>
            <ul class="justification-factors">
                <li><span class="factor-icon">📋</span> Assessed against the Impact Framework severity matrix (Config > Impact Framework)</li>
                <li><span class="factor-icon">🤖</span> Classification generated by LLM using evidence signals and framework criteria</li>
                <li><span class="factor-icon">🔗</span> Source: ${imp.source} (${a.sourceType})</li>
            </ul>
        </div>
        <div class="framework-ref">
            <strong>Framework Reference:</strong> This assessment follows the Flood Impacts Table severity definitions. In production, an LLM analyses each signal against the configured Impact Framework to derive both severity and confidence.
        </div>
    `;

    modal.classList.add('active');
}

// Wire up assessment modal close
document.addEventListener('DOMContentLoaded', () => {
    const assessModal = document.getElementById('assessment-modal');
    const closeAssessBtn = document.getElementById('close-assessment-btn');
    
    if (closeAssessBtn) {
        closeAssessBtn.addEventListener('click', () => assessModal.classList.remove('active'));
    }
    if (assessModal) {
        assessModal.addEventListener('click', (e) => {
            if (e.target === assessModal) assessModal.classList.remove('active');
        });
    }
});

// Start App
window.addEventListener('load', init);
