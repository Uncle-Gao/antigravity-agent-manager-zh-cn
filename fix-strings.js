const fs = require('fs');
const path = require('path');
const os = require('os');

// 1. Get exact skill string from main.js
const mainJsPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent', 'main.js');
const c = fs.readFileSync(mainJsPath, 'utf8');

let exactSkill = '';
let skillIdx = c.indexOf('In addition to the custom skills');
if (skillIdx >= 0) {
    let endIdx = c.indexOf('google3/`:""}`', skillIdx);
    if (endIdx > 0) {
        exactSkill = c.substring(skillIdx - 1, endIdx + 14);
    }
}

console.log('--- EXACT SKILL TO REPLACE ---');
console.log(JSON.stringify(exactSkill));

// 2. Read extension.ts
const extPath = path.join(__dirname, 'src', 'extension.ts');
let extContent = fs.readFileSync(extPath, 'utf8');

// Replace old incorrect skill string using regex for flexibility
const oldSkillPattern = /'`In addition to the custom skills folder, Antigravity will search the following paths in order to find skills for the agent\.\$\{n\?`\\nFor google3 workspaces.*?`:""}`'/;
if (oldSkillPattern.test(extContent)) {
    const newRef = exactSkill ? JSON.stringify(exactSkill) : '""';
    extContent = extContent.replace(oldSkillPattern, newRef);
    console.log('Replaced skill string reference');
} else {
    console.log('Old skill string not found to replace!');
}

fs.writeFileSync(extPath, extContent, 'utf8');
console.log('Updated extension.ts successfully!');
