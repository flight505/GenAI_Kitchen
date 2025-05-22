#!/usr/bin/env node

// Simple API route testing script
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test environment setup
let server;
const PORT = 3333;
const BASE_URL = `http://localhost:${PORT}`;
const TIMEOUT = 40000; // 40 seconds timeout for long operations

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test runner functions
async function startServer() {
  console.log(`${colors.blue}Starting test server on port ${PORT}...${colors.reset}`);
  try {
    // Use Next.js dev server with a specific port
    server = exec(`npx next dev -p ${PORT}`, { 
      env: { ...process.env },
      timeout: TIMEOUT
    });
    
    // Log server output for debugging
    server.stdout.on('data', (data) => console.log(`${colors.cyan}Server: ${data.trim()}${colors.reset}`));
    server.stderr.on('data', (data) => console.error(`${colors.red}Server Error: ${data.trim()}${colors.reset}`));
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`${colors.green}Server started successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to start server: ${error.message}${colors.reset}`);
    return false;
  }
}

async function stopServer() {
  if (server) {
    console.log(`${colors.blue}Stopping test server...${colors.reset}`);
    server.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`${colors.green}Server stopped${colors.reset}`);
  }
}

async function expectRequest(url, method = 'GET', body = null, expectStatus = 200) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`${colors.blue}Testing ${method} ${url}${colors.reset}`);
  
  try {
    const response = await fetch(url, options);
    const status = response.status;
    
    if (status === expectStatus) {
      console.log(`${colors.green}✓ Status: ${status} (Expected: ${expectStatus})${colors.reset}`);
      return { 
        pass: true, 
        response 
      };
    } else {
      console.error(`${colors.red}✗ Status: ${status} (Expected: ${expectStatus})${colors.reset}`);
      let responseText;
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = 'Could not read response body';
      }
      console.error(`${colors.red}Response: ${responseText}${colors.reset}`);
      return { 
        pass: false, 
        response,
        error: `Unexpected status: ${status}` 
      };
    }
  } catch (error) {
    console.error(`${colors.red}✗ Request failed: ${error.message}${colors.reset}`);
    return { 
      pass: false, 
      error: error.message 
    };
  }
}

// Test definitions
async function testHealthEndpoints() {
  console.log(`\n${colors.yellow}Testing Health Endpoints${colors.reset}`);
  
  // Test homepage
  const homeResult = await expectRequest(`${BASE_URL}/`);
  if (!homeResult.pass) return false;
  
  return true;
}

async function testGenerateEndpoint() {
  console.log(`\n${colors.yellow}Testing Generate API Endpoint${colors.reset}`);
  
  // Mock a kitchen image URL - using a placeholder for testing
  const mockImageUrl = 'https://replicate.delivery/placeholder/kitchen.jpg';
  
  const generateResult = await expectRequest(
    `${BASE_URL}/generate`, 
    'POST',
    {
      imageUrl: mockImageUrl,
      theme: 'Modern',
      room: 'Kitchen'
    },
    400 // Since this is a test, we expect a 400 because the image URL is fake
  );
  
  if (!generateResult.pass) return false;
  
  return true;
}

async function testInpaintEndpoint() {
  console.log(`\n${colors.yellow}Testing Inpaint API Endpoint${colors.reset}`);
  
  // Mock image and mask URLs
  const mockImageUrl = 'https://replicate.delivery/placeholder/kitchen.jpg';
  const mockMaskImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  
  const inpaintResult = await expectRequest(
    `${BASE_URL}/inpaint`, 
    'POST',
    {
      imageUrl: mockImageUrl,
      maskImage: mockMaskImage,
      prompt: 'Make the cabinets white'
    },
    400 // Since this is a test, we expect a 400 because the image URL is fake
  );
  
  if (!inpaintResult.pass) return false;
  
  return true;
}

async function testVariationEndpoint() {
  console.log(`\n${colors.yellow}Testing Variation API Endpoint${colors.reset}`);
  
  // Mock a kitchen image URL
  const mockImageUrl = 'https://replicate.delivery/placeholder/kitchen.jpg';
  
  const variationResult = await expectRequest(
    `${BASE_URL}/variation`, 
    'POST',
    {
      imageUrl: mockImageUrl,
      prompt: 'A modern kitchen'
    },
    400 // Since this is a test, we expect a 400 because the image URL is fake
  );
  
  if (!variationResult.pass) return false;
  
  return true;
}

// Main test runner
async function runTests() {
  console.log(`${colors.yellow}======== GenAI Kitchen API Tests ========${colors.reset}`);
  
  // Start server
  const serverStarted = await startServer();
  if (!serverStarted) {
    console.error(`${colors.red}Tests aborted: Could not start server${colors.reset}`);
    process.exit(1);
  }
  
  try {
    // Run tests
    const results = {
      health: await testHealthEndpoints(),
      generate: await testGenerateEndpoint(),
      inpaint: await testInpaintEndpoint(),
      variation: await testVariationEndpoint()
    };
    
    // Print summary
    console.log(`\n${colors.yellow}======== Test Summary ========${colors.reset}`);
    let failures = 0;
    
    for (const [test, result] of Object.entries(results)) {
      if (result) {
        console.log(`${colors.green}✓ ${test} tests passed${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${test} tests failed${colors.reset}`);
        failures++;
      }
    }
    
    if (failures === 0) {
      console.log(`\n${colors.green}All tests passed!${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${failures} test(s) failed!${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Test execution error: ${error.message}${colors.reset}`);
  } finally {
    // Stop server
    await stopServer();
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  if (server) {
    server.kill();
  }
  process.exit(1);
}); 