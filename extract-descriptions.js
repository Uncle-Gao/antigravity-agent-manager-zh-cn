/**
 * extract-descriptions.js
 * 从 Antigravity jetskiAgent/main.js 中提取所有 isUssSetting 配置项的 description 字符串
 * 用法：node extract-descriptions.js
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const mainJsPath = path.join(
    os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity',
    'resources', 'app', 'out', 'jetskiAgent', 'main.js'
);

const content = fs.readFileSync(mainJsPath, 'utf8');

const descriptions = new Set();

// 匹配模式: description:"..." 或 description:`...`
// 只提取字面量字符串（非变量引用）
let pos = 0;
while (pos < content.length) {
    const dIdx = content.indexOf('description:"', pos);
    if (dIdx < 0) break;

    const start = dIdx + 'description:"'.length;
    let end = start;
    while (end < content.length) {
        if (content[end] === '"' && content[end - 1] !== '\\') break;
        end++;
    }
    
    const desc = content.substring(start, end);
    // 只收集长度 > 10 且不含 { 的（排除 JSON 对象/变量）
    if (desc.length > 10 && !desc.includes('{') && !desc.startsWith('$')) {
        descriptions.add(desc);
    }
    
    pos = end + 1;
}

const results = [...descriptions].sort();
console.log(`提取到 ${results.length} 条 description 字符串:\n`);
results.forEach((d, i) => {
    console.log(`[${i + 1}] ${d.substring(0, 120)}${d.length > 120 ? '...' : ''}`);
    console.log('');
});

// 导出为 JSON 方便进一步处理
fs.writeFileSync('extracted-descriptions.json', JSON.stringify(results, null, 2), 'utf8');
console.log('\n已保存到 extracted-descriptions.json');
