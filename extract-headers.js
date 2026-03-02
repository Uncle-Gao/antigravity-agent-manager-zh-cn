const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

const targets = [
  'GENERAL',
  'SUGGESTIONS',
  'NAVIGATION',
  'CONTEXT',
  'MARKETPLACE',
  'SELECTION ACTIONS',
  'ADD MCP SERVERS',
  'FILE ACCESS',
  'AUTOMATION'
];

targets.forEach(t => {
  let search1 = '"' + t + '"';
  let search2 = "'" + t + "'";
  [search1, search2].forEach(s => {
    let idx = c.indexOf(s);
    while (idx >= 0) {
      console.log('--- ' + s + ' ---');
      console.log(c.substring(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
      idx = c.indexOf(s, idx + 1);
    }
  });
});
