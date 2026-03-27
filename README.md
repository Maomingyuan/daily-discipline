# 自律打卡系统

一个简洁的个人自律打卡应用，帮助你记录每日自律行为，通过可视化数据激励持续坚持。

## 功能特点

- ✅ 每日打卡记录（完成/未完成）
- 📝 文字记录功能
- 📊 统计数据展示
- 📅 日历视图
- 📜 历史记录列表
- ✏️ 编辑已有记录
- 📆 录入任意日期记录
- ☁️ 云端存储，多设备同步
- 🔐 用户认证系统

## 技术栈

- **前端框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **后端服务**: Supabase (BaaS)
- **数据库**: PostgreSQL
- **部署**: Cloudflare Pages

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Maomingyuan/daily-discipline.git
cd daily-discipline
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的 Supabase 配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 5. 构建生产版本

```bash
npm run build
```

## Supabase 配置

### 创建数据库表

在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- profiles 表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看所有人的公开资料"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的资料"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- checkins 表
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('yes', 'no')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_checkins_user_date ON checkins(user_id, date DESC);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的打卡记录"
  ON checkins FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的打卡记录"
  ON checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的打卡记录"
  ON checkins FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的打卡记录"
  ON checkins FOR DELETE USING (auth.uid() = user_id);

-- user_stats 表
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_days INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  last_checkin_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的统计数据"
  ON user_stats FOR SELECT USING (auth.uid() = user_id);
```

## 部署到 Cloudflare Pages

1. 连接 GitHub 仓库到 Cloudflare Pages
2. 配置构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
3. 添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 部署完成

## 许可证

MIT License
