# THE ENCYCLOPEDIC PRODUCT REQUIREMENTS DOCUMENT: IMPACT INTELLIGENCE PLATFORM (IIP)
## Version 11.0.0 "The Quantum Specification"
**Exhaustive Technical Blueprint for Pixel-Perfect Reconstruction and Operational Scaling**

---

## EXECUTIVE SUMMARY
This document provides the absolute ground-truth specifications for the Impact Intelligence Platform (IIP). It goes beyond conceptual design to dictate exact DOM structures, CSS property combinations, JavaScript state management, and algorithmic logic. No deviation from these specifications is permitted.

---

## 1. STRATEGIC INFRASTRUCTURE & DOM ARCHITECTURE

### 1.1 The Layout Matrix
The application utilizes an absolute-positioned geometry over a CSS Flexbox scaffold.
- **Root Container (`.app-container`)**: `display: flex`, `flex-direction: column`, `height: 100vh`, `overflow: hidden`.
- **Global Header (`.app-header`)**: Fixed height of `64px`, `z-index: 1000`, frosted glass effect (`backdrop-filter: blur(20px)`).
- **Workspace (`.workspace`)**: `flex: 1`, `display: flex`, `position: relative`.
- **Global Footer (`.app-footer`)**: Fixed height of `88px`, houses the Temporal Scrubber.

### 1.2 The Triple-Column Workspace
- **Left Panel (`#left-sidebar`)**: Width `280px`, absolute positioned to the left. Houses the Filter State Machine.
- **Center Canvas (`#map-container`)**: Absolute positioned, `inset: 0`, taking full width behind panels. Z-index `1`.
- **Right Panel (`#side-feed-panel`)**: Width `380px`, absolute positioned to the right. Houses the dynamic intelligence feed.

---

## 2. THE DESIGN SYSTEM: GLOBAL TOKEN REGISTRY

### 2.1 CSS Custom Properties (The Root Scope)
```css
:root {
    --bg-deep: #f8fafc;
    --bg-surface: #ffffff;
    --border-color: #e2e8f0;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --clr-primary: #0284c7;
    
    /* Semantic Category Colors */
    --clr-roads: #0284c7;
    --clr-railways: #6366f1;
    --clr-social: #06b6d4;
    --clr-news: #f472b6;
    --clr-energy: #eab308;
    --clr-water: #3b82f6;
    --clr-proxy: #64748b;
    --clr-trends: #ea4335;
    
    /* Severity Scale - High Contrast Blue Ramp */
    --sev-minor: #60a5fa;
    --sev-significant: #1d4ed8;
    --sev-severe: #081451;
    
    --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}
```

### 2.2 Typography Master Specs
- **Font Family**: 'Outfit', system-ui, sans-serif.
- **Base Size**: 14px (0.875rem).
- **Header 1**: 1.5rem, weight 700, letter-spacing -0.02em.
- **Micro-labels**: 0.65rem, weight 800, uppercase, letter-spacing 0.1em.

---

## 3. CORE LOGIC: THE GLOBAL STATE MACHINE

The entire application relies on a centralized `State` object in `app.js`.

### 3.1 State Schema
```javascript
const State = {
    map: null,                 // Leaflet Map Instance
    impacts: [],               // Array of raw impact data objects
    markers: [],               // Array of Leaflet marker instances
    
    // Temporal State
    windowStart: 42,           // Represents "hours ago" from now (e.g., 42 = 42h ago)
    windowEnd: 48,             // Represents "hours ago" from now (e.g., 48 = Now)
    lastWindowDuration: 6,     // Caches the duration to maintain window size during drags
    
    // Filter State
    activeCategories: new Set(['roads', 'railways', 'social', 'news', 'energy', 'water', 'proxy', 'google-trends']),
    activeSeverities: new Set(['minor', 'significant', 'severe']),
    
    // UX State
    viewMode: 'map',           // 'map' | 'summary'
    spatialMode: null,         // 'region' | 'county' | null
    selectedImpact: null,      // Currently focused impact object
    summaryGroup: 'category',  // Sorting logic for the National Summary
    
    // Scrubbing Interaction State
    isDraggingWindow: false,
    dragStartX: 0,
    dragStartLow: 0,
    
    // GeoJSON Caches
    regions: L.geoJSON(),
    counties: L.geoJSON(),
    rawRegions: null,
    rawCounties: null
};
```

---

## 4. FEATURE DEEP DIVE: THE DUAL-ACTION TEMPORAL SCRUBBER

This component is a highly specialized interface requiring pixel-perfect CSS and precise event handling. It allows users to define a "window" of time within a 48-hour period.

### 4.1 DOM Structure
```html
<div class="timeline-slider-area">
    <div class="slider-wrapper dual-range">
        <div class="range-slider">
            <span class="range-selected">
                <span class="range-grab" id="timeline-grab">
                    <span class="grab-line"></span><span class="grab-line"></span><span class="grab-line"></span>
                </span>
            </span>
        </div>
        <div class="range-input">
            <input type="range" id="timeline-low" min="0" max="48" value="36" step="0.5">
            <input type="range" id="timeline-high" min="0" max="48" value="48" step="0.5">
        </div>
        <div class="timeline-labels" id="timeline-tick-labels"></div>
    </div>
</div>
```

### 4.2 CSS Engineering for Dual Thumbs
The inputs must be absolutely positioned on top of each other, entirely transparent, with only the webkit/moz thumbs styled and pointer-events enabled.

#### Z-Index Stacking:
- `.range-slider` (Track Background): `z-index: 10`
- `.range-grab` (Center Handle): `z-index: 15`
- `.range-input input` (Invisible Inputs): `z-index: 20`
- `#timeline-low` (Start Thumb): `z-index: 21`
- `#timeline-high` (End Thumb): `z-index: 22`

#### Thumb Styling (Crucial for interaction):
```css
.range-input input {
    pointer-events: none;
    appearance: none;
    height: 0;
    top: 50%;
    transform: translateY(-50%);
}

.range-input input::-webkit-slider-thumb {
    pointer-events: auto;
    appearance: none;
}

#timeline-low::-webkit-slider-thumb {
    height: 24px;
    width: 8px;
    background: #64748b;
}

#timeline-high::-webkit-slider-thumb {
    height: 32px;
    width: 12px;
    background: var(--clr-primary);
}
```

### 4.3 JavaScript Interaction Handlers

#### 4.3.1 Primary RHS Thumb (End Time)
Moving the right thumb moves the *entire window* in tandem, maintaining the previously set duration.
```javascript
sliderHigh.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const duration = State.windowEnd - State.windowStart;
    State.windowEnd = val;
    State.windowStart = Math.max(0, val - duration);
    syncDualSlider();
});
```

#### 4.3.2 Secondary LHS Thumb (Start Time / Duration)
Moving the left thumb adjusts the *duration* of the window. It is physically bounded so it cannot cross the right thumb.
```javascript
sliderLow.addEventListener('input', (e) => {
    let newLow = parseFloat(e.target.value);
    if (newLow > State.windowEnd - 0.5) {
        newLow = State.windowEnd - 0.5; // Prevent overlap
        sliderLow.value = newLow;
    }
    State.windowStart = newLow;
    State.lastWindowDuration = State.windowEnd - newLow;
    syncDualSlider();
});
```

#### 4.3.3 The Window Grabber (Center Drag)
Allows dragging the highlighted area without touching the thumbs.
```javascript
grabHandle.addEventListener('mousedown', (e) => {
    State.isDraggingWindow = true;
    State.dragStartX = e.clientX;
    State.dragStartLow = State.windowStart;
});

document.addEventListener('mousemove', (e) => {
    if (!State.isDraggingWindow) return;
    const rect = sliderWrapper.getBoundingClientRect();
    const deltaX = e.clientX - State.dragStartX;
    const deltaHours = (deltaX / rect.width) * 48;
    
    let newLow = State.dragStartLow + deltaHours;
    let newHigh = newLow + State.lastWindowDuration;
    
    // Boundary enforcement
    if (newLow < 0) { newLow = 0; newHigh = State.lastWindowDuration; }
    if (newHigh > 48) { newHigh = 48; newLow = 48 - State.lastWindowDuration; }
    
    State.windowStart = newLow;
    State.windowEnd = newHigh;
    syncDualSlider();
});
```

### 4.4 Procedural Tick Generation
The `renderTimelineTicks()` function dynamically generates the scale below the slider.
- Loop from 0 to 48 (representing hours ago).
- `hoursAgo = 48 - i`.
- `tickDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)`.
- Apply classes based on logic:
  - If `tickDate.getHours() === 0`: Class `major`. Shows short date (e.g., "Fri 13"). Height: 9px.
  - If `tickDate.getHours() % 6 === 0`: Class `moderate`. Shows hour (e.g., "06:00"). Height: 7px.
  - Otherwise: Class `minor`. No text label. Height: 4px.

---

## 5. SPATIAL ENGINE & PROXY DATA

### 5.1 GeoJSON Polygon Intersection (Ray-Casting)
Because Leaflet plugins can be heavy, the platform uses a custom ray-casting algorithm to associate random mock coordinates with real UK regions/counties.

```javascript
function isPointInPolygon(point, polygon) {
    const [lng, lat] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
```

### 5.2 The "Google Trends" Unified Layer
Google Trends acts as a national proxy signal.
- **Iconography**: Uses a simple circular icon (`<circle cx="12" cy="12" r="8"/>`) in the proxy menu.
- **Visibility**: Overrides individual marker rendering.
- **Coloration**: It leverages the `updateSpatialSummary` function, passing a special `'trends'` ramp parameter.
- **Execution**: The entire `State.regions` GeoJSON layer is colored synchronously based on the highest severity Google Trends object found in the current time window, utilizing a custom red heatmap (`#fca5a5` to `#991b1b`).

---

## 6. THE INTELLIGENCE SYNTHESIS ENGINE (NATIONAL SUMMARY)

When the view toggles from 'map' to 'summary', the UI enters a high-fidelity reporting mode.

### 6.1 The "Civil Service Voice" Prompt Logic
The `generateNarrativeSummary` function evaluates the `filtered` impacts array and generates prose strictly adhering to professional intelligence standards.

**Logic Gates:**
1. Determine Top Region: Count impacts per `locationName`, sort descending.
2. Count Severe/Significant: Filter array.
3. If Severe > 0: Output "The situation is critical, with [X] severe incidents requiring immediate operational oversight, primarily affecting [Category] infrastructure."
4. If Significant > 0: Output "Situational awareness suggests a stabilizing but high-risk environment with [X] significant disruptions noted."
5. Append specific intelligence: Quote the title of the top severity impact. Name the data source (e.g., "Infrastructure Network", "Media Intelligence").

### 6.2 Recuttable Data Matrix
The bottom table groups the intelligence based on `State.summaryGroup` ('category', 'severity', or 'receptor').
- It calculates the average confidence score across all items in a cluster.
- It dynamically styles the "Key Level" pill based on the maximum severity found within that specific cluster.
- The `updateSummaryStats` function highlights the "Severe Impacts" stat with a `.critical` class (turning the text coral red) if the count is greater than zero.

---

## 7. MOCK DATA TOPOGRAPHY

Data must not spawn in the ocean. The `generateMockImpacts` function uses predefined hub coordinates strictly inland.

### 7.1 Inland Hub Constraints
```javascript
const hubs = [
    { lat: 51.5074, lng: -0.1278, name: 'London' },
    { lat: 52.4862, lng: -1.8904, name: 'Birmingham' },
    { lat: 53.4808, lng: -2.2426, name: 'Manchester' },
    { lat: 55.9533, lng: -3.1883, name: 'Edinburgh' },
    { lat: 51.4816, lng: -3.1791, name: 'Cardiff' },
    { lat: 50.8225, lng: -0.1372, name: 'Brighton' },
    { lat: 54.5973, lng: -5.9301, name: 'Belfast' },
    { lat: 52.6309, lng: 1.2974, name: 'Norwich' },
    { lat: 50.7184, lng: -3.5339, name: 'Exeter' },
    { lat: 53.8008, lng: -1.5491, name: 'Leeds' }
];
```
The randomizer applies a strict bounding box offset to ensure landmass collision:
`lat = hub.lat + (Math.random() - 0.5) * 0.6;`
`lng = hub.lng + (Math.random() - 0.5) * 0.6;`

### 7.2 Professional Taxonomy Enforcement
The source of data heavily influences the calculated "Confidence Score" in the `generateAssessment` logic.
- **National Highways / Network Rail**: 90-95 base score (Infrastructure Network).
- **BBC News**: 88 base score (Media Intelligence).
- **Twitter**: 55 base score (Social Monitoring).
- If multiple nearby events exist, a "Corroboration Bonus" (+20) is applied to the confidence score.

---

## 8. IMAGE SOURCING RULES

Mock impacts must use authentic, high-quality Pexels imagery specific to the UK/Europe.
- **Roads**: Submerged highways, traffic standstills (`1547833`, `3971985`).
- **Railways**: Flooded tracks, delayed stations (`1054391`, `1755106`).
- **News**: Professional broadcast setups (`3944454`, `210186`).
- **Energy**: Substation equipment, power lines (`1578277`, `236056`).
- No generic abstractions; imagery must convey severe disruption.

---
**END OF SPECIFICATION**
