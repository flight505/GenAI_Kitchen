#!/usr/bin/env node

// Test script to check Vercel deployment settings
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel Deployment Test Script');
console.log('===============================');

// Check if .vercelignore exists and has appropriate contents
console.log('\n📋 Checking .vercelignore file:');
try {
  if (fs.existsSync('.vercelignore')) {
    const vercelignore = fs.readFileSync('.vercelignore', 'utf8');
    console.log('✅ .vercelignore file exists');
    console.log('Content preview:');
    console.log(vercelignore.split('\n').slice(0, 5).join('\n') + (vercelignore.split('\n').length > 5 ? '\n...' : ''));
  } else {
    console.log('⚠️ .vercelignore file does not exist - creating basic one');
    // Create a basic .vercelignore file
    const basicVercelignore = `.DS_Store
node_modules
.env
.env.local
.next
npm-debug.log*
yarn-debug.log*
yarn-error.log*`;
    fs.writeFileSync('.vercelignore', basicVercelignore);
    console.log('✅ Created basic .vercelignore file');
  }
} catch (error) {
  console.error('❌ Error checking .vercelignore:', error.message);
}

// Check for vercel.json and create one if it doesn't exist
console.log('\n📋 Checking vercel.json:');
try {
  if (fs.existsSync('vercel.json')) {
    const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('✅ vercel.json exists');
    console.log('Content:', JSON.stringify(vercelJson, null, 2));
  } else {
    console.log('⚠️ vercel.json does not exist - creating basic one');
    // Create a basic vercel.json file with sensible defaults
    const basicVercelJson = {
      "version": 2,
      "framework": "nextjs",
      "buildCommand": "npm run build",
      "devCommand": "npm run dev",
      "installCommand": "npm install",
      "regions": ["iad1"], // US East (N. Virginia)
      "github": {
        "silent": true
      }
    };
    fs.writeFileSync('vercel.json', JSON.stringify(basicVercelJson, null, 2));
    console.log('✅ Created basic vercel.json file');
  }
} catch (error) {
  console.error('❌ Error checking vercel.json:', error.message);
}

// Check environment variables on Vercel
console.log('\n📋 Checking Vercel environment variables:');
try {
  const envOutput = execSync('vercel env ls 2>/dev/null', { encoding: 'utf8' });
  console.log('Vercel environment variables:');
  console.log(envOutput);
} catch (error) {
  console.log('⚠️ Could not check Vercel environment variables - you may need to run vercel login');
}

// Check .env.local file
console.log('\n📋 Checking .env.local file:');
try {
  if (fs.existsSync('.env.local')) {
    console.log('✅ .env.local file exists');
    const envLocalContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = envLocalContent.split('\n')
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.split('=')[0]);
    
    console.log(`Found ${envVars.length} environment variables: ${envVars.join(', ')}`);
  } else {
    console.log('⚠️ .env.local file does not exist');
  }
} catch (error) {
  console.error('❌ Error checking .env.local:', error.message);
}

// Check Next.js app structure for App Router
console.log('\n📋 Checking Next.js app structure:');
try {
  if (fs.existsSync('app')) {
    console.log('✅ App directory exists (using App Router)');
    const appDirs = fs.readdirSync('app', { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    console.log(`Found app subdirectories: ${appDirs.join(', ')}`);
  } else {
    console.log('⚠️ No app directory found - check Next.js configuration');
  }
} catch (error) {
  console.error('❌ Error checking app structure:', error.message);
}

// Check package.json scripts
console.log('\n📋 Checking package.json scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const buildScript = packageJson.scripts?.build;
  const devScript = packageJson.scripts?.dev;
  
  if (buildScript) {
    console.log(`✅ Build script found: "${buildScript}"`);
  } else {
    console.log('❌ No build script found in package.json');
  }
  
  if (devScript) {
    console.log(`✅ Dev script found: "${devScript}"`);
  } else {
    console.log('⚠️ No dev script found in package.json');
  }
} catch (error) {
  console.error('❌ Error checking package.json:', error.message);
}

// Check node_modules size and for potential issues
console.log('\n📋 Checking node_modules:');
try {
  if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules directory exists');
    // Check if node_modules is too large
    const nodeSizeCommand = process.platform === 'darwin' ? 
      'du -sh node_modules | cut -f1' : 
      'du -sh node_modules';
    
    try {
      const nodeModulesSize = execSync(nodeSizeCommand, { encoding: 'utf8' }).trim();
      console.log(`📦 node_modules size: ${nodeModulesSize}`);
    } catch (error) {
      console.log('⚠️ Could not determine node_modules size');
    }
  } else {
    console.log('⚠️ node_modules directory not found - run npm install');
  }
} catch (error) {
  console.error('❌ Error checking node_modules:', error.message);
}

// Check next.config.js for any issues
console.log('\n📋 Checking next.config.js:');
try {
  if (fs.existsSync('next.config.js')) {
    console.log('✅ next.config.js exists');
    const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
    
    // Check for common issues
    if (nextConfigContent.includes('experimental')) {
      console.log('⚠️ next.config.js contains experimental features which might cause deployment issues');
    }
    
    if (nextConfigContent.includes('webpack')) {
      console.log('⚠️ next.config.js contains webpack customization which might cause deployment issues');
    }
  } else {
    console.log('⚠️ next.config.js does not exist - check Next.js configuration');
  }
} catch (error) {
  console.error('❌ Error checking next.config.js:', error.message);
}

// Verify Vercel CLI version
console.log('\n📋 Checking Vercel CLI version:');
try {
  const vercelVersion = execSync('vercel --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Vercel CLI version: ${vercelVersion}`);
} catch (error) {
  console.log('⚠️ Could not determine Vercel CLI version - you may need to install it: npm i -g vercel');
}

// Final summary
console.log('\n📋 Deployment Recommendations:');
console.log('1. Ensure all environment variables are set on Vercel');
console.log('2. Try deploying with --debug flag: vercel deploy --prod --debug');
console.log('3. If build fails, check build logs for specific errors');
console.log('4. Verify your Next.js version is compatible with Vercel');
console.log('5. Try a fresh deployment after clearing .vercel directory: rm -rf .vercel/*');

console.log('\n✅ Deployment test script completed'); 