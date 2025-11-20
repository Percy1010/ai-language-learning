# Vercel 部署指南（推荐）

## 为什么改用 Vercel？

Cloudflare Pages 部署出现 404 错误，原因：
- 项目使用 Next.js 16.0.3
- Cloudflare Pages 适配器只支持 Next.js ≤15.5.2
- API 路由在 Cloudflare Pages 上需要特殊处理

**Vercel 优势：**
- ✅ Next.js 官方平台，零配置
- ✅ 完全免费（个人项目）
- ✅ 原生支持 Next.js 16 和所有功能
- ✅ 全球 CDN + 自动 HTTPS
- ✅ 每次推送自动部署

## 当前进度

✅ 步骤 1: Git 仓库已初始化
✅ 步骤 2: .gitignore 已创建
✅ 步骤 3: 代码已提交到本地 Git
✅ 步骤 4: 已推送到 GitHub
🔄 步骤 5: 部署到 Vercel（当前步骤）

---

## 步骤 5: 部署到 Vercel

### 方法一：通过 Vercel 网站部署（推荐，最简单）

#### 1. 访问 Vercel 并登录
访问：https://vercel.com

点击 **Sign Up** 或 **Log In**，选择 **Continue with GitHub** 登录

#### 2. 导入 GitHub 仓库

登录后，点击 **Add New...** → **Project**

你会看到你的 GitHub 仓库列表，找到 `ai-language-learning`

点击 **Import**

#### 3. 配置项目（保持默认即可）

Vercel 会自动检测到 Next.js 项目，配置如下：

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build (自动填充)
Output Directory: .next (自动填充)
Install Command: npm install (自动填充)
```

**无需修改任何配置**，Vercel 会自动识别一切！

#### 4. 部署

点击 **Deploy** 按钮

等待 1-2 分钟，Vercel 会：
- 安装依赖
- 构建项目
- 部署到全球 CDN

#### 5. 获取域名

部署成功后，你会得到：
- **生产环境域名**：`https://ai-language-learning.vercel.app`
- **预览域名**：每次推送都会生成临时预览链接

你也可以绑定自定义域名（免费）

---

### 方法二：通过 Vercel CLI 部署（可选）

如果你想用命令行部署：

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署
```bash
cd /Users/Percy/coding/ai-language-learning
vercel
```

按提示操作：
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- What's your project's name? **ai-language-learning** (或回车使用默认)
- In which directory is your code located? **./** (回车)

#### 4. 生产部署
```bash
vercel --prod
```

---

## 预期结果

部署成功后你会得到：
- **永久访问地址**: `https://ai-language-learning.vercel.app`（或你的自定义域名）
- **自动 HTTPS** 和 SSL 证书
- **全球 CDN 加速**
- **每次 Git 推送自动重新部署**
- **预览部署**：每个分支/PR 都有独立预览链接
- **实时日志**：可在 Vercel 控制台查看运行日志

---

## 部署后检查

部署成功后，请访问你的网站并测试：

1. **主页加载** - 确认页面正常显示
2. **设置页面** - 访问 `/settings` 配置 API
3. **生成单词** - 输入单词测试 AI 生成功能
4. **语音朗读** - 点击喇叭图标测试
5. **数据持久化** - 刷新页面检查数据是否保存

---

## 故障排除

### 如果构建失败：

1. **检查构建日志**
   在 Vercel 控制台的 **Deployments** 页面查看详细错误

2. **常见问题**：
   - **依赖安装失败**：检查 `package.json` 和 `package-lock.json`
   - **构建超时**：Vercel 免费版有 45 秒构建时间限制（通常足够）
   - **环境变量**：如果使用了环境变量，需要在 Vercel 项目设置中添加

3. **重新部署**
   - 方法 1：推送新代码到 GitHub 自动触发
   - 方法 2：在 Vercel 控制台点击 **Redeploy**

### 如果 API 调用失败：

1. **检查 CORS 设置**
   - Vercel 默认支持 API 路由，无需额外配置

2. **检查 API Key**
   - 确保在设置页面正确配置了 API Key
   - API Key 存储在浏览器 localStorage，不会上传到服务器

3. **检查网络请求**
   - 打开浏览器开发者工具 (F12)
   - 查看 **Network** 标签页
   - 检查 `/api/generate-word` 请求是否成功

---

## 下次更新代码

### 方法 1: 自动部署（推荐）
```bash
# 1. 修改代码后
git add .
git commit -m "描述你的更改"
git push

# 2. Vercel 会自动检测并重新部署（无需任何操作！）
```

### 方法 2: 手动触发
1. 访问 https://vercel.com/dashboard
2. 进入你的项目
3. 点击 **Redeploy** 按钮

---

## Vercel 独有功能

### 1. 预览部署 (Preview Deployments)
- 每个 Git 分支都会自动生成独立的预览链接
- 适合测试新功能，不影响生产环境
- 示例：`https://ai-language-learning-git-feature-username.vercel.app`

### 2. 环境变量管理
如果你需要添加环境变量：
1. 访问项目 → **Settings** → **Environment Variables**
2. 添加变量（可分别设置 Production / Preview / Development）
3. 重新部署生效

### 3. 域名管理
绑定自定义域名（免费）：
1. 访问项目 → **Settings** → **Domains**
2. 输入你的域名（如 `learn.example.com`）
3. 按照提示在你的域名注册商添加 DNS 记录

### 4. 分析和监控
- **Analytics**：访问统计（需升级到 Pro）
- **Logs**：实时查看服务器日志
- **Speed Insights**：性能分析

---

## 有用的链接

- **Vercel 控制台**: https://vercel.com/dashboard
- **Vercel 文档**: https://vercel.com/docs
- **Next.js 部署指南**: https://nextjs.org/docs/deployment
- **你的 GitHub 仓库**: https://github.com/Percy1010/ai-language-learning

---

## 关于 Cloudflare Pages

如果你想继续使用 Cloudflare Pages，需要：
1. 降级 Next.js 到 15.5.2 版本
2. 安装 `@cloudflare/next-on-pages` 适配器
3. 修改构建配置

**不推荐**，因为：
- 需要额外配置
- 可能失去 Next.js 16 的新功能
- API 路由支持有限

Vercel 是更简单、更可靠的选择。

---

**最后更新**: 2025-11-20

## 快速总结

✅ **代码已推送到 GitHub**: https://github.com/Percy1010/ai-language-learning
🔄 **下一步**: 访问 https://vercel.com 用 GitHub 登录，导入仓库，点击部署
⏱️ **预计时间**: 2-3 分钟
🌍 **最终结果**: 你的应用将在 `https://ai-language-learning.vercel.app` 上线
