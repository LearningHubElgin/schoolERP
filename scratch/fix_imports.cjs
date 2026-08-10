const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

function walk(directory) {
  let fileList = [];
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const p = path.join(directory, file);
    if (fs.statSync(p).isDirectory()) {
      fileList = fileList.concat(walk(p));
    } else if (p.endsWith('.jsx')) {
      fileList.push(p);
    }
  }
  return fileList;
}

const files = walk(dir);

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Strip top-level imports
  content = content.replace(/import \{ jsPDF \} from ['"]jspdf['"];?\s*\n?/g, '');
  content = content.replace(/import autoTable from ['"]jspdf-autotable['"];?\s*\n?/g, '');
  content = content.replace(/import \* as XLSX from ['"]xlsx['"];?\s*\n?/g, '');
  content = content.replace(/import XLSX from ['"]xlsx['"];?\s*\n?/g, '');

  if (content !== originalContent) {
    // 2. Inject dynamic imports if needed
    // Safely inject jsPDF into any function declaring `new jsPDF`
    content = content.replace(/(const\s+\w+\s*=\s*new jsPDF)/g, "const { jsPDF } = await import('jspdf');\n        $1");

    // Only inject autoTable into `autoTable(` if we just removed it
    if (originalContent.includes('jspdf-autotable')) {
      content = content.replace(/(autoTable\()/g, "const autoTable = (await import('jspdf-autotable')).default;\n        $1");
    }

    if (originalContent.includes('xlsx')) {
        // Change export functions using XLSX
        content = content.replace(/(const (?:exportToExcel|downloadExcel|handleExportExcel|handleExport)\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*\{)/g, (match, fullMatch, asyncGroup) => {
            if (!asyncGroup) {
                // If it's not async, make it async
                let newMatch = fullMatch.replace(/=>/, 'async =>').replace(/var|let|const\s+[\w]+\s*=\s*\(/, match => match.substring(0, match.length-1) + 'async (');
                if(!newMatch.includes('async')) {
                    newMatch = fullMatch.replace('() =>', 'async () =>').replace('(e) =>', 'async (e) =>');
                }
                return newMatch + "\n        const XLSX = await import('xlsx');";
            }
            return fullMatch + "\n        const XLSX = await import('xlsx');";
        });
        
        // Sometimes it's a regular function declaration
        content = content.replace(/(function (?:exportToExcel|downloadExcel|handleExportExcel|handleExport)\s*\([^)]*\)\s*\{)/g, (match) => {
             return "async " + match + "\n        const XLSX = await import('xlsx');";
        });
    }

    // Attempt deduplication (quick fix)
    content = content.replace(/(const \{ jsPDF \} = await import\('jspdf'\);\s*)+/g, "const { jsPDF } = await import('jspdf');\n        ");
    content = content.replace(/(const autoTable = \(await import\('jspdf-autotable'\)\)\.default;\s*)+/g, "const autoTable = (await import('jspdf-autotable')).default;\n        ");
    
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Refactored: ${file.replace(dir, '')}`);
  }
});

console.log(`Successfully refactored ${modifiedCount} files.`);
