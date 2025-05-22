#!/usr/bin/env node

// Validates environment variables before build
const fs = require('fs');
const dotenv = require('dotenv');

console.log('🔍 Validating environment variables before build...');

// Load environment variables from .env.local
if (fs.existsSync('.env.local')) {
  console.log('📄 Loading environment variables from .env.local');
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  console.log('📄 Loading environment variables from .env');
  dotenv.config({ path: '.env' });
}

// Check required environment variables
const requiredEnvVars = [
  'REPLICATE_API_KEY',
  'NEXT_PUBLIC_UPLOAD_API_KEY',
];

// Check optional environment variables
const optionalEnvVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

let hasErrors = false;

// Check required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Required environment variable ${envVar} is missing`);
    hasErrors = true;
  } else {
    console.log(`✅ ${envVar} is set`);
  }
}

// Check optional environment variables
for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} is set`);
    
    // Special validation for URLs
    if (envVar === 'UPSTASH_REDIS_REST_URL') {
      const url = process.env[envVar];
      if (url.includes(' ')) {
        console.error(`❌ ${envVar} contains spaces: "${url}"`);
        console.log(`🛠️ Fixing ${envVar}...`);
        process.env[envVar] = url.trim();
        console.log(`✅ Fixed ${envVar}: "${process.env[envVar]}"`);
        
        // Update .env and .env.local files with the fixed URL
        if (fs.existsSync('.env.local')) {
          let envContent = fs.readFileSync('.env.local', 'utf8');
          envContent = envContent.replace(
            /UPSTASH_REDIS_REST_URL=(.+?)(\s|$)/g, 
            `UPSTASH_REDIS_REST_URL=${process.env[envVar]}\n`
          );
          fs.writeFileSync('.env.local', envContent);
          console.log('✅ Updated .env.local with fixed URL');
        }
        
        if (fs.existsSync('.env')) {
          let envContent = fs.readFileSync('.env', 'utf8');
          envContent = envContent.replace(
            /UPSTASH_REDIS_REST_URL=(.+?)(\s|$)/g, 
            `UPSTASH_REDIS_REST_URL=${process.env[envVar]}\n`
          );
          fs.writeFileSync('.env', envContent);
          console.log('✅ Updated .env with fixed URL');
        }
      }
      
      try {
        // Validate URL format
        new URL(process.env[envVar]);
        console.log(`✅ ${envVar} has valid URL format`);
      } catch (error) {
        console.error(`❌ ${envVar} has invalid URL format: ${error.message}`);
        hasErrors = true;
      }
    }
  } else {
    console.log(`⚠️ Optional ${envVar} is not set`);
  }
}

// Exit with error if any required environment variables are missing
if (hasErrors) {
  console.error('❌ Environment validation failed');
  process.exit(1);
}

console.log('✅ Environment validation passed'); 