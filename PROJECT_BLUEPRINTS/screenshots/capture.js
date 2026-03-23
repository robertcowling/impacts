const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const screenshotDir = 'c:/Users/rob_c/Code/PRD Civil Service Challenge/PROJECT_BLUEPRINTS/screenshots';

    async function takeScreenshot(name) {
        console.log(`Taking screenshot: ${name}`);
        await page.screenshot({ path: path.join(screenshotDir, name) });
    }

    async function closeAllModals() {
        await page.evaluate(() => {
            const modals = [
                '#assessment-modal', 
                '#deep-dive-config-modal', 
                '#config-modal', 
                '#mcp-modal', 
                '#spatial-summary-modal'
            ];
            modals.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) el.classList.remove('active');
            });
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 1. Initial State (Step 0)
        await takeScreenshot('01_demo_step_0_intro.png');

        // 2. Demo Step 1 (Map Highlight)
        await page.evaluate(() => { document.querySelector('.demo-start-btn')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await takeScreenshot('02_demo_step_1_map.png');

        // 3. Demo Step 2 (Sources Highlight)
        await page.evaluate(() => { document.querySelector('.demo-step-overlay')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await takeScreenshot('03_demo_step_2_sources.png');

        // 4. Demo Step 3 (Pipeline)
        await page.evaluate(() => { document.querySelector('.demo-click-catcher')?.click() });
        await new Promise(resolve => setTimeout(resolve, 3000));
        await takeScreenshot('04_demo_step_3_pipeline.png');

        // CLEAR DEMO MODE
        await page.evaluate(() => { document.querySelector('.demo-click-catcher')?.click() });
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 5. Enter main app (08:00)
        await takeScreenshot('05_main_app_0800.png');

        // 6. 08:30 Persona (Fire & Rescue)
        await page.select('#demo-time-preset-select', '0830');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot('06_persona_0830_fire.png');

        // 7. Benefits Expanded
        await page.evaluate(() => { document.querySelector('.benefits-toggle')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('07_benefits_expanded.png');

        // 8. 11:00 Persona (Agentic Search focus)
        await page.select('#demo-time-preset-select', '1100');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot('08_persona_1100_search.png');

        // 9. Feed Detail
        await takeScreenshot('09_feed_sidebar_detail.png');

        // 10. Impact Selection
        await page.evaluate(() => { document.querySelector('.impact-card')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('10_impact_selected.png');

        // 11. Assessment Modal
        await page.evaluate(() => { document.querySelector('.assessment-btn')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('11_assessment_modal.png');
        await closeAllModals();

        // 12. Forecast Overlay
        await page.evaluate(() => { document.getElementById('forecast-checkbox')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('12_forecast_active.png');

        // 13. Summary View
        await page.evaluate(() => { document.querySelector('button[data-view="summary"]')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('13_summary_view.png');

        // 14. Back to Map
        await page.evaluate(() => { document.querySelector('button[data-view="map"]')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 15. Search Modal
        await page.evaluate(() => { document.getElementById('agentic-action-btn')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('14_search_modal.png');
        await closeAllModals();

        // 16. Alerting Config
        await page.evaluate(() => { document.getElementById('nav-alerting-btn')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('15_alerting_config.png');

        // 17. Framework Tab
        await page.evaluate(() => { Array.from(document.querySelectorAll('.modal-tab')).find(t => t.dataset.tab === 'impact-framework')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await takeScreenshot('16_impact_framework.png');
        await closeAllModals();

        // 18. Morning Brief
        await page.evaluate(() => { document.getElementById('mcp-server-btn')?.click() });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await takeScreenshot('17_mcp_morning_brief.png');
        await closeAllModals();

        // 19. Constituency Mode
        await page.evaluate(() => { document.getElementById('const-checkbox')?.click() });
        await new Promise(resolve => setTimeout(resolve, 2500));
        await takeScreenshot('18_constituency_mode.png');

        // 20. Spatial Summary (Click middle of map to select area)
        await page.mouse.click(800, 600); 
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot('19_constituency_summary_modal.png');
        await closeAllModals();

        // 21. Yesterday Timeline
        await page.select('#view-period-select', 'yesterday');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await takeScreenshot('20_timeline_yesterday.png');

    } catch (e) {
        console.error("Error during puppeteer operations", e);
    } finally {
        await browser.close();
    }
})();
