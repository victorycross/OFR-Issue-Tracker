import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const APP_URL = 'http://localhost:5173';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await delay(1500);

  // ── 1. Login / Landing Screen ──
  console.log('1. Capturing login screen...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login_screen.png'), fullPage: false });

  // Click "Demo Mode" to enter the app
  console.log('   Clicking Demo Mode...');
  const demoBtn = page.locator('button', { hasText: /demo/i });
  if (await demoBtn.count() > 0) {
    await demoBtn.first().click();
    await delay(1500);
  } else {
    // If no demo button, the app may load directly (no MSAL configured)
    console.log('   No demo button found, app may be in direct mode');
  }

  // ── 2. Full Dashboard Overview ──
  console.log('2. Capturing full dashboard...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_dashboard_overview.png'), fullPage: true });

  // ── 3. KPI Cards (top section) ──
  console.log('3. Capturing KPI cards...');
  // Scroll to top first
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_kpi_cards.png'), fullPage: false });

  // ── 4. Intake Panel ──
  console.log('4. Capturing intake panel...');
  // Look for the intake section
  const intakeSection = page.locator('text=Active Issues').first();
  if (await intakeSection.count() > 0) {
    await intakeSection.scrollIntoViewIfNeeded();
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_intake_panel.png'), fullPage: false });
  } else {
    // Try alternate text
    const intakeAlt = page.locator('text=New Issue').first();
    if (await intakeAlt.count() > 0) {
      await intakeAlt.scrollIntoViewIfNeeded();
      await delay(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_intake_panel.png'), fullPage: false });
  }

  // ── 5. Risk Register Table ──
  console.log('5. Capturing risk register table...');
  const trackerTable = page.locator('table').first();
  if (await trackerTable.count() > 0) {
    await trackerTable.scrollIntoViewIfNeeded();
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_risk_register_table.png'), fullPage: false });
  } else {
    // Scroll down to find the table area
    await page.evaluate(() => window.scrollTo(0, 600));
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_risk_register_table.png'), fullPage: false });
  }

  // ── 6. Expand a row to show details ──
  console.log('6. Capturing expanded row...');
  const tableRow = page.locator('tr').nth(2); // First data row (after header)
  if (await tableRow.count() > 0) {
    await tableRow.click();
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_expanded_row.png'), fullPage: false });
  }

  // ── 7. Update Modal ──
  console.log('7. Capturing update modal...');
  // Look for an "Add Update" or "Update" button
  const updateBtn = page.locator('button', { hasText: /update/i }).first();
  if (await updateBtn.count() > 0) {
    await updateBtn.click();
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_update_modal.png'), fullPage: false });

    // Close the modal (press Escape or click close)
    await page.keyboard.press('Escape');
    await delay(500);
  }

  // ── 8. Filters ──
  console.log('8. Capturing filter options...');
  await page.evaluate(() => window.scrollTo(0, 400));
  await delay(300);
  // Look for filter/status buttons
  const filterBtns = page.locator('button', { hasText: /high|escalated|all/i });
  if (await filterBtns.count() > 0) {
    await filterBtns.first().scrollIntoViewIfNeeded();
    await delay(300);
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_filters_and_controls.png'), fullPage: false });

  // ── 9. CSV Export ──
  console.log('9. Capturing CSV export button...');
  const exportBtn = page.locator('button', { hasText: /export|csv/i }).first();
  if (await exportBtn.count() > 0) {
    await exportBtn.scrollIntoViewIfNeeded();
    await delay(300);
    // Hover to show tooltip/state
    await exportBtn.hover();
    await delay(300);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_csv_export.png'), fullPage: false });
  }

  // ── 10. French Language Toggle ──
  console.log('10. Capturing French language...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(300);
  const frBtn = page.locator('button', { hasText: /FR|Fran/i }).first();
  if (await frBtn.count() > 0) {
    await frBtn.click();
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_french_language.png'), fullPage: false });

    // Full page in French
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_french_full_page.png'), fullPage: true });

    // Switch back to English
    const enBtn = page.locator('button', { hasText: /EN|Eng/i }).first();
    if (await enBtn.count() > 0) {
      await enBtn.click();
      await delay(500);
    }
  }

  // ── 12. Staleness indicators close-up ──
  console.log('12. Capturing staleness indicators...');
  const staleCell = page.locator('text=/\\d+d/').first();
  if (await staleCell.count() > 0) {
    await staleCell.scrollIntoViewIfNeeded();
    await delay(300);
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_staleness_indicators.png'), fullPage: false });

  // ── 13. Connection status / header bar ──
  console.log('13. Capturing header with demo mode badge...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(300);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '13_header_demo_mode.png'),
    clip: { x: 0, y: 0, width: 1440, height: 120 }
  });

  await browser.close();
  console.log('\nDone! Screenshots saved to: ' + SCREENSHOTS_DIR);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
