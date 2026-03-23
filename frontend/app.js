/**
 * Impact Intelligence Platform - Frontend Logic
 */

// --- Configuration & Constants ---
const FIXED_NOW = new Date('2025-11-14T23:00:00Z');

function getFeatureName(p) {
    if (!p) return null;
    let name = p.PCON24NM || p.rgn19nm || p.rgn24nm || p.ctyua19nm || p.ctyua24nm || p.lad19nm || p.lad24nm ||
           p.name || p.NAME || p.Region || p.REGION || p.ctry19nm || p.ctry24nm;
    
    // Extract Westminster Constituency name from description table if available
    if (p.description && typeof p.description.value === 'string') {
        const match = p.description.value.match(/<tr><td>PCON24NM<\/td><td>(.*?)<\/td><\/tr>/i);
        if (match && match[1]) name = match[1].trim();
    }
    
    return name || null;
}

const BASEMAPS = {
    "Voyager": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    })
};

const CATEGORIES = {
    roads: { label: 'National Highways / Traffic Wales', color: '#446b82', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19L9 3h6l5 16"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="11" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="19"/></svg>' },
    railways: { label: 'Railway Marketplace', color: '#5b61a1', icon: '<img src="assets/logos/National_Rail_logo.svg.png" style="width:22px;height:22px;display:block;object-fit:contain;filter:brightness(0) invert(1);">' },
    social: { label: 'Social', color: '#9d174d', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    news: { label: 'Online News', color: '#8a4e6b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM6 6h12M6 10h12M6 14h6M6 18h6M16 14v4"/></svg>' },
    energy: { label: 'Power Companies', color: '#8a7d4e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
    water: { label: 'Water Companies', color: '#4e6b8a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' },
    'ea-help': { label: 'Environment Agency', color: '#00a651', icon: '<img src="assets/logos/EnvAgency.png" style="width:20px; height:20px; display:block; object-fit: contain;">' }
};

const SOCIAL_PLATFORM_ICONS = {
    'X (Twitter)': {
        label: 'X',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    },
    'Bluesky': {
        label: 'Bluesky',
        icon: '<svg viewBox="0 0 568 501" fill="currentColor"><path d="M123.121 33.664C188.241 82.553 258.287 181.67 284 234.873c25.713-53.203 95.759-152.32 160.879-201.209C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.889-129.52 80.454-149.07-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.66 0 75.293 0 57.947 0-28.906 76.134-1.611 123.121 33.664Z"/></svg>'
    },
    'Threads': {
        label: 'Threads',
        icon: '<svg viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"></path></svg>'
    },
};

const SOCIAL_SUB_SOURCE_MAP = {
    'x': 'X (Twitter)',
    'bluesky': 'Bluesky',
    'threads': 'Threads'
};

const IMPACT_TYPES = {
    roads: { label: 'Roads', categories: ['roads'], color: '#446b82', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19L9 3h6l5 16"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="11" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="19"/></svg>' },
    rail: { label: 'Rail', categories: ['railways'], color: '#5b61a1', icon: '<img src="assets/logos/National_Rail_logo.svg.png" style="width:22px;height:22px;display:block;object-fit:contain;filter:brightness(0) invert(1);">' },
    housing: { label: 'Homes and Businesses', categories: ['social', 'news', 'ea-help'], color: '#8a4e6b', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    energy: { label: 'Energy', categories: ['energy'], color: '#8a7d4e', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
    utilities: { label: 'Utilities', categories: ['water'], color: '#4e6b8a', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' }
};

const SEVERITIES = {
    minor: { label: 'Minor', color: '#bfdbfe' },
    significant: { label: 'Significant', color: '#2563eb' },
    severe: { label: 'Severe', color: '#1e3a8a' }
};

const PERSONAS = {
    '0800': [{ role: 'Flood Forecaster',           blurb: "Uses 'observed' impact intelligence to support decision to update forecast",                                    photo: 'photos/Flood_forecaster.jpg' }],
    '0830': [{ role: 'Fire and Rescue Controller', blurb: 'Uses forecast to make operational decisions on resources and equipment',                             photo: 'photos/Fire_rescue_controller.jpg' }],
    '0845': [{ role: 'Parliamentary Assistant',    blurb: 'Agent uses intelligence to create morning brief for Monmouth MP',                                   photo: 'photos/MP_assistant.jpg' }],
    '1100': [{ role: 'Flood Forecaster',           blurb: 'Focusses agentic search in key risk areas',                                                         photo: 'photos/Flood_forecaster.jpg' }],
    '1400': [
        { role: 'Flood Forecaster',           blurb: 'Utilises severity assessment to check and update forecast again',                                        photo: 'photos/Flood_forecaster.jpg' },
        { role: 'Fire and Rescue Controller', blurb: 'Deploys inflatable rescue boats to Monmouth to support evacuations',                                     photo: 'photos/Fire_rescue_controller.jpg' },
        { role: 'Parliamentary Assistant',    blurb: 'Clears the diary of Monmouth MP so that they can support constituents',                                  photo: 'photos/MP_assistant.jpg' }
    ],
    '2300': [{ role: 'Flood Forecaster', blurb: 'Saves impact information to learn for future floods and develop new ML forecasting techniques', photo: 'photos/Flood_forecaster.jpg' }]
};

const PERSONA_BENEFITS = {
    'Flood Forecaster': [
        'More accurate warnings incorporating situational intelligence',
        'Earlier warning, giving more time to take action'
    ],
    'Fire and Rescue Controller': [
        'Situational awareness insights drive better operational decisions',
        'Directly protects lives and livelihoods'
    ],
    'Parliamentary Assistant': [
        'MP better able to meet needs of constituents'
    ]
};

function renderPersonaCard(val) {
    const card = document.getElementById('persona-card');
    if (!card) return;
    // (persona items get min-height locked after render)
    const personas = PERSONAS[val];
    if (!personas) { card.innerHTML = ''; return; }
    card.innerHTML = personas.map((p, idx) => {
        const benefits = val === '1400' ? [] : (PERSONA_BENEFITS[p.role] || []);
        const toggleBtn = benefits.length ? `
            <button class="benefits-toggle" aria-label="Show benefits" data-persona-idx="${idx}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>` : '';
        const benefitsPanel = benefits.length ? `
            <div class="benefits-panel" id="benefits-panel-${idx}">
                <div class="benefits-list">
                    ${benefits.map(b => `<div class="benefit-item"><span class="benefit-tick">&#10003;</span><span class="benefit-text">${b}</span></div>`).join('')}
                </div>
            </div>` : '';
        return `
            <div class="persona-item">
                <div class="persona-item-top">
                    <img class="persona-photo" src="${p.photo}" alt="${p.role}">
                    <div class="persona-info">
                        <div class="persona-role">${p.role}</div>
                        <div class="persona-blurb">${p.blurb}</div>
                    </div>
                    ${toggleBtn}
                </div>
                ${benefitsPanel}
            </div>
        `;
    }).join('');

    // Attach toggle listeners
    card.querySelectorAll('.benefits-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = btn.dataset.personaIdx;
            const panel = document.getElementById('benefits-panel-' + idx);
            const isOpen = panel.classList.contains('open');
            // Close all first
            card.querySelectorAll('.benefits-panel').forEach(p => p.classList.remove('open'));
            card.querySelectorAll('.benefits-toggle').forEach(b => b.classList.remove('open'));
            if (!isOpen) {
                panel.classList.add('open');
                btn.classList.add('open');
                // Stagger the tick animations
                panel.querySelectorAll('.benefit-item').forEach((item, i) => {
                    item.style.animationDelay = (i * 0.3) + 's';
                    item.classList.remove('animate-in');
                    void item.offsetWidth;
                    item.classList.add('animate-in');
                });
            }
        });
    });
}

// Returns the impact TYPE (what sector is affected) regardless of which data source reported it
function getImpactType(imp) {
    // Explicit field in data takes priority
    if (imp.impactType) return imp.impactType;
    // Direct category → type mappings
    const catDefaults = { roads: 'roads', railways: 'rail', energy: 'energy', water: 'utilities', 'ea-help': 'housing' };
    if (catDefaults[imp.category]) return catDefaults[imp.category];
    // For social/news: infer from title + evidence text
    const text = ((imp.title || '') + ' ' + (imp.evidence || '')).toLowerCase();
    if (/\bm\d+\b|a\d{2,3}\b|b\d{3,4}\b|motorway|carriageway|road closure|traffic wales|national highways|highway|road flood/.test(text)) return 'roads';
    if (/\brail\b|railway|train|gwr|tfw|transport for wales|station/.test(text)) return 'rail';
    if (/\bpower\b|electric|energy|outage|grid/.test(text)) return 'energy';
    if (/water company|sewage|water supply|utilities/.test(text)) return 'utilities';
    return 'housing'; // default for community/residential flood impacts
}

// --- Agentic Alerting ---
const AlertState = {
    alerts: [],       // loaded from localStorage on init
    history: [],      // triggered alert log (session only, last 50)
    editingId: null   // id of alert being edited, or null for new
};
const SEVERITY_ORDER = { minor: 1, significant: 2, severe: 3 };

function loadAlerts() {
    try {
        const raw = localStorage.getItem('impact-alerts');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.alerts) AlertState.alerts = parsed.alerts;
        }
    } catch (e) {
        console.warn('loadAlerts: failed to parse localStorage', e);
    }
}

function saveAlerts() {
    try {
        localStorage.setItem('impact-alerts', JSON.stringify({ alerts: AlertState.alerts }));
    } catch (e) {
        console.warn('saveAlerts: failed', e);
    }
}

function parseAlertNL(text) {
    const t = text.toLowerCase();
    const result = {};

    // Severity
    if (/severe/.test(t)) result.minSeverity = 'severe';
    else if (/significant/.test(t)) result.minSeverity = 'significant';
    else result.minSeverity = 'minor';

    // AI mode
    result.aiMode = /(caution|model|judgement|judgment|clusters?)/.test(t);

    // Areas — find all matching counties and regions
    const matchedAreas = [];
    (State.countyNames || []).forEach(n => { if (t.includes(n.toLowerCase())) matchedAreas.push({ scope: 'county', name: n }); });
    (State.regionNames || []).forEach(n => { if (t.includes(n.toLowerCase())) matchedAreas.push({ scope: 'region', name: n }); });
    result.areas = matchedAreas.length ? matchedAreas : [];

    // Categories
    const cats = [];
    if (/road/.test(t)) cats.push('roads');
    if (/rail/.test(t)) cats.push('railways');
    if (/social/.test(t)) cats.push('social');
    if (/news/.test(t)) cats.push('news');
    if (/energy/.test(t)) cats.push('energy');
    if (/water/.test(t)) cats.push('water');
    if (/(ea|environment)/.test(t)) cats.push('ea-help');
    result.categories = cats.length ? cats : null;

    // Channels
    const channels = ['browser'];
    if (/teams/.test(t)) channels.push('teams');
    if (/(sms|text)/.test(t)) channels.push('sms');
    if (/email/.test(t)) channels.push('email');
    if (/(call|phone)/.test(t)) channels.push('phone');
    result.channels = channels;

    // Derived name
    const areaLabel = result.areas.length ? result.areas.map(a => a.name).join(', ') : 'Everywhere';
    const sevLabel = result.aiMode ? 'AI clustering' : (result.minSeverity.charAt(0).toUpperCase() + result.minSeverity.slice(1));
    result.name = `${sevLabel} — ${areaLabel}`;

    return result;
}

function impactMatchesOneArea(imp, areaScope, areaName) {
    if (areaScope === 'everywhere') return true;
    if (areaScope === 'county') {
        return (
            (imp.intersectingCounties && imp.intersectingCounties.includes(areaName)) ||
            (imp.locationName && imp.locationName.split('|')[1]?.trim() === areaName)
        );
    }
    if (areaScope === 'region') {
        return imp.locationName && imp.locationName.split('|')[0]?.trim() === areaName;
    }
    return false;
}

function impactWithinArea(imp, areas) {
    // areas: array of {scope, name} — impact matches if it matches any area
    if (!areas || areas.length === 0) return true;
    return areas.some(a => impactMatchesOneArea(imp, a.scope, a.name));
}

function buildAlertBody(config, impacts) {
    const area = (config.areas && config.areas.length) ? config.areas.map(a => a.name).join(', ') : 'everywhere';
    let body = `${impacts.length} new impact(s) in ${area}:\n`;
    impacts.slice(0, 5).forEach(i => {
        body += `\u2022 ${i.title} (${i.severity}) \u2014 ${i.source || i.category}\n`;
    });
    return body.trim();
}

function fireAlert(config, impacts) {
    // Record in history
    const entry = {
        alertName: config.name,
        timestamp: new Date().toISOString(),
        impacts: impacts.map(i => ({ id: i.id, title: i.title, severity: i.severity, category: i.category })),
        channels: config.channels
    };
    AlertState.history.push(entry);
    if (AlertState.history.length > 50) AlertState.history = AlertState.history.slice(-50);

    // Mark fired
    config.firedImpactIds.push(...impacts.map(i => i.id));
    config.lastTriggered = new Date().toISOString();

    // Browser notification
    if (config.channels.includes('browser') && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
            new Notification('\u26a0 Impact Alert', {
                body: buildAlertBody(config, impacts),
                icon: 'favicon.svg'
            });
        } catch (e) {
            console.warn('Notification failed', e);
        }
    }

    saveAlerts();
    renderAlertTab();
}

function evaluateAlerts() {
    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 3600000);
    const endCutoff   = new Date(now.getTime() - (48 - State.windowEnd)   * 3600000);
    const windowedImpacts = State.impacts.filter(i => i.timestamp >= startCutoff && i.timestamp <= endCutoff);

    AlertState.alerts.forEach(config => {
        if (!config.active) return;

        let candidates;
        if (config.aiMode) {
            // Clustering: any county with >=3 impacts OR >=1 severe
            const byCounty = {};
            windowedImpacts.forEach(i => {
                const county = i.locationName ? i.locationName.split('|')[1]?.trim() : null;
                if (!county) return;
                if (!byCounty[county]) byCounty[county] = [];
                byCounty[county].push(i);
            });
            candidates = [];
            Object.values(byCounty).forEach(group => {
                if (group.length >= 3 || group.some(i => i.severity === 'severe')) {
                    candidates.push(...group);
                }
            });
            candidates = candidates.filter(i => !config.firedImpactIds.includes(i.id));
        } else {
            candidates = windowedImpacts
                .filter(i => SEVERITY_ORDER[i.severity] >= SEVERITY_ORDER[config.minSeverity])
                .filter(i => !config.categories || config.categories.includes(i.category))
                .filter(i => impactWithinArea(i, config.areas))
                .filter(i => !config.firedImpactIds.includes(i.id));
        }

        if (candidates.length > 0) {
            fireAlert(config, candidates);
        }
    });
}

function refreshChannelDetails() {
    const activeChs = [...document.querySelectorAll('.alert-channel-btn.active')].map(b => b.dataset.ch);
    const detailEl = document.getElementById('alert-channel-details');
    if (!detailEl) return;
    const editing = AlertState.editingId ? AlertState.alerts.find(a => a.id === AlertState.editingId) : null;
    const inputs = activeChs.filter(c => c !== 'browser').map(ch => {
        const placeholders = { teams: 'Teams webhook URL', sms: '+44 7xxx xxxxxx', email: 'email@example.com', phone: '+44 7xxx xxxxxx' };
        const val = editing?.channelDetails?.[ch] || '';
        return `<input class="alert-channel-detail" data-ch-detail="${ch}" placeholder="${placeholders[ch]}" value="${val}">`;
    });
    detailEl.innerHTML = inputs.join('');
}

function saveAlertFromForm() {
    const nl = document.getElementById('alert-nl-input')?.value?.trim() || '';
    const activeSev = document.querySelector('.alert-sev-btn.active')?.dataset.sev || 'minor';
    const aiMode = document.getElementById('alert-ai-mode')?.checked || false;
    const areaChips = [...document.querySelectorAll('.alert-area-chip')].map(c => ({ scope: c.dataset.scope, name: c.dataset.name }));
    const activeCats = [...document.querySelectorAll('.alert-cat-btn.active')].map(b => b.dataset.cat);
    const activeChannels = [...document.querySelectorAll('.alert-channel-btn.active')].map(b => b.dataset.ch);
    const channelDetails = {};
    document.querySelectorAll('[data-ch-detail]').forEach(inp => { channelDetails[inp.dataset.chDetail] = inp.value.trim(); });

    const areaLabel = areaChips.length ? areaChips.map(a => a.name).join(', ') : 'Everywhere';
    const name = `${aiMode ? 'AI clustering' : (activeSev.charAt(0).toUpperCase() + activeSev.slice(1))} \u2014 ${areaLabel}`;

    if (AlertState.editingId) {
        const idx = AlertState.alerts.findIndex(a => a.id === AlertState.editingId);
        if (idx !== -1) {
            AlertState.alerts[idx] = {
                ...AlertState.alerts[idx],
                nlDescription: nl, name, minSeverity: activeSev, aiMode,
                areas: areaChips,
                categories: activeCats.length ? activeCats : null,
                channels: activeChannels, channelDetails,
                firedImpactIds: []  // reset on edit
            };
        }
        AlertState.editingId = null;
    } else {
        AlertState.alerts.push({
            id: `alert-${Date.now()}`, name, nlDescription: nl, active: true,
            minSeverity: activeSev, aiMode,
            areas: areaChips,
            categories: activeCats.length ? activeCats : null,
            channels: activeChannels.length ? activeChannels : ['browser'],
            channelDetails, firedImpactIds: [], lastTriggered: null,
            createdAt: new Date().toISOString()
        });
    }
    saveAlerts();
    renderAlertTab();

    if (activeChannels.includes('browser') && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function deleteAlert(id) {
    AlertState.alerts = AlertState.alerts.filter(a => a.id !== id);
    saveAlerts();
    renderAlertTab();
}

function toggleAlert(id) {
    const alert = AlertState.alerts.find(a => a.id === id);
    if (alert) alert.active = !alert.active;
    saveAlerts();
    renderAlertTab();
}

function editAlert(id) {
    AlertState.editingId = id;
    renderAlertTab();
}

function renderAlertTab() {
    const el = document.getElementById('tab-agentic-alerting');
    if (!el) return;

    // Build area options
    const countyOpts = (State.countyNames || []).slice().sort().map(n => `<option value="county||${n}">${n}</option>`).join('');
    const regionOpts = (State.regionNames || []).slice().sort().map(n => `<option value="region||${n}">${n}</option>`).join('');
    const areaOptions = `<option value="everywhere||everywhere">Everywhere</option><optgroup label="Counties">${countyOpts}</optgroup><optgroup label="Regions">${regionOpts}</optgroup>`;

    const editing = AlertState.editingId ? AlertState.alerts.find(a => a.id === AlertState.editingId) : null;

    // Alert list HTML
    const alertListHtml = AlertState.alerts.length === 0
        ? '<p class="alert-empty">No alerts configured yet.</p>'
        : AlertState.alerts.map(a => `
      <div class="alert-item" data-id="${a.id}">
        <div class="alert-item-header">
          <span class="alert-active-dot ${a.active ? 'on' : ''}"></span>
          <span class="alert-item-name">${a.name}</span>
          <div class="alert-item-actions">
            <button data-action="toggle" data-id="${a.id}">${a.active ? 'Pause' : 'Resume'}</button>
            <button data-action="edit" data-id="${a.id}">Edit</button>
            <button data-action="delete" data-id="${a.id}">Delete</button>
          </div>
        </div>
        <div class="alert-item-meta">
          ${a.aiMode ? '🤖 AI clustering' : `\u2265 ${a.minSeverity}`} \u00b7 ${(a.areas && a.areas.length) ? a.areas.map(x => x.name).join(', ') : 'Everywhere'} \u00b7 ${a.channels.join(', ')}
          ${a.lastTriggered ? `\u00b7 Last fired ${new Date(a.lastTriggered).toLocaleTimeString()}` : ''}
        </div>
      </div>
    `).join('');

    // History HTML (last 10)
    const histHtml = AlertState.history.length === 0
        ? '<p class="alert-empty">No alerts triggered yet.</p>'
        : AlertState.history.slice(-10).reverse().map(h => `
      <div class="alert-history-item">
        <span class="ah-time">${new Date(h.timestamp).toLocaleTimeString()}</span>
        <span class="ah-name"> \u2014 ${h.alertName}</span>
        <ul class="alert-history-impacts">
          ${h.impacts.slice(0, 3).map(i => `<li>${i.title} (${i.severity})</li>`).join('')}
          ${h.impacts.length > 3 ? `<li>+${h.impacts.length - 3} more</li>` : ''}
        </ul>
      </div>
    `).join('');

    const defaultNL = `I'm the on-call duty manager for Highways England covering Herefordshire, Monmouthshire, and Gloucestershire.\n\nAlert me by Teams message and browser notification if there are any significant or severe impacts to roads or rail in my area. Err on the side of caution \u2014 I'd rather have early warning than miss something developing. Use AI clustering to catch patterns across neighbouring areas.`;

    el.innerHTML = `
    <div style="padding: 4px 0 12px">
      <p class="alert-section-title">Describe what you need</p>
      <p class="alert-nl-hint">Tell the AI what you're responsible for, what matters to you, and how you'd like to be alerted. It will interpret your requirements and configure monitoring automatically.</p>
      <div class="alert-nl-row">
        <textarea class="alert-nl-input" id="alert-nl-input">${editing ? (editing.nlDescription || '') : defaultNL}</textarea>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px">
        <button class="alert-ai-btn" id="alert-ai-btn">
          <span class="alert-ai-btn-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v1a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-1H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg></span>
          Configure with AI
        </button>
        <span class="alert-ai-status" id="alert-ai-status"></span>
      </div>

      <div id="alert-ai-interpretation" class="alert-ai-interpretation" style="display:none"></div>

      <div class="alert-advanced">
        <div class="alert-advanced-toggle" id="alert-advanced-toggle">\u25b8 Fine-tune controls</div>
        <div class="alert-advanced-body" id="alert-advanced-body" style="display:none">

          <div>
            <div class="alert-field-label">Minimum severity</div>
            <div class="alert-severity-row">
              ${['minor','significant','severe'].map(s => `<button class="alert-sev-btn${(editing?.minSeverity || 'minor') === s ? ' active' : ''}" data-sev="${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</button>`).join('')}
            </div>
            <div class="alert-ai-row" style="margin-top:7px">
              <input type="checkbox" id="alert-ai-mode" ${editing?.aiMode ? 'checked' : ''}>
              <label for="alert-ai-mode">AI clustering mode (detect patterns, err on the side of caution)</label>
            </div>
          </div>

          <div>
            <div class="alert-field-label">Areas of interest <span style="font-weight:400;color:var(--text-secondary)">(add one or more; leave empty for everywhere)</span></div>
            <div class="alert-area-chips" id="alert-area-chips">
              ${(editing?.areas || []).map(a => `<span class="alert-area-chip" data-scope="${a.scope}" data-name="${a.name}">${a.name}<button class="alert-area-chip-remove" data-scope="${a.scope}" data-name="${a.name}">&times;</button></span>`).join('')}
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <select class="alert-area-select" id="alert-area-select">
                ${areaOptions}
              </select>
              <button class="alert-area-add-btn" id="alert-area-add-btn">+ Add</button>
            </div>
          </div>

          <div>
            <div class="alert-field-label">Sectors (click to toggle; none selected = all)</div>
            <div class="alert-cats" id="alert-cats">
              ${Object.entries(CATEGORIES).map(([k, v]) => `<button class="alert-cat-btn${editing?.categories?.includes(k) ? ' active' : ''}" data-cat="${k}">${v.label.split('/')[0].trim()}</button>`).join('')}
            </div>
          </div>

          <div>
            <div class="alert-field-label">Notification channels</div>
            <div class="alert-channels" id="alert-channels">
              ${['browser','teams','sms','email','phone'].map(ch => `<button class="alert-channel-btn${(editing ? editing.channels : ['browser']).includes(ch) ? ' active' : ''}" data-ch="${ch}">${ch.charAt(0).toUpperCase() + ch.slice(1)}</button>`).join('')}
            </div>
            <div id="alert-channel-details" style="margin-top:8px;display:flex;flex-direction:column;gap:5px"></div>
          </div>

        </div>
      </div>

      <div class="alert-form-actions">
        ${AlertState.editingId ? '<button class="alert-cancel-btn" id="alert-cancel-btn">Cancel</button>' : ''}
        <button class="alert-save-btn" id="alert-save-btn">${AlertState.editingId ? 'Update Alert' : 'Save Alert'}</button>
      </div>
    </div>

    <p class="alert-section-title">Active Alerts</p>
    <div class="alert-list">${alertListHtml}</div>

    <p class="alert-section-title">Recent Triggers</p>
    <div class="alert-history-list">${histHtml}</div>
  `;

    // Wire "Configure with AI" button
    const aiBtn = document.getElementById('alert-ai-btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            const nlText = document.getElementById('alert-nl-input')?.value || '';
            if (!nlText.trim()) return;
            const statusEl = document.getElementById('alert-ai-status');
            const interpEl = document.getElementById('alert-ai-interpretation');
            aiBtn.disabled = true;
            aiBtn.classList.add('processing');

            // Phase 1: "Interpreting..."
            if (statusEl) statusEl.innerHTML = '<span class="alert-ai-thinking">Interpreting your requirements\u2026</span>';

            setTimeout(() => {
                // Phase 2: "Configuring..."
                if (statusEl) statusEl.innerHTML = '<span class="alert-ai-thinking">Configuring alert parameters\u2026</span>';

                setTimeout(() => {
                    const parsed = parseAlertNL(nlText);

                    // Build interpretation summary
                    const areaLabel = (parsed.areas && parsed.areas.length) ? parsed.areas.map(a => a.name).join(', ') : 'all areas';
                    const sevLabel = parsed.aiMode ? 'AI-determined (err on caution)' : `${parsed.minSeverity} or above`;
                    const catLabel = parsed.categories ? parsed.categories.map(c => CATEGORIES[c]?.label?.split('/')[0]?.trim() || c).join(', ') : 'all sectors';
                    const chLabel = parsed.channels.join(', ');

                    if (interpEl) {
                        interpEl.style.display = 'block';
                        interpEl.innerHTML = `
                            <div class="ai-interp-header"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v1a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-1H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg> AI Interpretation</div>
                            <div class="ai-interp-body">
                                I\u2019ve configured monitoring for <strong>${catLabel}</strong> impacts in <strong>${areaLabel}</strong> at threshold <strong>${sevLabel}</strong>.
                                ${parsed.aiMode ? ' AI clustering is enabled \u2014 I\u2019ll watch for developing patterns across neighbouring areas and alert early if a situation appears to be building, even before individual thresholds are crossed.' : ''}
                                Notifications will be sent via <strong>${chLabel}</strong>.
                                <span class="ai-interp-adjust">You can fine-tune these settings below before saving.</span>
                            </div>
                        `;
                    }

                    if (statusEl) statusEl.innerHTML = '<span class="alert-ai-done">\u2713 Configuration ready</span>';
                    aiBtn.disabled = false;
                    aiBtn.classList.remove('processing');

                    // Open fine-tune controls and populate
                    const body = document.getElementById('alert-advanced-body');
                    const toggle = document.getElementById('alert-advanced-toggle');
                    if (body) body.style.display = 'flex';
                    if (toggle) toggle.textContent = '\u25be Fine-tune controls';

                    document.querySelectorAll('.alert-sev-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.sev === parsed.minSeverity);
                    });
                    const aiCb = document.getElementById('alert-ai-mode');
                    if (aiCb) aiCb.checked = parsed.aiMode;
                    // Populate area chips from parsed areas
                    const chips = document.getElementById('alert-area-chips');
                    if (chips && parsed.areas) {
                        chips.innerHTML = '';
                        parsed.areas.forEach(a => {
                            const chip = document.createElement('span');
                            chip.className = 'alert-area-chip';
                            chip.dataset.scope = a.scope;
                            chip.dataset.name = a.name;
                            chip.innerHTML = `${a.name}<button class="alert-area-chip-remove">&times;</button>`;
                            chip.querySelector('.alert-area-chip-remove').addEventListener('click', (e) => { e.stopPropagation(); chip.remove(); });
                            chips.appendChild(chip);
                        });
                    }
                    document.querySelectorAll('.alert-cat-btn').forEach(b => {
                        b.classList.toggle('active', parsed.categories ? parsed.categories.includes(b.dataset.cat) : false);
                    });
                    document.querySelectorAll('.alert-channel-btn').forEach(b => {
                        b.classList.toggle('active', parsed.channels.includes(b.dataset.ch));
                    });
                    refreshChannelDetails();
                }, 800);
            }, 1000);
        });
    }

    const advToggle = document.getElementById('alert-advanced-toggle');
    if (advToggle) {
        advToggle.addEventListener('click', () => {
            const body = document.getElementById('alert-advanced-body');
            if (!body) return;
            const open = body.style.display !== 'none';
            body.style.display = open ? 'none' : 'flex';
            advToggle.textContent = open ? '\u25b8 Advanced controls' : '\u25be Advanced controls';
        });
    }

    document.querySelectorAll('.alert-sev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.alert-sev-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Multi-area picker
    const addAreaBtn = document.getElementById('alert-area-add-btn');
    if (addAreaBtn) {
        addAreaBtn.addEventListener('click', () => {
            const sel = document.getElementById('alert-area-select');
            if (!sel) return;
            const [scope, name] = sel.value.split('||');
            if (scope === 'everywhere') return;
            const chips = document.getElementById('alert-area-chips');
            if (!chips) return;
            // Avoid duplicates
            if (chips.querySelector(`[data-scope="${scope}"][data-name="${name}"]`)) return;
            const chip = document.createElement('span');
            chip.className = 'alert-area-chip';
            chip.dataset.scope = scope;
            chip.dataset.name = name;
            chip.innerHTML = `${name}<button class="alert-area-chip-remove" data-scope="${scope}" data-name="${name}">&times;</button>`;
            chips.appendChild(chip);
            chip.querySelector('.alert-area-chip-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                chip.remove();
            });
        });
    }
    // Wire remove on pre-populated chips
    document.querySelectorAll('.alert-area-chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.closest('.alert-area-chip').remove();
        });
    });

    document.querySelectorAll('.alert-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });

    document.querySelectorAll('.alert-channel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            refreshChannelDetails();
        });
    });

    const saveBtn = document.getElementById('alert-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveAlertFromForm);

    const cancelBtn = document.getElementById('alert-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            AlertState.editingId = null;
            renderAlertTab();
        });
    }

    // Alert list action buttons
    document.querySelectorAll('.alert-item-actions button').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            if (action === 'toggle') toggleAlert(id);
            else if (action === 'edit') editAlert(id);
            else if (action === 'delete') deleteAlert(id);
        });
    });

    // Pre-select area value for editing
    if (editing) {
        const sel = document.getElementById('alert-area-select');
        if (sel) {
            const val = `${editing.areaScope}||${editing.areaName || 'everywhere'}`;
            if ([...sel.options].some(o => o.value === val)) sel.value = val;
        }
    }

    // Open advanced panel if editing
    if (editing) {
        const body = document.getElementById('alert-advanced-body');
        const toggle = document.getElementById('alert-advanced-toggle');
        if (body) body.style.display = 'flex';
        if (toggle) toggle.textContent = '\u25be Advanced controls';
    }

    refreshChannelDetails();
}

const PEXELS_PHOTOS = [
    'photos/pexels-connorscottmcmanus-13865772.jpg',
    'photos/pexels-dibakar-roy-2432543-26202087.jpg',
    'photos/pexels-dibakar-roy-2432543-26202093.jpg',
    'photos/pexels-juan-moccagatta-2159466094-36288963.jpg',
    'photos/pexels-juan-moccagatta-2159466094-36304326.jpg',
    'photos/pexels-kelly-19063417.jpg',
    'photos/pexels-kent-spencer-mendez-52733750-9137104.jpg',
    'photos/pexels-markus-winkler-1430818-3532526.jpg',
    'photos/pexels-sveta-k-75705601-8568719.jpg',
    'photos/pexels-tomfisk-6226996.jpg',
    'photos/pexels-valentin-ivantsov-2154772556-35249003.jpg'
];

/**
 * Generates an aggregate summary assessment for a region or county
 */
function generateSummaryAssessment(name, severity, count) {
    const confValue = 0.75 + Math.random() * 0.25;
    let confidenceLabel = 'High';
    let confidenceColor = '#4ade80';
    if (confValue < 0.85) {
        confidenceLabel = 'Medium';
        confidenceColor = '#facc15';
    }

    const sevDescs = {
        minor: "localised disruptions and minor infrastructure strain",
        significant: "widespread regional disruption and moderate pressure on assets",
        severe: "major structural failures and critical system-wide data indicators"
    };

    const now = new Date(FIXED_NOW);
    const st = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const et = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const vividSummary = count > 5 
        ? `widespread reports across ${name} including multiple streets with 10-20 properties flooded and critical road blockages`
        : `localized cluster of evidence in ${name} showing infrastructure stress and approximately 15 properties affected by surface water`;

    return {
        confidenceLabel,
        confidenceColor,
        justification: `Assessment of ${count} independent ${count === 1 ? 'impact' : 'impacts'} in ${name} aligns with a ${severity} classification. Evidence indicates ${sevDescs[severity]}.`,
        sourceReliability: 'Mixed / Corroborated',
        intelligenceType: 'Spatial Analysis',
        corroborated: true,
        startTiming: st.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTiming: "", // Left blank as requested
        synthesis: `The synthesized analysis for ${name} combines ${count} unique data points. Evidence includes ${vividSummary}. According to the impact framework, this correlates to a ${severity} level of impact.`,
        confidenceStatement: `This is a <strong>${confidenceLabel}</strong> confidence assessment. It is based on aggregated <strong>Mixed</strong> data sources using <strong>Spatial Analysis</strong>, which provides high-integrity corroboration for this regional cluster.`
    };
}

/// --- Data Fetching Engine (Mock generation moved to scripts/generate_data.js) ---

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

/// --- App State ---
const State = {
    map: null,
    regions: null,
    counties: null,
    fireLayer: null,
    constituencies: null,
    regionNames: [],
    countyNames: [],
    constituencyNames: [],
    impacts: [],
    markers: [],
    polygons: [],
    windowStart: 0, 
    windowEnd: 48,
    lastWindowDuration: 0,
    activeCategories: new Set(['roads', 'railways', 'social', 'news', 'energy', 'water', 'ea-help']),
    activeTypes: new Set(['roads', 'rail', 'housing', 'energy', 'utilities']),
    activeSeverities: new Set(['minor', 'significant', 'severe']),
    activeSocialPlatform: null,
    showSeverity: false,
    selectedImpact: null,
    isDraggingWindow: false,
    dragStartX: 0,
    dragStartLow: 0,
    spatialMode: 'county', // 'region', 'county', 'constituency' or null
    // Storage for spatial lookup
    rawRegions: null,
    rawCounties: null,
    rawConstituencies: null,
    viewMode: 'map', // 'map' or 'summary'
    summaryGroup: 'severity', // 'severity', 'source', 'category' (as Type)
    feedSort: 'recency',
    sidebarView: 'sources',
    // Agentic Search State
    searchMap: null,
    searchPoints: [],
    searchPolygon: null,
    searchLine: null,
    searchGhostLine: null,
    searchMarkers: [],
    searchMode: 'forecast',
    forecastData: null,
    forecastLayer: null,
    showForecast: false
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
function findIntersectingFeatures(polyCoords, geojson) {
    if (!geojson || !geojson.features) return [];
    const intersecting = [];
    
    const lngLatPoly = polyCoords.map(c => [c[1], c[0]]);
    
    geojson.features.forEach(feature => {
        const name = getFeatureName(feature.properties);
        const geom = feature.geometry;
        if (!geom || !geom.coordinates) return;

        let isIntersecting = false;

        const checkPart = (rings) => {
            // Check if any point of our outage polygon is inside this feature part
            for (let i = 0; i < lngLatPoly.length; i++) {
                if (isPointInPolygon(lngLatPoly[i], rings[0])) return true;
            }
            // Check if any point of the feature part is inside our outage polygon
            if (isPointInPolygon(rings[0][0], lngLatPoly)) return true;
            return false;
        };

        if (geom.type === 'Polygon') {
            if (checkPart(geom.coordinates)) isIntersecting = true;
        } else if (geom.type === 'MultiPolygon') {
            for (const part of geom.coordinates) {
                if (checkPart(part)) {
                    isIntersecting = true;
                    break;
                }
            }
        }

        if (isIntersecting && name) intersecting.push(name);
    });
    
    return [...new Set(intersecting)];
}

// --- Initialization ---
async function init() {
    State.map = L.map('map', { center: [52.8, -1.5], zoom: 7, zoomControl: false });
    
    // Basemaps
    BASEMAPS["Voyager"].addTo(State.map);
    
    // Fetch and Load GeoJSONs
    try {
        console.log("Starting data fetch...");
        const [regionsRes, countiesRes, constRes, fireRes] = await Promise.all([
            fetch('geo/uk-regions.geojson').then(r => r.json()),
            fetch('geo/uk-counties.geojson').then(r => r.json()),
            fetch('geo/westminister.json').then(r => r.json()),
            fetch('geo/uk-fire.json').then(r => r.json())
        ]);

        State.rawRegions = regionsRes;
        State.rawCounties = countiesRes;
        State.rawConstituencies = constRes;

        // Separate fetch for forecast to be more resilient
        try {
            const fRes = await fetch('data/warning_cords.json?v=' + Date.now());
            if (fRes.ok) {
                State.forecastData = await fRes.json();
                console.log("Forecast data loaded successfully from data/warning_cords.json:", State.forecastData);
            } else {
                console.warn("Forecast file data/warning_cords.json not found or error. Using fallback.");
                throw new Error("404");
            }
        } catch (e) {
            // Fallback hardcoded data if fetch fails
            State.forecastData = {
                "type": "FeatureCollection",
                "features": [
                    { "type": "Feature", "id": "outer", "properties": { "id": "outer", "name": "Outer Warning Area" }, "geometry": { "type": "Polygon", "coordinates": [[[-1.5, 51.5], [-0.5, 52.0], [0.5, 51.5], [-0.5, 51.0], [-1.5, 51.5]]] } },
                    { "type": "Feature", "id": "inner", "properties": { "id": "inner", "name": "Inner Warning Area" }, "geometry": { "type": "Polygon", "coordinates": [[[-1.0, 51.5], [-0.5, 51.8], [0.0, 51.5], [-0.5, 51.2], [-1.0, 51.5]]] } }
                ]
            };
        }

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
            
            const name = getFeatureName(feature.properties);
            
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
            style: { color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 },
            onEachFeature: (feature, layer) => {
                layer.on('click', onSpatialClick);
            }
        });

        State.constituencies = L.geoJSON(constRes, {
            style: { color: '#334155', weight: 1.5, opacity: 0.5, fillOpacity: 0.05 },
            onEachFeature: (feature, layer) => {
                layer.on('click', onSpatialClick);
            }
        });

        // South Wales Fire & Rescue boundary — shown at 0830 demo step
        State.fireLayer = L.geoJSON(fireRes, {
            style: {
                color: '#dc2626',
                weight: 4,
                opacity: 0.9,
                fillOpacity: 0,
                dashArray: null
            },
            pane: 'overlayPane'
        });

        // Store names for mock generation
        State.regionNames = regionsRes.features.map(f => getFeatureName(f.properties) || "UK Region");
        State.countyNames = countiesRes.features.map(f => getFeatureName(f.properties) || "County");
        State.constituencyNames = constRes.features.map(f => getFeatureName(f.properties) || "Constituency");

        // Add layers based on default state
        if (State.spatialMode === 'region') {
            State.regions.addTo(State.map);
        } else if (State.spatialMode === 'county') {
            State.counties.addTo(State.map);
        } else if (State.spatialMode === 'constituency') {
            State.constituencies.addTo(State.map);
        } else {
            if (document.getElementById('spatial-checkbox').checked) State.regions.addTo(State.map);
            if (document.getElementById('county-checkbox').checked) State.counties.addTo(State.map);
            if (document.getElementById('const-checkbox').checked) State.constituencies.addTo(State.map);
        }
        
        // Manual layer toggles (from custom overlay html)
        setupMapOverlays();
    } catch (err) {
        console.error("Error loading GeoJSON layers:", err);
    }

    L.control.zoom({ position: 'topright' }).addTo(State.map);

    // Fetch and Load Intelligence Data from Folder
    const dataSources = ['roads', 'railways', 'social', 'news', 'energy', 'water', 'ea-help'];
    try {
        const fetchResults = await Promise.all(
            dataSources.map(src => fetch(`data/${src}.json?v=${Date.now()}`).then(r => r.ok ? r.json() : []))
        );
        
        // Flatten, limit energy/water to 1 each, and thin minor/significant by 15%
        const rawImpactsFlat = fetchResults.flat();
        let eCount = 0;
        let wCount = 0;
        const rawImpacts = rawImpactsFlat.filter(imp => {
            if (imp.category === 'energy') return ++eCount <= 1;
            if (imp.category === 'water') return ++wCount <= 1;

            // Thin non-severe impacts by 15% (deterministic hash so results are stable across refreshes)
            if (imp.severity !== 'severe') {
                const key = imp.id || imp.title || '';
                let h = 0;
                for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
                return (Math.abs(h) % 100) >= 15;
            }
            return true;
        });

        State.impacts = rawImpacts.map(impact => {
            const enriched = { 
                ...impact, 
                timestamp: new Date(impact.timestamp) 
            };
            
            // Re-enrich with real spatial data from GeoJSON if it's a direct point-based impact
            if (impact.lat && impact.lng && !impact.isNational) {
                const county = findGeoAttribute([impact.lng, impact.lat], State.rawCounties);
                const region = findGeoAttribute([impact.lng, impact.lat], State.rawRegions);
                const constituency = findGeoAttribute([impact.lng, impact.lat], State.rawConstituencies);
                
                if (county || region || constituency) {
                    enriched.locationName = `${region || 'UK Region'} | ${county || 'Unknown County'} | ${constituency || 'Unknown Constituency'}`;
                }
            }

            // Assign photos to social impacts if missing
            if (impact.category === 'social' && !enriched.photo) {
                // Determine photo index based on timestamp or ID to keep it consistent
                const photoIdx = (enriched.id.charCodeAt(enriched.id.length - 1) || 0) % PEXELS_PHOTOS.length;
                enriched.photo = PEXELS_PHOTOS[photoIdx];
            }

            return enriched;
        });

        console.log(`Loaded ${State.impacts.length} impacts from ${dataSources.length} sources.`);
    } catch (err) {
        console.error("Error loading impact data:", err);
        State.impacts = [];
    }

    loadAlerts();
    evaluateAlerts();

    renderTimelineTicks();
    setupEvents();
    
    // Set default view to 00:00–08:00 on the snapshot day (Friday 14th)
    const nowObj = new Date(FIXED_NOW);
    const todayStart = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate());
    const eightAM    = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate(), 8, 0, 0);
    const hoursAgoMidnight = (nowObj - todayStart) / (1000 * 60 * 60);
    const hoursAgoEight    = (nowObj - eightAM)    / (1000 * 60 * 60);
    State.windowStart = 48 - hoursAgoMidnight;   // ~31 on the 48-h scale
    State.windowEnd   = 48 - hoursAgoEight;       // ~39 on the 48-h scale
    State.lastWindowDuration = State.windowEnd - State.windowStart;

    syncDualSlider();
    renderImpacts();
    updateStats();

    // Ensure forecast renders if toggled or on first load
    console.log("Init complete. Calling renderForecast...");
    renderForecast();

    // Show persona for default selected time period
    const defaultPreset = document.getElementById('demo-time-preset-select');
    if (defaultPreset) renderPersonaCard(defaultPreset.value);
}

function renderTimelineTicks() {
    const labelsCont = document.getElementById('timeline-tick-labels');
    labelsCont.innerHTML = '';
    const now = new Date(FIXED_NOW);
    
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

    // RHS — adjusts end point only (does NOT drag the whole window)
    sliderHigh.addEventListener('input', (e) => {
        let newEnd = parseFloat(e.target.value);
        if (newEnd < State.windowStart + 0.5) {
            newEnd = State.windowStart + 0.5;
            sliderHigh.value = newEnd;
        }
        State.windowEnd = newEnd;
        State.lastWindowDuration = State.windowEnd - State.windowStart;
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
    const constCheck = document.getElementById('const-checkbox');


    regionCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'region';
            countyCheck.checked = false;
            constCheck.checked = false;
            State.counties.removeFrom(State.map);
            State.constituencies.removeFrom(State.map);
            State.regions.addTo(State.map);
        } else {
            State.regions.removeFrom(State.map);
            if (State.spatialMode === 'region') State.spatialMode = null;
        }
        renderImpacts();
    });

    countyCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'county';
            regionCheck.checked = false;
            constCheck.checked = false;
            State.regions.removeFrom(State.map);
            State.constituencies.removeFrom(State.map);
            State.counties.addTo(State.map);
        } else {
            State.counties.removeFrom(State.map);
            if (State.spatialMode === 'county') State.spatialMode = null;
        }
        renderImpacts();
    });

    constCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            State.spatialMode = 'constituency';
            regionCheck.checked = false;
            countyCheck.checked = false;
            State.regions.removeFrom(State.map);
            State.counties.removeFrom(State.map);
            State.constituencies.addTo(State.map);
        } else {
            State.constituencies.removeFrom(State.map);
            if (State.spatialMode === 'constituency') State.spatialMode = null;
        }
        renderImpacts();
    });

    // Demo Time Preset Dropdown (top-left of map)
    document.getElementById('demo-time-preset-select').addEventListener('change', (e) => {
        const val = e.target.value;
        const now = new Date(FIXED_NOW);
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

        // Convert an absolute Date to a 0–48 slider position (clamped)
        function toPos(date) {
            return Math.min(48, Math.max(0, 48 - (now - date) / 3600000));
        }

        const start = toPos(todayStart); // midnight start — same for all presets
        let end;
        if      (val === '0800')    end = toPos(new Date(todayStart.getTime() + 8      * 3600000));
        else if (val === '0830')    end = toPos(new Date(todayStart.getTime() + 8.5   * 3600000));
        else if (val === '0845')    end = toPos(new Date(todayStart.getTime() + 8.75  * 3600000));
        else if (val === '1100')    end = toPos(new Date(todayStart.getTime() + 11    * 3600000));
        else if (val === '1400')    end = toPos(new Date(todayStart.getTime() + 14    * 3600000));
        else /* 2300 */             end = toPos(new Date(todayStart.getTime() + 23    * 3600000));

        State.windowStart = start;
        State.windowEnd = end;
        State.lastWindowDuration = end - start;
        document.getElementById('view-period-select').value = 'custom';
        syncDualSlider();
        renderImpacts();
        updateStats();
        evaluateAlerts();
        renderPersonaCard(val);

        // Show South Wales Fire & Rescue boundary at 0830 only
        if (State.fireLayer) {
            if (val === '0830') {
                if (!State.map.hasLayer(State.fireLayer)) State.fireLayer.addTo(State.map);
                State.fireLayer.bringToFront();
            } else {
                if (State.map.hasLayer(State.fireLayer)) State.map.removeLayer(State.fireLayer);
            }
        }

        // Collapse any open benefits panels on time change
        document.querySelectorAll('.benefits-panel.open').forEach(p => p.classList.remove('open'));
        document.querySelectorAll('.benefits-toggle.open').forEach(b => b.classList.remove('open'));

        // Pulse the card twice to signal the time change
        const card = document.getElementById('demo-time-preset');
        card.classList.remove('pulsing');
        void card.offsetWidth; // force reflow so animation restarts
        card.classList.add('pulsing');
        card.addEventListener('animationend', () => card.classList.remove('pulsing'), { once: true });
    });

    // Demo preset collapse/expand toggle
    document.getElementById('demo-preset-toggle').addEventListener('click', () => {
        const preset = document.getElementById('demo-time-preset');
        const btn = document.getElementById('demo-preset-toggle');
        preset.classList.toggle('collapsed');
        btn.innerHTML = preset.classList.contains('collapsed') ? '&#x25a1;' : '&minus;';
        btn.title = preset.classList.contains('collapsed') ? 'Expand demo control' : 'Minimize demo control';
    });

    // View Period Dropdown
    document.getElementById('view-period-select').addEventListener('change', (e) => {
        const val = e.target.value;
        const now = new Date(FIXED_NOW);
        
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

    const forecastCheckbox = document.getElementById('forecast-checkbox');
    if (forecastCheckbox) {
        forecastCheckbox.addEventListener('change', (e) => {
            State.showForecast = e.target.checked;
            renderForecast();
        });
    }

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
                State.activeSocialPlatform = null;
            } else if (subItem) {
                const parentGroup = subItem.closest('.nested-filter-group');
                const parentChip = parentGroup.querySelector('.filter-chip');
                const targetCat = parentChip.dataset.category;
                const subCat = subItem.dataset.subCategory;

                State.activeCategories.clear();
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                State.activeCategories.add(targetCat);
                parentChip.classList.add('active');

                // Set social platform filter if applicable
                State.activeSocialPlatform = (targetCat === 'social' && subCat && SOCIAL_SUB_SOURCE_MAP[subCat])
                    ? SOCIAL_SUB_SOURCE_MAP[subCat]
                    : null;

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
            const cb = chip.querySelector('input[type="checkbox"]');
            if (State.activeSeverities.has(severity)) {
                State.activeSeverities.delete(severity);
                chip.classList.remove('active');
                if (cb) cb.checked = false;
            } else {
                State.activeSeverities.add(severity);
                chip.classList.add('active');
                if (cb) cb.checked = true;
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

    // Social Sub-menu Toggle
    const socialToggle = document.getElementById('social-parent-toggle');
    const socialSubMenu = document.getElementById('social-sub-menu');
    if (socialToggle && socialSubMenu) {
        const icon = socialToggle.querySelector('.collapse-icon');
        if (icon) icon.style.transform = 'rotate(-90deg)';
        
        socialToggle.addEventListener('click', (e) => {
            socialSubMenu.classList.toggle('hidden');
            if (icon) {
                icon.style.transform = socialSubMenu.classList.contains('hidden') ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        });
    }

    // Feed Sort Downloader
    const feedSortSelect = document.getElementById('feed-sort-select');
    if (feedSortSelect) {
        feedSortSelect.addEventListener('change', (e) => {
            State.feedSort = e.target.value;
            renderImpacts();
            const feedCont = document.getElementById('feed-container');
            if (feedCont) feedCont.scrollTop = 0;
        });
    }

    // Date Picker Logic
    const datePicker = document.getElementById('timeline-date-picker');
    const fixedStr = FIXED_NOW.toISOString().split('T')[0];
    datePicker.value = fixedStr;
    datePicker.max = fixedStr;

    datePicker.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const now = new Date(FIXED_NOW);
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

    // Navbar Alerting button — open config modal directly on Agentic Alerting tab
    const navAlertingBtn = document.getElementById('nav-alerting-btn');
    if (navAlertingBtn) {
        navAlertingBtn.addEventListener('click', () => {
            configModal.classList.add('active');
            document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const alertTab = document.querySelector('.modal-tab[data-tab="agentic-alerting"]');
            const alertContent = document.getElementById('tab-agentic-alerting');
            if (alertTab) alertTab.classList.add('active');
            if (alertContent) alertContent.classList.add('active');
        });
    }

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
            // Reset to forecast mode on open
            State.searchMode = 'forecast';
            const forecastOpt = document.querySelector('.toggle-option[data-mode="forecast"]');
            if (forecastOpt) forecastOpt.click();
        });
    }

    // Agentic Search Toggle handler
    document.querySelectorAll('.toggle-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const mode = opt.dataset.mode;
            State.searchMode = mode;
            
            if (mode === 'user') {
                document.getElementById('location-input-group').classList.add('hidden');
                document.getElementById('map-polygon-group').classList.remove('hidden');
                setTimeout(initSearchMap, 100);
            } else {
                // Forecast Driven: no location input group needed per user request
                document.getElementById('location-input-group').classList.add('hidden');
                document.getElementById('map-polygon-group').classList.add('hidden');
            }
        });
    });

    const clearPolygonBtn = document.getElementById('clear-polygon-btn');
    if (clearPolygonBtn) {
        clearPolygonBtn.addEventListener('click', clearSearchPolygon);
    }

    if (closeDiveConfigBtn) closeDiveConfigBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));
    if (cancelDiveModalBtn) cancelDiveModalBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));
    
    const cancelBtn = document.querySelector('.btn-ghost');
    if (cancelBtn) cancelBtn.addEventListener('click', () => diveConfigModal.classList.remove('active'));

    if (startDiveBtn) {
        startDiveBtn.addEventListener('click', () => {
            let location = "";
            let polygonPoints = null;

            if (State.searchMode === 'user') {
                if (State.searchPoints.length < 3) {
                    alert("Please draw an area on the map with at least 3 points.");
                    return;
                }
                location = "User Defined Area";
                polygonPoints = [...State.searchPoints];
            } else {
                // Forecast driven - no manual location entry now
                location = "Active Forecast Region";
            }
            
            const selectedModules = Array.from(document.querySelectorAll('.agentic-source-card input:checked')).map(i => i.value);
            deployAgenticSearch(location, selectedModules, polygonPoints);
            diveConfigModal.classList.remove('active');
            const locationInput = document.getElementById('dive-location-input');
            if (locationInput) locationInput.value = '';
            clearSearchPolygon();
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
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const group = tab.dataset.tab;
            document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${group}`).classList.add('active');
        });
    });

    // MCP Modal Listeners
    const mcpModal = document.getElementById('mcp-modal');
    const openMcpBtn = document.getElementById('mcp-server-btn');
    const closeMcpBtn = document.getElementById('close-mcp-btn');

    const qrModal = document.getElementById('qr-modal');
    document.getElementById('qr-modal-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        qrModal?.classList.add('active');
    });
    document.getElementById('qr-modal-close')?.addEventListener('click', () => {
        qrModal?.classList.remove('active');
    });
    qrModal?.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.classList.remove('active');
    });

    if (openMcpBtn && mcpModal) {
        openMcpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mcpModal.classList.add('active');
        });
    }

    if (closeMcpBtn && mcpModal) {
        closeMcpBtn.addEventListener('click', () => {
            mcpModal.classList.remove('active');
        });
    }

    if (mcpModal) {
        mcpModal.addEventListener('click', (e) => {
            if (e.target === mcpModal) mcpModal.classList.remove('active');
        });
    }

    renderAlertTab();
}

function renderTypeFilters() {
    const list = document.getElementById('type-filter-list');
    if (!list) return;
    list.innerHTML = '';

    // Count impacts per type so we can show live counts
    const typeCounts = {};
    Object.keys(IMPACT_TYPES).forEach(k => { typeCounts[k] = 0; });
    State.impacts.filter(imp => {
        const ts = imp.timestamp;
        const now = new Date(FIXED_NOW);
        const start = new Date(now.getTime() - (48 - State.windowStart) * 3600000);
        const end   = new Date(now.getTime() - (48 - State.windowEnd)   * 3600000);
        return ts >= start && ts <= end && State.activeCategories.has(imp.category) && State.activeSeverities.has(imp.severity);
    }).forEach(imp => {
        const t = getImpactType(imp);
        if (t in typeCounts) typeCounts[t]++;
    });

    Object.entries(IMPACT_TYPES).forEach(([key, type]) => {
        const isActive = State.activeTypes.has(key);
        const count = typeCounts[key];

        const row = document.createElement('label');
        row.className = `filter-item-row filter-chip ${isActive ? 'active' : ''}`;
        row.dataset.type = key;

        row.innerHTML = `
            <div class="custom-checkbox ${isActive ? 'checked' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="item-label">${type.label}</span>
            ${count > 0 ? `<span class="filter-count">${count}</span>` : ''}
            <span class="only-trigger">Only</span>
        `;

        row.addEventListener('click', (e) => {
            e.preventDefault();
            if (State.activeTypes.has(key)) {
                State.activeTypes.delete(key);
            } else {
                State.activeTypes.add(key);
            }
            renderTypeFilters();
            renderImpacts();
            updateStats();
        });

        row.querySelector('.only-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            State.activeTypes.clear();
            State.activeTypes.add(key);
            renderTypeFilters();
            renderImpacts();
            updateStats();
        });

        list.appendChild(row);
    });

    const showAllTypes = document.getElementById('show-all-types');
    if (showAllTypes && !showAllTypes.dataset.listener) {
        showAllTypes.dataset.listener = "true";
        showAllTypes.addEventListener('click', () => {
            Object.keys(IMPACT_TYPES).forEach(k => State.activeTypes.add(k));
            renderTypeFilters();
            renderImpacts();
            updateStats();
        });
    }
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
    const now = new Date(FIXED_NOW);
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

    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);

    const filtered = State.impacts.filter(imp => {
        if (imp.timestamp < startCutoff || imp.timestamp > endCutoff) return false;
        if (!State.activeCategories.has(imp.category)) return false;
        if (!State.activeSeverities.has(imp.severity)) return false;
        if (!State.activeTypes.has(getImpactType(imp))) return false;
        if (imp.category === 'social' && State.activeSocialPlatform && imp.source !== State.activeSocialPlatform) return false;
        return true;
    });

    // Update Feed immediately
    renderFeed(filtered);

    // Filter for markers (don't show national impacts as single markers)
    const filteredForMarkers = filtered.filter(imp => !imp.isNational);

    const coordCounts = new Map();
    filteredForMarkers.forEach(imp => {
        const locations = imp.locations || (imp.lat != null && imp.lng != null ? [{ lat: imp.lat, lng: imp.lng }] : []);
        locations.forEach(loc => {
            if (loc.lat == null || loc.lng == null) return;
            const coordKey = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
            const count = coordCounts.get(coordKey) || 0;
            coordCounts.set(coordKey, count + 1);
            
            // Spiral jitter for overlapping markers - prevents overlapping icons without linear artifacts
            const angle = count * 137.5 * (Math.PI / 180); // Golden angle
            const distStep = 0.032; // Base separation (~2km+)
            const radius = count === 0 ? 0 : distStep * Math.sqrt(count);
            const lat = loc.lat + Math.sin(angle) * radius;
            const lng = loc.lng + (Math.cos(angle) * radius) / Math.cos(loc.lat * Math.PI / 180);

            const markerSvg = imp.category === 'social' && SOCIAL_PLATFORM_ICONS[imp.source]
                ? SOCIAL_PLATFORM_ICONS[imp.source].icon
                : CATEGORIES[imp.category].icon;
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-inner ${imp.category} ${imp.severity}">${markerSvg}</div>`,
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            });
            const marker = L.marker([lat, lng], { icon: markerIcon });
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

    // --- Spatial Summary Overlays ---
    // Update EACH layer if it is currently added to the map.
    
    if (State.regions && State.map.hasLayer(State.regions)) {
        // ALWAYS update regions. In constituency mode, updateSpatialSummary handles background styling.
        const ramp = (State.spatialMode === 'region' || State.spatialMode === 'constituency') ? 'severity' : 'trends';
        updateSpatialSummary(filtered, State.regions, State.rawRegions, ramp);
    }

    if (State.counties && State.map.hasLayer(State.counties)) {
        updateSpatialSummary(filtered, State.counties, State.rawCounties, 'severity');
    }
    
    if (State.constituencies && State.map.hasLayer(State.constituencies)) {
        updateSpatialSummary(filtered, State.constituencies, State.rawConstituencies, 'severity');
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

    // Ensure forecast is always on top if active
    renderForecast();
}

function updateSpatialSummary(filtered, leafletLayer, rawJson, ramp) {
    if (!rawJson || !leafletLayer) return;

    const ramps = {
        severity: {
            minor: '#bfdbfe',
            significant: '#2563eb',
            severe: '#1e3a8a'
        },
        trends: { 
            minor: '#fecaca', 
            significant: '#f87171', 
            severe: '#dc2626' 
        }
    };
    const colors = ramps[ramp] || ramps.severity;
    const weightMap = { severe: 3, significant: 2, minor: 1 };

    // 1. Pre-index impacts for faster lookup
    const index = new Map();

    for (const imp of filtered) {
        const areas = new Set();
        
        // Extract from locationName "Region | County | Constituency"
        const locParts = (imp.locationName || "").split('|').map(s => s.trim());
        if (leafletLayer === State.regions) {
            if (locParts[0]) areas.add(locParts[0]);
            if (imp.regionName) areas.add(imp.regionName);
        } else if (leafletLayer === State.counties) {
            if (locParts[1]) areas.add(locParts[1]);
            if (imp.intersectingCounties) imp.intersectingCounties.forEach(c => areas.add(c));
        } else if (leafletLayer === State.constituencies) {
            if (locParts[2]) areas.add(locParts[2]);
            if (imp.intersectingConstituencies) imp.intersectingConstituencies.forEach(c => areas.add(c));
        }

        const weight = weightMap[imp.severity] || 0;
        for (const area of areas) {
            const current = index.get(area) || { weight: 0, label: null };
            if (weight > current.weight) {
                index.set(area, { weight, label: imp.severity });
            }
        }
    }

    // 2. Apply to layer
    try {
        leafletLayer.eachLayer(layer => {
            const feature = layer.feature;
            const featureName = getFeatureName(feature.properties);
            let match = index.get(featureName);

            // 3. Optimized Spatial Fallback (only if no metadata match)
            if (!match) {
                const geom = feature.geometry;
                const featureBounds = (layer.getBounds && typeof layer.getBounds === 'function') ? layer.getBounds() : null;
                
                for (const imp of filtered) {
                    let isInside = false;
                    
                    // Check all locations (for widespread impacts / multiple markers)
                    const locsToCheck = imp.locations ? imp.locations : [{lat: imp.lat, lng: imp.lng}];
                    
                    for (const loc of locsToCheck) {
                        if (featureBounds && featureBounds.contains(L.latLng(loc.lat, loc.lng))) {
                            const pt = [loc.lng, loc.lat];
                            if (geom.type === 'Polygon') {
                                if (isPointInPolygon(pt, geom.coordinates[0])) { isInside = true; break; }
                            } else if (geom.type === 'MultiPolygon') {
                                for (const poly of geom.coordinates) {
                                    if (isPointInPolygon(pt, poly[0])) { isInside = true; break; }
                                }
                                if (isInside) break;
                            }
                        }
                    }

                    // Fallback for energy polygons (check if any vertex is inside)
                    if (!isInside && imp.outagePolygon && featureBounds) {
                         for (const v of imp.outagePolygon) {
                            if (featureBounds.contains(L.latLng(v[0], v[1]))) { 
                                const pt = [v[1], v[0]];
                                if (geom.type === 'Polygon') {
                                    if (isPointInPolygon(pt, geom.coordinates[0])) { isInside = true; break; }
                                } else if (geom.type === 'MultiPolygon') {
                                    for (const poly of geom.coordinates) {
                                        if (isPointInPolygon(pt, poly[0])) { isInside = true; break; }
                                    }
                                    if (isInside) break;
                                }
                            }
                         }
                    }

                    if (isInside) {
                        const weight = weightMap[imp.severity] || 0;
                        if (!match || weight > match.weight) {
                            match = { weight, label: imp.severity };
                        }
                    }
                }
            }

            if (match) {
                const isBackgroundRegion = (leafletLayer === State.regions && State.spatialMode === 'constituency');
                layer.setStyle({
                    fillColor: colors[match.label],
                    fillOpacity: isBackgroundRegion ? 0.15 : 0.5,
                    color: '#334155', // Default boundary color
                    weight: 1,
                    opacity: 0.3 // More subtle outline
                });
            } else {
                layer.setStyle({
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    color: '#334155',
                    weight: 1.5
                });
            }
        });
    } catch (err) {
        console.error("Spatial Summary Error:", err);
    }
}

function setupMapOverlays() {
    // Spatial Mode Toggles synchronization is no longer needed as layers button is removed
}

function renderFeed(filtered) {
    const feedCont = document.getElementById('feed-container');
    const feedCount = document.getElementById('feed-count');
    
    if (!feedCont || !feedCount) return;

    // We sort a copy to preserve original order for map markers
    const sorted = [...filtered].sort((a, b) => {
        if (State.feedSort === 'severity') {
            const w = { severe: 4, significant: 3, minor: 2 };
            const diff = (w[b.severity] || 0) - (w[a.severity] || 0);
            if (diff !== 0) return diff;
        } else if (State.feedSort === 'type') {
            const labelA = CATEGORIES[a.category]?.label || "";
            const labelB = CATEGORIES[b.category]?.label || "";
            if (labelA < labelB) return -1;
            if (labelA > labelB) return 1;
        }
        return b.timestamp - a.timestamp;
    });

    feedCount.innerText = sorted.length;
    feedCont.innerHTML = '';

    if (sorted.length === 0) {
        feedCont.innerHTML = '<div class="feed-empty">No impacts in the selected range.</div>';
        return;
    }

    sorted.forEach(imp => {
        const card = document.createElement('div');
        card.id = `card-${imp.id}`;
        let cardClasses = 'feed-card';
        if (State.selectedImpact?.id === imp.id) cardClasses += ' active';
        if (!imp.photo) cardClasses += ' no-photo';
        card.className = cardClasses;
        const catColor = (CATEGORIES[imp.category] || {}).color || '#6366f1';
        card.style.backgroundColor = catColor + '14'; // ~8% opacity pastel tint

        const timeStr = imp.timestamp.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
            ${imp.photo ? `<div class="feed-card-photo" style="background-image: url('${imp.photo}')"><img src="${imp.photo}" style="display:none" onerror="var p=this.parentElement;p.style.display='none';p.closest('.feed-card').classList.add('no-photo')"></div>` : ''}
            <div class="feed-card-body">
                <div class="feed-card-header-inner">
                    <div class="feed-card-meta-new">
                        <span class="feed-card-tag" style="background: ${CATEGORIES[imp.category].color}20; color: ${CATEGORIES[imp.category].color}; display:inline-flex; align-items:center; gap:4px">
                            ${imp.category === 'social' && SOCIAL_PLATFORM_ICONS[imp.source]
                                ? `<span style="width:12px;height:12px;display:inline-flex;flex-shrink:0">${SOCIAL_PLATFORM_ICONS[imp.source].icon}</span>`
                                : `<span style="width:14px;height:14px;display:inline-flex;flex-shrink:0;align-items:center;justify-content:center">${CATEGORIES[imp.category].icon}</span>`}
                            <span>${CATEGORIES[imp.category].label}</span>
                        </span>
                        <span class="feed-card-time">${timeStr}</span>
                    </div>
                </div>
                
                <h4 class="feed-card-title">${imp.headline || (imp.category === 'social' ? (imp.title || '').replace(/^\[.*?\]\s*/, '') : imp.title)}</h4>
                
                <div class="feed-card-source-row">
                    <a href="${imp.sourceUrl}" class="source-link-new" target="_blank" onclick="event.stopPropagation()">
                        ${imp.source}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                </div>

                <div class="feed-card-content-wrap">
                    <p class="feed-card-evidence">${imp.incidentTextHtml || imp.evidence}</p>
                </div>

                <div class="feed-card-stats-grid">
                    <div class="stat-row-inline">
                        <div class="stat-cell">
                            <span class="stat-cell-label">Severity</span>
                            <div class="stat-cell-value">
                                <span class="sev-rect-small" style="background: ${SEVERITIES[imp.severity].color}"></span>
                                <span class="sev-text-bold">${SEVERITIES[imp.severity].label}</span>
                            </div>
                        </div>
                        ${imp.assessment ? `
                        <span class="stat-sep"></span>
                        <div class="stat-cell">
                            <span class="stat-cell-label">Confidence</span>
                            <div class="stat-cell-value">
                                <span class="conf-dots" data-level="${imp.assessment.confidenceLabel.toLowerCase()}"><span></span><span></span><span></span></span>
                                <span class="conf-text">${imp.assessment.confidenceLabel}</span>
                                <button class="assessment-info-btn-new" data-impact-id="${imp.id}" onclick="event.stopPropagation(); showAssessmentModal('${imp.id}')" title="View assessment justification">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                </button>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="location-group">
                        <div class="loc-row">
                            <span class="loc-row-label">Region</span>
                            <div class="loc-row-chips">
                                <span class="loc-chip">${imp.locationName.split('|')[0]?.trim() || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="loc-row">
                            <span class="loc-row-label">County</span>
                            <div class="loc-row-chips">
                                ${imp.intersectingCounties && imp.intersectingCounties.length > 0
                                  ? imp.intersectingCounties.map(c => `<span class="loc-chip">${c}</span>`).join('')
                                  : `<span class="loc-chip">${imp.locationName.split('|')[1]?.trim() || 'N/A'}</span>`}
                            </div>
                        </div>
                        <div class="loc-row">
                            <span class="loc-row-label">Constituency</span>
                            <div class="loc-row-chips">
                                ${imp.intersectingConstituencies && imp.intersectingConstituencies.length > 0
                                  ? imp.intersectingConstituencies.map(c => `<span class="loc-chip">${c}</span>`).join('')
                                  : `<span class="loc-chip">${imp.locationName.split('|')[2]?.trim() || 'N/A'}</span>`}
                            </div>
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
    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);
    
    const filtered = State.impacts.filter(imp => {
        return imp.timestamp >= startCutoff &&
               imp.timestamp <= endCutoff &&
               State.activeCategories.has(imp.category) &&
               State.activeSeverities.has(imp.severity) &&
               State.activeTypes.has(getImpactType(imp));
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
        } else if (mode === 'constituency') {
            if (imp.intersectingConstituencies && imp.intersectingConstituencies.includes(areaName)) {
                isMatch = true;
            } else {
                const parts = imp.locationName.split('|');
                // Mock data puts constituency at parts[2]
                const cName = (parts[2] || parts[1] || parts[0]).trim();
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
    
    title.innerText = areaName;

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

    // Highlight marker(s)
    State.markers.forEach(m => {
        const icon = m.getElement();
        if (icon) {
            const inner = icon.querySelector('.marker-inner');
            if (m.impactId === imp.id) {
                icon.classList.add('marker-highlight');
                if (inner) inner.style.transform = 'scale(1.15)';
            } else {
                icon.classList.remove('marker-highlight');
                if (inner) inner.style.transform = '';
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
        const now = new Date(FIXED_NOW);
        const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
        const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);
        
        const filtered = State.impacts.filter(imp => {
            return imp.timestamp >= startCutoff &&
                   imp.timestamp <= endCutoff &&
                   State.activeCategories.has(imp.category) &&
                   State.activeSeverities.has(imp.severity) &&
                   State.activeTypes.has(getImpactType(imp));
        });
        renderFeed(filtered);

        // Scroll selected card to top of the RHS feed panel
        requestAnimationFrame(() => {
            const cardElement = document.getElementById(`card-${imp.id}`);
            const feedPanel = document.getElementById('feed-container');
            if (cardElement && feedPanel) {
                feedPanel.scrollTop += cardElement.getBoundingClientRect().top - feedPanel.getBoundingClientRect().top;
                cardElement.classList.add('card-flash');
                setTimeout(() => cardElement.classList.remove('card-flash'), 600);
            }
        });
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
// Helper to open config modal at specific tab
window.openConfigTab = function(tabId) {
    const configModal = document.getElementById('config-modal');
    if (configModal) {
        configModal.classList.add('active');
        document.querySelectorAll('.modal-tab').forEach(t => {
            if (t.dataset.tab === tabId) {
                t.click();
            }
        });
    }
    // Close assessment modal if open
    document.getElementById('assessment-modal').classList.remove('active');
};

function getSourceReliabilityNote(imp) {
    if (!imp) return null;
    const src = imp.source || '';
    const rel = imp.assessment?.sourceReliability || '';
    if (rel === 'Official' || ['ea-help', 'energy', 'water', 'railways'].includes(imp.category)) {
        return 'Official agency source — data from verified government or utility systems carries high inherent reliability.';
    }
    if (src.includes('Twitter') || src.includes('X (')) {
        return 'X (Twitter) posts are unverified social signals, generally treated as low confidence. Confidence increases significantly when the post originates from a verified official account such as National Rail, a highways authority, or an emergency service.';
    }
    if (src.includes('Bluesky')) {
        return 'Bluesky posts are unverified social signals. Confidence is low unless the account is a verified official body.';
    }
    if (src.includes('Threads')) {
        return 'Threads posts are unverified social signals. Confidence is low unless the account is a verified official body.';
    }
    if (imp.category === 'news') {
        return 'Online news provides situational context but may lag official sources. Cross-reference with agency data where available.';
    }
    if (imp.category === 'roads') {
        return 'Sourced from National Highways or Traffic Wales official systems — high reliability for road incident reporting.';
    }
    return null;
}

function showAssessmentModal(impactId) {
    let imp = State.impacts.find(i => i.id === impactId);
    let a;
    let titleHtml = '';

    if (imp) {
        a = imp.assessment;
        const cleanTitle = imp.headline || (imp.title || '').replace(/^\[.*?\]\s*/, '');
        const catColor = (CATEGORIES[imp.category] || {}).color || 'var(--clr-primary)';
        titleHtml = `
            <div class="assessed-record-box" style="background:${catColor}0d; border-bottom-color:${catColor}25">
                <div class="record-meta">
                    <span class="record-category" style="color:${catColor}">${CATEGORIES[imp.category].label}</span>
                    <span class="record-dot">•</span>
                    <span class="record-source">${imp.source}</span>
                </div>
                <h4 class="record-title">${cleanTitle}</h4>
                <a href="${imp.sourceUrl || '#'}" target="_blank" class="assess-source-link" onclick="event.stopPropagation()">View source ↗</a>
            </div>
        `;
    } else if (State.spatialAssessments && State.spatialAssessments[impactId]) {
        const spatial = State.spatialAssessments[impactId];
        a = spatial.assessment;
        imp = { severity: spatial.severity, category: 'proxy' };
        titleHtml = `
            <div class="assessed-record-box spatial">
                <div class="record-meta">
                    <span class="record-category" style="color:var(--clr-primary)">Spatial Analysis</span>
                    <span class="record-dot">•</span>
                    <span class="record-source">${a.impactCount} Impacts Combined</span>
                </div>
                <h4 class="record-title">${a.areaName}</h4>
            </div>
        `;
    }

    if (!a) return;

    const srcNote = getSourceReliabilityNote(imp);

    const modal = document.getElementById('assessment-modal');
    const body = document.getElementById('assessment-modal-body');

    body.innerHTML = `
        ${titleHtml}

        <div class="assess-body">

            <div class="stat-row-inline">
                <div class="stat-cell">
                    <span class="stat-cell-label">Severity</span>
                    <div class="stat-cell-value">
                        <span class="sev-rect-small" style="background:${SEVERITIES[imp.severity].color}"></span>
                        <span class="sev-text-bold">${SEVERITIES[imp.severity].label}</span>
                    </div>
                </div>
                <span class="stat-sep"></span>
                <div class="stat-cell">
                    <span class="stat-cell-label">Confidence</span>
                    <div class="stat-cell-value">
                        <span class="conf-dots" data-level="${(a.confidenceLabel || '').toLowerCase()}"><span></span><span></span><span></span></span>
                        <span class="conf-text">${a.confidenceLabel}</span>
                    </div>
                </div>
            </div>

            <div class="assess-section">
                <p class="assess-label">Severity assessment</p>
                <p class="assess-text">${a.synthesis}</p>
                <p class="assess-framework">Per the <a href="#" onclick="openConfigTab('impact-framework'); return false;" class="framework-link">Impact Framework</a>, this aligns with a <strong>${SEVERITIES[imp.severity].label}</strong> level of impact.</p>
            </div>

            <div class="assess-section">
                <p class="assess-label">Confidence & source reliability</p>
                ${srcNote ? `<p class="assess-source-note">${srcNote}</p>` : ''}
                <p class="assess-text">${a.confidenceStatement}</p>
                <p class="assess-text assess-text-muted">${a.justification}</p>
            </div>

            <div class="assess-timing">
                <div class="assess-timing-item">
                    <span class="assess-timing-label">Estimated start</span>
                    <span class="assess-timing-value">${a.startTiming || '--:--'}</span>
                </div>
                <div class="assess-timing-item">
                    <span class="assess-timing-label">Estimated end</span>
                    <span class="assess-timing-value">${a.endTiming || '--:--'}</span>
                </div>
            </div>

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

// --- Demo Intro Sequence ---
document.addEventListener('DOMContentLoaded', () => {
    const preset      = document.getElementById('demo-time-preset');
    const presetLeft  = preset.querySelector('.demo-time-preset-left');
    const personaCard = document.getElementById('persona-card');
    const benefitsExt = document.getElementById('benefits-extension');
    const toggleBtn   = document.getElementById('demo-preset-toggle');

    // Hide normal controls during intro
    [presetLeft, personaCard, benefitsExt, toggleBtn].forEach(el => { if (el) el.style.display = 'none'; });
    preset.classList.add('demo-intro-active');

    // Inject intro panel
    const introEl = document.createElement('div');
    introEl.id = 'demo-intro-content';
    introEl.innerHTML = `
        <div class="demo-intro-badge">Demo &middot; Synthetic data</div>
        <button class="demo-start-btn" id="demo-start-btn">
            Start demo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
    `;
    preset.appendChild(introEl);

    function showNormalControls() {
        document.getElementById('demo-intro-content')?.remove();
        preset.classList.remove('demo-intro-active');
        [presetLeft, personaCard, benefitsExt, toggleBtn].forEach(el => { if (el) el.style.display = ''; });
        const sel = document.getElementById('demo-time-preset-select');
        sel.value = '0800';
        sel.dispatchEvent(new Event('change'));
    }

    // Step 1 — map bounding box
    function step1() {
        const mapCont = document.getElementById('map-container');
        const ov = document.createElement('div');
        ov.className = 'demo-step-overlay demo-step-map';
        ov.innerHTML = `
            <div class="demo-map-label">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                Impacts shown on map, in real time
            </div>
            <div class="demo-click-hint">Click anywhere to continue &rarr;</div>
        `;
        mapCont.appendChild(ov);
        ov.addEventListener('click', () => { ov.classList.add('demo-fadeout'); setTimeout(() => { ov.remove(); step2(); }, 300); }, { once: true });
    }

    // Step 2 — highlight the Impact Sources section on the LHS
    function step2() {
        // Transparent click-catcher (no dim)
        const clickCatcher = document.createElement('div');
        clickCatcher.className = 'demo-click-catcher';
        document.body.appendChild(clickCatcher);

        const sourcesView = document.getElementById('sidebar-sources-view');
        sourcesView.classList.add('demo-spotlight');

        // Fixed-position label — placed to the right of the sources view
        const lbl = document.createElement('div');
        lbl.className = 'demo-glass-label';
        const svRect = sourcesView.getBoundingClientRect();
        lbl.style.position = 'fixed';
        lbl.style.left = (svRect.right + 16) + 'px';
        lbl.style.top  = (svRect.top + svRect.height / 2) + 'px';
        lbl.style.transform = 'translateY(-50%)';
        lbl.style.zIndex = '2003';
        lbl.innerHTML = `Multiple impact sources`;
        document.body.appendChild(lbl);

        const hint = document.createElement('div');
        hint.className = 'demo-click-hint demo-click-hint-fixed';
        hint.innerHTML = 'Click anywhere to continue &rarr;';
        document.body.appendChild(hint);

        clickCatcher.addEventListener('click', () => {
            clickCatcher.remove(); lbl.remove(); hint.remove();
            sourcesView.classList.remove('demo-spotlight');
            step3();
        }, { once: true });
    }

    // Step 3 — highlight a map marker + LLM pipeline animation
    function step3() {
        // Transparent click-catcher (no dim)
        const clickCatcher = document.createElement('div');
        clickCatcher.className = 'demo-click-catcher';
        document.body.appendChild(clickCatcher);

        // Find the Somerset marker (ev-social-12)
        const somersetMarker = State.markers.find(m => m.impactId === 'ev-social-12');
        let markerEl = null;
        if (somersetMarker) {
            markerEl = somersetMarker.getElement();
            if (markerEl) markerEl.classList.add('demo-marker-highlight');
        }

        // Pipeline panel — glassmorphic, positioned beneath Somerset marker
        const pipeline = document.createElement('div');
        pipeline.className = 'demo-pipeline-panel';
        pipeline.innerHTML = `
            <div class="pipeline-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Multimodal LLM pipeline with Agentic tasking
            </div>
            <div class="pipeline-steps">
                <div class="pipeline-step"><span class="pipeline-dot"></span>Check for relevancy</div>
                <div class="pipeline-step"><span class="pipeline-dot"></span>Geolocate</div>
                <div class="pipeline-step"><span class="pipeline-dot"></span>Run impact severity framework</div>
                <div class="pipeline-step"><span class="pipeline-dot"></span>Run confidence assessment framework</div>
            </div>
            <div class="pipeline-click-hint">Click anywhere to begin demo &rarr;</div>
        `;

        // Position beneath the Somerset marker on the map with pointer line
        pipeline.style.position = 'fixed';
        pipeline.style.width    = '420px';
        let connector = null;
        if (somersetMarker) {
            const pt = State.map.latLngToContainerPoint(somersetMarker.getLatLng());
            const mapCont = document.getElementById('map-container');
            const mapRect = mapCont.getBoundingClientRect();
            const markerX = mapRect.left + pt.x;
            const markerY = mapRect.top  + pt.y;
            const panelLeft = markerX - 210;
            const panelTop  = markerY + 60;
            pipeline.style.left = panelLeft + 'px';
            pipeline.style.top  = panelTop + 'px';

            // SVG connector line from marker to top of panel
            connector = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            connector.style.position = 'fixed';
            connector.style.left = '0';
            connector.style.top = '0';
            connector.style.width = '100vw';
            connector.style.height = '100vh';
            connector.style.pointerEvents = 'none';
            connector.style.zIndex = '2002';
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', markerX);
            line.setAttribute('y1', markerY + 37);
            line.setAttribute('x2', markerX);
            line.setAttribute('y2', panelTop);
            line.setAttribute('stroke', '#dc2626');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '6,4');
            connector.appendChild(line);
            document.body.appendChild(connector);
        } else {
            const mapCont = document.getElementById('map-container');
            const mapRect = mapCont.getBoundingClientRect();
            pipeline.style.left = (mapRect.left + mapRect.width / 2 - 210) + 'px';
            pipeline.style.top  = (mapRect.top  + mapRect.height / 2 - 120) + 'px';
        }
        document.body.appendChild(pipeline);

        // Animate steps in one by one
        pipeline.querySelectorAll('.pipeline-step').forEach((s, i) => {
            setTimeout(() => s.classList.add('visible'), 300 + i * 360);
        });

        clickCatcher.addEventListener('click', () => {
            clickCatcher.remove();
            pipeline.remove();
            if (connector) connector.remove();
            if (markerEl) markerEl.classList.remove('demo-marker-highlight');
            showNormalControls();
        }, { once: true });
    }

    document.getElementById('demo-start-btn').addEventListener('click', () => {
        introEl.style.opacity = '0';
        introEl.style.transition = 'opacity 0.2s';
        setTimeout(() => { introEl.remove(); step1(); }, 220);
    });
});

// --- Polygon Drawing Helpers ---
function initSearchMap() {
    if (State.searchMap) {
        setTimeout(() => State.searchMap.invalidateSize(), 150);
        return;
    }
    
    State.searchMap = L.map('search-area-map', {
        center: [52.8, -1.5],
        zoom: 6,
        zoomControl: false
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(State.searchMap);
    
    L.control.zoom({ position: 'bottomright' }).addTo(State.searchMap);
    
    State.searchMap.on('click', (e) => {
        const latlng = e.latlng;
        State.searchPoints.push([latlng.lat, latlng.lng]);
        
        const marker = L.circleMarker(latlng, {
            radius: 5,
            fillColor: "#4f46e5",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
            interactive: false
        }).addTo(State.searchMap);
        State.searchMarkers.push(marker);
        
        updateSearchPolygonUI();
    });

    State.searchMap.on('mousemove', (e) => {
        if (State.searchPoints.length > 0) {
            if (State.searchGhostLine) State.searchMap.removeLayer(State.searchGhostLine);
            const lastPoint = State.searchPoints[State.searchPoints.length - 1];
            State.searchGhostLine = L.polyline([lastPoint, e.latlng], {
                color: "#4f46e5",
                weight: 1,
                dashArray: "4, 8",
                opacity: 0.5
            }).addTo(State.searchMap);
        }
    });
}

function updateSearchPolygonUI() {
    if (State.searchPolygon) State.searchMap.removeLayer(State.searchPolygon);
    if (State.searchLine) State.searchMap.removeLayer(State.searchLine);
    
    // Draw sequential line as user clicks
    if (State.searchPoints.length > 1) {
        State.searchLine = L.polyline(State.searchPoints, {
            color: "#4f46e5",
            weight: 2,
            dashArray: "3, 6",
            opacity: 0.7
        }).addTo(State.searchMap);
    }
    
    // Closed polygon once we have 3 nodes
    if (State.searchPoints.length >= 3) {
        State.searchPolygon = L.polygon(State.searchPoints, {
            color: "#4f46e5",
            fillColor: "#4f46e5",
            fillOpacity: 0.2,
            weight: 2
        }).addTo(State.searchMap);
    }
}

function clearSearchPolygon() {
    if (State.searchPolygon) State.searchMap.removeLayer(State.searchPolygon);
    if (State.searchLine) State.searchMap.removeLayer(State.searchLine);
    if (State.searchGhostLine) State.searchMap.removeLayer(State.searchGhostLine);
    
    State.searchMarkers.forEach(m => State.searchMap.removeLayer(m));
    State.searchPoints = [];
    State.searchMarkers = [];
    State.searchPolygon = null;
    State.searchLine = null;
    State.searchGhostLine = null;
}

// --- Directed Search Deep Dive Logic V2 ---
State.deepDiveSessions = [];
State.activeDiveId = null;

function deployAgenticSearch(location, modules, polygonPoints = null) {
    const sessionId = 'dive-' + Date.now();
    const session = {
        id: sessionId,
        location: location,
        modules: modules,
        startTime: new Date(FIXED_NOW),
        progress: 0,
        logs: [],
        status: 'Active',
        marker: null,
        interval: null,
        polygon: polygonPoints,
        steps: generateStepsForModules(location, modules)
    };

    // Calculate center for marker displacement
    let center;
    if (polygonPoints && polygonPoints.length > 0) {
        let latSum = 0, lngSum = 0;
        polygonPoints.forEach(p => { latSum += p[0]; lngSum += p[1]; });
        center = { lat: latSum / polygonPoints.length, lng: lngSum / polygonPoints.length };
    } else {
        center = State.map.getCenter();
    }
    
    // Zoom map to the search area and flash polygon
    if (polygonPoints) {
        const bounds = L.latLngBounds(polygonPoints.map(p => L.latLng(p[0], p[1])));
        State.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });

        // Flash polygon on main map
        const flashPoly = L.polygon(polygonPoints, {
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '6, 4',
            className: 'search-flash-polygon'
        }).addTo(State.map);

        // Add label at polygon center
        const polyCenter = bounds.getCenter();
        const flashLabel = L.marker(polyCenter, {
            icon: L.divIcon({
                className: 'search-flash-label',
                html: '<div class="search-flash-label-inner">Enhanced search in this area</div>',
                iconSize: [240, 40],
                iconAnchor: [120, 20]
            }),
            pane: 'tooltipPane'  // sits above markerPane (z-index 650 vs 400)
        }).addTo(State.map);

        // Remove after 2 seconds with fade
        setTimeout(() => {
            flashPoly.getElement()?.classList.add('search-flash-fade');
            flashLabel.getElement()?.classList.add('search-flash-fade');
            setTimeout(() => {
                State.map.removeLayer(flashPoly);
                State.map.removeLayer(flashLabel);
            }, 500);
        }, 2000);
    }

    State.deepDiveSessions.push(session);
    updateActiveDivesUI();
    
    // UI Feedback on button
    const btn = document.getElementById('agentic-action-btn');
    if (btn) {
        btn.classList.add('searching');
        const textEl = btn.querySelector('.btn-text');
        if (textEl) textEl.innerText = "Agentic search in progress...";
    }

    // Start Processing
    startSessionProcessing(sessionId);
}

function generateStepsForModules(location, modules) {
    return [
        { type: 'INFO', msg: `Starting check in ${location}...` },
        { type: 'INFO', msg: 'Checking local sensor data.' },
        { type: 'INFO', msg: 'Getting status of roads and power.' },
        { type: 'INFO', msg: 'Looking for new reports on social media.' },
        { type: 'INFO', msg: 'Matching reports from different sources.' },
        { type: 'INFO', msg: 'Confirmed issues. Saving summary.' },
        { type: 'INFO', msg: 'Search complete. Data updated.' }
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

            // Reset UI Feedback on button
            const btn = document.getElementById('agentic-action-btn');
            if (btn) {
                btn.classList.remove('searching');
                const textEl = btn.querySelector('.btn-text');
                if (textEl) textEl.innerText = "Agentic Impact Search";
            }

            if (State.activeDiveId === id) refreshOverlayContent(session);
            return;
        }

        const step = session.steps[stepIndex];
        const now = new Date(FIXED_NOW);
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
    const now = new Date(FIXED_NOW);
    const startCutoff = new Date(now.getTime() - (48 - State.windowStart) * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - (48 - State.windowEnd) * 60 * 60 * 1000);

    const filtered = State.impacts.filter(imp => {
        return imp.timestamp >= startCutoff &&
               imp.timestamp <= endCutoff &&
               State.activeCategories.has(imp.category) &&
               State.activeSeverities.has(imp.severity) &&
               State.activeTypes.has(getImpactType(imp));
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
    const now = new Date(FIXED_NOW);
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
                    State.summaryGroup === 'source' ? imp.source : 
                    imp.severity;
        if (!groups[key]) groups[key] = [];
        groups[key].push(imp);
    });

    tbody.innerHTML = Object.entries(groups).map(([key, list]) => {
        const primaryImp = list[0];
        const groupLabel = State.summaryGroup === 'category' ? (CATEGORIES[key]?.label || key) : 
                           State.summaryGroup === 'severity' ? (SEVERITIES[key]?.label || key) : 
                           key; // Source uses the key itself as label (e.g. "National Highways")
        
        const confMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const confBackMap = { 3: 'High', 2: 'Medium', 1: 'Low' };
        const confValues = list.map(i => confMap[i.assessment.confidenceLabel] || 2);
        const avgConfVal = Math.round(confValues.reduce((a, b) => a + b, 0) / list.length);
        const finalConfidence = confBackMap[avgConfVal] || 'Medium';

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
                    <div class="summary-confidence-row">
                        <span class="conf-pill ${finalConfidence.toLowerCase()}">${finalConfidence}</span>
                    </div>
                </td>
                <td class="evidence-synthesis">
                    Aggregated intelligence report based on <strong>${primaryImp.source}</strong> and ${list.length - 1} auxiliary evidence clusters.
                    <div class="evidence-quote">${(primaryImp.evidence || "No description available").substring(0, 140)}...</div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderForecast() {
    if (State.forecastLayer) {
        State.map.removeLayer(State.forecastLayer);
        State.forecastLayer = null;
    }

    if (!State.showForecast || !State.forecastData) {
        return;
    }

    console.log("Rendering Forecast Overlays with aggressive visibility settings...");
    // Deep clone and smoothing for rounded appearance
    const smoothedData = JSON.parse(JSON.stringify(State.forecastData));
    smoothedData.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates = feature.geometry.coordinates.map(ring => {
                // Chaikin's Smoothing Algorithm for more rounded shapes
                if (ring.length < 3) return ring;
                let result = ring;
                for (let iter = 0; iter < 2; iter++) {
                    let nextRing = [];
                    for (let i = 0; i < result.length - 1; i++) {
                        let p1 = result[i];
                        let p2 = result[i+1];
                        nextRing.push([0.75 * p1[0] + 0.25 * p2[0], 0.75 * p1[1] + 0.25 * p2[1]]);
                        nextRing.push([0.25 * p1[0] + 0.75 * p2[0], 0.25 * p1[1] + 0.75 * p2[1]]);
                    }
                    nextRing.push(nextRing[0]); // Close ring
                    result = nextRing;
                }
                return result;
            });
        }
    });

    // Create a special pane for warnings if it doesn't exist to ensure they are on top
    if (!State.map.getPane('warnings')) {
        State.map.createPane('warnings');
        State.map.getPane('warnings').style.zIndex = 450; // Above tiles/regions (400) but below markers (600)
    }

    State.forecastLayer = L.geoJSON(smoothedData, {
        pane: 'warnings',
        style: (feature) => {
            const props = feature.properties || {};
            const val = (feature.id || props.id || props.type || props.severity || "").toString().toLowerCase();
            
            let color = '#FFFF00'; // Default Yellow (Outer)
            
            // Logic for inner/core vs outer
            if (val.includes('inner') || 
                val.includes('core') || 
                ['a', 'b', 'c'].includes(val) || 
                val.includes('amber') || 
                val.includes('significant')) {
                color = '#FFBF00'; // Amber
            } else if (val.includes('outer') || 
                       val === 'e' || 
                       val.includes('yellow') || 
                       val.includes('minor')) {
                color = '#FFFF00'; // Yellow
            }

            return {
                fillColor: color,
                fillOpacity: 0.04, // Even paler fill as requested
                color: color,
                weight: 9.5,       // Reduced from 12 as requested (20% less wide)
                opacity: 0.85,
                lineJoin: 'round',
                lineCap: 'round', 
                smoothFactor: 0.5,
                stroke: true,
                interactive: true  // Still interactive for the border
            };
        },
        onEachFeature: (feature, layer) => {
            // Setting individual path pointer-events to stroke so fill is transparent to clicks
            if (layer.getElement) {
                setTimeout(() => {
                    const el = layer.getElement();
                    if (el) el.style.pointerEvents = 'visibleStroke';
                }, 10);
            }
            const props = feature.properties || {};
            const name = props.name || "Warning Area";
            const impact = props.impact || "";
            layer.bindPopup(`<strong>${name}</strong><br>${impact}`);
        }
    }).addTo(State.map);

    if (State.forecastLayer) {
        State.forecastLayer.bringToFront();
    }
}

// Start App
window.addEventListener('load', () => {
    init();
    initViewSwitchers();
});
