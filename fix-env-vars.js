#!/usr/bin/env node

// Script to validate and fix environment variables
const fs = require('fs');
const path = require('path');

console.log('🛠️ Fixing environment variables...');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

// Read the .env.local file
let envContent = fs.readFileSync('.env.local', 'utf8');
console.log('📄 Current .env.local content:');
console.log('----------------------------------------');
console.log(envContent);
console.log('----------------------------------------');

// Fix common issues

// 1. Remove trailing whitespace or newlines from URLs
envContent = envContent.replace(/UPSTASH_REDIS_REST_URL=(.+?)\s+/g, 'UPSTASH_REDIS_REST_URL=$1\n');

// 2. Fix REPLICATE_API_KEY format if needed
envContent = envContent.replace(/REPLICATE_API_KEY=\s*(.+?)\s+/g, 'REPLICATE_API_KEY=$1\n');

// 3. Fix NEXT_PUBLIC_UPLOAD_API_KEY format if needed
envContent = envContent.replace(/NEXT_PUBLIC_UPLOAD_API_KEY=\s*(.+?)\s+/g, 'NEXT_PUBLIC_UPLOAD_API_KEY=$1\n');

// 4. Fix UPSTASH_REDIS_REST_TOKEN format if needed
envContent = envContent.replace(/UPSTASH_REDIS_REST_TOKEN=\s*(.+?)\s*/g, 'UPSTASH_REDIS_REST_TOKEN=$1');

// Normalize line endings
envContent = envContent.replace(/\r\n/g, '\n');

// Ensure file ends with a newline
if (!envContent.endsWith('\n')) {
  envContent += '\n';
}

// Write the fixed content back to .env.local
fs.writeFileSync('.env.local', envContent);

console.log('✅ Fixed .env.local content:');
console.log('----------------------------------------');
console.log(fs.readFileSync('.env.local', 'utf8'));
console.log('----------------------------------------');

// Also create a .env file with the same content for Vercel
fs.writeFileSync('.env', envContent);
console.log('✅ Created .env file with the same content');

// Update Vercel environment variables
console.log('📝 Instructions to update Vercel environment variables:');
console.log('1. Run: vercel env rm UPSTASH_REDIS_REST_URL && vercel env add UPSTASH_REDIS_REST_URL');
console.log('2. Run: vercel env rm UPSTASH_REDIS_REST_TOKEN && vercel env add UPSTASH_REDIS_REST_TOKEN');
console.log('3. Run: vercel env rm REPLICATE_API_KEY && vercel env add REPLICATE_API_KEY');
console.log('4. Run: vercel env rm NEXT_PUBLIC_UPLOAD_API_KEY && vercel env add NEXT_PUBLIC_UPLOAD_API_KEY');

console.log('\n🚀 Environment variables fixed successfully!'); 