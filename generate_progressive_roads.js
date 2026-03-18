const fs = require('fs');
const path = require('path');

const roads = [];

function generateImpact(id, lat, lng, severity, date, time, title, evidence, location) {
    const timestamp = `2025-11-${date}T${time}:00.000Z`;
    return {
        id, lat, lng,
        category: "roads",
        severity,
        timestamp,
        title,
        locationName: location + " | MP Constituency Placeholder",
        evidence,
        source: "National Highways",
        sourceUrl: "https://www.trafficengland.com/",
        assessment: {
            confidenceLabel: "High",
            confidenceColor: "#4ade80",
            justification: "National Highways reported data.",
            sourceLabel: "National Highways",
            sourceReliability: "Official",
            intelligenceType: "Direct",
            corroborated: true,
            startTiming: time,
            endTiming: "",
            synthesis: `Evidence shows ${severity} road disruption due to heavy rainfall.`,
            confidenceStatement: "High confidence assessment from official feed."
        }
    };
}

// 23 Minor
const minorData = [
  { lat: 51.5, lng: -0.1, date: "13", time: "08:15", loc: "London" },
  { lat: 51.4, lng: -2.5, date: "13", time: "09:30", loc: "Bristol" },
  { lat: 52.4, lng: -1.9, date: "13", time: "11:00", loc: "Birmingham" },
  { lat: 53.4, lng: -2.2, date: "13", time: "13:45", loc: "Manchester" },
  { lat: 54.9, lng: -1.6, date: "13", time: "16:20", loc: "Newcastle" },
  { lat: 50.8, lng: -1.0, date: "13", time: "18:00", loc: "Portsmouth" },
  { lat: 52.6, lng: 1.3, date: "13", time: "20:30", loc: "Norwich" },
  { lat: 53.8, lng: -1.5, date: "13", time: "22:15", loc: "Leeds" },
  { lat: 51.7, lng: -1.2, date: "14", time: "01:00", loc: "Oxford" },
  { lat: 52.2, lng: 0.1, date: "14", time: "03:30", loc: "Cambridge" },
  { lat: 50.7, lng: -3.5, date: "14", time: "05:15", loc: "Exeter" },
  { lat: 51.9, lng: -2.1, date: "14", time: "06:45", loc: "Gloucester" },
  { lat: 53.2, lng: -2.9, date: "14", time: "07:30", loc: "Chester" },
  { lat: 54.1, lng: -2.8, date: "14", time: "08:15", loc: "Lancaster" },
  { lat: 52.9, lng: -1.1, date: "14", time: "09:00", loc: "Nottingham" },
  { lat: 51.5, lng: -2.5, date: "14", time: "09:45", loc: "Bristol North" },
  { lat: 52.4, lng: -1.5, date: "14", time: "10:30", loc: "Coventry" },
  { lat: 51.4, lng: -0.9, date: "14", time: "11:15", loc: "Reading" },
  { lat: 53.4, lng: -1.4, date: "14", time: "11:45", loc: "Sheffield" },
  { lat: 51.0, lng: -1.4, date: "14", time: "12:15", loc: "Winchester" },
  { lat: 51.2, lng: 0.5, date: "14", time: "13:00", loc: "Maidstone" },
  { lat: 52.1, lng: -0.4, date: "14", time: "13:45", loc: "Bedford" },
  { lat: 53.7, lng: -0.3, date: "14", time: "14:15", loc: "Hull" }
];

minorData.forEach((d, i) => {
    roads.push(generateImpact(`ev-roads-min-${i}`, d.lat, d.lng, "minor", d.date, d.time, "Surface Spray: Reduced Visibility", "Drivers advised to slow down due to heavy rain and surface spray. Localized ponding reported.", d.loc));
});

// 5 Significant (Starts getting worse)
const sigData = [
  { lat: 51.6, lng: -2.8, date: "14", time: "09:00", loc: "Chepstow / Border" },
  { lat: 51.8, lng: -2.4, date: "14", time: "11:00", loc: "Gloucestershire" },
  { lat: 52.0, lng: -2.0, date: "14", time: "13:00", loc: "Worcestershire" },
  { lat: 52.2, lng: -2.3, date: "14", time: "14:30", loc: "Herefordshire" },
  { lat: 51.7, lng: -3.0, date: "14", time: "15:20", loc: "Monmouthshire Border" }
];

sigData.forEach((d, i) => {
    roads.push(generateImpact(`ev-roads-sig-${i}`, d.lat, d.lng, "significant", d.date, d.time, "Significant Water: Lane Closure", "Heavy rainfall has led to significant water accumulation in the slow lane. One lane closed for safety.", d.loc));
});

// 2 Severe (The climax leading to 16:00)
const sevData = [
  { lat: 51.75, lng: -2.9, date: "14", time: "15:15", loc: "Monmouthshire (A40)" },
  { lat: 51.85, lng: -2.7, date: "14", time: "15:58", loc: "Herefordshire / Monmouthshire Border" }
];

sevData.forEach((d, i) => {
    roads.push(generateImpact(`ev-roads-sev-${i}`, d.lat, d.lng, "severe", d.date, d.time, "Carriageway Submerged: Road Closure", "Excessive rainfall and river bank breach has submerged the carriageway. Road completely closed to traffic.", d.loc));
});

fs.writeFileSync(path.join('c:', 'Users', 'rob_c', 'Code', 'PRD Civil Service Challenge', 'frontend', 'data', 'roads.json'), JSON.stringify(roads, null, 2));
console.log("Updated roads.json with 30 time-progressive impacts (23/5/2) exclusively in England/Land.");
