const express = require('express');
const router = express.Router();
const { AnalyticsVisit, AnalyticsStat } = require('../models/Analytics');
const sequelize = require('../config/database');

// 记录访问
router.post('/', async (req, res) => {
  try {
    const { sessionId, page, referrer, userAgent, screen, language } = req.body;
    const ip = req.ip;
    
    const visit = await AnalyticsVisit.create({
      sessionId,
      page,
      timestamp: new Date(),
      referrer,
      userAgent,
      screen,
      language,
      ip
    });
    
    // 更新统计数据
    await updateStats(new Date());
    
    res.status(201).json({ success: true, visit });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const totalVisits = await AnalyticsVisit.count();
    const uniqueVisitors = await AnalyticsVisit.count({
      distinct: true,
      col: 'sessionId'
    });
    
    // 获取页面访问量
    const pageViews = await AnalyticsVisit.findAll({
      attributes: ['page', [sequelize.fn('COUNT', sequelize.col('page')), 'count']],
      group: ['page']
    });
    
    // 获取最近7天数据
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const stat = await AnalyticsStat.findOne({
        where: { date: dateStr }
      });
      
      last7Days.push({
        date: dateStr,
        visits: stat?.totalVisits || 0
      });
    }
    
    // 计算增长率
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const todayStat = await AnalyticsStat.findOne({ where: { date: todayStr } });
    const yesterdayStat = await AnalyticsStat.findOne({ where: { date: yesterdayStr } });
    
    let growthRate = 0;
    if (yesterdayStat && yesterdayStat.totalVisits > 0) {
      const todayVisits = todayStat?.totalVisits || 0;
      growthRate = ((todayVisits - yesterdayStat.totalVisits) / yesterdayStat.totalVisits * 100).toFixed(1);
    }
    
    res.json({
      totalVisits,
      uniqueVisitors,
      pageViews: Object.fromEntries(pageViews.map(pv => [pv.page, parseInt(pv.count)])),
      last7Days,
      growthRate,
      weeklyVisits: last7Days.reduce((sum, day) => sum + day.visits, 0)
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 获取访问记录
router.get('/visits', async (req, res) => {
  try {
    const visits = await AnalyticsVisit.findAll({
      order: [['timestamp', 'DESC']],
      limit: 100
    });
    
    res.json({ visits });
  } catch (error) {
    console.error('Error getting visits:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 清空数据
router.delete('/', async (req, res) => {
  try {
    await AnalyticsVisit.destroy({ where: {} });
    await AnalyticsStat.destroy({ where: {} });
    res.json({ success: true, message: 'Data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 更新统计数据
async function updateStats(date) {
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    const totalVisits = await AnalyticsVisit.count({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('timestamp')),
        dateStr
      )
    });
    
    const uniqueVisitors = await AnalyticsVisit.count({
      distinct: true,
      col: 'sessionId',
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('timestamp')),
        dateStr
      )
    });
    
    // 获取页面访问量
    const pageViews = await AnalyticsVisit.findAll({
      attributes: ['page', [sequelize.fn('COUNT', sequelize.col('page')), 'count']],
      group: ['page'],
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('timestamp')),
        dateStr
      )
    });
    
    const pageViewsObj = Object.fromEntries(pageViews.map(pv => [pv.page, parseInt(pv.count)]));
    
    // 查找或创建统计记录
    const [stat, created] = await AnalyticsStat.findOrCreate({
      where: { date: dateStr },
      defaults: {
        totalVisits,
        uniqueVisitors,
        pageViews: pageViewsObj
      }
    });
    
    if (!created) {
      await stat.update({
        totalVisits,
        uniqueVisitors,
        pageViews: pageViewsObj
      });
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

module.exports = router;