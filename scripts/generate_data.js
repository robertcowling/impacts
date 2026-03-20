const fs = require('fs');
const path = require('path');

// --- Mock Data Constants ---
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

function isSWEngland(lat, lng) {
    return lat >= 50.0 && lat <= 51.5 && lng >= -6.0 && lng <= -2.0;
}

function getMockTitle(cat, source) {
    const roads = ['A1(M)', 'M6', 'M25', 'A14', 'A303', 'M1', 'M4', 'A42', 'A470', 'A48', 'A40'];
    const statuses = ['Road Closure', 'Lane Closure', 'Surface Flooding', 'Severe Congestion'];
    const stations = ['Drax Power Station', 'Ratcliffe-on-Soar', 'Hinkley Point', 'Heysham', 'Torness', 'Pembroke'];
    const energyAlerts = ['Grid Stability Alert', 'Substation Failure', 'Partial Blackout risk', 'Frequency Drop'];

    const titles = {
        roads: () => `${roads[Math.floor(Math.random()*roads.length)]}: ${statuses[Math.floor(Math.random()*statuses.length)]}`,
        railways: () => ['Asset Failure: West Coast', 'Track Flooding near Leeds', 'Tree on Line: East Coast', 'Network Rail Speed Restriction'][Math.floor(Math.random()*4)],
        social: () => {
            const prefix = source ? `[${source}] ` : "";
            return `${prefix}${['User Alert: Localized flooding', 'Sandbag deployment request', 'Road submerged by rising river', 'Structural stress reported by resident'][Math.floor(Math.random()*4)]}`;
        },
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

function getMockEvidence(cat, source) {
    const texts = {
        roads: 'Social media reports indicate 30cm of standing water. Official channels confirming closure of northbound lanes.',
        railways: 'Network Rail reports infrastructure failure due to water ingress in cable duct. Delays of up to 45 mins expected.',
        social: `${source || 'Social media'} user @WeatherAlert identifies localized flooding at primary school entrance. Footage uploaded.`,
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
        roads: `${sourceLabel} reports confirmed lane closures. Traffic sensors show speeds < 10mph in affected sections.`,
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
        confidence: Math.round(confValue * 100),
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
    let count = 20;
    if (category === 'social') count = 50;
    if (category === 'proxy') count = 2;
    if (category === 'google-trends') count = 15;
    
    // Friday 00:00 - 08:00 is 17 to 9 hours ago
    // Thursday is > 17 hours ago
    // Friday > 08:00 is < 9 hours ago

    let swRoadsCount = 0;

    for (let i = 0; i < count; i++) {
        const hub = weightedHubs[Math.floor(Math.random() * weightedHubs.length)];
        let lat = hub.lat + (Math.random() - 0.5) * hub.radius;
        let lng = hub.lng + (Math.random() - 0.5) * hub.radius;

        let timestamp;
        let severity;
        const timeRand = Math.random();

        if (category === 'roads' && swRoadsCount < 7) {
            // SW minor road impacts between 00:00–08:00 Friday (9–17 h ago from snapshot 17:00)
            timestamp = new Date(now.getTime() - (9 + Math.random() * 8) * 60 * 60 * 1000);
            lat = 50.7 + (Math.random() - 0.5) * 1.5;
            lng = -3.5 + (Math.random() - 0.5) * 1.5;
            severity = 'minor';
            swRoadsCount++;
        } else if (timeRand < 0.15) {
            // Isolated Thursday impacts (17–41 h ago)
            timestamp = new Date(now.getTime() - (17 + Math.random() * 24) * 60 * 60 * 1000);
            severity = Math.random() < 0.8 ? 'minor' : 'significant';
        } else {
            // Main: Friday after 08:00 (0–9 h ago)
            timestamp = new Date(now.getTime() - (Math.random() * 9) * 60 * 60 * 1000);
            const sevRand = Math.random();
            severity = sevRand < 0.35 ? 'minor' : (sevRand < 0.85 ? 'significant' : 'severe');
        }

        if (category === 'proxy' || category === 'google-trends') {
            lat = 54.5; lng = -2.0; // National centre
        }

        let sourceLabel;
        if (category === 'social') {
            const socialRand = Math.random();
            if (socialRand < 0.7)        sourceLabel = 'X (Twitter)';
            else if (socialRand < 0.85)  sourceLabel = 'Bluesky';
            else                         sourceLabel = 'Threads';
        } else if (category === 'roads') {
            sourceLabel = isWales(lat, lng) ? 'Traffic Wales' : 'National Highways';
        } else {
            sourceLabel = (
                category === 'news'          ? 'Online News'          :
                category === 'railways'      ? 'Railway Marketplace'  :
                category === 'ea-help'       ? 'EA Internal'          :
                category === 'energy'        ? 'Power Companies'      :
                category === 'proxy'         ? 'Met Office Digital'   :
                category === 'google-trends' ? 'Google Trends'        :
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
            title: category === 'proxy' ? 'Met Office Website Hits' : getMockTitle(category, sourceLabel),
            locationName: category === 'proxy' ? 'United Kingdom | National' : 'Regional | County | Constituency Placeholder',
            evidence: getMockEvidence(category, sourceLabel),
            source: sourceLabel,
            sourceUrl: '#',
            assessment: generateAssessment(category, severity, sourceLabel)
        };

        // Attach sample social posts to social-category impacts
        if (category === 'social') {
            const platform = sourceLabel.split(' ')[0];
            impact.posts = [
                { user: `@WeatherWatch_${platform}`, text: `Localized flooding at ${hub.name} junction. Avoid the area if possible. #flood #storm`, time: '2h ago' },
                { user: `@CitizenReporter`,          text: `Standing water on main road near ${hub.name} school. Emergency services on site.`,    time: '3h ago' },
                { user: `@CommuterHelp`,             text: `Severe delays entering ${hub.name} due to road closures. Use alternative routes.`,    time: '4h ago' }
            ];
        }

        impacts.push(impact);
    }

    fs.writeFileSync(path.join(dataDir, `${category}.json`), JSON.stringify(impacts, null, 2));
    console.log(`Generated ${category}.json with ${count} items.`);
});
