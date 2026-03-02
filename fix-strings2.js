const fs = require('fs');
const path = require('path');
const os = require('os');

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

const extPath = path.join(__dirname, 'src', 'extension.ts');
let extContent = fs.readFileSync(extPath, 'utf8');

let startOld = extContent.indexOf("'`In addition to the custom skills folder");
let endOld = extContent.indexOf("`:\"\"}`'", startOld);

if (startOld >= 0 && endOld > startOld) {
    const oldStr = extContent.substring(startOld, endOld + 7);
    console.log("Found old string of length " + oldStr.length);
    extContent = extContent.replace(oldStr, "'" + exactSkill + "'");
    fs.writeFileSync(extPath, extContent, 'utf8');
    console.log('Successfully updated extension.ts!');
} else {
    console.log('Failed to find old string bounds.');
}
