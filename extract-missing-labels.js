/**
 * extract-missing-labels.js
 * 提取所有未翻译的设置项标签和描述
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const mainJsPath = path.join(
    os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity',
    'resources', 'app', 'out', 'jetskiAgent', 'main.js'
);

const content = fs.readFileSync(mainJsPath, 'utf8');

const labelsToFind = [
    'Agent Gitignore Access',
    'Agent Non-Workspace File Access',
    'Auto-Open Edited Files',
    'Follow Along by Default',
    'Enable Sounds for Agent',
    'Auto-Expand Changes Overview',
    'Enable Demo Mode',
    'Notification Settings',
    'Suggestions in Editor',
    'Tab Speed',
    'Highlight After Accept',
    'Tab to Import',
    'Tab to Jump',
    'Clipboard Context',
    'Tab Gitignore Access',
    'Open Agent on Reload',
    'Conversation History',
    'Knowledge',
    'Auto-Continue',
    'Auto-Proceed',
    'Enable Workspace API',
    'Show Only First',
    'Confirm Window Reload',
    'Agent Gitignore',
];

console.log('='.repeat(60));
labelsToFind.forEach(label => {
    const key = 'label:"' + label + '"';
    const idx = content.indexOf(key);
    if (idx < 0) {
        console.log('NOT_FOUND: ' + label);
        return;
    }
    // Extract description
    const chunk = content.substring(idx, Math.min(idx + 500, content.length));
    // Find description value (either "..." or `...`)
    const descIdx = chunk.indexOf('description:');
    if (descIdx < 0) {
        console.log('LABEL_ONLY [' + label + ']: ' + chunk.substring(0, 100));
        return;
    }
    const afterDesc = chunk.substring(descIdx + 12);
    let desc = '';
    if (afterDesc[0] === '"') {
        // Double-quoted string
        let end = 1;
        while (end < afterDesc.length && !(afterDesc[end] === '"' && afterDesc[end - 1] !== '\\')) end++;
        desc = afterDesc.substring(0, end + 1);
    } else if (afterDesc[0] === '`') {
        // Template literal - take up to 200 chars
        desc = afterDesc.substring(0, 200) + '...`';
    } else {
        desc = afterDesc.substring(0, 50) + ' [VAR]';
    }
    console.log('=== [' + label + '] ===');
    console.log('label:"' + label + '"');
    console.log('desc: ' + desc);
    console.log('');
});
