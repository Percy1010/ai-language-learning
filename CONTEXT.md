# 项目开发上下文

## 项目概述
**项目名称**：LingoGen.ai - AI 语言学习应用
**项目路径**：`/Users/Percy/coding/ai-language-learning`
**创建日期**：2025-11-20
**技术栈**：Next.js 15 + TypeScript + Tailwind CSS

## 核心功能（已实现）

### ✅ 1. 多提供商 AI 集成
- 支持 7 个主流大模型：DeepSeek、智谱GLM、通义千问、Moonshot、文心一言、OpenAI、自定义
- 自定义 API 配置（Key、Base URL、Model）
- 智能预设配置，选择即用

### ✅ 2. 语音朗读
- 使用 Web Speech API
- 点击喇叭图标朗读单词

### ✅ 3. 数据持久化
- localStorage 保存所有学习数据
- 学习历史、进度统计、API 配置

### ✅ 4. 学习进度追踪
- 总词汇量、连续天数、今日学习、今日复习
- 实时统计更新

### ✅ 5. 间隔重复学习系统
- 基于 SuperMemo SM-2 算法
- 三种掌握程度：learning / familiar / mastered
- 四级复习评分：Forgot / Hard / Good / Easy

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate-word/route.ts   # 单词生成API（支持多提供商）
│   │   └── chat/route.ts            # AI聊天API
│   ├── settings/page.tsx            # 设置页面（多提供商UI）
│   └── page.tsx                     # 主页面（完整功能）
├── types/
│   └── index.ts                     # 类型定义（AIProvider等）
└── lib/
    └── utils.ts                     # 工具函数（localStorage、SM-2算法）
```

## 关键技术实现

### API 提供商配置
```typescript
// src/types/index.ts
export type AIProvider = 'openai' | 'deepseek' | 'zhipu' | 'qwen' | 'moonshot' | 'ernie' | 'custom';

// src/app/settings/page.tsx
const PROVIDER_PRESETS: Record<AIProvider, ProviderPreset> = {
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    // ...
  },
  // ...
};
```

### 间隔重复算法
```typescript
// src/lib/utils.ts
export const calculateNextReview = (
  quality: number,      // 0-5
  repetitions: number,
  easeFactor: number,
  interval: number
) => { /* SM-2 算法实现 */ }
```

### 数据持久化
- 使用 localStorage
- 自动序列化 Date 对象
- 三个存储键：
  - `lingo-words` - 单词列表
  - `lingo-stats` - 学习统计
  - `lingo-api-config` - API配置

## 开发服务器
```bash
npm run dev
# http://localhost:3000
```

## 下次对话时提供的信息

### 快速上下文模板
```
我在开发 AI 语言学习应用（LingoGen.ai），位于 /Users/Percy/coding/ai-language-learning。

项目基于 Next.js 15 + TypeScript，已实现：
- 多提供商AI集成（DeepSeek、GLM、Qwen等）
- 语音朗读、数据持久化、进度追踪
- 间隔重复学习系统（SM-2算法）

现在需要：[描述你的需求]
```

## 待优化功能清单

### 高优先级
- [ ] 导出/导入学习数据
- [ ] 优化移动端体验
- [ ] 添加深色模式
- [ ] 单词本分类管理

### 中优先级
- [ ] 支持更多语言（目前仅英→中）
- [ ] 短语和句子学习
- [ ] 学习数据可视化图表
- [ ] 每日学习目标设置

### 低优先级
- [ ] 云端同步
- [ ] 浏览器扩展
- [ ] 移动端 App
- [ ] 社交学习功能

## 已知问题

### 无（当前版本运行正常）

如有新问题，在此记录：
-

## 最近更新日志

### 2025-11-20
- ✅ 创建项目基础结构
- ✅ 实现 5 大核心功能
- ✅ 添加多提供商支持（7个大模型）
- ✅ 完成设置页面UI优化
- ✅ 改进 JSON 解析（处理 markdown 包裹）

## 技术债务

### 无（新项目）

需要重构的代码：
-

## 依赖包
```json
{
  "lucide-react": "图标库",
  "next": "16.0.3",
  "react": "^19",
  "tailwindcss": "样式"
}
```

## 环境要求
- Node.js 18+
- npm
- 现代浏览器（支持 Web Speech API）

---

**更新说明**：每次开发后更新此文件，记录新功能、问题和待办事项
