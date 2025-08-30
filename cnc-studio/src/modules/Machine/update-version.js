#!/usr/bin/env node

// Simple script to update version number
// Usage: node update-version.js

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, 'version.js');
const content = fs.readFileSync(versionFile, 'utf8');

// Extract current version
const versionMatch = content.match(/MACHINE_MODULE_VERSION = 'v0\.(\d{3})'/);
if (!versionMatch) {
  console.error('Could not find version in version.js');
  process.exit(1);
}

const currentVersion = parseInt(versionMatch[1]);
const newVersion = currentVersion + 1;
const newVersionString = `v0.${String(newVersion).padStart(3, '0')}`;

// Get changes from command line or use default
const changes = process.argv.slice(2);
const changesList = changes.length > 0 ? changes : ['Updated version'];

// Create new version entry
const date = new Date().toISOString().split('T')[0];
const newEntry = `  {
    version: '${newVersionString}',
    date: '${date}',
    changes: [
${changesList.map(c => `      '${c}'`).join(',\n')}
    ]
  }`;

// Update the file
let newContent = content.replace(
  /MACHINE_MODULE_VERSION = 'v0\.\d{3}'/,
  `MACHINE_MODULE_VERSION = '${newVersionString}'`
);

// Add new version to history
newContent = newContent.replace(
  'export const VERSION_HISTORY = [',
  `export const VERSION_HISTORY = [\n${newEntry},`
);

fs.writeFileSync(versionFile, newContent);

console.log(`✅ Version updated to ${newVersionString}`);
console.log('📝 Changes:');
changesList.forEach(c => console.log(`   - ${c}`));
console.log('\n🎯 Next steps:');
console.log('   1. Review the changes in version.js');
console.log('   2. Commit with: git commit -m "chore: Update Machine module to ' + newVersionString + '"');