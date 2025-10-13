const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      fixImports(fullPath); // recursively fix subfolders
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Remove @version from module imports
      const fixedContent = content.replace(/(['"])([^'"]+?)@\d+(\.\d+)*(['"])/g, '$1$2$4');

      if (fixedContent !== content) {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        console.log(`Fixed imports in: ${fullPath}`);
      }
    }
  });
}

// Run the fixer in the current directory
fixImports(path.resolve('.'));
console.log('All imports fixed!');
