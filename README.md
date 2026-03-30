# 未来 NEON INTERPRET

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 功能特性

- 🎤 实时语音转录和翻译
- 🤖 集成Google Gemini Live API
- 🔐 用户认证系统
- 💾 Supabase数据库存储
- 🎨 霓虹风格UI设计
- 🌐 多语言支持

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **AI**: Google Gemini Live API

## 快速开始

### 环境要求
- Node.js (推荐 v18+)
- Git

### 本地运行

1. **克隆项目**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   - 复制环境变量模板：
     ```bash
     cp .env.local.example .env.local
     ```
   - 编辑 `.env.local` 并填入以下信息：
     - `SUPABASE_URL`: 您的Supabase项目URL
     - `SUPABASE_ANON_KEY`: Supabase匿名密钥
     - `GEMINI_API_KEY`: Google Gemini API密钥

4. **数据库设置**
   - 在Supabase控制台创建新项目
   - 运行 `supabase_setup.sql` 中的SQL语句创建表和策略

5. **运行应用**
   ```bash
   # 启动后端服务器
   npm run server
   
   # 新终端启动前端
   npm run dev
   ```

6. **访问应用**
   - 前端: http://localhost:3000
   - 后端: http://localhost:5000

## 项目结构

```
├── src/                    # 前端源码
│   ├── lib/
│   │   ├── api.ts         # API调用函数
│   │   └── utils.ts       # 工具函数
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── server/                # 后端源码
│   └── server.ts          # Express服务器
├── supabase_setup.sql     # 数据库初始化SQL
├── package.json           # 项目配置
└── README.md             # 项目说明
```

## 部署到 Vercel

### 自动部署（推荐）
项目已配置为自动部署到 Vercel。当你推送代码到 GitHub 的 `main` 分支时，Vercel 会自动重新部署。

### 环境变量配置
由于 CLI 工具可能遇到字符编码问题，请在 Vercel 控制台手动设置环境变量：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

```
SUPABASE_URL=https://wtlsbhnitpqueemdluob.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
GEMINI_API_KEY=AIzaSyDUIw86sQ2V9d9sMxC8Nvbv05Q9OvYUVfk
```

### 手动部署（可选）
如果需要手动部署：

```bash
npx vercel --prod
```

### 故障排除
如果遇到 CLI 字符编码问题，请使用浏览器直接在 Vercel 控制台操作。

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

Apache-2.0 License
