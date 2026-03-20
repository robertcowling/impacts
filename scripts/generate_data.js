const fs = require('fs');
const path = require('path');

// --- Mock Data Constants ---
// --- Mock Data Constants ---
const CATEGORIES = ['roads', 'railways', 'social', 'news', 'energy', 'water', 'ea-help'];
const SEVERITIES = ['minor', 'significant', 'severe'];

const hubs = [
    { lat: 51.4545, lng: -2.5879, name: 'Bristol', weight: 4.0, radius: 0.3 },
    { lat: 50.7184, lng: -3.5339, name: 'Exeter', weight: 2.0, radius: 0.25 },
    { lat: 51.8642, lng: -2.2442, name: 'Gloucester', weight: 1.5, radius: 0.2 },
    { lat: 51.5074, lng: -0.1278, name: 'London', weight: 0.8, radius: 0.6 },
    { lat: 52.4862, lng: -1.8904, name: 'Birmingham', weight: 1.0, radius: 0.6 },
    { lat: 53.4808, lng: -2.2426, name: 'Manchester', weight: 0.8, radius: 0.6 },
    { lat: 53.8008, lng: -1.5491, name: 'Leeds', weight: 0.5, radius: 0.6 },
    { lat: 52.2053, lng: 0.1218, name: 'Cambridge', weight: 0.5, radius: 0.6 },
    { lat: 51.7520, lng: -1.2577, name: 'Oxford', weight: 0.5, radius: 0.6 },
    { lat: 51.4816, lng: -3.1791, name: 'Cardiff', weight: 1.2, radius: 0.3 },
    { lat: 51.6214, lng: -3.9436, name: 'Swansea', weight: 1.0, radius: 0.3 }
];

const weightedHubs = [];
hubs.forEach(h => {
    const count = Math.ceil(h.weight * 10);
    for(let j=0; j<count; j++) weightedHubs.push(h);
});

function isWales(lat, lng) {
    return lat >= 51.3 && lat <= 53.5 && lng >= -5.5 && lng <= -2.5;
}

function getMockTitle(cat, source) {
    const roads = ['A1(M)', 'M6', 'M25', 'A14', 'A303', 'M1', 'M4', 'A42', 'A470', 'A48', 'A40'];
    const statuses = ['Road Closure', 'Lane Closure', 'Surface Flooding', 'Severe Congestion'];

    const titles = {
        roads: () => `${roads[Math.floor(Math.random()*roads.length)]}: ${statuses[Math.floor(Math.random()*statuses.length)]}`,
        railways: () => ['Asset Failure: West Coast', 'Track Flooding near Leeds', 'Tree on Line: East Coast', 'Network Rail Speed Restriction'][Math.floor(Math.random()*4)],
        social: () => {
            const prefix = source ? `[${source}] ` : "";
            return `${prefix}${['User Alert: Localized flooding', 'Sandbag deployment request', 'Road submerged by rising river', 'Structural stress reported by resident'][Math.floor(Math.random()*4)]}`;
        },
        news: () => ['BBC NEWS: Regional Storm Report', 'BREAKING: Met Office Amber Warning', 'ITV: Flooding causes local outages', 'Regional Dispatch: Infrastructure stress'][Math.floor(Math.random()*4)],
        energy: () => `${['Drax', 'Ratcliffe', 'Hinkley'][Math.floor(Math.random()*3)]}: ${['Grid Alert', 'Substation Failure', 'Partial Blackout'][Math.floor(Math.random()*3)]}`,
        water: () => ['Supply Advisory: Turbidity', 'Mains Pressure Warning', 'Storage Tank Level'][Math.floor(Math.random()*3)],
        'ea-help': () => ['INTERNAL: River overtopping', 'DEFRA Advisory: Coastal Stress', 'Sluice Maintenance'][Math.floor(Math.random()*3)]
    };
    const res = titles[cat];
    return typeof res === 'function' ? res() : res;
}

function getMockEvidence(cat, source) {
    const texts = {
        roads: 'Social media reports indicate 30cm of standing water. Official channels confirming closure of northbound lanes.',
        railways: 'Network Rail reports infrastructure failure due to water ingress. Delays expected.',
        social: `${source || 'Social media'} user identifies localized flooding. Footage uploaded.`,
        news: 'Local news reports emergency services on site. "Water rose fast," says resident.',
        energy: 'Sensor alert: Level 1 threshold exceeded at regional substation.',
        water: 'High pressure alarm triggered. System bypass activated.',
        'ea-help': 'Incident reported via HELP system. Local teams deployed for barrier installation.'
    };
    return texts[cat];
}

function generateAssessment(category, severity, sourceLabel) {
    const isOfficial = ['roads', 'railways', 'energy', 'water', 'ea-help'].includes(category);
    const confValue = 0.7 + Math.random() * 0.3;
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
        roads: `${sourceLabel} reports confirmed closures. Sensors show speeds < 10mph.`,
        railways: "Infrastructure failures and track flooding reported.",
        social: "Volume of social media reports corroborated by imagery.",
        news: "News outlets confirming widespread disruption.",
        energy: "Power monitoring systems detect fluctuations.",
        water: "Utility logs show mains pressure drops.",
        'ea-help': "Official HELP report from Environment Agency."
    };

    const now = new Date('2025-11-14T17:00:00Z');
    const startTime = new Date(now.getTime() - Math.floor(Math.random() * 4) * 60 * 60 * 1000);

    return {
        confidenceLabel,
        confidenceColor,
        confidence: Math.round(confValue * 100),
        justification: justifications[category] || "Automated assessment.",
        sourceLabel: sourceLabel,
        sourceReliability: isOfficial ? 'Official' : 'Unofficial',
        intelligenceType: 'Direct',
        corroborated: Math.random() > 0.3,
        startTiming: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTiming: "",
        synthesis: `Evidence shows localized stress.`,
        confidenceStatement: `This is a ${confidenceLabel} confidence assessment.`
    };
}

const dataDir = path.join(__dirname, '..', 'frontend', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const now = new Date('2025-11-14T17:00:00Z');

CATEGORIES.forEach(category => {
    const impacts = [];
    let count = 20;
    if (category === 'social') count = 50;

    let swRoadsCount = 0;
    
    // Track if we need to add the extra incidents for the central swathe
    let extraSwatheCount = 0;
    const targetExtraSwathe = 10;

    for (let i = 0; i < count; i++) {
        const hub = weightedHubs[Math.floor(Math.random() * weightedHubs.length)];
        let lat = hub.lat + (Math.random() - 0.5) * hub.radius;
        let lng = hub.lng + (Math.random() - 0.5) * hub.radius;

        let timestamp;
        let severity;
        const timeRand = Math.random();

        // 1. South West minor road impacts (preserved)
        if (category === 'roads' && swRoadsCount < 7) {
            timestamp = new Date(now.getTime() - (9 + Math.random() * 8) * 60 * 60 * 1000);
            lat = 50.7 + (Math.random() - 0.5) * 1.5;
            lng = -3.5 + (Math.random() - 0.5) * 1.5;
            severity = 'minor';
            swRoadsCount++;
        } 
        // 2. Central swathe (Birmingham -> Norfolk)
        else if ((category === 'social' || category === 'roads') && extraSwatheCount < targetExtraSwathe && Math.random() < 0.3) {
            timestamp = new Date(now.getTime() - (Math.random() * 12) * 60 * 60 * 1000);
            // Swathe: Birmingham (52.48, -1.89) to Norfolk (52.6, 1.2)
            const ratio = Math.random();
            lat = 52.4 + (Math.random() - 0.5) * 0.4;
            lng = -1.9 + ratio * 3.0; // Birmingham area to East Anglia
            severity = Math.random() < 0.7 ? 'minor' : 'significant';
            extraSwatheCount++;
        }
        else if (timeRand < 0.15) {
            timestamp = new Date(now.getTime() - (17 + Math.random() * 24) * 60 * 60 * 1000);
            severity = Math.random() < 0.8 ? 'minor' : 'significant';
        } else {
            timestamp = new Date(now.getTime() - (Math.random() * 9) * 60 * 60 * 1000);
            const sevRand = Math.random();
            severity = sevRand < 0.35 ? 'minor' : (sevRand < 0.85 ? 'significant' : 'severe');
        }

        // 3. Ensure "severe" impacts are in Monmouthshire or Herefordshire
        if (severity === 'severe') {
            // Monmouthshire / Herefordshire region
            lat = 51.8 + Math.random() * 0.4;
            lng = -2.9 + Math.random() * 0.4;
        }

        let sourceLabel;
        if (category === 'social') {
            const socialRand = Math.random();
            if (socialRand < 0.7)        sourceLabel = 'X (Twitter)';
            else if (socialRand < 0.85)  sourceLabel = 'Bluesky';
            else                         sourceLabel = 'Threads';
        } else if (category === 'roads') {
            sourceLabel = (lat >= 51.3 && lat <= 53.5 && lng >= -5.5 && lng <= -2.5) ? 'Traffic Wales' : 'National Highways';
        } else {
            sourceLabel = (
                category === 'news'          ? 'Online News'          :
                category === 'railways'      ? 'Railway Marketplace'  :
                category === 'ea-help'       ? 'EA Internal'          :
                category === 'energy'        ? 'Power Companies'      :
                                               'Water Analytics'
            );
        }

        const impact = {
            id: `ev-${category}-${i}`,
            lat,
            lng,
            category,
            severity,
            timestamp: timestamp.toISOString(),
            title: getMockTitle(category, sourceLabel),
            locationName: "United Kingdom | Regional",
            evidence: getMockEvidence(category, sourceLabel),
            source: sourceLabel,
            sourceUrl: '#',
            assessment: generateAssessment(category, severity, sourceLabel)
        };

        impacts.push(impact);
    }

    fs.writeFileSync(path.join(dataDir, `${category}.json`), JSON.stringify(impacts, null, 2));
    console.log(`Generated ${category}.json with ${count} items.`);
});
