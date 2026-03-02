const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

const targets = [
    'title:"ACCOUNT"',
    'title:"Account"',
    'label:"Enable Telemetry"',
    'description:"When toggled on, Antigravity collects usage data',
    'label:"Marketing Emails"',
    'description:"Receive product updates, tips, and promotions from Google',
    'label:"Your Plan: Google AI Pro"',
    // Some labels might have dynamic parts, let's search via indexOf instead
];

targets.forEach(t => {
    let idx = c.indexOf(t);
    while (idx >= 0) {
        console.log('--- ' + t + ' ---');
        console.log(c.substring(Math.max(0, idx - 40), Math.min(c.length, idx + 40)));
        idx = c.indexOf(t, idx + 1);
    }
});

// Dynamic/complex searches:
[
    'In addition to the custom skills folder',
    'Refresh',
    'Open MCP Config',
    'Upgrade',
    'Sign out',
    'Terms of Service',
    'Email'
].forEach(t => {
    console.log('--- Searching generic text: ' + t + ' ---');
    let idx = c.indexOf(t);
    if (idx >= 0) {
        console.log(c.substring(Math.max(0, idx - 80), Math.min(c.length, idx + 80)));
    }
})

