const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

const targets = [
  'use the clipboard as context for',
  'Allow Tab to view and edit the files in .gitignore',
  'In addition to the custom skills',
  'Changes the base URL on each extension page',
  'Changes the base URL for marketplace search',
  'Show "Edit" and "Chat" buttons when selecting text',
  'To modify editor settings, open Settings within the editor window.',
  'Agent auto-executes commands matched by an allow list',
  'Agent asks for permission before executing commands',
  'Allow Agent to view and edit files outside of the current'
];

let res = '';
targets.forEach(t => {
  const idx = c.indexOf(t);
  if (idx >= 0) {
    let chunk = c.substring(Math.max(0, idx - 100), Math.min(c.length, idx + 400));
    let descStart = chunk.indexOf('description:');
    if (descStart > -1) {
      let content = chunk.substring(descStart + 12);
      let delimiter = content[0]; // " or ` or '
      if (delimiter === '"' || delimiter === '`' || delimiter === "'") {
        let textEnd = content.indexOf(delimiter, 1);
        if (textEnd > -1) {
          res += '--- ' + t.substring(0, 30) + ' ---\n';
          res += 'description:' + delimiter + content.substring(1, textEnd) + delimiter + '\n\n';
        }
      }
    }
  }
});

fs.writeFileSync('extracted-desc4.txt', res);
