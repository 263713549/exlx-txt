import { DataTypes } from 'sequelize';
import sequelize from '../config/database.mjs';

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  page: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  referer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'visits'
});

export default Visit;
