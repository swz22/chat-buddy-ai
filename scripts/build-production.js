const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Chat Buddy AI for production...\n');

// Build server
console.log('📦 Building server...');
execSync('cd server && npm run build', { stdio: 'inherit' });

// Build client
console.log('📦 Building client...');
execSync('cd client && npm run build', { stdio: 'inherit' });

// Create production directory
const prodDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(prodDir)) {
  fs.mkdirSync(prodDir, { recursive: true });
}

// Copy server build
console.log('📋 Copying server files...');
const serverSrc = path.join(__dirname, '..', 'server', 'dist');
const serverDest = path.join(prodDir, 'server');
if (fs.existsSync(serverSrc)) {
  fs.cpSync(serverSrc, serverDest, { recursive: true });
}

console.log('📋 Copying client files...');
const clientSrc = path.join(__dirname, '..', 'client', 'dist');
const clientDest = path.join(prodDir, 'client');
if (fs.existsSync(clientSrc)) {
  fs.cpSync(clientSrc, clientDest, { recursive: true });
}

console.log('📋 Copying package files...');
fs.copyFileSync(
  path.join(__dirname, '..', 'server', 'package.json'),
  path.join(prodDir, 'package.json')
);

console.log('\n✅ Production build complete!');
console.log('📁 Output directory: ./dist');
console.log('\n🚀 To deploy: railway up or git push to deploy branch');