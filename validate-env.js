// Environment variable validation
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'REPLICATE_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'JWT_SECRET',
  'NEXT_PUBLIC_UPLOAD_API_KEY'
];

const missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env.local file');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  
  // Additional validation
  if (process.env.REPLICATE_API_KEY && !process.env.REPLICATE_API_KEY.startsWith('r8_')) {
    console.warn('⚠️  Warning: REPLICATE_API_KEY should start with "r8_"');
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters long for security');
  }
}