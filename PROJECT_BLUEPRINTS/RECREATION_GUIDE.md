# THE ABSOLUTE RECONSTRUCTION GUIDE: IMPACT INTELLIGENCE PLATFORM (IIP)
## Version 1.0.0 "The Phoenix Protocol"
**Operational Manual for 100% Fidelity Reconstruction from Zero-State**

---

## 1. ARCHITECTURAL MANIFEST & FILE TREE

To recreate the IIP, the following directory structure must be established exactly:

```text
/
├── PROJECT_BLUEPRINTS/        # Strategic Documentation (This Folder)
├── backend/                   # Future Scalability (Currently Empty)
├── frontend/                  # The Active Application Root
│   ├── data/                  # Intelligence Data (JSON)
│   │   ├── ea-help.json
│   │   ├── energy.json
│   │   ├── google-trends.json
│   │   ├── news.json
│   │   ├── proxy.json
│   │   ├── railways.json
│   │   ├── roads.json
│   │   ├── social.json
│   │   └── water.json
│   ├── photos/                # Categorized UI Assets (Pexels)
│   ├── app.js                 # Central State & Logic
│   ├── index.html             # DOM Structure
│   ├── style.css              # Design System & Layout
│   ├── uk-counties.geojson    # Spatial Boundary Layer 1
│   ├── uk-regions.geojson     # Spatial Boundary Layer 2
│   └── westminister.json      # Spatial Boundary Layer 3 (2024)
└── scripts/                   # Data Generation & Processing
    ├── generate_data.js       # Mock Data Generator
    └── process_locations.js   # GeoJSON Attribute Extractor
```

---

## 2. DEPENDENCY STACK (ZERO-EXTERNAL-CONFIG)

The project is designed as a **Vanilla JS / Leaflet** SPA to ensure zero build-step overhead.

### 2.1 CDN Requirements (index.html)
- **Leaflet CSS/JS**: `v1.9.4`
- **Google Fonts**: `Outfit` (Weights 300, 400, 500, 600, 700)

### 2.2 Node.js (For Data Scripts)
- **Runtime**: Node.js `v18+` or `v20+`
- **Native Modules**: `fs`, `path`, `crypto`.

---

## 3. THE IMPLEMENTATION ROADMAP (10 STEPS)

### STEP 1: The Flexbox Scaffold
Establish the `.app-container` with `100vh`. Divide into the Triple-Column Workspace (`.workspace`) using absolute positioning for the side panels (`280px` left, `380px` right) and `inset: 0` for the map container.

### STEP 2: The Global State Object
Initialize `const State = {...}` in `app.js`. This MUST contain `windowStart`, `windowEnd`, `activeCategories` (Set), and `activeSeverities` (Set).

### STEP 3: Spatial Layer Injection
Load the three GeoJSON files using `fetch()`. Use `L.geoJSON()` with custom styling (dark navy borders, transparent fills). Implement the `getFeatureName()` helper to unify property keys across different GeoJSON sources (e.g., `PCON24NM` vs `rgn19nm`).

### STEP 4: The Dual-Slider Engineering
Implement the CSS for `.range-input input`. Stack two transparent range inputs. 
- **Z-Index**: RHS thumb must be higher than LHS.
- **Sync Logic**: RHS movement must maintain `lastWindowDuration` by shifting both `windowStart` and `windowEnd`.

### STEP 5: Data Fetching & Enrichment
Iterate through the `dataSources` array. Map raw timestamps to `Date` objects. Use the Ray-Casting algorithm (`isPointInPolygon`) to find the administrative area for every marker coordinate.

### STEP 6: The Marker Factory
Generate `L.divIcon` markers. Assign classes based on `impact.category` and `impact.severity`. Store markers in `State.markers` for easy cleanup during state-sync renders.

### STEP 7: Spatial Aggregation (Chloropleth)
On every `renderImpacts()` call, iterate through the GeoJSON features and count/weigh the impacts contained within their boundaries. Update the polygon `fillColor` based on the highest severity found.

### STEP 8: Intelligence Feed Rendering
Generate the RHS cards. Use template literals for the HTML. Implement `selectImpact(imp)` to handle map-panning, marker-highlighting, and smooth-scrolling the feed into view.

### STEP 9: The Agentic Search Simulation
Implement the `deployAgenticSearch` function. Use `setInterval` to push log messages into the `#deep-dive-status` overlay. Update the progress bar width dynamically.

### STEP 10: Validation & Testing
Run the `ULTRA_DETAILED_PRD` test cases. Ensure that toggling a category filter immediately updates the Map, the Feed, and the National Summary stats.

---

## 4. DATA GENERATION RULES (FOR AGENTS)

If recreating the data, the `generate_data.js` script must:
1.  **Hub-Based Spawning**: Use the 10 UK "Inland Hubs" (London, Birmingham, Manchester, etc.).
2.  **Landmass Enforcement**: Apply a `+/- 0.6` degree jitter to hub coordinates to ensure markers stay within UK land boundaries.
3.  **Severity Distribution**: 60% Minor, 30% Significant, 10% Severe.
4.  **Temporal Spread**: Scatter events across a sliding 48-hour window from the constant `FIXED_NOW` anchor.

---
**RECREATION PROTOCOL COMPLETE.**
**IIP VERSION 12.0.0 READY FOR RECONSTRUCTION.**
