# AI Language Learning App (LingoGen.ai)

一个基于 AI 的智能语言学习应用，使用大语言模型帮助你高效学习英语单词。

## ✨ 核心功能

### 1. 🤖 AI 驱动的单词分析
- 自定义大模型 API 配置（支持 OpenAI 及兼容接口）
- 智能生成单词翻译、发音、定义
- 创意记忆法（Mnemonic）帮助记忆
- AI 生成配套图片增强视觉记忆

### 2. 🔊 语音朗读功能
- 点击喇叭图标即可朗读单词
- 使用浏览器内置 Web Speech API
- 支持调节语速，适合学习者

### 3. 💾 数据持久化
- 所有学习记录自动保存到 localStorage
- 学习历史、进度统计永久保存
- 支持导出和导入（未来功能）

### 4. 📊 学习进度追踪
- **总词汇量**：累计学习的单词数
- **学习连续天数**：激励每天学习
- **今日新词**：今天学习的新单词数
- **今日复习**：今天复习的单词数

### 5. 🔄 间隔重复学习系统（Spaced Repetition）
- 基于 SuperMemo SM-2 算法
- 智能调度复习时间
- 根据掌握程度（学习中/熟悉/精通）动态调整
- 复习评分系统：忘记/困难/良好/完美

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 1. 配置 API

首次使用需要配置大模型 API：

1. 点击左侧边栏底部的 **Settings** 按钮
2. 选择 AI 提供商（我们支持以下主流大模型）：
   - **DeepSeek**：国产高性价比大模型，推荐 ⭐
   - **智谱 AI (GLM)**：清华技术，强大的中文理解能力
   - **通义千问 (Qwen)**：阿里云大模型，性能优异
   - **Moonshot AI (Kimi)**：月之暗面，长文本处理专家
   - **百度文心一言**：百度大模型，国内领先
   - **OpenAI**：使用官方 OpenAI API
   - **自定义**：兼容 OpenAI 格式的其他 API

3. 填写配置信息：
   - **API Key**：你的 API 密钥（本地存储，不会上传服务器）
   - **Model**：模型名称（自动填充推荐模型）
   - **Base URL**：API 端点地址（自动填充）

4. 点击 **测试连接** 验证配置
5. 点击 **保存配置** 完成设置

### 2. 学习新单词

1. 在主页搜索框输入单词（例如：Serendipity）
2. AI 会生成完整的单词分析：
   - 中文翻译
   - 音标发音
   - 英文定义
   - 记忆技巧
   - 示例图片
   - 例句

3. 点击喇叭图标 🔊 听发音
4. 使用底部聊天框向 AI 提问单词用法

### 3. 复习单词

当有单词到期需要复习时：

1. 左侧边栏会显示 **Review X words** 按钮
2. 点击进入复习模式
3. 看到单词后，评估你的掌握程度：
   - **Forgot**（忘记）：重新开始学习
   - **Hard**（困难）：缩短复习间隔
   - **Good**（良好）：正常间隔
   - **Easy**（完美）：延长复习间隔

## 🛠 技术栈

- **前端框架**：Next.js 15+ (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **AI 集成**：OpenAI API（可自定义）
- **图片生成**：Pollinations.ai
- **语音合成**：Web Speech API
- **数据存储**：localStorage

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate-word/route.ts  # 单词生成 API
│   │   └── chat/route.ts           # 聊天 API
│   ├── settings/page.tsx           # 设置页面
│   └── page.tsx                    # 主页面
├── types/
│   └── index.ts                    # TypeScript 类型定义
└── lib/
    └── utils.ts                    # 工具函数（localStorage、间隔重复算法）
```

## 🎯 使用场景

### 备考场景
- 输入考试大纲单词
- 系统化学习和复习
- 利用间隔重复算法高效记忆

### 阅读场景
- 遇到生词立即查询
- 保存到学习历史
- 自动安排复习

### 口语场景
- 学习单词发音
- 通过聊天了解实际用法
- 背诵例句

## ⚙️ 配置建议

### API 提供商选择

**DeepSeek（推荐）**：
- API Key 获取：https://platform.deepseek.com
- 推荐模型：`deepseek-chat`（性价比最高）
- 特点：价格低廉、中英文能力强、推理能力出色
- 费用：输入 ¥1/百万tokens，输出 ¥2/百万tokens

**智谱 AI (GLM)**：
- API Key 获取：https://open.bigmodel.cn
- 推荐模型：`glm-4`、`glm-4-air`
- 特点：清华团队开发，中文理解优秀
- 费用：按token计费，有免费额度

**通义千问 (Qwen)**：
- API Key 获取：https://dashscope.aliyun.com
- 推荐模型：`qwen-turbo`、`qwen-plus`
- 特点：阿里云出品，稳定可靠
- 费用：按token计费

**Moonshot AI (Kimi)**：
- API Key 获取：https://platform.moonshot.cn
- 推荐模型：`moonshot-v1-8k`
- 特点：长文本处理能力强
- 费用：按token计费

**OpenAI 官方**：
- API Key 获取：https://platform.openai.com/api-keys
- 推荐模型：`gpt-3.5-turbo`（快速、便宜）或 `gpt-4`（更准确）
- 特点：技术领先，但需要国际信用卡
- 费用：按 token 计费

**自定义提供商**：
- 支持任何兼容 OpenAI 格式的 API
- 如：Azure OpenAI、本地部署的 LocalAI、Ollama 等

### 模型选择建议

| 提供商 | 推荐模型 | 适用场景 | 性价比 |
|------|---------|----------|--------|
| DeepSeek | deepseek-chat | 日常学习、深度推理 | ⭐⭐⭐⭐⭐ |
| 智谱 GLM | glm-4-air | 中文词汇学习 | ⭐⭐⭐⭐ |
| 通义千问 | qwen-turbo | 快速查询 | ⭐⭐⭐⭐ |
| Moonshot | moonshot-v1-8k | 长文本学习 | ⭐⭐⭐ |
| OpenAI | gpt-3.5-turbo | 英文词汇学习 | ⭐⭐⭐ |

## 🔒 隐私安全

- ✅ API Key 仅存储在浏览器本地
- ✅ 所有学习数据保存在本地
- ✅ 不会上传任何数据到第三方服务器
- ✅ 开源代码，可自行审计

## 📝 未来功能计划

- [ ] 导出/导入学习数据
- [ ] 支持更多语言（目前仅英语→中文）
- [ ] 添加生词本分类管理
- [ ] 支持短语和句子学习
- [ ] 离线模式
- [ ] 浏览器扩展版本
- [ ] 移动端 App

## 🐛 常见问题

**Q: 为什么显示 "API not configured"？**
A: 需要先在 Settings 页面配置你的 API Key。

**Q: 语音朗读不工作？**
A: 确保浏览器支持 Web Speech API（Chrome、Safari、Edge 支持）。

**Q: 数据会丢失吗？**
A: 数据保存在浏览器 localStorage，除非清除浏览器缓存，否则不会丢失。

**Q: 可以同步到其他设备吗？**
A: 目前暂不支持，未来会添加云同步功能。

**Q: API 调用失败怎么办？**
A: 检查 API Key 是否正确、账户是否有余额、网络是否正常。

## 📦 构建生产版本

```bash
npm run build
npm start
```

## 📄 许可证

MIT License

## 🙏 致谢

- Next.js Team
- OpenAI
- Pollinations.ai
- Tailwind CSS
- Lucide Icons

---

**开始你的 AI 语言学习之旅吧！** 🚀
