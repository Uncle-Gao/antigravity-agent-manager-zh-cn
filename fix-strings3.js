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

// The file currently has literal newlines between single quotes instead of \n
// I'll read the file, and look for `In addition... and replace the whole block up to `:""}`'
let startOld = extContent.indexOf("'\"`In addition to the custom skills folder");
if (startOld < 0) startOld = extContent.indexOf("'`In addition to the custom skills folder"); // Try without JSON stringify quote

let endOld = extContent.indexOf("`:\"\"}`\n", startOld); // It had literal newlines, so we search for the end
if (endOld < 0) endOld = extContent.indexOf("`:\"\"}`'", startOld);
if (endOld < 0) endOld = extContent.indexOf("`:\"\"}`\"", startOld);

if (startOld >= 0 && endOld > startOld) {
    const oldStr = extContent.substring(startOld, endOld + 7);
    // We want to write the string properly enclosed in single quotes, escaping newlines
    const escapedSkill = exactSkill.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/'/g, "\\'");

    extContent = extContent.replace(oldStr, "'" + escapedSkill + "'");
    fs.writeFileSync(extPath, extContent, 'utf8');
    console.log('Successfully updated extension.ts!');
} else {
    console.log('Failed to find old string bounds.');
}
