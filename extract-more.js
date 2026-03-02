const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

const targets = [
  'title:"History"',
  'title:"HISTORY"',
  'children:"Advanced settings"',
  'children:"Open System Preferences"',
  'title:"Model Quota"',
  'title:"MODEL QUOTA"',
  'label:"Notification Settings"',
  'title:"Notification Settings"'
];

targets.forEach(t => {
  let idx = c.indexOf(t);
  while (idx >= 0) {
    console.log('--- ' + t + ' ---');
    console.log(c.substring(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
    idx = c.indexOf(t, idx + 1);
  }
});
