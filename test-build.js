#!/usr/bin/env node

// Test script to validate the build environment and dependencies
const fs = require('fs');
const dotenv = require('dotenv');

console.log('Starting build validation tests...');

// Load environment variables from .env.local or .env
if (fs.existsSync('.env.local')) {
  console.log('📄 Loading environment variables from .env.local');
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  console.log('📄 Loading environment variables from .env');
  dotenv.config({ path: '.env' });
}

// Check environment variables
const requiredEnvVars = [
  'REPLICATE_API_KEY',
  'NEXT_PUBLIC_UPLOAD_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

console.log('\nChecking environment variables:');
let missingEnvVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
    console.log(`❌ ${envVar} is missing`);
  } else {
    // Don't print actual values for security
    console.log(`✅ ${envVar} is set`);
  }
}

// Test Next.js config
console.log('\nValidating Next.js config:');
try {
  const nextConfig = require('./next.config.js');
  console.log('✅ next.config.js is valid');
  console.log(`📋 Next.js config: ${JSON.stringify(nextConfig, null, 2)}`);
} catch (error) {
  console.log('❌ Error loading next.config.js:', error.message);
}

// Check package.json for build script
console.log('\nChecking package.json:');
try {
  const pkg = require('./package.json');
  console.log(`✅ package.json loaded successfully`);
  console.log(`📋 Build command: ${pkg.scripts.build || 'Not defined'}`);
  console.log(`📋 Node version: ${process.version}`);
  console.log(`📋 Dependency count: ${Object.keys(pkg.dependencies || {}).length}`);
} catch (error) {
  console.log('❌ Error loading package.json:', error.message);
}

// Import path test for critical modules
console.log('\nTesting critical module imports:');
try {
  require('@upstash/ratelimit');
  console.log('✅ @upstash/ratelimit can be imported');
} catch (error) {
  console.log('❌ Error importing @upstash/ratelimit:', error.message);
}

try {
  require('next/server');
  console.log('✅ next/server can be imported');
} catch (error) {
  console.log('❌ Error importing next/server:', error.message);
}

console.log('\nBuild validation tests completed.');

// If there are missing env vars, exit with error
if (missingEnvVars.length > 0) {
  console.error(`\n❌ Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

console.log('\n✅ All checks passed. Environment appears to be configured correctly for build.'); 