const puppeteer = require('puppeteer');

async function testDreamPage() {
  console.log('Opening /dream page to check console logs and network requests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true 
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });
  
  // Listen to request errors
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]', request.url(), request.failure().errorText);
  });
  
  // Track network requests
  const requests = [];
  page.on('request', request => {
    const url = request.url();
    if (!url.includes('_next/static') && !url.includes('favicon')) {
      console.log('[REQUEST]', request.method(), url);
      requests.push({
        method: request.method(),
        url: url,
        type: request.resourceType()
      });
    }
  });
  
  // Track network responses
  page.on('response', response => {
    const url = response.url();
    if (!url.includes('_next/static') && !url.includes('favicon')) {
      console.log('[RESPONSE]', response.status(), url);
    }
  });
  
  try {
    // Go to the dream page
    await page.goto('http://localhost:3002/dream', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('\n--- Page loaded successfully ---\n');
    
    // Wait a bit to catch any delayed logs
    await page.waitForTimeout(3000);
    
    // Check for any React errors
    const reactErrors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[data-reactroot] > div > div[style*="background-color: rgb(255, 255, 255)"]');
      return Array.from(errorElements).map(el => el.textContent);
    });
    
    if (reactErrors.length > 0) {
      console.log('\n[REACT ERRORS FOUND]:', reactErrors);
    }
    
    // Summary
    console.log('\n--- Summary ---');
    console.log(`Total requests made: ${requests.length}`);
    console.log('\nAPI Requests:');
    requests
      .filter(r => r.url.includes('/api/'))
      .forEach(r => console.log(`  - ${r.method} ${r.url}`));
    
  } catch (error) {
    console.error('[ERROR]', error.message);
  }
  
  // Keep browser open for manual inspection
  console.log('\n\nBrowser will stay open. Press Ctrl+C to close.');
}

testDreamPage().catch(console.error);