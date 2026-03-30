# Vercel 部署指南

本文档介绍如何将"未来 NEON INTERPRET"项目部署到Vercel。

## 📋 前置要求

- Vercel 账户 ([vercel.com](https://vercel.com))
- Supabase 项目
- Google Gemini API 密钥

## 🚀 部署选项

### 选项1：前端 + Vercel Functions（推荐）

将前端部署到Vercel，并使用Vercel Functions处理后端API。

#### 1. 准备工作

1. **创建 Vercel 项目**               
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel

   # 登录 Vercel
   vercel login
   ```

2. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：

   | 变量名 | 描述 | 获取方式 |
   |--------|------|----------|
   | `SUPABASE_URL` | Supabase 项目 URL | Supabase 控制台 > 项目设置 > API |
   | `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase 控制台 > 项目设置 > API |
   | `GEMINI_API_KEY` | Google Gemini API 密钥 | [Google AI Studio](https://ai.google.dev) |

   **详细配置步骤：**
   1. 在 Vercel 面板中进入项目设置
   2. 点击 "Environment Variables"
   3. 为每个变量添加名称和值
   4. 选择环境（Production, Preview, Development）

   或者使用项目中的 `.env.vercel` 文件作为配置参考。

#### 2. 创建 Vercel Functions

在项目根目录创建 `api` 文件夹，并将后端代码迁移到 Vercel Functions：

```bash
mkdir api
```

创建 `api/auth/signup.ts`：
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

类似地创建其他API端点：
- `api/auth/signin.ts`
- `api/auth/signout.ts`
- `api/user/[id].ts`
- `api/history/index.ts`
- `api/history/[user_id].ts`
- `api/history/[id].ts` (DELETE)

#### 3. 修改前端API调用

更新 `src/lib/api.ts` 中的API_BASE_URL：
```typescript
const API_BASE_URL = '';
```

#### 4. 配置 Vercel

创建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### 5. 部署

```bash
# 部署到 Vercel
vercel

# 或推送到 GitHub 后通过 Vercel 面板导入
```

### 选项2：前端部署，后端独立部署

#### 前端部署到 Vercel

1. **修改前端配置**
   更新 `src/lib/api.ts`：
   ```typescript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```

2. **创建 `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **部署前端**
   ```bash
   vercel
   ```

#### 后端部署选项

选择以下之一部署后端：

**Railway**
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

**Render**
1. 连接 GitHub 仓库
2. 选择 Web Service
3. 设置构建命令：`npm run build:server`
4. 设置启动命令：`npm run server`

**Heroku**
```bash
# 安装 Heroku CLI
# 创建应用
heroku create your-app-name

# 部署
git push heroku main
```

## 🔧 环境变量配置

### 必需的环境变量

项目需要以下环境变量才能正常运行：

#### Supabase 配置
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

**获取 Supabase 配置：**
1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 进入项目控制台 > 设置 > API
3. 复制 "Project URL" 作为 `SUPABASE_URL`
4. 复制 "anon public" 密钥作为 `SUPABASE_ANON_KEY`

#### Google Gemini API 配置
```bash
GEMINI_API_KEY=your-gemini-api-key
```

**获取 Gemini API 密钥：**
1. 访问 [Google AI Studio](https://ai.google.dev)
2. 创建新的 API 密钥
3. 复制密钥值

### 在 Vercel 中配置环境变量

#### 方法1：Vercel 控制台
1. 登录 [vercel.com](https://vercel.com)
2. 选择您的项目
3. 点击 "Settings" > "Environment Variables"
4. 添加每个变量：
   - **Name**: 变量名（如 `SUPABASE_URL`）
   - **Value**: 变量值
   - **Environment**: 选择 `Production`（生产环境）

#### 方法2：Vercel CLI
```bash
# 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add GEMINI_API_KEY
```

#### 方法3：使用 .env.vercel 文件
项目中已包含 `.env.vercel` 文件作为配置参考。

### 环境变量验证

部署后，可以通过以下方式验证配置：

1. **检查 Vercel 函数日志**
2. **测试 API 端点**
3. **检查应用功能是否正常**

### 安全注意事项

- ✅ 永远不要将 `.env` 文件提交到 Git
- ✅ 使用不同的密钥用于开发和生产环境
- ✅ 定期轮换 API 密钥
- ✅ 监控 API 使用情况

### Railway/Render/Heroku
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

## 🗄️ 数据库设置

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目

2. **运行数据库迁移**
   - 在 Supabase SQL 编辑器中运行 `supabase_setup.sql` 的内容

3. **配置认证**
   - 在 Supabase 控制台启用 Email 认证
   - 配置站点 URL（生产域名）

## 🌐 自定义域名（可选）

1. 在 Vercel 面板中添加自定义域名
2. 更新 Supabase 认证配置中的站点 URL
3. 更新前端的 API_BASE_URL（如果后端独立部署）

## 🔍 故障排除

### 常见问题

1. **API 调用失败**
   - 检查环境变量是否正确设置
   - 确认 CORS 配置
   - 检查 Supabase RLS 策略

2. **构建失败**
   - 确认 Node.js 版本兼容性
   - 检查依赖项

3. **认证问题**
   - 确认 Supabase 项目配置
   - 检查重定向 URL

### 调试技巧

- 使用 Vercel 函数日志查看 API 调用
- 检查浏览器开发者工具的网络面板
- 使用 Supabase 控制台查看数据库

## 📊 性能优化

1. **启用 Vercel Analytics**
2. **配置缓存策略**
3. **优化图片和静态资源**
4. **使用 CDN**

## 🔒 安全注意事项

1. **永远不要提交敏感信息到 Git**
2. **使用环境变量存储密钥**
3. **启用 HTTPS**
4. **定期更新依赖项**
5. **监控和日志记录**

---

需要帮助？请查看 [Vercel 文档](https://vercel.com/docs) 或 [Supabase 文档](https://supabase.com/docs)。