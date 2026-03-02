const fs = require('fs');
const path = require('path');
const os = require('os');
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

let skillIdx = c.indexOf('In addition to the custom skills');
if (skillIdx >= 0) {
    let endIdx = c.indexOf('":""}`', skillIdx);
    if (endIdx > 0) {
        let exactString = c.substring(skillIdx - 1, endIdx + 6);
        console.log('--- EXACT STRING ---');
        console.log(exactString);
        fs.writeFileSync('exact_skill.txt', exactString);
    }
}
