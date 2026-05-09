import { Sequelize } from 'sequelize';


// 数据库连接配置
const sequelize = new Sequelize(
  'www.hzycnnbs.xin',  // 数据库名
  'www.hzycnnbs.xin',  // 用户名
  '@Hzy2002325',       // 密码
  {
   host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch((error) => {
    console.error('数据库连接失败:', error);
  });

// 导出数据库实例
export default sequelize;
