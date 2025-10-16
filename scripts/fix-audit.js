#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Fixing npm audit issues...\n');

const directories = ['client', 'server'];

directories.forEach(dir => {
  console.log(`\n📦 Processing ${dir}...`);
  try {
    process.chdir(path.join(__dirname, '..', dir));
    
    // Run npm audit fix
    console.log('Running npm audit fix...');
    execSync('npm audit fix --force', { stdio: 'inherit' });
    
    console.log(`✅ ${dir} audit issues fixed`);
  } catch (error) {
    console.log(`⚠️  Some issues in ${dir} could not be automatically fixed:`, error.message);
  }
});

console.log('\n🎉 Audit fix process completed!');
console.log('\nNote: Some vulnerabilities may require manual review.');
