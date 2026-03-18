const fs = require('fs');
const path = require('path');

const FIXED_NOW_DATE = '2025-11-14';

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

const roads = [];

// 2 Severe Impacts (Polygon A core area, but spread slightly)
for (let i = 0; i < 2; i++) {
    const lat = randomRange(51.6, 52.2);
    const lng = randomRange(-3.5, -2.6);
    const timestamp = `${FIXED_NOW_DATE}T15:00:00.000Z`;
    roads.push({
        id: `ev-roads-sev-${i}`,
        lat, lng,
        category: "roads",
        severity: "severe",
        timestamp,
        title: "Major Road Closure: Severe Flooding",
        locationName: "South Wales Border | Monmouthshire | MP Constituency Placeholder",
        evidence: "Emergency services report multiple road closures due to severe surface water flooding. Carriageways completely submerged.",
        source: "National Highways",
        sourceUrl: "https://www.trafficengland.com/",
        assessment: {
            confidenceLabel: "High",
            confidenceColor: "#4ade80",
            justification: "Multiple official reports and live traffic camera verification confirm complete road obstruction.",
            sourceLabel: "National Highways",
            sourceReliability: "Official",
            intelligenceType: "Direct",
            corroborated: true,
            startTiming: "14:30",
            endTiming: "",
            synthesis: "Critical infrastructure failure due to extreme rainfall and flooding. Aligns with Severe impact criteria.",
            confidenceStatement: "High confidence assessment based on official emergency service reports."
        }
    });
}

// 5 Significant Impacts (Polygon B region, but noisy)
for (let i = 0; i < 5; i++) {
    // Focus in B but allow some noise
    const lat = randomRange(51.5, 53.8);
    const lng = randomRange(-3.2, -0.4);
    const timestamp = `${FIXED_NOW_DATE}T12:00:00.000Z`;
    roads.push({
        id: `ev-roads-sig-${i}`,
        lat, lng,
        category: "roads",
        severity: "significant",
        timestamp,
        title: "Significant Flooding: Lane Closures",
        locationName: "Midlands & South West | MP Constituency Placeholder",
        evidence: "National Highways reports significant standing water on the carriageway. Multiple lanes closed to traffic.",
        source: "National Highways",
        sourceUrl: "https://www.trafficengland.com/",
        assessment: {
            confidenceLabel: "High",
            confidenceColor: "#4ade80",
            justification: "National Highways live feeds confirm lane closures and significant speed reductions.",
            sourceLabel: "National Highways",
            sourceReliability: "Official",
            intelligenceType: "Direct",
            corroborated: true,
            startTiming: "11:00",
            endTiming: "",
            synthesis: "Significant disruption to trunk road network due to heavy rainfall and drainage failure.",
            confidenceStatement: "High confidence assessment based on official traffic management data."
        }
    });
}

// 23 Minor Impacts (Widely scattered across Polygon C)
for (let i = 0; i < 23; i++) {
    const lat = randomRange(50.6, 54.5);
    const lng = randomRange(-4.5, 1.8);
    const timestamp = `${FIXED_NOW_DATE}T08:00:00.000Z`;
    roads.push({
        id: `ev-roads-min-${i}`,
        lat, lng,
        category: "roads",
        severity: "minor",
        timestamp,
        title: "Heavy Rain: Speed Restrictions",
        locationName: "Regional Coverage | MP Constituency Placeholder",
        evidence: "Precautionary speed restrictions in place due to heavy rainfall and reduced visibility.",
        source: "National Highways",
        sourceUrl: "https://www.trafficengland.com/",
        assessment: {
            confidenceLabel: "Medium",
            confidenceColor: "#facc15",
            justification: "Weather warnings and traffic sensor data indicate widespread speed reductions.",
            sourceLabel: "National Highways",
            sourceReliability: "Official",
            intelligenceType: "Proxy",
            corroborated: false,
            startTiming: "07:30",
            endTiming: "",
            synthesis: "Minor delays expected across the network due to adverse weather conditions.",
            confidenceStatement: "Medium confidence assessment based on meteorological trends and speed sensors."
        }
    });
}

fs.writeFileSync(path.join('c:', 'Users', 'rob_c', 'Code', 'PRD Civil Service Challenge', 'frontend', 'data', 'roads.json'), JSON.stringify(roads, null, 2));
console.log("Updated roads.json with 30 noisy impacts (23/5/2)");
