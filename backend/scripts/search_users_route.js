const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'routes', 'admin.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);

lines.forEach((line, index) => {
    if (line.includes('/users')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
