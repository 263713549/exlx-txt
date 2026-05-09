const sequelize = require('../config/database');

// 导入模型
const User = require('./User');
const Content = require('./Content');
const Image = require('./Image');
const Visit = require('./Visit');
const Log = require('./Log');

// 定义模型关系
// User 与 Log 是一对多关系
User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });

// 导出所有模型
module.exports = {
  sequelize,
  User,
  Content,
  Image,
  Visit,
  Log
};