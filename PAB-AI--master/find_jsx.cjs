const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

for (let i = 785; i < 1100; i++) {
  if (lines[i].includes(')}')) {
    console.log('Found )} at', i + 1, lines[i]);
  }
}
