require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'frijolai_user',
    password: process.env.DB_PASSWORD || 'frijolai_password',
    database: process.env.DB_NAME || 'frijolai_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_TEST_USER || 'frijolai_test',
    password: process.env.DB_TEST_PASSWORD || 'test_password',
    database: process.env.DB_TEST_NAME || 'frijolai_test_db',
    host: process.env.DB_TEST_HOST || 'localhost',
    port: process.env.DB_TEST_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};