import sequelize from '../config/database.mjs';

// 导入模型
import User from './User.mjs';
import Content from './Content.mjs';
import Image from './Image.mjs';
import Visit from './Visit.mjs';
import Log from './Log.mjs';

// 定义模型关系
// User 与 Log 是一对多关系
User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });

// 导出所有模型
export {
  sequelize,
  User,
  Content,
  Image,
  Visit,
  Log
};
