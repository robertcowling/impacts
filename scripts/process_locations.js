
const fs = require('fs');
const path = require('path');

// Basic point-in-polygon implementation
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

function findLocationAttributes(point, geojson) {
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

// Main execution
function processMockImpacts() {
    const regionsPath = path.join(__dirname, '../frontend/uk-regions.geojson');
    const countiesPath = path.join(__dirname, '../frontend/uk-counties.geojson');

    const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
    const counties = JSON.parse(fs.readFileSync(countiesPath, 'utf8'));

    // Example points
    const points = [
        { name: 'Cambridge', coord: [0.1218, 52.2053] },
        { name: 'London Central', coord: [-0.1278, 51.5074] },
        { name: 'Manchester', coord: [-2.2426, 53.4808] },
        { name: 'Fife (Scotland)', coord: [-3.17, 56.19] }
    ];
    
    console.log("--- Geographic Lookup Verification ---\n");
    points.forEach(p => {
        const rName = findLocationAttributes(p.coord, regions);
        const cName = findLocationAttributes(p.coord, counties);
        console.log(`${p.name}:`);
        console.log(`  Region: ${rName || "Not found"}`);
        console.log(`  County: ${cName || "Not found"}`);
        console.log("");
    });
    console.log("--------------------------------------");
}

processMockImpacts();
