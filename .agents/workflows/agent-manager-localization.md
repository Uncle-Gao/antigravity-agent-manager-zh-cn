---
name: Agent Manager Localization
description: 如何维护和更新 Antigravity 内置 Agent Manager 及其设置面板的中文汉化补丁。
---

# Agent Manager 汉化指南 (ZH-CN)

本技能记录了如何为 Antigravity Agent Manager（包含智能体聊天面板、设置页面等）的内置 React UI 提供并维护中文翻译。

由于 Antigravity 的内部 UI 没有提供标准的 VS Code 本地化 API 接口，我们必须直接对编译后的 JavaScript 产物包（`main.js`）进行字符串替换补丁。

## 目标文件位置

UI 代码被编译并压缩在单个 React bundle 中。
根据用户的操作系统和安装方式不同，其位置通常在：

**Windows**: `%LOCALAPPDATA%\Programs\Antigravity\resources\app\out\jetskiAgent\main.js`
**macOS**: `/Applications/Antigravity.app/Contents/Resources/app/out/jetskiAgent/main.js`

## 汉化方法学

我们在 `main.js` 中执行原始字符串替换。但是，由于这是一个经过混淆压缩的 React 应用，替换错误的字符串（例如对象键名或路由 ID）将会导致应用崩溃或白屏。

### 安全替换规则

1. **针对特定的对象属性**：
   千万不要直接替换像 `"Browser"` 这样的孤立字符串。相反，应针对特定的 React 属性赋值进行替换：
   - ✅ **安全**：`'label:"Browser"'`, `'text:"Browser"'`, `'children:"Settings"'`
   - ❌ **危险**：`"Browser"`, `e.Browser="Browser"`（这通常是一个用于路由状态的枚举值）。

2. **说明文字 / 较长的文本**：
   长段的描述文本通常位于 `description:` 属性中。
   - 文本可能被双引号 `""`、单引号 `''` 或者是反引号 (模板字面量) `` `` `` 包含。
   - 您**必须**从 `main.js` 中提取出保留了原始引号在内的**精确字符串**。因为代码压缩往往会删除空格、改变标点符号（如转义字符或智能引号）。
   - 如果模板字面量包含动态变量（例如 `` `${t.nameShort}` ``），您在翻译的键值中也必须保留该变量的精准语法。

3. **路由键名 (极为关键)**：
   绝对不要翻译被用作内部标识符、或者决定渲染逻辑的模块标题字符串。
   - 设置选项卡上的 **`title:` 属性**（如 `title:"Agent - Browser"`）往往被用作映射键以定位内容。除非你确认它只影响显示效果，否则不要翻译它。
   - **枚举值**：像 `e.Agent = "Agent"` 这样的字符串用于 React 的状态路由。将等号右侧的 `"Agent"` 改为 `"智能体"` 会导致点击该面板时渲染出一片空白。

### 提取脚本示例

当 Antigravity 更新或加入新功能时，会出现新的英文文本。我们使用 Node 脚本从 `main.js` 中安全提取精确的原始字符串。

**示例：提取精确的 `description:` 值**
如果您在界面上看到未翻译的说明，编写类似如下的脚本，在压缩代码中找到它的确切表示形式：

```javascript
const fs = require('fs');
const mainJsPath = 'C:\\...\\main.js'; // 替换为真实的本地路径
const c = fs.readFileSync(mainJsPath, 'utf8');

const targetSubtring = 'Agent auto-executes commands matched'; // 界面上的部分文本
const idx = c.indexOf(targetSubtring);

if (idx >= 0) {
  // 截取该子串前后的代码块
  let chunk = c.substring(Math.max(0, idx - 100), Math.min(c.length, idx + 400));
  let descStart = chunk.indexOf('description:');
  if (descStart > -1) {
    let content = chunk.substring(descStart + 12);
    let delimiter = content[0]; // 将会是 ", ', 或者 `
    let textEnd = content.indexOf(delimiter, 1);
    if (textEnd > -1) {
      console.log('可用于替换字典键名的精确字符串：');
      console.log('description:' + delimiter + content.substring(1, textEnd) + delimiter);
    }
  }
}
```

## 维护工作流

当 Antigravity 发布新版本时：

1. **还原补丁**：在更新软件前，用户必须先运行 `还原 Agent Manager 汉化 (Revert ZH-CN Patch)` 命令，恢复原版的 `main.js`。
2. **更新应用**：让用户更新 Antigravity 客户端。
3. **验证设置面板**：打开新版本并检查设置及面板，找出新出现的英文文本。
4. **提取新文本**：使用上述的提取脚本精确获取新的 `label:`, `children:`, 或 `description:` 字符串。
5. **更新翻译字典**：将提取出来的精确英文字符串及对应的中文等效项添加到 `src/extension.ts` 中的翻译字典里。
6. **编译与打包**：在工程下运行 `npm run compile` 及 `npm run package` 生成新的 `.vsix` 文件。
7. **部署更新**：让用户安装新的 `.vsix` 文件并重新执行 `汉化 Agent Manager (Apply ZH-CN Patch)` 命令。

## 已知限制

- **从云端获取的数据**：设置面板中的部分列表（例如从 registry 获取的 "安装的 MCP 服务器" 列表）是通过 API 从云端动态加载的。这些字符串并未硬编码在 `main.js` 中，因此**无法**通过修改本地文件的补丁方式进行汉化。同理，由这些外部服务抛出的错误提示也无法在本地被汉化。
- **动态变量注入**：如果界面字符串是由带有不可预测变量的复杂字符串拼接而成的，并且在每次执行时都在变化，那么它可能无法通过死板的文本替换来修复（可能需要复杂的正则表达式替换器）。请尽可能使用精确的 `indexOf` 级别文本查找并替换。
