/**
 * Impact Intelligence Platform - Frontend Logic
 */

// --- Configuration & Constants ---
const FIXED_NOW = new Date('2025-11-14T17:00:00Z');

function getFeatureName(p) {
    if (!p) return null;
    let name = p.PCON24NM || p.rgn19nm || p.rgn24nm || p.ctyua19nm || p.ctyua24nm || p.lad19nm || p.lad24nm ||
           p.name || p.NAME || p.Region || p.REGION || p.ctry19nm || p.ctry24nm;
    
    // Extract Westminster Constituency name from description table if available
    if (p.description && typeof p.description.value === 'string') {
        const match = p.description.value.match(/<tr><td>PCON24NM<\/td><td>(.*?)<\/td><\/tr>/i);
        if (match && match[1]) name = match[1].trim();
    }
    
    return name || null;
}

const BASEMAPS = {
    "Voyager": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    })
};

const CATEGORIES = {
    roads: { label: 'National Highways', color: '#446b82', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 22L7 2M17 2l3 20M12 4v4m0 6v4"/></svg>' },
    railways: { label: 'Railway Marketplace', color: '#5b61a1', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2L7 22M17 2L17 22M7 5H17M7 10H17M7 15H17M7 20H17"/></svg>' },
    social: { label: 'Twitter', color: '#4e828a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>' },
    news: { label: 'Online News', color: '#8a4e6b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM6 6h12M6 10h12M6 14h6M6 18h6M16 14v4"/></svg>' },
    energy: { label: 'Power Companies', color: '#8a7d4e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
    water: { label: 'Water Companies', color: '#4e6b8a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
    'google-trends': { label: 'Google Trends', color: '#a15b5b', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></circle></svg>' },
    'ea-help': { label: 'EA Help Report', color: '#4e8a6b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>' }
};

const IMPACT_TYPES = {
    roads: { label: 'Roads', categories: ['roads'], color: '#446b82', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 22L7 2M17 2l3 20M12 4v4m0 6v4"/></svg>' },
    rail: { label: 'Rail', categories: ['railways'], color: '#5b61a1', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2L7 22M17 2L17 22M7 5H17M7 10H17M7 15H17M7 20H17"/></svg>' },
    housing: { label: 'Homes and Businesses', categories: ['social', 'news', 'ea-help'], color: '#8a4e6b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    energy: { label: 'Energy', categories: ['energy'], color: '#8a7d4e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
    utilities: { label: 'Utilities', categories: ['water'], color: '#4e6b8a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' }
};

const SEVERITIES = {
    minor: { label: 'Minor', color: '#dbeafe' },
    significant: { label: 'Significant', color: '#2563eb' },
    severe: { label: 'Severe', color: '#0f172a' }
};

/**
 * Generates a detailed assessment for a single impact
 */
function generateAssessment(category, severity, sourceLabel) {
    const isGoogleTrends = category === 'google-trends';
    const isOfficial = ['roads', 'railways', 'energy', 'water', 'ea-help'].includes(category);
    
    const confValue = isGoogleTrends ? Math.random() : 0.7 + Math.random() * 0.3;
    let confidenceLabel = 'High';
    let confidenceColor = '#4ade80';
    if (confValue < 0.6) {
        confidenceLabel = 'Low';
        confidenceColor = '#ef4444';
    } else if (confValue < 0.85) {
        confidenceLabel = 'Medium';
        confidenceColor = '#facc15';
    }

    const justifications = {
        roads: "National Highways reports confirmed lane closures. Traffic sensors show speeds < 10mph in affected sections.",
        railways: "Railway Marketplace advisory issued for the region. Multiple infrastructure failures and track flooding reported.",
        social: "High volume of localized social media reports corroborated by uploaded imagery showing infrastructure stress.",
        news: "Major regional and national news outlets confirming widespread disruption and active emergency response.",
        energy: "South Western Power monitoring systems detect voltage fluctuations and localized substation failures in the area.",
        water: "Utility provider logs show multiple burst mains and pressure drops aligned with reported flooding locations.",
        proxy: "Strong statistical correlation between surge in Met Office digital traffic and localized severe weather triggers.",
        'google-trends': "Anomalous spike in search volume for flood-related safety terms within the specific geographic region.",
        'ea-help': "Official Internal HELP report from Environment Agency. Validated by regional operational duty officer."
    };

    const sourceName = sourceLabel || (category === 'social' ? 'Social Monitoring' : (category === 'news' ? 'Media Intelligence' : 'Infrastructure Network'));

    // Timing logic
    const now = new Date(FIXED_NOW);
    const startOffset = Math.floor(Math.random() * 4);
    const endOffset = 6 + Math.floor(Math.random() * 12);
    const startTime = new Date(now.getTime() - startOffset * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + endOffset * 60 * 60 * 1000);

    const vividExamples = {
        roads: "a section of the A-road with standing water and 2 vehicle recoveries underway",
        railways: "signalling failure affecting multiple platforms with overhead line damage",
        social: "a street with perhaps 30 properties flooded and residents requesting sandbags",
        news: "emergency services attending a localized structural collapse in the town center",
        energy: "a cluster of 500+ properties without power and localized substation arcing",
        water: "a major burst water main causing surface flooding and low pressure for 1000+ homes",
        proxy: "anomalous data patterns suggesting significant localized flood risk development",
        'google-trends': "unprecedented search volume for emergency flood protection in the area",
        'ea-help': "official reports of river bank overtopping with immediate risk to adjacent properties"
    };

    const ex = vividExamples[category] || "localized environmental stress and reported infrastructure failure";

    return {
        confidenceLabel,
        confidenceColor,
        justification: justifications[category] || "Automated assessment based on multi-source impact analysis and framework criteria.",
        sourceLabel: sourceName,
        sourceReliability: isOfficial ? 'Official' : 'Unofficial',
        intelligenceType: isGoogleTrends ? 'Proxy' : 'Direct',
        corroborated: Math.random() > 0.3,
        startTiming: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTiming: "", // Left blank as requested
        synthesis: `Evidence shows ${ex}${isOfficial ? ' as reported by official channels' : ' based on emerging field reports'}. Given the scale and urgency, this observation satisfies the criteria for an escalation in response.`,
        confidenceStatement: `This is a <strong>${confidenceLabel}</strong> confidence assessment. It is based on <strong>${isOfficial ? 'Official' : 'Unofficial'}</strong> data from <strong>${isGoogleTrends ? 'Proxy' : 'Direct'}</strong> sources, which have been ${Math.random() > 0.3 ? 'successfully corroborated' : 'identified as isolated reports'} across the network.`
    };
}

/**
 * Generates an aggregate summary assessment for a region or county
 */
function generateSummaryAssessment(name, severity, count) {
    const confValue = 0.75 + Math.random() * 0.25;
    let confidenceLabel = 'High';
    let confidenceColor = '#4ade80';
    if (confValue < 0.85) {
        confidenceLabel = 'Medium';
        confidenceColor = '#facc15';
    }

    const sevDescs = {
        minor: "localised disruptions and minor infrastructure strain",
        significant: "widespread regional disruption and moderate pressure on assets",
        severe: "major structural failures and critical system-wide data indicators"
    };

    const now = new Date(FIXED_NOW);
    const st = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const et = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const vividSummary = count > 5 
        ? `widespread reports across ${name} including multiple streets with 10-20 properties flooded and critical road blockages`
        : `localized cluster of evidence in ${name} showing infrastructure stress and approximately 15 properties affected by surface water`;

    return {
        confidenceLabel,
        confidenceColor,
        justification: `Assessment of ${count} independent ${count === 1 ? 'impact' : 'impacts'} in ${name} aligns with a ${severity} classification. Evidence indicates ${sevDescs[severity]}.`,
        sourceReliability: 'Mixed / Corroborated',
        intelligenceType: 'Spatial Analysis',
        corroborated: true,
        startTiming: st.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTiming: "", // Left blank as requested
        synthesis: `The synthesized analysis for ${name} combines ${count} unique data points. Evidence includes ${vividSummary}. According to the impact framework, this correlates to a ${severity} level of impact.`,
        confidenceStatement: `This is a <strong>${confidenceLabel}</strong> confidence assessment. It is based on aggregated <strong>Mixed</strong> data sources using <strong>Spatial Analysis</strong>, which provides high-integrity corroboration for this regional cluster.`
    };
}

/// --- Data Fetching Engine (Mock generation moved to scripts/generate_data.js) ---

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
            return getFeatureName(feature.properties);
        }
    }
    return null;
}

/// --- App State ---
const State = {
    map: null,
    regions: null,
    counties: null,
    constituencies: null,
    regionNames: [],
    countyNames: [],
    constituencyNames: [],
    impacts: [],
    markers: [],
    polygons: [],
    windowStart: 0, 
    windowEnd: 48,
    lastWindowDuration: 0,
    activeCategories: new Set(['roads', 'railways', 'social', 'news', 'energy', 'water', 'ea-help']),
    activeSeverities: new Set(['minor', 'significant', 'severe']),
    showSeverity: false,
    selectedImpact: null,
    isDraggingWindow: false,
    dragStartX: 0,
    dragStartLow: 0,
    spatialMode: 'county', // 'region', 'county', 'constituency' or null
    // Storage for spatial lookup
    rawRegions: null,
    rawCounties: null,
    rawConstituencies: null,
    viewMode: 'map', // 'map' or 'summary'
    summaryGroup: 'severity', // 'severity', 'receptor', 'category' (as Type)
    feedSort: 'recency',
    sidebarView: 'sources',
    // Agentic Search State
    searchMap: null,
    searchPoints: [],
    searchPolygon: null,
    searchLine: null,
    searchGhostLine: null,
    searchMarkers: [],
    searchMode: 'forecast'
};

/**
 * Generates a random polygon around a center point for outages/widespread areas
 */
function generateRandomPolygon(center, size = 0.5) {
    const coords = [];
    const numPoints = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const dist = size * (0.6 + Math.random() * 0.4);
        coords.push([
            center.lat + Math.sin(angle) * dist,
            center.lng + Math.cos(angle) * dist
        ]);
    }
    return coords;
}

/**
 * Finds which county GeoJSON features intersect with a given polygon
 */
function findIntersectingFeatures(polyCoords, geojson) {
    if (!geojson || !geojson.features) return [];
    const intersecting = [];
    
    const lngLatPoly = polyCoords.map(c => [c[1], c[0]]);
    
    geojson.features.forEach(feature => {
        const name = getFeatureName(feature.properties);
        const geom = feature.geometry;
        if (!geom || !geom.coordinates) return;

        let isIntersecting = false;

        const checkPart = (rings) => {
            // Check if any point of our outage polygon is inside this feature part
            for (let i = 0; i < lngLatPoly.length; i++) {
                if (isPointInPolygon(lngLatPoly[i], rings[0])) return true;
            }
            // Check if any point of the feature part is inside our outage polygon
            if (isPointInPolygon(rings[0][0], lngLatPoly)) return true;
            return false;
        };

        if (geom.type === 'Polygon') {
            if (checkPart(geom.coordinates)) isIntersecting = true;
        } else if (geom.type === 'MultiPolygon') {
            for (const part of geom.coordinates) {
                if (checkPart(part)) {
                    isIntersecting = true;
                    break;
                }
            }
        }

        if (isIntersecting && name) intersecting.push(name);
    });
    
    return [...new Set(intersecting)];
}

// --- Initialization ---
async function init() {
    State.map = L.map('map', { center: [52.8, -1.5], zoom: 7, zoomControl: false });
    
    // Basemaps
    BASEMAPS["Voyager"].addTo(State.map);
    
    // Fetch and Load GeoJSONs
    try {
        const [regionsRes, countiesRes, constRes] = await Promise.all([
            fetch('uk-regions.geojson').then(r => r.json()),
            fetch('uk-counties.geojson').then(r => r.json()),
            fetch('westminister.json').then(r => r.json())
        ]);

        State.rawRegions = regionsRes;
        State.rawCounties = countiesRes;
        State.rawConstituencies = constRes;

        const onSpatialClick = (e) => {
            const layer = e.target;
            const feature = layer.feature;
            // More subtle zoom-to-bounds with larger padding and a max zoom cap
            State.map.fitBounds(layer.getBounds(), { 
                padding: [100, 100], 
                maxZoom: 8,
                animate: true,
                duration: 1.0
            });
            
            const name = getFeatureName(feature.properties);
            
            if (name) {
                showSpatialSummaryModal(name, State.spatialMode);
            }
        };

        State.regions = L.geoJSON(regionsRes, {
            style: { color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 },
            onEachFeature: (feature, layer) => {
                layer.on('click', onSpatialClick);
            }
        });

        State.counties = L.geoJSON(countiesRes, {
            style: { color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 },
            onEachFeature: (feature, layer) => {
                layer.on('click', onSpatialClick);
            }
        });

        State.constituencies = L.geoJSON(constRes, {
            style: { color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 },
            onEachFeature: (feature, layer) => {
                layer.on('click', onSpatialClick);
            }
        });

        // Store names for mock generation
        State.regionNames = regionsRes.features.map(f => getFeatureName(f.properties) || "UK Region");
        State.countyNames = countiesRes.features.map(f => getFeatureName(f.properties) || "County");
        State.constituencyNames = constRes.features.map(f => getFeatureName(f.properties) || "Constituency");

        // Add layers based on default state
        if (State.spatialMode === 'region') {
            State.regions.addTo(State.map);
        } else if (State.spatialMode === 'county') {
            State.counties.addTo(State.map);
        } else {
            if (document.getElementById('toggle-regions').checked) State.regions.addTo(State.map);
            if (document.getElementById('toggle-counties').checked) State.counties.addTo(State.map);
        }
        
        // Manual layer toggles (from custom overlay html)
        setupMapOverlays();
    } catch (err) {
        console.error("Error loading GeoJSON layers:", err);
    }

    L.control.zoom({ position: 'topright' }).addTo(State.map);

    // Fetch and Load Intelligence Data from Folder
    const dataSources = ['roads', 'railways', 'social', 'news', 'energy', 'water', 'ea-help', 'proxy', 'google-trends'];
    try {
        const fetchResults = await Promise.all(
            dataSources.map(src => fetch(`data/${src}.json`).then(r => r.ok ? r.json() : []))
        );
        
        // Flatten and enrich with spatial data / Date objects
        const rawImpacts = fetchResults.flat();
        State.impacts = rawImpacts.map(impact => {
            const enriched = { 
                ...impact, 
                timestamp: new Date(impact.timestamp) 
            };
            
            // Re-enrich with real spatial data from GeoJSON if it's a direct point-based impact
            if (impact.lat && impact.lng && !impact.isNational) {
                const county = findGeoAttribute([impact.lng, impact.lat], State.rawCounties);
                const region = findGeoAttribute([impact.lng, impact.lat], State.rawRegions);
                const constituency = findGeoAttribute([impact.lng, impact.lat], State.rawConstituencies);
                
                if (county || region || constituency) {
                    enriched.locationName = `${region || 'UK Region'} | ${county || 'Unknown County'} | ${constituency || 'Unknown Constituency'}`;
                }
            }
            return enriched;
        });

        console.log(`Loaded ${State.impacts.length} impacts from ${dataSources.length} sources.`);
    } catch (err) {
        console.error("Error loading impact data:", err);
        State.impacts = [];
    }
    
    renderTimelineTicks();
    setupEvents();
    
    // Set default view period to "Today" (Midnight to Now)
    const nowObj = new Date(FIXED_NOW);
    const todayStart = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate());
    const hoursSinceTodayStart = (nowObj - todayStart) / (1000 * 60 * 60);
    
    // Default to the last 17 hours (to show everything since midnight of that snapshot day)
    const windowDuration = hoursSinceTodayStart; 
    State.windowEnd = 48;
    State.windowStart = Math.max(0, 48 - windowDuration);
    State.lastWindowDuration = 48 - State.windowStart;

    syncDualSlider();
    renderImpacts();
    updateStats();
}

function renderTimelineTicks() {
    const labelsCont = document.getElementById('timeline-tick-labels');
    labelsCont.innerHTML = '';
    const now = new Date(FIXED_NOW);
    
    // Align ticks to integer hours. The timeline spans [now - 48h, now].
    // We want ticks at 00:00, 01:00, ..., 23:00.
    const startOfHourNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    
    for (let h = 0; h <= 50; h++) {
        // Look at hour boundaries around the 48h range
        const tickDate = new Date(startOfHourNow.getTime() - (50 - h) * 60 * 60 * 1000);
        const hoursAgo = (now - tickDate) / (1000 * 60 * 60);
        const i = 48 - hoursAgo;
        
        if (i < -0.1 || i > 48.1) continue;

        const hrs = tickDate.getHours();
        let type = 'minor';
        if (hrs === 0) type = 'major';
        else if (hrs % 6 === 0) type = 'moderate';

        const tick = document.createElement('div');
        tick.className = `tick ${type}`;
        tick.style.left = (i / 48 * 100) + '%';
        
        const line = document.createElement('div');
        line.className = `tick-line ${type}`;
        tick.appendChild(line);
        
        if (type === 'major' || type === 'moderate') {
            const label = document.createElement('div');
            label.className = `tick-label ${type}`;
            if (hrs === 0) {
                label.innerText = tickDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
            } else {
                label.innerText = hrs + ':00';
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
        
        document.getElementById('view-period-select').value = 'custom';
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
    const constCheck = document.getElementById('const-checkbox');


    regionCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'region';
            countyCheck.checked = false;
            constCheck.checked = false;
            State.counties.removeFrom(State.map);
            State.constituencies.removeFrom(State.map);
            State.regions.addTo(State.map);
        } else {
            State.regions.removeFrom(State.map);
            if (State.spatialMode === 'region') State.spatialMode = null;
        }
        renderImpacts();
    });

    countyCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'county';
            regionCheck.checked = false;
            constCheck.checked = false;
            State.regions.removeFrom(State.map);
            State.constituencies.removeFrom(State.map);
            State.counties.addTo(State.map);
        } else {
            State.counties.removeFrom(State.map);
            if (State.spatialMode === 'county') State.spatialMode = null;
        }
        renderImpacts();
    });

    constCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'constituency';
            regionCheck.checked = false;
            countyCheck.checked = false;
            State.regions.removeFrom(State.map);
            State.counties.removeFrom(State.map);
            State.constituencies.addTo(State.map);
        } else {
            State.constituencies.removeFrom(State.map);
            if (State.spatialMode === 'constituency') State.spatialMode = null;
        }
        renderImpacts();
    });

    // View Period Dropdown
    document.getElementById('view-period-select').addEventListener('change', (e) => {
        const val = e.target.value;
        const now = new Date(FIXED_NOW);
        
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

    // "Only" Filter Logic for Sidebar (and Sub-items)
    document.querySelectorAll('.only-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const filterChip = btn.closest('.filter-chip');
            const subItem = btn.closest('.sub-filter-item');
            
            if (filterChip) {
                const targetCat = filterChip.dataset.category;
                State.activeCategories.clear();
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                State.activeCategories.add(targetCat);
                filterChip.classList.add('active');
            } else if (subItem) {
                // For sub-items, we active the parent category and potentially a sub-filter
                // For now, activating the parent is the primary action since we don't have deep sub-filtering in the state yet
                const parentGroup = subItem.closest('.nested-filter-group');
                const parentChip = parentGroup.querySelector('.filter-chip');
                const targetCat = parentChip.dataset.category;
                
                State.activeCategories.clear();
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                State.activeCategories.add(targetCat);
                parentChip.classList.add('active');
                
                // Show the menu if it was hidden
                const subMenu = parentGroup.querySelector('.sub-filter-list');
                if (subMenu) subMenu.classList.remove('hidden');
                const icon = parentChip.querySelector('.collapse-icon');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }

            renderImpacts();
            updateStats();
            syncSourceChecks();
        });
    });

    // Show All Sources
    const showAllBtn = document.getElementById('show-all-sources');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            Object.keys(CATEGORIES).forEach(cat => State.activeCategories.add(cat));
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.add('active'));
            renderImpacts();
            updateStats();
            syncSourceChecks();
        });
    }

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
    
    // Sidebar View Toggle (Sources vs Types)
    const subBtns = document.querySelectorAll('.view-sub-btn');
    subBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            State.sidebarView = view;
            subBtns.forEach(b => b.classList.toggle('active', b === btn));
            
            document.getElementById('sidebar-sources-view').classList.toggle('hidden', view !== 'sources');
            document.getElementById('sidebar-types-view').classList.toggle('hidden', view !== 'types');
            
            if (view === 'types') {
                renderTypeFilters();
            }
        });
    });

    // Water Sub-menu Toggle
    const waterToggle = document.getElementById('water-parent-toggle');
    const waterSubMenu = document.getElementById('water-sub-menu');
    if (waterToggle && waterSubMenu) {
        const icon = waterToggle.querySelector('.collapse-icon');
        if (icon) icon.style.transform = 'rotate(-90deg)';
        
        waterToggle.addEventListener('click', (e) => {
            waterSubMenu.classList.toggle('hidden');
            if (icon) {
                icon.style.transform = waterSubMenu.classList.contains('hidden') ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        });
    }

    // Power Sub-menu Toggle
    const energyToggle = document.getElementById('energy-parent-toggle');
    const energySubMenu = document.getElementById('energy-sub-menu');
    if (energyToggle && energySubMenu) {
        const icon = energyToggle.querySelector('.collapse-icon');
        if (icon) icon.style.transform = 'rotate(-90deg)';
        
        energyToggle.addEventListener('click', (e) => {
            energySubMenu.classList.toggle('hidden');
            if (icon) {
                icon.style.transform = energySubMenu.classList.contains('hidden') ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        });
    }

    // Feed Sort Downloader
    const feedSortSelect = document.getElementById('feed-sort-select');
    if (feedSortSelect) {
        feedSortSelect.addEventListener('change', (e) => {
            State.feedSort = e.target.value;
            renderImpacts();
        });
    }

    // Date Picker Logic
    const datePicker = document.getElementById('timeline-date-picker');
    const fixedStr = FIXED_NOW.toISOString().split('T')[0];
    datePicker.value = fixedStr;
    datePicker.max = fixedStr;

    datePicker.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const now = new Date(FIXED_NOW);
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

        document.getElementById('view-period-select').value = 'custom';
        syncDualSlider();
        renderImpacts();
        updateStats();
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

    // Restored Agentic Search Logic
    const agenticActionBtn = document.getElementById('agentic-action-btn');
    const diveConfigModal = document.getElementById('deep-dive-config-modal');
    const startDiveBtn = document.getElementById('start-dive-confirm-btn');
    const closeDiveConfigBtn = document.getElementById('close-dive-config-btn');
    const cancelDiveModalBtn = document.getElementById('cancel-dive-modal-btn');
    const minimizeDiveBtn = document.getElementById('minimize-dive-btn');

    if (agenticActionBtn) {
        agenticActionBtn.addEventListener('click', () => {
            diveConfigModal.classList.add('active');
            // Reset to forecast mode on open
            State.searchMode = 'forecast';
            const forecastOpt = document.querySelector('.toggle-option[data-mode="forecast"]');
            if (forecastOpt) forecastOpt.click();
        });
    }

    // Agentic Search Toggle handler
    document.querySelectorAll('.toggle-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const mode = opt.dataset.mode;
            State.searchMode = mode;
            
            if (mode === 'user') {
                document.getElementById('location-input-group').classList.add('hidden');
                document.getElementById('map-polygon-group').classList.remove('hidden');
                setTimeout(initSearchMap, 100);
            } else {
                document.getElementById('location-input-group').classList.remove('hidden');
                document.getElementById('map-polygon-group').classList.add('hidden');
            }
        });
    });

    const clearPolygonBtn = document.getElementById('clear-polygon-btn');
    if (clearPolygonBtn) {
        clearPolygonBtn.addEventListener('click', clearSearchPolygon);
    }

    if (closeDiveConfigBtn) closeDiveConfigBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));
    if (cancelDiveModalBtn) cancelDiveModalBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));
    
    const cancelBtn = document.querySelector('.btn-ghost');
    if (cancelBtn) cancelBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));

    if (startDiveBtn) {
        startDiveBtn.addEventListener('click', () => {
            let location = "";
            let polygonPoints = null;

            if (State.searchMode === 'user') {
                if (State.searchPoints.length < 3) {
                    alert("Please draw an area on the map with at least 3 points.");
                    return;
                }
                location = "User Defined Polygon";
                polygonPoints = [...State.searchPoints];
            } else {
                const locationInput = document.getElementById('dive-location-input');
                location = locationInput.value.trim();
                if (!location) { 
                    locationInput.closest('.input-with-icon').style.borderColor = '#ef4444';
                    return; 
                }
            }
            
            const selectedModules = Array.from(document.querySelectorAll('.agentic-source-card input:checked')).map(i => i.value);
            deployAgenticSearch(location, selectedModules, polygonPoints);
            diveConfigModal.classList.remove('active');
            const locationInput = document.getElementById('dive-location-input');
            if (locationInput) locationInput.value = '';
            clearSearchPolygon();
        });
    }

    // Close modal on escape or overlay click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            diveConfigModal.classList.remove('active');
        }
    });

    diveConfigModal.addEventListener('click', (e) => {
        if (e.target === diveConfigModal) diveConfigModal.classList.remove('active');
    });

    if (minimizeDiveBtn) {
        minimizeDiveBtn.addEventListener('click', () => {
            document.getElementById('deep-dive-status').classList.add('hidden');
        });
    }
    const cancelDiveBtn = document.getElementById('cancel-dive-btn');
    if (cancelDiveBtn) cancelDiveBtn.addEventListener('click', () => {
        if (State.activeDiveId) stopDeepDive(State.activeDiveId);
    });
    
    // Modal tabs

    // Modal tabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const group = tab.dataset.tab;
            document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${group}`).classList.add('active');
        });
    });
}

function renderTypeFilters() {
    const list = document.getElementById('type-filter-list');
    if (!list) return;
    list.innerHTML = '';
    
    Object.entries(IMPACT_TYPES).forEach(([key, type]) => {
        const isActive = type.categories.every(cat => State.activeCategories.has(cat));
        
        const row = document.createElement('label');
        row.className = `filter-item-row filter-chip ${isActive ? 'active' : ''}`;
        row.dataset.type = key;
        
        row.innerHTML = `
            <div class="custom-checkbox ${isActive ? 'checked' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="item-label">${type.label}</span>
            <span class="only-trigger">Only</span>
        `;
        
        row.addEventListener('click', (e) => {
            e.preventDefault();
            const categories = type.categories;
            const currentlyActive = categories.every(cat => State.activeCategories.has(cat));
            
            categories.forEach(cat => {
                if (currentlyActive) {
                    State.activeCategories.delete(cat);
                } else {
                    State.activeCategories.add(cat);
                }
            });
            
            renderTypeFilters();
            renderImpacts();
            updateStats();
            syncSourceChecks();
        });

        row.querySelector('.only-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            State.activeCategories.clear();
            type.categories.forEach(cat => State.activeCategories.add(cat));
            renderTypeFilters();
            renderImpacts();
            updateStats();
            syncSourceChecks();
        });

        list.appendChild(row);
    });

    // Add Show All listener if not already added (though it's static in HTML)
    const showAllTypes = document.getElementById('show-all-types');
    if (showAllTypes && !showAllTypes.dataset.listener) {
        showAllTypes.dataset.listener = "true";
        showAllTypes.addEventListener('click', () => {
            Object.values(IMPACT_TYPES).forEach(type => {
                type.categories.forEach(cat => State.activeCategories.add(cat));
            });
            renderTypeFilters();
            renderImpacts();
            updateStats();
            syncSourceChecks();
        });
    }
}

function syncSourceChecks() {
    document.querySelectorAll('#sidebar-sources-view .filter-chip').forEach(chip => {
        const cat = chip.dataset.category;
        chip.classList.toggle('active', State.activeCategories.has(cat));
        const input = chip.querySelector('input');
        if (input) input.checked = State.activeCategories.has(cat);
    });
}

// Initial call
document.addEventListener('DOMContentLoaded', () => {
    // ... any other dom ready stuff
});

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
    const now = new Date(FIXED_NOW);
    let foundPreset = false;

    // Presets based on 48h range
    if (Math.abs(State.windowEnd - 48) < 0.1) {
        if (Math.abs(duration - 6) < 0.1) { viewSelect.value = '6'; foundPreset = true; }
        else if (Math.abs(duration - 12) < 0.1) { viewSelect.value = '12'; foundPreset = true; }
        else if (Math.abs(duration - 24) < 0.1) { viewSelect.value = '24'; foundPreset = true; }
        else {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const hoursSinceTodayStart = (now - todayStart) / (1000 * 60 * 60);
            if (Math.abs(duration - hoursSinceTodayStart) < 0.1) {
                viewSelect.value = 'today';
                foundPreset = true;
            }
        }
    } else {
        // Check for "Yesterday" (Start of Yesterday to End of Yesterday)
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const hoursAgoStart = (now - yesterdayStart) / (1000 * 60 * 60);
        const hoursAgoEnd = (now - yesterdayEnd) / (1000 * 60 * 60);
        
        const targetStart = 48 - hoursAgoStart;
        const targetEnd = 48 - hoursAgoEnd;
        
        if (Math.abs(State.windowStart - targetStart) < 0.1 && 
            Math.abs(State.windowEnd - targetEnd) < 0.1) {
            viewSelect.value = 'yesterday';
            foundPreset = true;
        }
    }
    
    if (!foundPreset) {
        viewSelect.value = 'custom';
    }

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
    State.polygons.forEach(p => State.map.removeLayer(p));
    State.polygons = [];

    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);

    const filtered = State.impacts.filter(imp => {
        return imp.timestamp >= startCutoff && 
               imp.timestamp <= endCutoff && 
               State.activeCategories.has(imp.category) &&
               State.activeSeverities.has(imp.severity);
    });

    // Update Feed immediately
    renderFeed(filtered);

    // Filter for markers (don't show national impacts as single markers)
    const filteredForMarkers = filtered.filter(imp => !imp.isNational);

    filteredForMarkers.forEach(imp => {
        const locations = imp.locations || [{ lat: imp.lat, lng: imp.lng }];
        locations.forEach(loc => {
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-inner ${imp.category} ${imp.severity}">${CATEGORIES[imp.category].icon}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon });
            marker.impactId = imp.id;
            marker.on('click', () => showImpactDetails(imp)).addTo(State.map);
            State.markers.push(marker);
        });

        // Render outage polygons for Energy
        if (imp.outagePolygon) {
            const poly = L.polygon(imp.outagePolygon, {
                color: CATEGORIES[imp.category].color,
                fillColor: CATEGORIES[imp.category].color,
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '5, 5'
            }).on('click', () => showImpactDetails(imp)).addTo(State.map);
            poly.impactId = imp.id;
            State.polygons.push(poly);
        }
    });

    // --- Spatial Summary Overlays ---
    // Update EACH layer if it is currently added to the map.
    
    if (State.regions && State.map.hasLayer(State.regions)) {
        // ALWAYS update regions. In constituency mode, updateSpatialSummary handles background styling.
        const ramp = (State.spatialMode === 'region' || State.spatialMode === 'constituency') ? 'severity' : 'trends';
        updateSpatialSummary(filtered, State.regions, State.rawRegions, ramp);
    }

    if (State.counties && State.map.hasLayer(State.counties)) {
        updateSpatialSummary(filtered, State.counties, State.rawCounties, 'severity');
    }
    
    if (State.constituencies && State.map.hasLayer(State.constituencies)) {
        updateSpatialSummary(filtered, State.constituencies, State.rawConstituencies, 'severity');
    }

    // Toggle Severity Legend Visibility
    const legend = document.getElementById('map-severity-legend');
    if (legend) {
        if (State.spatialMode) legend.classList.remove('hidden');
        else legend.classList.add('hidden');
    }

    if (State.viewMode === 'summary') {
        renderSummaryView();
    }
}

function updateSpatialSummary(filtered, leafletLayer, rawJson, ramp) {
    if (!rawJson || !leafletLayer) return;

    const ramps = {
        severity: { 
            minor: '#dbeafe', 
            significant: '#2563eb', 
            severe: '#0f172a' 
        },
        trends: { 
            minor: '#fecaca', 
            significant: '#f87171', 
            severe: '#dc2626' 
        }
    };
    const colors = ramps[ramp] || ramps.severity;
    const weightMap = { severe: 3, significant: 2, minor: 1 };

    // 1. Pre-index impacts for faster lookup
    const index = new Map();

    for (const imp of filtered) {
        const areas = new Set();
        
        // Extract from locationName "Region | County | Constituency"
        const locParts = (imp.locationName || "").split('|').map(s => s.trim());
        if (leafletLayer === State.regions) {
            if (locParts[0]) areas.add(locParts[0]);
            if (imp.regionName) areas.add(imp.regionName);
        } else if (leafletLayer === State.counties) {
            if (locParts[1]) areas.add(locParts[1]);
            if (imp.intersectingCounties) imp.intersectingCounties.forEach(c => areas.add(c));
        } else if (leafletLayer === State.constituencies) {
            if (locParts[2]) areas.add(locParts[2]);
            if (imp.intersectingConstituencies) imp.intersectingConstituencies.forEach(c => areas.add(c));
        }

        const weight = weightMap[imp.severity] || 0;
        for (const area of areas) {
            const current = index.get(area) || { weight: 0, label: null };
            if (weight > current.weight) {
                index.set(area, { weight, label: imp.severity });
            }
        }
    }

    // 2. Apply to layer
    try {
        leafletLayer.eachLayer(layer => {
            const feature = layer.feature;
            const featureName = getFeatureName(feature.properties);
            let match = index.get(featureName);

            // 3. Optimized Spatial Fallback (only if no metadata match)
            if (!match) {
                const geom = feature.geometry;
                const featureBounds = (layer.getBounds && typeof layer.getBounds === 'function') ? layer.getBounds() : null;
                
                for (const imp of filtered) {
                    let isInside = false;
                    
                    // Check all locations (for widespread impacts / multiple markers)
                    const locsToCheck = imp.locations ? imp.locations : [{lat: imp.lat, lng: imp.lng}];
                    
                    for (const loc of locsToCheck) {
                        if (featureBounds && featureBounds.contains(L.latLng(loc.lat, loc.lng))) {
                            const pt = [loc.lng, loc.lat];
                            if (geom.type === 'Polygon') {
                                if (isPointInPolygon(pt, geom.coordinates[0])) { isInside = true; break; }
                            } else if (geom.type === 'MultiPolygon') {
                                for (const poly of geom.coordinates) {
                                    if (isPointInPolygon(pt, poly[0])) { isInside = true; break; }
                                }
                                if (isInside) break;
                            }
                        }
                    }

                    // Fallback for energy polygons (check if any vertex is inside)
                    if (!isInside && imp.outagePolygon && featureBounds) {
                         for (const v of imp.outagePolygon) {
                            if (featureBounds.contains(L.latLng(v[0], v[1]))) { 
                                const pt = [v[1], v[0]];
                                if (geom.type === 'Polygon') {
                                    if (isPointInPolygon(pt, geom.coordinates[0])) { isInside = true; break; }
                                } else if (geom.type === 'MultiPolygon') {
                                    for (const poly of geom.coordinates) {
                                        if (isPointInPolygon(pt, poly[0])) { isInside = true; break; }
                                    }
                                    if (isInside) break;
                                }
                            }
                         }
                    }

                    if (isInside) {
                        const weight = weightMap[imp.severity] || 0;
                        if (!match || weight > match.weight) {
                            match = { weight, label: imp.severity };
                        }
                    }
                }
            }

            if (match) {
                const isBackgroundRegion = (leafletLayer === State.regions && State.spatialMode === 'constituency');
                layer.setStyle({
                    fillColor: colors[match.label],
                    fillOpacity: isBackgroundRegion ? 0.15 : 0.5,
                    color: colors[match.label],
                    weight: isBackgroundRegion ? 1 : 1.5
                });
            } else {
                layer.setStyle({
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    color: '#334155',
                    weight: 1.5
                });
            }
        });
    } catch (err) {
        console.error("Spatial Summary Error:", err);
    }
}

function setupMapOverlays() {
    // Spatial Mode Toggles synchronization is no longer needed as layers button is removed
}

function renderFeed(filtered) {
    const feedCont = document.getElementById('feed-container');
    const feedCount = document.getElementById('feed-count');
    
    if (!feedCont || !feedCount) return;

    // We sort a copy to preserve original order for map markers
    const sorted = [...filtered].sort((a, b) => {
        if (State.feedSort === 'severity') {
            const w = { severe: 4, significant: 3, minor: 2 };
            const diff = (w[b.severity] || 0) - (w[a.severity] || 0);
            if (diff !== 0) return diff;
        } else if (State.feedSort === 'type') {
            const labelA = CATEGORIES[a.category]?.label || "";
            const labelB = CATEGORIES[b.category]?.label || "";
            if (labelA < labelB) return -1;
            if (labelA > labelB) return 1;
        }
        return b.timestamp - a.timestamp;
    });

    feedCount.innerText = sorted.length;
    feedCont.innerHTML = '';

    if (sorted.length === 0) {
        feedCont.innerHTML = '<div class="feed-empty">No impacts in the selected range.</div>';
        return;
    }

    sorted.forEach(imp => {
        const card = document.createElement('div');
        card.id = `card-${imp.id}`;
        let cardClasses = 'feed-card';
        if (State.selectedImpact?.id === imp.id) cardClasses += ' active';
        if (!imp.photo) cardClasses += ' no-photo';
        card.className = cardClasses;
        
        const timeStr = imp.timestamp.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
            ${imp.photo ? `<div class="feed-card-photo" style="background-image: url('${imp.photo}')"></div>` : ''}
            <div class="feed-card-body">
                <div class="feed-card-header-inner">
                    <div class="feed-card-meta-new">
                        <span class="feed-card-tag" style="background: ${CATEGORIES[imp.category].color}20; color: ${CATEGORIES[imp.category].color}">
                            ${CATEGORIES[imp.category].label}
                        </span>
                        <span class="feed-card-time">${timeStr}</span>
                    </div>
                </div>
                
                <h4 class="feed-card-title">${imp.title}</h4>
                
                <div class="feed-card-source-row">
                    <a href="${imp.sourceUrl}" class="source-link-new" target="_blank" onclick="event.stopPropagation()">
                        ${imp.source}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                </div>

                <div class="feed-card-content-wrap">
                    <p class="feed-card-evidence">${imp.evidence}</p>
                </div>

                <div class="feed-card-stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Severity</span>
                        <div class="stat-value">
                            <span class="sev-rect-small" style="background: ${SEVERITIES[imp.severity].color}"></span>
                            <span class="sev-text-bold" style="color: ${SEVERITIES[imp.severity].color}">${SEVERITIES[imp.severity].label}</span>
                        </div>
                    </div>
                    ${imp.assessment ? `
                    <div class="stat-item">
                        <span class="stat-label">Confidence</span>
                        <div class="stat-value">
                            <span class="conf-box">${imp.assessment.confidenceLabel}</span>
                            <button class="assessment-info-btn-new" data-impact-id="${imp.id}" onclick="event.stopPropagation(); showAssessmentModal('${imp.id}')" title="View assessment justification">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </button>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="stat-item" style="grid-column: span 2; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 5px;">
                        <span class="stat-label">Region</span>
                        <div class="stat-value">
                            <span class="loc-chip">${imp.locationName.split('|')[0]?.trim() || 'N/A'}</span>
                        </div>
                    </div>

                    <div class="stat-item" style="grid-column: span 2">
                        <span class="stat-label">Counties</span>
                        <div class="stat-value">
                            <div class="chips-wrap">
                                ${imp.intersectingCounties && imp.intersectingCounties.length > 0 
                                  ? imp.intersectingCounties.map(c => `<span class="loc-chip">${c}</span>`).join('')
                                  : `<span class="loc-chip">${imp.locationName.split('|')[1]?.trim() || 'N/A'}</span>`}
                            </div>
                        </div>
                    </div>

                    <div class="stat-item" style="grid-column: span 2">
                        <span class="stat-label">Constituencies</span>
                        <div class="stat-value">
                            <div class="chips-wrap">
                                ${imp.intersectingConstituencies && imp.intersectingConstituencies.length > 0 
                                  ? imp.intersectingConstituencies.map(c => `<span class="loc-chip constituency">${c}</span>`).join('')
                                  : `<span class="loc-chip constituency">${imp.locationName.split('|')[2]?.trim() || 'N/A'}</span>`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            selectImpact(imp);
        });

        feedCont.appendChild(card);
    });
}

// The renderRegionalSummary and renderCountySummary functions are no longer used to render to the feed.
// Their logic for aggregation is now part of showSpatialSummaryModal.
// They are kept as empty functions or removed if no other calls exist.
function renderRegionalSummary(filtered) {
    // This function is no longer used to render to the feed.
    // Spatial summary is now handled by showSpatialSummaryModal on map click.
}

function renderCountySummary(filtered) {
    // This function is no longer used to render to the feed.
    // Spatial summary is now handled by showSpatialSummaryModal on map click.
}

function showSpatialSummaryModal(areaName, mode) {
    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);
    
    const filtered = State.impacts.filter(imp => {
        return imp.timestamp >= startCutoff && 
               imp.timestamp <= endCutoff && 
               State.activeCategories.has(imp.category) &&
               State.activeSeverities.has(imp.severity);
    });

    const results = { count: 0, sources: new Set(), severity: 'minor', impacts: [] };
    const weights = { minor: 2, significant: 3, severe: 4 };

    filtered.forEach(imp => {
        let isMatch = false;
        if (mode === 'region') {
            isMatch = imp.locationName.split('|')[0].trim() === areaName;
        } else if (mode === 'county') {
            if (imp.intersectingCounties && imp.intersectingCounties.includes(areaName)) {
                isMatch = true;
            } else {
                const parts = imp.locationName.split('|');
                const cName = (parts[1] || parts[0]).trim();
                isMatch = cName === areaName;
            }
        } else if (mode === 'constituency') {
            if (imp.intersectingConstituencies && imp.intersectingConstituencies.includes(areaName)) {
                isMatch = true;
            } else {
                const parts = imp.locationName.split('|');
                // Mock data puts constituency at parts[2]
                const cName = (parts[2] || parts[1] || parts[0]).trim();
                isMatch = cName === areaName;
            }
        }

        if (isMatch) {
            results.count++;
            results.sources.add(imp.source);
            results.impacts.push(imp);
            if (weights[imp.severity] > (weights[results.severity] || 0)) {
                results.severity = imp.severity;
            }
        }
    });

    const modal = document.getElementById('spatial-summary-modal');
    const body = document.getElementById('spatial-modal-body');
    const title = document.getElementById('spatial-modal-title');
    
    title.innerText = areaName;

    const sevDescs = {
        minor: "localised disruption to infrastructure",
        significant: "notable pressure on regional networks",
        severe: "critical and widespread service failure"
    };

    const summaryId = `modal-summary-${areaName.replace(/\s+/g, '-')}`;
    const assessment = generateSummaryAssessment(areaName, results.severity, results.count);
    
    if (!State.spatialAssessments) State.spatialAssessments = {};
    State.spatialAssessments[summaryId] = { 
        severity: results.severity, 
        assessment: {
            ...assessment,
            areaName: areaName,
            impactCount: results.count,
            sources: Array.from(results.sources)
        }
    };

    body.innerHTML = `
        <div class="spatial-modal-layout">
            <div class="spatial-modal-sidebar">
                <div class="summary-stats-box">
                    <div class="stat-main">
                        <span class="stat-value">${results.count}</span>
                        <span class="stat-label">Active Impacts</span>
                    </div>
                </div>
                <div class="area-sev-badge" style="background: ${SEVERITIES[results.severity].color}12; border: 1px solid ${SEVERITIES[results.severity].color}30;">
                    <span class="sev-rect-small" style="background: ${SEVERITIES[results.severity].color}"></span>
                    <span style="color: ${SEVERITIES[results.severity].color}; font-weight:700;">${SEVERITIES[results.severity].label}</span>
                </div>
                <button class="spatial-assess-btn" onclick="showAssessmentModal('${summaryId}')" title="View detailed impact assessment justification">
                    <div class="assess-btn-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <span class="assess-btn-text">View<br>Justification</span>
                </button>
            </div>
            
            <div class="spatial-modal-main">
                <div class="summary-prose-wrap">
                    <h5>Overview</h5>
                    <p>Aggregated observations in <strong>${areaName}</strong> align with a <strong>${SEVERITIES[results.severity].label}</strong> operational classification. ${sevDescs[results.severity]}. Our spatial engine has cross-correlated ${results.count} independent ${results.count === 1 ? 'impact' : 'impacts'} from ${results.sources.size} distinct ${results.sources.size === 1 ? 'source category' : 'source categories'}.</p>
                </div>

                <div class="summary-sources-grid">
                    <h5>Contributing Intelligence</h5>
                    <div class="src-pills-wrap">
                        ${Array.from(results.sources).map(s => `<span class="src-pill">${s}</span>`).join('')}
                    </div>
                </div>

                <div class="modal-impact-list-wrap">
                    <h5>Supporting Evidence</h5>
                    <div class="modal-impact-list">
                        ${results.impacts.map(imp => `
                            <div class="modal-mini-card" onclick="openImpactFromSummary('${imp.id}')">
                                <div class="mini-card-left">
                                    <div class="mini-icon" style="color:${CATEGORIES[imp.category].color}">${CATEGORIES[imp.category].icon}</div>
                                    <div class="mini-info">
                                        <div class="mini-title">${imp.title}</div>
                                        <div class="mini-meta">${imp.source} • ${imp.severity}</div>
                                    </div>
                                </div>
                                <div class="mini-card-right">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Helper to bridge from summary modal to specific card
window.openImpactFromSummary = function(impactId) {
    document.getElementById('spatial-summary-modal').classList.remove('active');
    const imp = State.impacts.find(i => i.id === impactId);
    if (imp) selectImpact(imp);
};

function selectImpact(imp, isRerender = true) {
    State.selectedImpact = imp;

    // Skip map pan for national impacts
    if (!imp.isNational) {
        State.map.panTo([imp.lat, imp.lng]);
    }
    
    // Highlight marker(s)
    State.markers.forEach(m => {
        const icon = m.getElement();
        if (icon) {
            if (m.impactId === imp.id) {
                icon.classList.add('marker-highlight');
            } else {
                icon.classList.remove('marker-highlight');
            }
        }
    });

    // Highlight polygon(s)
    State.polygons.forEach(p => {
        if (p.impactId === imp.id) {
            p.setStyle({ fillOpacity: 0.55, weight: 4 });
        } else {
            p.setStyle({ fillOpacity: 0.25, weight: 2 });
        }
    });

    if (isRerender) {
        // Refresh feed to show active card
        const now = new Date(FIXED_NOW);
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
    // Analytics update if needed, but UI element 'total-count' is removed as requested
}

// Global filter helper for feed items
window.filterOnly = function(category) {
    State.activeCategories.clear();
    State.activeCategories.add(category);
    
    // Sync sidebar UI
    document.querySelectorAll('.filter-chip').forEach(chip => {
        if (chip.dataset.category === category) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    
    renderImpacts();
}

// --- Assessment Modal ---
// Helper to open config modal at specific tab
window.openConfigTab = function(tabId) {
    const configModal = document.getElementById('config-modal');
    if (configModal) {
        configModal.classList.add('active');
        document.querySelectorAll('.modal-tab').forEach(t => {
            if (t.dataset.tab === tabId) {
                t.click();
            }
        });
    }
    // Close assessment modal if open
    document.getElementById('assessment-modal').classList.remove('active');
};

function showAssessmentModal(impactId) {
    let imp = State.impacts.find(i => i.id === impactId);
    let a;
    let titleHtml = '';

    if (imp) {
        a = imp.assessment;
        titleHtml = `
            <div class="assessed-record-box">
                <div class="record-meta">
                    <span class="record-category" style="color:${CATEGORIES[imp.category].color}">${CATEGORIES[imp.category].label}</span>
                    <span class="record-dot">•</span>
                    <span class="record-source">${imp.source}</span>
                </div>
                <h4 class="record-title">${imp.title}</h4>
            </div>
        `;
    } else if (State.spatialAssessments && State.spatialAssessments[impactId]) {
        const spatial = State.spatialAssessments[impactId];
        a = spatial.assessment;
        imp = { severity: spatial.severity, category: 'proxy' }; // dummy for styling
        titleHtml = `
            <div class="assessed-record-box spatial">
                <div class="record-meta">
                    <span class="record-category" style="color:var(--clr-primary)">Spatial Analysis</span>
                    <span class="record-dot">•</span>
                    <span class="record-source">${a.impactCount} Impacts Combined</span>
                </div>
                <h4 class="record-title">${a.areaName}</h4>
            </div>
        `;
    }

    if (!a) return;

    const modal = document.getElementById('assessment-modal');
    const body = document.getElementById('assessment-modal-body');

    body.innerHTML = `
        ${titleHtml}
        
        <div class="assessment-header-stats">
            <div class="header-stat-group">
                <span class="stat-mini-label">Severity Level</span>
                <div class="stat-mini-value">
                    <span class="sev-dot-small" style="background:${SEVERITIES[imp.severity].color}"></span>
                    <span style="color:${SEVERITIES[imp.severity].color}; font-weight:700;">${SEVERITIES[imp.severity].label}</span>
                </div>
            </div>
            <div class="header-stat-group">
                <span class="stat-mini-label">Confidence</span>
                <div class="stat-mini-value">
                    <span class="conf-chip-new" style="background:${a.confidenceColor}20; color:${a.confidenceColor}; border: 1px solid ${a.confidenceColor}40;">
                        ${a.confidenceLabel}
                    </span>
                </div>
            </div>
        </div>

        <div class="justification-section">
            <h5>Severity Assessment</h5>
            <p class="justification-text synthesis">${a.synthesis}</p>
            <p class="framework-statement">
                According to the <a href="#" onclick="openConfigTab('impact-framework'); return false;" class="framework-link">Impact Framework</a>, this aligns with a <strong>${SEVERITIES[imp.severity].label}</strong> level of impact.
            </p>
            
            <div class="timing-assessment">
                <div class="timing-item">
                    <span class="timing-label">Estimated Start</span>
                    <span class="timing-value">${a.startTiming || '08:00'}</span>
                </div>
                <div class="timing-item">
                    <span class="timing-label">Estimated End</span>
                    <span class="timing-value">${a.endTiming || '--:--'}</span>
                </div>
            </div>
        </div>

        <div class="justification-section">
            <h5>Confidence Assessment</h5>
            <div class="confidence-statement-block">
                <p class="justification-text">${a.confidenceStatement}</p>
                <div class="confidence-justification-box">
                    <strong>Assessment Justification:</strong> ${a.justification}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Wire up modals
document.addEventListener('DOMContentLoaded', () => {
    const assessModal = document.getElementById('assessment-modal');
    const closeAssessBtn = document.getElementById('close-assessment-btn');
    const spatialModal = document.getElementById('spatial-summary-modal');
    const closeSpatialBtn = document.getElementById('close-spatial-btn');
    
    if (closeAssessBtn) {
        closeAssessBtn.addEventListener('click', () => assessModal.classList.remove('active'));
    }
    if (assessModal) {
        assessModal.addEventListener('click', (e) => {
            if (e.target === assessModal) assessModal.classList.remove('active');
        });
    }

    if (closeSpatialBtn) {
        closeSpatialBtn.addEventListener('click', () => spatialModal.classList.remove('active'));
    }
    if (spatialModal) {
        spatialModal.addEventListener('click', (e) => {
            if (e.target === spatialModal) spatialModal.classList.remove('active');
        });
    }
});

// --- Polygon Drawing Helpers ---
function initSearchMap() {
    if (State.searchMap) {
        setTimeout(() => State.searchMap.invalidateSize(), 150);
        return;
    }
    
    State.searchMap = L.map('search-area-map', {
        center: [52.8, -1.5],
        zoom: 6,
        zoomControl: false
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(State.searchMap);
    
    L.control.zoom({ position: 'bottomright' }).addTo(State.searchMap);
    
    State.searchMap.on('click', (e) => {
        const latlng = e.latlng;
        State.searchPoints.push([latlng.lat, latlng.lng]);
        
        const marker = L.circleMarker(latlng, {
            radius: 5,
            fillColor: "#4f46e5",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
            interactive: false
        }).addTo(State.searchMap);
        State.searchMarkers.push(marker);
        
        updateSearchPolygonUI();
    });

    State.searchMap.on('mousemove', (e) => {
        if (State.searchPoints.length > 0) {
            if (State.searchGhostLine) State.searchMap.removeLayer(State.searchGhostLine);
            const lastPoint = State.searchPoints[State.searchPoints.length - 1];
            State.searchGhostLine = L.polyline([lastPoint, e.latlng], {
                color: "#4f46e5",
                weight: 1,
                dashArray: "4, 8",
                opacity: 0.5
            }).addTo(State.searchMap);
        }
    });
}

function updateSearchPolygonUI() {
    if (State.searchPolygon) State.searchMap.removeLayer(State.searchPolygon);
    if (State.searchLine) State.searchMap.removeLayer(State.searchLine);
    
    // Draw sequential line as user clicks
    if (State.searchPoints.length > 1) {
        State.searchLine = L.polyline(State.searchPoints, {
            color: "#4f46e5",
            weight: 2,
            dashArray: "3, 6",
            opacity: 0.7
        }).addTo(State.searchMap);
    }
    
    // Closed polygon once we have 3 nodes
    if (State.searchPoints.length >= 3) {
        State.searchPolygon = L.polygon(State.searchPoints, {
            color: "#4f46e5",
            fillColor: "#4f46e5",
            fillOpacity: 0.2,
            weight: 2
        }).addTo(State.searchMap);
    }
}

function clearSearchPolygon() {
    if (State.searchPolygon) State.searchMap.removeLayer(State.searchPolygon);
    if (State.searchLine) State.searchMap.removeLayer(State.searchLine);
    if (State.searchGhostLine) State.searchMap.removeLayer(State.searchGhostLine);
    
    State.searchMarkers.forEach(m => State.searchMap.removeLayer(m));
    State.searchPoints = [];
    State.searchMarkers = [];
    State.searchPolygon = null;
    State.searchLine = null;
    State.searchGhostLine = null;
}

// --- Directed Search Deep Dive Logic V2 ---
State.deepDiveSessions = [];
State.activeDiveId = null;

function deployAgenticSearch(location, modules, polygonPoints = null) {
    const sessionId = 'dive-' + Date.now();
    const session = {
        id: sessionId,
        location: location,
        modules: modules,
        startTime: new Date(FIXED_NOW),
        progress: 0,
        logs: [],
        status: 'Active',
        marker: null,
        interval: null,
        polygon: polygonPoints,
        steps: generateStepsForModules(location, modules)
    };

    // Calculate center for marker displacement
    let center;
    if (polygonPoints && polygonPoints.length > 0) {
        let latSum = 0, lngSum = 0;
        polygonPoints.forEach(p => { latSum += p[0]; lngSum += p[1]; });
        center = { lat: latSum / polygonPoints.length, lng: lngSum / polygonPoints.length };
    } else {
        center = State.map.getCenter();
    }
    
    // Zoom map to the search area
    if (polygonPoints) {
        const bounds = L.latLngBounds(polygonPoints.map(p => L.latLng(p[0], p[1])));
        State.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }

    State.deepDiveSessions.push(session);
    updateActiveDivesUI();
    
    // UI Feedback on button
    const btn = document.getElementById('agentic-action-btn');
    if (btn) {
        btn.classList.add('searching');
        const textEl = btn.querySelector('.btn-text');
        if (textEl) textEl.innerText = "Agentic search in progress...";
    }

    // Start Processing
    startSessionProcessing(sessionId);
}

function generateStepsForModules(location, modules) {
    return [
        { type: 'INFO', msg: `Starting check in ${location}...` },
        { type: 'INFO', msg: 'Checking local sensor data.' },
        { type: 'INFO', msg: 'Getting status of roads and power.' },
        { type: 'INFO', msg: 'Looking for new reports on social media.' },
        { type: 'INFO', msg: 'Matching reports from different sources.' },
        { type: 'INFO', msg: 'Confirmed issues. Saving summary.' },
        { type: 'INFO', msg: 'Search complete. Data updated.' }
    ];
}

function startSessionProcessing(id) {
    const session = State.deepDiveSessions.find(s => s.id === id);
    if (!session) return;

    let stepIndex = 0;
    session.interval = setInterval(() => {
        if (stepIndex >= session.steps.length) {
            clearInterval(session.interval);
            session.status = "Completed";
            session.progress = 100;
            updateActiveDivesUI();

            // Reset UI Feedback on button
            const btn = document.getElementById('agentic-action-btn');
            if (btn) {
                btn.classList.remove('searching');
                const textEl = btn.querySelector('.btn-text');
                if (textEl) textEl.innerText = "Agentic Impact Search";
            }

            if (State.activeDiveId === id) refreshOverlayContent(session);
            return;
        }

        const step = session.steps[stepIndex];
        const now = new Date(FIXED_NOW);
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        session.logs.push({ time: timeStr, ...step });
        session.progress = Math.round(((stepIndex + 1) / session.steps.length) * 100);
        
        // Update high-end status text in overlay if this is the active view
        if (State.activeDiveId === id) {
            const statusEl = document.getElementById('current-dive-status');
            if (statusEl) statusEl.innerText = step.msg;
        }

        stepIndex++;
        updateActiveDivesUI();
        if (State.activeDiveId === id) refreshOverlayContent(session);
    }, 4500); // 4.5s per step
}

function openDiveOverlay(id) {
    State.activeDiveId = id;
    const session = State.deepDiveSessions.find(s => s.id === id);
    if (!session) return;
    
    const overlay = document.getElementById('deep-dive-status');
    const areaNameEl = document.getElementById('dive-area-name');
    const statusEl = document.getElementById('current-dive-status');
    
    if (areaNameEl) areaNameEl.innerText = session.location;
    if (statusEl && session.logs.length > 0) {
        statusEl.innerText = session.logs[session.logs.length - 1].msg;
    } else if (statusEl) {
        statusEl.innerText = "Initializing...";
    }
    
    refreshOverlayContent(session);
    overlay.classList.remove('hidden');
    updateActiveDivesUI();
}

function refreshOverlayContent(session) {
    const log = document.getElementById('dive-log');
    const fill = document.getElementById('dive-progress-fill');
    
    fill.style.width = session.progress + '%';
    log.innerHTML = session.logs.map(l => `
        <div class="log-entry">
            <span class="log-time">${l.time}</span>
            <span class="log-type-${l.type}">${l.msg}</span>
        </div>
    `).join('');
    log.scrollTop = log.scrollHeight;
}

function updateActiveDivesUI() {
    const navCount = document.getElementById('nav-dive-count');
    if (!navCount) return;

    const count = State.deepDiveSessions.length;
    navCount.innerText = count;
    navCount.style.display = count > 0 ? 'flex' : 'none';

    // Cleanup: we removed the sidebar list, but we might want a dropdown later.
    // For now, we just ensure the nav indicator reflects reality.
}

function stopDeepDive(id) {
    const sessionIndex = State.deepDiveSessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) return;
    
    const session = State.deepDiveSessions[sessionIndex];
    if (session.marker) State.map.removeLayer(session.marker);
    if (session.interval) {
        clearInterval(session.interval);
        session.interval = null;
    }
    
    State.deepDiveSessions.splice(sessionIndex, 1);
    document.getElementById('deep-dive-status').classList.add('hidden');
    State.activeDiveId = null;
    updateActiveDivesUI();
}

// --- View Switching Logic ---
function initViewSwitchers() {
    const viewBtns = document.querySelectorAll('.view-toggle-btn');
    const mapCont = document.getElementById('map-container');
    const summaryCont = document.getElementById('summary-view');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.view;
            State.viewMode = mode;
            
            viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === mode));
            if (mode === 'map') {
                mapCont.classList.remove('hidden');
                document.querySelector('.map-overlay-top-right')?.classList.remove('hidden');
                document.getElementById('spatial-severity-section')?.classList.remove('hidden');
                document.querySelector('.active-searches-section')?.classList.remove('hidden'); 
                document.getElementById('side-feed-panel')?.classList.remove('hidden');
                document.querySelector('.severity-legend')?.classList.remove('hidden');
                summaryCont.classList.add('hidden');
                setTimeout(() => State.map.invalidateSize(), 100);
            } else {
                mapCont.classList.add('hidden');
                document.querySelector('.map-overlay-top-right')?.classList.add('hidden');
                document.getElementById('spatial-severity-section')?.classList.add('hidden');
                document.getElementById('side-feed-panel')?.classList.add('hidden');
                document.querySelector('.severity-legend')?.classList.add('hidden');
                summaryCont.classList.remove('hidden');
                renderSummaryView();
            }
        });
    });

    // Summary Recut Controls
    const recutBtns = document.querySelectorAll('.recut-btn');
    recutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            State.summaryGroup = btn.dataset.group;
            recutBtns.forEach(b => b.classList.toggle('active', b.dataset.group === State.summaryGroup));
            renderSummaryView();
        });
    });
}

function renderSummaryView() {
    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);

    const filtered = State.impacts.filter(imp => {
        return imp.timestamp >= startCutoff && 
               imp.timestamp <= endCutoff && 
               State.activeCategories.has(imp.category) &&
               State.activeSeverities.has(imp.severity);
    });

    updateSummaryStats(filtered);
    generateNarrativeSummary(filtered);
    updateSummaryTable(filtered);
}

function updateSummaryStats(impacts) {
    const statsCont = document.getElementById('summary-view-stats');
    const severe = impacts.filter(i => i.severity === 'severe').length;
    const sig = impacts.filter(i => i.severity === 'significant').length;
    const avgConf = impacts.length > 0 ? (impacts.reduce((s,i) => s + i.assessment.confidence, 0) / impacts.length).toFixed(0) : 0;

    statsCont.innerHTML = `
        <div class="summary-stat">
            <span class="label">Total Impacts</span>
            <span class="value">${impacts.length}</span>
        </div>
        <div class="summary-stat ${severe > 0 ? 'critical' : ''}">
            <span class="label">Severe Impacts</span>
            <span class="value">${severe}</span>
        </div>
        <div class="summary-stat">
            <span class="label">Avg Confidence</span>
            <span class="value">${avgConf}%</span>
        </div>
    `;
}

function generateNarrativeSummary(impacts) {
    const textCont = document.getElementById('llm-narrative-text');
    const timeRef = document.getElementById('summary-time-ref');
    
    if (impacts.length === 0) {
        textCont.innerHTML = "No significant impacts detected for the selected period across configured categories.";
        if (timeRef) timeRef.innerText = "Selected Period";
        return;
    }

    // Dynamic Time Reference
    const now = new Date(FIXED_NOW);
    const startDate = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const timeStr = `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`;
    if (timeRef) timeRef.innerText = timeStr;

    // Intelligence Assessment
    const severe = impacts.filter(i => i.severity === 'severe');
    const significant = impacts.filter(i => i.severity === 'significant');
    const categories = [...new Set(impacts.map(i => CATEGORIES[i.category]?.label))];
    
    // Find most impacted region
    const regionCounts = impacts.reduce((acc, curr) => {
        const reg = curr.locationName.split('|')[0].trim();
        acc[reg] = (acc[reg] || 0) + 1;
        return acc;
    }, {});
    const topRegion = Object.entries(regionCounts).sort((a,b) => b[1] - a[1])[0][0];

    let prose = `<p>AI analysis of <strong>${impacts.length} impacts</strong> between ${timeStr} shows a concentration of impacts in <strong>${topRegion}</strong>. `;
    
    if (severe.length > 0) {
        prose += `There are <strong>${severe.length} severe incidents</strong> currently ongoing, with the most notable relating to ${severe[0].category.toLowerCase()} issues. `;
    } else if (significant.length > 0) {
        prose += `The situation involves ${significant.length} significant disruptions, primarily affecting the ${categories.slice(0,2).join(' and ')} sectors. `;
    } else {
        prose += `Current impacts are relatively minor, though persistent reports regarding ${categories[0]} suggest ongoing issues. `;
    }

    const topImpacts = [...impacts].sort((a,b) => {
        const weights = { severe: 4, significant: 3, minor: 2 };
        return weights[b.severity] - weights[a.severity];
    }).slice(0, 2);

    prose += `Key validated indicators include <em>"${topImpacts[0].title}"</em> (reported by <strong>${topImpacts[0].source}</strong>)`;
    if (topImpacts[1]) {
        prose += `, with further impacts noted in <em>${topImpacts[1].locationName.split('|')[1]?.trim() || topImpacts[1].locationName}</em> based on inputs from <strong>${topImpacts[1].source}</strong>. `;
    } else {
        prose += `. `;
    }
    const primarySource = impacts[0].source;
    prose += `Overall confidence is ${severe.length > 0 ? 'High' : 'Moderate'}, anchored by verified impacts from ${primarySource} and supported by multiple reports in the affected areas. </p>`;

    textCont.innerHTML = prose;
}

function updateSummaryTable(impacts) {
    const tbody = document.getElementById('national-summary-tbody');
    
    // Grouping logic
    const groups = {};
    impacts.forEach(imp => {
        const key = State.summaryGroup === 'category' ? imp.category : 
                    State.summaryGroup === 'receptor' ? imp.receptor : 
                    imp.severity;
        if (!groups[key]) groups[key] = [];
        groups[key].push(imp);
    });

    tbody.innerHTML = Object.entries(groups).map(([key, list]) => {
        const primaryImp = list[0];
        const groupLabel = State.summaryGroup === 'category' ? CATEGORIES[key]?.label : 
                           State.summaryGroup === 'severity' ? SEVERITIES[key]?.label : 
                           key;
        
        const confMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const confBackMap = { 3: 'High', 2: 'Medium', 1: 'Low' };
        const confValues = list.map(i => confMap[i.assessment.confidenceLabel] || 2);
        const avgConfVal = Math.round(confValues.reduce((a, b) => a + b, 0) / list.length);
        const finalConfidence = confBackMap[avgConfVal] || 'Medium';

        const maxSev = list.some(i => i.severity === 'severe') ? 'severe' : 
                       list.some(i => i.severity === 'significant') ? 'significant' : 'minor';

        return `
            <tr>
                <td>
                    <span class="cluster-name">${groupLabel}</span>
                    <span class="cluster-count">${list.length} impacts recorded</span>
                </td>
                <td>
                    <span class="summary-assessment-pill" style="background:${SEVERITIES[maxSev].color}">
                        ${SEVERITIES[maxSev].label}
                    </span>
                </td>
                <td>
                    <div class="summary-confidence-row">
                        <span class="conf-pill ${finalConfidence.toLowerCase()}">${finalConfidence}</span>
                    </div>
                </td>
                <td class="evidence-synthesis">
                    Aggregated intelligence report based on <strong>${primaryImp.source}</strong> and ${list.length - 1} auxiliary evidence clusters.
                    <div class="evidence-quote">${(primaryImp.evidence || "No description available").substring(0, 140)}...</div>
                </td>
            </tr>
        `;
    }).join('');
}

// Start App
window.addEventListener('load', () => {
    init();
    initViewSwitchers();
});
