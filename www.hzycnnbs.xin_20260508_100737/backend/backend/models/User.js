const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users'
});

// 密码加密钩子
User.beforeCreate(async (user) => {
  // 使用简单的加密方法，避免依赖问题
  const hash = crypto.createHash('md5').update(user.password + 'your-secret-key').digest('hex');
  user.password = hash;
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const hash = crypto.createHash('md5').update(user.password + 'your-secret-key').digest('hex');
    user.password = hash;
  }
});

// 验证密码方法
User.prototype.validatePassword = async function(password) {
  const hash = crypto.createHash('md5').update(password + 'your-secret-key').digest('hex');
  return hash === this.password;
};

module.exports = User;