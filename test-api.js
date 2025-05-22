#!/usr/bin/env node

// Test script to validate API endpoint functionality
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('Starting API endpoint tests...');

// Verify required environment variables for testing
const requiredEnvVars = ['REPLICATE_API_KEY'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables for testing: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Test 1: Direct Replicate API test to verify API key
async function testReplicateAPI() {
  console.log('\n🧪 Testing Replicate API connection:');
  try {
    const response = await fetch('https://api.replicate.com/v1/models', {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Replicate API connection successful');
      return true;
    } else {
      const data = await response.json();
      console.error(`❌ Replicate API connection failed: ${response.status} ${data.error || ''}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Replicate API connection error: ${error.message}`);
    return false;
  }
}

// Test 2: Verify Flux Canny Pro model exists and is accessible
async function testModelAccess() {
  console.log('\n🧪 Testing Flux Canny Pro model access:');
  try {
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-canny-pro', {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      console.log(`✅ Flux Canny Pro model is accessible: ${data.name || 'Unknown name'}`);
      
      // Get latest version
      if (data.latest_version) {
        console.log(`📋 Latest version: ${data.latest_version.id}`);
      }
      
      return true;
    } else {
      console.error(`❌ Flux Canny Pro model access failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Model access error: ${error.message}`);
    return false;
  }
}

// Test 3: Verify Flux Fill Pro model exists and is accessible
async function testInpaintModelAccess() {
  console.log('\n🧪 Testing Flux Fill Pro model access:');
  try {
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-fill-pro', {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      console.log(`✅ Flux Fill Pro model is accessible: ${data.name || 'Unknown name'}`);
      
      // Get latest version
      if (data.latest_version) {
        console.log(`📋 Latest version: ${data.latest_version.id}`);
      }
      
      return true;
    } else {
      console.error(`❌ Flux Fill Pro model access failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Model access error: ${error.message}`);
    return false;
  }
}

// Test 4: Verify Upstash Redis connection
async function testRedisConnection() {
  console.log('\n🧪 Testing Upstash Redis connection:');
  
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('⚠️ Skipping Redis test - credentials not found in environment');
    return false;
  }
  
  try {
    // Simple ping test
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/test-key`, {
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Upstash Redis connection successful');
      return true;
    } else {
      console.error(`❌ Upstash Redis connection failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Redis connection error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = {
    replicateAPI: await testReplicateAPI(),
    fluxCannyPro: await testModelAccess(),
    fluxFillPro: await testInpaintModelAccess(),
    redisConnection: await testRedisConnection()
  };
  
  console.log('\n📊 Test Results Summary:');
  
  let failedTests = 0;
  for (const [test, result] of Object.entries(results)) {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`);
    if (!result) failedTests++;
  }
  
  console.log('\nAPI tests completed.');
  
  if (failedTests > 0) {
    console.error(`\n❌ ${failedTests} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\n✅ All API tests passed!');
  }
}

runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
}); 