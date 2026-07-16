const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.tsx');
let lines = fs.readFileSync(appPath, 'utf8').split('\n');

// Find the dangling old bottom model section by searching for the isBottomModelOpen panel
// that is outside the main chat screen div (after our new </div> at line 1426)
// We'll look for the floating model panel block that's orphaned and ends before SCREEN 4
let startIdx = -1;
let endIdx = -1;

for (let i = 1424; i < lines.length; i++) {
  if (lines[i].includes('Floating Model Panel (opens upward)') && startIdx === -1) {
    startIdx = i;
  }
  if (startIdx > -1 && lines[i].includes('SCREEN 4: USER SETTINGS SCREEN')) {
    endIdx = i;
    break;
  }
}

if (startIdx > -1 && endIdx > -1) {
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync(appPath, lines.join('\n'), 'utf8');
  console.log(`Removed orphaned block from line ${startIdx+1} to ${endIdx}`);
} else {
  console.log('Block not found, startIdx:', startIdx, 'endIdx:', endIdx);
}
