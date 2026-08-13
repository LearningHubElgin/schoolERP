const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, '../../school_erp (15).sql');
const content = fs.readFileSync(sqlPath, 'utf8');
const lines = content.split('\n');

const tables = [];
let currentTable = null;
let currentBody = [];

lines.forEach(line => {
    const match = line.match(/^CREATE TABLE `([^`]+)`/i);
    if (match) {
        if (currentTable) {
            tables.push({ tableName: currentTable, body: currentBody.join('\n') });
        }
        currentTable = match[1];
        currentBody = [];
    } else if (currentTable) {
        if (line.trim().startsWith(') ENGINE=') || line.trim() === ');' || line.trim().startsWith(') ;')) {
            tables.push({ tableName: currentTable, body: currentBody.join('\n') });
            currentTable = null;
            currentBody = [];
        } else {
            currentBody.push(line);
        }
    }
});

if (currentTable) {
    tables.push({ tableName: currentTable, body: currentBody.join('\n') });
}

console.log(`Found ${tables.length} tables:`, tables.map(t => t.tableName).join(', '));
fs.writeFileSync(path.join(__dirname, 'tables.json'), JSON.stringify(tables, null, 2));
