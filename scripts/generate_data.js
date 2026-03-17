const fs = require('fs');
const path = require('path');

// --- Mock Data Constants (Replicated from app.js) ---
const CATEGORIES = ['roads', 'railways', 'social', 'news', 'energy', 'water', 'ea-help', 'proxy', 'google-trends'];
const SEVERITIES = ['minor', 'significant', 'severe'];

const hubs = [
    { lat: 51.4545, lng: -2.5879, name: 'Bristol', weight: 4.0, radius: 0.3 },
    { lat: 50.7184, lng: -3.5339, name: 'Exeter', weight: 2.0, radius: 0.25 },
    { lat: 51.8642, lng: -2.2442, name: 'Gloucester', weight: 1.5, radius: 0.2 },
    { lat: 51.5074, lng: -0.1278, name: 'London', weight: 0.8, radius: 0.6 },
    { lat: 52.4862, lng: -1.8904, name: 'Birmingham', weight: 0.8, radius: 0.6 },
    { lat: 53.4808, lng: -2.2426, name: 'Manchester', weight: 0.8, radius: 0.6 },
    { lat: 53.8008, lng: -1.5491, name: 'Leeds', weight: 0.5, radius: 0.6 },
    { lat: 52.2053, lng: 0.1218, name: 'Cambridge', weight: 0.5, radius: 0.6 },
    { lat: 51.7520, lng: -1.2577, name: 'Oxford', weight: 0.5, radius: 0.6 }
];

const weightedHubs = [];
hubs.forEach(h => {
    const count = Math.ceil(h.weight * 10);
    for(let j=0; j<count; j++) weightedHubs.push(h);
});

function getMockTitle(cat) {
    const roads = ['A1(M)', 'M6', 'M25', 'A14', 'A303', 'M1', 'M4', 'A42'];
    const statuses = ['Road Closure', 'Lane Closure', 'Surface Flooding', 'Severe Congestion'];
    const stations = ['Drax Power Station', 'Ratcliffe-on-Soar', 'Hinkley Point', 'Heysham', 'Torness', 'Pembroke'];
    const energyAlerts = ['Grid Stability Alert', 'Substation Failure', 'Partial Blackout risk', 'Frequency Drop'];

    const titles = {
        roads: () => `${roads[Math.floor(Math.random()*roads.length)]}: ${statuses[Math.floor(Math.random()*statuses.length)]}`,
        railways: () => ['Asset Failure: West Coast', 'Track Flooding near Leeds', 'Tree on Line: East Coast', 'Network Rail Speed Restriction'][Math.floor(Math.random()*4)],
        social: () => ['User Alert: Localized flooding', 'Sandbag deployment request', 'Road submerged by rising river', 'Structural stress reported by resident'][Math.floor(Math.random()*4)],
        news: () => ['BBC NEWS: Regional Storm Report', 'BREAKING: Met Office Amber Warning', 'ITV: Flooding causes local outages', 'Regional Dispatch: Infrastructure stress'][Math.floor(Math.random()*4)],
        energy: () => `${stations[Math.floor(Math.random()*stations.length)]}: ${energyAlerts[Math.floor(Math.random()*energyAlerts.length)]}`,
        water: () => ['Water Supply Advisory: Turbidity', 'Mains Pressure Warning', 'Storage Tank Level Threshold', 'System-wide Utility Alert'][Math.floor(Math.random()*4)],
        'ea-help': () => ['INTERNAL: River overtopping', 'DEFRA Advisory: Coastal Stress', 'Sluice Maintenance: Red Alert', 'Catchment Basin Saturation'][Math.floor(Math.random()*4)],
        'google-trends': () => `SEARCH SPIKE: "${['sandbags', 'flood insurance', 'water pumps', 'local rescue'][Math.floor(Math.random()*4)]}"`,
        'proxy': () => 'Met Office Digital: National Traffic Surge'
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
        roads: "National Highways reports confirmed lane closures. Traffic sensors show speeds < 10mph in affected sections.",
        railways: "Railway Marketplace advisory issued for the region. Multiple infrastructure failures and track flooding reported.",
        social: "High volume of localized social media reports corroborated by uploaded imagery showing infrastructure stress.",
        news: "Major regional and national news outlets confirming widespread disruption and active emergency response.",
        energy: "South Western Power monitoring systems detect voltage fluctuations and localized substation failures in the area.",
        water: "Utility provider logs show multiple burst mains and pressure drops aligned with reported flooding locations.",
        'ea-help': "Official Internal HELP report from Environment Agency. Validated by regional operational duty officer."
    };

    const now = new Date('2025-11-14T17:00:00Z');
    const startTime = new Date(now.getTime() - Math.floor(Math.random() * 4) * 60 * 60 * 1000);

    return {
        confidenceLabel,
        confidenceColor,
        justification: justifications[category] || "Automated assessment based on multi-source impact analysis and framework criteria.",
        sourceLabel: sourceLabel,
        sourceReliability: isOfficial ? 'Official' : 'Unofficial',
        intelligenceType: 'Direct',
        corroborated: Math.random() > 0.3,
        startTiming: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTiming: "",
        synthesis: `Evidence shows localized environmental stress and reported infrastructure failure based on ${isOfficial ? 'official' : 'emerging'} reports.`,
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
    let count = 15;
    if (category === 'social') count = 30;
    if (category === 'proxy') count = 2; // Only 2 national proxy alerts
    if (category === 'google-trends') count = 10;
    
    for (let i = 0; i < count; i++) {
        const hub = weightedHubs[Math.floor(Math.random() * weightedHubs.length)];
        const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
        let lat = hub.lat + (Math.random() - 0.5) * hub.radius;
        let lng = hub.lng + (Math.random() - 0.5) * hub.radius;
        
        if (category === 'proxy' || category === 'google-trends') {
            lat = 54.5; lng = -2.0; // National center
        }

        const timestamp = new Date(now.getTime() - (Math.random() * 48) * 60 * 60 * 1000);
        
        const sourceLabel = category === 'social' ? 'Twitter' : 
                          (category === 'news' ? 'Online News' : 
                          (category === 'roads' ? 'National Highways' : 
                          (category === 'railways' ? 'Railway Marketplace' : 
                          (category === 'ea-help' ? 'EA Internal' : 
                          (category === 'energy' ? 'Power Companies' : 
                          (category === 'proxy' ? 'Met Office Digital' : 
                          (category === 'google-trends' ? 'Google Trends' : 'Water Analytics')))))));

        impacts.push({
            id: `ev-${category}-${i}`,
            lat,
            lng,
            category,
            severity,
            timestamp: timestamp.toISOString(),
            title: category === 'proxy' ? 'Met Office Website Hits' : getMockTitle(category),
            locationName: category === 'proxy' ? "United Kingdom | National" : "Regional | County | Constituency Placeholder",
            evidence: getMockEvidence(category),
            source: sourceLabel,
            sourceUrl: "#",
            assessment: generateAssessment(category, severity, sourceLabel)
        });
    }
    
    fs.writeFileSync(path.join(dataDir, `${category}.json`), JSON.stringify(impacts, null, 2));
    console.log(`Generated ${category}.json with ${count} items.`);
});
