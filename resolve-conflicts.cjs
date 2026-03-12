const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
  path.join(__dirname, 'server')
];

function resolveConflictsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>>[^\n]*\r?\n/g;
  if (regex.test(content)) {
    const newContent = content.replace(regex, '$1');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Resolved conflicts in ${filePath}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      resolveConflictsInFile(fullPath);
    }
  }
}

directoriesToProcess.forEach(processDirectory);
resolveConflictsInFile(path.join(__dirname, 'client/src/App.jsx'));
