import express from 'express';
import { Content, Log } from '../models/index.mjs';
import { authenticateToken, authorizeAdmin } from './auth.mjs';

const router = express.Router();

// 获取页面内容
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const content = await Content.findOne({ where: { page } });
    
    if (!content) {
      return res.status(404).json({ error: '页面内容不存在' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('获取页面内容失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新页面内容（需要管理员权限）
router.put('/:page', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page } = req.params;
    const { title, content } = req.body;
    
    // 查找或创建页面内容
    let pageContent = await Content.findOne({ where: { page } });
    
    if (pageContent) {
      // 更新现有内容
      await pageContent.update({ title, content });
    } else {
      // 创建新内容
      pageContent = await Content.create({ page, title, content });
    }
    
    // 记录操作日志
    await Log.create({
      userId: req.user.userId,
      action: '更新页面内容',
      details: `更新了 ${page} 页面的内容`,
      ip: req.ip
    });
    
    res.json(pageContent);
  } catch (error) {
    console.error('更新页面内容失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取所有页面内容列表（需要管理员权限）
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const contents = await Content.findAll();
    res.json(contents);
  } catch (error) {
    console.error('获取页面内容列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
