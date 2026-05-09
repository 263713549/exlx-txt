import express from 'express';
import crypto from 'crypto';
import { User } from '../models/index.mjs';

const router = express.Router();

// 简单的令牌生成函数
function generateToken(user) {
  const payload = { userId: user.id, username: user.username, role: user.role, timestamp: Date.now() };
  const token = crypto.createHash('md5').update(JSON.stringify(payload) + 'your-secret-key').digest('hex');
  return token;
}

// 简单的令牌验证函数
function verifyToken(token) {
  // 这里简化处理，实际项目中应该存储和验证令牌
  return token !== null && token.length === 32;
}

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成简单的令牌
    const token = generateToken(user);
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 创建新用户
    const user = await User.create({ username, password });
    
    // 生成简单的令牌
    const token = generateToken(user);
    
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 验证Token的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  // 简单的令牌验证
  if (!verifyToken(token)) {
    return res.status(403).json({ error: '认证令牌无效' });
  }
  
  // 从令牌中提取用户信息（简化处理）
  req.user = { userId: 1, username: 'admin', role: 'admin' };
  next();
};

// 验证管理员权限的中间件
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '没有管理员权限' });
  }
  next();
};

// 导出路由和中间件
export {
  router,
  authenticateToken,
  authorizeAdmin
};
