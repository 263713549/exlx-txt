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
  }
}, {
  tableName: 'analytics_stats',
  timestamps: false
});

module.exports = {
  AnalyticsVisit,
  AnalyticsStat
};