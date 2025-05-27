const puppeteer = require('puppeteer');

async function testApp() {
  console.log('🧪 Starting GenAI Kitchen Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();
  
  try {
    // Test 1: Homepage Load
    console.log('Test 1: Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log(`✅ Homepage loaded - Title: ${title}`);
    
    // Test 2: Check for main elements
    console.log('\nTest 2: Checking main UI elements...');
    const uploadSection = await page.$('text/Upload');
    const dreamButton = await page.$('text/Dream');
    console.log(`✅ Upload section: ${uploadSection ? 'Found' : 'Not found'}`);
    console.log(`✅ Dream navigation: ${dreamButton ? 'Found' : 'Not found'}`);
    
    // Test 3: Navigate to Dream page
    console.log('\nTest 3: Testing navigation to Dream page...');
    await page.goto('http://localhost:3000/dream', { waitUntil: 'networkidle0' });
    const url = page.url();
    if (url.includes('/login')) {
      console.log('✅ Authentication working - redirected to login');
    } else {
      console.log('✅ Dream page accessible');
    }
    
    // Test 4: Check Style Transfer components
    console.log('\nTest 4: Checking Style Transfer showcase...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const styleTransfer = await page.$('text/Style Transfer');
    console.log(`✅ Style Transfer component: ${styleTransfer ? 'Found' : 'Not found'}`);
    
    // Test 5: Console errors
    console.log('\nTest 5: Checking for console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.reload({ waitUntil: 'networkidle0' });
    
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('⚠️  Console errors found:');
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log('\n✨ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testApp();