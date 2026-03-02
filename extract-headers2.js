const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

const targets = [
    'title:"General"',
    'title:"Suggestions"',
    'title:"Navigation"',
    'title:"Context"',
    'title:"Marketplace"',
    'title:"Selection Actions"',
    'title:"Add MCP Servers"',
    'children:"ADD MCP SERVERS"',
    'title:"File Access"',
    'title:"Automation"'
];

targets.forEach(t => {
    let idx = c.indexOf(t);
    while (idx >= 0) {
        console.log('--- ' + t + ' ---');
        console.log(c.substring(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
        idx = c.indexOf(t, idx + 1);
    }
});
