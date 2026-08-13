const fs = require('fs');
const path = require('path');

const tablesPath = path.join(__dirname, 'tables.json');
const modelsDir = path.join(__dirname, '../models');

if (!fs.existsSync(tablesPath)) {
    console.error('tables.json not found');
    process.exit(1);
}

// Clean models directory first to prevent stale / duplicate files
const existingFiles = fs.readdirSync(modelsDir);
existingFiles.forEach(file => {
    if (file.endsWith('.js')) {
        fs.unlinkSync(path.join(modelsDir, file));
    }
});

const tables = JSON.parse(fs.readFileSync(tablesPath, 'utf8'));

// Helper to convert table_name to PascalCase ModelName
function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

// Helper to convert SQL data types to Sequelize DataTypes
function parseDataType(line) {
    const lower = line.toLowerCase();
    
    if (lower.includes('int(') || lower.includes(' int ') || lower.includes('int,')) {
        return 'DataTypes.INTEGER';
    }
    if (lower.includes('decimal(')) {
        const match = lower.match(/decimal\((\d+),(\d+)\)/);
        if (match) {
            return `DataTypes.DECIMAL(${match[1]}, ${match[2]})`;
        }
        return 'DataTypes.DECIMAL(10, 2)';
    }
    if (lower.includes('varchar(')) {
        const match = lower.match(/varchar\((\d+)\)/);
        if (match) {
            return `DataTypes.STRING(${match[1]})`;
        }
        return 'DataTypes.STRING';
    }
    if (lower.includes('text') || lower.includes('longtext')) {
        return 'DataTypes.TEXT';
    }
    if (lower.includes('enum(')) {
        const match = line.match(/enum\(([^)]+)\)/i);
        if (match) {
            return `DataTypes.ENUM(${match[1]})`;
        }
        return 'DataTypes.STRING';
    }
    if (lower.includes('date ') || lower.includes('date,')) {
        return 'DataTypes.DATEONLY';
    }
    if (lower.includes('timestamp') || lower.includes('datetime')) {
        return 'DataTypes.DATE';
    }
    if (lower.includes('tinyint(1)') || lower.includes('boolean')) {
        return 'DataTypes.BOOLEAN';
    }
    if (lower.includes('float') || lower.includes('double')) {
        return 'DataTypes.FLOAT';
    }
    return 'DataTypes.STRING';
}

const modelFiles = [];

tables.forEach(({ tableName, body }) => {
    const modelName = toPascalCase(tableName);
    const lines = body.split('\n');
    const fields = [];
    let hasCreatedAt = false;
    let hasUpdatedAt = false;

    lines.forEach(rawLine => {
        const line = rawLine.trim();
        const colMatch = line.match(/^`([^`]+)`\s+([^,]+)/);
        if (colMatch) {
            const colName = colMatch[1];
            const colDef = colMatch[2];

            if (colName === 'created_at') hasCreatedAt = true;
            if (colName === 'updated_at') hasUpdatedAt = true;

            const dataType = parseDataType(colDef);
            const isPrimaryKey = colName === 'id';
            const isAutoIncrement = colDef.toLowerCase().includes('auto_increment');
            const isNullable = !colDef.toLowerCase().includes('not null');

            let fieldCode = `    ${colName}: {\n`;
            fieldCode += `        type: ${dataType},\n`;
            if (isPrimaryKey) fieldCode += `        primaryKey: true,\n`;
            if (isAutoIncrement) fieldCode += `        autoIncrement: true,\n`;
            fieldCode += `        allowNull: ${isNullable}\n    }`;

            fields.push(fieldCode);
        }
    });

    if (fields.length === 0) return;

    let modelCode = `const { DataTypes } = require('sequelize');\n`;
    modelCode += `const { sequelize } = require('../config/database');\n\n`;

    modelCode += `const ${modelName} = sequelize.define('${modelName}', {\n`;
    modelCode += fields.join(',\n');
    modelCode += `\n}, {\n`;
    modelCode += `    tableName: '${tableName}',\n`;
    modelCode += `    timestamps: ${hasCreatedAt || hasUpdatedAt},\n`;
    if (hasCreatedAt) modelCode += `    createdAt: 'created_at',\n`;
    else modelCode += `    createdAt: false,\n`;
    if (hasUpdatedAt) modelCode += `    updatedAt: 'updated_at'\n`;
    else modelCode += `    updatedAt: false\n`;
    modelCode += `});\n\n`;

    // Special Hooks for Users table (Password hashing & verification)
    if (tableName === 'users') {
        modelCode += `const bcrypt = require('bcryptjs');\n\n`;
        modelCode += `Users.beforeCreate(async (user) => {\n`;
        modelCode += `    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {\n`;
        modelCode += `        const salt = await bcrypt.genSalt(10);\n`;
        modelCode += `        user.password = await bcrypt.hash(user.password, salt);\n`;
        modelCode += `    }\n`;
        modelCode += `});\n\n`;
        modelCode += `Users.prototype.matchPassword = async function (enteredPassword) {\n`;
        modelCode += `    return await bcrypt.compare(enteredPassword, this.password);\n`;
        modelCode += `};\n\n`;
    }

    modelCode += `module.exports = ${modelName};\n`;

    const filePath = path.join(modelsDir, `${modelName}.js`);
    fs.writeFileSync(filePath, modelCode);
    modelFiles.push({ modelName, fileName: `${modelName}.js` });
});

console.log(`Generated ${modelFiles.length} clean Sequelize model files matching phpMyAdmin tables.`);

// Generate index.js with both Plural and Singular Aliases
let indexCode = `const { sequelize } = require('../config/database');\n\n`;
modelFiles.forEach(({ modelName }) => {
    indexCode += `const ${modelName} = require('./${modelName}');\n`;
});

indexCode += `\n// Base Model Exports\nmodule.exports = {\n    sequelize,\n`;
modelFiles.forEach(({ modelName }) => {
    indexCode += `    ${modelName},\n`;
});

// Common singular aliases
indexCode += `    // Singular Aliases\n`;
indexCode += `    User: Users,\n`;
indexCode += `    School: Schools,\n`;
indexCode += `    Student: Students,\n`;
indexCode += `    Teacher: Teachers,\n`;
indexCode += `    FeeRecord: FeeRecords,\n`;
indexCode += `    StudentFeeDiscount: StudentFeeDiscounts,\n`;
indexCode += `    ActivityLog: ActivityLogs\n`;
indexCode += `};\n`;

fs.writeFileSync(path.join(modelsDir, 'index.js'), indexCode);
console.log('Updated backend/models/index.js successfully.');
