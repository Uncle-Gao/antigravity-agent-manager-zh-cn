const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

const targets = [
    "In addition to the custom skills",
    "No MCP Servers",
    "You currently don't have any MCP Servers"
];

targets.forEach(t => {
    console.log('--- Searching: ' + t + ' ---');
    let idx = c.indexOf(t);
    if (idx >= 0) {
        console.log(c.substring(Math.max(0, idx - 50), Math.min(c.length, idx + 150)));
    } else {
        console.log('NOT FOUND');
    }
});

let skillIdx = c.indexOf("In addition to the custom skills");
if (skillIdx >= 0) {
    console.log('--- EXACT SKILL DESCRIPTION JS CODE ---');
    console.log(c.substring(Math.max(0, skillIdx - 100), Math.min(c.length, skillIdx + 400)));
}
