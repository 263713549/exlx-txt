// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false// routes/analytics.js
const express = require('express');
const router = express.Router();
const { AnalyticsVisit, AnalyticsStat } = require('../models/Analytics');

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
    console.error(error);
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
    
    res.json({
      totalVisits,
      uniqueVisitors,
      pageViews: Object.fromEntries(pageViews.map(pv => [pv.page, parseInt(pv.count)])),
      last7Days
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 更新统计数据
async function updateStats(date) {
  const dateStr = date.toISOString().split('T')[0];
  
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
}

module.exports = router;
  }
);
// models/Analytics.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyticsVisit = sequelize.define('AnalyticsVisit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  page: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  referrer: {
    type: DataTypes.STRING(255)
  },
  userAgent: {
    type: DataTypes.TEXT
  },
  screen: {
    type: DataTypes.STRING(20)
  },
  language: {
    type: DataTypes.STRING(10)
  },
  ip: {
    type: DataTypes.STRING(45)
  },
  country: {
    type: DataTypes.STRING(100)
  },
  city: {
    type: DataTypes.STRING(100)
  },
  device: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'analytics_visits',
  timestamps: false
});

const AnalyticsStat = sequelize.define('AnalyticsStat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  totalVisits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  uniqueVisitors: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pageViews: {
    type: DataTypes.JSON
  },
  countries: {
    type: DataTypes.JSON
  },
  browsers: {
    type: DataTypes.JSON
  },
  devices: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'analytics_stats',
  timestamps: false
});

module.exports = {
  AnalyticsVisit,
  AnalyticsStat
};// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
module.exports = sequelize;