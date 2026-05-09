const express = require('express');
const router = express.Router();
const { Visit, Log } = require('../models');
const { Sequelize, Op } = require('sequelize');
const { authenticateToken, authorizeAdmin } = require('./auth');

// 记录访问（无需权限）
router.post('/record', async (req, res) => {
  try {
    const { page } = req.body;
    
    if (!page) {
      return res.status(400).json({ error: '请提供页面信息' });
    }
    
    // 记录访问
    await Visit.create({
      page: page,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || ''
    });
    
    res.json({ message: '访问记录成功' });
  } catch (error) {
    console.error('记录访问失败:', error);
    // 访问记录失败不影响用户体验，返回成功
    res.json({ message: '访问记录成功' });
  }
});

// 获取访问统计（需要管理员权限）
router.get('/visits', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // 获取总访问量
    const totalVisits = await Visit.count();
    
    // 获取最近7天的访问量
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentVisits = await Visit.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });
    
    // 获取页面访问分布
    const pageDistribution = await Visit.findAll({
      attributes: [
        'page',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['page'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
    });
    
    res.json({
      totalVisits,
      recentVisits,
      pageDistribution
    });
  } catch (error) {
    console.error('获取访问统计失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取操作日志（需要管理员权限）
router.get('/logs', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const logs = await Log.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    
    res.json(logs);
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;