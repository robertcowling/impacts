/**
 * Impact Intelligence Platform - Frontend Logic
 */

// --- Configuration & Constants ---
function getFeatureName(p) {
    if (!p) return null;
    return p.rgn19nm || p.rgn24nm || p.ctyua19nm || p.ctyua24nm || p.lad19nm || p.lad24nm ||
           p.name || p.NAME || p.Region || p.REGION || p.ctry19nm || p.ctry24nm || null;
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
    proxy: { label: 'Proxy', color: '#64748b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/><path d="m17 7-5-5-5 5M17 17l-5 5-5-5"/></svg>' },
    'google-trends': { label: 'Google Trends', color: '#a15b5b', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></circle></svg>' },
    'ea-help': { label: 'EA Help Report', color: '#4e8a6b', icon: '<img src="ea_logo.png" style="width:20px; height:20px; border-radius:3px;">' }
};

const IMPACT_TYPES = {
    roads: { label: 'Roads', categories: ['roads'], color: '#446b82', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 22L7 2M17 2l3 20M12 4v4m0 6v4"/></svg>' },
    rail: { label: 'Rail', categories: ['railways'], color: '#5b61a1', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2L7 22M17 2L17 22M7 5H17M7 10H17M7 15H17M7 20H17"/></svg>' },
    housing: { label: 'Homes and Businesses', categories: ['social', 'news', 'ea-help'], color: '#8a4e6b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    energy: { label: 'Energy', categories: ['energy'], color: '#8a7d4e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
    utilities: { label: 'Utilities', categories: ['water'], color: '#4e6b8a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' }
};

const SEVERITIES = {
    minor: { label: 'Minor', color: '#60a5fa' },
    significant: { label: 'Significant', color: '#1d4ed8' },
    severe: { label: 'Severe', color: '#081451' }
};

/**
 * Generates a detailed assessment for a single impact
 */
function generateAssessment(category, severity, sourceLabel) {
    const isProxy = category === 'proxy' || category === 'google-trends';
    const confidence = isProxy ? 65 + Math.random() * 20 : 85 + Math.random() * 15;
    
    let confidenceLabel = 'High';
    let confidenceColor = '#4ade80';
    if (confidence < 75) {
        confidenceLabel = 'Moderate';
        confidenceColor = '#facc15';
    } else if (confidence < 85) {
        confidenceLabel = 'Medium-High';
        confidenceColor = '#a3e635';
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

    return {
        confidence: Math.round(confidence),
        confidenceLabel,
        confidenceColor,
        justification: justifications[category] || "Automated assessment based on multi-source impact analysis and framework criteria.",
        sourceLabel: sourceName,
        sourceType: isProxy ? "Proxy Intelligence" : "Direct Evidence",
        corroborated: Math.random() > 0.3,
        isProxy
    };
}

/**
 * Generates an aggregate summary assessment for a region or county
 */
function generateSummaryAssessment(name, severity, count) {
    const confidence = 80 + Math.random() * 15;
    let confidenceLabel = 'High';
    let confidenceColor = '#4ade80';
    if (confidence < 85) {
        confidenceLabel = 'Moderate';
        confidenceColor = '#facc15';
    }

    const sevDescs = {
        minor: "localised disruptions and minor infrastructure strain",
        significant: "widespread regional disruption and moderate pressure on assets",
        severe: "major structural failures and critical system-wide data indicators"
    };

    return {
        confidence: Math.round(confidence),
        confidenceLabel,
        confidenceColor,
        justification: `Assessment of ${count} independent ${count === 1 ? 'impact' : 'impacts'} in ${name} aligns with a ${severity} classification. Evidence indicates ${sevDescs[severity]}.`,
        sourceType: "Spatial Analysis",
        corroborated: true,
        isProxy: false
    };
}

// --- Mock Data Engine ---
function generateMockImpacts() {
    const impacts = [];
    const now = new Date();
    
    // Hubs with a stronger bias for SW England
    const hubs = [
        { lat: 51.4545, lng: -2.5879, name: 'Bristol', weight: 4.0, radius: 0.3 },   // Strong SW cluster
        { lat: 50.7184, lng: -3.5339, name: 'Exeter', weight: 2.0, radius: 0.25 },   // SW
        { lat: 51.8642, lng: -2.2442, name: 'Gloucester', weight: 1.5, radius: 0.2 }, // SW
        { lat: 51.5074, lng: -0.1278, name: 'London', weight: 0.8, radius: 0.6 },
        { lat: 52.4862, lng: -1.8904, name: 'Birmingham', weight: 0.8, radius: 0.6 },
        { lat: 53.4808, lng: -2.2426, name: 'Manchester', weight: 0.8, radius: 0.6 },
        { lat: 53.8008, lng: -1.5491, name: 'Leeds', weight: 0.5, radius: 0.6 },
        { lat: 52.2053, lng: 0.1218, name: 'Cambridge', weight: 0.5, radius: 0.6 },
        { lat: 51.7520, lng: -1.2577, name: 'Oxford', weight: 0.5, radius: 0.6 }
    ];

    // Build a weighted selection array
    const weightedHubs = [];
    hubs.forEach(h => {
        const count = Math.ceil(h.weight * 10);
        for(let j=0; j<count; j++) weightedHubs.push(h);
    });

    const weightedTypes = [
        'roads', 'roads', 
        'railways', 
        'social', 'social', 'social', 'social', 'social',
        'news', 'news',
        'energy', 
        'water',
        'ea-help', 'ea-help'
    ];
    const sevs = ['minor', 'significant', 'severe'];
    const receptorMap = {
        roads: 'Transport Infrastructure',
        railways: 'Transport Infrastructure',
        social: 'Public Safety & Welfare',
        news: 'General Operations',
        energy: 'Utility Networks',
        water: 'Utility Networks',
        proxy: 'Inferred Risk',
        'google-trends': 'Digital Footprint',
        'ea-help': 'Emergency Response'
    };

    for (let i = 0; i < 100; i++) {
        const hub = weightedHubs[Math.floor(Math.random() * weightedHubs.length)];
        const category = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
        const severity = sevs[Math.floor(Math.random() * sevs.length)];
        
        let lat, lng, countyMatch, regionLabel;
        let attempts = 0;
        // Keep looking for a point on land (within a county boundary)
        do {
            lat = hub.lat + (Math.random() - 0.5) * hub.radius;
            lng = hub.lng + (Math.random() - 0.5) * hub.radius;
            countyMatch = findGeoAttribute([lng, lat], State.rawCounties);
            regionLabel = findGeoAttribute([lng, lat], State.rawRegions);
            attempts++;
        } while (!countyMatch && attempts < 15);

        if (!countyMatch) continue; // Skip if no land found near this hub

        const receptor = receptorMap[category] || 'General';
        const timestamp = new Date(now.getTime() - (Math.random() * 48) * 60 * 60 * 1000);

        const assessment = generateAssessment(category, severity, 
            category === 'social' ? 'Twitter' : 
            (category === 'news' ? 'Online News' : 
            (category === 'roads' ? 'National Highways' : 
            (category === 'railways' ? 'Railway Marketplace' : 
            (category === 'ea-help' ? 'EA Internal System' : 
            (category === 'energy' ? 'Power Companies' : 
            ['South West Water', 'Thames Water', 'Severn Trent Water'][Math.floor(Math.random()*3)]))))));

        const impact = {
            id: `ev-${i}`,
            lat,
            lng,
            category,
            severity,
            timestamp,
            title: getMockTitle(category),
            locationName: `${regionLabel || 'UK Region'} | ${countyMatch}`,
            evidence: getMockEvidence(category),
            source: category === 'social' ? 'Twitter' : 
                   (category === 'news' ? 'Online News' : 
                   (category === 'roads' ? 'National Highways' : 
                   (category === 'railways' ? 'Railway Marketplace' : 
                   (category === 'ea-help' ? 'EA Internal' : 
                   (category === 'energy' ? 'Power Companies' : 
                   ['South West Water', 'Thames Water', 'Severn Trent Water'][Math.floor(Math.random()*3)]))))),
            sourceUrl: category === 'social' ? 'https://twitter.com' : 
                       (category === 'news' ? 'https://bbc.co.uk/news' : 
                       (category === 'ea-help' ? 'https://ea.gov.uk/internal' : '#')),
            photo: getMockPhoto(category),
            assessment
        };

        // Energy Outage Polygon Logic
        if (category === 'energy' && Math.random() > 0.4) {
            // Larger size for some to cross county boundaries
            const polySize = Math.random() > 0.7 ? 0.7 : 0.35;
            impact.outagePolygon = generateRandomPolygon({ lat, lng }, polySize);
            impact.title = `Outage Area: ${impact.title.split(':')[1] || impact.title}`;
            
            // Find intersecting counties
            const intersected = findIntersectingCounties(impact.outagePolygon, State.rawCounties);
            impact.intersectingCounties = intersected;
            
            if (intersected.length > 0) {
                impact.locationName = `${regionLabel} | ${intersected.length} Counties Affected`;
            } else {
                impact.locationName = `${regionLabel} | Regional Outage`;
            }
        }

        // Multi-location logic for News and EA Help
        if ((category === 'news' || category === 'ea-help') && Math.random() > 0.7) {
            const extraCount = 1 + Math.floor(Math.random() * 3);
            const locations = [{ lat, lng }];
            for (let j = 0; j < extraCount; j++) {
                locations.push({
                    lat: hub.lat + (Math.random() - 0.5) * 1.5,
                    lng: hub.lng + (Math.random() - 0.5) * 1.5
                });
            }
            impact.locations = locations;
            impact.title = `Widespread: ${impact.title}`;
            
            // Populate intersecting counties for widespread events so they group correctly
            const intersected = [];
            locations.forEach(loc => {
                const c = findGeoAttribute([loc.lng, loc.lat], State.rawCounties);
                if (c) intersected.push(c);
            });
            impact.intersectingCounties = [...new Set(intersected)];
            impact.locationName = `${regionLabel} | Widespread`; 
        }

        impacts.push(impact);
    }

    // Add Proxy Impact: Met Office Website Hits (One per day)
    const proxyLevels = ['minor', 'significant', 'severe'];
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

    // Google Trends Mock Data (Regional & County)
    if (State.rawRegions) {
        State.rawRegions.features.forEach((feat, idx) => {
            const severity = sevs[Math.floor(Math.random() * sevs.length)];
            const hoursAgo = Math.random() * 48;
            const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
            const regionName = feat.properties.rgn19nm || feat.properties.name || "Region";
            
            impacts.push({
                id: `gt-reg-${idx}`,
                category: 'google-trends',
                severity,
                timestamp,
                title: `Google Trends: ${regionName}`,
                locationName: `${regionName} | Regional`,
                evidence: `Elevated search volume for "flooding", "weather warnings", and "road closures" in ${regionName}.`,
                source: 'Google Trends',
                sourceUrl: 'https://trends.google.com',
                isNational: true, // Don't show as marker
                regionName,
                assessment: generateAssessment('google-trends', severity, 'Operational Feed')
            });
        });
    }

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
            return getFeatureName(feature.properties);
        }
    }
    return null;
}

function getMockPhoto(cat) {
    // 50% chance of no photo
    if (Math.random() < 0.5) return null;

    const photos = {
        roads: [
            'https://images.pexels.com/photos/1547833/pexels-photo-1547833.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/3971985/pexels-photo-3971985.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        railways: [
            'https://images.pexels.com/photos/1054391/pexels-photo-1054391.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1755106/pexels-photo-1755106.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        social: [
            'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        news: [
            'https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        energy: [
            'https://images.pexels.com/photos/1578277/pexels-photo-1578277.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/236056/pexels-photo-236056.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        water: [
            'https://images.pexels.com/photos/2143000/pexels-photo-2143000.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/2533092/pexels-photo-2533092.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        'ea-help': [
            'https://images.pexels.com/photos/163726/belgium-flood-river-water-163726.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/2533092/pexels-photo-2533092.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]
    };
    const list = photos[cat];
    if (!list) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function getMockTitle(cat) {
    const roads = ['A1(M)', 'M6', 'M25', 'A14', 'A303', 'M1', 'M4', 'A42'];
    const statuses = ['Road Closure', 'Lane Closure', 'Surface Flooding', 'Severe Congestion'];
    
    const stations = ['Drax Power Station', 'Ratcliffe-on-Soar', 'Hinkley Point', 'Heysham', 'Torness', 'Pembroke'];
    const energyAlerts = ['Grid Stability Alert', 'Substation Failure', 'Partial Blackout risk', 'Frequency Drop'];

    const titles = {
        roads: () => `${roads[Math.floor(Math.random()*roads.length)]}: ${statuses[Math.floor(Math.random()*statuses.length)]}`,
        railways: () => ['Asset Failure: West Coast', 'Track Flooding near Leeds', 'Tree on Line: East Coast', 'Network Rail Speed Restriction'][Math.floor(Math.random()*4)],
        social: () => ['Post: Flood water rising fast', 'Alert: Bridge overtopped', 'Images: Local road collapsed', 'Twitter: Sandbags deployed'][Math.floor(Math.random()*4)],
        news: () => ['Storm disruption peaks across region', 'Met Office issues red warnings', 'Major infrastructure under pressure', 'Emergency response teams deployed'][Math.floor(Math.random()*4)],
        energy: () => `${stations[Math.floor(Math.random()*stations.length)]}: ${energyAlerts[Math.floor(Math.random()*energyAlerts.length)]}`,
        water: () => ['Treatment Plant Threshold Exceeded', 'Burst Water Main: Low Pressure', 'Sewer Overload in Urban Area', 'Reservoir Spillway Operational'][Math.floor(Math.random()*4)],
        'ea-help': () => ['HELLP Alert: River Levels Rising', 'Operational Status: Red', 'Asset Failure: Sluice Gate 4', 'Emergency Pumping Initiated'][Math.floor(Math.random()*4)]
    };
    
    const res = titles[cat];
    return typeof res === 'function' ? res() : res;
}

function getMockEvidence(cat) {
    const texts = {
        roads: 'Social media reports indicate 30cm of standing water. National Highways confirming closure of northbound lanes.',
        railways: 'Network Rail reports infrastructure failure due to water ingress in cable duct. Delays of up to 45 mins expected.',
        social: 'Twitter user @WeatherAlert identifies localized flooding at primary school entrance. Footage uploaded.',
        news: 'Local news outlet reports emergency services on site. "We\'ve never seen the water rise this fast," says resident.',
        energy: 'Automated sensor alert: Level 1 threshold exceeded at regional substation. Cooling systems operational.',
        water: 'High pressure alarm triggered at downstream filtration unit. System bypass activated to prevent surge damage.',
        'ea-help': 'Incident reported via HELP system. Local teams deployed for asset inspection and flood barrier installation.'
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
    spatialMode: 'county', // 'region', 'county' or null
    // Storage for spatial lookup
    rawRegions: null,
    rawCounties: null,
    viewMode: 'map', // 'map' or 'summary'
    summaryGroup: 'category', // 'category', 'receptor', 'severity'
    feedSort: 'recency',
    sidebarView: 'sources'
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
function findIntersectingCounties(polyCoords, rawCounties) {
    if (!rawCounties || !rawCounties.features) return [];
    const intersecting = [];
    
    // Convert [lat, lng] from outagePolygon to [lng, lat] for isPointInPolygon
    const lngLatPoly = polyCoords.map(c => [c[1], c[0]]);
    
    // Check each feature
    rawCounties.features.forEach(feature => {
        const name = feature.properties.name || feature.properties.NAME || feature.properties.County || "Unknown County";
        const geom = feature.geometry;
        if (!geom) return;

        // Simple heuristic for intersection: check if any of our polygon vertices are inside the county
        // Or if the county's first vertex is inside our polygon
        let basePoly = null;
        if (geom.type === 'Polygon') basePoly = geom.coordinates[0];
        else if (geom.type === 'MultiPolygon') basePoly = geom.coordinates[0][0];
        
        if (!basePoly) return;

        let isIntersecting = false;
        // Check our vertices against county
        for (let i = 0; i < lngLatPoly.length; i++) {
            if (geom.type === 'Polygon') {
                if (isPointInPolygon(lngLatPoly[i], geom.coordinates[0])) { isIntersecting = true; break; }
            } else if (geom.type === 'MultiPolygon') {
                for (const subPoly of geom.coordinates) {
                    if (isPointInPolygon(lngLatPoly[i], subPoly[0])) { isIntersecting = true; break; }
                }
                if (isIntersecting) break;
            }
        }

        // If not found yet, check county center or first point against our polygon
        if (!isIntersecting) {
            if (isPointInPolygon(basePoly[0], lngLatPoly)) isIntersecting = true;
        }

        if (isIntersecting) intersecting.push(name);
    });
    
    return [...new Set(intersecting)]; // Unique only
}

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
            
            const name = feature.properties.name || feature.properties.NAME || feature.properties.Region || feature.properties.County || feature.properties.rgn24nm || feature.properties.rgn19nm || feature.properties.ctry24nm || feature.properties.ctry19nm;
            
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
            style: { color: '#94a3b8', weight: 1, opacity: 0.4, fillOpacity: 0.02 }, // Added tiny fill so clicks register anywhere
            onEachFeature: (feature, layer) => {
                layer.on('click', onSpatialClick);
            }
        });

        // Store names for mock generation
        State.regionNames = regionsRes.features.map(f => f.properties.name || f.properties.NAME || f.properties.Region || "UK Region");
        State.countyNames = countiesRes.features.map(f => f.properties.name || f.properties.NAME || f.properties.County || "County");

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

    // Dynamic Mock Data after GeoJSON is loaded
    State.impacts = generateMockImpacts();
    
    renderTimelineTicks();
    setupEvents();
    
    // Set default view period to "Today" (Midnight to Now)
    const nowObj = new Date();
    const todayStart = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate());
    const hoursSinceTodayStart = (nowObj - todayStart) / (1000 * 60 * 60);
    
    // Ensure we start at midnight exactly, but allow a reasonable minimum duration (2h) if it's very early
    const windowDuration = Math.max(2, hoursSinceTodayStart);
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
    const now = new Date();
    
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

    // Layers Menu Toggle
    const layersBtn = document.getElementById('layers-menu-btn');
    const layersDropdown = layersBtn.parentElement;

    layersBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        layersDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!layersDropdown.contains(e.target)) {
            layersDropdown.classList.remove('active');
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
        });
    }

    if (closeDiveConfigBtn) closeDiveConfigBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));
    if (cancelDiveModalBtn) cancelDiveModalBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));
    
    const cancelBtn = document.querySelector('.btn-ghost');
    if (cancelBtn) cancelBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));

    if (startDiveBtn) {
        startDiveBtn.addEventListener('click', () => {
            const locationInput = document.getElementById('dive-location-input');
            const location = locationInput.value.trim();
            if (!location) { 
                locationInput.closest('.input-with-icon').style.borderColor = '#ef4444';
                return; 
            }
            
            const selectedModules = Array.from(document.querySelectorAll('.agentic-source-card input:checked')).map(i => i.value);
            deployAgenticSearch(location, selectedModules);
            diveConfigModal.classList.remove('active');
            locationInput.value = '';
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
            <input type="checkbox" ${isActive ? 'checked' : ''} value="${key}">
            <span class="category-indicator" style="background: ${type.color}"></span>
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
    const now = new Date();
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

    // Spatial & Trends Overlay Styling
    if (State.activeCategories.has('google-trends')) {
        updateSpatialSummary(filtered, State.regions, State.rawRegions, 'trends');
    }

    if (State.spatialMode === 'region') {
        updateSpatialSummary(filtered, State.regions, State.rawRegions, 'severity');
    } else {
        // Reset Regions to basemap style
        updateSpatialSummary([], State.regions, State.rawRegions, 'severity');
    }
    
    if (State.spatialMode === 'county') {
        updateSpatialSummary(filtered, State.counties, State.rawCounties, 'blue');
    } else {
        // Reset Counties to basemap style
        updateSpatialSummary([], State.counties, State.rawCounties, 'blue');
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
    
    renderFeed(filtered);
}

function updateSpatialSummary(filtered, leafletLayer, rawJson, ramp) {
    if (!rawJson) return;

    // Professional ramps
    const ramps = {
        severity: {
            minor: '#93c5fd',       // Blue 300
            significant: '#2563eb', // Blue 600
            severe: '#081451'       // Ultra Dark Blue
        },
        trends: {
            minor: '#fecaca',       // Red 200
            significant: '#f87171', // Red 400
            severe: '#991b1b'       // Red 900
        }
    };
    
    const colors = ramps[ramp] || ramps.severity;

    // Calculate aggregate severity for trends if in that mode
    let aggregateTrendLabel = 'minor';
    if (ramp === 'trends') {
        const trends = filtered.filter(imp => imp.category === 'google-trends');
        if (trends.length > 0) {
            // Find max severity in current window
            const weights = { minor: 1, significant: 2, severe: 3 };
            let maxW = 0;
            trends.forEach(t => {
                if (weights[t.severity] > maxW) {
                    maxW = weights[t.severity];
                    aggregateTrendLabel = t.severity;
                }
            });
        }
    }

    leafletLayer.eachLayer(layer => {
        const regionFeat = layer.feature;
        const regionName = getFeatureName(regionFeat.properties);
        
        let maxSev = 0;
        let maxLabel = null;

        if (ramp === 'trends') {
            // Use unified color for entire UK
            maxLabel = aggregateTrendLabel;
        } else {
            // Standard point-in-polygon aggregation
            const regionBounds = layer.getBounds();
            filtered.filter(imp => !imp.isNational).forEach(imp => {
                let isInside = false;
                
                // Point check (Checking all locations if widespread)
                const locs = imp.locations || [{lat: imp.lat, lng: imp.lng}];
                for (const loc of locs) {
                    if (isInside) break;
                    
                    // Performance optimization: bounding box check
                    if (regionBounds.contains([loc.lat, loc.lng])) {
                        const geom = regionFeat.geometry;
                        if (geom.type === 'Polygon') {
                            if (isPointInPolygon([loc.lng, loc.lat], geom.coordinates[0])) isInside = true;
                        } else if (geom.type === 'MultiPolygon') {
                            for (const poly of geom.coordinates) {
                                if (isPointInPolygon([loc.lng, loc.lat], poly[0])) { isInside = true; break; }
                            }
                        }
                    }
                }

                // Energy Polygon intersection check
                if (!isInside && imp.category === 'energy' && imp.intersectingCounties) {
                    if (imp.intersectingCounties.includes(regionName)) {
                        isInside = true;
                    }
                }

                if (isInside) {
                    const weights = { minor: 1, significant: 2, severe: 3 };
                    const weight = weights[imp.severity] || 0;
                    if (weight > maxSev) {
                        maxSev = weight;
                        maxLabel = imp.severity;
                    }
                }
            });
        }

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
                color: leafletLayer === State.regions ? '#334155' : '#94a3b8',
                weight: leafletLayer === State.regions ? 1.5 : 1
            });
        }
    });
}

function setupMapOverlays() {
    document.getElementById('toggle-regions').addEventListener('change', (e) => {
        if (e.target.checked) {
            State.regions.addTo(State.map);
            State.spatialMode = 'region';
            // Untoggle others to avoid messy overlapping summaries in feed
            document.getElementById('toggle-counties').checked = false;
            State.counties.removeFrom(State.map);
        } else {
            State.regions.removeFrom(State.map);
            if (State.spatialMode === 'region') State.spatialMode = null;
        }
        renderImpacts();
    });
    document.getElementById('toggle-counties').addEventListener('change', (e) => {
        if (e.target.checked) {
            State.counties.addTo(State.map);
            State.spatialMode = 'county';
            document.getElementById('toggle-regions').checked = false;
            State.regions.removeFrom(State.map);
        } else {
            State.counties.removeFrom(State.map);
            if (State.spatialMode === 'county') State.spatialMode = null;
        }
        renderImpacts();
    });
}

function renderFeed(filtered) {
    const feedCont = document.getElementById('feed-container');
    const feedCount = document.getElementById('feed-count');
    
    feedCount.innerText = filtered.length;

    const sorted = [...filtered].sort((a, b) => {
        if (State.feedSort === 'severity') {
            const weights = { severe: 4, significant: 3, minor: 2 };
            const diff = weights[b.severity] - weights[a.severity];
            if (diff !== 0) return diff;
            return b.timestamp - a.timestamp; // Secondary sort: recency
        } else if (State.feedSort === 'type') {
            const labelA = CATEGORIES[a.category].label;
            const labelB = CATEGORIES[b.category].label;
            if (labelA < labelB) return -1;
            if (labelA > labelB) return 1;
            return b.timestamp - a.timestamp; // Secondary sort: recency
        }
        // Default: recency
        return b.timestamp - a.timestamp;
    });
    feedCount.innerText = sorted.length;
    feedCont.innerHTML = '';

    sorted.forEach(imp => {
        const card = document.createElement('div');
        card.id = `card-${imp.id}`;
        card.className = 'feed-card' + (State.selectedImpact?.id === imp.id ? ' active' : '');
        
        const timeStr = imp.timestamp.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
            ${imp.photo ? `<div class="feed-card-photo" style="background-image: url('${imp.photo}')"></div>` : ''}
            <div class="feed-card-body">
                <div class="feed-card-header-row">
                    <div class="feed-card-meta">
                        <span class="feed-card-tag" style="background: ${CATEGORIES[imp.category].color}20; color: ${CATEGORIES[imp.category].color}">
                            ${CATEGORIES[imp.category].label}
                        </span>
                        <span class="feed-card-time">${timeStr}</span>
                    </div>
                    <div class="header-actions">
                        <a href="${imp.sourceUrl}" class="source-link" target="_blank" onclick="event.stopPropagation()">
                            ${imp.source}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                        </a>
                        <span class="source-only-btn" title="View only this source" onclick="event.stopPropagation(); filterOnly('${imp.category}')">Only</span>
                    </div>
                </div>
                <h4 class="feed-card-title">${imp.title}</h4>
                <div class="feed-card-content-wrap">
                    <p class="feed-card-evidence">${imp.evidence}</p>
                </div>
                <div class="feed-card-footer">
                    <div class="sev-conf-group">
                        <div class="sev-label-box">
                            <span class="sev-rect-small" style="background: ${SEVERITIES[imp.severity].color}"></span>
                            <span style="color: ${SEVERITIES[imp.severity].color}; font-weight: 700;">${SEVERITIES[imp.severity].label}</span>
                        </div>
                        ${imp.assessment ? `
                            <div class="conf-mini-pill">
                                Severity Confidence: ${imp.assessment.confidenceLabel}
                            </div>
                        ` : ''}
                        <button class="assessment-info-btn" data-impact-id="${imp.id}" onclick="event.stopPropagation(); showAssessmentModal('${imp.id}')" title="View assessment justification">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="card-location-group">
                    <div class="card-location-row">
                        <span class="loc-label">Region:</span>
                        <div class="loc-value-wrap">
                            <span class="cty-mini-pill">${imp.locationName.split('|')[0].trim()}</span>
                        </div>
                    </div>
                    <div class="card-location-row">
                        <span class="loc-label">County:</span>
                        <div class="loc-value-wrap">
                            ${imp.intersectingCounties && imp.intersectingCounties.length > 0 
                              ? imp.intersectingCounties.map(c => `<span class="cty-mini-pill">${c}</span>`).join('')
                              : `<span class="cty-mini-pill">${imp.locationName.split('|')[1]?.trim() || 'N/A'}</span>`
                            }
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
    const now = new Date();
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
    
    title.innerText = `Spatial Summary: ${areaName}`;

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
                    <span class="record-category" style="color:var(--clr-primary)">Spatial Summary</span>
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
        <div class="justification-section">
            <h5>Severity Level</h5>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                <span class="sev-dot-small" style="background:${SEVERITIES[imp.severity].color};width:12px;height:12px"></span>
                <strong style="color:${SEVERITIES[imp.severity].color};font-size:1rem">${SEVERITIES[imp.severity].label}</strong>
                ${imp.category ? `<span style="font-size:0.75rem;color:var(--text-secondary)">${CATEGORIES[imp.category]?.label || 'Summary'} impact</span>` : ''}
            </div>
            <p class="justification-text">${a.justification}</p>
        </div>
        <div class="justification-section">
            <h5>Confidence Level</h5>
            <div class="confidence-detail-grid">
                <div class="confidence-factor">
                    <div class="cf-label">Source Reliability</div>
                    <div class="cf-value">${a.sourceLabel || 'High'}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${a.sourceType || 'Spatial Cross-Link'}</div>
                </div>
                <div class="confidence-factor">
                    <div class="cf-label">Corroboration</div>
                    <div class="cf-value">${a.corroborated ? 'Yes' : 'No'}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${a.corroborated ? 'Confirmed by cluster' : 'Isolated report'}</div>
                </div>
                <div class="confidence-factor">
                    <div class="cf-label">Intelligence Type</div>
                    <div class="cf-value">${a.isProxy ? 'Proxy' : 'Direct'}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${a.isProxy ? 'Inferred from activity' : 'Validated observation'}</div>
                </div>
                <div class="confidence-factor">
                    <div class="cf-label">Overall Confidence</div>
                    <div class="cf-value" style="color:${a.confidenceColor}">${a.confidenceLabel}</div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">Based on ${a.confidence}% score</div>
                </div>
            </div>
        </div>
        <div class="justification-section">
            <h5>Assessment Engine Logic</h5>
            <ul class="justification-factors">
                <li><span class="factor-icon">📋</span> Cross-checked against Civil Service Impact Framework criteria</li>
                <li><span class="factor-icon">🤖</span> Automated synthesis using ${a.sourceType || 'Spatial'} logic path</li>
                <li><span class="factor-icon">🔗</span> Confidence anchored by ${imp.source || 'multi-source correlation'}</li>
            </ul>
        </div>
        <div class="framework-ref">
            <strong>Framework Note:</strong> This assessment determines operational priority by matching raw evidence against the predefined impact thresholds in System Configuration.
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

// --- Directed Search Deep Dive Logic V2 ---
State.deepDiveSessions = [];
State.activeDiveId = null;

function deployAgenticSearch(location, modules) {
    const sessionId = 'dive-' + Date.now();
    const session = {
        id: sessionId,
        location: location,
        modules: modules,
        startTime: new Date(),
        progress: 0,
        logs: [],
        status: 'Active',
        marker: null,
        interval: null,
        steps: generateStepsForModules(location, modules)
    };

    // Map Placement (Simulated center-ish or based on name if we had geocoding)
    const center = State.map.getCenter();
    const radarIcon = L.divIcon({
        className: 'radar-pulse-marker',
        html: '<div class="radar-ring"></div><div class="radar-center"></div>',
        iconSize: [20, 20]
    });
    session.marker = L.marker(center, { icon: radarIcon, interactive: true }).addTo(State.map);
    session.marker.on('click', () => openDiveOverlay(sessionId));

    State.deepDiveSessions.push(session);
    updateActiveDivesUI();
    
    // Start Processing
    startSessionProcessing(sessionId);
    openDiveOverlay(sessionId);
}

function generateStepsForModules(location, modules) {
    return [
        { type: 'INFO', msg: `Starting check in ${location}...` },
        { type: 'INFO', msg: 'Checking local sensor data.' },
        { type: 'INFO', msg: 'Getting status of roads and power.' },
        { type: 'INFO', msg: 'Looking for new reports on social media.' },
        { type: 'INFO', msg: 'Matching reports from different sources.' },
        { type: 'INFO', msg: 'Confirmed issues. Saving summary.' },
        { type: 'INFO', msg: 'Investigation complete. Data updated.' }
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
            if (State.activeDiveId === id) refreshOverlayContent(session);
            return;
        }

        const step = session.steps[stepIndex];
        const now = new Date();
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
    const now = new Date();
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
    const now = new Date();
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
        
        const avgConfidence = (list.reduce((sum, i) => sum + i.assessment.confidence, 0) / list.length).toFixed(0);
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
                    <div style="font-weight:700; color:#0f172a; font-size: 1.1rem">${avgConfidence}%</div>
                    <div style="font-size:0.65rem; color:#94a3b8; font-weight:700; text-transform:uppercase; margin-top:2px">Confidence</div>
                </td>
                <td class="evidence-synthesis">
                    Aggregated intelligence report based on <strong>${primaryImp.sourceLabel}</strong> and ${list.length - 1} auxiliary evidence clusters.
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
