const { Sequelize } = require('sequelize');
const { dbConfig } = require('../app/common/config.js');

const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
  }
);

module.exports = sequelize;