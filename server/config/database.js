const { Sequelize } = require('sequelize');
require('dotenv').config();

// Prefer single DATABASE_URL if provided; fallback to discrete vars
const hasDatabaseUrl = !!process.env.DATABASE_URL;

const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Optional SSL (for managed Postgres providers). Enable by setting DB_SSL=true
if (process.env.DB_SSL === 'true') {
  commonOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const sequelize = hasDatabaseUrl
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME || 'janata_report',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432
      }
    );

module.exports = sequelize;
