import { sequelize, User } from '../models/index.mjs';

// 初始化数据库
async function initDatabase() {
  try {
    // 同步数据库模型，创建表结构
    console.log('正在同步数据库模型...');
    await sequelize.sync({ force: true });
    console.log('数据库模型同步完成');
    
    // 创建默认管理员用户
    console.log('正在创建默认管理员用户...');
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    console.log('默认管理员用户创建成功:', adminUser.username);
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行初始化
initDatabase();
