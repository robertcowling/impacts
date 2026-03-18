const fs = require('fs');
const path = require('path');

const FIXED_NOW_DATE = '2025-11-14';

const rawHighways = [
  {
    title: "A46 northbound exit for M40 J15 | Northbound | Congestion",
    description: "Location : The A46 northbound exit slip to the M40 . Reason : Congestion. Status : Currently Active. Return To Normal : Normal traffic conditions are expected between 17:15 and 17:30 on 6 January 2025. ",
    road: "A46",
    region: "West Midlands",
    county: "Warwickshire",
    latitude: 52.259884,
    longitude: -1.6154898,
    category: "minor",
    guid: "GUID1-5196667"
  },
  {
    title: "A550 southbound between B5463 and A540 | Southbound | Congestion",
    description: "Location : The A550 southbound between the A41 and the junction with the A540 . Reason : Congestion. Status : Currently Active. Return To Normal : Normal traffic conditions are expected between 18:00 and 18:15 on 6 January 2025. Delay : There are currently delays of 15 minutes against expected traffic. ",
    road: "A550",
    region: "North West",
    county: "Cheshire West and Chester",
    latitude: 53.298298,
    longitude: -2.9570036,
    category: "minor",
    guid: "GUID1-5196588"
  },
  {
    title: "A628 eastbound between A6024 and A616 | Eastbound | Snow",
    description: "Location : The A628 eastbound between the A57 and the junction with the A616 . Reason : Snow. Status : Currently Active. Lanes Closed : All lanes are closed. ",
    road: "A628",
    region: "North East",
    county: "Barnsley District",
    latitude: 53.460907,
    longitude: -1.9960672,
    category: "severe",
    guid: "GUID1-5196389"
  },
  {
    title: "A66 westbound exit at a minor junction between A1027 and A1150 | Westbound | Flooding",
    description: "Location : The A66 westbound. Reason : Flooding. Status : Currently Active. Lanes Closed : All lanes are closed. ",
    road: "A66",
    region: "North East",
    county: "Stockton-on-Tees",
    latitude: 54.552532,
    longitude: -1.3632928,
    category: "severe",
    guid: "GUID1-5196253"
  },
  {
    title: "M25 anti-clockwise between J11 and J10 | Anti-Clockwise | Congestion",
    description: "Location : The M25 anticlockwise between junctions J11 and J10 . Reason : Congestion. Status : Currently Active. Return To Normal : Normal traffic conditions are expected between 17:45 and 18:00 on 6 January 2025. Delay : There are currently delays of 20 minutes against expected traffic. ",
    road: "M25",
    region: "South East",
    county: "Surrey",
    latitude: 51.344044,
    longitude: -0.485174,
    category: "significant",
    guid: "GUID1-5196616"
  },
  {
    title: "A46 southbound between A4177 and M40 | Southbound | Accident",
    description: "Location : The A46 southbound between the A4177 and the junction with the M40 . Reason : Road traffic collision. Status : Currently Active. Time To Clear : The event is expected to clear between 21:00 and 21:15 on 6 January 2025. Return To Normal : Normal traffic conditions are expected between 21:00 and 21:15 on 6 January 2025. Lanes Closed : All lanes are closed. ",
    road: "A46",
    region: "West Midlands",
    county: "Warwickshire",
    latitude: 52.287415,
    longitude: -1.6099731,
    category: "severe",
    guid: "GUID1-5195556"
  },
  {
    title: "A1 southbound between B6325 and A46 | Southbound | Congestion",
    description: "Location : The A1 southbound between the A6075 and the junction with the A46 . Reason : Congestion. Status : Currently Active. Return To Normal : Normal traffic conditions are expected between 17:30 and 17:45 on 6 January 2025. Delay : There are currently delays of 40 minutes against expected traffic. ",
    road: "A1",
    region: "East Midlands",
    county: "Nottinghamshire",
    latitude: 53.12399,
    longitude: -0.8157748,
    category: "significant",
    guid: "GUID1-5196618"
  },
  {
    title: "A1(M) northbound between J47 and J48 | Northbound | Accident",
    description: "Multiple vehicle collision has closed all northbound lanes. Heavy disruption expected.",
    road: "A1(M)",
    region: "Yorkshire",
    county: "North Yorkshire",
    latitude: 54.0205,
    longitude: -1.4132,
    category: "severe",
    guid: "GUID1-9999999"
  }
];

// Combine with some generated ones to fill 15
const allData = rawHighways.map((item, index) => {
    const timestamp = index < 4 ? `${FIXED_NOW_DATE}T08:00:00.000Z` : `${FIXED_NOW_DATE}T14:30:00.000Z`;
    return {
        id: `ev-roads-${index}`,
        lat: item.latitude,
        lng: item.longitude,
        category: "roads",
        severity: item.category,
        timestamp: timestamp,
        title: item.title,
        locationName: `${item.region} | ${item.county} | MP Constituency Placeholder`,
        evidence: item.description,
        source: "National Highways",
        sourceUrl: `http://www.trafficengland.com/?evtID=${item.guid.split('-')[1]}`,
        reference: item.guid,
        road: item.road,
        assessment: {
            confidenceLabel: "High",
            confidenceColor: "#4ade80",
            justification: "Confirmed National Highways data point. Coordinates verified.",
            sourceLabel: "National Highways",
            sourceReliability: "Official",
            intelligenceType: "Direct",
            corroborated: true,
            startTiming: timestamp.split('T')[1].substring(0, 5),
            endTiming: "",
            synthesis: "Official reporting from National Highways confirm these road impacts.",
            confidenceStatement: "This is a High confidence assessment based on official RSS feed."
        }
    }
});

fs.writeFileSync(path.join('c:', 'Users', 'rob_c', 'Code', 'PRD Civil Service Challenge', 'frontend', 'data', 'roads.json'), JSON.stringify(allData, null, 2));
console.log("Updated roads.json");
