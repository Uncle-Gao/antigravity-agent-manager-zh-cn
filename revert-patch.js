/**
 * revert-patch.js - 急救还原脚本
 * 用法：node revert-patch.js
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

// zh -> en 还原字典（与 extension.ts 一一对应）
const dict = {
    'label:"智能体管理器"': 'label:"Agent Manager"',
    'text:"发起对话"': 'text:"Start conversation"',
    'text:"工作区"': 'text:"Workspaces"',
    'text:"游乐场"': 'text:"Playground"',
    'text:"知识库"': 'text:"Knowledge"',
    'text:"浏览器"': 'text:"Browser"',
    'text:"设置"': 'text:"Settings"',
    'text:"提供反馈"': 'text:"Provide Feedback"',
    'text:"打开编辑器"': 'text:"Open Editor"',
    'text:"使用游乐场"': 'text:"Use Playground"',
    'text:"发起新对话"': 'text:"Start new conversation"',
    'title:"安全"': 'title:"Security"',
    'title:"文档"': 'title:"Artifact"',
    'title:"终端"': 'title:"Terminal"',
    'title:"历史"': 'title:"History"',
    'title:"常规"': 'title:"General"',
    'title:"高级"': 'title:"Advanced"',
    'title:"允许列表"': 'title:"Allowlist"',
    'label:"严格模式"': 'label:"Strict Mode"',
    'label:"审查策略"': 'label:"Review Policy"',
    'label:"终端命令自动执行"': 'label:"Terminal Command Auto Execution"',
    'label:"终端命令允许列表"': 'label:"Allow List Terminal Commands"',
    'label:"终端命令拒绝列表"': 'label:"Deny List Terminal Commands"',
    'label:"始终执行"': 'label:"Always Proceeds"',
    'label:"由智能体决定"': 'label:"Agent Decides"',
    'label:"每次确认"': 'label:"Asks for Review"',
    'label:"在当前对话中解释并修复"': 'label:"Explain and Fix in Current Conversation"',
    'label:"启用浏览器工具"': 'label:"Enable Browser Tools"',
    'label:"浏览器 JS 执行策略"': 'label:"Browser Javascript Execution Policy"',
    'label:"浏览器 URL 允许列表"': 'label:"Browser URL Allowlist"',
    'label:"已禁用"': 'label:"Disabled"',
    'label:"请求确认"': 'label:"Request Review"',
    'label:"智能体自动修复 Lint 错误"': 'label:"Agent Auto-Fix Lints"',
    'children:"打开系统偏好设置"': 'children:"Open System Preferences"',
    'placeholder:"询问任何问题，使用 @ 提及，使用 / 调用工作流"':
        'placeholder:"Ask anything, @ to mention, / for workflows"',
};

function findDir() {
    const candidates = [
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
        path.join('C:', 'Program Files', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
        '/Applications/Antigravity.app/Contents/Resources/app/out/jetskiAgent',
        '/opt/Antigravity/resources/app/out/jetskiAgent',
        path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
    ];
    return candidates.find(p => fs.existsSync(p));
}

function revertFile(f) {
    try {
        let content = fs.readFileSync(f, 'utf8');
        let changed = false;
        for (const [zh, en] of Object.entries(dict)) {
            if (content.includes(zh)) { content = content.split(zh).join(en); changed = true; }
        }
        if (changed) { fs.writeFileSync(f, content, 'utf8'); console.log(`  [OK] ${f}`); }
    } catch (e) { console.error(`  [FAIL] ${f}`, e.message); }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (/\.(js|html|css)$/.test(f)) revertFile(full);
    }
}

console.log('=== Antigravity ZH-CN 还原脚本 ===');
const dir = findDir();
if (!dir) { console.error('未找到 Antigravity 目录'); process.exit(1); }
console.log('目标目录:', dir);
walk(dir);
console.log('\n还原完毕！请完全退出并重新启动 Antigravity。');
