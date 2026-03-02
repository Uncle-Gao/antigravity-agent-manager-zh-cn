import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// =======================================================================
// 中英文替换字典
//
// 安全规则：
//   ✅ text:"..."   — 主界面导航按钮显示文字（JSX属性，纯展示）
//   ✅ label:"..."  — Settings 具体配置项的名称（非下拉选项值）
//   ✅ placeholder:"..." / children:"..."
//
//   ❌ 枚举值  e.X="X"         → 被用于路由/条件渲染，不能改
//   ❌ title:"X"               → 被用作 section 查找 key，不能改
//   ❌ 下拉选项标签 label:"Disabled" / "Always Proceeds" 等
//                              → 可能被用作选项匹配 key，不能改
// =======================================================================
const translationDict: Record<string, string> = {

    // ── 主界面导航按钮 ──────────────────────────────────────────────────
    'text:"Start conversation"': 'text:"发起对话"',
    'text:"Workspaces"': 'text:"工作区"',
    'text:"Playground"': 'text:"游乐场"',
    'text:"Knowledge"': 'text:"知识库"',
    'text:"Browser"': 'text:"浏览器"',
    'text:"Settings"': 'text:"设置"',
    'text:"Provide Feedback"': 'text:"提供反馈"',
    'text:"Open Editor"': 'text:"打开编辑器"',
    'text:"Open editor"': 'text:"打开编辑器"',
    'text:"Use Playground"': 'text:"使用游乐场"',
    'text:"Start new conversation"': 'text:"发起新对话"',
    'label:"Agent Manager"': 'label:"智能体管理器"',

    // ── 设置项名称（纯展示，非下拉选项值，非 section key）─────────────
    'label:"Strict Mode"': 'label:"严格模式"',
    'label:"Review Policy"': 'label:"审查策略"',
    'label:"Terminal Command Auto Execution"': 'label:"终端命令自动执行"',
    'label:"Allow List Terminal Commands"': 'label:"终端命令允许列表"',
    'label:"Deny List Terminal Commands"': 'label:"终端命令拒绝列表"',
    'label:"Explain and Fix in Current Conversation"': 'label:"在当前对话中解释并修复"',
    'label:"Enable Browser Tools"': 'label:"启用浏览器工具"',
    'label:"Browser Javascript Execution Policy"': 'label:"浏览器 JS 执行策略"',
    'label:"Browser URL Allowlist"': 'label:"浏览器 URL 允许列表"',
    'label:"Agent Auto-Fix Lints"': 'label:"智能体自动修复 Lint 错误"',
    'label:"Enable Shell Integration"': 'label:"启用 Shell 集成"',
    'label:"Agent Gitignore Access"': 'label:"启用 Agent 读取 .gitignore"',
    'label:"Agent Non-Workspace File Access"': 'label:"启用 Agent 访问非工作区文件"',
    'label:"Auto-Open Edited Files"': 'label:"自动打开已编辑文件"',
    'label:"Follow Along by Default"': 'label:"默认跟随智能体活动"',
    'label:"Enable Sounds for Agent"': 'label:"启用智能体提示音"',
    'label:"Auto-Expand Changes Overview"': 'label:"自动展开变更概览"',
    'label:"Notification Settings"': 'label:"通知设置"',
    'label:"Suggestions in Editor"': 'label:"在编辑器中显示建议"',
    'label:"Tab Speed"': 'label:"Tab 建议生成速度"',
    'label:"Highlight After Accept"': 'label:"接受后高亮文本"',
    'label:"Tab to Import"': 'label:"启用 Tab 自动导入"',
    'label:"Tab to Jump"': 'label:"启用 Tab 跳转预测"',
    'label:"Clipboard Context"': 'label:"启用剪贴板上下文"',
    'label:"Tab Gitignore Access"': 'label:"启用 Tab 读取 .gitignore"',
    'label:"Open Agent on Reload"': 'label:"重启时打开智能体面板"',
    'label:"Conversation History"': 'label:"启用历史对话参考"',
    'label:"Knowledge"': 'label:"启用知识库参考"',
    'label:"Auto-Continue"': 'label:"自动继续生成"',
    'label:"Enable Workspace API"': 'label:"启用 Workspace API"',
    'label:"Confirm Window Reload"': 'label:"确认窗口刷新"',

    // ── Editor ────────────────────────────────────────────────────────
    'label:"Marketplace Item URL"': 'label:"插件市场项目 URL"',
    'label:"Marketplace Gallery URL"': 'label:"插件市场搜索 URL"',
    'label:"Show Selection Actions"': 'label:"显示选中内容操作"',
    'children:"Editor Settings"': 'children:"编辑器设置"',

    // ── Customizations (Skills & MCP) ──────────────────────────────────
    'label:"Skill Custom Paths"': 'label:"自定义技能路径"',
    'title:"Customize Global Skills"': 'title:"配置全局技能"',
    'title:"Installed MCP Servers"': 'title:"已安装的 MCP 服务器"',

    // ── Browser ───────────────────────────────────────────────────────
    'label:"Chrome Binary Path"': 'label:"Chrome 执行文件路径"',
    'label:"Browser User Profile Path"': 'label:"浏览器用户配置路径"',
    'label:"Browser CDP Port"': 'label:"浏览器 CDP 端口"', 'placeholder:"Ask anything, @ to mention, / for workflows"':
        'placeholder:"询问任何问题，使用 @ 提及，使用 / 调用工作流"',

    // ── Category Headers ──────────────────────────────────────────────
    'title:"General"': 'title:"常规"',
    'title:"Suggestions"': 'title:"建议"',
    'title:"Navigation"': 'title:"导航"',
    'title:"Context"': 'title:"上下文"',
    'title:"Marketplace"': 'title:"插件市场"',
    'title:"Selection Actions"': 'title:"选中操作"',
    'title:"Add MCP Servers"': 'title:"添加 MCP 服务器"',
    'children:"ADD MCP SERVERS"': 'children:"添加 MCP 服务器"',
    'title:"File Access"': 'title:"文件访问"',
    'title:"Automation"': 'title:"自动化"',
    'title:"Terminal"': 'title:"终端"',
    'title:"Advanced"': 'title:"高级"',
    'title:"Security"': 'title:"安全"',
    'title:"Artifact"': 'title:"工件"',
    'title:"Allowlist"': 'title:"允许列表"',
    'title:"Denylist"': 'title:"拒绝列表"',
    'title:"History"': 'title:"历史"',
    'title:"Model Quota"': 'title:"模型配额"',
    'children:"Advanced settings"': 'children:"高级设置"',
    'children:"Open System Preferences"': 'children:"打开系统偏好设置"',
    'title:"Notification Settings"': 'title:"通知设置（标题）"',
    'children:"Notification Settings"': 'children:"通知设置"',
    'children:"Open Editor Settings"': 'children:"打开编辑器设置"',
    'title:"Account"': 'title:"账户"',
    'label:"Enable Telemetry"': 'label:"启用遥测"',
    'label:"Marketing Emails"': 'label:"营销邮件"',
    'children:"Refresh"': 'children:"刷新"',
    'children:"Open MCP Config"': 'children:"打开 MCP 配置"',
    'children:u||"Upgrade"': 'children:u||"升级"',
    'children:r.userTier?.upgradeButtonText||"Upgrade"': 'children:r.userTier?.upgradeButtonText||"升级"',
    'children:"Sign out"': 'children:"退出登录"',
    'children:["Your Plan: ",a]': 'children:["您的订阅计划：",a]',

    // ── 设置项描述文字（description: 精确匹配）────────────────────────

    // Agent - Terminal（反引号模板字面量，需用 ` 匹配）
    'description:`\u2022 Always Proceed - Agent never asks for confirmation before executing terminal commands (except those in the Deny list). This provides the Agent with the maximum ability to operate over long periods without intervention, but also has the highest risk of an Agent executing an unsafe terminal command.\n        \u2022 Request Review - Agent always asks for confirmation before executing terminal commands (except those in the Allow list).\n\n        Note: A change to this setting will only apply to new messages sent to Agent. In-progress responses will use the previous setting value.\n        `':
        'description:`\u2022 始终执行 - 智能体无需确认即自动执行终端命令（拒绝列表中的命令除外）。这将赋予智能体在长时间内持续操作的最大能力，但也对智能体执行不安全命令带来最高风险。\n        \u2022 请求确认 - 智能体在执行终端命令前始终请求确认（允许列表中的命令除外）。\n\n        注意：此设置的更改仅适用于发送到智能体的新消息，进行中的响应将使用之前的设置值。\n        `',


    'children:"No MCP Servers"': 'children:"无 MCP 服务器"',
    'children:"You currently don\'t have any MCP Servers installed. Add a MCP tool below or add a custom one via the MCP Config."': 'children:"您目前尚未安装任何 MCP 服务器。请在下方添加 MCP 工具，或通过 MCP 配置添加自定义。"',

    // Agent - Security
    'description:"When enabled, enforces settings that prevent the agent from autonomously running targeted exploits and requires human review for all agent actions. Visit antigravity.google/docs/strict-mode for details."':
        'description:"启用后，将强制执行阻止智能体自主运行针对性漏洞利用攻击的设置，并要求人工审查所有智能体操作。详情访问 antigravity.google/docs/strict-mode。"',

    // Agent - Terminal
    'description:"Agent auto-executes commands matched by an allow list entry. For Unix shells, an allow list entry matches a command if its space-separated tokens form a prefix of the command\'s tokens. For PowerShell, the entry tokens may match any contiguous subsequence of the command tokens."':
        'description:"智能体自动执行与允许列表条目匹配的命令。对于 Unix shell，允许列表条目匹配其以空格分隔的 token 构成命令 token 前缀的命令。对于 PowerShell，条目 token 可匹配命令 token 的任意连续子序列。"',

    'description:"Agent asks for permission before executing commands matched by a deny list entry. The deny list follows the same matching rules as the allow list and takes precedence over the allow list."':
        'description:"智能体在执行与拒绝列表条目匹配的命令前会请求权限。拒绝列表遵循与允许列表相同的匹配规则，且优先级高于允许列表。"',

    // Agent - Automation
    'description:"When enabled, Agent is given awareness of lint errors created by its edits and may fix them without explicit user prompting."':
        'description:"启用后，智能体将感知其编辑产生的 Lint 错误，并可在无需用户明确提示的情况下自动修复。"',

    'description:"When enabled, Agent will automatically continue its response when it reaches its per-response invocation limit. If this setting is off, Agent will instead prompt you to continue upon reaching the limit."':
        'description:"启用后，当智能体达到单次响应调用上限时，将自动继续其响应。若关闭此设置，达到上限时将提示您手动继续。"',

    // Agent - History
    'description:"When enabled, the agent will be able to access past conversations to inform its responses."':
        'description:"启用后，智能体将能够访问历史对话以辅助生成响应。"',

    'description:"When enabled, the agent will be able to access its knowledge base to inform its responses and automatically generate knowledge items in the background. Disabling this will prevent the agent from accessing existing knowledge items, but will not delete them."':
        'description:"启用后，智能体将能访问其知识库以辅助响应，并在后台自动生成知识条目。禁用后将阻止智能体访问现有知识条目，但不会删除它们。"',

    // Agent - General

    // 修复这里的匹配，因为 main.js 内部实际是双引号：
    // label:"Explain and Fix in Current Conversation",description:"When enabled, \"Explain and Fix\" actions will continue in the current conversation instead of starting a new one."
    'description:\'When enabled, "Explain and Fix" actions will continue in the current conversation instead of starting a new one.\'':
        'description:\'启用后，“解释并修复”操作将在当前对话中继续，而非开启新对话。\'',

    'description:"Open Agent panel on window reload"':
        'description:"窗口重新加载时打开智能体面板"',

    'description:"When enabled, Agent will use IDE\'s shell integration to detect and report terminal command execution. When disabled, the agent will use it\'s own shell. Restart the application for this to take effect."':
        'description:"启用后，智能体将使用 IDE 的 Shell 集成来检测和报告终端命令执行情况。禁用时，智能体将使用其自带的 shell。更改后需重启应用才能生效。"',

    'description:"Allow Agent to view and edit files outside of the current workspace automatically. Use with caution: this provides the Agent access to additional potentially-relevant information, but also allows the Agent to access credential files, secrets, and other files outside of the workspace that could be targeted in prompt injection attacks or other exploits by malicious actors."':
        'description:"允许智能体自动查看和编辑当前工作区以外的文件。请谨慎使用：这将赋予智能体访问其他潜在相关信息的权限，但也允许智能体访问凭据文件、机密文件以及工作区之外的其他文件，而这些文件可能成为恶意行为者进行提示词注入攻击或其他漏洞利用的目标。"',

    'description:"Allow Agent to view and edit the files in .gitignore automatically. Use with caution if your .gitignore lists files containing credentials, secrets, or other sensitive information."':
        'description:"允许智能体自动查看和编辑 .gitignore 中的文件。如果您的 .gitignore 包含凭据、机密信息或其他敏感信息的文件，请谨慎使用。"',

    'description:"Automatically follow along the agent\'s current activity in new conversations"':
        'description:"在新对话中自动跟随智能体的当前活动"',

    'description:"When enabled, Antigravity will play a sound when Agent finishes generating a response."':
        'description:"启用后，智能体生成响应完毕时 Antigravity 将播放提示音。"',

    'description:"When enabled, the Changes Overview toolbar will automatically expand when Agent finishes generating a response."':
        'description:"启用后，智能体生成响应完毕时，变更概览工具栏将自动展开。"',

    'description:"Open files in the background if Agent creates or edits them"':
        'description:"如果智能体创建或编辑了文件，在后台打开这些文件"',

    // Browser tab
    'description:"When enabled, Agent can use browser tools to open URLs, read web pages, and interact with browser content. This allows the Agent access to important (and often critical) knowledge and methods of validation, but any browser integration does increase exposure to external malicious parties for security exploits."':
        'description:"启用后，智能体可使用浏览器工具打开 URL、阅读网页并与浏览器内容交互。这能让智能体访问重要的知识和验证方法，但也会增加遭受外部恶意攻击的安全风险。"',

    'description:"Control which URLs the browser can access. Add domains or full URLs to the allowlist."':
        'description:"控制浏览器可访问的 URL 范围。可添加域名或完整 URL 到允许列表。"',

    'description:"Path to the Chrome/Chromium executable. Leave empty for auto-detection."':
        'description:"Chrome/Chromium 可执行文件路径。留空则自动检测。"',

    'description:"Port number for Chrome DevTools Protocol remote debugging. Leave empty for default (9222)."':
        'description:"Chrome DevTools Protocol 远程调试端口号。留空则使用默认值（9222）。"',

    'description:"Custom path for the browser user profile directory. Leave empty for default (~/.gemini/antigravity-browser-profile)."':
        'description:"浏览器用户配置目录的自定义路径。留空则使用默认路径（~/.gemini/antigravity-browser-profile）。"',

    // Tab tab
    'description:"Allow Tab to view and edit the files in .gitignore. Use with caution if your .gitignore lists files containing credentials, secrets, or other sensitive information."':
        'description:"允许 Tab 查看和编辑 .gitignore 中的文件。如果您的 .gitignore 包含凭据、机密信息或其他敏感信息的文件，请谨慎使用。"',

    'description:"Highlight newly inserted text after accepting a Tab completion."':
        'description:"接受 Tab 补全后高亮显示新插入的文本。"',

    'description:"Predict the location of your next edit and navigates you there with a tab keypress."':
        'description:"预测您的下一次编辑位置，并通过按 Tab 键跳转到该位置。"',

    'description:"Quickly add and update imports with a tab keypress."':
        'description:"按 Tab 键快速添加和更新导入语句。"',

    'description:"Set the speed of tab suggestions"':
        'description:"设置 Tab 建议的速度"',

    'description:"Show suggestions when typing in the editor"':
        'description:"在编辑器中输入时显示建议"',

    // Agent - Plan mode
    'description:"Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work"':
        'description:"智能体可在执行任务前进行规划。适用于深度研究、复杂任务或协作工作"',

    'description:"Agent will execute tasks directly. Use for simple tasks that can be completed faster"':
        'description:"智能体将直接执行任务。适用于可快速完成的简单任务"',

    // Notifications
    'description:"When enabled, Agent can interact with Google Workspace through the API to search and read documents."':
        'description:"启用后，智能体可通过 API 与 Google Workspace 交互，以搜索和阅读文档。"',

    // --- Newly Exact Extracted Elements ---
    'description:`When enabled, ${cAe.name} will use the clipboard as context for completions. May increase exposure to security exploits based on unintentional contents in clipboard.`':
        'description:`启用后，${cAe.name}将使用剪贴板作为自动补全的上下文。这可能会因剪贴板中无意的内容增加遭受安全漏洞攻击的风险。`',

    'description:`Changes the base URL on each extension page. You must restart ${t.nameShort} to use the new marketplace after changing this value.`':
        'description:`更改每个扩展页面上的基础 URL。更改此值后您必须重启 ${t.nameShort} 才能使用新的插件市场。`',

    'description:`Changes the base URL for marketplace search results. You must restart ${t.nameShort} to use the new marketplace after changing this value.`':
        'description:`更改插件市场搜索结果的基础 URL。更改此值后您必须重启 ${t.nameShort} 才能使用新的插件市场。`',

    'description:\'Show "Edit" and "Chat" buttons when selecting text in the editor.\'':
        'description:\'在编辑器中选择文本时显示“编辑”和“聊天”按钮。\'',

    'children:"To modify editor settings, open Settings within the editor window."':
        'children:"要修改编辑器设置，请在编辑器窗口内打开设置。"',

    'children:"To modify notification settings, open your operating system\'s system preferences."':
        'children:"要修改通知设置，请打开您操作系统的系统偏好设置。"',

    '`In addition to the custom skills folder, Antigravity will search the following paths in order to find skills for the agent.${n?`\n\nFor google3 workspaces, paths are relative to //depot and begins with google3/`:""}`':
        '`除自定义技能文件夹外，Antigravity 还将按顺序搜索以下路径以查找智能体的技能。${n?`\\n对于 google3 工作区，路径相对于 //depot 且以 // 开头。`:""}`',

    '`When toggled on, ${t.product.nameShort} collects usage data to help Google enhance performance and features.`':
        '`开启后，${t.product.nameShort} 将收集使用数据以帮助 Google 提升性能和功能。`',

    '`Receive product updates, tips, and promotions from Google ${t.product.nameShort} via email.`':
        '`通过电子邮件接收来自 Google ${t.product.nameShort} 的产品更新、提示和促销信息。`',

    'children:["Google ",r.nameShort," Terms of Service"]': 'children:["Google ",r.nameShort," 服务条款"]',
    'children:"Terms of Service"': 'children:"服务条款"',

    // --- Advanced settings / Demo Mode ---
    'label:"Enable Demo Mode (Beta)"': 'label:"启用演示模式（测试版）"',

    'description:\'When enabled, your UI will be slightly modified to ensure more consistent demos. This is only recommended for demo purposes. In most cases, you can run "Antigravity: Start Demo Mode" and "Antigravity: Stop Demo Mode" to control this switch and update your ~/.gemini/antigravity data directory.\'':
        'description:\'启用后，您的 UI 将被稍微修改以确保演示更加一致。仅建议在演示时使用。大多数情况下，您可以运行“Antigravity: Start Demo Mode”和“Antigravity: Stop Demo Mode”来控制此开关并更新您的 ~/.gemini/antigravity 数据目录。\'',

};



// 获取 Antigravity 应用本体中 jetskiAgent 目录
// =======================================================================
function getJetskiAgentPath(): string | undefined {
    const possible = [
        path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
        path.join('C:', 'Program Files', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
        path.join('/', 'Applications', 'Antigravity.app', 'Contents', 'Resources', 'app', 'out', 'jetskiAgent'),
        path.join('/opt', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
        path.join(os.homedir(), '.local', 'share', 'Antigravity', 'resources', 'app', 'out', 'jetskiAgent'),
    ];
    return possible.find(p => fs.existsSync(p));
}

// =======================================================================
// 递归处理文件
// =======================================================================
function processDirectory(dir: string, fn: (f: string) => void) {
    if (!fs.existsSync(dir)) { return; }
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            processDirectory(full, fn);
        } else if (/\.(js|html|css)$/.test(file)) {
            fn(full);
        }
    }
}

function patchFile(filePath: string) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        for (const [en, zh] of Object.entries(translationDict)) {
            if (content.includes(en)) {
                content = content.split(en).join(zh);
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[ZH-CN] Patched: ${filePath}`);
        }
    } catch (e) { console.error(`[ZH-CN] Patch failed: ${filePath}`, e); }
}

function revertFile(filePath: string) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        for (const [en, zh] of Object.entries(translationDict)) {
            if (content.includes(zh)) {
                content = content.split(zh).join(en);
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[ZH-CN] Reverted: ${filePath}`);
        }
    } catch (e) { console.error(`[ZH-CN] Revert failed: ${filePath}`, e); }
}

// =======================================================================
// 命令
// =======================================================================
async function applyPatch() {
    const dir = getJetskiAgentPath();
    if (!dir) {
        vscode.window.showWarningMessage('未找到 Antigravity 应用目录，请确保 Antigravity 已正确安装。');
        return;
    }

    // --- Version Check Logic ---
    const appDir = path.resolve(dir, '..', '..');
    const packageJsonPath = path.join(appDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const currentVersion = pkgData.version;
            const supportedVersion = '1.107.0';
            if (currentVersion && currentVersion !== supportedVersion) {
                const choice = await vscode.window.showWarningMessage(
                    `检测到您的 Antigravity 版本 (v${currentVersion}) 可能不兼容当前的汉化包（支持版本: v${supportedVersion}）。\n强行汉化可能导致界面乱码或部分操作失效。是否强行继续？`,
                    { modal: true },
                    '强行继续'
                );
                if (choice !== '强行继续') {
                    return;
                }
            }
        } catch (e) {
            console.error('Failed to parse package.json for version check', e);
        }
    }
    // ---------------------------

    processDirectory(dir, patchFile);
    vscode.window.showInformationMessage('✅ Agent Manager 汉化补丁应用成功！请完全退出并重新启动 Antigravity 以生效。');
}

function revertPatch() {
    const dir = getJetskiAgentPath();
    if (!dir) {
        vscode.window.showWarningMessage('未找到 Antigravity 应用目录。');
        return;
    }
    processDirectory(dir, revertFile);
    vscode.window.showInformationMessage('✅ Agent Manager 汉化已还原！请完全退出并重新启动 Antigravity 以生效。');
}

// =======================================================================
// 扩展入口
// =======================================================================
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('antigravity-agent-manager-zh-cn.applyPatch', applyPatch),
        vscode.commands.registerCommand('antigravity-agent-manager-zh-cn.revertPatch', revertPatch),
    );
}

export function deactivate() { }
