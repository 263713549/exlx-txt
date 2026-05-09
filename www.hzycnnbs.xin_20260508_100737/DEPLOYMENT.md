# 个人网站部署指南

## 环境准备

### 服务器要求
- Node.js 14.x 或更高版本
- MySQL 5.7 或更高版本
- Git（用于代码部署）
- Nginx（可选，用于反向代理）

### 步骤1：克隆项目

```bash
# 克隆项目到服务器
git clone <项目仓库地址> /path/to/project
cd /path/to/project
```

### 步骤2：安装依赖

```bash
# 安装项目依赖
npm install
```

### 步骤3：配置环境变量

复制 `.env` 文件并修改相应配置：

```bash
cp .env .env.production
```

编辑 `.env.production` 文件，设置数据库连接信息：

```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=personal_website
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# 服务器配置
PORT=3000

# JWT配置
JWT_SECRET=your-secret-key

# 环境
NODE_ENV=production
```

### 步骤4：初始化数据库

```bash
# 执行数据库初始化脚本
node backend/scripts/init-db.js
```

这将创建所有必要的数据库表结构，并创建一个默认管理员用户：
- 用户名：admin
- 密码：admin123

### 步骤5：构建前端

```bash
# 构建前端代码
npm run build
```

### 步骤6：启动服务

#### 方法1：直接启动（开发环境）

```bash
# 启动开发服务器
npm run dev
```

#### 方法2：使用PM2（生产环境）

```bash
# 安装PM2
npm install -g pm2

# 启动服务
npm start

# 或使用PM2直接启动
pm2 start backend/server.js
```

### 步骤7：配置Nginx（可选）

如果使用Nginx作为反向代理，可以添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 步骤8：访问网站

部署完成后，可以通过以下地址访问：
- 网站首页：http://www.hzycnnbs.xin
- 管理后台：http://www.hzycnnbs.xin/apps/admin/views/admin.html
- 登录页面：http://www.hzycnnbs.xin/apps/home/views/login.html

## 项目结构

```
├── backend/            # 后端代码
│   ├── config/         # 配置文件
│   ├── models/         # 数据库模型
│   ├── routes/         # API路由
│   ├── scripts/        # 脚本文件
│   ├── public/         # 静态文件
│   └── server.js       # 服务器入口
├── apps/               # 前端页面
│   ├── admin/          # 管理后台
│   └── home/           # 前端页面
├── static/             # 静态资源
│   ├── css/            # 样式文件
│   ├── images/         # 图片文件
│   └── js/             # JavaScript文件
├── dist/               # 构建输出
├── .env                # 环境变量
├── package.json        # 项目配置
└── DEPLOYMENT.md       # 部署指南
```

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 内容管理接口
- `GET /api/content/:page` - 获取页面内容
- `PUT /api/content/:page` - 更新页面内容（需要管理员权限）
- `GET /api/content` - 获取所有页面内容（需要管理员权限）

### 图片管理接口
- `POST /api/images/upload` - 上传图片（需要管理员权限）
- `GET /api/images` - 获取图片列表（需要管理员权限）
- `DELETE /api/images/:id` - 删除图片（需要管理员权限）

### 统计接口
- `POST /api/stats/record` - 记录访问（无需权限）
- `GET /api/stats/visits` - 获取访问统计（需要管理员权限）
- `GET /api/stats/logs` - 获取操作日志（需要管理员权限）

## 注意事项

1. **安全性**：
   - 生产环境中请修改默认管理员密码
   - 确保JWT_SECRET设置为强密钥
   - 考虑使用HTTPS

2. **性能优化**：
   - 生产环境中可以使用缓存
   - 考虑使用CDN加速静态资源

3. **备份**：
   - 定期备份数据库
   - 定期备份图片文件

4. **监控**：
   - 考虑添加服务器监控
   - 配置错误日志

## 故障排查

### 常见问题

1. **数据库连接失败**：
   - 检查数据库服务是否运行
   - 检查数据库连接配置是否正确
   - 检查数据库用户权限

2. **服务启动失败**：
   - 检查端口是否被占用
   - 检查环境变量配置
   - 查看错误日志

3. **图片上传失败**：
   - 检查上传目录权限
   - 检查文件大小限制
   - 检查文件类型限制

4. **API请求失败**：
   - 检查认证令牌是否有效
   - 检查用户权限
   - 查看服务器错误日志

### 日志查看

```bash
# 查看PM2日志
pm2 logs

# 查看服务错误日志
cat /path/to/project/error.log
```

## 更新项目

```bash
# 拉取最新代码
git pull

# 安装新依赖
npm install

# 构建前端
npm run build

# 重启服务
pm2 restart
```

---

部署完成后，您的个人网站就可以正常运行了。如果遇到任何问题，请参考故障排查部分或联系技术支持。