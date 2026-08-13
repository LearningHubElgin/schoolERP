const fs = require('fs');
const path = require('path');

const tablesJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'tables.json'), 'utf8'));
const sqlContent = fs.readFileSync(path.join(__dirname, '../../school_erp (15).sql'), 'utf8');

// Find all CREATE TABLE or CREATE VIEW statements in SQL dump
const allDbTablesMatches = sqlContent.match(/CREATE (?:TABLE|VIEW) `([^`]+)`/g);
const dbTableNames = allDbTablesMatches ? allDbTablesMatches.map(m => m.replace(/CREATE (?:TABLE|VIEW) `([^`]+)`/, '$1')) : [];

// Unique DB table names
const uniqueDbTables = [...new Set(dbTableNames)];

const modelFiles = fs.readdirSync(path.join(__dirname, '../models')).filter(f => f.endsWith('.js') && f !== 'index.js');

function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

const modelNames = modelFiles.map(f => f.replace('.js', ''));

const missing = [];
uniqueDbTables.forEach(tableName => {
    const pascal = toPascalCase(tableName);
    if (!modelNames.includes(pascal)) {
        missing.push({ tableName, pascal });
    }
});

console.log(`Total DB Tables in SQL: ${uniqueDbTables.length}`);
console.log(`Total Model Files: ${modelFiles.length}`);
console.log('Missing Tables/Views:', missing);
