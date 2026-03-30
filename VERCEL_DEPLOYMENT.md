# Vercel 部署检查清单

## ✅ 已修复的问题

### 1. API 路径问题
- **问题**：前端硬编码为 `http://localhost:5000/api`，在 Vercel 上无法工作
- **解决**：修改 `src/lib/api.ts`，根据环境动态选择路径
  ```typescript
  const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';
  ```

### 2. 环境变量处理
- **问题**：API 函数使用非空断言 `!`，环境变量缺失时会崩溃
- **解决**：添加错误检查和日志
  ```typescript
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
  }
  ```

### 3. Vercel 配置
- **问题**：版本不兼容、路由配置不完整
- **解决**：
  - 使用 `version: 2`（支持的最新版本）
  - 添加 `buildCommand` 和 `outputDirectory`
  - 完整的静态资源路由

### 4. CORS 支持
- **问题**：API 缺少 CORS 头处理
- **解决**：添加 CORS 预检和响应头

### 5. 配置文件
- **新增**：`.vercelignore` - 排除不需要的文件
- **更新**：`package.json` - 添加 `engines` 字段

## 📋 Vercel 部署步骤

### 1. 环境变量配置（必做）
在 Vercel 控制台项目设置中添加：
- `SUPABASE_URL`: 你的 Supabase URL
- `SUPABASE_ANON_KEY`: 你的 Supabase 匿名密钥
- `GEMINI_API_KEY`: 你的 Gemini API 密钥

### 2. 部署方式（任选一种）

#### 方式 A：自动部署（推荐）
GitHub 已连接，任何推送到 main 分支都会自动触发部署。

#### 方式 B：手动部署
```bash
npx vercel --prod
```

### 3. 验证部署
- 访问你的 Vercel 应用 URL
- 检查前端是否正常加载
- 测试登录功能（会调用 `/api/user`）
- 测试翻译历史功能（会调用 `/api/history`）

## 📁 项目结构
```
.
├── src/                    # 前端 React 应用
│   ├── lib/
│   │   ├── api.ts         # ✅ 修复：动态 API 路径
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── api/
│   └── index.ts           # ✅ 修复：CORS、错误处理
├── vercel.json            # ✅ 修复：正确的配置
├── .vercelignore          # ✅ 新增：排除文件
├── package.json           # ✅ 修复：engines 字段
└── dist/                  # 构建输出（自动生成）
```

## 🔍 常见问题排查

### 问题：构建失败
- 检查 Node.js 版本要求：`engines: { "node": "18.x || 20.x" }`
- 查看 Vercel 构建日志获取详细错误

### 问题：API 返回 404
- 确保环境变量已设置
- 检查 Supabase 表是否创建（运行 `supabase_setup.sql`）
- 验证 CORS 头是否正确返回

### 问题：前端 API 调用失败
- 打开浏览器开发者工具检查 Network 标签
- 确保 API 路径正确（应该是相对路径 `/api/...`）
- 检查 CORS 错误

## 📊 测试清单
- [ ] 前端页面加载正常
- [ ] 可以访问 `/api/health` 或其他 API 端点
- [ ] 用户认证流程可以工作
- [ ] 翻译历史保存和检索正常
- [ ] 没有控制台错误消息

## 🚀 下一步
部署成功后，可以考虑：
1. 设置 GitHub Actions 进行 CI/CD
2. 添加 Sentry 进行错误监控
3. 配置 CDN 加速
4. 添加域名映射